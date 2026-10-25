import { describe, expect, it } from "vitest";
import { DEFAULT_PREFERENCES, MOOD_DIMENSIONS, type MoodPreferences } from "@/lib/mood-dimensions";
import { SAMPLE_MOVIES } from "@/lib/movies/sample-movies";
import { describePosition, explainMovie, matchLevel } from "./explain";
import { scoreMovie } from "./mood-score";

const byId = (id: string) => SAMPLE_MOVIES.find((m) => m.id === id)!;

describe("matchLevel", () => {
  it("uses documented thresholds", () => {
    expect(matchLevel(0)).toBe("close");
    expect(matchLevel(15)).toBe("close");
    expect(matchLevel(16)).toBe("partial");
    expect(matchLevel(35)).toBe("partial");
    expect(matchLevel(36)).toBe("far");
  });
});

describe("describePosition", () => {
  const tone = MOOD_DIMENSIONS[0];
  it("names the pole a value leans toward", () => {
    expect(describePosition(tone, 5)).toBe("very dark");
    expect(describePosition(tone, 30)).toBe("leaning dark");
    expect(describePosition(tone, 50)).toBe("balanced");
    expect(describePosition(tone, 70)).toBe("leaning hopeful");
    expect(describePosition(tone, 95)).toBe("very hopeful");
  });
});

describe("explainMovie", () => {
  const prefs: MoodPreferences = { tone: 10, intensity: 90, realism: 20, focus: 50, predictability: 80 };

  it("derives every explanation from the same numbers the score uses", () => {
    const movie = byId("oldboy-2003");
    const scored = scoreMovie(movie, prefs);
    const explained = explainMovie(movie, prefs);
    expect(explained.dimensions).toHaveLength(scored.dimensions.length);
    explained.dimensions.forEach((e, i) => {
      const s = scored.dimensions[i];
      expect(e.dimension.id).toBe(s.dimension);
      expect(e.difference).toBe(s.difference);
      expect(e.preference).toBe(s.preference);
      expect(e.rating).toBe(s.rating);
      expect(e.level).toBe(matchLevel(s.difference));
    });
  });

  it("states the real preference and rating values in each sentence", () => {
    const movie = byId("hereditary-2018");
    for (const e of explainMovie(movie, prefs).dimensions) {
      expect(e.summary).toContain(`(${Math.round(e.preference)})`);
      expect(e.summary).toContain(`(${e.rating})`);
      expect(e.summary).toContain(e.dimension.name);
    }
  });

  it("partitions dimensions into close, partial and far without losing any", () => {
    for (const movie of SAMPLE_MOVIES) {
      const x = explainMovie(movie, prefs);
      expect(x.close.length + x.partial.length + x.far.length).toBe(x.dimensions.length);
      expect(x.close.every((d) => d.difference <= 15)).toBe(true);
      expect(x.far.every((d) => d.difference > 35)).toBe(true);
    }
  });

  it("flags a real mismatch for a film that opposes the preference", () => {
    // Paddington 2 is rated very hopeful; the preference is very dark.
    const x = explainMovie(byId("paddington-2-2017"), prefs);
    const tone = x.far.find((d) => d.dimension.id === "tone");
    expect(tone).toBeDefined();
    expect(tone?.summary).toContain("clear mismatch");
  });

  it("reports only genres that are in both the film and the active filter", () => {
    const movie = byId("get-out-2017"); // Horror, Thriller, Mystery
    expect(explainMovie(movie, DEFAULT_PREFERENCES, ["Horror", "Comedy"]).genreMatches).toEqual(["Horror"]);
    expect(explainMovie(movie, DEFAULT_PREFERENCES, ["Comedy"]).genreMatches).toEqual([]);
    expect(explainMovie(movie, DEFAULT_PREFERENCES).genreMatches).toEqual([]);
  });
});

import { describePacing } from "./explain";

describe("describePacing", () => {
  it("maps ratings to slow, moderate and fast", () => {
    expect(describePacing(5)).toBe("slow");
    expect(describePacing(25)).toBe("slow");
    expect(describePacing(26)).toBe("moderate");
    expect(describePacing(60)).toBe("moderate");
    expect(describePacing(61)).toBe("fast");
  });
});
