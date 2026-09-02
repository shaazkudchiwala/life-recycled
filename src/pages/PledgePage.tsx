import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useSession } from '@/contexts/SessionContext';
import { Heart, BookOpen, ArrowRight, Shield, Users, Scale } from 'lucide-react';

export default function PledgePage() {
  const { sourceId } = useParams<{ sourceId: string }>();
  const { initSession } = useSession();

  // Initialize session on entry - this is the attribution anchor
  // Validate sourceId format (alphanumeric + hyphens, max 64 chars) before calling backend
  useEffect(() => {
    if (sourceId && /^[a-z0-9-]+$/i.test(sourceId) && sourceId.length <= 64) {
      initSession(sourceId);
    }
  }, [sourceId, initSession]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="container-narrow relative py-16 sm:py-24">
          <div className="text-center animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
              <Heart className="h-4 w-4" />
              <span>A Community Initiative</span>
            </div>
            
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Consider Organ Donation
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              This initiative supports your right to make an informed decision about 
              cadaveric organ donation through the official Government of India portal.
            </p>

            <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">You are completely free to choose.</strong> Whether you decide to 
                register, reaffirm an existing decision, or choose not to proceed — every outcome is respected equally.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-up delay-200">
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto gap-2">
              <Link to="/understand">
                <BookOpen className="h-5 w-5" />
                Understand the Process
              </Link>
            </Button>
            
            <Button asChild size="lg" className="w-full sm:w-auto gap-2">
              <Link to="/commit">
                Proceed to Pledge
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Information Cards */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid gap-6 md:grid-cols-3">
            <InfoCard
              icon={Shield}
              title="Privacy Protected"
              description="We do not store personal data. No tracking, no fingerprinting, no data sharing with third parties."
            />
            <InfoCard
              icon={Users}
              title="Your Choice Matters"
              description="This is about completing or reaffirming your decision. There is no pressure, no guilt, no emotional manipulation."
            />
            <InfoCard
              icon={Scale}
              title="Transparent Process"
              description="We count individuals who complete this journey using privacy-preserving methods. Read our methodology to learn more."
            />
          </div>
        </div>
      </section>

      {/* What This Is Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <div className="prose-civic">
            <h2 className="text-center font-serif">What is Cadaveric Organ Donation?</h2>
            
            <p>
              Cadaveric organ donation is the process of donating organs after death. When someone passes away 
              under specific medical circumstances (typically brain death), their organs can potentially save 
              multiple lives through transplantation.
            </p>

            <p>
              In India, organ donation registration is managed through the National Organ & Tissue Transplant 
              Organisation (NOTTO), a government body under the Ministry of Health and Family Welfare.
            </p>

            <p>
              Registering as a donor is a declaration of intent. It informs your family of your wishes, though 
              the final decision at the time of death rests with the next of kin.
            </p>

            <div className="mt-8 rounded-lg border border-border bg-card p-6 text-center">
              <p className="text-muted-foreground">
                Want to learn more before deciding?
              </p>
              <Button asChild variant="link" className="mt-2 gap-2">
                <Link to="/understand">
                  Read detailed information
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function InfoCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  title: string; 
  description: string;
}) {
  return (
    <div className="card-elevated group transition-all hover:shadow-lg">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}