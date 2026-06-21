import type { CostTier, DeadZone, DifficultyTier, InterventionRanking } from "@/lib/types";
import { interventions } from "@/lib/interventions";
import { applicability, projectScenario, type SimulationContext } from "@/lib/simulation";

const costScore: Record<CostTier, number> = { Low: 1, Medium: 0.6, High: 0.3 };
const difficultyScore: Record<DifficultyTier, number> = { Easy: 1, Moderate: 0.6, Hard: 0.3 };

const WEIGHTS = {
  environment: 0.4,
  cost: 0.15,
  difficulty: 0.12,
  behavior: 0.18,
  confidence: 0.15
} as const;

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

// Deterministic composite prioritization. Every input is produced by the scoring/simulation
// engine; the LLM never participates in producing these numbers.
export function rankInterventions(deadZone: DeadZone, context: SimulationContext = {}): InterventionRanking[] {
  const applicable = interventions.filter((intervention) => applicability(intervention, deadZone) === 1);
  const candidates = applicable.length > 0 ? applicable : interventions;

  return candidates
    .map((intervention) => {
      const projection = projectScenario(deadZone, [intervention.id], context);
      const environment =
        0.6 * clamp01(projection.scoreDelta / 25) + 0.4 * clamp01(projection.emissionsReductionKgPerYear / 2000);
      const impactScore = Math.round(
        100 *
          (WEIGHTS.environment * environment +
            WEIGHTS.cost * costScore[intervention.effect.costTier] +
            WEIGHTS.difficulty * difficultyScore[intervention.effect.difficulty] +
            WEIGHTS.behavior * intervention.effect.behaviorChangeWeight +
            WEIGHTS.confidence * projection.projectedConfidence)
      );

      return {
        rank: 0,
        interventionId: intervention.id,
        label: intervention.label,
        description: intervention.description,
        projectedScoreDelta: projection.scoreDelta,
        emissionsReductionKgPerYear: projection.emissionsReductionKgPerYear,
        wasteReductionLbsPerWeek: projection.wasteReductionLbsPerWeek,
        adoptionRatePercent: projection.adoptionRatePercent,
        costTier: intervention.effect.costTier,
        costRangeUsd: intervention.effect.costRangeUsd,
        difficulty: intervention.effect.difficulty,
        behaviorChangePercent: Math.round(intervention.effect.behaviorChangeWeight * 100),
        confidence: projection.projectedConfidence,
        impactScore
      };
    })
    .sort((a, b) => b.impactScore - a.impactScore)
    .map((ranking, index) => ({ ...ranking, rank: index + 1 }));
}
