import Link from "next/link";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-2xl text-bone">N-finder</p>
          <p className="mt-1 text-sm text-bone-muted">Find your next obsession.</p>
        </div>
        <div className="max-w-md text-sm leading-relaxed text-bone-dim">
          <p>
            Early build. Features are added in stages and not every control is
            connected yet.
          </p>
          <nav aria-label="Footer" className="mt-4 flex gap-5">
            <Link href="/discover" className="text-bone-muted hover:text-bone">
              Discover
            </Link>
            <Link href="/watchlist" className="text-bone-muted hover:text-bone">
              Watchlist
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
