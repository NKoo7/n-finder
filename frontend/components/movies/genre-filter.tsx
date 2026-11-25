import type { Genre } from "@/lib/movies/types";
import { cn } from "@/lib/utils";

interface GenreFilterProps {
  genres: readonly Genre[];
  selected: readonly Genre[];
  onToggle: (genre: Genre) => void;
}

/** Toggle chips. A film matches if it has ANY selected genre; none selected means all films. */
const CHIP_COLORS = [
  "border-neon-violet bg-neon-violet/15 text-neon-violet",
  "border-neon-pink bg-neon-pink/15 text-neon-pink",
  "border-neon-cyan bg-neon-cyan/15 text-neon-cyan",
  "border-neon-amber bg-neon-amber/15 text-neon-amber",
  "border-neon-green bg-neon-green/15 text-neon-green",
] as const;

export function GenreFilter({ genres, selected, onToggle }: GenreFilterProps) {
  return (
    <div role="group" aria-label="Filter by genre" className="flex flex-wrap gap-2">
      {genres.map((genre, i) => {
        const active = selected.includes(genre);
        return (
          <button
            key={genre}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(genre)}
            className={cn(
              "h-9 rounded-full border px-3.5 text-xs font-medium transition-all duration-200 hover:scale-105 motion-reduce:transition-none",
              active
                ? CHIP_COLORS[i % CHIP_COLORS.length]
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
