import { Layout } from '@/components/layout/Layout';
import { 
  Shield, 
  ArrowRight, 
  Eye, 
  CheckCircle,
  XCircle,
  MessageSquare,
  Hash,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function MethodologyPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 sm:py-20">
        <div className="container-narrow text-center">
          <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">
            Our Methodology
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-xl mx-auto">
            How we count, what we claim, and why our numbers can be trusted.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-narrow space-y-16">
          
          {/* 1. What We Count */}
          <div className="card-elevated">
            <h2 className="mt-0 flex items-center gap-3 font-serif text-2xl">
              <CheckCircle className="h-6 w-6 text-success" />
              1) What We Count
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We count <strong className="text-foreground">unique individuals</strong> who complete the following sequence on our platform:
            </p>
            <ol className="mt-6 ml-6 list-decimal space-y-3 text-muted-foreground">
              <li>Enter through one of our official campaign links</li>
              <li>Make an explicit pre-commitment on our platform</li>
              <li>Are redirected server-side to the official NOTTO registration portal</li>
              <li>Return within a defined time window</li>
              <li>Complete verification using a one-time mobile OTP</li>
            </ol>
            <p className="mt-6 text-muted-foreground">
              A person is counted <strong className="text-foreground">ONLY</strong> at successful OTP verification <strong className="text-foreground">AND</strong> only once.
            </p>
          </div>

          {/* 2. What We Do NOT Count/Claim */}
          <div className="card-elevated border-destructive/20">
            <h2 className="mt-0 flex items-center gap-3 font-serif text-2xl text-foreground">
              <XCircle className="h-6 w-6 text-destructive" />
              2) What We Do NOT Count or Claim
            </h2>
            <p className="mt-4 mb-6 text-muted-foreground">We explicitly do not count or claim:</p>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive/60" />
                <span className="text-muted-foreground">First-ever registrations (we cannot know if someone was already registered)</span>
              </li>
              <li className="flex items-start gap-4">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive/60" />
                <span className="text-muted-foreground">Successful government registration confirmation (we don't have access to NOTTO databases)</span>
              </li>
              <li className="flex items-start gap-4">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive/60" />
                <span className="text-muted-foreground">Donor status or medical consent</span>
              </li>
              <li className="flex items-start gap-4">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive/60" />
                <span className="text-muted-foreground">Access to NOTTO, ABDM, or government databases</span>
              </li>
              <li className="flex items-start gap-4">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive/60" />
                <span className="text-muted-foreground">Validation of ABHA numbers or personal identity</span>
              </li>
            </ul>
          </div>

          {/* 3. How Uniqueness Is Ensured */}
          <div className="space-y-6">
            <h2 className="flex items-center gap-3 font-serif text-2xl">
              <Hash className="h-6 w-6 text-primary" />
              3) How Uniqueness Is Ensured
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Uniqueness is enforced <strong className="text-foreground">without storing identity</strong>.
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                Users verify via a one-time OTP sent to their mobile number
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                After verification, the mobile number is <strong className="text-foreground">immediately discarded</strong>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                A cryptographic hash is generated solely for deduplication
              </li>
            </ul>
            <div className="rounded-xl bg-muted/50 p-6 text-sm text-muted-foreground">
              A one-way cryptographic hash is computed from the verified number and a secret salt, then the original number is discarded.
            </div>
            <p className="text-muted-foreground">
              This ensures:
            </p>
            <ul className="grid gap-3 sm:grid-cols-2 text-muted-foreground">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-success" />
                One count per individual
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-success" />
                No storage of phone numbers
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-success" />
                No way to reverse the hash
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-success" />
                No cross-platform tracking
              </li>
            </ul>
          </div>

          {/* 4. Why Sequence-Based Proof */}
          <div className="space-y-6">
            <h2 className="flex items-center gap-3 font-serif text-2xl">
              <ArrowRight className="h-6 w-6 text-primary" />
              4) Why Sequence-Based Proof?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We cannot query or audit government systems. Instead, we prove <strong className="text-foreground">verified sequence and intent</strong>.
            </p>
            <p className="text-muted-foreground">
              This system demonstrates that a user:
            </p>
            <div className="rounded-xl bg-muted/50 p-8">
              <div className="flex flex-col gap-4">
                <Step num={1} text="Intentionally entered via our initiative" />
                <Connector />
                <Step num={2} text="Actively chose to proceed" />
                <Connector />
                <Step num={3} text="Was redirected to the official government portal" />
                <Connector />
                <Step num={4} text="Returned and verified within a time-bound window" />
              </div>
            </div>
            <p className="text-muted-foreground">
              This prevents retroactive claims and accidental attribution.
            </p>
          </div>

          {/* 5. How Credibility is Ensured */}
          <div className="space-y-8">
            <h2 className="flex items-center gap-3 font-serif text-2xl">
              <Shield className="h-6 w-6 text-primary" />
              5) How Credibility is Ensured
            </h2>

            <div className="space-y-6">
              <div className="rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground text-lg mb-3">1. Redirect as Upper Bound</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All counts originate from server-side redirects to the official NOTTO portal. 
                  Verified counts can <strong className="text-foreground">never exceed</strong> recorded redirects.
                </p>
              </div>

              <div className="rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground text-lg mb-3">2. Time-Bound Verification</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Verification is allowed only within a limited window after redirection, 
                  ensuring freshness and intent.
                </p>
              </div>

              <div className="rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground text-lg mb-3">3. Deduplication Without Identity</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Cryptographic hashing prevents double counting while preserving privacy.
                </p>
              </div>

              <div className="rounded-xl border border-border p-6">
                <h3 className="flex items-center gap-2 font-semibold text-foreground text-lg mb-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  4. Government "Inspired By" Field
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  The NOTTO form includes a voluntary "Inspired by" field. If users independently 
                  mention Life Recycled by The Choice Collective, that attribution is recorded 
                  only by the government. We do not prompt, access, or depend on this field for our counts.
                </p>
              </div>
            </div>
          </div>

          {/* 6. Privacy Guarantees */}
          <div className="space-y-6">
            <h2 className="flex items-center gap-3 font-serif text-2xl">
              <Lock className="h-6 w-6 text-primary" />
              6) Privacy Guarantees
            </h2>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 text-success mb-4">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold text-lg">We Do</span>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li>Use HTTPS everywhere</li>
                  <li>Use HttpOnly session cookies</li>
                  <li>Verify via OTP without storing phone numbers</li>
                  <li>Immediately discard sensitive inputs after hashing</li>
                  <li>Store only anonymous, aggregate metrics</li>
                </ul>
              </div>
              
              <div className="rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 text-destructive mb-4">
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold text-lg">We Never</span>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li>Store personal identifiers</li>
                  <li>Log IP addresses</li>
                  <li>Fingerprint devices</li>
                  <li>Track user behavior on NOTTO</li>
                  <li>Use third-party analytics</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 7. Our Public Claim */}
          <div className="space-y-6">
            <h2 className="flex items-center gap-3 font-serif text-2xl">
              <Eye className="h-6 w-6 text-primary" />
              7) Our Public Claim
            </h2>
            
            <blockquote className="rounded-xl border-l-4 border-primary bg-primary/5 p-8 italic text-foreground leading-relaxed">
              "We count individuals who entered via our initiative, made a time-bound 
              commitment to complete or reaffirm official organ donation registration, 
              and verified completion immediately afterward using privacy-preserving 
              methods to ensure uniqueness."
            </blockquote>
            
            <p className="text-muted-foreground">
              No stronger claim is made.
            </p>
          </div>

          {/* 8. Build Standard */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-8">
            <h3 className="mt-0 font-serif text-2xl font-semibold text-foreground">
              8) Our Build Standard
            </h3>
            <p className="mt-4 text-muted-foreground">
              This system is built as if:
            </p>
            <ul className="mt-6 space-y-3 text-muted-foreground">
              <li>A journalist will audit it</li>
              <li>A lawyer will challenge it</li>
              <li>A regulator will question intent</li>
              <li>A critic will assume bad faith</li>
            </ul>
            <p className="mt-6 font-medium text-foreground text-lg">
              And it must still stand.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center pt-8">
            <p className="text-muted-foreground">
              Ready to begin your journey?
            </p>
            <Button asChild className="mt-6" size="lg">
              <Link to="/commit">
                Start Here
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Step({ num, text }: { num: number; text: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        {num}
      </div>
      <span className="text-foreground">{text}</span>
    </div>
  );
}

function Connector() {
  return (
    <div className="ml-5 h-4 w-px bg-border" />
  );
}
