import { Layout } from '@/components/layout/Layout';
import { FileText, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function FormGuidancePage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container-narrow text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary mb-4">
            <FileText className="h-4 w-4" />
            <span>Registration Assistance</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">
            Form Guidance
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Step-by-step guidance to help you complete the official registration.
          </p>
        </div>
      </section>

      {/* Coming Soon Content */}
      <section className="section-padding">
        <div className="container-narrow">
          <div className="text-center card-elevated">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mt-6 font-serif text-2xl font-semibold text-foreground">
              Coming Soon
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md mx-auto">
              We're preparing detailed step-by-step guidance to help you navigate the official 
              NOTTO registration form. This section will include screenshots, field explanations, 
              and helpful tips.
            </p>
            <Button asChild variant="outline" className="mt-8">
              <Link to="/pledge/life-recycled">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
