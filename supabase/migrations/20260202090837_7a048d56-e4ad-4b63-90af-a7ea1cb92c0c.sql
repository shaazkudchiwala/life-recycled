-- Fix OTP verifications table: Replace RESTRICTIVE with PERMISSIVE deny policies
-- RESTRICTIVE policies require at least one PERMISSIVE policy to exist
-- We need PERMISSIVE policies with USING (false) to properly deny access

-- Drop existing RESTRICTIVE policies
DROP POLICY IF EXISTS "Block anonymous access to otp_verifications" ON public.otp_verifications;
DROP POLICY IF EXISTS "Block authenticated access to otp_verifications" ON public.otp_verifications;

-- Create PERMISSIVE deny policies (these actually block access)
CREATE POLICY "Deny anonymous access to otp_verifications"
ON public.otp_verifications
AS PERMISSIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny authenticated access to otp_verifications"
ON public.otp_verifications
AS PERMISSIVE
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Fix sessions table: Same issue
DROP POLICY IF EXISTS "Block anonymous access to sessions" ON public.sessions;
DROP POLICY IF EXISTS "Block authenticated access to sessions" ON public.sessions;

CREATE POLICY "Deny anonymous access to sessions"
ON public.sessions
AS PERMISSIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny authenticated access to sessions"
ON public.sessions
AS PERMISSIVE
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Also fix redirect_logs and unique_individuals for consistency
DROP POLICY IF EXISTS "Block anonymous access to redirect_logs" ON public.redirect_logs;
DROP POLICY IF EXISTS "Block authenticated access to redirect_logs" ON public.redirect_logs;
DROP POLICY IF EXISTS "Block anonymous access to unique_individuals" ON public.unique_individuals;
DROP POLICY IF EXISTS "Block authenticated access to unique_individuals" ON public.unique_individuals;

CREATE POLICY "Deny anonymous access to redirect_logs"
ON public.redirect_logs
AS PERMISSIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny authenticated access to redirect_logs"
ON public.redirect_logs
AS PERMISSIVE
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny anonymous access to unique_individuals"
ON public.unique_individuals
AS PERMISSIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny authenticated access to unique_individuals"
ON public.unique_individuals
AS PERMISSIVE
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);