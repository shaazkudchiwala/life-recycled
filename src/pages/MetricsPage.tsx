import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  ExternalLink, 
  CheckCircle,
  Info,
  AlertCircle
} from 'lucide-react';

interface Metrics {
  verifiedUniques: number;
  totalCommitments: number;
  totalRedirects: number;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const { data, error } = await supabase.functions.invoke('get-metrics', {
          method: 'GET',
        });

        if (error) {
          console.error('Error fetching metrics:', error);
          throw error;
        }

        setMetrics({
          verifiedUniques: data?.verifiedUniques || 0,
          totalCommitments: data?.totalCommitments || 0,
          totalRedirects: data?.totalRedirects || 0,
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setMetrics({
          verifiedUniques: 0,
          totalCommitments: 0,
          totalRedirects: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  const verificationToRedirectRatio = metrics && metrics.totalRedirects > 0
    ? ((metrics.verifiedUniques / metrics.totalRedirects) * 100).toFixed(1)
    : '0';

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 sm:py-20">
        <div className="container-narrow text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary mb-6">
            <BarChart3 className="h-4 w-4" />
            <span>Public Transparency</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl">
            Platform Metrics
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-xl mx-auto">
            Aggregate, non-identifying process metrics for public accountability.
          </p>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="section-padding">
        <div className="container-narrow">
          {loading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-elevated animate-pulse">
                  <div className="h-12 w-12 rounded-lg bg-muted mb-4" />
                  <div className="h-8 w-24 bg-muted rounded mb-2" />
                  <div className="h-4 w-32 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {/* Verified Unique Individuals */}
                <MetricCard
                  icon={CheckCircle}
                  value={metrics?.verifiedUniques || 0}
                  label="Verified Unique Individuals"
                  description="Count of OTP-verified, cryptographically deduplicated individuals who completed the journey through this initiative"
                />
                
                {/* Total Redirects to NOTTO */}
                <MetricCard
                  icon={ExternalLink}
                  value={metrics?.totalRedirects || 0}
                  label="Total Redirects to NOTTO"
                  description="Server-side redirects from committed sessions"
                />
                
                {/* Verification-to-Redirect Ratio */}
                <div className="card-elevated">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{verificationToRedirectRatio}%</p>
                  <p className="text-sm font-medium text-foreground mt-2">Verification-to-Redirect Ratio</p>
                </div>
              </div>
            </>
          )}

          {/* Disclaimers */}
          <div className="mt-16 space-y-6">
            <div className="rounded-xl border border-border bg-muted/30 p-8">
              <div className="flex items-start gap-4">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground text-lg">What These Metrics Represent</h3>
                  <ul className="mt-4 space-y-3 text-muted-foreground">
                    <li><strong className="text-foreground">Verified Unique Individuals:</strong> OTP-verified, cryptographically deduplicated people</li>
                    <li><strong className="text-foreground">Total Redirects:</strong> Server-side redirects from committed sessions to NOTTO portal - official organ donation registry page</li>
                    <li>Metrics cannot confirm the current status of government registration of individual.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-warning/30 bg-warning/5 p-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Data Privacy Guarantee</h3>
                  <ul className="mt-4 space-y-3 text-muted-foreground">
                    <li>Only aggregate counts are displayed</li>
                    <li>No personal data is shown</li>
                    <li>No session identifiers are exposed</li>
                    <li>No hashes or cryptographic identifiers are displayed</li>
                    <li>No raw logs are accessible</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground pt-4">
              All metrics are aggregate-only. This page is intended for public accountability and audit clarity, not user tracking or impact inflation.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function MetricCard({
  icon: Icon,
  value,
  label,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  description: string;
}) {
  return (
    <div className="card-elevated">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
      <p className="text-sm font-medium text-foreground mt-2">{label}</p>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
    </div>
  );
}
