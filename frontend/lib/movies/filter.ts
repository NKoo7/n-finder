import type { Genre, Movie } from "./types";
import { GENRES } from "./types";

/** Lower-case and strip diacritics so "amelie" finds "Amélie". */
export function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

/**
 * Combined filter. A film must satisfy BOTH:
 *  - title contains the (normalised) search text, if any is given
 *  - the film has at least one of the selected genres, if any are selected
 * Order of the input is preserved, so ranking is not disturbed.
 */
export function filterMovies(
  movies: readonly Movie[],
  query: string,
  genres: readonly Genre[],
): Movie[] {
  const needle = normalizeText(query);
  return movies.filter((movie) => {
    if (needle && !normalizeText(movie.title).includes(needle)) return false;
    if (genres.length > 0 && !movie.genres.some((g) => genres.includes(g))) return false;
    return true;
  });
}

/** Genres that actually occur in the given films, in the canonical GENRES order. */
export function availableGenres(movies: readonly Movie[]): Genre[] {
  const present = new Set<Genre>(movies.flatMap((m) => m.genres));
  return GENRES.filter((g) => present.has(g));
}
