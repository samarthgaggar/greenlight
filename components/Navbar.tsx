"use client";

import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

type NavbarProps = {
  onLogoClick?: () => void;
};

export function Navbar({ onLogoClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-[min(1180px,100%)] items-center justify-between px-5">
        <a
          href="#top"
          className="flex items-center gap-3 text-[var(--text-primary)] no-underline"
          onClick={onLogoClick}
        >
          <Image src="/greenlight-logo.svg" alt="" width={36} height={36} priority className="rounded-lg" />
          <span className="font-heading text-xl font-bold">Greenlight</span>
        </a>
        <div className="hidden items-center gap-6 text-sm font-semibold text-[var(--text-secondary)] md:flex">
          <a href="#workspace" className="hover:text-[var(--text-primary)]">
            Map
          </a>
          <a href="#recommendation" className="hover:text-[var(--text-primary)]">
            AI
          </a>
          <a href="#responsible-ai" className="hover:text-[var(--text-primary)]">
            Guardrails
          </a>
          <a href="#data" className="hover:text-[var(--text-primary)]">
            Data
          </a>
        </div>
        <ThemeToggle />
      </nav>
    </header>
  );
}
