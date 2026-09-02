import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPrelight } from "../_shared/cors.ts";

const NOTTO_URL = "https://notto.abdm.gov.in/register";

// Validate session_id format (32-char hex)
const isValidSessionId = (id: string): boolean => {
  return typeof id === "string" && /^[0-9a-f]{32}$/.test(id);
};

// Validate source_id format (alphanumeric + hyphens, reasonable length)
const isValidSourceId = (id: string): boolean => {
  return typeof id === "string" && /^[a-z0-9-]{1,100}$/i.test(id);
};

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  const preflightResponse = handleCorsPrelight(req);
  if (preflightResponse) return preflightResponse;

  // 1. Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 2. Require Content-Type header
  const contentType = req.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return new Response(
      JSON.stringify({ error: "Content-Type must be application/json" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Parse request body
    let body: { session_id?: string; source_id?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { session_id, source_id } = body;

    // 3. Validate input formats
    if (!session_id || !isValidSessionId(session_id)) {
      return new Response(
        JSON.stringify({ error: "Invalid session_id format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!source_id || !isValidSourceId(source_id)) {
      return new Response(
        JSON.stringify({ error: "Invalid source_id format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Validate session exists and is in correct state
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .select("session_id, source_id, state")
      .eq("session_id", session_id)
      .maybeSingle();

    if (sessionError) {
      console.error("Session lookup error:", sessionError);
      return new Response(
        JSON.stringify({ error: "Session validation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Session must exist
    if (!sessionData) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Session state must be "committed"
    if (sessionData.state !== "committed") {
      return new Response(
        JSON.stringify({ error: "Session not in committed state" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // source_id must match
    if (sessionData.source_id !== source_id) {
      return new Response(
        JSON.stringify({ error: "Source mismatch" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Check if redirect already logged (one redirect per session)
    const { data: existingLog } = await supabase
      .from("redirect_logs")
      .select("id")
      .eq("session_id", session_id)
      .maybeSingle();

    if (existingLog) {
      // Already logged - still return URL but don't log again
      return new Response(
        JSON.stringify({ 
          redirect_url: NOTTO_URL,
          logged: false,
          message: "Redirect already recorded"
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // 6. Log the redirect event
    const { error: logError } = await supabase.from("redirect_logs").insert({
      session_id,
      source_id,
      destination: NOTTO_URL,
    });

    if (logError) {
      console.error("Failed to log redirect:", logError);
      // Continue anyway - don't block user from registering
    }

    // Return the redirect URL for client navigation
    return new Response(
      JSON.stringify({ 
        redirect_url: NOTTO_URL,
        logged: !logError 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in notto-redirect:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
