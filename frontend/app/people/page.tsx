import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { PeopleView } from "@/components/community/people-view";
import { SAMPLE_MOVIES } from "@/lib/movies/sample-movies";

export const metadata: Metadata = {
  title: "Co-Stars",
  description: "Find people who share your movie taste and connect as Co-Stars.",
};

export default function PeoplePage() {
  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow="Community"
        title="Find your Co-Stars."
        description="People who love the same frames you do. Match by shared films and taste, then connect — no follower counts, just chemistry."
      />
      <PeopleView movies={SAMPLE_MOVIES} />
    </Container>
  );
}