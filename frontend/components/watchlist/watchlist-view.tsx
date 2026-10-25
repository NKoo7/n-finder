"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusNote } from "@/components/ui/status-note";
import { MovieCard } from "@/components/movies/movie-card";
import { MovieDetailDialog } from "@/components/movies/movie-detail-dialog";
import type { Movie } from "@/lib/movies/types";
import { useHydrated, useWatchlist } from "@/lib/watchlist/use-watchlist";
import { WatchlistNotice } from "./watchlist-notice";

export function WatchlistView({ movies }: { movies: readonly Movie[] }) {
  const hydrated = useHydrated();
  const watchlist = useWatchlist();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // The server cannot know what is in this browser's storage, so render nothing for the list
  // until hydrated instead of flashing a wrong "Nothing saved yet".
  if (!hydrated) return <div className="mt-10 min-h-40" aria-hidden="true" />;

  const byId = new Map(movies.map((m) => [m.id, m]));
  const saved = watchlist.state.ids.flatMap((id) => {
    const movie = byId.get(id);
    return movie ? [movie] : [];
  });
  const unknownCount = watchlist.state.ids.length - saved.length;
  const selected = selectedId ? (byId.get(selectedId) ?? null) : null;

  return (
    <div className="mt-10">
      <WatchlistNotice status={watchlist.state.status} className="mb-6" />
      {unknownCount > 0 ? (
        <StatusNote className="mb-6">
          {unknownCount} saved {unknownCount === 1 ? "item is" : "items are"} not in the current
          sample catalogue and {unknownCount === 1 ? "is" : "are"} not shown.
        </StatusNote>
      ) : null}

      {saved.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Use the bookmark on any film in Discover to save it here. Your list is stored in this browser only."
          action={<ButtonLink href="/discover">Go to Discover</ButtonLink>}
        />
      ) : (
        <>
          <p role="status" className="mb-5 text-sm text-bone-muted">
            {saved.length} saved {saved.length === 1 ? "film" : "films"}
          </p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {saved.map((movie) => (
              <li key={movie.id} className="h-full">
                <MovieCard
                  movie={movie}
                  saved
                  onOpen={(m) => setSelectedId(m.id)}
                  onToggleSave={(m) => watchlist.remove(m.id)}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      <MovieDetailDialog
        movie={selected}
        saved={selected ? watchlist.has(selected.id) : false}
        onToggleSave={(m) => watchlist.toggle(m.id)}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
