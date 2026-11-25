"use client";

import { useSyncExternalStore } from "react";
import {
  getCommunitySnapshot,
  getServerCommunitySnapshot,
  signOut,
  subscribeCommunity,
  toggleCoStar,
  toggleLike,
  toggleSave,
  updateProfile,
} from "./store";
import type { CommunityState, CommunityUser } from "./types";

const subscribeNothing = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNothing, () => true, () => false);
}

export function useCommunity() {
  const state: CommunityState = useSyncExternalStore(
    subscribeCommunity,
    getCommunitySnapshot,
    getServerCommunitySnapshot,
  );
  const user = state.sessionUserId ? (state.users[state.sessionUserId] ?? null) : null;
  return {
    state,
    user,
    signOut,
    toggleLike: (movieId: string) => user && toggleLike(user.id, movieId),
    toggleSave: (movieId: string) => user && toggleSave(user.id, movieId),
    toggleCoStar: (otherId: string) => user && toggleCoStar(user.id, otherId),
    updateProfile: (patch: Parameters<typeof updateProfile>[1]) =>
      user && updateProfile(user.id, patch),
    hasLiked: (movieId: string) => !!user?.liked.includes(movieId),
    hasSaved: (movieId: string) => !!user?.saved.includes(movieId),
    isCoStar: (otherId: string) => !!user?.coStars.includes(otherId),
  };
}

export type CommunityApi = ReturnType<typeof useCommunity>;
export type { CommunityUser };