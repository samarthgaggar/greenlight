"use client";

import { useEffect, useState } from "react";
import type { DeadZone } from "@/lib/types";
import { confidenceLabel, severityClass } from "@/lib/scoring";

type DeadZoneCardProps = {
  deadZone: DeadZone;
  selected: boolean;
  presentationMode?: boolean;
  onSelect: (deadZone: DeadZone) => void;
};

export function DeadZoneCard({ deadZone, selected, presentationMode = false, onSelect }: DeadZoneCardProps) {
  const [displayScore, setDisplayScore] = useState(deadZone.score);

  useEffect(() => {
    if (!presentationMode || !selected) {
      setDisplayScore(deadZone.score);
      return;
    }

    setDisplayScore(0);
    const start = performance.now();
    const duration = 900;
    let frame = 0;

    function animateScore(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(deadZone.score * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(animateScore);
      }
    }

    frame = window.requestAnimationFrame(animateScore);

    return () => window.cancelAnimationFrame(frame);
  }, [deadZone.score, presentationMode, selected]);

  return (
    <button
      type="button"
      onClick={() => onSelect(deadZone)}
      className={`w-full rounded-lg border p-3 text-left transition ${
        selected
          ? "border-[var(--primary)] bg-[var(--surface-elevated)] shadow-[var(--shadow)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{deadZone.category}</p>
          <h3 className="mt-1 truncate font-heading text-lg font-bold text-[var(--text-primary)]">{deadZone.name}</h3>
          <p className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">{confidenceLabel(deadZone.confidence)}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className={`font-heading text-2xl font-bold ${severityClass(deadZone.severity)}`}>{displayScore}</div>
          <div className={`mt-0.5 text-xs font-bold ${severityClass(deadZone.severity)}`}>
            {deadZone.severity} / {deadZone.label}
          </div>
        </div>
      </div>

      {selected ? (
        <p className="mt-3 border-t border-[var(--border)] pt-3 text-sm leading-6 text-[var(--text-secondary)]">
          {deadZone.observedEvidence[0]}
        </p>
      ) : null}
    </button>
  );
}
