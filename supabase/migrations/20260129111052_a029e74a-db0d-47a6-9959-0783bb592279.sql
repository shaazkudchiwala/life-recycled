-- Drop existing permissive policies on sessions table
DROP POLICY IF EXISTS "Allow public session creation" ON public.sessions;
DROP POLICY IF EXISTS "Allow public session reads" ON public.sessions;
DROP POLICY IF EXISTS "Allow public session updates" ON public.sessions;

-- Create restrictive policies that deny all direct client access
-- Sessions table is server-internal only; all access goes through edge functions with service role

-- No SELECT policy = no public reads (service role bypasses RLS)
-- No INSERT policy = no public inserts (service role bypasses RLS)  
-- No UPDATE policy = no public updates (service role bypasses RLS)

-- The service role key used by edge functions automatically bypasses RLS,
-- so we don't need to create any policies - the absence of policies 
-- combined with RLS enabled means clients cannot access this table at all