"use client";

import { useSyncExternalStore } from "react";
import {
  getServerWatchlistSnapshot,
  getWatchlistSnapshot,
  subscribeWatchlist,
  toggleWatchlist,
  removeFromWatchlist,
} from "./store";
import type { WatchlistState } from "./storage";

const subscribeNothing = () => () => {};

/** True once running in the browser after hydration; false during server render. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

export function useWatchlist(): {
  state: WatchlistState;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
} {
  const state = useSyncExternalStore(
    subscribeWatchlist,
    getWatchlistSnapshot,
    getServerWatchlistSnapshot,
  );
  return {
    state,
    has: (id) => state.ids.includes(id),
    toggle: toggleWatchlist,
    remove: removeFromWatchlist,
  };
}
