"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AIExplanationPanel } from "@/components/AIExplanationPanel";
import { AIModelSelector } from "@/components/AIModelSelector";
import { ActionSelector } from "@/components/ActionSelector";
import { AnalysisSubmitPanel } from "@/components/AnalysisSubmitPanel";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { DeadZoneCard } from "@/components/DeadZoneCard";
import { DemoReadyBadge } from "@/components/DemoReadyBadge";
import { DeveloperSettingsPanel } from "@/components/DeveloperSettingsPanel";
import { Hero } from "@/components/Hero";
import { InterventionRankingPanel } from "@/components/InterventionRankingPanel";
import { InterventionSelector } from "@/components/InterventionSelector";
import { LocationSearch } from "@/components/LocationSearch";
import { MapView } from "@/components/MapView";
import { Navbar } from "@/components/Navbar";
import { ProjectedImpactPanel } from "@/components/ProjectedImpactPanel";
import { RecommendationPanel } from "@/components/RecommendationPanel";
import { ResponsibleAISection } from "@/components/ResponsibleAISection";
import { ScrollReveal } from "@/components/ScrollReveal";
import { VerificationChecklist } from "@/components/VerificationChecklist";
import locationsData from "@/data/demo-locations.json";
import deadZonesData from "@/data/demo-dead-zones.json";
import observationsData from "@/data/demo-observations.json";
import censusContext from "@/data/demo-census.json";
import ejContext from "@/data/demo-ejscreen.json";
import { climateActions } from "@/lib/actions";
import { getInterventions } from "@/lib/interventions";
import { explainScore } from "@/lib/explain";
import { projectScenario, type SimulationContext } from "@/lib/simulation";
import { rankInterventions } from "@/lib/ranking";
import {
  type AiMode,
  createPolishedDemoRecommendation,
  disableDemoMode,
  enableDemoMode,
  getDemoDefaults,
  getStoredAiMode,
  getStoredDemoMode,
  getStoredPresentationMode,
  isDemoModeFromUrl,
  resetDemoFlow,
  setStoredAiMode,
  setStoredPresentationMode,
  toggleDemoMode
} from "@/lib/demoMode";
import type {
  AIModelChoice,
  ClimateActionId,
  DeadZone,
  InterventionId,
  LocationRecord,
  Observation,
  RecommendationResponse,
  ScenarioNarration
} from "@/lib/types";

