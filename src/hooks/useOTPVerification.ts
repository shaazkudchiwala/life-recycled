import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMSG91Widget } from './useMSG91Widget';

export type OTPStep = 'idle' | 'sending' | 'otp_sent' | 'verifying' | 'verified';

interface UseOTPVerificationOptions {
  intentToken: string;
  onVerified: (isNewUnique: boolean) => void;
}

/**
 * OTP Verification Hook
 *
 * Architecture:
 * - OTP send/retry/verify happen CLIENT-SIDE via MSG91 Web SDK
 * - After successful client-side verification, the access token + intent_token
 *   are sent to our edge function for server-side validation + deduplication + intent binding
 */
export function useOTPVerification({ intentToken, onVerified }: UseOTPVerificationOptions) {
  const [step, setStep] = useState<OTPStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');

  const {
    isReady: widgetReady,
    isLoading: widgetLoading,
    error: widgetError,
    sendOtp: widgetSend,
    retryOtp: widgetRetry,
    verifyOtp: widgetVerify,
  } = useMSG91Widget();

  const sendOTP = useCallback(async (mobile: string) => {
    setError(null);
    setStep('sending');
    setMobileNumber(mobile);

    // MSG91 Web SDK expects identifier with country code, no +
    const identifier = `91${mobile}`;

    try {
      const result = await widgetSend(identifier);

      if (!result.success) {
        console.error('[OTP] Send failed:', result.message);
        setError(result.message || 'Failed to send OTP');
        setStep('idle');
        return;
      }

      console.log('[OTP] OTP sent successfully via Web SDK');
      setStep('otp_sent');
    } catch (err) {
      console.error('[OTP] Send error:', err);
      setError('Network error. Please try again.');
      setStep('idle');
    }
  }, [widgetSend]);

  const retryOTP = useCallback(async () => {
    setError(null);

    try {
      const result = await widgetRetry(null);

      if (!result.success) {
        setError(result.message || 'Failed to resend OTP');
      } else {
        setError(null);
        console.log('[OTP] OTP resent via Web SDK');
      }
    } catch {
      setError('Network error. Please try again.');
    }
  }, [widgetRetry]);

  const verifyOTP = useCallback(async (otp: string) => {
    setError(null);
    setStep('verifying');

    try {
      // Step 1: Verify OTP client-side via MSG91 Web SDK
      const result = await widgetVerify(otp);

      if (!result.success) {
        console.error('[OTP] Client-side verify failed:', result.message);
        setError(result.message || 'Verification failed. Please try again.');
        setStep('otp_sent');
        return;
      }

      console.log('[OTP] Client-side verification successful, access token received');

      // Step 2: Send access token + intent_token to our edge function
      // for server-side validation + deduplication + intent binding
      const { data, error: fnError } = await supabase.functions.invoke('verify-otp', {
        body: {
          action: 'verify_token',
          access_token: result.accessToken,
          mobile: mobileNumber,
          intent_token: intentToken,
        },
      });

      if (fnError || !data?.success) {
        const msg = data?.error || fnError?.message || 'Server verification failed. Please try again.';
        console.error('[OTP] Server-side verify failed:', msg);
        setError(msg);
        setStep('otp_sent');
        return;
      }

      console.log('[OTP] Full verification successful');
      setStep('verified');
      onVerified(data.is_new_unique);
    } catch (err) {
      console.error('[OTP] Verify error:', err);
      setError('Network error. Please try again.');
      setStep('otp_sent');
    }
  }, [widgetVerify, mobileNumber, intentToken, onVerified]);

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setMobileNumber('');
  }, []);

  return {
    step,
    error: error || widgetError,
    widgetReady,
    widgetLoading,
    sendOTP,
    retryOTP,
    verifyOTP,
    reset,
  };
}
