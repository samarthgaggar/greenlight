"use client";

import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

type NavbarProps = {
  onLogoClick?: () => void;
};

const NAV_LINKS = [
  { label: "Map",        href: "#workspace",       section: "workspace"      },
  { label: "AI",         href: "#recommendation",  section: "recommendation" },
  { label: "Guardrails", href: "#responsible-ai",  section: "responsible-ai" },
  { label: "Data",       href: "#data",            section: "data"           }
] as const;

export function Navbar({ onLogoClick }: NavbarProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  // Track which section is currently visible.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { threshold: 0.2, rootMargin: "-72px 0px 0px 0px" }
    );

    NAV_LINKS.forEach(({ section }) => {
      const el = document.getElementById(section);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Close mobile menu on Escape or outside click.
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

    document.addEventListener("keydown",   handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown",   handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [mobileOpen]);

  function handleNavClick() {
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-xl">
      <nav
        className="mx-auto flex h-16 w-[min(1180px,100%)] items-center justify-between px-5"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <a
          href="#top"
          className="flex items-center gap-3 text-[var(--text-primary)] no-underline"
          onClick={onLogoClick}
          aria-label="Greenlight — go to top"
        >
          <Image src="/greenlight-logo.svg" alt="" width={36} height={36} priority className="rounded-lg" />
          <span className="font-heading text-xl font-bold">Greenlight</span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 text-sm font-semibold md:flex">
          {NAV_LINKS.map(({ label, href, section }) => {
            const active = activeSection === section;
            return (
              <a
                key={section}
                href={href}
                className={`relative py-1 transition-colors ${
                  active
                    ? "text-[var(--primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                aria-current={active ? "location" : undefined}
              >
                {label}
                {active ? (
                  <span
                    className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--primary)]"
                    aria-hidden="true"
                  />
                ) : null}
              </a>
            );
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Mobile menu toggle */}
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
          {NAV_LINKS.map(({ label, href, section }) => {
            const active = activeSection === section;
            return (
              <a
                key={section}
                href={href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[var(--selected-bg)] text-[var(--primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                }`}
                aria-current={active ? "location" : undefined}
              >
                {active ? (
                  <span className="h-2 w-2 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-[var(--border)]" aria-hidden="true" />
                )}
                {label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
