"use client";

import type { RecommendationResponse } from "@/lib/types";

type RecommendationPanelProps = {
  recommendation: RecommendationResponse | null;
  presentationMode?: boolean;
};

export function RecommendationPanel({ recommendation, presentationMode = false }: RecommendationPanelProps) {
  const rankedFixes = recommendation?.rankedFixes ?? [];
  const revealClass = presentationMode ? "presentation-reveal" : "";

  return (
    <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="panel rounded-xl p-5">
        <h2 className="font-heading text-2xl font-bold">Recommended fixes</h2>
        <div className="mt-5 space-y-3">
          {rankedFixes.map((fix, index) => (
            <div
              key={fix}
              className={`rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 ${revealClass}`}
              style={{ animationDelay: `${850 + index * 110}ms` }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Fix {index + 1}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{fix}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3">
          <ActionCost label="Low-cost action" value={recommendation?.lowCostAction} color="var(--primary)" presentationMode={presentationMode} delay={1180} />
          <ActionCost label="Medium-cost action" value={recommendation?.mediumCostAction} color="var(--warning)" presentationMode={presentationMode} delay={1290} />
          <ActionCost label="Long-term action" value={recommendation?.longTermAction} color="var(--data)" presentationMode={presentationMode} delay={1400} />
        </div>
      </section>

      <section className="panel rounded-xl p-5">
        <h2 className="font-heading text-2xl font-bold">Message to a decision maker</h2>
        <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">
            {recommendation?.decisionMakerMessage}
          </p>
        </div>
        <button type="button" className="button-primary mt-4 w-full">
          Ready to send
        </button>
      </section>
    </div>
  );
}

function ActionCost({
  label,
  value,
  color,
  presentationMode,
  delay
}: {
  label: string;
  value?: string;
  color: string;
  presentationMode?: boolean;
  delay?: number;
}) {
  return (
    <div
      className={`rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 ${presentationMode ? "presentation-reveal" : ""}`}
      style={{ animationDelay: `${delay ?? 0}ms` }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color }}>
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{value}</p>
    </div>
  );
}
