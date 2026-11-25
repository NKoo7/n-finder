"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Bookmark, LogOut, Menu, User, X } from "lucide-react";
import { Avatar } from "@/components/community/avatar";
import { Container } from "@/components/ui/container";
import { useCommunity, useHydrated } from "@/lib/community/use-community";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/discover", label: "Discover" },
  { href: "/people", label: "Co-Stars" },
  { href: "/watchlist", label: "Saved" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const { user, signOut } = useCommunity();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  function handleSignOut() {
    signOut();
    setMenuOpen(false);
    setOpen(false);
    router.push("/");
  }

  return (
    <header
      onKeyDown={onKeyDown}
      className="sticky top-0 z-50 border-b border-line bg-ink-950/95"
    >
      <div
        aria-hidden="true"
        className="h-0.5 w-full bg-gradient-to-r from-neon-violet via-neon-pink to-neon-green"
      />
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="text-aurora font-display text-2xl tracking-tight"
          aria-label="N-Finder, home"
        >
          N-Finder
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3.5 py-2 text-sm transition-colors",
                isActive(item.href) ? "text-neon-green" : "text-bone-muted hover:text-bone",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {hydrated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label={`Profile menu for ${user.displayName}`}
                className="flex items-center gap-2 rounded-full border border-line-strong p-1 pr-3 transition-colors hover:border-neon-violet"
              >
                <Avatar name={user.displayName} theme={user.avatar} className="size-8 text-xs" />
                <span className="hidden max-w-28 truncate text-sm text-bone md:block">
                  {user.displayName}
                </span>
              </button>
              {menuOpen ? (
                <div
                  role="menu"
                  aria-label="Profile"
                  className="glass-panel absolute right-0 top-full mt-2 w-52 overflow-hidden p-1.5"
                >
                  <Link
                    href="/profile"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-bone-muted transition-colors hover:bg-ink-800 hover:text-bone"
                  >
                    <User aria-hidden="true" className="size-4 text-neon-violet" />
                    Profile
                  </Link>
                  <Link
                    href="/watchlist"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-bone-muted transition-colors hover:bg-ink-800 hover:text-bone"
                  >
                    <Bookmark aria-hidden="true" className="size-4 text-neon-pink" />
                    Saved Movies
                  </Link>
                  <div className="my-1 h-px bg-line" aria-hidden="true" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-bone-muted transition-colors hover:bg-ink-800 hover:text-danger"
                  >
                    <LogOut aria-hidden="true" className="size-4" />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/auth"
              className="btn-spectrum hidden h-9 items-center rounded-full px-5 text-sm font-medium sm:inline-flex"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-10 items-center justify-center rounded-md text-bone-muted transition-colors hover:bg-ink-800 hover:text-bone sm:hidden"
          >
            {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </button>
        </div>
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
                isActive(item.href) ? "text-neon-green" : "text-bone-muted hover:text-bone",
              )}
            >
              {item.label}
            </Link>
          ))}
          {hydrated && user ? (
            <>
              <Link href="/profile" onClick={() => setOpen(false)} className="rounded-md px-1 py-3 text-base text-bone-muted hover:text-bone">
                Profile
              </Link>
              <button type="button" onClick={handleSignOut} className="rounded-md px-1 py-3 text-left text-base text-bone-muted hover:text-danger">
                Log out
              </button>
            </>
          ) : (
            <Link href="/auth" onClick={() => setOpen(false)} className="rounded-md px-1 py-3 text-base text-neon-pink">
              Sign in
            </Link>
          )}
        </Container>
      </nav>
    </header>
  );
}