import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useOTPVerification } from '@/hooks/useOTPVerification';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Info,
  Smartphone,
  Loader2,
  KeyRound,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

// ─── Intent validation states ─────────────────────────────────────────────────
type IntentState = 'loading' | 'valid' | 'no_intent' | 'expired' | 'already_claimed';

// ─── State screens ────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container-narrow text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Checking verification eligibility…</p>
        </div>
      </section>
    </Layout>
  );
}

function RequireCommitmentState() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container-narrow text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-warning" />
          <h1 className="mt-6 font-serif text-3xl font-bold text-foreground">
            Complete Pre-Commitment First
          </h1>
          <p className="mt-4 text-muted-foreground">
            You need to complete the pre-commitment step and visit the official NOTTO portal
            before you can verify your registration.
          </p>
          <Button asChild className="mt-8">
            <Link to="/commit">Go to Pre-Commitment</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

function AlreadyVerifiedState() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container-narrow text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-success" />
          <h1 className="mt-6 font-serif text-3xl font-bold text-foreground">
            Already Verified
          </h1>
          <p className="mt-4 text-muted-foreground">
            You have already verified your registration through this initiative.
            Thank you for completing the journey.
          </p>
          <Button asChild variant="outline" className="mt-8">
            <Link to="/methodology">Read Our Methodology</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

function WindowExpiredState() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container-narrow text-center">
          <Clock className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="mt-6 font-serif text-3xl font-bold text-foreground">
            Verification Window Expired
          </h1>
          <p className="mt-4 text-muted-foreground">
            The 48-hour verification window has passed. This time limit exists to ensure
            that verifications are linked to recent, intentional journeys through this initiative.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            If you still wish to be counted, you can start a new journey through the pre-commitment step.
          </p>
          <Button asChild className="mt-8">
            <Link to="/commit">Restart Pre-Commitment</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

function SuccessState() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container-narrow text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="mt-6 font-serif text-3xl font-bold text-foreground">
            Thank You
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your completion has been recorded through this initiative.
          </p>

          <div className="mt-8 rounded-lg border border-border bg-muted/30 p-6 text-left">
            <h3 className="font-semibold text-foreground">What we recorded:</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                That you entered through this initiative's campaign link
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                That you made a pre-commitment and visited the official NOTTO portal
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                That you returned and verified within the time window
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                A privacy-preserving hash to ensure uniqueness
              </li>
            </ul>

            <h3 className="mt-6 font-semibold text-foreground">What we did NOT record:</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Your mobile number (immediately discarded after hashing)
              </li>
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Your personal identity
              </li>
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Whether you actually completed NOTTO registration
              </li>
            </ul>
          </div>

          <Button asChild variant="outline" className="mt-8">
            <Link to="/methodology">Learn About Our Methodology</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

