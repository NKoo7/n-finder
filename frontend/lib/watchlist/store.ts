/**
 * Browser watchlist store, shaped for React's useSyncExternalStore.
 *
 * - Source of truth is localStorage (key in storage.ts). It is only touched inside
 *   getSnapshot/mutations, which React calls on the client; the server snapshot is constant.
 * - If storage cannot be read or written, the list falls back to memory for the session and
 *   the status becomes "unavailable" so the UI can say it will not persist.
 * - Snapshots are cached by raw string so getSnapshot returns a stable reference.
 */
import {
  EMPTY_WATCHLIST,
  WATCHLIST_KEY,
  addId,
  parseWatchlist,
  removeId,
  serializeWatchlist,
  type WatchlistState,
} from "./storage";

type Listener = () => void;

const listeners = new Set<Listener>();
let cache: { raw: string | null; state: WatchlistState } | null = null;
/** Set when localStorage is unusable; holds the in-memory list for this session. */
let memory: WatchlistState | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

export function getWatchlistSnapshot(): WatchlistState {
  if (memory) return memory;
  let raw: string | null;
  try {
    raw = localStorage.getItem(WATCHLIST_KEY);
  } catch {
    memory = { ids: [], status: "unavailable" };
    return memory;
  }
  if (cache && cache.raw === raw) return cache.state;
  const state = parseWatchlist(raw);
  cache = { raw, state };
  return state;
}

export function getServerWatchlistSnapshot(): WatchlistState {
  return EMPTY_WATCHLIST;
}

export function subscribeWatchlist(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === WATCHLIST_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function commit(nextIds: readonly string[]) {
  if (nextIds === getWatchlistSnapshot().ids) return;
  if (!memory) {
    try {
      localStorage.setItem(WATCHLIST_KEY, serializeWatchlist(nextIds));
    } catch {
      memory = { ids: nextIds, status: "unavailable" };
    }
  } else {
    memory = { ids: nextIds, status: "unavailable" };
  }
  emit();
}

export function addToWatchlist(id: string) {
  commit(addId(getWatchlistSnapshot().ids, id));
}

export function removeFromWatchlist(id: string) {
  commit(removeId(getWatchlistSnapshot().ids, id));
}

export function toggleWatchlist(id: string) {
  const { ids } = getWatchlistSnapshot();
  commit(ids.includes(id) ? removeId(ids, id) : addId(ids, id));
}

/** Test helper: forget cached and in-memory state. */
export function __resetWatchlistStoreForTests() {
  cache = null;
  memory = null;
  listeners.clear();
}
