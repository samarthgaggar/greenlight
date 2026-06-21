import { Database, Globe, Map, Shield } from "lucide-react";

export const metadata = {
  title: "Data sources | Greenlight"
};

const dataSources = [
  {
    icon: Globe,
    color: "var(--data)",
    label: "OpenStreetMap / Overpass API",
    status: "Live-capable",
    detail: "Map geometry and live barrier signals — bike lanes, crosswalks, transit gaps."
  },
  {
    icon: Database,
    color: "var(--equity)",
    label: "Census ACS-style context",
    status: "Synthetic MVP",
    detail: "Vehicle availability and youth share data to weight equity and access scores."
  },
  {
    icon: Shield,
    color: "var(--warning)",
    label: "EPA EJScreen-style context",
    status: "Synthetic MVP",
    detail: "Traffic proximity and heat exposure percentiles for safety friction and equity."
  },
  {
    icon: Map,
    color: "var(--primary)",
    label: "Local JSON / GeoJSON",
    status: "Bundled",
    detail: "All barrier locations, scores, evidence, and fixes — fully offline, no API key needed."
  }
];

export default function DataPage() {
  return (
    <main className="app-shell">
      <section className="section pt-12">
        <div className="section-inner">
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-bold">Data sources</h1>
          </div>

          <div className="mx-auto max-w-5xl space-y-4">
            {/* Source grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {dataSources.map(({ icon: Icon, color, label, status, detail }) => (
                <div
                  key={label}
                  className="panel flex items-start gap-4 rounded-xl p-4 transition-colors hover:bg-[var(--surface-elevated)]"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `color-mix(in srgb, ${color} 14%, var(--surface-elevated))` }}
                  >
                    <Icon size={20} aria-hidden="true" style={{ color }} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-[var(--text-primary)]">{label}</p>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]"
                        style={{
                          background: `color-mix(in srgb, ${color} 12%, var(--surface-elevated))`,
                          color
                        }}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Integrity statement */}
            <div className="panel rounded-xl p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface-elevated))]">
                  <Shield size={18} className="text-[var(--primary)]" aria-hidden="true" />
                </span>
                <p className="font-bold text-[var(--text-primary)]">Integrity guarantee</p>
              </div>
              <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                {[
                  "No private or personally identifiable data collected or stored",
                  "AI never produces or modifies numeric values",
                  "All scores are deterministic — reproducible from the same inputs",
                  "Bay Area high-school index from CDE 2024–25, generated offline"
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[var(--text-secondary)]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
