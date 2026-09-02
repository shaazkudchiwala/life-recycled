-- Drop existing RESTRICTIVE RLS policies and replace with PERMISSIVE deny-all policies
-- This follows PostgreSQL best practices: PERMISSIVE with explicit false is more reliable than RESTRICTIVE

-- Drop existing policies on otp_verifications
DROP POLICY IF EXISTS "Deny anonymous access to otp_verifications" ON public.otp_verifications;
DROP POLICY IF EXISTS "Deny authenticated access to otp_verifications" ON public.otp_verifications;

-- Create PERMISSIVE deny-all policies for otp_verifications
CREATE POLICY "Deny all anon access to otp_verifications"
ON public.otp_verifications
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny all authenticated access to otp_verifications"
ON public.otp_verifications
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Drop existing policies on sessions
DROP POLICY IF EXISTS "Deny anonymous access to sessions" ON public.sessions;
DROP POLICY IF EXISTS "Deny authenticated access to sessions" ON public.sessions;

-- Create PERMISSIVE deny-all policies for sessions
CREATE POLICY "Deny all anon access to sessions"
ON public.sessions
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny all authenticated access to sessions"
ON public.sessions
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);