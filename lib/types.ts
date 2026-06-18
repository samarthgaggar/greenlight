export type Severity = "Low" | "Medium" | "High";

export type ClimateActionId =
  | "bike"
  | "walk"
  | "transit"
  | "compost"
  | "waste"
  | "idling"
  | "reuse"
  | "school-commute";

export type LocationRecord = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
};

export type ScoringBreakdown = {
  accessGap: number;
  safetyFriction: number;
  actionImportance: number;
  equityAccessConcern: number;
  fixFeasibility: number;
};

export type DeadZone = {
  id: string;
  name: string;
  category: string;
  selectedActions: ClimateActionId[];
  score: number;
  severity: Severity;
  label: string;
  lat: number;
  lng: number;
  confidence: number;
  scoringBreakdown: ScoringBreakdown;
  observedEvidence: string[];
  recommendedFixes: string[];
};

export type Observation = {
  id: string;
  deadZoneId: string;
  text: string;
  source: string;
  confidence: "low" | "medium" | "high";
};

export type AIRecommendation = {
  summary: string;
  likelyCause: string;
  observedEvidence: string[];
  aiInference: string;
  uncertainty: string;
  rankedFixes: string[];
  lowCostAction: string;
  mediumCostAction: string;
  longTermAction: string;
  equityNote: string;
  verificationChecklist: string[];
  decisionMakerMessage: string;
  responsibleAIWarning: string;
};

export type RecommendationResponse = AIRecommendation & {
  mode: "mock" | "live";
  modelUsed?: string;
  error?: string;
};

export type AIModelChoice = "nemotron" | "gpt-oss";
