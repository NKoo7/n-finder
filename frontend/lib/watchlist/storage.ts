/** Pure watchlist helpers. No browser APIs here, so everything is unit-testable. */

export const WATCHLIST_KEY = "nfinder.watchlist.v1";

export type WatchlistStatus =
  /** Storage read fine (an empty or missing entry is fine too). */
  | "ok"
  /** Something was stored but it was not a valid list; treated as empty. */
  | "corrupted"
  /** localStorage cannot be read or written (blocked, private mode, quota). */
  | "unavailable";

export interface WatchlistState {
  /** Saved movie ids in the order they were added, without duplicates. */
  ids: readonly string[];
  status: WatchlistStatus;
}

export const EMPTY_WATCHLIST: WatchlistState = { ids: [], status: "ok" };

/** Parse the raw stored string. Never throws. */
export function parseWatchlist(raw: string | null): WatchlistState {
  if (raw === null) return EMPTY_WATCHLIST;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return { ids: [], status: "corrupted" };
    const seen = new Set<string>();
    for (const item of value) {
      if (typeof item === "string" && item.length > 0) seen.add(item);
    }
    // Entries that are not non-empty strings are dropped; if everything was dropped from
    // a non-empty list, the data was not a watchlist.
    if (value.length > 0 && seen.size === 0) return { ids: [], status: "corrupted" };
    return { ids: [...seen], status: "ok" };
  } catch {
    return { ids: [], status: "corrupted" };
  }
}

export function addId(ids: readonly string[], id: string): readonly string[] {
  return ids.includes(id) ? ids : [...ids, id];
}

export function removeId(ids: readonly string[], id: string): readonly string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : ids;
}

export function serializeWatchlist(ids: readonly string[]): string {
  return JSON.stringify(ids);
}
