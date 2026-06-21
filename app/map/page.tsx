"use client";

import { useApp } from "@/lib/appContext";
import { LocationSearch } from "@/components/LocationSearch";
import { ActionSelector } from "@/components/ActionSelector";
import { MapView } from "@/components/MapView";
import { DeadZoneCard } from "@/components/DeadZoneCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WorkspacePage } from "@/components/WorkspacePage";
import locationsData from "@/data/demo-locations.json";
import type { LocationRecord } from "@/lib/types";

const locations = locationsData as LocationRecord[];

export default function MapPage() {
  const {
    selectedLocation,
    selectedAction,
    selectedDeadZone,
    filteredDeadZones,
    presentationMode,
    handleSelectLocation,
    handleCustomLocation,
    handleSelectAction,
    handleSelectDeadZone
  } = useApp();

  return (
    <WorkspacePage eyebrow="Workspace" title="Barrier map">
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
          <MapView
            location={selectedLocation}
            deadZones={filteredDeadZones}
            selectedDeadZone={selectedDeadZone}
            presentationMode={presentationMode}
            onSelectDeadZone={(dz) => handleSelectDeadZone(dz.id)}
          />
        </ScrollReveal>

        <ScrollReveal delay={160}>
          <section className="panel rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="workspace-eyebrow">Barrier ranking</p>
              <p className="text-[10px] font-bold text-[var(--text-muted)]">Score 0–100</p>
            </div>
            <div className="grid gap-2">
              {filteredDeadZones.map((dz) => (
                <DeadZoneCard
                  key={dz.id}
                  deadZone={dz}
                  selected={dz.id === selectedDeadZone.id}
                  presentationMode={presentationMode}
                  onSelect={(next) => handleSelectDeadZone(next.id)}
                />
              ))}
            </div>
          </section>
        </ScrollReveal>
      </div>
    </WorkspacePage>
  );
}
