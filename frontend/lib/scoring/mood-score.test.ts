import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  MOOD_DIMENSIONS,
  type MoodPreferences,
} from "@/lib/mood-dimensions";
import { SAMPLE_MOVIES } from "@/lib/movies/sample-movies";
import type { Movie } from "@/lib/movies/types";
import { dimensionWeight, rankMovies, sanitizePreference, scoreMovie } from "./mood-score";

const film = (id: string, mood: Movie["mood"], title = id): Movie => ({
  id,
  title,
  year: 2000,
  directors: ["Test"],
  genres: ["Drama"],
  synopsis: "A test film used only in unit tests.",
  mood,
  pacing: 50,
  themes: ["test"],
});

const prefs = (overrides: Partial<MoodPreferences>): MoodPreferences => ({
  ...DEFAULT_PREFERENCES,
  ...overrides,
});

const flat = (v: number): Movie["mood"] => ({
  tone: v,
  intensity: v,
  realism: v,
  focus: v,
  predictability: v,
});

describe("scoreMovie", () => {
  it("scores a perfect match at 100 and the opposite extreme at 0", () => {
    const p = prefs({ tone: 0, intensity: 0, realism: 0, focus: 0, predictability: 0 });
    expect(scoreMovie(film("a", flat(0)), p).score).toBe(100);
    expect(scoreMovie(film("b", flat(100)), p).score).toBe(0);
  });

  it("keeps scores within 0..100", () => {
    for (const m of SAMPLE_MOVIES) {
      for (const v of [0, 25, 50, 75, 100]) {
        const { score } = scoreMovie(m, prefs({ tone: v, intensity: 100 - v }));
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    }
  });

  it("weights a slider more the further it is pushed from balanced", () => {
    expect(dimensionWeight(50)).toBe(1);
    expect(dimensionWeight(0)).toBe(3);
    expect(dimensionWeight(100)).toBe(3);
    expect(dimensionWeight(75)).toBe(2);
  });

  it("clamps out-of-range preferences and treats NaN as balanced", () => {
    expect(sanitizePreference(-40)).toBe(0);
    expect(sanitizePreference(400)).toBe(100);
    expect(sanitizePreference(Number.NaN)).toBe(50);
    const m = film("a", flat(70));
    expect(scoreMovie(m, prefs({ tone: Number.NaN })).score).toBe(
      scoreMovie(m, prefs({ tone: 50 })).score,
    );
  });

  it("skips missing or non-finite film attributes instead of treating them as zero", () => {
    const broken = film("x", flat(50));
    // Simulate bad data arriving at runtime.
    (broken.mood as unknown as Record<string, unknown>).tone = undefined;
    (broken.mood as unknown as Record<string, unknown>).realism = Number.NaN;
    const result = scoreMovie(broken, DEFAULT_PREFERENCES);
    expect(result.dimensions.map((d) => d.dimension)).toEqual([
      "intensity",
      "focus",
      "predictability",
    ]);
    expect(result.score).toBe(100);
  });

  it("returns 0 when nothing can be scored", () => {
    const empty = { ...film("e", flat(50)), mood: {} } as unknown as Movie;
    expect(scoreMovie(empty, DEFAULT_PREFERENCES).score).toBe(0);
  });
});

describe("rankMovies", () => {
  it("is deterministic and does not mutate its input", () => {
    const before = SAMPLE_MOVIES.map((m) => m.id);
    const p = prefs({ tone: 20, intensity: 85, realism: 70 });
    const a = rankMovies(SAMPLE_MOVIES, p).map((s) => s.movie.id);
    const b = rankMovies(SAMPLE_MOVIES, p).map((s) => s.movie.id);
    expect(a).toEqual(b);
    expect(SAMPLE_MOVIES.map((m) => m.id)).toEqual(before);
  });

  it("breaks ties by title then id", () => {
    const films = [film("b", flat(50), "Beta"), film("a2", flat(50), "Alpha"), film("a1", flat(50), "Alpha")];
    expect(rankMovies(films, DEFAULT_PREFERENCES).map((s) => s.movie.id)).toEqual(["a1", "a2", "b"]);
  });

  it.each(MOOD_DIMENSIONS.map((d) => d.id))(
    "the %s slider changes the ranking",
    (dimension) => {
      const low = rankMovies(SAMPLE_MOVIES, prefs({ [dimension]: 0 })).map((s) => s.movie.id);
      const high = rankMovies(SAMPLE_MOVIES, prefs({ [dimension]: 100 })).map((s) => s.movie.id);
      expect(low).not.toEqual(high);
    },
  );

  it.each(MOOD_DIMENSIONS.map((d) => d.id))(
    "the %s slider pulls films from the matching pole to the top",
    (dimension) => {
      const lowTop = rankMovies(SAMPLE_MOVIES, prefs({ [dimension]: 0 }))[0].movie.mood[dimension];
      const highTop = rankMovies(SAMPLE_MOVIES, prefs({ [dimension]: 100 }))[0].movie.mood[dimension];
      expect(lowTop).toBeLessThan(highTop);
    },
  );

  it("ranks a dark, intense preference toward dark, intense films", () => {
    const top = rankMovies(
      SAMPLE_MOVIES,
      prefs({ tone: 0, intensity: 100 }),
    ).slice(0, 5);
    for (const s of top) {
      expect(s.movie.mood.tone).toBeLessThanOrEqual(35);
      expect(s.movie.mood.intensity).toBeGreaterThanOrEqual(70);
    }
  });
});
