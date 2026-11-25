import type { MoodDimensionId } from "./mood-dimensions";

/** UI accent per spectrum. Scoring logic never reads this. */
export const DIMENSION_COLORS: Record<
  MoodDimensionId,
  { from: string; to: string; text: string }
> = {
  tone: { from: "#7c3aed", to: "#a78bfa", text: "text-neon-violet" },
  intensity: { from: "#db2777", to: "#f472b6", text: "text-neon-pink" },
  realism: { from: "#2563eb", to: "#60a5fa", text: "text-neon-blue" },
  focus: { from: "#16a34a", to: "#4ade80", text: "text-neon-green" },
  predictability: { from: "#0891b2", to: "#22d3ee", text: "text-neon-cyan" },
};