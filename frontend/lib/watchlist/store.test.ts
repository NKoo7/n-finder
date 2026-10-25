import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WATCHLIST_KEY } from "./storage";

class FakeStorage {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.has(k) ? (this.data.get(k) as string) : null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
}

async function loadStore() {
  vi.resetModules();
  return import("./store");
}

describe("watchlist store", () => {
  let storage: FakeStorage;

  beforeEach(() => {
    storage = new FakeStorage();
    vi.stubGlobal("localStorage", storage);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("starts empty and persists additions without duplicates", async () => {
    const s = await loadStore();
    expect(s.getWatchlistSnapshot().ids).toEqual([]);
    s.addToWatchlist("a");
    s.addToWatchlist("a");
    s.addToWatchlist("b");
    expect(s.getWatchlistSnapshot().ids).toEqual(["a", "b"]);
    expect(JSON.parse(storage.getItem(WATCHLIST_KEY)!)).toEqual(["a", "b"]);
  });

  it("restores saved ids after a reload (fresh module, same storage)", async () => {
    storage.setItem(WATCHLIST_KEY, '["x","y"]');
    const s = await loadStore();
    expect(s.getWatchlistSnapshot()).toEqual({ ids: ["x", "y"], status: "ok" });
  });

  it("toggles and removes", async () => {
    const s = await loadStore();
    s.toggleWatchlist("a");
    expect(s.getWatchlistSnapshot().ids).toEqual(["a"]);
    s.toggleWatchlist("a");
    expect(s.getWatchlistSnapshot().ids).toEqual([]);
    s.addToWatchlist("z");
    s.removeFromWatchlist("z");
    expect(s.getWatchlistSnapshot().ids).toEqual([]);
  });

  it("returns a stable snapshot reference while storage is unchanged", async () => {
    storage.setItem(WATCHLIST_KEY, '["a"]');
    const s = await loadStore();
    expect(s.getWatchlistSnapshot()).toBe(s.getWatchlistSnapshot());
  });

  it("recovers from malformed storage and replaces it on the next save", async () => {
    storage.setItem(WATCHLIST_KEY, "{{{ not json");
    const s = await loadStore();
    expect(s.getWatchlistSnapshot()).toEqual({ ids: [], status: "corrupted" });
    s.addToWatchlist("a");
    expect(s.getWatchlistSnapshot()).toEqual({ ids: ["a"], status: "ok" });
  });

  it("notifies subscribers on change", async () => {
    const s = await loadStore();
    const listener = vi.fn();
    vi.stubGlobal("window", { addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const unsubscribe = s.subscribeWatchlist(listener);
    s.addToWatchlist("a");
    expect(listener).toHaveBeenCalledTimes(1);
    s.addToWatchlist("a"); // no change, no notification
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    s.addToWatchlist("b");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("falls back to memory when storage cannot be read", async () => {
    vi.stubGlobal("localStorage", {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
    });
    const s = await loadStore();
    expect(s.getWatchlistSnapshot()).toEqual({ ids: [], status: "unavailable" });
    s.addToWatchlist("a");
    expect(s.getWatchlistSnapshot()).toEqual({ ids: ["a"], status: "unavailable" });
  });

  it("falls back to memory when saving fails (e.g. quota exceeded)", async () => {
    const s = await loadStore();
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem() {
        throw new Error("QuotaExceededError");
      },
    });
    s.addToWatchlist("a");
    expect(s.getWatchlistSnapshot()).toEqual({ ids: ["a"], status: "unavailable" });
  });

  it("exposes a constant, empty server snapshot", async () => {
    const s = await loadStore();
    expect(s.getServerWatchlistSnapshot()).toBe(s.getServerWatchlistSnapshot());
    expect(s.getServerWatchlistSnapshot().ids).toEqual([]);
  });
});
