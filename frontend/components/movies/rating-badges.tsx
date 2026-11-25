import { catalogMeta } from "@/lib/movies/catalog-meta";
import { cn } from "@/lib/utils";

/**
 * Clearly labelled IMDb / Rotten Tomatoes scores. Values come from the sample metadata
 * map (general-knowledge snapshots); missing values render as "n/a", never invented.
 */
export function RatingBadges({
  movieId,
  size = "md",
  className,
}: {
  movieId: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = catalogMeta(movieId);
  const text = size === "sm" ? "text-[0.62rem]" : "text-xs";
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <span
        title="IMDb rating (sample data, out of 10)"
        className={cn(
          "inline-flex items-center gap-1 rounded-md border border-neon-green/40 bg-neon-green/10 px-1.5 py-0.5 font-mono font-semibold text-neon-green",
          text,
        )}
      >
        IMDb {meta.imdb !== null ? meta.imdb.toFixed(1) : "n/a"}
      </span>
      <span
        title="Rotten Tomatoes critics score (sample data)"
        className={cn(
          "inline-flex items-center gap-1 rounded-md border border-neon-pink/40 bg-neon-pink/10 px-1.5 py-0.5 font-mono font-semibold text-neon-pink",
          text,
        )}
      >
        RT {meta.rt !== null ? `${meta.rt}%` : "n/a"}
      </span>
    </div>
  );
}