"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE_NAV_LINKS } from "@/lib/nav-links";

type NavbarProps = {
  onLogoClick?: () => void;
};

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
    <header className="site-header">
      <nav aria-label="Main navigation" className="site-header-nav">
        <div className="site-nav-pill">
          <Link
            href="/"
            onClick={onLogoClick}
            className="site-nav-link site-nav-link--home hidden sm:inline"
            aria-label="Greenlight home"
          >
            Home
          </Link>
          <span className="site-nav-divider hidden sm:inline" aria-hidden="true" />
          {SITE_NAV_LINKS.map(({ label, href, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`site-nav-link ${active ? "site-nav-link--active" : ""}`}
              >
                {label}
              </Link>
            );
          })}
          <button
            type="button"
            className="site-nav-menu-btn sm:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </nav>

      <div className="site-header-toggle">
        <ThemeToggle style={{ "--toggle-size": "13px" } as CSSProperties} />
      </div>

      <div
        id="mobile-nav"
        ref={mobileMenuRef}
        className={`site-mobile-nav sm:hidden ${mobileOpen ? "site-mobile-nav--open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        <nav className="flex flex-col gap-0.5 p-2" aria-label="Mobile navigation">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={`site-mobile-nav-link ${pathname === "/" ? "site-mobile-nav-link--active" : ""}`}
          >
            Home
          </Link>
          {SITE_NAV_LINKS.map(({ label, href, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`site-mobile-nav-link ${active ? "site-mobile-nav-link--active" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
