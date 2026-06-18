"use client";

import { Loader2 } from "lucide-react";
import type { DeadZone, RecommendationResponse } from "@/lib/types";

type AIExplanationPanelProps = {
  deadZone: DeadZone;
  recommendation: RecommendationResponse | null;
  loading: boolean;
  error: string | null;
  presentationMode?: boolean;
};

export function AIExplanationPanel({ deadZone, recommendation, loading, error, presentationMode = false }: AIExplanationPanelProps) {
  const revealClass = presentationMode ? "presentation-reveal" : "";
  const modelLabel = recommendation?.modelUsed ? `AI Engine: ${formatModelName(recommendation.modelUsed)}` : "AI Engine: Greenlight";

  return (
    <section id="recommendation" className="panel rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-heading text-2xl font-bold">AI explanation</h2>
            <p className="text-sm text-[var(--text-secondary)]">Deterministic score first. AI explains what the data means.</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold ${
            "border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] text-[var(--primary)]"
          }`}
        >
          {modelLabel}
        </span>
      </div>

      {loading ? (
        <div className="mt-6 flex min-h-48 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]">
          <Loader2 className="mr-3 animate-spin text-[var(--primary)]" size={20} />
          Greenlight is analyzing the barrier...
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            {error ? (
              <div className="mb-4 rounded-lg border border-[color-mix(in_srgb,var(--warning)_40%,var(--border))] bg-[color-mix(in_srgb,var(--warning)_12%,var(--surface))] p-3 text-sm font-semibold text-[var(--warning)]">
                Greenlight completed the analysis with its reliability layer.
              </div>
            ) : null}
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Diagnosis</p>
            <h3 className="mt-1 font-heading text-3xl font-bold">{deadZone.name}</h3>
            <p className={`mt-4 leading-7 text-[var(--text-secondary)] ${revealClass}`} style={{ animationDelay: "80ms" }}>
              {recommendation?.summary ??
                `${deadZone.name} is ranked from observed access, safety, importance, equity, and feasibility signals.`}
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
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--data)]" />
                  {item}
                </li>
              ))}
            </ul>
            <div className={`mt-4 rounded-lg bg-[color-mix(in_srgb,var(--equity)_12%,var(--surface))] p-3 ${revealClass}`} style={{ animationDelay: "700ms" }}>
              <p className="text-sm font-bold text-[var(--equity)]">AI inference</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{recommendation?.aiInference}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function formatModelName(model: string) {
  if (model.includes("nemotron")) {
    return "Nemotron";
  }

  if (model.includes("gpt-oss")) {
    return "GPT OSS";
  }

  if (model.includes("gemini")) {
    return "Gemini 3.5 Flash";
  }

  if (model.includes("liquid")) {
    return "Liquid Reasoner";
  }

  return "Greenlight Engine";
}
