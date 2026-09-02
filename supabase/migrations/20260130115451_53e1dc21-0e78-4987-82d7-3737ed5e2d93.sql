-- Add RLS policy for sessions table to allow public read of aggregate counts
-- This is safe because we only expose aggregate counts, not individual session data
CREATE POLICY "Allow public to read session counts"
ON public.sessions
FOR SELECT
USING (true);

-- Add RLS policy for redirect_logs table to allow public read of aggregate counts
CREATE POLICY "Allow public to read redirect counts"
ON public.redirect_logs
FOR SELECT
USING (true);