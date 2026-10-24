/**
 * The five preference dimensions of the Cinematic Mood Engine.
 *
 * Each dimension is a spectrum with a "low" pole (value 0) and a "high" pole (value 1),
 * written in the same left-to-right order as the product spec. This is product copy only:
 * it carries no scoring logic. The recommendation engine (a later milestone) will own the
 * numeric semantics and the TypeScript/Pydantic types will be aligned at the API boundary.
 */
export type MoodDimensionId =
  | "tone"
  | "intensity"
  | "realism"
  | "focus"
  | "predictability";

export interface MoodDimension {
  id: MoodDimensionId;
  low: string;
  high: string;
  /** One sentence describing what the spectrum is about. */
  description: string;
}

export const MOOD_DIMENSIONS: readonly MoodDimension[] = [
  {
    id: "tone",
    low: "Dark",
    high: "Hopeful",
    description: "The emotional weather of the film, from bleak to uplifting.",
  },
  {
    id: "intensity",
    low: "Relaxing",
    high: "Intense",
    description: "How much the film asks of your nerves and attention.",
  },
  {
    id: "realism",
    low: "Realistic",
    high: "Surreal",
    description: "How closely the world follows the rules of everyday life.",
  },
  {
    id: "focus",
    low: "Character-driven",
    high: "Plot-driven",
    description: "Whether people or events carry the story.",
  },
  {
    id: "predictability",
    low: "Predictable",
    high: "Unpredictable",
    description: "How comfortably you can see where the story is heading.",
  },
] as const;
