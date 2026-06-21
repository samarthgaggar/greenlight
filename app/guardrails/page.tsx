import { ResponsibleAISection } from "@/components/ResponsibleAISection";

export const metadata = {
  title: "Guardrails | Greenlight"
};

export default function GuardrailsPage() {
  return (
    <main className="app-shell">
      <section className="section pt-12">
        <div className="section-inner">
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-bold">Responsible AI guardrails</h1>
          </div>
        </div>
      </section>
      <ResponsibleAISection />
    </main>
  );
}
