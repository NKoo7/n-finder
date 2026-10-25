import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { DiscoverView } from "@/components/discover/discover-view";
import { SAMPLE_MOVIES } from "@/lib/movies/sample-movies";

export const metadata: Metadata = {
  title: "Discover",
  description: "Tune your mood and browse films by the experience you want.",
};

export default function DiscoverPage() {
  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow="Discover"
        title="What do you want to feel tonight?"
        description="Set your mood on five spectrums. Films re-rank as you move each one, and every film explains how it lines up with your settings."
      />
      <DiscoverView movies={SAMPLE_MOVIES} />
    </Container>
  );
}
