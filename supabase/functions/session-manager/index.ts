import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPrelight } from "../_shared/cors.ts";

// Generate a cryptographically secure hex string
function generateHexId(bytes: number): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// 32-char hex session ID
function generateSessionId(): string {
  return generateHexId(16);
}

// 64-char hex intent token (longer for security)
function generateIntentToken(): string {
  return generateHexId(32);
}

// Validate session_id format (32-char hex)
const isValidSessionId = (id: string): boolean => {
  return typeof id === "string" && /^[0-9a-f]{32}$/.test(id);
};

// Validate intent_token format (64-char hex)
const isValidIntentToken = (token: string): boolean => {
  return typeof token === "string" && /^[0-9a-f]{64}$/.test(token);
};

// Validate source_id format (alphanumeric + hyphens, max 64 chars)
const isValidSourceId = (id: string): boolean => {
  return typeof id === "string" && id.length > 0 && id.length <= 64 && /^[a-z0-9-]+$/i.test(id);
};

// Valid state transitions
const validTransitions: Record<string, string[]> = {
  entered: ["committed"],
  committed: ["verified", "expired"],
  verified: [],
  expired: [],
};

// 48 hours in milliseconds
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

type SessionAction = "create" | "commit" | "get" | "create_intent" | "validate_intent";

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

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  const preflightResponse = handleCorsPrelight(req);
  if (preflightResponse) return preflightResponse;

  // Only allow POST requests
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, corsHeaders);
  }

  // Require Content-Type header
  const contentType = req.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return jsonResponse({ error: "Content-Type must be application/json" }, 400, corsHeaders);
  }

  try {
    // Parse request body
    let body: {
      action?: SessionAction;
      session_id?: string;
      source_id?: string;
      intent_token?: string;
    };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400, corsHeaders);
    }

    const { action, session_id, source_id, intent_token } = body;

    // Validate action
    if (
      !action ||
      !["create", "commit", "get", "create_intent", "validate_intent"].includes(action)
    ) {
      return jsonResponse({ error: "Invalid action" }, 400, corsHeaders);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle actions
    switch (action) {
      // ── Create session ──────────────────────────────────────────────
      case "create": {
        if (!source_id || !isValidSourceId(source_id)) {
          return jsonResponse({ error: "Invalid source_id format" }, 400, corsHeaders);
        }

        const serverSessionId = generateSessionId();

        const { error: insertError } = await supabase
          .from("sessions")
          .insert({
            session_id: serverSessionId,
            source_id: source_id,
            state: "entered",
          });

        if (insertError) {
          console.error("Session creation error:", insertError);
          return jsonResponse({ error: "Failed to create session" }, 500, corsHeaders);
        }

        return jsonResponse(
          { success: true, session_id: serverSessionId, state: "entered" },
          201,
          corsHeaders
        );
      }

      // ── Commit session ──────────────────────────────────────────────
      case "commit": {
        if (!session_id || !isValidSessionId(session_id)) {
          return jsonResponse({ error: "Invalid session_id format" }, 400, corsHeaders);
        }

        const { data: session, error: fetchError } = await supabase
          .from("sessions")
          .select("session_id, state, source_id")
          .eq("session_id", session_id)
          .maybeSingle();

        if (fetchError || !session) {
          return jsonResponse({ error: "Session not found" }, 404, corsHeaders);
        }

        if (!validTransitions[session.state]?.includes("committed")) {
          return jsonResponse({ error: "Invalid state transition" }, 400, corsHeaders);
        }

        const { error: updateError } = await supabase
          .from("sessions")
          .update({
            state: "committed",
            precommit_timestamp: new Date().toISOString(),
          })
          .eq("session_id", session_id);

        if (updateError) {
          console.error("Session commit error:", updateError);
          return jsonResponse({ error: "Failed to commit session" }, 500, corsHeaders);
        }

        return jsonResponse(
          { success: true, session_id, state: "committed" },
          200,
          corsHeaders
        );
      }

      // ── Get session ─────────────────────────────────────────────────
      case "get": {
        if (!session_id || !isValidSessionId(session_id)) {
          return jsonResponse({ error: "Invalid session_id format" }, 400, corsHeaders);
        }

        const { data: session, error: fetchError } = await supabase
          .from("sessions")
          .select("session_id, source_id, state, entry_timestamp, precommit_timestamp")
          .eq("session_id", session_id)
          .maybeSingle();

        if (fetchError) {
          console.error("Session fetch error:", fetchError);
          return jsonResponse({ error: "Failed to fetch session" }, 500, corsHeaders);
        }

        if (!session) {
          return jsonResponse({ error: "Session not found" }, 404, corsHeaders);
        }

        return jsonResponse({ success: true, session }, 200, corsHeaders);
      }

      // ── Create intent (called after commit) ─────────────────────────
      case "create_intent": {
        if (!session_id || !isValidSessionId(session_id)) {
          return jsonResponse({ error: "Invalid session_id format" }, 400, corsHeaders);
        }

        // Verify session exists and is committed
        const { data: sess, error: sessError } = await supabase
          .from("sessions")
          .select("session_id, source_id, state")
          .eq("session_id", session_id)
          .maybeSingle();

        if (sessError || !sess) {
          return jsonResponse({ error: "Session not found" }, 404, corsHeaders);
        }

        if (sess.state !== "committed") {
          return jsonResponse(
            { error: "Session must be committed before creating intent" },
            400,
            corsHeaders
          );
        }

        // Generate intent identifiers
        const intentId = generateSessionId(); // 32-char hex
        const intentTokenValue = generateIntentToken(); // 64-char hex

        const { error: insertError } = await supabase.from("intents").insert({
          intent_id: intentId,
          intent_token: intentTokenValue,
          source_id: sess.source_id,
          session_id: session_id,
        });

        if (insertError) {
          console.error("Intent creation error:", insertError);
          return jsonResponse({ error: "Failed to create intent" }, 500, corsHeaders);
        }

        console.log("Intent created:", intentId);

        return jsonResponse(
          {
            success: true,
            intent_token: intentTokenValue,
          },
          201,
          corsHeaders
        );
      }

      // ── Validate intent (called by VerifyPage on mount) ─────────────
      case "validate_intent": {
        if (!intent_token || !isValidIntentToken(intent_token)) {
          return jsonResponse(
            { valid: false, reason: "INTENT_REQUIRED" },
            200,
            corsHeaders
          );
        }

        const { data: intent, error: intentError } = await supabase
          .from("intents")
          .select("intent_id, intent_created_at, claimed, mobile_hash")
          .eq("intent_token", intent_token)
          .maybeSingle();

        if (intentError) {
          console.error("Intent lookup error:", intentError);
          return jsonResponse(
            { valid: false, reason: "INTENT_LOOKUP_FAILED" },
            200,
            corsHeaders
          );
        }

        if (!intent) {
          return jsonResponse(
            { valid: false, reason: "INTENT_NOT_FOUND" },
            200,
            corsHeaders
          );
        }

        // Check if already claimed
        if (intent.claimed) {
          return jsonResponse(
            { valid: false, reason: "ALREADY_CLAIMED" },
            200,
            corsHeaders
          );
        }

        // Check 48-hour window
        const age = Date.now() - new Date(intent.intent_created_at).getTime();
        if (age > FORTY_EIGHT_HOURS_MS) {
          return jsonResponse(
            { valid: false, reason: "INTENT_EXPIRED" },
            200,
            corsHeaders
          );
        }

        return jsonResponse(
          {
            valid: true,
            intent_id: intent.intent_id,
          },
          200,
          corsHeaders
        );
      }

      default:
        return jsonResponse({ error: "Invalid action" }, 400, corsHeaders);
    }
  } catch (error) {
    console.error("Error in session-manager:", error);
    return jsonResponse(
      { error: "Internal server error" },
      500,
      getCorsHeaders(req)
    );
  }
});
