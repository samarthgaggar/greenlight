"use client";

import { Loader2 } from "lucide-react";
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
  const revealClass  = presentationMode ? "presentation-reveal" : "";
  const modelLabel   = recommendation?.modelUsed ? `AI Engine: ${formatModelName(recommendation.modelUsed)}` : "AI Engine: Greenlight";
  const explanation  = useMemo(() => explainScore(deadZone), [deadZone]);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!loading) {
      setStageIndex(0);
      return;
    }
    const timers = LOADING_STAGES.map((_, i) => window.setTimeout(() => setStageIndex(i), i * 2100));
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const summaryText = recommendation?.summary
    ?? `${deadZone.name} is ranked from observed access, safety, importance, equity, and feasibility signals.`;

  return (
    <section id="recommendation" className="panel rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold">AI explanation</h2>
          <p className="text-sm text-[var(--text-secondary)]">Deterministic score first. AI explains what the data means.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--badge-primary-border)] px-3 py-2 text-sm font-bold text-[var(--primary)]">
          {modelLabel}
        </span>
      </div>

      {loading ? (
        <div className="mt-6 flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]">
          <Loader2 className="animate-spin text-[var(--primary)]" size={22} aria-hidden="true" />
          <span className="text-sm font-semibold">{LOADING_STAGES[stageIndex]}</span>
          <div className="flex gap-1.5" aria-hidden="true">
            {LOADING_STAGES.map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width:      i <= stageIndex ? "1.5rem" : "0.375rem",
                  background: i <= stageIndex ? "var(--primary)" : "var(--border)"
                }}
              />
            ))}
          </div>
          <span className="sr-only">Loading: {LOADING_STAGES[stageIndex]}</span>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {/* ── Diagnosis + evidence ──────────────────────────────────────── */}
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              {error ? (
                <div className="mb-4 rounded-lg border border-[color-mix(in_srgb,var(--warning)_40%,var(--border))] bg-[var(--warning-soft)] p-3 text-sm font-semibold text-[var(--warning)]">
                  Greenlight completed the analysis with its reliability layer.
                </div>
              ) : null}
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Diagnosis</p>
              <h3 className="mt-1 font-heading text-3xl font-bold">{deadZone.name}</h3>
              <p className={`mt-4 leading-7 text-[var(--text-secondary)] ${revealClass}`} style={{ animationDelay: "80ms" }}>
                <TypewriterText text={summaryText} />
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className={`soft-panel rounded-lg p-3 ${revealClass}`} style={{ animationDelay: "360ms" }}>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Likely cause</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{recommendation?.likelyCause}</p>
                </div>
                <div className={`soft-panel rounded-lg p-3 ${revealClass}`} style={{ animationDelay: "520ms" }}>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Uncertainty</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{recommendation?.uncertainty}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--data)]">Evidence</p>
              <ul className={`mt-3 space-y-2 ${revealClass}`} style={{ animationDelay: "220ms" }}>
                {(recommendation?.observedEvidence ?? deadZone.observedEvidence).map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-[var(--text-secondary)]">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--data)]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <div
                className={`mt-4 rounded-lg bg-[var(--equity-soft)] p-3 ${revealClass}`}
                style={{ animationDelay: "700ms" }}
              >
                <p className="text-sm font-bold text-[var(--equity)]">AI inference</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{recommendation?.aiInference}</p>
              </div>
            </div>
          </div>

          {/* ── Root-cause breakdown ─────────────────────────────────────── */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Why this score exists</p>
                <h3 className="mt-1 font-heading text-xl font-bold">Root-cause breakdown</h3>
              </div>
              <p className="text-sm font-bold text-[var(--text-muted)]">
                {explanation.totalScore}/100 from deterministic factors
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Every contribution below is computed by the scoring engine. The AI only explains what each factor means.
            </p>

            {/* Key on deadZone.id so bars re-animate when barrier changes */}
            <div className="mt-4 grid gap-3" key={deadZone.id}>
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
  const barPercent = Math.round(factor.intensity * 100);

  return (
    <div
      className={`rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-3 ${presentationMode ? "presentation-reveal" : ""}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--text-primary)]">{factor.group}</span>
          <span
            className="rounded-full border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em]"
            style={{
              color:       factor.role === "barrier" ? "var(--danger)"  : "var(--primary)",
              borderColor: factor.role === "barrier" ? "var(--danger)"  : "var(--primary)"
            }}
            aria-label={factor.role === "barrier" ? "Barrier factor" : "Leverage factor"}
          >
            {factor.role === "barrier" ? "Barrier" : "Leverage"}
          </span>
        </div>
        <span className="text-xs font-bold text-[var(--text-muted)]">
          {factor.value}/{factor.max} &middot; {factor.percentOfScore}% of score
        </span>
      </div>
      <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">{factor.label}</p>

      {/* Animated bar — CSS animation driven by --bar-w and --bar-delay */}
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--border)_60%,transparent)]"
        role="meter"
        aria-label={`${factor.label}: ${factor.value} of ${factor.max}`}
        aria-valuenow={factor.value}
        aria-valuemin={0}
        aria-valuemax={factor.max}
      >
        <div
          className="score-bar-fill h-full rounded-full"
          style={{
            "--bar-w":     `${barPercent}%`,
            "--bar-delay": `${120 + animationDelay}ms`,
            background:    factor.color
          } as React.CSSProperties}
        />
      </div>

      {narrative ? (
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{narrative}</p>
      ) : null}
    </div>
  );
}

function formatModelName(model: string) {
  if (model.includes("nemotron")) return "Nemotron";
  if (model.includes("gpt-oss"))  return "GPT OSS";
  if (model.includes("gemini"))   return "Gemini 3.5 Flash";
  if (model.includes("liquid"))   return "Liquid Reasoner";
  return "Greenlight Engine";
}
