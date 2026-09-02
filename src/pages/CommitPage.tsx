import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Shield, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CommitPage() {
  const { session, commitSession, isLoading: sessionLoading } = useSession();
  const [checkedOfficial, setCheckedOfficial] = useState(false);
  const [checkedDecision, setCheckedDecision] = useState(false);
  const [isRedirecting] = useState(false);
  const [redirectComplete, setRedirectComplete] = useState(false);
  const { toast } = useToast();

  // Redirect if no valid session
  if (!session) {
    return <Navigate to="/pledge/life-recycled" replace />;
  }

  const canProceed = checkedOfficial && checkedDecision;

  const handleProceed = () => {
    if (!canProceed || !session) return;

    // Step 1: Open NOTTO IMMEDIATELY (synchronous, avoids popup blocker)
    window.open('https://notto.abdm.gov.in/register', '_blank', 'noopener,noreferrer');

    // Step 2: Show post-redirect state instantly
    setRedirectComplete(true);

    // Step 3: Run all backend operations asynchronously AFTER the tab opens
    (async () => {
      try {
        // Commit the session
        await commitSession();

        // Create intent
        const { data: intentData, error: intentError } = await supabase.functions.invoke('session-manager', {
          body: {
            action: 'create_intent',
            session_id: session.sessionId,
          },
        });

        if (!intentError && intentData?.intent_token) {
          localStorage.setItem('liferecycled_intent_token', intentData.intent_token);
        } else {
          console.error('Intent creation error:', intentError || intentData);
        }

        // Log redirect
        const { error } = await supabase.functions.invoke('notto-redirect', {
          body: {
            session_id: session.sessionId,
            source_id: session.sourceId,
          },
        });

        if (error) {
          console.error('Redirect log error:', error);
        }
      } catch (err) {
        console.error('Post-redirect backend error:', err);
      }
    })();
  };

  // ─── Post-redirect state ─────────────────────────────────────────────
  if (redirectComplete) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="container-narrow">
            <div className="text-center animate-fade-up">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h1 className="mt-6 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                NOTTO Portal Opened
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                The official NOTTO registration portal has been opened in a new tab.
                Complete your registration there, then return here to verify.
              </p>
            </div>

            <div className="mt-10 card-elevated text-center animate-fade-up delay-100">
              <h3 className="font-serif text-lg font-semibold text-foreground">
                After completing registration on NOTTO
              </h3>
              <p className="mt-3 text-muted-foreground">
                Return to this website and verify your completion within 48 hours.
                This helps us count unique individuals who completed this journey.
              </p>
              <Button asChild size="lg" className="mt-6 gap-2">
                <Link to="/verify">
                  Verify My Completion
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </Link>
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 animate-fade-up delay-200">
              <div className="card-subtle flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Privacy Protected</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We do not track your activity on the NOTTO website
                  </p>
                </div>
              </div>

              <div className="card-subtle flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">48-Hour Window</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You have 48 hours from now to complete verification
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // ─── Pre-commit form ──────────────────────────────────────────────────
  return (
    <Layout>
      <section className="section-padding">
        <div className="container-narrow">
          {/* Back Link */}
          <Link 
            to="/understand" 
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to information
          </Link>

          {/* Header */}
          <div className="text-center animate-fade-up">
            <span className="inline-block rounded-full bg-accent px-4 py-1 text-sm font-medium text-accent-foreground">
              Commitment Step
            </span>
            <h1 className="mt-4 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              Pre-Commitment Declaration
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Please confirm your understanding before proceeding to the official registration.
            </p>
          </div>

          {/* Commitment Card */}
          <div className="mt-10 animate-fade-up delay-100">
            <div className="card-elevated">
              {/* Statement */}
              <div className="rounded-lg bg-muted/50 p-6 text-center">
                <p className="font-serif text-lg font-medium text-foreground italic">
                  "I am about to visit the official Government of India portal to complete or 
                  reaffirm my organ donation decision today."
                </p>
              </div>

              {/* Acknowledgements */}
              <div className="mt-8 space-y-4">
                <h3 className="font-semibold text-foreground">Required Acknowledgements</h3>
                
                <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
                  <Checkbox
                    id="official"
                    checked={checkedOfficial}
                    onCheckedChange={(checked) => setCheckedOfficial(checked === true)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-foreground">
                      I understand this is the official government process
                    </span>
                    <p className="mt-1 text-sm text-muted-foreground">
                      I will be redirected to NOTTO (National Organ & Tissue Transplant Organisation), 
                      the official Government of India portal for organ donation registration.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
                  <Checkbox
                    id="decision"
                    checked={checkedDecision}
                    onCheckedChange={(checked) => setCheckedDecision(checked === true)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-foreground">
                      I am choosing to complete or reaffirm my decision now
                    </span>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This is my voluntary choice. I am not being pressured, incentivized, or 
                      emotionally manipulated into this decision.
                    </p>
                  </div>
                </label>
              </div>

              {/* Action */}
              <div className="mt-8">
                <Button 
                  onClick={handleProceed}
                  disabled={!canProceed || isRedirecting || sessionLoading}
                  size="lg"
                  className="w-full gap-2"
                >
                  {isRedirecting || sessionLoading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {sessionLoading ? 'Validating...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      Proceed to Official Registration
                      <ExternalLink className="h-5 w-5" />
                    </>
                  )}
                </Button>

                {!canProceed && (
                  <p className="mt-3 text-center text-sm text-muted-foreground">
                    Please check both acknowledgements to proceed
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 animate-fade-up delay-200">
            <div className="card-subtle flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">Privacy Protected</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We do not track your activity on the NOTTO website
                </p>
              </div>
            </div>

            <div className="card-subtle flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">Time-Bound Verification</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  After registration, return within 48 hours to verify
                </p>
              </div>
            </div>
          </div>

          {/* Verification Reminder */}
          <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-6 text-center animate-fade-up delay-300">
            <h3 className="font-semibold text-foreground">
              After completing registration on NOTTO
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Please return to this website and visit the{' '}
              <Link to="/verify" className="font-medium text-primary underline underline-offset-2">
                verification page
              </Link>{' '}
              to confirm your completion. This helps us count unique individuals who completed 
              this journey through our initiative.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
