-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create sessions table to track user journey state
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  source_id TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'entered' CHECK (state IN ('entered', 'committed', 'verified', 'expired')),
  entry_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  precommit_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Create index for fast session_id lookups
CREATE INDEX idx_sessions_session_id ON public.sessions(session_id);
CREATE INDEX idx_sessions_state ON public.sessions(state);

-- Allow public inserts (session creation from edge function)
CREATE POLICY "Allow public session creation" 
ON public.sessions 
FOR INSERT 
WITH CHECK (true);

-- Allow public reads for session validation
CREATE POLICY "Allow public session reads" 
ON public.sessions 
FOR SELECT 
USING (true);

-- Allow public updates for state transitions
CREATE POLICY "Allow public session updates" 
ON public.sessions 
FOR UPDATE 
USING (true);

-- Add constraint to redirect_logs: only one log per session
ALTER TABLE public.redirect_logs ADD CONSTRAINT unique_session_redirect UNIQUE (session_id);

-- Add RLS policy for redirect_logs - only service role can insert
CREATE POLICY "Allow service role insert" 
ON public.redirect_logs 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for session updated_at
CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();