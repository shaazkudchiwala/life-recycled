-- Remove service_role policies (service_role bypasses RLS, so these are unnecessary and trigger linter warnings)
DROP POLICY IF EXISTS "Allow service role to manage sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow service role insert" ON public.redirect_logs;

-- Add explicit DENY policies for redirect_logs (anon and authenticated)
-- Currently only has a SELECT deny, need full protection
CREATE POLICY "Deny anonymous access to redirect_logs"
ON public.redirect_logs
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny authenticated access to redirect_logs"
ON public.redirect_logs
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Drop the old restrictive SELECT-only policy since we now have full DENY policies
DROP POLICY IF EXISTS "Deny public read access to redirect_logs" ON public.redirect_logs;

-- Add explicit DENY policies for unique_individuals (full protection)
CREATE POLICY "Deny anonymous access to unique_individuals"
ON public.unique_individuals
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny authenticated access to unique_individuals"
ON public.unique_individuals
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Drop the old restrictive SELECT-only policy since we now have full DENY policies
DROP POLICY IF EXISTS "Deny public read access to unique_individuals" ON public.unique_individuals;