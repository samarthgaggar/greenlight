"use client";

import { useMemo } from "react";
import type { DeadZone, InterventionId } from "@/lib/types";
import { interventions } from "@/lib/interventions";
import { applicability } from "@/lib/simulation";

type InterventionSelectorProps = {
  deadZone: DeadZone;
  selectedInterventionIds: InterventionId[];
  onToggle: (id: InterventionId) => void;
};

export function InterventionSelector({ deadZone, selectedInterventionIds, onToggle }: InterventionSelectorProps) {
  const available = useMemo(() => {
    const applicable = interventions.filter((intervention) => applicability(intervention, deadZone) === 1);
    return applicable.length > 0 ? applicable : interventions;
  }, [deadZone]);

  const selectedCount = selectedInterventionIds.filter((id) =>
    available.some((i) => i.id === id)
  ).length;

  return (
    <div className="soft-panel rounded-xl p-4 ring-1 ring-[color-mix(in_srgb,var(--primary)_25%,transparent)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Improvements</p>
        {selectedCount > 0 ? (
          <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold text-[var(--bg)]">
            {selectedCount} selected
          </span>
        ) : (
          <span className="text-[10px] text-[var(--text-muted)]">tap to add</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {available.map((intervention) => {
          const selected = selectedInterventionIds.includes(intervention.id);
          const Icon = intervention.icon;

          return (
            <button
              key={intervention.id}
              type="button"
              title={intervention.description}
              aria-pressed={selected}
              onClick={() => onToggle(intervention.id)}
              className={`group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all duration-200 ${
                selected
                  ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_14%,var(--surface))]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[color-mix(in_srgb,var(--primary)_40%,var(--border))]"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                  selected
                    ? "bg-[var(--primary)] text-[var(--bg)]"
                    : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] group-hover:text-[var(--primary)]"
                }`}
              >
                <Icon size={14} aria-hidden="true" />
              </span>
              <span className={`text-xs font-bold leading-tight ${selected ? "text-[var(--primary)]" : "text-[var(--text-primary)]"}`}>
                {intervention.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
