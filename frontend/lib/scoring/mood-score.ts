/**
 * Client-side mood scoring (deterministic, no randomness, no machine learning).
 *
 * For each dimension d, with user preference p (0..100) and film rating a (0..100):
 *
 *   closeness_d = 1 - |p - a| / 100                     in [0, 1]; 1 = identical
 *   weight_d    = 1 + 2 * |p - 50| / 50                 in [1, 3]
 *
 * A slider left at the balanced default (50) still counts with weight 1, so ranking favours
 * films that sit near the middle of that dimension. A slider pushed to an extreme counts up
 * to 3x, so strong preferences dominate. The compatibility score is the weighted mean of
 * closeness, scaled to 0..100:
 *
 *   score = 100 * sum(weight_d * closeness_d) / sum(weight_d)
 *
 * IMPORTANT: this is a RELATIVE compatibility score between the current slider settings and
 * the curated demo ratings. It is not a probability that anyone will enjoy a film.
 *
 * Safety: preferences are clamped to 0..100 (NaN becomes 50). A film dimension that is
 * missing or not finite is skipped for that film, not treated as zero.
 *
 * Ordering is fully deterministic: score descending, then title (A-Z), then id.
 */
import {
  MOOD_DIMENSIONS,
  MOOD_NEUTRAL,
  MOOD_SCALE_MAX,
  MOOD_SCALE_MIN,
  type MoodDimensionId,
  type MoodPreferences,
} from "@/lib/mood-dimensions";
import type { Movie } from "@/lib/movies/types";

export interface DimensionScore {
  dimension: MoodDimensionId;
  /** Sanitised user preference, 0..100. */
  preference: number;
  /** Film rating, 0..100. */
  rating: number;
  /** Absolute distance |preference - rating|, 0..100. */
  difference: number;
  /** 0..1, higher is closer. */
  closeness: number;
  /** 1..3, larger when the user pushed the slider away from balanced. */
  weight: number;
}

export interface ScoredMovie {
  movie: Movie;
  /** Relative compatibility, 0..100, rounded for display. */
  score: number;
  /** Unrounded score used for sorting. */
  rawScore: number;
  /** Only dimensions that could be scored for this film. */
  dimensions: DimensionScore[];
}

export function sanitizePreference(value: number): number {
  if (!Number.isFinite(value)) return MOOD_NEUTRAL;
  return Math.min(MOOD_SCALE_MAX, Math.max(MOOD_SCALE_MIN, value));
}

export function dimensionWeight(preference: number): number {
  return 1 + (2 * Math.abs(sanitizePreference(preference) - MOOD_NEUTRAL)) / MOOD_NEUTRAL;
}

export function scoreMovie(movie: Movie, preferences: MoodPreferences): ScoredMovie {
  const dimensions: DimensionScore[] = [];
  for (const { id } of MOOD_DIMENSIONS) {
    const rating = movie.mood?.[id];
    if (typeof rating !== "number" || !Number.isFinite(rating)) continue;
    const preference = sanitizePreference(preferences[id]);
    const difference = Math.abs(preference - rating);
    dimensions.push({
      dimension: id,
      preference,
      rating,
      difference,
      closeness: 1 - difference / MOOD_SCALE_MAX,
      weight: dimensionWeight(preference),
    });
  }

  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
  const rawScore =
    totalWeight === 0
      ? 0
      : (100 * dimensions.reduce((sum, d) => sum + d.weight * d.closeness, 0)) / totalWeight;

  return { movie, score: Math.round(rawScore), rawScore, dimensions };
}

/** Score and order films. Pure: does not mutate its inputs. */
export function rankMovies(
  movies: readonly Movie[],
  preferences: MoodPreferences,
): ScoredMovie[] {
  return movies
    .map((movie) => scoreMovie(movie, preferences))
    .sort(
      (a, b) =>
        b.rawScore - a.rawScore ||
        a.movie.title.localeCompare(b.movie.title, "en") ||
        a.movie.id.localeCompare(b.movie.id, "en"),
    );
}
