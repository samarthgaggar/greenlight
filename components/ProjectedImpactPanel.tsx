"use client";

import { ArrowRight, Loader2, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ScenarioNarration, ScenarioProjection } from "@/lib/types";
import { severityClass } from "@/lib/scoring";
import { explainProjection } from "@/lib/explain";

type ProjectedImpactPanelProps = {
  projection: ScenarioProjection;
  narration: ScenarioNarration | null;
  narrationLoading: boolean;
  onExplain: () => void;
  presentationMode?: boolean;
};

export function ProjectedImpactPanel({
  projection,
  narration,
  narrationLoading,
  onExplain
}: ProjectedImpactPanelProps) {
  const hasInterventions   = projection.interventionIds.length > 0;
  const projectionChanges  = useMemo(() => explainProjection(projection), [projection]);

  return (
    <section className="panel rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold">Projected impact</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">If we make this improvement, what happens?</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--warning)_45%,var(--border))] px-3 py-2 text-xs font-bold text-[var(--warning)]">
          Synthetic estimate
        </span>
      </div>

      {!hasInterventions ? (
        <EmptyProjection baselineScore={projection.baselineScore} baselineSeverity={projection.baselineSeverity} />
      ) : (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            {/* ── Score before / after ────────────────────────────────────── */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Barrier score</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="text-center">
                  <div
                    className={`font-heading text-4xl font-bold ${severityClass(projection.baselineSeverity)}`}
                    aria-label={`Baseline score: ${projection.baselineScore}`}
                  >
                    {projection.baselineScore}
                  </div>
                  <div className="mt-1 text-xs font-bold text-[var(--text-muted)]">{projection.baselineSeverity} now</div>
                </div>
                <ArrowRight className="shrink-0 text-[var(--text-muted)]" size={22} aria-hidden="true" />
                <div className="text-center">
                  <AnimatedScore
                    value={projection.projectedScore}
                    className={`font-heading text-5xl font-bold ${severityClass(projection.projectedSeverity)}`}
                    aria-label={`Projected score: ${projection.projectedScore}`}
                  />
                  <div className="mt-1 text-xs font-bold text-[var(--text-muted)]">{projection.projectedSeverity} projected</div>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-[var(--selected-bg)] p-3 text-center">
                <p className="text-sm font-bold text-[var(--primary)]">
                  {projection.scoreDelta > 0
                    ? `${projection.scoreDelta} point reduction`
                    : "No projected change"}
                </p>
                <p className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">
                  Projected confidence: {projection.confidenceLevel} ({Math.round(projection.projectedConfidence * 100)}%)
                </p>
              </div>
            </div>

            {/* ── Metric cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Emissions reduction"
                value={formatNumber(projection.emissionsReductionKgPerYear)}
                unit="kg CO2 / year"
                color="var(--data)"
              />
              <MetricCard
                label="Waste reduction"
                value={projection.wasteReductionLbsPerWeek > 0 ? formatNumber(projection.wasteReductionLbsPerWeek) : "0"}
                unit="lb / week"
                color="var(--primary)"
              />
              <MetricCard
                label="Projected adoption"
                value={`${projection.adoptionRatePercent}`}
                unit="% of users"
                color="var(--equity)"
              />
              <MetricCard
                label="Interventions"
                value={`${projection.interventionIds.length}`}
                unit="combined"
                color="var(--warning)"
              />
            </div>
          </div>

          {/* ── What changes ─────────────────────────────────────────────── */}
          {projectionChanges.changes.length > 0 ? (
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">What changes</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {projectionChanges.changes.map((change) => (
                  <div
                    key={change.key}
                    className="flex items-center justify-between gap-2 rounded-lg bg-[var(--surface-elevated)] px-3 py-2"
                  >
                    <span className="text-sm font-semibold text-[var(--text-secondary)]">{change.label}</span>
                    <span className="flex items-center gap-1.5 text-sm font-bold" aria-label={`${change.label}: ${change.before} to ${change.after}`}>
                      <span className="text-[var(--text-muted)]">{change.before}</span>
                      <ArrowRight size={12} className="text-[var(--text-muted)]" aria-hidden="true" />
                      <span style={{ color: change.color }}>{change.after}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* ── AI narration ─────────────────────────────────────────────── */}
          <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">AI explanation</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  The AI explains the deterministic projection in plain language.
                </p>
              </div>
              <button
                type="button"
                className="button-secondary"
                onClick={onExplain}
                disabled={narrationLoading}
                aria-label="Explain this scenario with AI"
              >
                {narrationLoading ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}
                {narrationLoading ? "Explaining..." : "Explain this scenario"}
              </button>
            </div>

            {narration ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm leading-7 text-[var(--text-secondary)]">{narration.summary}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <NarrationBlock label="Why it helps"      value={narration.whyItHelps}        />
                  <NarrationBlock label="Adoption rationale" value={narration.adoptionRationale} />
                </div>
                <NarrationBlock label="Uncertainty" value={narration.uncertainty} />
                {narration.verificationChecklist.length > 0 ? (
                  <ul className="mt-1 space-y-2">
                    {narration.verificationChecklist.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-[var(--text-secondary)]">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}

function EmptyProjection({ baselineScore, baselineSeverity }: { baselineScore: number; baselineSeverity: string }) {
  return (
    <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--badge-primary-bg)] text-[var(--primary)]">
          <Zap size={20} aria-hidden="true" />
        </span>
        <div>
          <p className="font-heading text-lg font-bold text-[var(--text-primary)]">Baseline: {baselineScore}/100 ({baselineSeverity})</p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            Select one or more improvements above to simulate what happens to this barrier score,
            projected emissions, waste diversion, and adoption rate.
          </p>
        </div>
      </div>
    </div>
  );
}

function NarrationBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="soft-panel rounded-lg p-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{value}</p>
    </div>
  );
}

function MetricCard({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 font-heading text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs font-semibold text-[var(--text-muted)]">{unit}</p>
    </div>
  );
}

/** Always animates between values; respects prefers-reduced-motion. */
function AnimatedScore({ value, className, "aria-label": ariaLabel }: { value: number; className?: string; "aria-label"?: string }) {
  const [display, setDisplay] = useState(value);
  const fromRef  = useRef(value);
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    const target = value;
    const from   = fromRef.current;
    if (from === target) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(target);
      fromRef.current = target;
      return;
    }

    const start    = performance.now();
    const duration = 700;

    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    }

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <div className={className} aria-label={ariaLabel}>{display}</div>;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}
