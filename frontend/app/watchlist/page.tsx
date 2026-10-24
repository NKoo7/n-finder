import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";

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
        description="Your watchlist will be stored in this browser only. There are no accounts, so it will not follow you to another device."
      />
      <EmptyState
        className="mt-10"
        title="Nothing saved yet"
        description="Saving films is not connected in this build. When it is, anything you add from Discover will show up here."
        action={<ButtonLink href="/discover">Go to Discover</ButtonLink>}
      />
    </Container>
  );
}
