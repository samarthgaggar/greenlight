import type {
  DeadZone,
  Intervention,
  InterventionContribution,
  InterventionId,
  ScenarioProjection,
  ScoringBreakdown,
  Severity
} from "@/lib/types";
import { calculateScore, confidenceLabel, getSeverity, scoreCategories } from "@/lib/scoring";
import { getIntervention } from "@/lib/interventions";

export type SimulationContext = {
  trafficProximityPercentile?: number;
  heatExposurePercentile?: number;
  householdsWithoutVehiclePercent?: number;
  youthSharePercent?: number;
};

const maxByKey = scoreCategories.reduce<Record<keyof ScoringBreakdown, number>>(
  (accumulator, category) => {
    accumulator[category.key] = category.max;
    return accumulator;
  },
  { accessGap: 0, safetyFriction: 0, actionImportance: 0, equityAccessConcern: 0, fixFeasibility: 0 }
);

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// Higher fix feasibility means more of an intervention's modeled effect is realized.
function feasibilityFactor(deadZone: DeadZone) {
  return 0.6 + 0.4 * (deadZone.scoringBreakdown.fixFeasibility / maxByKey.fixFeasibility);
}

// Mild, bounded context weighting so local conditions nudge but never dominate the model.
function contextMultiplier(key: keyof ScoringBreakdown, context: SimulationContext) {
  if (key === "safetyFriction") {
    const traffic = (context.trafficProximityPercentile ?? 50) / 100;
    return clamp(0.95 + traffic * 0.2, 0.9, 1.2);
  }

  if (key === "accessGap") {
    const noVehicle = (context.householdsWithoutVehiclePercent ?? 10) / 100;
    return clamp(0.95 + noVehicle * 0.8, 0.9, 1.2);
  }

  if (key === "equityAccessConcern") {
    const noVehicle = (context.householdsWithoutVehiclePercent ?? 10) / 100;
    const youth = (context.youthSharePercent ?? 20) / 100;
    return clamp(0.95 + (noVehicle + youth) * 0.4, 0.9, 1.2);
  }

  return 1;
}

export function applicability(intervention: Intervention, deadZone: DeadZone) {
  const categoryMatch = intervention.applicableCategories.includes(deadZone.category.toLowerCase());
  const actionMatch = intervention.applicableActions.some((action) => deadZone.selectedActions.includes(action));
  return categoryMatch || actionMatch ? 1 : 0.5;
}

type SingleResult = {
  scoreDelta: number;
  reductions: Partial<Record<keyof ScoringBreakdown, number>>;
  emissionsReductionKgPerYear: number;
  wasteReductionLbsPerWeek: number;
  adoptionRatePercent: number;
};

function projectSingle(deadZone: DeadZone, intervention: Intervention, context: SimulationContext): SingleResult {
  const feasibility = feasibilityFactor(deadZone);
  const app = applicability(intervention, deadZone);
  const adoptionFraction = clamp(
    (intervention.effect.baseAdoptionPercent / 100) *
      (0.7 + 0.3 * feasibility) *
      (0.85 + 0.3 * intervention.effect.behaviorChangeWeight) *
      app,
    0,
    0.95
  );

  const reductions: Partial<Record<keyof ScoringBreakdown, number>> = {};
  const baseline = deadZone.scoringBreakdown;
  let scoreDelta = 0;

  for (const [rawKey, delta] of Object.entries(intervention.effect.categoryDeltas)) {
    const key = rawKey as keyof ScoringBreakdown;
    const modeled = (delta ?? 0) * feasibility * contextMultiplier(key, context) * app;
    const applied = clamp(baseline[key] - modeled, 0, maxByKey[key]);
    const realized = baseline[key] - applied;
    reductions[key] = realized;
    scoreDelta += realized;
  }

  return {
    scoreDelta: Math.round(scoreDelta),
    reductions,
    emissionsReductionKgPerYear: Math.round(intervention.effect.emissionsCoefficientKgPerYear * adoptionFraction),
    wasteReductionLbsPerWeek: Math.round(intervention.effect.wasteCoefficientLbsPerWeek * adoptionFraction),
    adoptionRatePercent: Math.round(adoptionFraction * 100)
  };
}

export type InterventionMetrics = {
  intervention: Intervention;
  scoreDelta: number;
  emissionsReductionKgPerYear: number;
  wasteReductionLbsPerWeek: number;
  adoptionRatePercent: number;
};

