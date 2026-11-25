"use client";

import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";
import { becauseYouLiked } from "@/lib/community/logic";
import { useCommunity } from "@/lib/community/use-community";
import type { Movie } from "@/lib/movies/types";
import { MoviePoster } from "./movie-poster";
import { RatingBadges } from "./rating-badges";

/**
 * Personal recommendations with a plain-language reason per pick. The row scrolls
 * horizontally with snap points; cards keep the same poster language as the grid.
 */
export function BecauseYouLiked({
  movies,
  onOpen,
}: {
  movies: readonly Movie[];
  onOpen: (movie: Movie) => void;
}) {
  const { user } = useCommunity();
  if (!user || user.liked.length === 0) return null;
  const picks = becauseYouLiked(user.liked, movies, 8);
  if (picks.length === 0) return null;

  return (
    <section aria-labelledby="because-title" className="mt-10">
      <div className="flex items-baseline gap-3">
        <Sparkles aria-hidden="true" className="size-4 self-center text-neon-pink" />
        <h2 id="because-title" className="font-display text-2xl text-bone">
          Because you liked<span className="text-aurora italic">&hellip;</span>
        </h2>
        <p className="hidden text-xs text-bone-dim sm:block">
          {user.liked.length} {user.liked.length === 1 ? "like" : "likes"} shaping these picks
        </p>
      </div>
      <ul className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
        {picks.map(({ movie, reason }) => (
          <li key={movie.id} className="w-40 shrink-0 snap-start sm:w-44">
            <button
              type="button"
              onClick={() => onOpen(movie)}
              className="group block w-full text-left"
            >
              <MoviePoster movie={movie} className="transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none" />
              <p className="mt-2 font-display text-lg leading-tight text-bone transition-colors group-hover:text-neon-violet">
                {movie.title}
              </p>
            </button>
            <RatingBadges movieId={movie.id} size="sm" className="mt-1.5" />
            <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-snug text-bone-muted">
              <Heart aria-hidden="true" className="mt-0.5 size-3 shrink-0 text-neon-pink" />
              {reason}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-bone-dim">
        Picks come from shared genres, people and mood overlap with your likes.{" "}
        <Link href="/profile" className="text-neon-violet hover:underline">
          Manage your likes
        </Link>
        .
      </p>
    </section>
  );
}