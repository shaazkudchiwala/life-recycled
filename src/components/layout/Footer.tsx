import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container-wide py-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-semibold text-foreground">
              Life Recycled
            </span>
          </div>
          
          <p className="max-w-md text-sm text-muted-foreground">
            A community initiative by The Choice Collective to support informed organ donation decisions 
            through the official Government of India portal.
          </p>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link 
              to="/methodology" 
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Methodology
            </Link>
            <a 
              href="https://notto.abdm.gov.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Official NOTTO Portal
            </a>
          </nav>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>This platform does not store personal data or verify government records.</p>
            <p className="mt-1">© {new Date().getFullYear()} The Choice Collective. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}