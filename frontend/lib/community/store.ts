/**
 * Demo-mode community + auth store (localStorage, useSyncExternalStore-shaped).
 *
 * DEMO MODE: accounts live in this browser only; passwords are salted SHA-256 hashes and
 * seeded profiles are fictional. A production deployment needs a real auth service
 * (e.g. NextAuth/Auth.js or the FastAPI backend with sessions) plus a database — the
 * action surface below is deliberately API-shaped so it can be swapped for fetch calls.
 */
import { hashString } from "@/lib/movies/poster-art";
import { parseWatchlist, WATCHLIST_KEY } from "@/lib/watchlist/storage";
import { SEED_USERS } from "./seed";
import {
  DEFAULT_PRIVACY,
  EMPTY_COMMUNITY,
  type AvatarTheme,
  type CommunityState,
  type CommunityUser,
  type PrivacySettings,
} from "./types";

const COMMUNITY_KEY = "nfinder.community.v1";

type StoredUser = CommunityUser & { passwordHash?: string };
interface Persisted {
  users: Record<string, StoredUser>;
  sessionUserId: string | null;
}

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: { raw: string | null; state: CommunityState } | null = null;
let memory: CommunityState | null = null;

function emit() {
  listeners.forEach((l) => l());
}

function seededPersisted(): Persisted {
  return {
    users: Object.fromEntries(SEED_USERS.map((u) => [u.id, { ...u }])),
    sessionUserId: null,
  };
}

function publicProfile(u: StoredUser): CommunityUser {
  const profile = { ...u };
  delete profile.passwordHash;
  return profile;
}

function toState(p: Persisted, status: CommunityState["status"] = "ok"): CommunityState {
  const users: Record<string, CommunityUser> = {};
  for (const [id, u] of Object.entries(p.users)) {
    users[id] = publicProfile(u);
  }
  return { users, sessionUserId: p.sessionUserId, status };
}

function readPersisted(): Persisted | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(COMMUNITY_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Persisted;
    if (parsed && typeof parsed === "object" && parsed.users) return parsed;
  } catch {
    // Corrupted storage: start fresh from seeds rather than breaking the app.
  }
  return null;
}

export function getCommunitySnapshot(): CommunityState {
  if (memory) return memory;
  let raw: string | null;
  try {
    raw = localStorage.getItem(COMMUNITY_KEY);
  } catch {
    memory = toState(seededPersisted(), "unavailable");
    return memory;
  }
  if (cache && cache.raw === raw) return cache.state;
  const state = toState(readPersisted() ?? seededPersisted());
  cache = { raw, state };
  return state;
}

export function getServerCommunitySnapshot(): CommunityState {
  return EMPTY_COMMUNITY;
}

export function subscribeCommunity(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === COMMUNITY_KEY || event.key === null) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function mutate(fn: (p: Persisted) => Persisted) {
  const current = readPersisted() ?? seededPersisted();
  const next = fn(current);
  if (memory) {
    memory = toState(next, "unavailable");
  } else {
    try {
      localStorage.setItem(COMMUNITY_KEY, JSON.stringify(next));
      cache = null;
    } catch {
      memory = toState(next, "unavailable");
    }
  }
  emit();
}

export class AuthError extends Error {}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function hashPassword(email: string, password: string): Promise<string> {
  const input = `nfinder:${email.toLowerCase()}:${password}`;
  try {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Non-secure context fallback; demo mode only.
    return `fallback:${hashString(input)}`;
  }
}

function legacyWatchlistIds(): string[] {
  try {
    return [...parseWatchlist(localStorage.getItem(WATCHLIST_KEY)).ids];
  } catch {
    return [];
  }
}

export async function signUp(input: {
  displayName: string;
  email: string;
  password: string;
}): Promise<CommunityUser> {
  await wait(450);
  const displayName = input.displayName.trim();
  const email = input.email.trim().toLowerCase();
  if (displayName.length < 2) throw new AuthError("Display name needs at least 2 characters.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AuthError("Enter a valid email address.");
  if (input.password.length < 6) throw new AuthError("Password needs at least 6 characters.");
  const existing = Object.values((readPersisted() ?? seededPersisted()).users).find(
    (u) => u.email === email,
  );
  if (existing) throw new AuthError("An account with this email already exists. Sign in instead.");
  const passwordHash = await hashPassword(email, input.password);
  const id = `user-${hashString(email).toString(36)}`;
  const user: StoredUser = {
    id,
    displayName,
    bio: "",
    avatar: "sunset",
    email,
    seeded: false,
    joined: new Date().toISOString().slice(0, 10),
    privacy: { ...DEFAULT_PRIVACY },
    liked: [],
    saved: legacyWatchlistIds(),
    coStars: [],
    passwordHash,
  };
  mutate((p) => ({ users: { ...p.users, [id]: user }, sessionUserId: id }));
  return publicProfile(user);
}

export async function signIn(email: string, password: string): Promise<CommunityUser> {
  await wait(450);
  const normalized = email.trim().toLowerCase();
  const persisted = readPersisted() ?? seededPersisted();
  const user = Object.values(persisted.users).find((u) => u.email === normalized);
  if (!user || user.seeded) throw new AuthError("No account found for this email. Create one first.");
  const hash = await hashPassword(normalized, password);
  if (hash !== user.passwordHash) throw new AuthError("That password doesn't match. Try again.");
  const merged: StoredUser = {
    ...user,
    saved: [...new Set([...user.saved, ...legacyWatchlistIds()])],
  };
  mutate((p) => ({ users: { ...p.users, [user.id]: merged }, sessionUserId: user.id }));
  return publicProfile(merged);
}

export function signOut() {
  mutate((p) => ({ ...p, sessionUserId: null }));
}

export function updateProfile(
  userId: string,
  patch: Partial<Pick<CommunityUser, "displayName" | "bio" | "avatar">> & {
    privacy?: PrivacySettings;
  },
) {
  mutate((p) => {
    const user = p.users[userId];
    if (!user) return p;
    return {
      ...p,
      users: {
        ...p.users,
        [userId]: {
          ...user,
          ...(patch.displayName !== undefined ? { displayName: patch.displayName.trim() || user.displayName } : {}),
          ...(patch.bio !== undefined ? { bio: patch.bio } : {}),
          ...(patch.avatar !== undefined ? { avatar: patch.avatar as AvatarTheme } : {}),
          ...(patch.privacy ? { privacy: patch.privacy } : {}),
        },
      },
    };
  });
}

function toggleInList(list: readonly string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function toggleLike(userId: string, movieId: string) {
  mutate((p) => {
    const user = p.users[userId];
    if (!user) return p;
    return { ...p, users: { ...p.users, [userId]: { ...user, liked: toggleInList(user.liked, movieId) } } };
  });
}

export function toggleSave(userId: string, movieId: string) {
  mutate((p) => {
    const user = p.users[userId];
    if (!user) return p;
    return { ...p, users: { ...p.users, [userId]: { ...user, saved: toggleInList(user.saved, movieId) } } };
  });
}

/** Co-Star connections are mutual: both profiles list each other. */
export function toggleCoStar(userId: string, otherId: string) {
  mutate((p) => {
    const user = p.users[userId];
    const other = p.users[otherId];
    if (!user || !other || userId === otherId) return p;
    return {
      ...p,
      users: {
        ...p.users,
        [userId]: { ...user, coStars: toggleInList(user.coStars, otherId) },
        [otherId]: { ...other, coStars: toggleInList(other.coStars, userId) },
      },
    };
  });
}

/** Test helper. */
export function __resetCommunityStoreForTests() {
  cache = null;
  memory = null;
  listeners.clear();
}