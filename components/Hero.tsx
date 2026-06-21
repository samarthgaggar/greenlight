type HeroProps = {
  onShowcaseLocation?: () => void;
};

export function Hero({ onShowcaseLocation }: HeroProps) {
  return (
    <section id="top" className="section hero-section pb-8 pt-16 md:pt-24">
      <div className="section-inner grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-[var(--badge-primary-border)] bg-[var(--badge-primary-bg)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
            AI for everyday climate action
          </div>
          <h1 className="max-w-3xl font-heading text-5xl font-bold leading-[1.02] text-[var(--text-primary)] md:text-7xl">
            Climate action fails when the local system blocks it.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)] md:text-xl">
            Greenlight maps the barriers between good intentions and real climate action, then shows exactly what to fix first &mdash; and what happens when you do.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="button-primary no-underline" href="#workspace">
              Find the barrier
            </a>
            <a
              className="button-ghost no-underline"
              href="#responsible-ai"
              onClick={onShowcaseLocation}
            >
              See our guardrails
            </a>
          </div>
        </div>

        <div className="hero-product-card">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Greenlight workflow</p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-[var(--text-primary)]">From local barrier to practical fix</h2>
          </div>

          <div className="mt-6 grid gap-3">
            <HeroStep
              number="01"
              title="Map the exact place"
              text="Search a school, corridor, park, or neighborhood and select the right address."
              tone="data"
            />
            <HeroStep
              number="02"
              title="Rank what blocks action"
              text="Deterministic scoring identifies access gaps, safety friction, equity context, and fix feasibility."
              tone="danger"
            />
            <HeroStep
              number="03"
              title="Simulate and decide"
              text="Select an improvement and instantly see projected score, emissions, waste, and adoption changes. AI ranks interventions and explains every score."
              tone="primary"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStep({
  number,
  title,
  text,
  tone
}: {
  number: string;
  title: string;
  text: string;
  tone: "primary" | "data" | "danger";
}) {
  const color =
    tone === "primary" ? "var(--primary)" :
    tone === "data"    ? "var(--data)"    :
                         "var(--danger)";

  return (
    <div className="hero-step">
      <span className="mt-0.5 w-8 shrink-0 text-xs font-bold uppercase tracking-[0.12em]" style={{ color }}>
        {number}
      </span>
      <span>
        <span className="block font-heading text-lg font-bold text-[var(--text-primary)]">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-[var(--text-secondary)]">{text}</span>
      </span>
    </div>
  );
}
