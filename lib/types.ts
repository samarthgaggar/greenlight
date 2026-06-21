import type { LucideIcon } from "lucide-react";

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
  category?: string;
  district?: string;
  county?: string;
  zip?: string;
  gradeSpan?: string;
  enrollment?: number | null;
  website?: string;
  source?: string;
  distanceFromSf?: number;
  priorityArea?: boolean;
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
  factorNarratives?: FactorNarrative[];
  scenarioNarration?: ScenarioNarration;
};

export type AIModelChoice = "nemotron" | "gpt-oss";

// --- Decision support: interventions, simulation, ranking, explanation ---

export type InterventionId =
  | "bike-racks"
  | "protected-bike-arrival"
  | "crosswalk"
  | "compost-bins"
  | "bus-stop-relocation"
  | "recycling-access"
  | "shaded-walkway";

export type CostTier = "Low" | "Medium" | "High";
export type DifficultyTier = "Easy" | "Moderate" | "Hard";

export type InterventionEffect = {
  // Reduction applied to each barrier category at full effectiveness, before feasibility/context scaling.
  categoryDeltas: Partial<ScoringBreakdown>;
  costTier: CostTier;
  costRangeUsd: [number, number];
  difficulty: DifficultyTier;
  behaviorChangeWeight: number; // 0-1 expected behavior shift strength
  // Clearly labeled synthetic coefficients, expressed at full adoption.
  emissionsCoefficientKgPerYear: number;
  wasteCoefficientLbsPerWeek: number;
  baseAdoptionPercent: number; // 0-100 baseline adoption assumption
};

export type Intervention = {
  id: InterventionId;
  label: string;
  description: string;
  icon: LucideIcon;
  applicableActions: ClimateActionId[];
  applicableCategories: string[];
  effect: InterventionEffect;
};

export type InterventionContribution = {
  interventionId: InterventionId;
  label: string;
  scoreDelta: number;
  emissionsReductionKgPerYear: number;
  wasteReductionLbsPerWeek: number;
};

export type ScenarioProjection = {
  interventionIds: InterventionId[];
  baselineScore: number;
  projectedScore: number;
  scoreDelta: number;
  baselineBreakdown: ScoringBreakdown;
  projectedBreakdown: ScoringBreakdown;
  baselineSeverity: Severity;
  projectedSeverity: Severity;
  baselineConfidence: number;
  projectedConfidence: number;
  confidenceLevel: string;
  emissionsReductionKgPerYear: number;
  wasteReductionLbsPerWeek: number;
  adoptionRatePercent: number;
  contributions: InterventionContribution[];
};

export type InterventionRanking = {
  rank: number;
  interventionId: InterventionId;
  label: string;
  description: string;
  projectedScoreDelta: number;
  emissionsReductionKgPerYear: number;
  wasteReductionLbsPerWeek: number;
  adoptionRatePercent: number;
  costTier: CostTier;
  costRangeUsd: [number, number];
  difficulty: DifficultyTier;
  behaviorChangePercent: number;
  confidence: number;
  impactScore: number; // composite 0-100
};

export type RootCauseGroup = "Infrastructure" | "Accessibility" | "Safety" | "Behavior" | "Feasibility";

export type FactorRole = "barrier" | "leverage";

export type RootCauseFactor = {
  key: keyof ScoringBreakdown;
  label: string;
  group: RootCauseGroup;
  role: FactorRole;
  value: number;
  max: number;
  percentOfScore: number;
  intensity: number; // value / max, 0-1
  color: string;
};

export type ScoreExplanation = {
  totalScore: number;
  factors: RootCauseFactor[];
  topDrivers: RootCauseFactor[];
};

export type ProjectionChange = {
  key: keyof ScoringBreakdown;
  label: string;
  group: RootCauseGroup;
  before: number;
  after: number;
  delta: number;
  color: string;
};

export type ProjectionExplanation = {
  scoreDelta: number;
  changes: ProjectionChange[];
};

// LLM narration payloads (prose only, never numeric authority).

export type FactorNarrative = {
  group: RootCauseGroup;
  explanation: string;
};

export type ScenarioNarration = {
  summary: string;
  whyItHelps: string;
  adoptionRationale: string;
  uncertainty: string;
  verificationChecklist: string[];
};

export type RecommendationTask = "explanation" | "factors" | "scenario";
