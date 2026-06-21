"use client";

import { useApp } from "@/lib/appContext";
import { AIModelSelector } from "@/components/AIModelSelector";
import { AnalysisSubmitPanel } from "@/components/AnalysisSubmitPanel";
import { AIExplanationPanel } from "@/components/AIExplanationPanel";
import { RecommendationPanel } from "@/components/RecommendationPanel";
import { VerificationChecklist } from "@/components/VerificationChecklist";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WorkspacePage } from "@/components/WorkspacePage";

export default function AIPage() {
  const {
    selectedLocation,
    selectedActionLabel,
    selectedDeadZone,
    selectedAIModel,
    recommendation,
    loadingRecommendation,
    recommendationError,
    analysisSubmitted,
    presentationMode,
    setSelectedAIModel,
    runRecommendation
  } = useApp();

  return (
    <WorkspacePage eyebrow="Workspace" title="Local analysis">
      <div className="workspace-content workspace-stack">
        <ScrollReveal>
          <AIModelSelector
            value={selectedAIModel}
            onChange={setSelectedAIModel}
            disabled={loadingRecommendation}
          />
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <AnalysisSubmitPanel
            location={selectedLocation}
            actionLabel={selectedActionLabel}
            deadZone={selectedDeadZone}
            model={selectedAIModel}
            loading={loadingRecommendation}
            onSubmit={runRecommendation}
          />
        </ScrollReveal>

        <div aria-live="polite" aria-atomic="false" className="workspace-stack">
          {analysisSubmitted ? (
            <ScrollReveal delay={80}>
              <AIExplanationPanel
                deadZone={selectedDeadZone}
                recommendation={recommendation}
                loading={loadingRecommendation}
                error={recommendationError}
                presentationMode={presentationMode}
              />
            </ScrollReveal>
          ) : null}
          {recommendation && !loadingRecommendation ? (
            <ScrollReveal delay={120}>
              <RecommendationPanel
                recommendation={recommendation}
                presentationMode={presentationMode}
              />
            </ScrollReveal>
          ) : null}
          {recommendation && !loadingRecommendation ? (
            <ScrollReveal delay={160}>
              <VerificationChecklist
                recommendation={recommendation}
                presentationMode={presentationMode}
              />
            </ScrollReveal>
          ) : null}
        </div>
      </div>
    </WorkspacePage>
  );
}
