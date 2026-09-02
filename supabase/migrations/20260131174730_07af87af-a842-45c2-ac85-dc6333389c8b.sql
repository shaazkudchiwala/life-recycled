-- Create table for unique individuals (storing only hashes for deduplication)
CREATE TABLE public.unique_individuals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile_hash TEXT NOT NULL UNIQUE,
  verification_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.unique_individuals ENABLE ROW LEVEL SECURITY;

-- Create restrictive policy - only server/service role can access
CREATE POLICY "Deny public read access to unique_individuals"
ON public.unique_individuals
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (false);

-- Add index for fast hash lookups
CREATE INDEX idx_unique_individuals_mobile_hash ON public.unique_individuals (mobile_hash);

-- Add comment explaining the privacy-preserving design
COMMENT ON TABLE public.unique_individuals IS 'Stores SHA256 hashes of mobile numbers for deduplication. Mobile numbers are never stored, only their irreversible hashes.';
COMMENT ON COLUMN public.unique_individuals.mobile_hash IS 'SHA256(mobile_number + secret_salt) - irreversible, used solely for deduplication';