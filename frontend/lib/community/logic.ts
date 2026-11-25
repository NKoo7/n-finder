import { catalogMeta } from "@/lib/movies/catalog-meta";
import { hashString } from "@/lib/movies/poster-art";
import type { Genre, Movie } from "@/lib/movies/types";
import type { CommunityState, CommunityUser } from "./types";

/**
 * Demo like counts: a stable per-film baseline (so counts feel populated) plus real likes
 * from community users. Clearly demo data — a production backend would own these counts.
 */
export function likeCount(state: CommunityState, movieId: string): number {
  const baseline = 8 + (hashString(`likes:${movieId}`) % 42);
  const real = Object.values(state.users).filter((u) => u.liked.includes(movieId)).length;
  return baseline + real;
}

export function genreWeights(user: CommunityUser, byId: ReadonlyMap<string, Movie>): Map<Genre, number> {
  const weights = new Map<Genre, number>();
  for (const id of user.liked) {
    const movie = byId.get(id);
    if (!movie) continue;
    for (const genre of movie.genres) {
      weights.set(genre, (weights.get(genre) ?? 0) + 1);
    }
  }
  return weights;
}

/** Taste similarity 0..100: shared liked films plus overlap in genre appetite. */
export function tasteSimilarity(
  a: CommunityUser,
  b: CommunityUser,
  byId: ReadonlyMap<string, Movie>,
): { score: number; shared: string[] } {
  const bLiked = new Set(b.liked);
  const shared = a.liked.filter((id) => bLiked.has(id));
  const wa = genreWeights(a, byId);
  const wb = genreWeights(b, byId);
  let dot = 0;
  let na = 0;
  let nb = 0;
  const genres = new Set([...wa.keys(), ...wb.keys()]);
  for (const g of genres) {
    const x = wa.get(g) ?? 0;
    const y = wb.get(g) ?? 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const cosine = na && nb ? dot / Math.sqrt(na * nb) : 0;
  const union = new Set([...a.liked, ...b.liked]).size;
  const jaccard = union ? shared.length / union : 0;
  const score = Math.round(100 * (0.55 * cosine + 0.45 * jaccard));
  return { score, shared };
}

export interface CoStarSuggestion {
  user: CommunityUser;
  score: number;
  sharedTitles: string[];
  topGenres: Genre[];
}

/** Discoverable users ranked by taste similarity to the viewer. */
export function coStarSuggestions(
  state: CommunityState,
  viewerId: string | null,
  movies: readonly Movie[],
): CoStarSuggestion[] {
  const byId = new Map(movies.map((m) => [m.id, m]));
  const viewer = viewerId ? state.users[viewerId] : undefined;
  return Object.values(state.users)
    .filter((u) => u.id !== viewerId && u.privacy.discoverable)
    .map((user) => {
      const { score, shared } = viewer
        ? tasteSimilarity(viewer, user, byId)
        : { score: 0, shared: [] as string[] };
      const weights = genreWeights(user, byId);
      const topGenres = [...weights.entries()]
        .sort((x, y) => y[1] - x[1])
        .slice(0, 3)
        .map(([g]) => g);
      return {
        user,
        score,
        sharedTitles: shared.flatMap((id) => {
          const m = byId.get(id);
          return m ? [m.title] : [];
        }),
        topGenres,
      };
    })
    .sort((a, b) => b.score - a.score || a.user.displayName.localeCompare(b.user.displayName));
}

export interface Recommendation {
  movie: Movie;
  reason: string;
  score: number;
}

/**
 * "Because you liked..." — rank unseen films against everything the user liked.
 * Every pick carries a plain-language reason drawn from the actual overlap.
 */
export function becauseYouLiked(
  likedIds: readonly string[],
  movies: readonly Movie[],
  limit = 6,
): Recommendation[] {
  const byId = new Map(movies.map((m) => [m.id, m]));
  const liked = likedIds.flatMap((id) => {
    const m = byId.get(id);
    return m ? [m] : [];
  });
  if (liked.length === 0) return [];
  const likedSet = new Set(likedIds);

  const genreCount = new Map<Genre, number>();
  for (const m of liked) {
    for (const g of m.genres) genreCount.set(g, (genreCount.get(g) ?? 0) + 1);
  }

  const results: Recommendation[] = [];
  for (const movie of movies) {
    if (likedSet.has(movie.id)) continue;
    let score = 0;
    const sharedGenres = movie.genres.filter((g) => genreCount.has(g));
    score += sharedGenres.reduce((sum, g) => sum + (genreCount.get(g) ?? 0), 0) * 3;

    let moodDistance = 0;
    for (const key of ["tone", "intensity", "realism", "focus", "predictability"] as const) {
      const avg = liked.reduce((s, m) => s + m.mood[key], 0) / liked.length;
      moodDistance += Math.abs(movie.mood[key] - avg);
    }
    score += Math.max(0, 60 - moodDistance / 5);

    const meta = catalogMeta(movie.id);
    const likedPeople = new Set(
      liked.flatMap((m) => [...m.directors, ...catalogMeta(m.id).cast]),
    );
    const sharedPeople = [...movie.directors, ...meta.cast].filter((p) => likedPeople.has(p));
    score += sharedPeople.length * 8;

    if (score <= 0) continue;
    let reason: string;
    if (sharedPeople.length > 0) {
      const person = sharedPeople[0];
      const isDirector = movie.directors.includes(person);
      reason = `Also ${isDirector ? "directed by" : "starring"} ${person}, from films you liked.`;
    } else if (sharedGenres.length > 0) {
      const anchor = liked.find((m) => m.genres.some((g) => sharedGenres.includes(g)));
      reason = `Shares ${sharedGenres.slice(0, 2).join(" & ")} with ${anchor ? anchor.title : "films you liked"}.`;
    } else {
      reason = "Its mood profile lines up with the films you liked.";
    }
    results.push({ movie, reason, score });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}