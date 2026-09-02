-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Allow public to read session counts" ON public.sessions;

-- Add explicit DENY policy for anonymous users (all operations)
CREATE POLICY "Deny anonymous access to sessions"
ON public.sessions
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Add explicit DENY policy for authenticated users (all operations)
CREATE POLICY "Deny authenticated access to sessions"
ON public.sessions
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Allow service role to insert sessions (service_role bypasses RLS, but explicit policy for clarity)
CREATE POLICY "Allow service role to manage sessions"
ON public.sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);