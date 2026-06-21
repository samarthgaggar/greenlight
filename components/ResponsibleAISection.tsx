import {
  AlertTriangle,
  BarChart2,
  Brain,
  EyeOff,
  FileSearch,
  GitBranch,
  Map,
  ShieldCheck,
  UserCheck
} from "lucide-react";

const guardrails: Array<{ icon: typeof ShieldCheck; text: string; color: string }> = [
  { icon: Map,          text: "Map data may be incomplete.",                                    color: "var(--data)"   },
  { icon: GitBranch,    text: "Evidence and inference are always kept separate.",               color: "var(--primary)"},
  { icon: UserCheck,    text: "Safety claims require human verification.",                      color: "var(--warning)"},
  { icon: EyeOff,       text: "Demographic data is used only to prioritize fairness.",          color: "var(--equity)" },
  { icon: AlertTriangle,text: "Students should not inspect unsafe roads alone.",                color: "var(--danger)" },
  { icon: Brain,        text: "The app recommends; it does not make infrastructure decisions.", color: "var(--primary)"},
  { icon: BarChart2,    text: "Projected impacts are estimates — verify locally before acting.",color: "var(--warning)"},
  { icon: FileSearch,   text: "AI explains scores. It never generates or modifies numbers.",    color: "var(--data)"   },
  { icon: ShieldCheck,  text: "No private or personally identifiable data is collected.",       color: "var(--equity)" }
];

export function ResponsibleAISection() {
  return (
    <section id="responsible-ai" className="section">
      <div className="section-inner">
        <div className="panel rounded-xl p-6 md:p-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {guardrails.map(({ icon: Icon, text, color }) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-colors hover:bg-[var(--surface-elevated)]"
              >
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `color-mix(in srgb, ${color} 12%, var(--surface-elevated))` }}
                >
                  <Icon size={16} aria-hidden="true" style={{ color }} />
                </span>
                <p className="text-sm font-semibold leading-snug text-[var(--text-secondary)]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
