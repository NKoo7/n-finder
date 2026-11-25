import Link from "next/link";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <p className="text-aurora font-display text-2xl">N-Finder</p>
          <p className="mt-1 text-sm text-bone-muted">Find your way into your taste.</p>
        </div>
        <div className="max-w-md text-sm leading-relaxed text-bone-dim">
          <p>
            Demo build: films, ratings and community profiles run on clearly
            labeled sample data stored in your browser. Connect a licensed
            metadata API and a real auth service for production.
          </p>
          <nav aria-label="Footer" className="mt-4 flex flex-wrap gap-5">
            <Link href="/discover" className="text-bone-muted hover:text-bone">
              Discover
            </Link>
            <Link href="/people" className="text-bone-muted hover:text-bone">
              Co-Stars
            </Link>
            <Link href="/watchlist" className="text-bone-muted hover:text-bone">
              Saved Movies
            </Link>
            <Link href="/profile" className="text-bone-muted hover:text-bone">
              Profile
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}