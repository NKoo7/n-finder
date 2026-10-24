import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchField } from "@/components/ui/search-field";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusNote } from "@/components/ui/status-note";
import { Surface } from "@/components/ui/surface";
import { MoodDimensionRow } from "@/components/mood/mood-dimension-row";
import { MOOD_DIMENSIONS } from "@/lib/mood-dimensions";

export const metadata: Metadata = {
  title: "Discover",
  description: "Tune your mood and browse films by the experience you want.",
};

const PLACEHOLDER_COUNT = 6;

export default function DiscoverPage() {
  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow="Discover"
        title="What do you want to feel tonight?"
        description="Set your mood on five spectrums and browse by experience. The controls below show the layout; they are switched off until the engine and catalogue are connected."
      />

      <StatusNote className="mt-8">
        Not connected yet: the mood controls do not change any results, and there is no
        movie catalogue in this build. Nothing on this page is a recommendation.
      </StatusNote>

      <div className="mt-10 grid gap-8 lg:grid-cols-[22rem_1fr] lg:items-start lg:gap-12">
        <Surface
          role="group"
          aria-labelledby="mood-title"
          className="p-6 lg:sticky lg:top-24"
        >
          <h2 id="mood-title" className="font-display text-3xl text-bone">
            Cinematic Mood Engine
          </h2>
          <p className="mb-6 mt-1 text-sm text-bone-dim">Five spectrums, one mood.</p>
          <div className="divide-y divide-line">
            {MOOD_DIMENSIONS.map((dimension) => (
              <MoodDimensionRow key={dimension.id} dimension={dimension} />
            ))}
          </div>
        </Surface>

        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchField
              id="movie-search"
              label="Search films"
              placeholder="Search films (not connected yet)"
              disabled
              className="flex-1"
            />
          </div>

          <h2 className="mb-4 mt-10 font-mono text-xs uppercase tracking-[0.18em] text-gold">
            Results
          </h2>

          <EmptyState
            title="No catalogue connected"
            description="When the sample catalogue and recommendation engine arrive, your matches will appear here, each with a plain-language explanation of why it fits. Until then, this area stays empty on purpose."
            action={
              <ButtonLink href="/" variant="outline">
                Back to overview
              </ButtonLink>
            }
          />

          <ul
            aria-label="Layout preview of future result cards"
            className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3"
          >
            {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
              <li key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  );
}
