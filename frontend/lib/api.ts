/** Small typed client for the FastAPI backend. All calls validate the response shape. */
import { MOOD_DIMENSIONS, type MoodPreferences } from "@/lib/mood-dimensions";
import type { Genre } from "@/lib/movies/types";

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly kind: "network" | "http" | "shape",
  ) {
    super(message);
  }
}

export interface ApiRecommendation {
  movie: { id: string; title: string };
  /** Relative compatibility 0..100, not a probability. */
  score: number;
  explanation: string;
  matched_genres: string[];
}

export interface WildcardResult {
  pick: ApiRecommendation | null;
  strategy: string;
  usual_genres: string[];
  candidates_considered: number;
}

async function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError("Could not reach the recommendation server.", "network");
  }
  if (!response.ok) throw new ApiError(`The server answered with an error (${response.status}).`, "http");
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError("The server sent an unreadable response.", "shape");
  }
}

const isRecommendation = (v: unknown): v is ApiRecommendation => {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  const movie = r.movie as Record<string, unknown> | undefined;
  return (
    typeof movie?.id === "string" &&
    typeof r.score === "number" &&
    typeof r.explanation === "string" &&
    Array.isArray(r.matched_genres)
  );
};

const toBody = (preferences: MoodPreferences) =>
  Object.fromEntries(MOOD_DIMENSIONS.map((d) => [d.id, preferences[d.id]]));

/** Full ranking for the given sliders (no diversity re-ranking, so it is a pure mood ranking). */
export async function fetchRanking(
  preferences: MoodPreferences,
  signal?: AbortSignal,
): Promise<ApiRecommendation[]> {
  const data = (await post("/api/recommendations", { preferences: toBody(preferences), limit: 100, diversify: false }, signal)) as {
    results?: unknown;
  };
  if (!Array.isArray(data?.results) || !data.results.every(isRecommendation)) {
    throw new ApiError("The server response had an unexpected shape.", "shape");
  }
  return data.results;
}

export async function fetchWildcard(
  preferences: MoodPreferences,
  genres: readonly Genre[],
  seed: number,
  signal?: AbortSignal,
): Promise<WildcardResult> {
  const data = (await post("/api/wildcard", { preferences: toBody(preferences), genres, seed }, signal)) as Partial<WildcardResult>;
  if (typeof data?.strategy !== "string" || !Array.isArray(data.usual_genres) || (data.pick !== null && !isRecommendation(data.pick))) {
    throw new ApiError("The server response had an unexpected shape.", "shape");
  }
  return data as WildcardResult;
}
