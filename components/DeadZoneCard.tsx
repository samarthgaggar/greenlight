"use client";

import { useEffect, useState } from "react";
import type { DeadZone } from "@/lib/types";
import { confidenceLabel, scoreCategories, severityClass } from "@/lib/scoring";

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
      className={`w-full rounded-xl border p-4 text-left transition ${
        selected
          ? "border-[var(--primary)] bg-[var(--surface-elevated)] shadow-[var(--shadow)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{deadZone.category}</p>
          <h3 className="mt-1 font-heading text-xl font-bold text-[var(--text-primary)]">{deadZone.name}</h3>
        </div>
        <div className="text-right">
          <div className={`font-heading text-3xl font-bold ${severityClass(deadZone.severity)}`}>{displayScore}</div>
          <div className={`mt-1 text-xs font-bold ${severityClass(deadZone.severity)}`}>
            {deadZone.severity} / {deadZone.label}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {scoreCategories.map((category) => {
          const value = deadZone.scoringBreakdown[category.key];
          const percentage = (value / category.max) * 100;

          return (
            <div key={category.key}>
              <div className="mb-1 flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                <span>{category.label}</span>
                <span>
                  {value}/{category.max}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--border)_65%,transparent)]">
                <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: category.color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-sm font-semibold text-[var(--text-secondary)]">
        {confidenceLabel(deadZone.confidence)}
      </div>
    </button>
  );
}
