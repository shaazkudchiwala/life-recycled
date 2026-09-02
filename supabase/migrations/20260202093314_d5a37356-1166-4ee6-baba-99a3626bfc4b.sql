-- Create table for global per-mobile OTP rate limiting
-- This tracks OTP send attempts per mobile number independent of session IDs
CREATE TABLE public.mobile_otp_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile_hash TEXT NOT NULL UNIQUE,
  
  -- Hourly window tracking (sliding window)
  hourly_attempts INTEGER NOT NULL DEFAULT 0,
  hourly_window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Daily hard cap tracking
  daily_attempts INTEGER NOT NULL DEFAULT 0,
  daily_window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups by mobile_hash
CREATE INDEX idx_mobile_otp_rate_limits_mobile_hash ON public.mobile_otp_rate_limits(mobile_hash);

-- Enable Row Level Security
ALTER TABLE public.mobile_otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- Deny all client access - only service role can access this table
CREATE POLICY "Deny anonymous access to mobile_otp_rate_limits"
ON public.mobile_otp_rate_limits
AS PERMISSIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny authenticated access to mobile_otp_rate_limits"
ON public.mobile_otp_rate_limits
AS PERMISSIVE
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Add trigger for automatic updated_at
CREATE TRIGGER update_mobile_otp_rate_limits_updated_at
BEFORE UPDATE ON public.mobile_otp_rate_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();