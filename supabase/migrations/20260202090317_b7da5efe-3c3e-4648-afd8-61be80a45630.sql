-- Create table for persistent OTP storage
CREATE TABLE public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_hash TEXT NOT NULL,
  session_id TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  send_attempts INT NOT NULL DEFAULT 1,
  verify_attempts INT NOT NULL DEFAULT 0,
  last_verify_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mobile_hash, session_id)
);

-- Index for efficient expiry cleanup
CREATE INDEX idx_otp_verifications_expiry ON public.otp_verifications(expires_at);

-- Index for lookup
CREATE INDEX idx_otp_verifications_lookup ON public.otp_verifications(mobile_hash, session_id);

-- Enable RLS
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Block all client access - only service role can access
CREATE POLICY "Block anonymous access to otp_verifications"
ON public.otp_verifications
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Block authenticated access to otp_verifications"
ON public.otp_verifications
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);