const guardrails = [
  "Map data may be incomplete.",
  "Evidence and inference are always kept separate.",
  "Safety claims require human verification.",
  "Demographic data is used only to prioritize fairness.",
  "Students should not inspect unsafe roads alone.",
  "The app recommends; it does not make infrastructure decisions.",
  "Projected impacts are estimates — verify locally before acting.",
  "AI explains scores. It never generates or modifies numbers.",
  "No private or personally identifiable data is collected."
];

export function ResponsibleAISection() {
  return (
    <section id="responsible-ai" className="panel overflow-hidden rounded-2xl">
      <ul className="grid gap-px bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
        {guardrails.map((text, index) => (
          <li
            key={text}
            className="flex gap-4 bg-[var(--surface)] px-5 py-4 md:px-6 md:py-5"
          >
            <span
              aria-hidden="true"
              className="shrink-0 pt-0.5 font-heading text-[0.65rem] font-bold tabular-nums tracking-[0.12em] text-[var(--text-muted)]"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="text-sm font-medium leading-relaxed text-[var(--text-secondary)]">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
