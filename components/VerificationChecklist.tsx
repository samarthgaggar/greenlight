"use client";

import { useEffect, useState } from "react";
import type { RecommendationResponse } from "@/lib/types";

type VerificationChecklistProps = {
  recommendation: RecommendationResponse | null;
  presentationMode?: boolean;
};

export function VerificationChecklist({ recommendation, presentationMode = false }: VerificationChecklistProps) {
  const items = recommendation?.verificationChecklist ?? [];
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  useEffect(() => {
    setCheckedItems([]);
  }, [recommendation?.summary]);

  return (
    <section className="panel rounded-xl p-5">
      <div>
        <h2 className="font-heading text-2xl font-bold">Human verification checklist</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Students verify before anyone treats the recommendation as final.</p>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map((item, index) => {
          const checked = checkedItems.includes(item);

          return (
            <label
              key={item}
              className={`flex min-h-20 gap-3 rounded-lg border p-3 transition ${
                checked
                  ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface))]"
                  : "border-[var(--border)] bg-[var(--surface)]"
              } ${presentationMode ? "presentation-reveal" : ""}`}
              style={{ animationDelay: `${1520 + index * 90}ms` }}
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--primary)]"
                checked={checked}
                onChange={() =>
                  setCheckedItems((current) =>
                    checked ? current.filter((checkedItem) => checkedItem !== item) : [...current, item]
                  )
                }
              />
              <span className="text-sm leading-6 text-[var(--text-secondary)]">{item}</span>
            </label>
          );
        })}
      </div>
      <div className="mt-5 text-sm font-bold text-[var(--primary)]">
        {checkedItems.length} of {items.length} verification steps marked complete
      </div>
    </section>
  );
}
