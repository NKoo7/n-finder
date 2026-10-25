import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { WatchlistView } from "@/components/watchlist/watchlist-view";
import { SAMPLE_MOVIES } from "@/lib/movies/sample-movies";

export const metadata: Metadata = {
  title: "Watchlist",
  description: "Films you have saved to watch later.",
};

export default function WatchlistPage() {
  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow="Watchlist"
        title="Saved for later."
        description="Your watchlist is stored in this browser only. There are no accounts, so it will not follow you to another browser or device."
      />
      <WatchlistView movies={SAMPLE_MOVIES} />
    </Container>
  );
}