const locations = locationsData as LocationRecord[];
const deadZones = deadZonesData as DeadZone[];
const observations = observationsData as Observation[];
const demoMapOrigin = { lat: 37.7749, lng: -122.4194 };
type ApiStatus = "missing" | "detected" | "connected" | "failed";
type ThemeChoice = "dark" | "light" | "system";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<LocationRecord>(locations[0]);
  const [selectedAction, setSelectedAction] = useState<ClimateActionId>("school-commute");
  const [selectedDeadZoneId, setSelectedDeadZoneId] = useState(deadZones[0].id);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [analysisSubmitted, setAnalysisSubmitted] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [developerSettingsOpen, setDeveloperSettingsOpen] = useState(false);
  const [aiMode, setAiMode] = useState<AiMode>("mock");
  const [apiStatus, setApiStatus] = useState<ApiStatus>("missing");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [themeChoice, setThemeChoice] = useState<ThemeChoice>("system");
  const [selectedAIModel, setSelectedAIModel] = useState<AIModelChoice>("nemotron");
  const [selectedInterventionIds, setSelectedInterventionIds] = useState<InterventionId[]>([]);
  const [scenarioNarration, setScenarioNarration] = useState<ScenarioNarration | null>(null);
  const [scenarioNarrationLoading, setScenarioNarrationLoading] = useState(false);
  const activeKeysRef = useRef(new Set<string>());
  const firedChordsRef = useRef(new Set<string>());
  const shiftedSequenceRef = useRef("");
  const shiftedSequenceTimeRef = useRef(0);
  const logoClicksRef = useRef<number[]>([]);
  // Monotonically increasing request ID to discard stale async responses.
  const recommendationRequestId = useRef(0);
  const scenarioRequestId       = useRef(0);

  const filteredDeadZones = useMemo(() => {
    const sourceDeadZones = demoMode ? deadZones : deadZones.filter((deadZone) => deadZone.selectedActions.includes(selectedAction));
    const matches = sourceDeadZones.length > 0 ? sourceDeadZones : deadZones;
    const latOffset = selectedLocation.lat - demoMapOrigin.lat;
    const lngOffset = selectedLocation.lng - demoMapOrigin.lng;

    return matches
      .map((deadZone) => ({
        ...deadZone,
        lat: Number((deadZone.lat + latOffset).toFixed(6)),
        lng: Number((deadZone.lng + lngOffset).toFixed(6))
      }))
      .sort((a, b) => b.score - a.score);
  }, [demoMode, selectedAction, selectedLocation.lat, selectedLocation.lng]);

  const selectedDeadZone = filteredDeadZones.find((deadZone) => deadZone.id === selectedDeadZoneId) ?? filteredDeadZones[0];
  const selectedActionLabel = climateActions.find((action) => action.id === selectedAction)?.label ?? selectedAction;
  const selectedObservations = useMemo(
    () => observations.filter((observation) => observation.deadZoneId === selectedDeadZone.id),
    [selectedDeadZone.id]
  );

  const simulationContext = useMemo<SimulationContext>(
    () => ({
      trafficProximityPercentile: ejContext.trafficProximityPercentile,
      heatExposurePercentile: ejContext.heatExposurePercentile,
      householdsWithoutVehiclePercent: censusContext.householdsWithoutVehiclePercent,
      youthSharePercent: censusContext.youthSharePercent
    }),
    []
  );

  const scenarioProjection = useMemo(
    () => projectScenario(selectedDeadZone, selectedInterventionIds, simulationContext),
    [selectedDeadZone, selectedInterventionIds, simulationContext]
  );

  const interventionRanking = useMemo(
    () => rankInterventions(selectedDeadZone, simulationContext),
    [selectedDeadZone, simulationContext]
  );

  useEffect(() => {
    const defaults = getDemoDefaults();

    function syncDemoState() {
      const active = getStoredDemoMode() || isDemoModeFromUrl();
      setDemoMode(active);
      setAiMode(getStoredAiMode());
      setPresentationMode(getStoredPresentationMode());

      if (active) {
        const demoLocation = locations.find((location) => location.name === defaults.location) ?? locations[0];
        setSelectedLocation(demoLocation);
        setSelectedAction(defaults.selectedAction);
        setSelectedDeadZoneId(defaults.selectedDeadZoneId);
        setSelectedInterventionIds(defaults.selectedInterventionIds);
      }
    }

    if (isDemoModeFromUrl()) {
      enableDemoMode();
    }

    syncDemoState();
    window.addEventListener("greenlight-demo-mode-change", syncDemoState);

    return () => {
      window.removeEventListener("greenlight-demo-mode-change", syncDemoState);
    };
  }, []);

  useEffect(() => {
    async function loadApiStatus() {
      try {
        const response = await fetch("/api/recommendation");
        const data = (await response.json()) as { hasApiKey?: boolean };
        setHasApiKey(Boolean(data.hasApiKey));
        setApiStatus(data.hasApiKey ? "detected" : "missing");
      } catch {
        setHasApiKey(false);
        setApiStatus("missing");
      }
    }

    loadApiStatus();
  }, []);

  useEffect(() => {
    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || isTypingTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      activeKeysRef.current.add(key);
      const shiftActive = event.shiftKey || activeKeysRef.current.has("shift");

      if (shiftActive && /^[a-z]$/.test(key)) {
        const now = Date.now();

        if (now - shiftedSequenceTimeRef.current > 1500) {
          shiftedSequenceRef.current = "";
        }

        shiftedSequenceRef.current = `${shiftedSequenceRef.current}${key}`.slice(-4);
        shiftedSequenceTimeRef.current = now;
      }

      if (shiftActive && shiftedSequenceRef.current.endsWith("gl") && !firedChordsRef.current.has("demo")) {
        firedChordsRef.current.add("demo");
        const enabled = toggleDemoMode();
        setDemoMode(enabled);
      }

      if (shiftActive && shiftedSequenceRef.current.endsWith("dev") && !firedChordsRef.current.has("dev")) {
        firedChordsRef.current.add("dev");
        setDeveloperSettingsOpen((open) => !open);
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      activeKeysRef.current.delete(event.key.toLowerCase());

      if (!activeKeysRef.current.has("shift")) {
        firedChordsRef.current.clear();
        shiftedSequenceRef.current = "";
      }
    }

    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("keyup", onKeyUp, { capture: true });

    return () => {
      window.removeEventListener("keydown", onKeyDown, { capture: true });
      window.removeEventListener("keyup", onKeyUp, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (!filteredDeadZones.some((deadZone) => deadZone.id === selectedDeadZoneId)) {
      setSelectedDeadZoneId(filteredDeadZones[0].id);
    }
  }, [filteredDeadZones, selectedDeadZoneId]);

  useEffect(() => {
    setRecommendation(null);
    setRecommendationError(null);
    setAnalysisSubmitted(false);
    setScenarioNarration(null);
    // Invalidate any in-flight requests so stale responses are discarded.
    recommendationRequestId.current++;
    scenarioRequestId.current++;
  }, [selectedAIModel, selectedActionLabel, selectedDeadZone.id, selectedLocation.name]);

  function handleLogoClick() {
    const now = Date.now();
    logoClicksRef.current = [...logoClicksRef.current.filter((clickTime) => now - clickTime <= 3000), now];

    if (logoClicksRef.current.length >= 5) {
      logoClicksRef.current = [];
      const enabled = toggleDemoMode();
      setDemoMode(enabled);
    }
  }

  function handleDemoModeChange(enabled: boolean) {
    if (enabled) {
      enableDemoMode();
    } else {
      disableDemoMode();
    }

    setDemoMode(enabled);
  }

  function handleAiModeChange(mode: AiMode) {
    const nextMode = mode === "live" && !hasApiKey ? "mock" : mode;
    setStoredAiMode(nextMode);
    setAiMode(nextMode);
  }

  function applyTheme(choice: ThemeChoice) {
    setThemeChoice(choice);

    if (choice === "system") {
      window.localStorage.removeItem("greenlight-theme");
      const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      document.documentElement.dataset.theme = systemTheme;
    } else {
      window.localStorage.setItem("greenlight-theme", choice);
      document.documentElement.dataset.theme = choice;
    }

    window.dispatchEvent(new CustomEvent("greenlight-theme-change"));
  }

  function handlePresentationModeChange(enabled: boolean) {
    setStoredPresentationMode(enabled);
    setPresentationMode(enabled);
  }

  function handleResetDemoFlow() {
    resetDemoFlow();
    setDemoMode(false);
    setAiMode("mock");
    setPresentationMode(false);
    setThemeChoice("system");
    setSelectedLocation(locations[0]);
    setSelectedAction("school-commute");
    setSelectedDeadZoneId(deadZones[0].id);
    setSelectedInterventionIds([]);
    setScenarioNarration(null);
    window.history.replaceState(null, "", window.location.pathname);
  }

  const handleSelectDeadZone = useCallback((id: string) => {
    setSelectedDeadZoneId(id);
    setSelectedInterventionIds([]);
    setScenarioNarration(null);
  }, []);

  const handleSelectAction = useCallback((action: ClimateActionId) => {
    setSelectedAction(action);
    setSelectedInterventionIds([]);
    setScenarioNarration(null);
  }, []);

  const handleSelectLocation = useCallback((location: LocationRecord) => {
    setSelectedLocation(location);
    setSelectedInterventionIds([]);
    setScenarioNarration(null);
  }, []);

  const handleCustomLocation = useCallback((location: LocationRecord) => {
    setSelectedInterventionIds([]);
    setScenarioNarration(null);
    setSelectedLocation({
      ...location,
      type: "custom",
      description:
        location.description || "Custom place selected by the user. Greenlight is using local barrier analysis for this MVP."
    });
  }, []);

  const handleToggleIntervention = useCallback((id: InterventionId) => {
    setScenarioNarration(null);
    setSelectedInterventionIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  }, []);

  function buildLocalScenarioNarration(): ScenarioNarration {
    const labels = getInterventions(selectedInterventionIds).map((intervention) => intervention.label);
    const fixList = labels.length > 0 ? labels.join(", ") : "the selected improvements";

    return {
      summary: `Greenlight projected the effect of ${fixList} on ${selectedDeadZone.name}. The numbers above come from the deterministic simulation; this explanation only describes what they mean.`,
      whyItHelps: "These improvements target the specific access, safety, and behavior factors that make this barrier score high, so easing them lowers the projected barrier score.",
      adoptionRationale: "Projected adoption reflects how visible, safe, and convenient each improvement makes the climate-friendly choice, scaled by local fix feasibility.",
      uncertainty: "Projections use synthetic coefficients and local context. Real outcomes depend on verification, maintenance, and community response.",
      verificationChecklist: [
        "Confirm the barrier and the proposed improvement on site with adult supervision.",
        "Measure a simple before-and-after count for one week.",
        "Share the projection and observed result with the responsible decision maker."
      ]
    };
  }

  async function runScenarioNarration() {
    if (selectedInterventionIds.length === 0) return;

    const requestId = ++scenarioRequestId.current;
    setScenarioNarrationLoading(true);

    if (demoMode && aiMode === "mock") {
      if (requestId !== scenarioRequestId.current) return;
      setScenarioNarration(buildLocalScenarioNarration());
      setScenarioNarrationLoading(false);
      return;
    }

    const payload = {
      task: "scenario",
      locationName: selectedLocation.name,
      selectedAction: selectedActionLabel,
      deadZone: selectedDeadZone,
      projection: scenarioProjection,
      interventionLabels: getInterventions(selectedInterventionIds).map((i) => i.label),
      forceMockAI: demoMode && aiMode === "mock",
      preferredModel: selectedAIModel
    };

    try {
      const response = await fetch("/api/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (requestId !== scenarioRequestId.current) return;
      if (!response.ok) throw new Error(`Scenario route returned ${response.status}`);
      const data = (await response.json()) as RecommendationResponse;
      if (requestId !== scenarioRequestId.current) return;
      setScenarioNarration(data.scenarioNarration ?? buildLocalScenarioNarration());
    } catch {
      if (requestId !== scenarioRequestId.current) return;
      setScenarioNarration(buildLocalScenarioNarration());
    } finally {
      if (requestId === scenarioRequestId.current) setScenarioNarrationLoading(false);
    }
  }

  async function runRecommendation() {
    const requestId = ++recommendationRequestId.current;
    setAnalysisSubmitted(true);

    if (demoMode && aiMode === "mock") {
      setRecommendation(createPolishedDemoRecommendation());
      setRecommendationError(null);
      setLoadingRecommendation(false);
      return;
    }

    setLoadingRecommendation(true);
    setRecommendation(null);
    setRecommendationError(null);

    const payload = {
      task: "explanation",
      selectedAction: selectedActionLabel,
      locationName: selectedLocation.name,
      deadZone: selectedDeadZone,
      scoringBreakdown: selectedDeadZone.scoringBreakdown,
      scoreExplanation: explainScore(selectedDeadZone),
      observedEvidence: selectedDeadZone.observedEvidence,
      censusContext,
      ejContext,
      confidence: selectedDeadZone.confidence,
      userObservations: selectedObservations,
      forceMockAI: demoMode && aiMode === "mock",
      preferredModel: selectedAIModel
    };

    try {
      const response = await fetch("/api/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (requestId !== recommendationRequestId.current) return;
      if (!response.ok) throw new Error(`Recommendation route returned ${response.status}`);
      const data = (await response.json()) as RecommendationResponse;
      if (requestId !== recommendationRequestId.current) return;
      setRecommendation(data);
      setRecommendationError(data.error ?? null);
      setApiStatus(data.mode === "live" ? "connected" : data.error ? "failed" : apiStatus);
    } catch (error) {
      if (requestId !== recommendationRequestId.current) return;
      setRecommendation({
        summary: `${selectedDeadZone.name} is ranked by deterministic scoring, but the recommendation route could not be reached.`,
        likelyCause: "The local explanation service did not respond.",
        observedEvidence: selectedDeadZone.observedEvidence,
        aiInference: "Use the deterministic score and local verification checklist until the API route is available.",
        uncertainty: "Greenlight completed this analysis with its reliability layer. Human verification is still required.",
        rankedFixes: selectedDeadZone.recommendedFixes,
        lowCostAction: "Verify the barrier with a supervised walkthrough.",
        mediumCostAction: "Pilot a temporary fix and measure the result.",
        longTermAction: "Escalate documented findings to the responsible decision maker.",
        equityNote: "Use access context to prioritize fairness, not to stereotype.",
        verificationChecklist: [
          "Confirm the barrier at the relevant time of day.",
          "Verify from a safe public location with adult supervision.",
          "Record evidence without identifying private individuals."
        ],
        decisionMakerMessage: `Hello, we found a possible climate-action barrier called "${selectedDeadZone.name}" at ${selectedLocation.name}. Could you help us verify it safely and identify a practical first fix?`,
        responsibleAIWarning: "This recommendation is not a final safety or infrastructure judgment.",
        mode: "mock",
        error: error instanceof Error ? error.message : "Recommendation failed."
      });
      setRecommendationError("Greenlight completed the analysis with its reliability layer.");
      setApiStatus("failed");
    } finally {
      if (requestId === recommendationRequestId.current) setLoadingRecommendation(false);
    }
  }

  return (
    <main className="app-shell">
      <Navbar onLogoClick={handleLogoClick} />
      <Hero
        onShowcaseLocation={() => {
          if (presentationMode) {
            setTimeout(() => document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" }), 80);
          }
        }}
      />

      <section id="workspace" className="section">
        <div className="section-inner">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-4xl font-bold">Find the local block</h2>
              <p className="mt-3 max-w-3xl leading-7 text-[var(--text-secondary)]">
                Pick a place and goal. Greenlight ranks barriers, simulates improvements, and asks AI to explain what the numbers mean.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <DataSourceBadge type="osm" label="OpenStreetMap capable" />
              <DataSourceBadge type="demo" label="Local analysis ready" />
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
              <MapView
                location={selectedLocation}
                deadZones={filteredDeadZones}
                selectedDeadZone={selectedDeadZone}
                presentationMode={presentationMode}
                onSelectDeadZone={(deadZone) => handleSelectDeadZone(deadZone.id)}
              />
            </ScrollReveal>

            <ScrollReveal delay={160}>
              <section className="panel rounded-xl p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-2xl font-bold">Barrier ranking</h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">Most important local blocks, ranked by score.</p>
                  </div>
                  <p className="text-sm font-bold text-[var(--text-muted)]">0-100</p>
                </div>
                <div className="grid gap-2">
                  {filteredDeadZones.map((deadZone) => (
                    <DeadZoneCard
                      key={deadZone.id}
                      deadZone={deadZone}
                      selected={deadZone.id === selectedDeadZone.id}
                      presentationMode={presentationMode}
                      onSelect={(nextDeadZone) => handleSelectDeadZone(nextDeadZone.id)}
                    />
                  ))}
                </div>
              </section>
            </ScrollReveal>

            <ScrollReveal delay={180}>
              <div className="space-y-5">
                <InterventionSelector
                  deadZone={selectedDeadZone}
                  selectedInterventionIds={selectedInterventionIds}
                  onToggle={handleToggleIntervention}
                />
                <ProjectedImpactPanel
                  projection={scenarioProjection}
                  narration={scenarioNarration}
                  narrationLoading={scenarioNarrationLoading}
                  onExplain={runScenarioNarration}
                  presentationMode={presentationMode}
                />
                <InterventionRankingPanel
                  rankings={interventionRanking}
                  selectedInterventionIds={selectedInterventionIds}
                  onToggleIntervention={handleToggleIntervention}
                  presentationMode={presentationMode}
                />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="space-y-5">
                <AIModelSelector value={selectedAIModel} onChange={setSelectedAIModel} disabled={loadingRecommendation} />
                <AnalysisSubmitPanel
                  location={selectedLocation}
                  actionLabel={selectedActionLabel}
                  deadZone={selectedDeadZone}
                  model={selectedAIModel}
                  loading={loadingRecommendation}
                  onSubmit={runRecommendation}
                />
              </div>
            </ScrollReveal>

            {/* aria-live so assistive tech announces when AI results arrive */}
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
                  <RecommendationPanel recommendation={recommendation} presentationMode={presentationMode} />
                </ScrollReveal>
              ) : null}
              {recommendation && !loadingRecommendation ? (
                <ScrollReveal delay={160}>
                  <VerificationChecklist recommendation={recommendation} presentationMode={presentationMode} />
                </ScrollReveal>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <ScrollReveal>
        <ResponsibleAISection />
      </ScrollReveal>

      <section id="data" className="section pt-0">
        <div className="section-inner">
          <ScrollReveal>
            <div className="panel rounded-xl p-6">
              <h2 className="font-heading text-3xl font-bold">Data source disclosure</h2>
              <p className="mt-3 max-w-4xl leading-7 text-[var(--text-secondary)]">
                Greenlight supports public and open data such as OpenStreetMap / Overpass, Census TIGER or ACS-style context,
                EPA EJScreen-style context, and local observations. This MVP includes local synthetic JSON and GeoJSON so the
                experience stays reliable when live map services are unavailable.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <DataSourceBadge type="osm" label="OpenStreetMap / Overpass API" />
                <DataSourceBadge type="census" label="Census TIGER / ACS-style context" />
                <DataSourceBadge type="ejscreen" label="EPA EJScreen-style context" />
                <DataSourceBadge type="demo" label="Local JSON / GeoJSON data" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      <DemoReadyBadge active={demoMode} />
      <DeveloperSettingsPanel
        open={developerSettingsOpen}
        demoMode={demoMode}
        aiMode={aiMode}
        apiStatus={apiStatus}
        presentationMode={presentationMode}
        themeChoice={themeChoice}
        liveAiAllowed={hasApiKey}
        onClose={() => setDeveloperSettingsOpen(false)}
        onDemoModeChange={handleDemoModeChange}
        onAiModeChange={handleAiModeChange}
        onThemeChange={applyTheme}
        onPresentationModeChange={handlePresentationModeChange}
        onResetDemoFlow={handleResetDemoFlow}
      />
    </main>
  );
}
