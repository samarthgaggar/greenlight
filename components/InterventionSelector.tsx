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

  return (
    <div className="soft-panel rounded-xl p-5">
      <h2 className="font-heading text-2xl font-bold">Scenario simulator</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        Select sustainability improvements for <span className="font-bold text-[var(--text-primary)]">{deadZone.name}</span>. Greenlight
        recalculates the projected impact instantly.
      </p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {available.map((intervention) => {
          const selected = selectedInterventionIds.includes(intervention.id);
          const Icon = intervention.icon;

          return (
            <button
              key={intervention.id}
              type="button"
              className={`flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition ${
                selected
                  ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_14%,var(--surface))]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))]"
              }`}
              onClick={() => onToggle(intervention.id)}
              aria-pressed={selected}
            >
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                  selected
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--text-secondary)]"
                }`}
              >
                <Icon size={18} />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-[var(--text-primary)]">{intervention.label}</span>
                <span className="mt-0.5 block text-sm leading-5 text-[var(--text-secondary)]">{intervention.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
