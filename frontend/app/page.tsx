import { Clapperboard, Heart, Users } from "lucide-react";
import { LandingHero } from "@/components/landing/landing-hero";
import { Container } from "@/components/ui/container";

const PILLARS = [
  {
    icon: Clapperboard,
    title: "Search by anything",
    body: "Title, actor, director — or just the mood you're in. Films slide into place as you tune your taste.",
    color: "#a78bfa",
  },
  {
    icon: Heart,
    title: "Like it, save it",
    body: "Every like teaches N-Finder your taste and unlocks recommendations that explain why they fit.",
    color: "#f472b6",
  },
  {
    icon: Users,
    title: "Meet your Co-Stars",
    body: "Find people who love the same frames you do. Private by default — share only what you choose.",
    color: "#4ade80",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <LandingHero />

      <section id="about" aria-labelledby="about-title" className="relative scroll-mt-20 overflow-hidden py-16 sm:py-20">
        <div
          aria-hidden="true"
          className="aurora-blob animate-aurora-slow right-[-12%] top-[10%] h-[24rem] w-[24rem] text-neon-violet-deep opacity-15"
        />
        <Container className="relative">
          <h2 id="about-title" className="text-center font-display text-3xl text-bone sm:text-4xl">
            Three scenes. <span className="text-aurora italic">One you.</span>
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="glass-panel group p-7 transition-transform duration-300 ease-[var(--ease-cine)] hover:-translate-y-1.5 motion-reduce:transition-none"
              >
                <span
                  className="inline-flex size-11 items-center justify-center rounded-xl"
                  style={{ background: `${pillar.color}1a`, color: pillar.color }}
                >
                  <pillar.icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-2xl text-bone">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-bone-muted">{pillar.body}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-bone-dim">
            Demo build: the catalogue is a curated sample with labelled sample ratings, and accounts
            live in your browser. Connect a licensed metadata API and a real auth service to go live.
          </p>
        </Container>
      </section>
    </>
  );
}