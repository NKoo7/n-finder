import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Surface } from "@/components/ui/surface";
import { MOOD_DIMENSIONS } from "@/lib/mood-dimensions";

const STEPS = [
  {
    title: "Set the mood",
    body: "Five spectrums replace the genre aisle: tone, intensity, realism, focus and predictability. You place yourself on each one.",
  },
  {
    title: "Read why it fits",
    body: "Every recommendation is built to explain itself using the same film attributes that produced the ranking, including where it might not match.",
  },
  {
    title: "Step outside your usual",
    body: "Wildcard discovery is designed to pick something beyond your habits while still respecting the mood you chose.",
  },
] as const;

const COMMITMENTS = [
  {
    term: "Relative, not predictive",
    detail:
      "Match scores describe how closely a film lines up with your settings, compared with other films. They are never a probability that you will enjoy it.",
  },
  {
    term: "Labelled sample data",
    detail:
      "Until a licensed metadata source is connected, the catalogue is a curated sample and is marked as unverified. Nothing is passed off as authoritative.",
  },
  {
    term: "Plain, inspectable logic",
    detail:
      "Rankings come from deterministic, weighted attribute matching. N-finder does not claim machine learning where none exists.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section aria-labelledby="hero-title" className="border-b border-line">
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16 lg:py-24">
          <div>
            <Badge tone="accent">Cinematic discovery &middot; Early build</Badge>
            <h1
              id="hero-title"
              className="mt-6 font-display text-[clamp(3rem,8vw,5.75rem)] leading-[0.98] tracking-tight text-bone"
            >
              Find your next <span className="italic text-gold">obsession.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-bone-muted">
              Most sites ask which genre you like. N-finder asks a better question:
              what kind of experience do you want right now? Tell it how dark, how
              intense, how strange, and find films by feel.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href="/discover" size="lg" slideTo="Open Discover">
                Start exploring
              </ButtonLink>
              <ButtonLink href="#how-it-works" variant="outline" size="lg">
                How it works
              </ButtonLink>
            </div>
          </div>

          <Surface role="group" className="p-6 sm:p-7" aria-labelledby="spectrum-title">
            <p
              id="spectrum-title"
              className="font-mono text-xs uppercase tracking-[0.18em] text-gold"
            >
              Five spectrums
            </p>
            <ul className="mt-5 divide-y divide-line">
              {MOOD_DIMENSIONS.map((d) => (
                <li key={d.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="text-bone">{d.low}</span>
                    <span className="text-bone-muted">{d.high}</span>
                  </div>
                  <div
                    aria-hidden="true"
                    className="mt-2.5 h-px w-full bg-gradient-to-r from-gold-deep via-line-strong to-gold-deep"
                  />
                </li>
              ))}
            </ul>
          </Surface>
        </Container>
      </section>

      <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-20 py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="Mood in, reasons out."
            description="N-finder is built around three ideas. In this build the mood controls and explanations work on a labelled sample catalogue; Wildcard discovery and the server-side engine come later."
          />
          <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="bg-ink-950 p-7">
                <span className="font-mono text-xs tracking-[0.18em] text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-3xl text-bone">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-bone-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="commitments-title" className="border-t border-line py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <SectionHeading
            as="h2"
            eyebrow="Ground rules"
            title="Honest by design."
            description="A recommendation product is only useful if you can trust what it tells you."
          />
          <dl className="divide-y divide-line border-y border-line">
            {COMMITMENTS.map((c) => (
              <div key={c.term} className="grid gap-2 py-6 sm:grid-cols-[13rem_1fr] sm:gap-8">
                <dt className="font-display text-2xl text-bone">{c.term}</dt>
                <dd className="text-sm leading-relaxed text-bone-muted">{c.detail}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section aria-label="Get started" className="border-t border-line py-14">
        <Container className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="max-w-lg font-display text-3xl leading-tight text-bone sm:text-4xl">
            Ready to try it on the sample catalogue?
          </p>
          <ButtonLink href="/discover" variant="outline" size="lg">
            Go to Discover
            <ArrowUpRight aria-hidden="true" className="ml-2 size-4" />
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
