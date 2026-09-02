// Shared CORS utility for all edge functions
// Uses dynamic origin matching for Lovable domains

// Static allowed origins - explicitly allowed domains
const STATIC_ALLOWED_ORIGINS = [
  "https://liferecycled.in",
  "https://www.liferecycled.in",
  "https://master-blueprint-build.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
];

// Dynamic origin patterns - match Lovable-generated domains
const DYNAMIC_ORIGIN_PATTERNS = [
  /^https:\/\/[a-z0-9-]+\.lovable\.app$/,           // *.lovable.app
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/,     // *.lovableproject.com
];

// Standard CORS headers shared across all responses
const CORS_METHODS = "GET, POST, PUT, DELETE, OPTIONS";
const CORS_HEADERS = "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version";
const CORS_MAX_AGE = "86400";

/**
 * Check if an origin is allowed
 */
export function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  
  // Check static origins first
  if (STATIC_ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }
  
  // Check dynamic patterns
  for (const pattern of DYNAMIC_ORIGIN_PATTERNS) {
    if (pattern.test(origin)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get CORS headers for a request.
 * Always returns well-formed headers. If origin is not in the allowlist,
 * falls back to the first static origin to prevent empty Access-Control-Allow-Origin
 * (which some browsers treat differently from a missing header).
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = isAllowedOrigin(origin) ? origin : STATIC_ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": CORS_METHODS,
    "Access-Control-Allow-Headers": CORS_HEADERS,
    "Access-Control-Max-Age": CORS_MAX_AGE,
  };
}

/**
 * Handle CORS preflight (OPTIONS) request.
 * Returns a 204 No Content response with all CORS headers.
 * Must be called at the TOP of every edge function handler.
 */
export function handleCorsPrelight(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers: getCorsHeaders(req),
    });
  }
  return null;
}
