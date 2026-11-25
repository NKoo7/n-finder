"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useCommunity, useHydrated } from "@/lib/community/use-community";

/** Full-screen opening: flowing cinema light, title, tagline, one door in. */
export function LandingHero() {
  const hydrated = useHydrated();
  const { user } = useCommunity();
  const enterHref = hydrated && user ? "/discover" : "/auth";

  return (
    <section
      aria-labelledby="landing-title"
      className="relative flex min-h-[calc(100dvh-4.25rem)] flex-col overflow-hidden"
    >
      {/* Vignette keeps the type readable over the global fluid light. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(11,7,22,0.6)_100%)]"
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <p className="animate-rise font-mono text-xs uppercase tracking-[0.3em] text-neon-green motion-reduce:animate-none">
          A cinema for your mood
        </p>
        <h1
          id="landing-title"
          className="animate-hero-zoom mt-6 font-display text-[clamp(4rem,14vw,10rem)] leading-none tracking-tight motion-reduce:animate-none"
        >
          <span className="text-aurora">N-Finder</span>
        </h1>
        <p className="animate-rise rise-delay-2 mt-5 font-display text-[clamp(1.3rem,3.5vw,2.1rem)] italic text-bone motion-reduce:animate-none">
          Find your way into your taste.
        </p>
        <div className="animate-rise rise-delay-3 mt-10 motion-reduce:animate-none">
          <Link
            href={enterHref}
            className="btn-spectrum inline-flex h-14 items-center gap-3 rounded-full px-10 text-lg font-medium"
          >
            Enter N-Finder
            <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
          <p className="mt-4 text-xs text-bone-dim">
            {hydrated && user
              ? `Welcome back, ${user.displayName}.`
              : "Sign in or create a free account to like, save and meet Co-Stars."}
          </p>
        </div>
      </div>

      <a
        href="#about"
        aria-label="Scroll to how N-Finder works"
        className="relative z-10 mx-auto mb-6 inline-flex size-11 items-center justify-center rounded-full border border-line-strong text-bone-muted transition-colors hover:border-neon-pink hover:text-neon-pink"
      >
        <ChevronDown aria-hidden="true" className="size-5 animate-float motion-reduce:animate-none" />
      </a>
    </section>
  );
}