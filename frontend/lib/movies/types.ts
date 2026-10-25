import type { MoodProfile } from "@/lib/mood-dimensions";

export const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Drama",
  "Family",
  "Fantasy",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
] as const;

export type Genre = (typeof GENRES)[number];

/**
 * One film in the local sample catalogue.
 *
 * Verifiability:
 *  - `title`, `year`, `directors`: general-knowledge facts, NOT verified against an external
 *    database in this build.
 *  - `genres`, `themes`, `synopsis`: the project's own short wording and classification.
 *  - `mood` and `pacing`: subjective CURATED DEMO CLASSIFICATIONS, not objective facts.
 */
export interface Movie {
  /** Stable, URL-safe identifier. Persisted in the watchlist, so never rename an existing id. */
  id: string;
  title: string;
  year: number;
  directors: readonly string[];
  genres: readonly Genre[];
  /** One or two original sentences; deliberately spoiler-light. */
  synopsis: string;
  /** Five dimensions on the 0..100 scale documented in lib/mood-dimensions.ts. */
  mood: MoodProfile;
  /** 0 = very slow and contemplative, 100 = relentless. Descriptive only; not scored yet. */
  pacing: number;
  /** Short lowercase theme tags. Descriptive only; not scored yet. */
  themes: readonly string[];
  /** Only set when a reliable, licensed image source exists. None are set in this build. */
  posterUrl?: string;
}
