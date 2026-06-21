import Link from "next/link";
import { HeroHeadline } from "@/components/HeroHeadline";
import { GreenlightLogoAnimation } from "@/components/ui/greenlight-logo";

export function Hero() {
  return (
    <section id="top" className="section hero-section pb-8 pt-16 md:pt-24">
      <div className="section-inner grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-[var(--badge-primary-border)] bg-[var(--badge-primary-bg)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
            AI for everyday climate action
          </div>
          <HeroHeadline />
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)] md:text-xl">
            Greenlight finds what blocks climate action in a specific place, ranks practical fixes, and shows what changes if you try them.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="button-primary no-underline" href="/simulator">
              Try the simulator
            </Link>
            <Link className="button-ghost no-underline" href="/map">
              Find the barrier
            </Link>
            <Link className="button-ghost no-underline" href="/guardrails">
              See our guardrails
            </Link>
          </div>
        </div>

        <GreenlightLogoAnimation />
      </div>
    </section>
  );
}
