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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold">AI impact ranking</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Interventions prioritized by projected impact, cost, difficulty, behavior change, and confidence.
          </p>
        </div>
        <p className="text-sm font-bold text-[var(--text-muted)]">Impact 0-100</p>
      </div>

      <div className="mt-5 space-y-3">
        {rankings.map((ranking, index) => {
          const selected = selectedInterventionIds.includes(ranking.interventionId);

          return (
            <div
              key={ranking.interventionId}
              className={`rounded-lg border p-3 transition ${
                selected
                  ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface))]"
                  : "border-[var(--border)] bg-[var(--surface)]"
              } ${presentationMode ? "presentation-reveal" : ""}`}
              style={{ animationDelay: `${260 + index * 90}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-elevated)] font-heading text-sm font-bold text-[var(--primary)]">
                    {ranking.rank}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-heading text-lg font-bold text-[var(--text-primary)]">{ranking.label}</h3>
                    <p className="mt-0.5 text-sm leading-6 text-[var(--text-secondary)]">{ranking.description}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-heading text-2xl font-bold text-[var(--primary)]">{ranking.impactScore}</div>
                  <div className="text-xs font-bold text-[var(--text-muted)]">impact</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <MetricChip label="Score drop" value={`-${ranking.projectedScoreDelta}`} color="var(--primary)" />
                <MetricChip label="CO2/yr" value={`-${formatNumber(ranking.emissionsReductionKgPerYear)} kg`} color="var(--data)" />
                {ranking.wasteReductionLbsPerWeek > 0 ? (
                  <MetricChip label="Waste/wk" value={`-${formatNumber(ranking.wasteReductionLbsPerWeek)} lb`} color="var(--data)" />
                ) : null}
                <MetricChip label="Cost" value={`${ranking.costTier} (${formatCostRange(ranking.costRangeUsd)})`} color="var(--warning)" />
                <MetricChip label="Difficulty" value={ranking.difficulty} color="var(--warning)" />
                <MetricChip label="Behavior" value={`${ranking.behaviorChangePercent}%`} color="var(--equity)" />
                <MetricChip label="Confidence" value={`${Math.round(ranking.confidence * 100)}%`} color="var(--text-muted)" />
              </div>

              <button
                type="button"
                onClick={() => onToggleIntervention(ranking.interventionId)}
                className={`mt-3 w-full ${selected ? "button-secondary" : "button-ghost"}`}
                aria-pressed={selected}
              >
                {selected ? <Check size={16} /> : <Plus size={16} />}
                {selected ? "In scenario" : "Add to scenario"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-5 text-[var(--text-muted)]">
        Ranking inputs are deterministic estimates from synthetic coefficients. Verify locally before acting.
      </p>
    </section>
  );
}

function MetricChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
      <span className="font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</span>
      <span style={{ color }}>{value}</span>
    </span>
  );
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function formatCostRange([low, high]: [number, number]) {
  return `${formatCompact(low)}-${formatCompact(high)}`;
}

function formatCompact(value: number) {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }

  return `$${value}`;
}
