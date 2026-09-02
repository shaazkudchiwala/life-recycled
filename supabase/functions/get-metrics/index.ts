import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPrelight } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  const preflightResponse = handleCorsPrelight(req);
  if (preflightResponse) return preflightResponse;

  // Only allow GET requests
  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Initialize Supabase client with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Live count of unique verified individuals from unique_individuals table
    const { count: verifiedCount, error: verifiedError } = await supabase
      .from("unique_individuals")
      .select("*", { count: "exact", head: true });

    if (verifiedError) {
      console.error("Error fetching verified count:", verifiedError);
      throw verifiedError;
    }

    // Live count of redirect events from redirect_logs table
    const { count: redirectsCount, error: redirectsError } = await supabase
      .from("redirect_logs")
      .select("*", { count: "exact", head: true });

    if (redirectsError) {
      console.error("Error fetching redirects count:", redirectsError);
      throw redirectsError;
    }

    const verified = verifiedCount || 0;
    const redirects = redirectsCount || 0;

    // Return only aggregate counts - never individual data
    return new Response(
      JSON.stringify({
        verifiedUniques: verified,
        totalCommitments: redirects,
        totalRedirects: redirects,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in get-metrics:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch metrics" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
