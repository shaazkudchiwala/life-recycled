import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPrelight } from "../_shared/cors.ts";

/**
 * verify-otp Edge Function
 *
 * Architecture:
 * - OTP send/retry/verify are handled CLIENT-SIDE via MSG91 Web SDK
 * - This function ONLY handles:
 *   1. verifyAccessToken — server-side validation of the access token
 *   2. Intent validation — verify intent_token is valid, unclaimed, within 48h
 *   3. Deduplication — hash mobile, check/insert unique_individuals
 *   4. Intent binding — bind mobile_hash to intent, mark claimed
 *   5. Session update — mark session as "verified"
 */

const MSG91_VERIFY_TOKEN_URL =
  "https://control.msg91.com/api/v5/widget/verifyAccessToken";

// 48 hours in milliseconds
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

// ─── Utilities ────────────────────────────────────────────────────────────────

async function createHash(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isValidIntentToken(token: string): boolean {
  return typeof token === "string" && /^[0-9a-f]{64}$/.test(token);
}

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} not configured`);
  return value;
}

function getSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  corsHeaders: Record<string, string>
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ─── Main handler ─────────────────────────────────────────────────────────────

async function handleVerifyToken(
  body: Record<string, unknown>,
  corsHeaders: Record<string, string>
) {
  const { access_token, mobile, intent_token } = body;

  // ── Validate inputs ──
  if (!access_token || typeof access_token !== "string") {
    return jsonResponse(
      { success: false, error: "Access token required" },
      400,
      corsHeaders
    );
  }
  if (!mobile || typeof mobile !== "string") {
    return jsonResponse(
      { success: false, error: "Mobile number required" },
      400,
      corsHeaders
    );
  }
  if (!intent_token || typeof intent_token !== "string" || !isValidIntentToken(intent_token as string)) {
    return jsonResponse(
      { success: false, error: "INTENT_REQUIRED" },
      400,
      corsHeaders
    );
  }

  const supabase = getSupabaseClient();

  // ── Step 1: Validate intent ──
  const { data: intent, error: intentError } = await supabase
    .from("intents")
    .select("intent_id, session_id, source_id, intent_created_at, claimed, mobile_hash")
    .eq("intent_token", intent_token as string)
    .maybeSingle();

  if (intentError || !intent) {
    console.error("Intent lookup error:", intentError);
    return jsonResponse(
      { success: false, error: "INTENT_NOT_FOUND" },
      400,
      corsHeaders
    );
  }

  if (intent.claimed) {
    return jsonResponse(
      { success: false, error: "INTENT_ALREADY_CLAIMED" },
      400,
      corsHeaders
    );
  }

  const intentAge = Date.now() - new Date(intent.intent_created_at).getTime();
  if (intentAge > FORTY_EIGHT_HOURS_MS) {
    return jsonResponse(
      { success: false, error: "INTENT_EXPIRED" },
      400,
      corsHeaders
    );
  }

  // Use session_id from the intent record (not from client)
  const sessionId = intent.session_id;

  // ── Step 2: Verify the access token server-side using MSG91 Auth Key ──
  const authKey = getRequiredEnv("MSG91_AUTH_KEY");

  console.log("Verifying access token with MSG91…");
  const response = await fetch(MSG91_VERIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      authkey: authKey,
      "access-token": access_token,
    }),
  });

  const responseText = await response.text();
  let tokenResult: Record<string, unknown>;
  try {
    tokenResult = JSON.parse(responseText);
  } catch {
    tokenResult = { raw: responseText };
  }

  console.log(
    "verifyAccessToken result:",
    response.status,
    JSON.stringify(tokenResult)
  );

  if (!response.ok || tokenResult?.type === "error") {
    return jsonResponse(
      {
        success: false,
        error:
          (tokenResult?.message as string) ||
          "Access token verification failed",
      },
      400,
      corsHeaders
    );
  }

  // ── Step 3: Hash mobile and record unique individual ──
  console.log("Recording verification…");
  const secretSalt = getRequiredEnv("OTP_HASH_SALT");
  const cleanMobile = (mobile as string)
    .replace(/^\+?91/, "")
    .replace(/\D/g, "");
  const mobileHash = await createHash(cleanMobile + secretSalt);

  const { data: existingHash } = await supabase
    .from("unique_individuals")
    .select("id")
    .eq("mobile_hash", mobileHash)
    .maybeSingle();

  let isNewUnique = false;
  if (!existingHash) {
    const { error: insertError } = await supabase
      .from("unique_individuals")
      .insert({
        mobile_hash: mobileHash,
        session_id: sessionId,
      });

    if (!insertError) {
      isNewUnique = true;
      console.log("New unique individual recorded");
    } else {
      console.error("Insert error:", insertError);
    }
  } else {
    console.log("Returning user verified");
  }

  // ── Step 4: Bind intent → mobile_hash and mark as claimed ──
  const { error: claimError } = await supabase
    .from("intents")
    .update({
      mobile_hash: mobileHash,
      claimed: true,
      claimed_at: new Date().toISOString(),
    })
    .eq("intent_token", intent_token as string)
    .eq("claimed", false); // Extra safety: only claim if still unclaimed

  if (claimError) {
    console.error("Intent claim error:", claimError);
    // Continue — verification itself succeeded
  }

  // ── Step 5: Update session state ──
  const { error: updateError } = await supabase
    .from("sessions")
    .update({ state: "verified", updated_at: new Date().toISOString() })
    .eq("session_id", sessionId);

  if (updateError) {
    console.error("Session update error:", updateError);
  }

  // Mobile number is now discarded — only hash was stored
  return jsonResponse(
    {
      success: true,
      message: "Verification successful",
      is_new_unique: isNewUnique,
    },
    200,
    corsHeaders
  );
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  const preflightResponse = handleCorsPrelight(req);
  if (preflightResponse) return preflightResponse;

  if (req.method !== "POST") {
    return jsonResponse(
      { success: false, error: "Method not allowed" },
      405,
      corsHeaders
    );
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "verify_token") {
      return await handleVerifyToken(body, corsHeaders);
    }

    return jsonResponse(
      { success: false, error: "Invalid action. Use 'verify_token'." },
      400,
      corsHeaders
    );
  } catch (error) {
    console.error("Error in verify-otp:", error);
    return jsonResponse(
      { success: false, error: "Internal server error" },
      500,
      corsHeaders
    );
  }
});
