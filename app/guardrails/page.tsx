import { ResponsibleAISection } from "@/components/ResponsibleAISection";
import { WorkspacePage } from "@/components/WorkspacePage";

export const metadata = {
  title: "Guardrails | Greenlight"
};

export default function GuardrailsPage() {
  return (
    <WorkspacePage eyebrow="Policy" title="Responsible AI guardrails">
      <div className="workspace-content">
        <ResponsibleAISection />
      </div>
    </WorkspacePage>
  );
}
