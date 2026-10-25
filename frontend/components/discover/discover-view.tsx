"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchField } from "@/components/ui/search-field";
import { StatusNote } from "@/components/ui/status-note";
import { MoodPanel } from "@/components/mood/mood-panel";
import { GenreFilter } from "@/components/movies/genre-filter";
import { MovieCard } from "@/components/movies/movie-card";
import { MovieDetailDialog } from "@/components/movies/movie-detail-dialog";
import { WatchlistNotice } from "@/components/watchlist/watchlist-notice";
import {
  DEFAULT_PREFERENCES,
  MOOD_DIMENSIONS,
  type MoodDimensionId,
  type MoodPreferences,
} from "@/lib/mood-dimensions";
import { availableGenres, filterMovies } from "@/lib/movies/filter";
import { SAMPLE_DATASET_LABEL } from "@/lib/movies/sample-movies";
import type { Genre, Movie } from "@/lib/movies/types";
import { rankMovies } from "@/lib/scoring/mood-score";
import { useWatchlist } from "@/lib/watchlist/use-watchlist";

interface DiscoverViewProps {
  movies: readonly Movie[];
}

const isDefaultMood = (p: MoodPreferences) =>
  MOOD_DIMENSIONS.every((d) => p[d.id] === DEFAULT_PREFERENCES[d.id]);

export function DiscoverView({ movies }: DiscoverViewProps) {
  const [preferences, setPreferences] = useState<MoodPreferences>({ ...DEFAULT_PREFERENCES });
  const [query, setQuery] = useState("");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const watchlist = useWatchlist();

  const allGenres = useMemo(() => availableGenres(movies), [movies]);

  // Rank everything by mood, then keep only films that pass search + genre. Ranking first
  // means the order never depends on the filters, so identical inputs give identical lists.
  const visible = useMemo(() => {
    const ranked = rankMovies(movies, preferences);
    const allowed = new Set(filterMovies(movies, query, genres).map((m) => m.id));
    return ranked.filter((s) => allowed.has(s.movie.id));
  }, [movies, preferences, query, genres]);

  const selected = selectedId ? (movies.find((m) => m.id === selectedId) ?? null) : null;
  const filtersActive = query.trim() !== "" || genres.length > 0;

  const setDimension = (dimension: MoodDimensionId, value: number) =>
    setPreferences((prev) => ({ ...prev, [dimension]: value }));
  const toggleGenre = (genre: Genre) =>
    setGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]));
  const clearFilters = () => {
    setQuery("");
    setGenres([]);
  };
  const toggleSave = (movie: Movie) => watchlist.toggle(movie.id);

  return (
    <>
      <StatusNote className="mt-8">{SAMPLE_DATASET_LABEL}</StatusNote>
      <WatchlistNotice status={watchlist.state.status} className="mt-3" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[22rem_1fr] lg:items-start lg:gap-12">
        <MoodPanel
          preferences={preferences}
          onChange={setDimension}
          onReset={() => setPreferences({ ...DEFAULT_PREFERENCES })}
          isDefault={isDefaultMood(preferences)}
          className="lg:sticky lg:top-24"
        />

        <div className="min-w-0">
          <div className="space-y-4">
            <SearchField
              id="movie-search"
              label="Search films by title"
              placeholder="Search films by title"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              autoComplete="off"
            />
            <GenreFilter genres={allGenres} selected={genres} onToggle={toggleGenre} />
          </div>

          <div className="mb-5 mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-gold">Results</h2>
            <p role="status" className="text-sm text-bone-muted">
              {visible.length} of {movies.length} films, ranked by relative compatibility with your mood
            </p>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              title="No films match"
              description={
                filtersActive
                  ? "Nothing in the sample catalogue matches your current search and genre filters. Try a shorter title, or remove a genre."
                  : "There are no films to show."
              }
              action={
                filtersActive ? (
                  <Button variant="outline" onClick={clearFilters}>
                    <SearchX aria-hidden="true" className="mr-2 size-4" />
                    Clear search and genres
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
              {visible.map(({ movie, score }) => (
                <li key={movie.id} className="h-full">
                  <MovieCard
                    movie={movie}
                    score={score}
                    saved={watchlist.has(movie.id)}
                    onOpen={(m) => setSelectedId(m.id)}
                    onToggleSave={toggleSave}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <MovieDetailDialog
        movie={selected}
        preferences={preferences}
        activeGenres={genres}
        saved={selected ? watchlist.has(selected.id) : false}
        onToggleSave={toggleSave}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
