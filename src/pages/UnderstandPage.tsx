import { Link, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useSession } from '@/contexts/SessionContext';
import { FAQ } from '@/components/FAQ';
import { 
  ArrowRight, 
  Heart, 
  Users, 
  FileCheck, 
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle
} from 'lucide-react';

export default function UnderstandPage() {
  const { session } = useSession();

  // Redirect if no valid session
  if (!session) {
    return <Navigate to="/pledge/life-recycled" replace />;
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-narrow">
          {/* Header */}
          <div className="text-center animate-fade-up">
            <span className="inline-block rounded-full bg-secondary px-4 py-1 text-sm font-medium text-secondary-foreground">
              Educational Information
            </span>
            <h1 className="mt-4 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              Understanding Organ Donation
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Clear, factual information to help you make an informed decision.
            </p>
          </div>

          {/* Content */}
          <div className="mt-12 space-y-8 animate-fade-up delay-100">

            {/* What is Cadaveric Donation */}
            <ContentCard icon={Heart} title="What is Cadaveric Organ and Tissue Donation?">
              <p>
                Cadaveric organ donation refers to donating organs after death. This typically occurs when 
                someone is declared brain dead — meaning the brain has permanently lost all function, even 
                though the heart may still beat with mechanical support.
              </p>
              <p>
                One donor can potentially save up to 8 lives through organ donation and enhance the quality 
                of life of many more through tissue donation (such as corneas, skin, bone, and heart valves).
              </p>
            </ContentCard>

            {/* What Registration Does */}
            <ContentCard icon={FileCheck} title="What Does Registration Actually Do?">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <p>Records your intent to donate in the national registry</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <p>Provides documentation of your wishes for your family</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <p>Can be updated or withdrawn at any time</p>
                </div>
              </div>
            </ContentCard>

            {/* What Registration Does NOT Do */}
            <ContentCard icon={AlertCircle} title="What Registration Does NOT Do">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <p>Does not override your family's consent — the final decision rests with next of kin</p>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <p>Does not guarantee organs will be donated (medical conditions must be suitable)</p>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <p>Does not affect your medical treatment in any way</p>
                </div>
              </div>
            </ContentCard>

            {/* Role of Family */}
            <ContentCard icon={Users} title="The Role of Family Consent">
              <p>
                In India, even with a registered pledge, the legal next of kin must consent to organ 
                donation at the time of death. This is why discussing your decision with family is 
                important.
              </p>
              <p>
                Your registration serves as documented evidence of your wishes, which can help guide 
                your family during a difficult time.
              </p>
            </ContentCard>

            {/* Cultural & Religious Note */}
            <div className="rounded-lg border border-border bg-muted/30 p-6">
              <h3 className="font-serif text-lg font-semibold text-foreground">
                A Note on Cultural & Religious Perspectives
              </h3>
              <p className="mt-3 text-muted-foreground">
                Organ donation is a personal decision that may be influenced by cultural, religious, or 
                philosophical beliefs. Most major religions in India support organ donation as an act of 
                compassion, though interpretations vary. We encourage you to consult with your religious 
                or community leaders if you have questions.
              </p>
              <p className="mt-3 text-muted-foreground">
                This initiative takes no position on what you should decide. We respect all choices equally.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center animate-fade-up delay-200">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-8">
              <h3 className="font-serif text-xl font-semibold text-foreground">
                Ready to proceed?
              </h3>
              <p className="mt-2 text-muted-foreground">
                If you understand the process and wish to continue, you can proceed to the commitment step.
              </p>
              <Button asChild size="lg" className="mt-6 gap-2">
                <Link to="/commit">
                  I am clear and ready to proceed
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 animate-fade-up delay-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                Frequently Asked Questions
              </h2>
            </div>
            <FAQ initialVisibleCount={8} />
          </div>
        </div>
      </section>
    </Layout>
  );
}

function ContentCard({ 
  icon: Icon, 
  title, 
  children 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  title: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="card-elevated">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>
          <div className="mt-3 space-y-3 text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
