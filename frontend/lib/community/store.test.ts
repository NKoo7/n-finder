import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WATCHLIST_KEY } from "@/lib/watchlist/storage";
import {
  __resetCommunityStoreForTests,
  AuthError,
  getCommunitySnapshot,
  signIn,
  signOut,
  signUp,
  toggleCoStar,
  toggleLike,
  toggleSave,
  updateProfile,
} from "./store";
import { DEFAULT_PRIVACY } from "./types";

const COMMUNITY_KEY = "nfinder.community.v1";

class FakeStorage {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.has(k) ? (this.data.get(k) as string) : null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
}

const account = { displayName: "Test Viewer", email: "viewer@example.com", password: "secret1" };

describe("community store", () => {
  let storage: FakeStorage;

  beforeEach(() => {
    storage = new FakeStorage();
    vi.stubGlobal("localStorage", storage);
    __resetCommunityStoreForTests();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    __resetCommunityStoreForTests();
  });

  it("starts with seeded profiles and no session", () => {
    const state = getCommunitySnapshot();
    expect(state.sessionUserId).toBeNull();
    expect(Object.keys(state.users).length).toBeGreaterThan(0);
    expect(Object.values(state.users).every((u) => u.seeded)).toBe(true);
  });

  it("rejects invalid sign-up input", async () => {
    await expect(signUp({ ...account, displayName: "A" })).rejects.toThrow(AuthError);
    await expect(signUp({ ...account, email: "not-an-email" })).rejects.toThrow(AuthError);
    await expect(signUp({ ...account, password: "123" })).rejects.toThrow(AuthError);
  });

  it("creates a private-by-default account and signs in", async () => {
    const user = await signUp(account);
    expect(user.privacy).toEqual(DEFAULT_PRIVACY);
    expect(getCommunitySnapshot().sessionUserId).toBe(user.id);

    signOut();
    expect(getCommunitySnapshot().sessionUserId).toBeNull();

    await expect(signIn(account.email, "wrong-password")).rejects.toThrow(AuthError);
    const back = await signIn(account.email, account.password);
    expect(back.id).toBe(user.id);
    expect(getCommunitySnapshot().sessionUserId).toBe(user.id);
  });

  it("rejects duplicate emails and seeded-profile sign-in", async () => {
    await signUp(account);
    signOut();
    await expect(signUp(account)).rejects.toThrow(AuthError);
    const seeded = Object.values(getCommunitySnapshot().users).find((u) => u.seeded && u.email);
    if (seeded?.email) {
      await expect(signIn(seeded.email, "anything")).rejects.toThrow(AuthError);
    }
  });

  it("never exposes password hashes in the snapshot", async () => {
    await signUp(account);
    const raw = JSON.parse(storage.getItem(COMMUNITY_KEY)!);
    expect(Object.values(raw.users).some((u) => "passwordHash" in (u as object))).toBe(true);
    for (const user of Object.values(getCommunitySnapshot().users)) {
      expect("passwordHash" in user).toBe(false);
    }
  });

  it("merges the legacy watchlist into saved on sign-up", async () => {
    storage.setItem(WATCHLIST_KEY, '["arrival-2016","parasite-2019"]');
    const user = await signUp(account);
    expect(user.saved).toEqual(["arrival-2016", "parasite-2019"]);
  });

  it("toggles likes, saves and mutual Co-Star connections", async () => {
    const user = await signUp(account);
    toggleLike(user.id, "arrival-2016");
    toggleSave(user.id, "parasite-2019");
    let state = getCommunitySnapshot();
    expect(state.users[user.id].liked).toEqual(["arrival-2016"]);
    expect(state.users[user.id].saved).toEqual(["parasite-2019"]);

    toggleLike(user.id, "arrival-2016");
    state = getCommunitySnapshot();
    expect(state.users[user.id].liked).toEqual([]);

    const other = Object.values(state.users).find((u) => u.seeded)!;
    toggleCoStar(user.id, other.id);
    state = getCommunitySnapshot();
    expect(state.users[user.id].coStars).toContain(other.id);
    expect(state.users[other.id].coStars).toContain(user.id);
    toggleCoStar(user.id, other.id);
    state = getCommunitySnapshot();
    expect(state.users[user.id].coStars).not.toContain(other.id);
    expect(state.users[other.id].coStars).not.toContain(user.id);
  });

  it("updates profile fields and privacy settings", async () => {
    const user = await signUp(account);
    updateProfile(user.id, {
      displayName: "  New Name  ",
      bio: "Loves slow cinema.",
      avatar: "aurora",
      privacy: { discoverable: true, showLiked: true, showSaved: false },
    });
    const updated = getCommunitySnapshot().users[user.id];
    expect(updated.displayName).toBe("New Name");
    expect(updated.bio).toBe("Loves slow cinema.");
    expect(updated.avatar).toBe("aurora");
    expect(updated.privacy).toEqual({ discoverable: true, showLiked: true, showSaved: false });
  });

  it("persists across a fresh module load with the same storage", async () => {
    const user = await signUp(account);
    toggleLike(user.id, "arrival-2016");
    vi.resetModules();
    const fresh = await import("./store");
    const state = fresh.getCommunitySnapshot();
    expect(state.sessionUserId).toBe(user.id);
    expect(state.users[user.id].liked).toEqual(["arrival-2016"]);
  });
});