export const AVATAR_THEMES = ["violet", "pink", "green", "blue", "sunset", "aurora"] as const;
export type AvatarTheme = (typeof AVATAR_THEMES)[number];

export interface PrivacySettings {
  /** Appear in Co-Star discovery. */
  discoverable: boolean;
  showLiked: boolean;
  showSaved: boolean;
}

export const DEFAULT_PRIVACY: PrivacySettings = {
  discoverable: false,
  showLiked: false,
  showSaved: false,
};

export interface CommunityUser {
  id: string;
  displayName: string;
  bio: string;
  avatar: AvatarTheme;
  email: string | null;
  /** Seeded community profiles are demo characters, not sign-in-able accounts. */
  seeded: boolean;
  joined: string;
  privacy: PrivacySettings;
  liked: readonly string[];
  saved: readonly string[];
  coStars: readonly string[];
}

export interface CommunityState {
  users: Readonly<Record<string, CommunityUser>>;
  sessionUserId: string | null;
  status: "ok" | "unavailable";
}

export const EMPTY_COMMUNITY: CommunityState = {
  users: {},
  sessionUserId: null,
  status: "ok",
};