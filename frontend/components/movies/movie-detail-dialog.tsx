"use client";

import { useEffect, useRef } from "react";
import { Bookmark, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOOD_DIMENSIONS, type MoodPreferences } from "@/lib/mood-dimensions";
import type { Genre, Movie } from "@/lib/movies/types";
import {
  describePacing,
  describePosition,
  explainMovie,
  type DimensionExplanation,
} from "@/lib/scoring/explain";
import { scoreMovie } from "@/lib/scoring/mood-score";
import { CompatibilityMeter } from "./compatibility-meter";
import { MoviePoster } from "./movie-poster";

interface MovieDetailDialogProps {
  /** The film to show, or null when closed. */
  movie: Movie | null;
  /** Current mood settings. Omit to show the film's curated profile without a fit score. */
  preferences?: MoodPreferences;
  activeGenres?: readonly Genre[];
  saved: boolean;
  onToggleSave: (movie: Movie) => void;
  onClose: () => void;
}

/** Tiny two-marker track: filled gold dot = the film, ringed dot = your setting. */
function MoodTrack({ rating, preference }: { rating: number; preference?: number }) {
  return (
    <div aria-hidden="true" className="relative mt-2 h-1.5 rounded-full bg-line-strong">
      <span
        className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold"
        style={{ left: `${rating}%` }}
      />
      {preference !== undefined ? (
        <span
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bone bg-transparent"
          style={{ left: `${preference}%` }}
        />
      ) : null}
    </div>
  );
}

function ExplanationGroup({
  title,
  items,
}: {
  title: string;
  items: readonly DimensionExplanation[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-5 first:mt-0">
      <h4 className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-gold">{title}</h4>
      <ul className="mt-2 divide-y divide-line">
        {items.map((item) => (
          <li key={item.dimension.id} className="py-3 first:pt-1">
            <p className="text-sm leading-relaxed text-bone-muted">{item.summary}</p>
            <MoodTrack rating={item.rating} preference={item.preference} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MovieDetailDialog({
  movie,
  preferences,
  activeGenres = [],
  saved,
  onToggleSave,
  onClose,
}: MovieDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Native <dialog>: showModal() traps focus, makes the page inert, handles Escape, and the
  // browser returns focus to the control that opened it when the dialog closes.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (movie && !dialog.open) dialog.showModal();
    if (!movie && dialog.open) dialog.close();
  }, [movie]);

  // Stop the page behind the modal from scrolling.
  useEffect(() => {
    if (!movie) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [movie]);

  const scored = movie && preferences ? scoreMovie(movie, preferences) : null;
  const explanation =
    movie && preferences ? explainMovie(movie, preferences, activeGenres) : null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="movie-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        // Clicks on the backdrop target the <dialog> element itself.
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto h-dvh max-h-none w-full max-w-none overflow-hidden border border-line bg-ink-900 p-0 text-bone backdrop:bg-black/75 sm:h-auto sm:max-h-[90dvh] sm:max-w-3xl sm:rounded-2xl"
    >
      {movie ? (
        <div className="flex h-dvh flex-col sm:h-auto sm:max-h-[90dvh]">
          <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3 sm:px-7">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold">Film details</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close film details"
              className="inline-flex size-10 items-center justify-center rounded-md text-bone-muted transition-colors hover:bg-ink-800 hover:text-bone"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <div className="overflow-y-auto overscroll-contain px-5 py-6 sm:px-7 sm:py-7">
            <div className="grid gap-6 sm:grid-cols-[12rem_1fr] sm:gap-8">
              <MoviePoster movie={movie} className="mx-auto max-w-44 sm:max-w-none" />

              <div className="min-w-0">
                <h2 id="movie-dialog-title" className="font-display text-4xl leading-[1.05] text-bone">
                  {movie.title}
                </h2>
                <p className="mt-2 text-sm text-bone-muted">
                  {movie.year} &middot; Directed by {movie.directors.join(", ")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <Badge key={genre}>{genre}</Badge>
                  ))}
                </div>
                <p className="mt-5 text-base leading-relaxed text-bone-muted">{movie.synopsis}</p>

                <dl className="mt-5 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-bone-dim">
                      Pacing
                    </dt>
                    <dd className="text-bone-muted">
                      {describePacing(movie.pacing)} ({movie.pacing})
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-bone-dim">
                      Themes
                    </dt>
                    <dd className="text-bone-muted">{movie.themes.join(", ")}</dd>
                  </div>
                </dl>

                <Button
                  variant={saved ? "outline" : "primary"}
                  aria-pressed={saved}
                  onClick={() => onToggleSave(movie)}
                  className="mt-6"
                >
                  <Bookmark
                    aria-hidden="true"
                    className={saved ? "mr-2 size-4 fill-gold text-gold" : "mr-2 size-4"}
                  />
                  {saved ? "Saved to watchlist" : "Save to watchlist"}
                </Button>
              </div>
            </div>

            <section
              aria-labelledby="fit-title"
              className="mt-8 rounded-xl border border-line bg-ink-850 p-5"
            >
              {scored && explanation ? (
                <>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 id="fit-title" className="font-display text-2xl text-bone">
                      Why it ranks here
                    </h3>
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-bone-dim">
                      Gold dot: film &middot; ring: your setting
                    </p>
                  </div>
                  <CompatibilityMeter score={scored.score} className="mt-3" />
                  <p className="mt-2 text-xs leading-relaxed text-bone-dim">
                    A relative compatibility score: how closely this film&rsquo;s curated ratings line up
                    with your current mood settings, compared with the other films here. It is not a
                    probability that you will enjoy it.
                  </p>
                  {explanation.genreMatches.length > 0 ? (
                    <p className="mt-4 text-sm text-bone-muted">
                      Genre filter: matches {explanation.genreMatches.join(", ")}.
                    </p>
                  ) : null}
                  <div className="mt-5">
                    <ExplanationGroup title="Close matches" items={explanation.close} />
                    <ExplanationGroup title="Partial matches" items={explanation.partial} />
                    <ExplanationGroup title="Potential mismatches" items={explanation.far} />
                  </div>
                </>
              ) : (
                <>
                  <h3 id="fit-title" className="font-display text-2xl text-bone">
                    Curated mood profile
                  </h3>
                  <ul className="mt-3 divide-y divide-line">
                    {MOOD_DIMENSIONS.map((d) => (
                      <li key={d.id} className="py-3 first:pt-1">
                        <p className="text-sm text-bone-muted">
                          {d.name}: {describePosition(d, movie.mood[d.id])} ({movie.mood[d.id]})
                        </p>
                        <MoodTrack rating={movie.mood[d.id]} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className="mt-5 text-xs leading-relaxed text-bone-dim">
                Mood ratings are subjective, curated demo classifications, not facts. Year and
                director are from general knowledge and not verified against an external source.
              </p>
            </section>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
