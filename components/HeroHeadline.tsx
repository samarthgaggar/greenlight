"use client";

import { useEffect, useState } from "react";
import { Typewriter } from "@/components/ui/typewriter";

const HERO_PHRASES = [
  "the local system blocks it.",
  "bike routes feel unsafe.",
  "compost bins are missing.",
  "transit stops are too far.",
  "crosswalks stay unclear."
];

export function HeroHeadline() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <h1 className="max-w-3xl font-heading text-5xl font-bold leading-[1.02] text-[var(--text-primary)] md:text-7xl">
      <span className="block">Climate action fails when</span>
      {reduceMotion ? (
        <span className="block text-[var(--primary)]">{HERO_PHRASES[0]}</span>
      ) : (
        <Typewriter
          text={HERO_PHRASES}
          speed={55}
          initialDelay={400}
          waitTime={2200}
          deleteSpeed={28}
          className="block text-[var(--primary)]"
          cursorChar="_"
          cursorClassName="ml-0.5 text-[var(--primary)]"
        />
      )}
    </h1>
  );
}
