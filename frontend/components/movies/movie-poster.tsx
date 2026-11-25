import type { Movie } from "@/lib/movies/types";
import { posterArt, posterPalette } from "@/lib/movies/poster-art";
import { cn } from "@/lib/utils";

type PosterMovie = Pick<Movie, "id" | "title" | "year" | "posterUrl">;

interface MoviePosterProps {
  movie: PosterMovie;
  className?: string;
}

/**
 * Poster with graceful fallback. Generated art (deterministic per film id) is always rendered
 * underneath; if `posterUrl` is set, the image sits on top and hides itself if it fails to
 * load, revealing the fallback again. No film in the sample catalogue has a posterUrl yet.
 */
export function MoviePoster({ movie, className }: MoviePosterProps) {
  const art = posterArt(movie.id);
  const palette = posterPalette(movie.id);
  const gradientId = `poster-grad-${movie.id}`;
  return (
    <div
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-line-strong/60 bg-ink-800",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 200 300"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full transition-transform duration-500 ease-[var(--ease-cine)] group-hover:scale-110 motion-reduce:transition-none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor={palette.from} />
            <stop offset="0.55" stopColor={palette.via} />
            <stop offset="1" stopColor={palette.to} />
          </linearGradient>
        </defs>
        <rect width="200" height="300" fill={`url(#${gradientId})`} />
        {art.shapes.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fillOpacity={Math.min(0.5, s.opacity * 2.4)}
            fill={palette.accent}
          />
        ))}
        <rect
          x="-40"
          y={art.horizon}
          width="280"
          height="1.5"
          transform={`rotate(${art.angle} 100 ${art.horizon})`}
          fill={palette.accent}
          fillOpacity="0.8"
        />
        <rect
          x="8"
          y="8"
          width="184"
          height="284"
          rx="6"
          fill="none"
          strokeWidth="0.75"
          stroke={palette.accent}
          strokeOpacity="0.35"
        />
      </svg>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent p-3.5 pt-12"
      >
        <p className="font-display text-xl leading-[1.05] text-bone line-clamp-3">
          {movie.title}
        </p>
        <p className="mt-1 font-mono text-[0.65rem] tracking-[0.18em] text-gold">
          {movie.year}
        </p>
      </div>
      {movie.posterUrl ? (
        // Plain <img>: poster hosts are arbitrary and unconfigured for next/image, and the
        // onError handler is what makes the fallback above reappear.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={movie.posterUrl}
          alt={`Poster for ${movie.title}`}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
    </div>
  );
}
