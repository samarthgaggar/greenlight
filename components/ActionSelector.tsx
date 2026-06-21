"use client";

import type { ClimateActionId } from "@/lib/types";
import { climateActions } from "@/lib/actions";

type ActionSelectorProps = {
  selectedAction: ClimateActionId;
  onSelectAction: (action: ClimateActionId) => void;
};

export function ActionSelector({ selectedAction, onSelectAction }: ActionSelectorProps) {
  return (
    <div className="soft-panel rounded-xl p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Climate goal</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {climateActions.map((action) => {
          const selected = action.id === selectedAction;
          const Icon = action.icon;

          return (
            <button
              key={action.id}
              type="button"
              title={action.description}
              aria-pressed={selected}
              onClick={() => onSelectAction(action.id)}
              className={`group flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-center transition-all duration-200 ${
                selected
                  ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_14%,var(--surface))] shadow-sm"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--hover-border)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  selected
                    ? "bg-[var(--primary)] text-[var(--bg)]"
                    : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] group-hover:text-[var(--primary)]"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className={`text-xs font-bold leading-tight ${selected ? "text-[var(--primary)]" : "text-[var(--text-primary)]"}`}>
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
