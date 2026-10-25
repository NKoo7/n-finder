"use client";

import { useRef, useState } from "react";
import { Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { fetchWildcard, type WildcardResult } from "@/lib/api";
import type { MoodPreferences } from "@/lib/mood-dimensions";
import type { Genre, Movie } from "@/lib/movies/types";

interface WildcardPanelProps {
  movies: readonly Movie[];
  preferences: MoodPreferences;
  genres: readonly Genre[];
  onOpen: (movie: Movie) => void;
}

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; result: WildcardResult };

/**
 * Wildcard discovery: a film OUTSIDE your usual genres that still fits your mood. The picking
 * strategy lives in the backend (see recommender.wildcard). Each press uses a new seed, so
 * repeated presses vary while the same seed would always return the same film.
 */
export function WildcardPanel({ movies, preferences, genres, onOpen }: WildcardPanelProps) {
  const [state, setState] = useState<State>({ status: "idle" });
  const seed = useRef(0);
  const abort = useRef<AbortController | null>(null);

  async function run() {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setState({ status: "loading" });
    try {
      const result = await fetchWildcard(preferences, genres, seed.current++, controller.signal);
      setState({ status: "done", result });
    } catch (error) {
      if (controller.signal.aborted) return;
      setState({ status: "error", message: error instanceof Error ? error.message : "Request failed." });
    }
  }

  const pick = state.status === "done" ? state.result.pick : null;
  const movie = pick ? movies.find((m) => m.id === pick.movie.id) : undefined;

  return (
    <Surface className="mt-8 p-5 sm:p-6" role="group" aria-labelledby="wildcard-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-xl">
          <h2 id="wildcard-title" className="font-display text-2xl text-bone">
            Wildcard
          </h2>
          <p className="mt-1 text-sm text-bone-muted">
            One film outside your usual genres that still fits your mood.
          </p>
        </div>
        <Button onClick={run} disabled={state.status === "loading"} variant="outline">
          <Dices aria-hidden="true" className="mr-2 size-4" />
          {state.status === "loading" ? "Picking..." : state.status === "done" ? "Another wildcard" : "Surprise me"}
        </Button>
      </div>

      <div aria-live="polite" className="mt-4 text-sm leading-relaxed">
        {state.status === "error" ? (
          <p className="text-danger">
            {state.message} Start the backend (see README) and try again.
          </p>
        ) : null}
        {state.status === "done" && !pick ? (
          <p className="text-bone-muted">
            No film outside your usual genres fits this mood well enough. {state.result.strategy}
          </p>
        ) : null}
        {state.status === "done" && pick ? (
          <div className="border-t border-line pt-4">
            <p className="font-display text-3xl text-bone">
              {movie?.title ?? pick.movie.title}
              {movie ? <span className="ml-2 font-mono text-xs text-gold">{movie.year}</span> : null}
            </p>
            <p className="mt-2 text-bone-muted">{pick.explanation}</p>
            <p className="mt-2 text-xs text-bone-dim">
              {state.result.strategy} Relative compatibility {pick.score}/100, not a probability of enjoyment.
            </p>
            {movie ? (
              <Button className="mt-4" onClick={() => onOpen(movie)}>
                Open details
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Surface>
  );
}
