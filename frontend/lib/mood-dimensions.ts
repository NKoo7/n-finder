/**
 * The five preference dimensions of the Cinematic Mood Engine.
 *
 * SCALE (applies to both user preferences and film ratings)
 * Every dimension is an integer from 0 to 100 between two poles:
 *   0   = the `low` pole  (left end of the slider)
 *   100 = the `high` pole (right end of the slider)
 *   50  = balanced / no lean
 *
 *   tone           0 Dark            ...  100 Hopeful
 *   intensity      0 Relaxing        ...  100 Intense
 *   realism        0 Realistic       ...  100 Surreal
 *   focus          0 Character-driven ... 100 Plot-driven
 *   predictability 0 Predictable     ...  100 Unpredictable
 *
 * The same scale is used on both sides so a preference and a film rating can be compared
 * directly (see lib/scoring/mood-score.ts). Film ratings are curated demo classifications.
 */
export type MoodDimensionId =
  | "tone"
  | "intensity"
  | "realism"
  | "focus"
  | "predictability";

export interface MoodDimension {
  id: MoodDimensionId;
  /** Short noun used in explanations, e.g. "Tone". */
  name: string;
  low: string;
  high: string;
  /** One sentence describing what the spectrum is about. */
  description: string;
}

export const MOOD_DIMENSIONS: readonly MoodDimension[] = [
  {
    id: "tone",
    name: "Tone",
    low: "Dark",
    high: "Hopeful",
    description: "The emotional weather of the film, from bleak to uplifting.",
  },
  {
    id: "intensity",
    name: "Intensity",
    low: "Relaxing",
    high: "Intense",
    description: "How much the film asks of your nerves and attention.",
  },
  {
    id: "realism",
    name: "Realism",
    low: "Realistic",
    high: "Surreal",
    description: "How closely the world follows the rules of everyday life.",
  },
  {
    id: "focus",
    name: "Story focus",
    low: "Character-driven",
    high: "Plot-driven",
    description: "Whether people or events carry the story.",
  },
  {
    id: "predictability",
    name: "Predictability",
    low: "Predictable",
    high: "Unpredictable",
    description: "How comfortably you can see where the story is heading.",
  },
] as const;

export const MOOD_SCALE_MIN = 0;
export const MOOD_SCALE_MAX = 100;
export const MOOD_NEUTRAL = 50;

/** A value from 0 to 100 for every dimension. */
export type MoodProfile = Record<MoodDimensionId, number>;

/** The user's current settings use the same shape as a film's rating. */
export type MoodPreferences = MoodProfile;

/** Balanced defaults: nothing leaning either way. */
export const DEFAULT_PREFERENCES: Readonly<MoodPreferences> = {
  tone: MOOD_NEUTRAL,
  intensity: MOOD_NEUTRAL,
  realism: MOOD_NEUTRAL,
  focus: MOOD_NEUTRAL,
  predictability: MOOD_NEUTRAL,
};
