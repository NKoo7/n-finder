import { describe, expect, it } from "vitest";
import { MOOD_DIMENSIONS } from "@/lib/mood-dimensions";
import { SAMPLE_MOVIES } from "./sample-movies";
import { GENRES } from "./types";

describe("sample catalogue integrity", () => {
  it("has between 30 and 50 films", () => {
    expect(SAMPLE_MOVIES.length).toBeGreaterThanOrEqual(30);
    expect(SAMPLE_MOVIES.length).toBeLessThanOrEqual(50);
  });

  it("uses unique, URL-safe ids", () => {
    const ids = SAMPLE_MOVIES.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it("rates every mood dimension and pacing with integers from 0 to 100", () => {
    for (const movie of SAMPLE_MOVIES) {
      for (const { id } of MOOD_DIMENSIONS) {
        const v = movie.mood[id];
        expect(Number.isInteger(v), `${movie.id}.${id}`).toBe(true);
        expect(v, `${movie.id}.${id}`).toBeGreaterThanOrEqual(0);
        expect(v, `${movie.id}.${id}`).toBeLessThanOrEqual(100);
      }
      expect(movie.pacing).toBeGreaterThanOrEqual(0);
      expect(movie.pacing).toBeLessThanOrEqual(100);
    }
  });

  it("has complete descriptive metadata and only known genres", () => {
    for (const movie of SAMPLE_MOVIES) {
      expect(movie.title.length).toBeGreaterThan(0);
      expect(movie.year).toBeGreaterThan(1900);
      expect(movie.year).toBeLessThanOrEqual(2026);
      expect(movie.directors.length).toBeGreaterThan(0);
      expect(movie.synopsis.length).toBeGreaterThan(20);
      expect(movie.themes.length).toBeGreaterThan(0);
      expect(movie.genres.length).toBeGreaterThan(0);
      for (const g of movie.genres) expect(GENRES).toContain(g);
    }
  });

  it("does not ship poster URLs without a reliable source", () => {
    expect(SAMPLE_MOVIES.every((m) => m.posterUrl === undefined)).toBe(true);
  });
});
