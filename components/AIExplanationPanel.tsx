"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DeadZone, RecommendationResponse, RootCauseFactor } from "@/lib/types";
import { explainScore } from "@/lib/explain";
import { TypewriterText } from "@/components/TypewriterText";

type AIExplanationPanelProps = {
  deadZone: DeadZone;
  recommendation: RecommendationResponse | null;
  loading: boolean;
  error: string | null;
  presentationMode?: boolean;
};

const LOADING_STAGES = [
  "Mapping barrier signals...",
  "Evaluating contributing factors...",
  "Generating explanation...",
  "Finishing up..."
];

export function AIExplanationPanel({ deadZone, recommendation, loading, error, presentationMode = false }: AIExplanationPanelProps) {
  const revealClass = presentationMode ? "presentation-reveal" : "";
  const modelLabel  = recommendation?.modelUsed ? formatModelName(recommendation.modelUsed) : "Greenlight";
  const explanation = useMemo(() => explainScore(deadZone), [deadZone]);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!loading) { setStageIndex(0); return; }
    const timers = LOADING_STAGES.map((_, i) => window.setTimeout(() => setStageIndex(i), i * 2100));
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const summaryText = recommendation?.summary
    ?? `${deadZone.name} is ranked from observed access, safety, importance, equity, and feasibility signals.`;

  return (
    <section className="panel rounded-xl p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">AI explanation</p>
        <span className="rounded-full border border-[var(--badge-primary-border)] bg-[var(--badge-primary-bg)] px-2.5 py-1 text-xs font-bold text-[var(--primary)]">
          {modelLabel}
        </span>
      </div>

      {loading ? (
        <div className="mt-5 flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]">
          <Loader2 className="animate-spin text-[var(--primary)]" size={22} aria-hidden="true" />
          <span className="text-sm font-semibold">{LOADING_STAGES[stageIndex]}</span>
          <div className="flex gap-1.5" aria-hidden="true">
            {LOADING_STAGES.map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: i <= stageIndex ? "1.5rem" : "0.375rem", background: i <= stageIndex ? "var(--primary)" : "var(--border)" }}
              />
            ))}
          </div>
          <span className="sr-only">Loading: {LOADING_STAGES[stageIndex]}</span>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Diagnosis + Evidence */}
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              {error ? (
                <div className="mb-4 rounded-lg border border-[color-mix(in_srgb,var(--warning)_40%,var(--border))] bg-[var(--warning-soft)] p-3 text-sm font-semibold text-[var(--warning)]">
                  Completed with reliability layer.
                </div>
              ) : null}
              <h3 className="font-heading text-2xl font-bold">{deadZone.name}</h3>
              <p className={`mt-3 leading-7 text-[var(--text-secondary)] ${revealClass}`} style={{ animationDelay: "80ms" }}>
                <TypewriterText text={summaryText} />
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <MiniCard label="Likely cause" text={recommendation?.likelyCause} delay={360} revealClass={revealClass} />
                <MiniCard label="Uncertainty"  text={recommendation?.uncertainty}  delay={520} revealClass={revealClass} />
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--data)]">Evidence</p>
              <ul className={`mt-3 space-y-2 ${revealClass}`} style={{ animationDelay: "220ms" }}>
                {(recommendation?.observedEvidence ?? deadZone.observedEvidence).map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-[var(--text-secondary)]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--data)]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              {recommendation?.aiInference ? (
                <div className={`mt-4 rounded-lg bg-[var(--equity-soft)] p-3 ${revealClass}`} style={{ animationDelay: "700ms" }}>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--equity)]">AI inference</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{recommendation.aiInference}</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Root-cause breakdown */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Root-cause breakdown</p>
              <p className="text-sm font-bold text-[var(--primary)]">{explanation.totalScore}/100</p>
            </div>
            <div className="grid gap-2" key={deadZone.id}>
              {explanation.factors.map((factor, index) => (
                <FactorRow
                  key={factor.key}
                  factor={factor}
                  narrative={findNarrative(recommendation, factor)}
                  presentationMode={presentationMode}
                  animationDelay={index * 80}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function MiniCard({ label, text, delay, revealClass }: { label: string; text?: string; delay: number; revealClass: string }) {
  if (!text) return null;
  return (
    <div className={`soft-panel rounded-lg p-3 ${revealClass}`} style={{ animationDelay: `${delay}ms` }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1.5 text-sm leading-5 text-[var(--text-secondary)]">{text}</p>
    </div>
  );
}

function findNarrative(recommendation: RecommendationResponse | null, factor: RootCauseFactor) {
  return recommendation?.factorNarratives?.find((n) => n.group === factor.group)?.explanation;
}

function FactorRow({
  factor,
  narrative,
  presentationMode,
  animationDelay
}: {
  factor: RootCauseFactor;
  narrative?: string;
  presentationMode: boolean;
  animationDelay: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const barPercent = Math.round(factor.intensity * 100);
  const isBarrier  = factor.role === "barrier";

  return (
    <div
      className={`rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] ${presentationMode ? "presentation-reveal" : ""}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <button
        type="button"
        onClick={() => narrative && setExpanded((e) => !e)}
        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left ${narrative ? "cursor-pointer" : "cursor-default"}`}
        aria-expanded={narrative ? expanded : undefined}
      >
        {/* Bar + label row */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="w-24 shrink-0">
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--border)_60%,transparent)]"
              role="meter"
              aria-label={`${factor.label}: ${factor.value} of ${factor.max}`}
              aria-valuenow={factor.value}
              aria-valuemin={0}
              aria-valuemax={factor.max}
            >
              <div
                className="score-bar-fill h-full rounded-full"
                style={{
                  "--bar-w": `${barPercent}%`,
                  "--bar-delay": `${120 + animationDelay}ms`,
                  background: factor.color
                } as React.CSSProperties}
              />
            </div>
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)]">{factor.group}</span>
          <span
            className="rounded-full border px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.08em]"
            style={{
              color: isBarrier ? "var(--danger)" : "var(--primary)",
              borderColor: isBarrier ? "var(--danger)" : "var(--primary)"
            }}
          >
            {isBarrier ? "barrier" : "leverage"}
          </span>
        </div>
        <span className="shrink-0 text-xs font-bold" style={{ color: factor.color }}>
          {factor.value}/{factor.max}
        </span>
        {narrative ? (
          <ChevronDown
            size={14}
            className={`shrink-0 text-[var(--text-muted)] transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        ) : null}
      </button>

      {narrative && expanded ? (
        <div className="border-t border-[var(--border)] px-3 pb-3 pt-2">
          <p className="text-xs leading-5 text-[var(--text-secondary)]">{narrative}</p>
        </div>
      ) : null}
    </div>
  );
}

function formatModelName(model: string) {
  if (model.includes("nemotron")) return "Nemotron";
  if (model.includes("gpt-oss"))  return "GPT OSS";
  if (model.includes("gemini"))   return "Gemini Flash";
  if (model.includes("liquid"))   return "Liquid Reasoner";
  return "Greenlight Engine";
}
