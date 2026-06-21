"use client";

import { Loader2, MapPin, Target, TrendingUp, Zap } from "lucide-react";
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
    <section className="panel rounded-xl p-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <InputPill icon={MapPin}    label="Location" value={location.name}                             color="var(--data)"    />
        <InputPill icon={Target}    label="Goal"     value={actionLabel}                               color="var(--primary)" />
        <InputPill icon={TrendingUp} label="Barrier" value={`${deadZone.name} · ${deadZone.score}/100`} color="var(--danger)"  />
        <InputPill icon={Zap}       label="Engine"   value={model === "nemotron" ? "Nemotron" : "GPT OSS"} color="var(--warning)" />
      </div>

      <button type="button" className="button-primary mt-4 w-full" onClick={onSubmit} disabled={loading}>
        {loading ? <Loader2 className="animate-spin" size={16} /> : null}
        {loading ? "Analyzing..." : "Analyze with Greenlight AI"}
      </button>
    </section>
  );
}

function InputPill({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5">
      <span
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{ background: `color-mix(in srgb, ${color} 14%, var(--surface-elevated))` }}
      >
        <Icon size={12} aria-hidden="true" style={{ color }} />
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
        <p className="mt-0.5 truncate text-xs font-bold text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}
