-- Drop existing PERMISSIVE policies and recreate as RESTRICTIVE for proper deny behavior

-- redirect_logs: Drop and recreate as RESTRICTIVE
DROP POLICY IF EXISTS "Deny anonymous access to redirect_logs" ON public.redirect_logs;
DROP POLICY IF EXISTS "Deny authenticated access to redirect_logs" ON public.redirect_logs;

CREATE POLICY "Block anonymous access to redirect_logs"
ON public.redirect_logs
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Block authenticated access to redirect_logs"
ON public.redirect_logs
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- unique_individuals: Drop and recreate as RESTRICTIVE
DROP POLICY IF EXISTS "Deny anonymous access to unique_individuals" ON public.unique_individuals;
DROP POLICY IF EXISTS "Deny authenticated access to unique_individuals" ON public.unique_individuals;

CREATE POLICY "Block anonymous access to unique_individuals"
ON public.unique_individuals
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Block authenticated access to unique_individuals"
ON public.unique_individuals
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- sessions: Drop and recreate as RESTRICTIVE for consistency
DROP POLICY IF EXISTS "Deny anonymous access to sessions" ON public.sessions;
DROP POLICY IF EXISTS "Deny authenticated access to sessions" ON public.sessions;

CREATE POLICY "Block anonymous access to sessions"
ON public.sessions
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Block authenticated access to sessions"
ON public.sessions
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);