/**
 * Explanations are generated from the SAME per-dimension numbers that produce the score
 * (see scoreMovie), so what the interface says always matches how a film was ranked.
 * Nothing here is free-form or invented: every sentence is built from a preference value,
 * a curated rating, and their distance.
 */
import { MOOD_DIMENSIONS, type MoodDimension, type MoodPreferences } from "@/lib/mood-dimensions";
import type { Genre, Movie } from "@/lib/movies/types";
import { scoreMovie, type DimensionScore } from "./mood-score";

export type MatchLevel = "close" | "partial" | "far";

/** Distance thresholds on the 0..100 scale. */
export const CLOSE_MAX_DIFFERENCE = 15;
export const PARTIAL_MAX_DIFFERENCE = 35;

export function matchLevel(difference: number): MatchLevel {
  if (difference <= CLOSE_MAX_DIFFERENCE) return "close";
  if (difference <= PARTIAL_MAX_DIFFERENCE) return "partial";
  return "far";
}

/** Plain-language position on a spectrum, e.g. "very dark", "leaning hopeful", "balanced". */
export function describePosition(dimension: MoodDimension, value: number): string {
  const low = dimension.low.toLowerCase();
  const high = dimension.high.toLowerCase();
  if (value <= 20) return `very ${low}`;
  if (value <= 40) return `leaning ${low}`;
  if (value < 60) return "balanced";
  if (value < 80) return `leaning ${high}`;
  return `very ${high}`;
}

export interface DimensionExplanation {
  dimension: MoodDimension;
  level: MatchLevel;
  preference: number;
  rating: number;
  difference: number;
  /** One sentence built from the numbers above. */
  summary: string;
}

export interface Explanation {
  /** All scored dimensions in canonical order. */
  dimensions: DimensionExplanation[];
  close: DimensionExplanation[];
  partial: DimensionExplanation[];
  far: DimensionExplanation[];
  /** Genres shared between the film and the active genre filter (empty when no filter). */
  genreMatches: Genre[];
}

function describeLevel(level: MatchLevel): string {
  if (level === "close") return "a close match";
  if (level === "partial") return "a partial match";
  return "a clear mismatch";
}

function explainDimension(score: DimensionScore): DimensionExplanation {
  const dimension = MOOD_DIMENSIONS.find((d) => d.id === score.dimension)!;
  const level = matchLevel(score.difference);
  const you = `${describePosition(dimension, score.preference)} (${Math.round(score.preference)})`;
  const film = `${describePosition(dimension, score.rating)} (${score.rating})`;
  return {
    dimension,
    level,
    preference: score.preference,
    rating: score.rating,
    difference: score.difference,
    summary: `${dimension.name}: you chose ${you}; this film is rated ${film}. That is ${describeLevel(level)}.`,
  };
}

export function explainMovie(
  movie: Movie,
  preferences: MoodPreferences,
  activeGenres: readonly Genre[] = [],
): Explanation {
  const dimensions = scoreMovie(movie, preferences).dimensions.map(explainDimension);
  return {
    dimensions,
    close: dimensions.filter((d) => d.level === "close"),
    partial: dimensions.filter((d) => d.level === "partial"),
    far: dimensions.filter((d) => d.level === "far"),
    genreMatches: movie.genres.filter((g) => activeGenres.includes(g)),
  };
}

/** Plain-language label for a film's pacing rating (0 = very slow, 100 = relentless). */
export function describePacing(pacing: number): string {
  if (pacing <= 25) return "slow";
  if (pacing <= 60) return "moderate";
  return "fast";
}
