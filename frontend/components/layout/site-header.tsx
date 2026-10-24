"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type KeyboardEvent } from "react";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/discover", label: "Discover" },
  { href: "/watchlist", label: "Watchlist" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && open) setOpen(false);
  };

  return (
    <header
      onKeyDown={onKeyDown}
      className="sticky top-0 z-50 border-b border-line bg-ink-950/95"
    >
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="font-display text-2xl tracking-tight text-bone"
          aria-label="N-finder, home"
        >
          N-finder
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3.5 py-2 text-sm transition-colors",
                isActive(item.href)
                  ? "text-gold"
                  : "text-bone-muted hover:text-bone",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex size-10 items-center justify-center rounded-md text-bone-muted transition-colors hover:bg-ink-800 hover:text-bone sm:hidden"
        >
          {open ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
        </button>
      </Container>

      <nav
        id="mobile-nav"
        aria-label="Primary mobile"
        hidden={!open}
        className="border-t border-line sm:hidden"
      >
        <Container className="flex flex-col py-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-1 py-3 text-base transition-colors",
                isActive(item.href) ? "text-gold" : "text-bone-muted hover:text-bone",
              )}
            >
              {item.label}
            </Link>
          ))}
        </Container>
      </nav>
    </header>
  );
}
