"use client";

import { useApp } from "@/lib/appContext";
import { AIModelSelector } from "@/components/AIModelSelector";
import { AnalysisSubmitPanel } from "@/components/AnalysisSubmitPanel";
import { AIExplanationPanel } from "@/components/AIExplanationPanel";
import { RecommendationPanel } from "@/components/RecommendationPanel";
import { VerificationChecklist } from "@/components/VerificationChecklist";
import { ScrollReveal } from "@/components/ScrollReveal";

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
    <main className="app-shell">
      <section className="section">
        <div className="section-inner">
          <div className="mb-5">
            <h1 className="font-heading text-2xl font-bold">AI analysis</h1>
          </div>

          <div className="mx-auto max-w-5xl space-y-5">
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

            <div aria-live="polite" aria-atomic="false" className="space-y-5">
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
        </div>
      </section>
    </main>
  );
}
