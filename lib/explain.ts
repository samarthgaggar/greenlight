import type {
  DeadZone,
  FactorRole,
  ProjectionChange,
  ProjectionExplanation,
  RootCauseFactor,
  RootCauseGroup,
  ScenarioProjection,
  ScoreExplanation,
  ScoringBreakdown
} from "@/lib/types";
import { calculateScore, scoreCategories } from "@/lib/scoring";

const factorMeta: Record<keyof ScoringBreakdown, { group: RootCauseGroup; role: FactorRole }> = {
  accessGap: { group: "Infrastructure", role: "barrier" },
  safetyFriction: { group: "Safety", role: "barrier" },
  actionImportance: { group: "Behavior", role: "leverage" },
  equityAccessConcern: { group: "Accessibility", role: "barrier" },
  fixFeasibility: { group: "Feasibility", role: "leverage" }
};

export function explainScore(deadZone: DeadZone): ScoreExplanation {
  const totalScore = calculateScore(deadZone);

  const factors: RootCauseFactor[] = scoreCategories.map((category) => {
    const value = deadZone.scoringBreakdown[category.key];
    const meta = factorMeta[category.key];

    return {
      key: category.key,
      label: category.label,
      group: meta.group,
      role: meta.role,
      value,
      max: category.max,
      percentOfScore: totalScore > 0 ? Math.round((value / totalScore) * 100) : 0,
      intensity: category.max > 0 ? value / category.max : 0,
      color: category.color
    };
  });

  const topDrivers = [...factors].sort((a, b) => b.value - a.value).slice(0, 3);

  return { totalScore, factors, topDrivers };
}

export function explainProjection(projection: ScenarioProjection): ProjectionExplanation {
  const changes: ProjectionChange[] = scoreCategories
    .map((category) => {
      const before = projection.baselineBreakdown[category.key];
      const after = projection.projectedBreakdown[category.key];

      return {
        key: category.key,
        label: category.label,
        group: factorMeta[category.key].group,
        before,
        after,
        delta: before - after,
        color: category.color
      };
    })
    .filter((change) => change.delta !== 0)
    .sort((a, b) => b.delta - a.delta);

  return { scoreDelta: projection.scoreDelta, changes };
}
