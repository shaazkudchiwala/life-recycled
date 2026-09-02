-- Create table to log redirect events for analytics
CREATE TABLE public.redirect_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  destination TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (public insert, no read needed from client)
ALTER TABLE public.redirect_logs ENABLE ROW LEVEL SECURITY;

-- Allow inserts from edge functions (service role) - no client-side access needed
-- Edge function will use service role key to insert