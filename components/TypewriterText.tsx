"use client";

import { useEffect, useRef, useState } from "react";

type TypewriterTextProps = {
  text: string;
  className?: string;
  /** Approximate ms per character. Default 13. */
  speed?: number;
};

/**
 * Streams text character-by-character like AI output arriving in real time.
 * Only fires on text changes; respects prefers-reduced-motion (shows full
 * text instantly). Safe for SSR — server renders the final text immediately.
 */
export function TypewriterText({ text, className, speed = 13 }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState(text);
  const rafRef   = useRef<number>(0);
  const prevText = useRef(text);

  useEffect(() => {
    if (!text || prevText.current === text) return;
    prevText.current = text;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayed(text);
      return;
    }

    setDisplayed("");
    const chars = [...text];
    let i = 0;
    let startTime: number | null = null;

    function step(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const target = Math.floor((timestamp - startTime) / speed);
      if (target > i) {
        i = Math.min(target, chars.length);
        setDisplayed(chars.slice(0, i).join(""));
      }
      if (i < chars.length) {
        rafRef.current = requestAnimationFrame(step);
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayed}
      {displayed.length > 0 && displayed.length < text.length ? (
        <span className="typewriter-cursor" aria-hidden="true" />
      ) : null}
    </span>
  );
}
