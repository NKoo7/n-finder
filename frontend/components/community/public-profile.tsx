"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, UserPlus, Users } from "lucide-react";
import { Avatar } from "@/components/community/avatar";
import { MovieShelf } from "@/components/community/movie-shelf";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useCommunity, useHydrated } from "@/lib/community/use-community";
import type { Movie } from "@/lib/movies/types";

export function PublicProfile({ id, movies }: { id: string; movies: readonly Movie[] }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const community = useCommunity();
  const profile = community.state.users[id];
  const isSelf = community.user?.id === id;

  useEffect(() => {
    if (hydrated && isSelf) router.replace("/profile");
  }, [hydrated, isSelf, router]);

  const byId = useMemo(() => new Map(movies.map((m) => [m.id, m])), [movies]);

  if (!hydrated) return <div className="mt-10 min-h-40" aria-hidden="true" />;
  if (!profile) {
    return (
      <div className="mt-10">
        <EmptyState
          title="Profile not found"
          description="This person doesn't exist in the demo community."
          action={<ButtonLink href="/people">Back to Co-Stars</ButtonLink>}
        />
      </div>
    );
  }

  const connected = community.isCoStar(profile.id);
  const canSeeLists = profile.privacy.discoverable || connected;
  const likedMovies = profile.liked.flatMap((mid) => { const m = byId.get(mid); return m ? [m] : []; });
  const savedMovies = profile.saved.flatMap((mid) => { const m = byId.get(mid); return m ? [m] : []; });

  function connect() {
    if (!community.user) {
      router.push("/auth");
      return;
    }
    community.toggleCoStar(profile!.id);
  }

  return (
    <div className="mt-10">
      <div className="glass-panel relative overflow-hidden p-7 sm:p-9">
        <div aria-hidden="true" className="aurora-blob animate-aurora-slow right-[-10%] top-[-40%] h-64 w-64 text-neon-pink-deep opacity-20" />
        <div className="relative flex flex-wrap items-start gap-6">
          <Avatar name={profile.displayName} theme={profile.avatar} className="size-24 text-3xl" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-4xl text-bone">{profile.displayName}</h1>
            <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-bone-dim">
              Joined {profile.joined} · {profile.coStars.length} Co-Star{profile.coStars.length === 1 ? "" : "s"}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-bone-muted">{profile.bio}</p>
          </div>
          <Button
            variant={connected ? "outline" : "primary"}
            aria-pressed={connected}
            onClick={connect}
            className={
              connected
                ? "border-neon-green text-neon-green"
                : "bg-neon-violet-deep text-white hover:bg-neon-violet"
            }
          >
            {connected ? (
              <>
                <Users aria-hidden="true" className="mr-2 size-4" />
                Co-Stars
              </>
            ) : (
              <>
                <UserPlus aria-hidden="true" className="mr-2 size-4" />
                Connect with this Co-Star
              </>
            )}
          </Button>
        </div>
      </div>

      {!canSeeLists ? (
        <div className="glass-panel mt-8 flex items-center gap-4 p-6">
          <Lock aria-hidden="true" className="size-6 shrink-0 text-neon-violet" />
          <p className="text-sm leading-relaxed text-bone-muted">
            This profile is private. {profile.displayName} keeps their lists hidden until they choose
            to share or you connect as Co-Stars.
          </p>
        </div>
      ) : (
        <>
          {profile.privacy.showLiked ? (
            <section aria-labelledby="public-liked" className="mt-10">
              <h2 id="public-liked" className="font-display text-2xl text-bone">
                Liked <span className="text-neon-pink">films</span>
              </h2>
              <div className="mt-5">
                <MovieShelf
                  movies={likedMovies}
                  emptyTitle="No likes shared yet"
                  emptyDescription="When they like films, they'll appear here."
                />
              </div>
            </section>
          ) : null}
          {profile.privacy.showSaved ? (
            <section aria-labelledby="public-saved" className="mt-10">
              <h2 id="public-saved" className="font-display text-2xl text-bone">
                Saved <span className="text-neon-green">for later</span>
              </h2>
              <div className="mt-5">
                <MovieShelf
                  movies={savedMovies}
                  emptyTitle="Nothing saved yet"
                  emptyDescription="Their watchlist is empty for now."
                />
              </div>
            </section>
          ) : null}
          {!profile.privacy.showLiked && !profile.privacy.showSaved ? (
            <p className="mt-8 text-sm text-bone-dim">
              {profile.displayName} hasn&rsquo;t shared their lists publicly.
            </p>
          ) : null}
        </>
      )}

      <p className="mt-10 text-xs text-bone-dim">
        <Link href="/people" className="text-neon-violet hover:underline">
          Back to Co-Star discovery
        </Link>
      </p>
    </div>
  );
}