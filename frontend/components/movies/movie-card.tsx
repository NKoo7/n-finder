import { Bookmark, Heart } from "lucide-react";
import type { Movie } from "@/lib/movies/types";
import { posterPalette } from "@/lib/movies/poster-art";
import { cn } from "@/lib/utils";
import { CompatibilityMeter } from "./compatibility-meter";
import { MoviePoster } from "./movie-poster";
import { RatingBadges } from "./rating-badges";

interface MovieCardProps {
  movie: Movie;
  /** Relative compatibility 0..100. Omit where no mood settings apply (e.g. the watchlist). */
  score?: number;
  saved: boolean;
  onOpen: (movie: Movie) => void;
  onToggleSave: (movie: Movie) => void;
  liked?: boolean;
  likeCount?: number;
  onToggleLike?: (movie: Movie) => void;
  className?: string;
}

/**
 * The title is the card's single "open details" control; an overlay makes the whole card
 * clickable without nesting interactive elements. Save and like sit above that overlay.
 */
export function MovieCard({
  movie,
  score,
  saved,
  onOpen,
  onToggleSave,
  liked = false,
  likeCount,
  onToggleLike,
  className,
}: MovieCardProps) {
  const palette = posterPalette(movie.id);
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col gap-3 transition-transform duration-300 ease-[var(--ease-cine)] hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-45"
          style={{ background: `linear-gradient(135deg, ${palette.via}, ${palette.accent})` }}
        />
        <MoviePoster
          movie={movie}
          className="relative transition-[border-color,box-shadow] duration-300 group-hover:border-transparent"
        />
        {onToggleLike ? (
          <button
            type="button"
            aria-pressed={liked}
            aria-label={liked ? `Unlike ${movie.title}` : `Like ${movie.title}`}
            onClick={() => onToggleLike(movie)}
            className={cn(
              "absolute left-2 top-2 z-10 inline-flex h-10 items-center gap-1.5 rounded-full border px-3 backdrop-blur-sm transition-all hover:scale-105 motion-reduce:transition-none",
              liked
                ? "border-neon-pink bg-neon-pink/25 text-neon-pink"
                : "border-white/15 bg-ink-950/70 text-bone-muted hover:border-neon-pink hover:text-neon-pink",
            )}
          >
            <Heart aria-hidden="true" className={cn("size-4", liked && "fill-neon-pink")} />
            {likeCount !== undefined ? (
              <span className="font-mono text-xs tabular-nums">{likeCount}</span>
            ) : null}
          </button>
        ) : null}
        <button
          type="button"
          aria-pressed={saved}
          aria-label={
            saved
              ? `Remove ${movie.title} from saved movies`
              : `Save ${movie.title} to your list`
          }
          onClick={() => onToggleSave(movie)}
          className="absolute right-2 top-2 z-10 inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-ink-950/70 text-bone-muted backdrop-blur-sm transition-all hover:scale-110 hover:border-neon-green hover:text-neon-green motion-reduce:transition-none"
        >
          <Bookmark
            aria-hidden="true"
            className={cn("size-[1.1rem]", saved && "fill-neon-green text-neon-green")}
          />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <h3 className="font-display text-xl leading-tight text-bone">
          <button
            type="button"
            onClick={() => onOpen(movie)}
            className="text-left transition-colors after:absolute after:inset-0 after:rounded-xl group-hover:text-neon-violet focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-neon-violet"
          >
            {movie.title}
          </button>
        </h3>
        <p className="text-xs leading-relaxed text-bone-muted">
          {movie.year} &middot; {movie.genres.slice(0, 2).join(", ")}
        </p>
        <RatingBadges movieId={movie.id} size="sm" />
        {score !== undefined ? <CompatibilityMeter score={score} className="mt-auto pt-1.5" /> : null}
      </div>
    </article>
  );
}