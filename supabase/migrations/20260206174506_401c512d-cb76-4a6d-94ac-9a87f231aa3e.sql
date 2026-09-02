
-- Create intents table for decoupling verification from session lifecycle
CREATE TABLE public.intents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intent_id TEXT NOT NULL UNIQUE,
  intent_token TEXT NOT NULL UNIQUE,
  source_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  intent_created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  mobile_hash TEXT,
  claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS with deny-all policies (server-side only via service role)
ALTER TABLE public.intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny anonymous access to intents"
  ON public.intents FOR ALL TO anon
  USING (false) WITH CHECK (false);

CREATE POLICY "Deny authenticated access to intents"
  ON public.intents FOR ALL TO authenticated
  USING (false) WITH CHECK (false);

-- Indexes for fast lookups
CREATE INDEX idx_intents_intent_token ON public.intents (intent_token);
CREATE INDEX idx_intents_intent_id ON public.intents (intent_id);

-- Trigger for automatic updated_at
CREATE TRIGGER update_intents_updated_at
  BEFORE UPDATE ON public.intents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