function RepeatVerificationState() {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container-narrow text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mt-6 font-serif text-3xl font-bold text-foreground">
            You Have Already Verified Earlier
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            No further action is required. Your unique verification was recorded
            during your previous visit to this initiative.
          </p>

          <div className="mt-8 rounded-lg border border-border bg-muted/30 p-6">
            <div className="flex items-start gap-3 text-left">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Why am I seeing this?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Our system uses a privacy-preserving cryptographic hash to ensure each
                  individual is counted only once. Since your mobile number has already been
                  verified and recorded, no additional counts or records were created.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="outline">
              <Link to="/methodology">Read Our Methodology</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/metrics">View Public Metrics</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function VerifyPage() {
  // Intent-based state (replaces session-based guards)
  const [intentState, setIntentState] = useState<IntentState>('loading');
  const [intentToken, setIntentToken] = useState<string>('');

  // OTP flow state
  const [mobileInput, setMobileInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isNewUnique, setIsNewUnique] = useState<boolean | null>(null);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const handleVerified = useCallback((isNew: boolean) => {
    setIsNewUnique(isNew);
    setVerificationComplete(true);
    // Clear intent token after successful verification
    localStorage.removeItem('liferecycled_intent_token');
  }, []);

  const {
    step: otpStep,
    error,
    widgetReady,
    widgetLoading,
    sendOTP,
    retryOTP,
    verifyOTP,
    reset,
  } = useOTPVerification({
    intentToken,
    onVerified: handleVerified,
  });

  // ── Validate intent on mount ────────────────────────────────────────────────
  useEffect(() => {
    async function validateIntent() {
      const token = localStorage.getItem('liferecycled_intent_token');
      if (!token) {
        setIntentState('no_intent');
        return;
      }
      setIntentToken(token);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('session-manager', {
          body: { action: 'validate_intent', intent_token: token },
        });

        if (fnError || !data?.valid) {
          const reason = data?.reason || 'INTENT_REQUIRED';
          if (reason === 'INTENT_EXPIRED') {
            setIntentState('expired');
          } else if (reason === 'ALREADY_CLAIMED') {
            setIntentState('already_claimed');
          } else {
            setIntentState('no_intent');
          }
          return;
        }

        setIntentState('valid');
      } catch {
        setIntentState('no_intent');
      }
    }

    validateIntent();
  }, []);

  // ─── Guards ──────────────────────────────────────────────────────────────────

  if (intentState === 'loading') return <LoadingState />;
  if (intentState === 'no_intent') return <RequireCommitmentState />;
  if (intentState === 'expired') return <WindowExpiredState />;
  if (intentState === 'already_claimed') return <AlreadyVerifiedState />;

  // Post-verification states
  if (verificationComplete || otpStep === 'verified') {
    if (isNewUnique === false) return <RepeatVerificationState />;
    return <SuccessState />;
  }

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = mobileInput.replace(/\D/g, '');
    if (clean.length !== 10 || !/^[6-9]/.test(clean)) {
      return;
    }
    sendOTP(clean);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = otpInput.replace(/\D/g, '');
    if (clean.length < 4 || clean.length > 6) return;
    verifyOTP(clean);
  };

  const handleBack = () => {
    setOtpInput('');
    reset();
  };

  const isSending = otpStep === 'sending';
  const isVerifying = otpStep === 'verifying';
  const isOtpSent = otpStep === 'otp_sent';

  const cleanMobile = mobileInput.replace(/\D/g, '');
  const isMobileValid = cleanMobile.length === 10 && /^[6-9]/.test(cleanMobile);

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-narrow">
          {/* Header */}
          <div className="text-center animate-fade-up">
            <span className="inline-block rounded-full bg-secondary px-4 py-1 text-sm font-medium text-secondary-foreground">
              Final Step
            </span>
            <h1 className="mt-4 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              Verify Your Completion
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Help us count unique individuals who completed this journey.
            </p>
          </div>

          {/* Important Disclosure */}
          <div className="mt-8 rounded-lg border border-warning/30 bg-warning/5 p-6 animate-fade-up delay-100">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <h3 className="font-semibold text-foreground">Important Disclosure</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Your mobile number is used <strong>only for OTP verification</strong></li>
                  <li>• After verification, your mobile number is <strong>immediately discarded</strong></li>
                  <li>• Only a cryptographic hash is stored for deduplication</li>
                  <li>• This does <strong>NOT verify</strong> your government registration</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ── Step 1: Mobile Number Input ──────────────────────────────── */}
          {(otpStep === 'idle' || otpStep === 'sending') && (
            <div className="mt-8 card-elevated animate-fade-up delay-200">
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-base font-medium flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile Number
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter your 10-digit mobile number"
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value)}
                    className="text-lg"
                    disabled={isSending}
                    maxLength={10}
                    autoComplete="tel"
                  />
                  <p className="text-sm text-muted-foreground">
                    You will receive an OTP to verify your identity.
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={!isMobileValid || isSending || !widgetReady}
                >
                  {widgetLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading OTP service…
                    </>
                  ) : isSending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending OTP…
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* ── Step 2: OTP Input ────────────────────────────────────────── */}
          {(isOtpSent || isVerifying) && (
            <div className="mt-8 card-elevated animate-fade-up delay-200">
              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isVerifying}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Change number
                </button>
              </div>

              <p className="mb-6 text-sm text-muted-foreground">
                OTP sent to <strong>{'•'.repeat(6)}{cleanMobile.slice(-4)}</strong>
              </p>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-base font-medium flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    Enter OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-lg tracking-widest text-center"
                    disabled={isVerifying}
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={otpInput.length < 4 || isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={retryOTP}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                    disabled={isVerifying}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Resend OTP
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Verification Window Info */}
          <div className="mt-6 text-center text-sm text-muted-foreground animate-fade-up delay-300">
            <Clock className="mr-1 inline h-4 w-4" />
            Verification window: 48 hours from pre-commitment
          </div>
        </div>
      </section>
    </Layout>
  );
}