export function evaluateIntervention(
  deadZone: DeadZone,
  intervention: Intervention,
  context: SimulationContext = {}
): InterventionMetrics {
  const single = projectSingle(deadZone, intervention, context);
  return {
    intervention,
    scoreDelta: single.scoreDelta,
    emissionsReductionKgPerYear: single.emissionsReductionKgPerYear,
    wasteReductionLbsPerWeek: single.wasteReductionLbsPerWeek,
    adoptionRatePercent: single.adoptionRatePercent
  };
}

export function projectScenario(
  deadZone: DeadZone,
  interventionIds: InterventionId[],
  context: SimulationContext = {}
): ScenarioProjection {
  const baselineBreakdown = deadZone.scoringBreakdown;
  const baselineScore = calculateScore(deadZone);
  const baselineSeverity: Severity = getSeverity(baselineScore).severity;

  const interventions = interventionIds
    .map((id) => getIntervention(id))
    .filter((value): value is Intervention => Boolean(value));

  const totalReductions: Record<keyof ScoringBreakdown, number> = {
    accessGap: 0,
    safetyFriction: 0,
    actionImportance: 0,
    equityAccessConcern: 0,
    fixFeasibility: 0
  };

  const contributions: InterventionContribution[] = [];
  let emissionsReductionKgPerYear = 0;
  let wasteReductionLbsPerWeek = 0;
  let adoptionRetention = 1; // for diminishing-returns stacking of adoption

  for (const intervention of interventions) {
    const single = projectSingle(deadZone, intervention, context);

    for (const [rawKey, realized] of Object.entries(single.reductions)) {
      const key = rawKey as keyof ScoringBreakdown;
      totalReductions[key] += realized ?? 0;
    }

    emissionsReductionKgPerYear += single.emissionsReductionKgPerYear;
    wasteReductionLbsPerWeek += single.wasteReductionLbsPerWeek;
    adoptionRetention *= 1 - single.adoptionRatePercent / 100;

    contributions.push({
      interventionId: intervention.id,
      label: intervention.label,
      scoreDelta: single.scoreDelta,
      emissionsReductionKgPerYear: single.emissionsReductionKgPerYear,
      wasteReductionLbsPerWeek: single.wasteReductionLbsPerWeek
    });
  }

  const projectedBreakdown: ScoringBreakdown = {
    accessGap: clamp(Math.round(baselineBreakdown.accessGap - totalReductions.accessGap), 0, maxByKey.accessGap),
    safetyFriction: clamp(Math.round(baselineBreakdown.safetyFriction - totalReductions.safetyFriction), 0, maxByKey.safetyFriction),
    actionImportance: clamp(Math.round(baselineBreakdown.actionImportance - totalReductions.actionImportance), 0, maxByKey.actionImportance),
    equityAccessConcern: clamp(
      Math.round(baselineBreakdown.equityAccessConcern - totalReductions.equityAccessConcern),
      0,
      maxByKey.equityAccessConcern
    ),
    fixFeasibility: clamp(Math.round(baselineBreakdown.fixFeasibility - totalReductions.fixFeasibility), 0, maxByKey.fixFeasibility)
  };

  const projectedScore = Object.values(projectedBreakdown).reduce((total, value) => total + value, 0);
  const adoptionRatePercent = interventions.length === 0 ? 0 : clamp(Math.round((1 - adoptionRetention) * 100), 0, 95);

  // A projection can never be more certain than the observed barrier, and grows less certain
  // as more interventions and assumptions stack.
  const projectedConfidence = clamp(
    Number((deadZone.confidence - 0.03 * interventions.length - (1 - feasibilityFactor(deadZone)) * 0.12).toFixed(2)),
    0.3,
    deadZone.confidence
  );

  return {
    interventionIds,
    baselineScore,
    projectedScore,
    scoreDelta: baselineScore - projectedScore,
    baselineBreakdown,
    projectedBreakdown,
    baselineSeverity,
    projectedSeverity: getSeverity(projectedScore).severity,
    baselineConfidence: deadZone.confidence,
    projectedConfidence,
    confidenceLevel: confidenceLabel(projectedConfidence),
    emissionsReductionKgPerYear,
    wasteReductionLbsPerWeek,
    adoptionRatePercent,
    contributions
  };
}
