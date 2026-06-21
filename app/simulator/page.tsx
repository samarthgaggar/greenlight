"use client";

import { useApp } from "@/lib/appContext";
import { LocationSearch } from "@/components/LocationSearch";
import { ActionSelector } from "@/components/ActionSelector";
import { InterventionSelector } from "@/components/InterventionSelector";
import { ProjectedImpactPanel } from "@/components/ProjectedImpactPanel";
import { InterventionRankingPanel } from "@/components/InterventionRankingPanel";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WorkspacePage } from "@/components/WorkspacePage";
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
    <WorkspacePage
      eyebrow="Workspace"
      title="Scenario simulator"
      headerExtra={
        <>
          <DataSourceBadge type="osm" label="OpenStreetMap" />
          <DataSourceBadge type="demo" label="Local data" />
        </>
      }
    >
      <div className="workspace-content workspace-stack">
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
    </WorkspacePage>
  );
}
