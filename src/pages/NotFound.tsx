import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <span className="font-serif text-4xl font-bold text-muted-foreground">404</span>
          </div>
          
          <h1 className="mt-6 font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Page Not Found
          </h1>
          
          <p className="mt-4 text-lg text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Go Back Home
              </Link>
            </Button>
            
            <Button asChild className="gap-2">
              <Link to="/pledge/life-recycled">
                <Home className="h-4 w-4" />
                Start Your Journey
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
