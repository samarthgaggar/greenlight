import type { AIRecommendation, FactorNarrative, InterventionId, RecommendationResponse } from "@/lib/types";

const DEMO_KEY = "greenlight-demo-mode";
const AI_MODE_KEY = "greenlight-ai-mode";
const PRESENTATION_KEY = "greenlight-presentation-mode";

export type DemoDefaults = {
  location: "Greenlight High School";
  selectedAction: "bike";
  selectedDeadZoneId: "unsafe-bike-approach";
  selectedInterventionIds: InterventionId[];
  useMockData: true;
  useMockAI: true;
  presentationMode: false;
};

export type AiMode = "mock" | "live";

export function isDemoModeFromUrl() {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("showcase") === "greenlight" || params.get("demo") === "greenlight";
}

export function enableDemoMode() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEMO_KEY, "true");
  window.dispatchEvent(new CustomEvent("greenlight-demo-mode-change"));
}

export function disableDemoMode() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEMO_KEY, "false");
  window.dispatchEvent(new CustomEvent("greenlight-demo-mode-change"));
}

export function toggleDemoMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const enabled = !getStoredDemoMode();
  window.localStorage.setItem(DEMO_KEY, String(enabled));
  window.dispatchEvent(new CustomEvent("greenlight-demo-mode-change"));
  return enabled;
}

export function resetDemoFlow() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DEMO_KEY);
  window.localStorage.removeItem(AI_MODE_KEY);
  window.localStorage.removeItem(PRESENTATION_KEY);
  window.localStorage.removeItem("greenlight-theme");
  delete document.documentElement.dataset.theme;
  window.dispatchEvent(new CustomEvent("greenlight-demo-mode-change"));
}

export function getDemoDefaults(): DemoDefaults {
  return {
    location: "Greenlight High School",
    selectedAction: "bike",
    selectedDeadZoneId: "unsafe-bike-approach",
    selectedInterventionIds: ["protected-bike-arrival"],
    useMockData: true,
    useMockAI: true,
    presentationMode: false
  };
}

export function getStoredDemoMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(DEMO_KEY) === "true";
}

export function getStoredAiMode(): AiMode {
  if (typeof window === "undefined") {
    return "mock";
  }

  return window.localStorage.getItem(AI_MODE_KEY) === "live" ? "live" : "mock";
}

export function setStoredAiMode(mode: AiMode) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AI_MODE_KEY, mode);
}

export function getStoredPresentationMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(PRESENTATION_KEY) === "true";
}

export function setStoredPresentationMode(enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PRESENTATION_KEY, String(enabled));
}

export function createPolishedDemoRecommendation(): RecommendationResponse {
  const recommendation: AIRecommendation = {
    summary:
      "Unsafe Bike Approach is the strongest Greenlight barrier for this location. The deterministic score is high because the bike arrival path overlaps a busy vehicle edge, making a good climate action feel risky before students even reach campus.",
    likelyCause:
      "The local system appears to route bikes and cars into the same arrival pressure point. That creates safety friction that can suppress biking even when students are willing to ride.",
    observedEvidence: [
      "Bike approach intersects the busiest vehicle arrival edge.",
      "No protected waiting pocket is shown in the local map layer.",
      "Student observation notes mention turning conflicts."
    ],
    aiInference:
      "This is likely an operations and street-design barrier, not an individual motivation problem. A temporary protected arrival box and supervised observation can test the fix before a larger capital request.",
    uncertainty:
      "The exact turning volume, legal curb rules, and crash history must be verified with adult supervision and public agency guidance.",
    rankedFixes: [
      "Pilot a protected bike arrival box with cones during morning drop-off.",
      "Place adult supervision at the conflict point for one week and count bike arrivals, near-conflicts, and queue spillback.",
      "Ask the city or district to review daylighting, curb paint, and bike-lane protection if the pilot improves safety."
    ],
    lowCostAction: "Use cones, signs, and a supervised one-week observation count to test whether the conflict point improves.",
    mediumCostAction: "Add painted curb guidance, a clearer bike waiting pocket, and arrival-time staff routing.",
    longTermAction: "Request a formal city or district safety review for protected bike access and crossing upgrades.",
    equityNote:
      "Students without reliable car access may benefit most from safer biking. Use access context to prioritize fairness without assuming how any student travels.",
    verificationChecklist: [
      "Observe the bike approach during morning arrival with adult supervision.",
      "Count bikes, vehicle turns, and conflicts from a safe public location.",
      "Check whether cones or temporary signs reduce confusion.",
      "Compare the observation with public map data and school arrival rules.",
      "Ask the district or city which permanent fix is feasible first."
    ],
    decisionMakerMessage:
      "Hello, we are using Greenlight to study local climate-action barriers at Greenlight High School. The highest-priority issue we found is Unsafe Bike Approach with a deterministic score of 82/100. We are not asking you to treat this as a final infrastructure judgment. We would like to verify the evidence with a supervised arrival observation and discuss a practical first fix, such as a temporary protected bike arrival box, clearer routing, or a city safety review. Could you help us identify the right contact and the safest way to evaluate this?",
    responsibleAIWarning:
      "This recommendation supports student inquiry. It does not replace professional engineering, legal, safety, or environmental review."
  };

  const factorNarratives: FactorNarrative[] = [
    { group: "Infrastructure", explanation: "The bike approach overlaps the busiest vehicle arrival edge, so the physical layout makes the route feel blocked." },
    { group: "Safety", explanation: "Turning conflicts and the lack of a protected waiting pocket add the most friction, which discourages riding." },
    { group: "Behavior", explanation: "Biking to school is a high-value climate action here, so the barrier suppresses a choice many students would otherwise make." },
    { group: "Accessibility", explanation: "Students without reliable car access are most affected, raising the equity weight of fixing this approach." },
    { group: "Feasibility", explanation: "A temporary protected arrival box can be tested quickly, so the barrier is realistically addressable." }
  ];

  return {
    ...recommendation,
    factorNarratives,
    mode: "mock"
  };
}
