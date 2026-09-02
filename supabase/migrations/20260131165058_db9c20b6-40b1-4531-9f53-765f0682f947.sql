-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Allow public to read redirect counts" ON public.redirect_logs;

-- Create a restrictive policy that denies all client-side reads
-- Service role bypasses RLS by design, so edge functions will still work
CREATE POLICY "Deny public read access to redirect_logs"
ON public.redirect_logs
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (false);