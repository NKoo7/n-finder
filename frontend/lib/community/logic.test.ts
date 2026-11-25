import { describe, expect, it } from "vitest";
import { SAMPLE_MOVIES } from "@/lib/movies/sample-movies";
import {
  becauseYouLiked,
  coStarSuggestions,
  likeCount,
  tasteSimilarity,
} from "./logic";
import { DEFAULT_PRIVACY, EMPTY_COMMUNITY, type CommunityState, type CommunityUser } from "./types";

function makeUser(id: string, liked: string[], discoverable = true): CommunityUser {
  return {
    id,
    displayName: id,
    bio: "",
    avatar: "violet",
    email: null,
    seeded: false,
    joined: "2026-01-01",
    privacy: { ...DEFAULT_PRIVACY, discoverable },
    liked,
    saved: [],
    coStars: [],
  };
}

function stateWith(users: CommunityUser[]): CommunityState {
  return { ...EMPTY_COMMUNITY, users: Object.fromEntries(users.map((u) => [u.id, u])) };
}

const arrival = SAMPLE_MOVIES.find((m) => m.id === "arrival-2016")!;
const parasite = SAMPLE_MOVIES.find((m) => m.id === "parasite-2019")!;

describe("likeCount", () => {
  it("is stable for the same film and grows with real likes", () => {
    const baseline = likeCount(EMPTY_COMMUNITY, arrival.id);
    expect(likeCount(EMPTY_COMMUNITY, arrival.id)).toBe(baseline);
    const state = stateWith([makeUser("a", [arrival.id]), makeUser("b", [arrival.id])]);
    expect(likeCount(state, arrival.id)).toBe(baseline + 2);
  });
});

describe("tasteSimilarity", () => {
  const byId = new Map(SAMPLE_MOVIES.map((m) => [m.id, m]));

  it("scores identical taste at 100 and lists shared films", () => {
    const a = makeUser("a", [arrival.id, parasite.id]);
    const b = makeUser("b", [arrival.id, parasite.id]);
    const { score, shared } = tasteSimilarity(a, b, byId);
    expect(score).toBe(100);
    expect(shared.sort()).toEqual([arrival.id, parasite.id].sort());
  });

  it("scores users with no likes at 0", () => {
    const { score } = tasteSimilarity(makeUser("a", []), makeUser("b", []), byId);
    expect(score).toBe(0);
  });

  it("gives partial overlap a middle score", () => {
    const a = makeUser("a", [arrival.id, parasite.id]);
    const b = makeUser("b", [arrival.id]);
    const { score } = tasteSimilarity(a, b, byId);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });
});

describe("coStarSuggestions", () => {
  it("excludes the viewer and non-discoverable users", () => {
    const viewer = makeUser("viewer", [arrival.id]);
    const hidden = makeUser("hidden", [arrival.id], false);
    const visible = makeUser("visible", [arrival.id]);
    const suggestions = coStarSuggestions(stateWith([viewer, hidden, visible]), "viewer", SAMPLE_MOVIES);
    expect(suggestions.map((s) => s.user.id)).toEqual(["visible"]);
  });

  it("ranks the closest taste first and reports shared titles", () => {
    const viewer = makeUser("viewer", [arrival.id, parasite.id]);
    const close = makeUser("close", [arrival.id, parasite.id]);
    const far = makeUser("far", []);
    const suggestions = coStarSuggestions(stateWith([viewer, close, far]), "viewer", SAMPLE_MOVIES);
    expect(suggestions[0].user.id).toBe("close");
    expect(suggestions[0].score).toBe(100);
    expect(suggestions[0].sharedTitles).toContain(arrival.title);
  });

  it("works for a signed-out viewer with zero scores", () => {
    const suggestions = coStarSuggestions(stateWith([makeUser("a", [arrival.id])]), null, SAMPLE_MOVIES);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].score).toBe(0);
  });
});

describe("becauseYouLiked", () => {
  it("returns nothing without likes", () => {
    expect(becauseYouLiked([], SAMPLE_MOVIES)).toEqual([]);
  });

  it("never recommends an already-liked film and always gives a reason", () => {
    const recs = becauseYouLiked([arrival.id], SAMPLE_MOVIES, 8);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(8);
    for (const rec of recs) {
      expect(rec.movie.id).not.toBe(arrival.id);
      expect(rec.reason.length).toBeGreaterThan(10);
    }
    const scores = recs.map((r) => r.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it("ignores unknown liked ids", () => {
    expect(becauseYouLiked(["not-a-film"], SAMPLE_MOVIES)).toEqual([]);
  });
});