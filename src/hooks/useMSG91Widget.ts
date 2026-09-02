import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * MSG91 OTP Widget — Client-Side Web SDK Integration
 * 
 * The MSG91 OTP Widget is a CLIENT-SIDE solution:
 * - widgetId + tokenAuth are used to initialize the widget
 * - window.sendOtp(), window.retryOtp(), window.verifyOtp() are exposed methods
 * - No auth key or server headers needed for OTP send/retry/verify
 * - Server-side auth key is ONLY needed for verifyAccessToken (post-verification)
 */

interface MSG91Config {
  widgetId: string;
  tokenAuth: string;
}

declare global {
  interface Window {
    initSendOTP?: (config: Record<string, unknown>) => void;
    sendOtp?: (
      identifier: string,
      successCb: (data: unknown) => void,
      failCb: (error: unknown) => void
    ) => void;
    retryOtp?: (
      channel: string | null,
      successCb: (data: unknown) => void,
      failCb: (error: unknown) => void,
      reqId?: string
    ) => void;
    verifyOtp?: (
      otp: string,
      successCb: (data: unknown) => void,
      failCb: (error: unknown) => void,
      reqId?: string
    ) => void;
    getWidgetData?: () => unknown;
  }
}

export function useMSG91Widget() {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const configRef = useRef<MSG91Config | null>(null);
  const initAttempted = useRef(false);

  // Fetch widget config (widgetId + tokenAuth) from edge function
  const fetchConfig = useCallback(async (): Promise<MSG91Config | null> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-widget-token', {
        method: 'GET',
      });

      if (fnError || !data?.success) {
        console.error('[MSG91] Failed to fetch widget config:', fnError || data?.error);
        return null;
      }

      return {
        widgetId: data.widgetId,
        tokenAuth: data.token,
      };
    } catch (err) {
      console.error('[MSG91] Error fetching config:', err);
      return null;
    }
  }, []);

  // Load the MSG91 OTP provider script
  const loadScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector('script[src*="verify.msg91.com/otp-provider.js"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://verify.msg91.com/otp-provider.js';
      script.type = 'text/javascript';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load MSG91 SDK'));
      document.body.appendChild(script);
    });
  }, []);

  // Initialize the widget
  useEffect(() => {
    if (initAttempted.current) return;
    initAttempted.current = true;

    async function init() {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch config from backend
        const config = await fetchConfig();
        if (!config) {
          setError('Failed to load verification config');
          setIsLoading(false);
          return;
        }
        configRef.current = config;
        console.log('[MSG91] Config loaded, widgetId:', config.widgetId.slice(0, 8) + '…');

        // 2. Load the MSG91 script
        await loadScript();
        console.log('[MSG91] Script loaded');

        // 3. Initialize with exposeMethods: true (hides default UI, exposes window methods)
        if (window.initSendOTP) {
          window.initSendOTP({
            widgetId: config.widgetId,
            tokenAuth: config.tokenAuth,
            exposeMethods: true,
            success: (data: unknown) => {
              console.log('[MSG91] Widget success callback:', data);
            },
            failure: (error: unknown) => {
              console.error('[MSG91] Widget failure callback:', error);
            },
          });
          console.log('[MSG91] Widget initialized with exposeMethods: true');
        }

        // 4. Wait a tick for methods to be exposed
        await new Promise((r) => setTimeout(r, 500));

        if (window.sendOtp) {
          setIsReady(true);
          console.log('[MSG91] SDK ready — window.sendOtp available');
        } else {
          // The script might need more time; set ready optimistically
          // since initSendOTP was called successfully
          setIsReady(true);
          console.log('[MSG91] SDK initialized (methods may load async)');
        }
      } catch (err) {
        console.error('[MSG91] Init error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize OTP');
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [fetchConfig, loadScript]);

  // Send OTP using client-side SDK
  const sendOtp = useCallback((identifier: string): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      if (!window.sendOtp) {
        resolve({ success: false, message: 'OTP SDK not ready. Please refresh and try again.' });
        return;
      }

      console.log('[MSG91] Calling window.sendOtp for', identifier.slice(0, 4) + '****');
      window.sendOtp(
        identifier,
        (data) => {
          console.log('[MSG91] sendOtp success:', data);
          resolve({ success: true, message: 'OTP sent successfully' });
        },
        (error) => {
          console.error('[MSG91] sendOtp error:', error);
          const msg = typeof error === 'string' ? error : 
                      (error as Record<string, unknown>)?.message as string || 'Failed to send OTP';
          resolve({ success: false, message: msg });
        }
      );
    });
  }, []);

  // Retry OTP using client-side SDK
  const retryOtp = useCallback((channel: string | null = null): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      if (!window.retryOtp) {
        resolve({ success: false, message: 'OTP SDK not ready. Please refresh and try again.' });
        return;
      }

      console.log('[MSG91] Calling window.retryOtp, channel:', channel);
      window.retryOtp(
        channel,
        (data) => {
          console.log('[MSG91] retryOtp success:', data);
          resolve({ success: true, message: 'OTP resent' });
        },
        (error) => {
          console.error('[MSG91] retryOtp error:', error);
          const msg = typeof error === 'string' ? error :
                      (error as Record<string, unknown>)?.message as string || 'Failed to resend OTP';
          resolve({ success: false, message: msg });
        }
      );
    });
  }, []);

  // Verify OTP using client-side SDK — returns access token on success
  const verifyOtp = useCallback((otp: string): Promise<{ success: boolean; accessToken?: string; message?: string }> => {
    return new Promise((resolve) => {
      if (!window.verifyOtp) {
        resolve({ success: false, message: 'OTP SDK not ready. Please refresh and try again.' });
        return;
      }

      console.log('[MSG91] Calling window.verifyOtp');
      window.verifyOtp(
        otp,
        (data) => {
          console.log('[MSG91] verifyOtp success:', data);
          // The success data may contain an access token
          const accessToken = typeof data === 'object' && data !== null
            ? (data as Record<string, unknown>)?.message as string || 
              (data as Record<string, unknown>)?.token as string ||
              (data as Record<string, unknown>)?.['access-token'] as string ||
              JSON.stringify(data)
            : typeof data === 'string' ? data : undefined;
          resolve({ success: true, accessToken });
        },
        (error) => {
          console.error('[MSG91] verifyOtp error:', error);
          const msg = typeof error === 'string' ? error :
                      (error as Record<string, unknown>)?.message as string || 'OTP verification failed';
          resolve({ success: false, message: msg });
        }
      );
    });
  }, []);

  return {
    isReady,
    isLoading,
    error,
    sendOtp,
    retryOtp,
    verifyOtp,
  };
}
