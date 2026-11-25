"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { MovieCard } from "@/components/movies/movie-card";
import { MovieDetailDialog } from "@/components/movies/movie-detail-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { likeCount } from "@/lib/community/logic";
import { useCommunity } from "@/lib/community/use-community";
import type { Movie } from "@/lib/movies/types";

/** A grid of films with the shared detail dialog; like/save require an account. */
export function MovieShelf({
  movies,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: {
  movies: readonly Movie[];
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: ReactNode;
}) {
  const router = useRouter();
  const community = useCommunity();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? (movies.find((m) => m.id === selectedId) ?? null) : null;

  const requireAuth = () => {
    if (!community.user) {
      router.push("/auth");
      return false;
    }
    return true;
  };
  const toggleSave = (movie: Movie) => {
    if (requireAuth()) community.toggleSave(movie.id);
  };
  const toggleLike = (movie: Movie) => {
    if (requireAuth()) community.toggleLike(movie.id);
  };

  if (movies.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {movies.map((movie) => (
          <li key={movie.id} className="h-full">
            <MovieCard
              movie={movie}
              saved={community.hasSaved(movie.id)}
              liked={community.hasLiked(movie.id)}
              likeCount={likeCount(community.state, movie.id)}
              onOpen={(m) => setSelectedId(m.id)}
              onToggleSave={toggleSave}
              onToggleLike={toggleLike}
            />
          </li>
        ))}
      </ul>
      <MovieDetailDialog
        movie={selected}
        allMovies={movies}
        saved={selected ? community.hasSaved(selected.id) : false}
        liked={selected ? community.hasLiked(selected.id) : false}
        likeCount={selected ? likeCount(community.state, selected.id) : 0}
        onToggleSave={toggleSave}
        onToggleLike={toggleLike}
        onOpen={(m) => setSelectedId(m.id)}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}