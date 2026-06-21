import { WorkspacePage } from "@/components/WorkspacePage";

export const metadata = {
  title: "Data sources | Greenlight"
};

const dataSources = [
  {
    label: "OpenStreetMap / Overpass API",
    detail: "Map geometry and live barrier signals — bike lanes, crosswalks, transit gaps."
  },
  {
    label: "Census ACS-style context",
    detail: "Vehicle availability and youth share data to weight equity and access scores."
  },
  {
    label: "EPA EJScreen-style context",
    detail: "Traffic proximity and heat exposure percentiles for safety friction and equity."
  },
  {
    label: "Local JSON / GeoJSON",
    detail: "All barrier locations, scores, evidence, and fixes — fully offline, no API key needed."
  }
];

const integrityPoints = [
  "No private or personally identifiable data collected or stored",
  "AI never produces or modifies numeric values",
  "All scores are deterministic — reproducible from the same inputs",
  "Bay Area high-school index from CDE 2024–25, generated offline"
];

export default function DataPage() {
  return (
    <WorkspacePage eyebrow="Transparency" title="Data sources">
      <div className="workspace-content workspace-stack">
        <section className="panel overflow-hidden rounded-2xl">
          <ul className="divide-y divide-[var(--border)]">
            {dataSources.map(({ label, detail }) => (
              <li key={label} className="px-5 py-5 md:px-6 md:py-6">
                <h2 className="font-heading text-base font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-lg">
                  {label}
                </h2>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--text-secondary)]">{detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel rounded-2xl px-5 py-5 md:px-6 md:py-6">
          <h2 className="font-heading text-base font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-lg">
            Integrity guarantee
          </h2>
          <div className="mt-4 h-px w-full max-w-xs bg-[var(--border)]" aria-hidden="true" />
          <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            {integrityPoints.map((item) => (
              <li key={item} className="leading-relaxed text-[var(--text-secondary)]">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </WorkspacePage>
  );
}
