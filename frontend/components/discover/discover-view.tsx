"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchField } from "@/components/ui/search-field";
import { StatusNote } from "@/components/ui/status-note";
import { MoodPanel } from "@/components/mood/mood-panel";
import { GenreFilter } from "@/components/movies/genre-filter";
import { MovieCard } from "@/components/movies/movie-card";
import { MovieDetailDialog } from "@/components/movies/movie-detail-dialog";
import { BecauseYouLiked } from "@/components/movies/because-you-liked";
import { WildcardPanel } from "./wildcard-panel";
import {
  DEFAULT_PREFERENCES,
  MOOD_DIMENSIONS,
  type MoodDimensionId,
  type MoodPreferences,
} from "@/lib/mood-dimensions";
import { availableGenres, filterMovies } from "@/lib/movies/filter";
import { RATINGS_LABEL, searchCatalog } from "@/lib/movies/catalog-meta";
import { SAMPLE_DATASET_LABEL } from "@/lib/movies/sample-movies";
import type { Genre, Movie } from "@/lib/movies/types";
import { likeCount } from "@/lib/community/logic";
import { useCommunity } from "@/lib/community/use-community";
import { rankMovies } from "@/lib/scoring/mood-score";
import { useRanking } from "@/lib/use-ranking";

interface DiscoverViewProps {
  movies: readonly Movie[];
}

const isDefaultMood = (p: MoodPreferences) =>
  MOOD_DIMENSIONS.every((d) => p[d.id] === DEFAULT_PREFERENCES[d.id]);

export function DiscoverView({ movies }: DiscoverViewProps) {
  const router = useRouter();
  const community = useCommunity();
  const [preferences, setPreferences] = useState<MoodPreferences>({ ...DEFAULT_PREFERENCES });
  const [query, setQuery] = useState("");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allGenres = useMemo(() => availableGenres(movies), [movies]);

  // The backend engine is the source of truth while reachable; otherwise the identical
  // built-in scorer is used (a parity test keeps the two in step) and the UI says which.
  const engine = useRanking(preferences);
  const localRanking = useMemo(() => rankMovies(movies, preferences), [movies, preferences]);
  const ranking = useMemo(() => {
    if (!engine.results) return localRanking;
    const byId = new Map(movies.map((m) => [m.id, m]));
    const fromServer = engine.results.flatMap((r) => {
      const movie = byId.get(r.movie.id);
      return movie ? [{ movie, score: r.score }] : [];
    });
    return fromServer.length === movies.length ? fromServer : localRanking;
  }, [engine.results, localRanking, movies]);

  // Search spans title, cast and director; filters only remove films, never reorder.
  const visible = useMemo(() => {
    const searched = new Set(searchCatalog(movies, query).map((m) => m.id));
    const allowed = new Set(filterMovies(movies, "", genres).map((m) => m.id));
    return ranking.filter((s) => searched.has(s.movie.id) && allowed.has(s.movie.id));
  }, [movies, ranking, query, genres]);

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

  // Liking and saving require an account; signed-out clicks go straight to the door.
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

  return (
    <>
      <StatusNote className="mt-8">{SAMPLE_DATASET_LABEL}</StatusNote>
      <StatusNote className="mt-3">{RATINGS_LABEL}</StatusNote>

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
              label="Search films by title, actor or director"
              placeholder="Search title, actor, actress or director..."
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              autoComplete="off"
            />
            <GenreFilter genres={allGenres} selected={genres} onToggle={toggleGenre} />
          </div>

          <BecauseYouLiked movies={movies} onOpen={(m) => setSelectedId(m.id)} />

          <WildcardPanel movies={movies} preferences={preferences} genres={genres} onOpen={(m) => setSelectedId(m.id)} />

          <div className="mb-5 mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-neon-green">Results</h2>
            <p role="status" className="text-sm text-bone-muted">
              {visible.length} of {movies.length} films, ranked by relative compatibility with your mood
            </p>
            <p className="basis-full text-xs text-bone-dim">
              {engine.error
                ? `Ranking engine: built-in offline copy (${engine.error}).`
                : engine.loading
                  ? "Ranking engine: updating from the server..."
                  : "Ranking engine: server."}
            </p>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              title="No films match"
              description={
                filtersActive
                  ? "Nothing in the sample catalogue matches your current search and genre filters. Try a shorter name, or remove a genre."
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
            <MotionConfig reducedMotion="user">
              <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {visible.map(({ movie, score }) => (
                    <motion.li
                      key={movie.id}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 260, damping: 28 }}
                      className="h-full"
                    >
                      <MovieCard
                        movie={movie}
                        score={score}
                        saved={community.hasSaved(movie.id)}
                        liked={community.hasLiked(movie.id)}
                        likeCount={likeCount(community.state, movie.id)}
                        onOpen={(m) => setSelectedId(m.id)}
                        onToggleSave={toggleSave}
                        onToggleLike={toggleLike}
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </MotionConfig>
          )}
        </div>
      </div>

      <MovieDetailDialog
        movie={selected}
        preferences={preferences}
        activeGenres={genres}
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