"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE_NAV_LINKS } from "@/lib/nav-links";

const FADE_MS = 2000;
const SLIDE_INTERVAL_MS = 7000;

/** Moody nature scenes — similar exposure so hero text stays legible */
const BACKGROUND_SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=85",
    label: "Misty evergreen forest"
  },
  {
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2400&q=85",
    label: "Foggy mountain valley"
  },
  {
    url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=2400&q=85",
    label: "Alpine lake and peaks"
  },
  {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=85",
    label: "Snow-capped mountain range"
  },
  {
    url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2400&q=85",
    label: "Green hills at sunrise"
  }
] as const;

function HeroBackgroundSlideshow({ reduceMotion }: { reduceMotion: boolean | null }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    BACKGROUND_SLIDES.forEach(({ url }) => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % BACKGROUND_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const slide = BACKGROUND_SLIDES[index];

  if (reduceMotion) {
    return (
      <div
        aria-hidden="true"
        className="absolute -inset-[7%] bg-cover bg-center brightness-[0.7] saturate-[1.05]"
        style={{ backgroundImage: `url(${BACKGROUND_SLIDES[0].url})` }}
      />
    );
  }

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.url}
          className="absolute -inset-[7%] bg-cover bg-center"
          style={{
            backgroundImage: `url(${slide.url})`,
            filter: "brightness(0.7) saturate(1.05)"
          }}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{
            opacity: 1,
            scale: [1.055, 1.085],
            x: ["-0.7%", "0.7%"],
            y: ["-0.55%", "0.65%"]
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: FADE_MS / 1000, ease: "easeInOut" },
            scale: { duration: 26, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
            x: { duration: 26, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
            y: { duration: 26, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
          }}
        />
      </AnimatePresence>
    </div>
  );
}

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: CSSProperties;
}

export function WordsPullUp({ text, className = "", showAsterisk = false, style }: WordsPullUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;

        return (
          <motion.span
            key={`${word}-${i}`}
            initial={shouldReduceMotion ? false : { y: 24, opacity: 0 }}
            animate={shouldReduceMotion || isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative inline-block"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLast ? (
              <span className="absolute -right-[0.3em] top-[0.64em] text-[0.31em]">*</span>
            ) : null}
          </motion.span>
        );
      })}
    </div>
  );
}

interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  style?: CSSProperties;
}

export function WordsPullUpMultiStyle({ segments, className = "", style }: WordsPullUpMultiStyleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();

  const words: { word: string; className?: string }[] = [];
  segments.forEach((segment) => {
    segment.text.split(" ").forEach((word) => {
      if (word) words.push({ word, className: segment.className });
    });
  });

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`} style={style}>
      {words.map((word, i) => (
        <motion.span
          key={`${word.word}-${i}`}
          initial={shouldReduceMotion ? false : { y: 24, opacity: 0 }}
          animate={shouldReduceMotion || isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-block ${word.className ?? ""}`}
          style={{ marginRight: "0.25em" }}
        >
          {word.word}
        </motion.span>
      ))}
    </div>
  );
}

