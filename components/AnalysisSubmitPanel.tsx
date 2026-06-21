"use client";

import { Loader2 } from "lucide-react";
import type { AIModelChoice, DeadZone, LocationRecord } from "@/lib/types";

type AnalysisSubmitPanelProps = {
  location: LocationRecord;
  actionLabel: string;
  deadZone: DeadZone;
  model: AIModelChoice;
  loading: boolean;
  onSubmit: () => void;
};

export function AnalysisSubmitPanel({ location, actionLabel, deadZone, model, loading, onSubmit }: AnalysisSubmitPanelProps) {
  return (
    <section className="panel rounded-xl p-5">
      <h2 className="font-heading text-2xl font-bold">Ready to analyze</h2>
      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
        Review the inputs, then send them to Greenlight AI for explanation, fixes, and verification steps.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <InputPill label="Location" value={location.name} />
        <InputPill label="Goal" value={actionLabel} />
        <InputPill label="Barrier" value={`${deadZone.name} (${deadZone.score}/100)`} />
        <InputPill label="Engine" value={model === "nemotron" ? "Nemotron" : "GPT OSS"} />
      </div>

      <button type="button" className="button-primary mt-5 w-full" onClick={onSubmit} disabled={loading}>
        {loading ? <Loader2 className="animate-spin" size={18} /> : null}
        {loading ? "Greenlight is analyzing..." : "Analyze with Greenlight AI"}
      </button>
    </section>
  );
}

function InputPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
