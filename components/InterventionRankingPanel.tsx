"use client";

import { Check, Plus } from "lucide-react";
import type { InterventionId, InterventionRanking } from "@/lib/types";

type InterventionRankingPanelProps = {
  rankings: InterventionRanking[];
  selectedInterventionIds: InterventionId[];
  onToggleIntervention: (id: InterventionId) => void;
  presentationMode?: boolean;
};

export function InterventionRankingPanel({
  rankings,
  selectedInterventionIds,
  onToggleIntervention,
  presentationMode = false
}: InterventionRankingPanelProps) {
  return (
    <section className="panel rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Impact ranking</p>
        <p className="text-[10px] font-bold text-[var(--text-muted)]">Score 0–100</p>
      </div>

      <div className="space-y-3">
        {rankings.map((ranking, index) => {
          const selected = selectedInterventionIds.includes(ranking.interventionId);
          const barPct = Math.min(ranking.impactScore, 100);

          return (
            <div
              key={ranking.interventionId}
              className={`rounded-xl border p-3 transition-all duration-200 ${
                selected
                  ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,var(--surface))]"
                  : "border-[var(--border)] bg-[var(--surface)]"
              } ${presentationMode ? "presentation-reveal" : ""}`}
              style={{ animationDelay: `${260 + index * 90}ms` }}
            >
              {/* Header row */}
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-elevated)] font-heading text-xs font-bold text-[var(--primary)]">
                  {ranking.rank}
                </span>
                <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-[var(--text-primary)]">{ranking.label}</h3>
                <span className="shrink-0 font-heading text-xl font-bold text-[var(--primary)]">{ranking.impactScore}</span>
              </div>

              {/* Visual impact bar */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--border)_60%,transparent)]">
                <div
                  className="score-bar-fill h-full rounded-full"
                  style={{
                    "--bar-w": `${barPct}%`,
                    "--bar-delay": `${300 + index * 60}ms`,
                    background: "var(--primary)"
                  } as React.CSSProperties}
                />
              </div>

              {/* Metric chips */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <MetricChip label="−score" value={`${ranking.projectedScoreDelta}`} color="var(--primary)" />
                <MetricChip label="CO₂" value={`${formatNumber(ranking.emissionsReductionKgPerYear)} kg/yr`} color="var(--data)" />
                {ranking.wasteReductionLbsPerWeek > 0 ? (
                  <MetricChip label="waste" value={`${formatNumber(ranking.wasteReductionLbsPerWeek)} lb/wk`} color="var(--data)" />
                ) : null}
                <MetricChip label="cost" value={formatCostRange(ranking.costRangeUsd)} color="var(--warning)" />
                <MetricChip label="conf." value={`${Math.round(ranking.confidence * 100)}%`} color="var(--text-muted)" />
              </div>

              <button
                type="button"
                onClick={() => onToggleIntervention(ranking.interventionId)}
                className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-bold transition-colors ${
                  selected
                    ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_14%,var(--surface))] text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                }`}
                aria-pressed={selected}
              >
                {selected ? <Check size={13} /> : <Plus size={13} />}
                {selected ? "In scenario" : "Add to scenario"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MetricChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-2 py-0.5 text-[10px]">
      <span className="font-bold uppercase tracking-[0.06em] text-[var(--text-muted)]">{label}</span>
      <span className="font-bold" style={{ color }}>{value}</span>
    </span>
  );
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function formatCostRange([low, high]: [number, number]) {
  return `${formatCompact(low)}–${formatCompact(high)}`;
}

function formatCompact(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return `$${value}`;
}
