import type { Genre } from "@/lib/movies/types";
import { cn } from "@/lib/utils";

interface GenreFilterProps {
  genres: readonly Genre[];
  selected: readonly Genre[];
  onToggle: (genre: Genre) => void;
}

/** Toggle chips. A film matches if it has ANY selected genre; none selected means all films. */
export function GenreFilter({ genres, selected, onToggle }: GenreFilterProps) {
  return (
    <div role="group" aria-label="Filter by genre" className="flex flex-wrap gap-2">
      {genres.map((genre) => {
        const active = selected.includes(genre);
        return (
          <button
            key={genre}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(genre)}
            className={cn(
              "h-9 rounded-full border px-3.5 text-xs font-medium transition-colors",
              active
                ? "border-gold bg-gold/10 text-gold"
                : "border-line-strong text-bone-muted hover:border-bone-dim hover:text-bone",
            )}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
}
