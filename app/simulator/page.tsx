"use client";

import { useApp } from "@/lib/appContext";
import { LocationSearch } from "@/components/LocationSearch";
import { ActionSelector } from "@/components/ActionSelector";
import { InterventionSelector } from "@/components/InterventionSelector";
import { ProjectedImpactPanel } from "@/components/ProjectedImpactPanel";
import { InterventionRankingPanel } from "@/components/InterventionRankingPanel";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { ScrollReveal } from "@/components/ScrollReveal";
import locationsData from "@/data/demo-locations.json";
import type { LocationRecord } from "@/lib/types";

const locations = locationsData as LocationRecord[];

export default function SimulatorPage() {
  const {
    selectedLocation,
    selectedAction,
    selectedDeadZone,
    selectedInterventionIds,
    scenarioProjection,
    interventionRanking,
    scenarioNarration,
    scenarioNarrationLoading,
    presentationMode,
    handleSelectLocation,
    handleCustomLocation,
    handleSelectAction,
    handleToggleIntervention,
    runScenarioNarration
  } = useApp();

  return (
    <main className="app-shell">
      <section className="section">
        <div className="section-inner">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-heading text-2xl font-bold">Scenario simulator</h1>
            <div className="flex flex-wrap gap-2">
              <DataSourceBadge type="osm" label="OpenStreetMap" />
              <DataSourceBadge type="demo" label="Local data" />
            </div>
          </div>

          <div className="mx-auto max-w-5xl space-y-5">
            <ScrollReveal>
              <LocationSearch
                locations={locations}
                selectedLocation={selectedLocation}
                onSelectLocation={handleSelectLocation}
                onCustomLocation={handleCustomLocation}
              />
            </ScrollReveal>

            <ScrollReveal delay={80}>
              <ActionSelector selectedAction={selectedAction} onSelectAction={handleSelectAction} />
            </ScrollReveal>

            <ScrollReveal delay={120}>
              <InterventionSelector
                deadZone={selectedDeadZone}
                selectedInterventionIds={selectedInterventionIds}
                onToggle={handleToggleIntervention}
              />
            </ScrollReveal>

            <ScrollReveal delay={160}>
              <ProjectedImpactPanel
                projection={scenarioProjection}
                narration={scenarioNarration}
                narrationLoading={scenarioNarrationLoading}
                onExplain={runScenarioNarration}
                presentationMode={presentationMode}
              />
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <InterventionRankingPanel
                rankings={interventionRanking}
                selectedInterventionIds={selectedInterventionIds}
                onToggleIntervention={handleToggleIntervention}
                presentationMode={presentationMode}
              />
            </ScrollReveal>
          </div>
        </div>
      </section>
    </main>
  );
}
