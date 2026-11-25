"use client";

import { Bookmark } from "lucide-react";
import { MovieShelf } from "@/components/community/movie-shelf";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusNote } from "@/components/ui/status-note";
import { useCommunity, useHydrated } from "@/lib/community/use-community";
import type { Movie } from "@/lib/movies/types";

export function WatchlistView({ movies }: { movies: readonly Movie[] }) {
  const hydrated = useHydrated();
  const community = useCommunity();

  // The server cannot know what is in this browser's storage, so render nothing until
  // hydrated instead of flashing a wrong "Nothing saved yet".
  if (!hydrated) return <div className="mt-10 min-h-40" aria-hidden="true" />;

  if (!community.user) {
    return (
      <EmptyState
        title="Your saved films live with your account"
        description="Sign in (or create a free account) to keep a personal watchlist, like films, and connect with Co-Stars. Demo mode stores everything in this browser only."
        action={<ButtonLink href="/auth">Sign in to save films</ButtonLink>}
      />
    );
  }

  const byId = new Map(movies.map((m) => [m.id, m]));
  const saved = community.user.saved.flatMap((id) => {
    const movie = byId.get(id);
    return movie ? [movie] : [];
  });
  const unknownCount = community.user.saved.length - saved.length;

  return (
    <div className="mt-10">
      {community.state.status === "unavailable" ? (
        <StatusNote className="mb-6">
          Browser storage is unavailable, so changes last only until this tab is closed.
        </StatusNote>
      ) : null}
      {unknownCount > 0 ? (
        <StatusNote className="mb-6">
          {unknownCount} saved {unknownCount === 1 ? "item is" : "items are"} not in the current
          sample catalogue and {unknownCount === 1 ? "is" : "are"} not shown.
        </StatusNote>
      ) : null}
      {saved.length > 0 ? (
        <p role="status" className="mb-5 flex items-center gap-2 text-sm text-bone-muted">
          <Bookmark className="size-4 text-neon-green" aria-hidden="true" />
          {saved.length} saved {saved.length === 1 ? "film" : "films"}
        </p>
      ) : null}
      <MovieShelf
        movies={saved}
        emptyTitle="Nothing saved yet"
        emptyDescription="Tap the bookmark on any film in Discover to keep it here. Your saved list is private unless you choose to share it on your profile."
        emptyAction={<ButtonLink href="/discover">Go to Discover</ButtonLink>}
      />
    </div>
  );
}