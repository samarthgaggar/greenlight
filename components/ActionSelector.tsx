"use client";

import type { ClimateActionId } from "@/lib/types";
import { climateActions } from "@/lib/actions";

type ActionSelectorProps = {
  selectedAction: ClimateActionId;
  onSelectAction: (action: ClimateActionId) => void;
};

export function ActionSelector({ selectedAction, onSelectAction }: ActionSelectorProps) {
  return (
    <div className="soft-panel rounded-xl p-5">
      <h2 className="font-heading text-2xl font-bold">Climate action goal</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        Choose the action Greenlight should test against local conditions.
      </p>
      <div className="mt-5 grid gap-2">
        {climateActions.map((action) => {
          const selected = action.id === selectedAction;

          return (
            <button
              key={action.id}
              type="button"
              className={`rounded-lg border px-3 py-2.5 text-left transition ${
                selected
                  ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_14%,var(--surface))]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))]"
              }`}
              onClick={() => onSelectAction(action.id)}
            >
              <span className="font-bold text-[var(--text-primary)]">{action.label}</span>
              <span className="ml-2 text-sm leading-5 text-[var(--text-secondary)]">{action.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
