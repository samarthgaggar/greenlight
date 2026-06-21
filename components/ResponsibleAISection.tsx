const guardrails = [
  "Public map data may be incomplete.",
  "Greenlight separates evidence from inference.",
  "Safety claims require human verification.",
  "Demographic data is used only to prioritize fairness and access.",
  "Students should not inspect unsafe roads alone.",
  "The app recommends decisions; it does not make final infrastructure judgments.",
  "Projected impacts are estimates from synthetic coefficients and require verification.",
  "The AI explains deterministic scores and projections; it never generates the numbers."
];

export function ResponsibleAISection() {
  return (
    <section id="responsible-ai" className="section">
      <div className="section-inner">
        <div className="panel rounded-xl p-6 md:p-8">
          <h2 className="font-heading text-3xl font-bold">What Greenlight Does Not Assume</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {guardrails.map((guardrail) => (
              <div key={guardrail} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-sm leading-6 text-[var(--text-secondary)]">{guardrail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
