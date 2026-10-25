import { describe, expect, it } from "vitest";
import { hashString, posterArt } from "./poster-art";

describe("posterArt", () => {
  it("is deterministic for the same id", () => {
    expect(posterArt("parasite-2019")).toEqual(posterArt("parasite-2019"));
    expect(hashString("a")).toBe(hashString("a"));
  });

  it("differs between ids", () => {
    expect(posterArt("parasite-2019")).not.toEqual(posterArt("spirited-away-2001"));
  });

  it("keeps parameters in sensible bounds", () => {
    for (const id of ["a", "b", "coco-2017", "wall-e-2008", ""]) {
      const art = posterArt(id);
      expect(art.shapes).toHaveLength(3);
      for (const s of art.shapes) {
        expect(s.opacity).toBeGreaterThan(0);
        expect(s.opacity).toBeLessThan(1);
        expect(s.r).toBeGreaterThan(0);
      }
      expect(art.horizon).toBeGreaterThanOrEqual(150);
      expect(art.horizon).toBeLessThanOrEqual(210);
    }
  });
});
