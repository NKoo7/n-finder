"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Check, Heart, Pencil, Users, X } from "lucide-react";
import { Avatar } from "@/components/community/avatar";
import { MovieShelf } from "@/components/community/movie-shelf";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AVATAR_THEMES, type AvatarTheme, type PrivacySettings } from "@/lib/community/types";
import { useCommunity, useHydrated } from "@/lib/community/use-community";
import type { Movie } from "@/lib/movies/types";
import { cn } from "@/lib/utils";

type Tab = "liked" | "saved" | "costars";

const PRIVACY_FIELDS: { key: keyof PrivacySettings; label: string; hint: string }[] = [
  { key: "discoverable", label: "Appear in Co-Star discovery", hint: "Let people with similar taste find you." },
  { key: "showLiked", label: "Show my liked movies", hint: "Visible on your public profile." },
  { key: "showSaved", label: "Show my saved movies", hint: "Visible on your public profile." },
];

export function ProfileView({ movies }: { movies: readonly Movie[] }) {
  const hydrated = useHydrated();
  const community = useCommunity();
  const { user } = community;
  const [tab, setTab] = useState<Tab>("liked");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<AvatarTheme>("sunset");
  const [privacy, setPrivacy] = useState<PrivacySettings>({ discoverable: false, showLiked: false, showSaved: false });
  const [savedFlash, setSavedFlash] = useState(false);

  const byId = useMemo(() => new Map(movies.map((m) => [m.id, m])), [movies]);

  if (!hydrated) return <div className="mt-10 min-h-40" aria-hidden="true" />;
  if (!user) {
    return (
      <div className="mt-10">
        <EmptyState
          title="Sign in to see your profile"
          description="Your likes, saved movies and Co-Stars live in your account."
          action={<ButtonLink href="/auth" className="btn-spectrum rounded-full text-white">Sign in or create account</ButtonLink>}
        />
      </div>
    );
  }

  const likedMovies = user.liked.flatMap((id) => { const m = byId.get(id); return m ? [m] : []; });
  const savedMovies = user.saved.flatMap((id) => { const m = byId.get(id); return m ? [m] : []; });
  const coStars = user.coStars.flatMap((id) => { const u = community.state.users[id]; return u ? [u] : []; });

  function startEdit() {
    if (!user) return;
    setName(user.displayName);
    setBio(user.bio);
    setAvatar(user.avatar);
    setPrivacy({ ...user.privacy });
    setEditing(true);
  }

  function saveEdit() {
    community.updateProfile({ displayName: name, bio, avatar, privacy });
    setEditing(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  }

  return (
    <div className="mt-10">
      <div className="glass-panel relative overflow-hidden p-7 sm:p-9">
        <div aria-hidden="true" className="aurora-blob animate-aurora-slow right-[-10%] top-[-40%] h-64 w-64 text-neon-violet-deep opacity-20" />
        {editing ? (
          <div className="relative max-w-xl">
            <h2 className="font-display text-3xl text-bone">Edit profile</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="profile-name" className="mb-1.5 block text-sm text-bone-muted">Display name</label>
                <input id="profile-name" className="field-input" value={name} onChange={(e) => setName(e.currentTarget.value)} minLength={2} />
              </div>
              <div>
                <label htmlFor="profile-bio" className="mb-1.5 block text-sm text-bone-muted">Short bio</label>
                <textarea id="profile-bio" className="field-input min-h-20 resize-y" value={bio} onChange={(e) => setBio(e.currentTarget.value)} maxLength={200} placeholder="What kind of films do you live for?" />
              </div>
              <fieldset>
                <legend className="mb-2 text-sm text-bone-muted">Profile picture</legend>
                <div className="flex flex-wrap gap-2.5">
                  {AVATAR_THEMES.map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => setAvatar(theme)}
                      aria-pressed={avatar === theme}
                      aria-label={`Avatar theme: ${theme}`}
                      className={cn(
                        "rounded-full transition-all",
                        avatar === theme ? "ring-2 ring-neon-green ring-offset-2 ring-offset-ink-900" : "opacity-70 hover:opacity-100",
                      )}
                    >
                      <Avatar name={name || user.displayName} theme={theme} className="size-11 text-sm" />
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="rounded-xl border border-line p-4">
                <legend className="px-1 text-sm font-medium text-bone">Privacy</legend>
                <div className="space-y-3">
                  {PRIVACY_FIELDS.map((field) => (
                    <label key={field.key} className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={privacy[field.key]}
                        onChange={(e) => {
                          const { checked } = e.currentTarget;
                          setPrivacy((p) => ({ ...p, [field.key]: checked }));
                        }}
                        className="mt-1 size-4 accent-neon-green"
                      />
                      <span>
                        <span className="block text-sm text-bone">{field.label}</span>
                        <span className="block text-xs text-bone-dim">{field.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="flex gap-3">
                <Button onClick={saveEdit} className="bg-neon-green-deep text-white hover:bg-neon-green">
                  <Check aria-hidden="true" className="mr-2 size-4" />
                  Save changes
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  <X aria-hidden="true" className="mr-2 size-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-wrap items-start gap-6">
            <Avatar name={user.displayName} theme={user.avatar} className="size-24 text-3xl" />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-4xl text-bone">{user.displayName}</h1>
              <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-bone-dim">
                Joined {user.joined}
                {!user.privacy.discoverable ? " · Private profile" : " · Discoverable"}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-bone-muted">
                {user.bio || "No bio yet — tell the community what you love watching."}
              </p>
              <div className="mt-4 flex flex-wrap gap-5 text-sm">
                <span className="flex items-center gap-1.5 text-neon-pink"><Heart aria-hidden="true" className="size-4" /> {user.liked.length} liked</span>
                <span className="flex items-center gap-1.5 text-neon-green"><Bookmark aria-hidden="true" className="size-4" /> {user.saved.length} saved</span>
                <span className="flex items-center gap-1.5 text-neon-violet"><Users aria-hidden="true" className="size-4" /> {user.coStars.length} Co-Stars</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button variant="outline" onClick={startEdit}>
                <Pencil aria-hidden="true" className="mr-2 size-4" />
                Edit profile
              </Button>
              {savedFlash ? (
                <p role="status" className="flex items-center gap-1 text-xs text-neon-green">
                  <Check aria-hidden="true" className="size-3.5" /> Profile updated
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <div role="tablist" aria-label="Profile sections" className="mt-8 flex gap-1 rounded-full border border-line bg-ink-900 p-1 sm:w-fit">
        {([
          { id: "liked", label: `Liked (${likedMovies.length})` },
          { id: "saved", label: `Saved (${savedMovies.length})` },
          { id: "costars", label: `Co-Stars (${coStars.length})` },
        ] as const).map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-full px-5 py-2 text-sm font-medium transition-colors sm:flex-none",
              tab === t.id ? "bg-neon-violet-deep text-white" : "text-bone-muted hover:text-bone",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "liked" ? (
          <MovieShelf
            movies={likedMovies}
            emptyTitle="No likes yet"
            emptyDescription="Tap the heart on any film in Discover and it will show up here — and shape your recommendations."
            emptyAction={<ButtonLink href="/discover">Go to Discover</ButtonLink>}
          />
        ) : tab === "saved" ? (
          <MovieShelf
            movies={savedMovies}
            emptyTitle="Nothing saved yet"
            emptyDescription="Use the bookmark on any film to build your watchlist."
            emptyAction={<ButtonLink href="/discover">Go to Discover</ButtonLink>}
          />
        ) : coStars.length === 0 ? (
          <EmptyState
            title="No Co-Stars yet"
            description="Find people with similar taste and connect."
            action={<ButtonLink href="/people">Meet Co-Stars</ButtonLink>}
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coStars.map((u) => (
              <li key={u.id}>
                <Link href={`/profile/${u.id}`} className="glass-panel flex items-center gap-4 p-5 transition-colors hover:border-neon-violet">
                  <Avatar name={u.displayName} theme={u.avatar} className="size-12 text-base" />
                  <span className="min-w-0">
                    <span className="block truncate font-display text-xl text-bone">{u.displayName}</span>
                    <span className="block truncate text-xs text-bone-muted">{u.bio}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}