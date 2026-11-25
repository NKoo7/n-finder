import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FluidBackground } from "@/components/layout/fluid-background";
import { Container } from "@/components/ui/container";

// Fonts are self-hosted (SIL OFL, see app/fonts/LICENSES.md); no runtime request to Google.
const sans = localFont({
  src: "./fonts/geist-latin-wght-normal.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/geist-mono-latin-wght-normal.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const display = localFont({
  src: [
    { path: "./fonts/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "N-finder: Find your next obsession",
    template: "%s | N-finder",
  },
  description:
    "Discover films by the experience you want, not just the genre. Tune how dark, intense, surreal, character-led and unpredictable your next watch should be.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

// Static shell shown while the interactive header (which reads the pathname and the
// browser-only community session) streams in. Same height as the real header: no shift.
function HeaderShell() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink-950/95">
      <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-neon-violet via-neon-pink to-neon-green" />
      <Container className="flex h-16 items-center justify-between">
        <span className="text-aurora font-display text-2xl tracking-tight">N-Finder</span>
      </Container>
    </header>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${display.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <FluidBackground />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink-950"
        >
          Skip to content
        </a>
        <Suspense fallback={<HeaderShell />}>
          <SiteHeader />
        </Suspense>
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
