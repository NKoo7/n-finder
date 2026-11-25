"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Popcorn } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { signIn, signUp, AuthError } from "@/lib/community/store";
import { useCommunity, useHydrated } from "@/lib/community/use-community";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export function AuthForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { user } = useCommunity();
  const [mode, setMode] = useState<Mode>("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        await signUp({ displayName, email, password });
      } else {
        await signIn(email, password);
      }
      router.push("/discover");
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Something went wrong. Try again.");
      setBusy(false);
    }
  }

  if (hydrated && user) {
    return (
      <div className="glass-panel w-full max-w-md p-8 text-center">
        <Popcorn aria-hidden="true" className="mx-auto size-10 text-neon-pink" />
        <h1 className="mt-4 font-display text-3xl text-bone">You&rsquo;re already in.</h1>
        <p className="mt-2 text-sm text-bone-muted">
          Signed in as <span className="text-neon-green">{user.displayName}</span>.
        </p>
        <ButtonLink href="/discover" className="btn-spectrum mt-6 w-full rounded-full text-white">
          Go to Discover
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="glass-panel w-full max-w-md p-8">
      <h1 className="text-center font-display text-4xl text-bone">
        {mode === "signin" ? "Welcome back." : "Join the cast."}
      </h1>
      <p className="mt-2 text-center text-sm text-bone-muted">
        {mode === "signin"
          ? "Sign in to like, save and find your Co-Stars."
          : "Create an account to start building your taste."}
      </p>

      <div role="tablist" aria-label="Sign in or create account" className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-line bg-ink-850 p-1">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={cn(
              "rounded-full py-2 text-sm font-medium transition-colors",
              mode === m ? "bg-neon-violet-deep text-white" : "text-bone-muted hover:text-bone",
            )}
          >
            {m === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {mode === "signup" ? (
          <div>
            <label htmlFor="auth-name" className="mb-1.5 block text-sm text-bone-muted">
              Display name
            </label>
            <input
              id="auth-name"
              className="field-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.currentTarget.value)}
              placeholder="How the community sees you"
              autoComplete="nickname"
              required
              minLength={2}
            />
          </div>
        ) : null}
        <div>
          <label htmlFor="auth-email" className="mb-1.5 block text-sm text-bone-muted">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            className="field-input"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label htmlFor="auth-password" className="mb-1.5 block text-sm text-bone-muted">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            className="field-input"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={6}
          />
        </div>

        {error ? (
          <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={busy} className="btn-spectrum w-full rounded-full text-white">
          {busy ? (
            <>
              <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />
              {mode === "signin" ? "Signing in..." : "Creating your account..."}
            </>
          ) : mode === "signin" ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs leading-relaxed text-bone-dim">
        Demo mode: accounts are stored in this browser only. A production build connects a real
        auth service — no passwords ever leave this device here.
      </p>
    </div>
  );
}