export function PrismaHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="top" className="w-full px-2 pb-4 pt-2 sm:px-3 md:px-4">
      <div className="mx-auto w-full">
        <div className="relative min-h-[calc(100svh-1rem)] overflow-hidden rounded-[1.35rem] bg-[#06150f] font-sans shadow-[0_28px_90px_rgba(6,19,14,0.24)] md:min-h-[calc(100vh-1.5rem)] md:rounded-[1.65rem]">
          <HeroBackgroundSlideshow reduceMotion={shouldReduceMotion} />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(152,244,168,0.2),transparent_28rem),radial-gradient(circle_at_18%_74%,rgba(0,0,0,0.12),transparent_21rem),linear-gradient(180deg,rgba(0,0,0,0.28),rgba(0,0,0,0.04)_38%,rgba(0,0,0,0.82))]"
          />
          <div
            aria-hidden="true"
            className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.44] mix-blend-overlay"
          />

          <nav
            aria-label="Hero navigation"
            className="absolute left-4 top-0 z-20 sm:left-1/2 sm:-translate-x-1/2"
          >
            <div className="flex items-center gap-4 rounded-b-[1.15rem] bg-black px-4 py-3 font-sans shadow-[0_18px_45px_rgba(0,0,0,0.28)] sm:gap-7 sm:px-7 md:gap-10 md:rounded-b-[1.35rem] lg:gap-12">
              {SITE_NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-sans text-[0.52rem] font-bold uppercase tracking-[0.15em] text-[#e1e0cc]/75 transition-colors hover:text-[#fff8e8] sm:text-[0.62rem] md:text-[0.67rem]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="absolute right-4 top-12 z-30 rounded-full border border-white/14 bg-black/22 px-2 py-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:right-5 sm:top-5 md:right-6 md:top-5">
            <ThemeToggle style={{ "--toggle-size": "13px" } as CSSProperties} />
          </div>

          <motion.div
            initial={shouldReduceMotion ? false : { y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-4 right-4 top-36 z-10 rounded-2xl border border-white/16 bg-[#f6f0dc]/12 p-4 text-[#fff8e8] shadow-[0_18px_48px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:left-6 sm:right-auto sm:top-7 sm:max-w-[17rem] md:p-5"
          >
            <p className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-[#98f4a8]">
              Environmental Intelligence
            </p>
            <p className="mt-2 text-sm font-semibold leading-5 text-[#fff8e8]/88">
              Local evidence, ranked barriers, and practical fixes students can verify.
            </p>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? false : { y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.75, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-4 right-4 top-[20rem] z-10 rounded-2xl border border-white/16 bg-black/24 p-4 text-[#fff8e8] shadow-[0_18px_48px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:left-auto sm:right-6 sm:top-[5.4rem] sm:w-[16rem] md:p-5"
          >
            <div className="flex items-start justify-between gap-5">
              <p className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-[#fff8e8]/68">
                Priority Score
              </p>
              <p className="font-heading text-4xl font-bold leading-none tracking-[-0.04em] text-[#fff8e8]">
                82
              </p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/14">
              <motion.div
                className="h-full rounded-full bg-[#98f4a8]"
                initial={shouldReduceMotion ? false : { width: 0 }}
                animate={{ width: "82%" }}
                transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-[#fff8e8]/76">
              Unsafe bike approach detected as the highest-impact barrier.
            </p>
          </motion.div>

          <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-5 sm:px-6 sm:pb-7 md:px-9 md:pb-9">
            <div className="max-w-[70rem]">
              <h1 className="font-heading text-[3.7rem] font-bold leading-[0.78] tracking-[-0.07em] text-[#fff8e8] sm:text-[6.1rem] md:text-[7.1rem] lg:text-[8.8rem]">
                <WordsPullUp text="Greenlight" showAsterisk />
              </h1>
              <div className="mt-4 h-px w-full max-w-[48rem] bg-[#fff8e8]/34" />
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <motion.p
                  initial={shouldReduceMotion ? false : { y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.75, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-[34rem] text-base font-semibold leading-6 text-[rgba(255,248,232,0.82)] sm:text-lg"
                >
                  Map local barriers, compare fixes, and see projected impact before acting.
                </motion.p>

                <motion.div
                  initial={shouldReduceMotion ? false : { y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.75, delay: 0.68, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-3 min-[430px]:flex-row sm:justify-end"
                >
                  <Link
                    href="/map"
                    className="group inline-flex min-h-12 items-center justify-center gap-3 whitespace-nowrap rounded-full bg-[#98f4a8] py-1 pl-5 pr-1 text-sm font-black text-black no-underline shadow-[0_14px_38px_rgba(152,244,168,0.22)] transition-transform hover:-translate-y-0.5 min-[430px]:min-w-[11rem]"
                  >
                    Map a Location
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-[#fff8e8] transition-transform group-hover:scale-105">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                  <Link
                    href="/analysis"
                    className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full border border-[#fff8e8]/38 bg-[#fff8e8]/10 px-5 text-sm font-black text-[#fff8e8] no-underline backdrop-blur-md transition-colors hover:bg-[#fff8e8]/16 min-[430px]:min-w-[11rem]"
                  >
                    Open Local Analysis
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
