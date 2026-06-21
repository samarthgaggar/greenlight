"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

type NavbarProps = {
  onLogoClick?: () => void;
};

const NAV_LINKS = [
  { label: "Home",       href: "/",            match: (p: string) => p === "/"           },
  { label: "Simulator",  href: "/simulator",   match: (p: string) => p === "/simulator"  },
  { label: "Map",        href: "/map",         match: (p: string) => p === "/map"        },
  { label: "AI",         href: "/ai",          match: (p: string) => p === "/ai"         },
  { label: "Guardrails", href: "/guardrails",  match: (p: string) => p === "/guardrails" },
  { label: "Data",       href: "/data",        match: (p: string) => p === "/data"       }
] as const;

export function Navbar({ onLogoClick }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    function handleClick(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-xl">
      <nav
        className="mx-auto flex h-16 w-[min(1180px,100%)] items-center justify-between px-5"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 text-[var(--text-primary)] no-underline"
          onClick={onLogoClick}
          aria-label="Greenlight — go to home"
        >
          <Image src="/greenlight-logo.svg" alt="" width={36} height={36} priority className="rounded-lg" />
          <span className="font-heading text-xl font-bold">Greenlight</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 text-sm font-semibold md:flex">
          {NAV_LINKS.map(({ label, href, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                className={`relative py-1 transition-colors ${
                  active
                    ? "text-[var(--primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {label}
                {active ? (
                  <span
                    className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--primary)]"
                    aria-hidden="true"
                  />
                ) : null}
              </Link>
            );
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="icon-button md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      <div
        id="mobile-nav"
        ref={mobileMenuRef}
        className={`absolute left-0 right-0 top-full z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_96%,transparent)] backdrop-blur-xl transition-all duration-200 md:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!mobileOpen}
      >
        <nav className="flex flex-col px-5 pb-4 pt-2" aria-label="Mobile navigation">
          {NAV_LINKS.map(({ label, href, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[var(--selected-bg)] text-[var(--primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={`h-2 w-2 rounded-full ${active ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`}
                  aria-hidden="true"
                />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
