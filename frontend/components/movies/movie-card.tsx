import { Bookmark } from "lucide-react";
import type { Movie } from "@/lib/movies/types";
import { cn } from "@/lib/utils";
import { CompatibilityMeter } from "./compatibility-meter";
import { MoviePoster } from "./movie-poster";

interface MovieCardProps {
  movie: Movie;
  /** Relative compatibility 0..100. Omit where no mood settings apply (e.g. the watchlist). */
  score?: number;
  saved: boolean;
  onOpen: (movie: Movie) => void;
  onToggleSave: (movie: Movie) => void;
  className?: string;
}

/**
 * The title is the card's single "open details" control; an overlay makes the whole card
 * clickable without nesting interactive elements. The save button sits above that overlay.
 */
export function MovieCard({
  movie,
  score,
  saved,
  onOpen,
  onToggleSave,
  className,
}: MovieCardProps) {
  return (
    <article className={cn("group relative flex h-full flex-col gap-3", className)}>
      <div className="relative">
        <MoviePoster
          movie={movie}
          className="transition-colors duration-200 group-hover:border-gold-deep"
        />
        <button
          type="button"
          aria-pressed={saved}
          aria-label={
            saved
              ? `Remove ${movie.title} from watchlist`
              : `Save ${movie.title} to watchlist`
          }
          onClick={() => onToggleSave(movie)}
          className="absolute right-2 top-2 z-10 inline-flex size-10 items-center justify-center rounded-full border border-line-strong bg-ink-950/85 text-bone-muted transition-colors hover:border-gold hover:text-gold"
        >
          <Bookmark
            aria-hidden="true"
            className={cn("size-[1.1rem]", saved && "fill-gold text-gold")}
          />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <h3 className="font-display text-xl leading-tight text-bone">
          <button
            type="button"
            onClick={() => onOpen(movie)}
            className="text-left transition-colors after:absolute after:inset-0 after:rounded-xl group-hover:text-gold focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-gold"
          >
            {movie.title}
          </button>
        </h3>
        <p className="text-xs leading-relaxed text-bone-muted">
          {movie.year} &middot; {movie.genres.slice(0, 2).join(", ")}
        </p>
        {score !== undefined ? <CompatibilityMeter score={score} className="mt-auto pt-1.5" /> : null}
      </div>
    </article>
  );
}
