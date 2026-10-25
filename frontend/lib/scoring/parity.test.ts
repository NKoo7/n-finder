import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_PREFERENCES, type MoodPreferences } from "@/lib/mood-dimensions";
import { SAMPLE_DATASET_LABEL, SAMPLE_MOVIES } from "@/lib/movies/sample-movies";
import fixture from "./parity-fixture.json";
import { scoreMovie } from "./mood-score";

/**
 * The recommendation engine exists twice: Python (backend/app/services/recommender.py, the
 * source of truth) and TypeScript (the offline fallback). These tests stop them drifting apart.
 * If a test here fails after you change scoring, regenerate the fixture:
 *   cd backend && PYTHONPATH=. python scripts/make_parity_fixture.py
 * and if the catalogue changed:  node scripts/export-catalogue.mjs
 */
describe("frontend scorer matches the Python engine", () => {
  for (const c of fixture) {
    it(`scores agree for ${JSON.stringify(c.preferences) || "defaults"}`, () => {
      const prefs: MoodPreferences = { ...DEFAULT_PREFERENCES, ...c.preferences };
      const expected = c.scores as Record<string, number>;
      for (const movie of SAMPLE_MOVIES) {
        expect(scoreMovie(movie, prefs).rawScore).toBeCloseTo(expected[movie.id], 4);
      }
    });
  }
});

describe("catalogue shared with the backend", () => {
  it("frontend data equals backend/app/data/movies.json", () => {
    const raw = JSON.parse(
      readFileSync(new URL("../../../backend/app/data/movies.json", import.meta.url), "utf8"),
    );
    expect(raw.label).toBe(SAMPLE_DATASET_LABEL);
    expect(raw.movies).toEqual(JSON.parse(JSON.stringify(SAMPLE_MOVIES)));
  });
});
