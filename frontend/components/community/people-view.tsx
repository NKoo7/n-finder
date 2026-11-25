"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Users } from "lucide-react";
import { Avatar } from "@/components/community/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { coStarSuggestions } from "@/lib/community/logic";
import { useCommunity } from "@/lib/community/use-community";
import type { Movie } from "@/lib/movies/types";
import { cn } from "@/lib/utils";

export function PeopleView({ movies }: { movies: readonly Movie[] }) {
  const router = useRouter();
  const community = useCommunity();
  const [query, setQuery] = useState("");

  const suggestions = useMemo(
    () => coStarSuggestions(community.state, community.user?.id ?? null, movies),
    [community.state, community.user?.id, movies],
  );
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suggestions;
    return suggestions.filter(
      (s) =>
        s.user.displayName.toLowerCase().includes(q) ||
        s.topGenres.some((g) => g.toLowerCase().includes(q)) ||
        s.sharedTitles.some((t) => t.toLowerCase().includes(q)),
    );
  }, [suggestions, query]);

  function connect(otherId: string) {
    if (!community.user) {
      router.push("/auth");
      return;
    }
    community.toggleCoStar(otherId);
  }

  return (
    <div className="mt-10">
      {!community.user ? (
        <div className="glass-panel mb-8 flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="text-sm text-bone-muted">
            You&rsquo;re browsing as a guest. Sign in to connect with Co-Stars and get taste matches.
          </p>
          <ButtonLink href="/auth" className="btn-spectrum rounded-full text-white">
            Sign in
          </ButtonLink>
        </div>
      ) : null}

      <div className="relative max-w-md">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-bone-dim" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search people, genres or shared films..."
          aria-label="Search Co-Stars"
          className="field-input pl-10"
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No Co-Stars found"
          description="Try a different name or genre. New profiles appear here when they choose to be discoverable."
        />
      ) : (
        <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map(({ user, score, sharedTitles, topGenres }) => {
            const connected = community.isCoStar(user.id);
            return (
              <li key={user.id} className="glass-panel flex flex-col p-6">
                <div className="flex items-start gap-4">
                  <Avatar name={user.displayName} theme={user.avatar} className="size-14 text-lg" />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/profile/${user.id}`}
                      className="block truncate font-display text-2xl text-bone transition-colors hover:text-neon-violet"
                    >
                      {user.displayName}
                    </Link>
                    <p className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-bone-dim">
                      {user.coStars.length} Co-Star{user.coStars.length === 1 ? "" : "s"}
                      {community.user ? ` · ${score}% taste match` : ""}
                    </p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-bone-muted">{user.bio}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {topGenres.map((g) => (
                    <span key={g} className="rounded-full border border-neon-violet/40 bg-neon-violet/10 px-2.5 py-0.5 text-[0.65rem] font-medium text-neon-violet">
                      {g}
                    </span>
                  ))}
                </div>
                {sharedTitles.length > 0 ? (
                  <p className="mt-3 text-xs leading-relaxed text-neon-green">
                    Both liked: {sharedTitles.slice(0, 3).join(", ")}
                    {sharedTitles.length > 3 ? ` +${sharedTitles.length - 3} more` : ""}
                  </p>
                ) : null}
                <div className="mt-auto flex gap-2 pt-5">
                  <Button
                    variant={connected ? "outline" : "primary"}
                    aria-pressed={connected}
                    onClick={() => connect(user.id)}
                    className={cn(
                      "flex-1",
                      connected
                        ? "border-neon-green text-neon-green"
                        : "bg-neon-violet-deep text-white hover:bg-neon-violet",
                    )}
                  >
                    {connected ? (
                      <>
                        <Users aria-hidden="true" className="mr-2 size-4" />
                        Co-Stars
                      </>
                    ) : (
                      <>
                        <UserPlus aria-hidden="true" className="mr-2 size-4" />
                        Connect
                      </>
                    )}
                  </Button>
                  <ButtonLink href={`/profile/${user.id}`} variant="outline" className="flex-1">
                    View profile
                  </ButtonLink>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-8 text-xs leading-relaxed text-bone-dim">
        Profiles are private by default — only people who opt into discovery appear here, and they
        choose separately whether their liked and saved lists are visible.
      </p>
    </div>
  );
}