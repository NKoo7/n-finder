import { describe, expect, it } from "vitest";
import { SAMPLE_MOVIES } from "./sample-movies";
import { availableGenres, filterMovies, normalizeText } from "./filter";

const titles = (list: readonly { title: string }[]) => list.map((m) => m.title);

describe("normalizeText", () => {
  it("lowercases, trims and strips diacritics", () => {
    expect(normalizeText("  AmÉlie ")).toBe("amelie");
  });
});

describe("filterMovies", () => {
  it("returns everything, in order, with no query and no genres", () => {
    expect(filterMovies(SAMPLE_MOVIES, "", [])).toEqual([...SAMPLE_MOVIES]);
    expect(filterMovies(SAMPLE_MOVIES, "   ", [])).toHaveLength(SAMPLE_MOVIES.length);
  });

  it("searches titles case-insensitively", () => {
    expect(titles(filterMovies(SAMPLE_MOVIES, "PARASITE", []))).toEqual(["Parasite"]);
    expect(titles(filterMovies(SAMPLE_MOVIES, "parasite", []))).toEqual(["Parasite"]);
  });

  it("ignores accents in both directions", () => {
    expect(titles(filterMovies(SAMPLE_MOVIES, "amelie", []))).toEqual(["Amélie"]);
    expect(titles(filterMovies(SAMPLE_MOVIES, "AMÉLIE", []))).toEqual(["Amélie"]);
  });

  it("filters by genre using 'any selected genre' semantics", () => {
    const result = filterMovies(SAMPLE_MOVIES, "", ["Horror"]);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((m) => m.genres.includes("Horror"))).toBe(true);
    const either = filterMovies(SAMPLE_MOVIES, "", ["Horror", "Music"]);
    expect(either.length).toBeGreaterThan(result.length);
  });

  it("combines search and genre (both must hold)", () => {
    expect(titles(filterMovies(SAMPLE_MOVIES, "the", ["Horror"]))).toEqual(["The Lighthouse"]);
    expect(filterMovies(SAMPLE_MOVIES, "parasite", ["Animation"])).toEqual([]);
  });

  it("is stable for identical input", () => {
    const a = filterMovies(SAMPLE_MOVIES, "o", ["Drama"]).map((m) => m.id);
    const b = filterMovies(SAMPLE_MOVIES, "o", ["Drama"]).map((m) => m.id);
    expect(a).toEqual(b);
  });
});

describe("availableGenres", () => {
  it("lists only genres present, in canonical order, without duplicates", () => {
    const genres = availableGenres(SAMPLE_MOVIES);
    expect(new Set(genres).size).toBe(genres.length);
    expect(genres).toContain("Drama");
    expect(availableGenres([])).toEqual([]);
  });
});
