"use client";

import { useEffect, useState } from "react";
import type { DeadZone } from "@/lib/types";
import { confidenceLabel, scoreCategories } from "@/lib/scoring";

type DeadZoneCardProps = {
  deadZone: DeadZone;
  selected: boolean;
  presentationMode?: boolean;
  onSelect: (deadZone: DeadZone) => void;
};

const RING_R = 22;
const RING_CIRC = 2 * Math.PI * RING_R; // ≈ 138.2

export function DeadZoneCard({ deadZone, selected, presentationMode = false, onSelect }: DeadZoneCardProps) {
  const [displayScore, setDisplayScore] = useState(deadZone.score);
  const [dashOffset, setDashOffset] = useState(RING_CIRC);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayScore(deadZone.score);
      setDashOffset(RING_CIRC * (1 - deadZone.score / 100));
      return;
    }

    if (!selected) {
      setDisplayScore(deadZone.score);
      setDashOffset(RING_CIRC * (1 - deadZone.score / 100));
      return;
    }

    setDisplayScore(0);
    setDashOffset(RING_CIRC);
    const start = performance.now();
    const duration = presentationMode ? 900 : 650;
    let frame = 0;

    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(deadZone.score * eased));
      setDashOffset(RING_CIRC * (1 - (deadZone.score / 100) * eased));
      if (progress < 1) frame = window.requestAnimationFrame(step);
    }

    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [deadZone.score, selected, presentationMode]);

  const severityColor =
    deadZone.severity === "High"
      ? "var(--danger)"
      : deadZone.severity === "Medium"
        ? "var(--warning)"
        : "var(--primary)";

  return (
    <button
      type="button"
      onClick={() => onSelect(deadZone)}
      className={`w-full rounded-xl border p-3 text-left transition-all duration-200 ${
        selected
          ? "border-[var(--primary)] bg-[var(--selected-bg)] shadow-[var(--shadow)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--hover-border)]"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* SVG score ring */}
        <div className="relative shrink-0" aria-hidden="true">
          <svg width="56" height="56" viewBox="0 0 56 56">
            {/* track */}
            <circle
              cx="28" cy="28" r={RING_R}
              fill="none"
              stroke="var(--border)"
              strokeWidth="4"
            />
            {/* fill */}
            <circle
              cx="28" cy="28" r={RING_R}
              fill="none"
              stroke={severityColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 28 28)"
              style={{ transition: "stroke-dashoffset 0.05s linear" }}
            />
            <text
              x="28" y="28"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="13"
              fontWeight="700"
              fontFamily="inherit"
              fill={severityColor}
            >
              {displayScore}
            </text>
          </svg>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{deadZone.category}</p>
          <h3 className="truncate font-heading text-base font-bold text-[var(--text-primary)]">{deadZone.name}</h3>
          <p className="mt-0.5 text-[11px] font-semibold text-[var(--text-secondary)]">
            {confidenceLabel(deadZone.confidence)}
            <span
              className="ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              style={{
                background: `color-mix(in srgb, ${severityColor} 14%, var(--surface))`,
                color: severityColor
              }}
            >
              {deadZone.severity}
            </span>
          </p>
        </div>
      </div>

      {/* Breakdown mini-bars when selected */}
      {selected ? (
        <div className="mt-3 space-y-1.5 border-t border-[var(--border)] pt-3">
          {scoreCategories.map((cat) => {
            const val = deadZone.scoringBreakdown[cat.key];
            const pct = Math.round((val / cat.max) * 100);
            return (
              <div key={cat.key} className="flex items-center gap-2">
                <span className="w-28 shrink-0 text-[10px] font-semibold text-[var(--text-muted)]">{cat.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-[color-mix(in_srgb,var(--border)_60%,transparent)]">
                  <div
                    className="h-full rounded-full score-bar-fill"
                    style={{
                      "--bar-w": `${pct}%`,
                      "--bar-delay": "0ms",
                      background: cat.color
                    } as React.CSSProperties}
                  />
                </div>
                <span className="w-7 shrink-0 text-right text-[10px] font-bold" style={{ color: cat.color }}>
                  {val}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </button>
  );
}
