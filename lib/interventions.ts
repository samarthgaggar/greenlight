import { Bike, Footprints, Leaf, MapPin, Recycle, ShieldCheck, TreePine } from "lucide-react";
import type { Intervention, InterventionId } from "@/lib/types";

// All effect numbers below are synthetic, deterministic coefficients used to power
// local what-if simulation for this MVP. They are not measured field values.
export const interventions: Intervention[] = [
  {
    id: "protected-bike-arrival",
    label: "Protected bike arrival box",
    description: "Separate the bike approach from turning vehicles at the busiest arrival edge.",
    icon: ShieldCheck,
    applicableActions: ["bike", "school-commute"],
    applicableCategories: ["bike access", "air quality"],
    effect: {
      categoryDeltas: { safetyFriction: 14, accessGap: 6 },
      costTier: "Medium",
      costRangeUsd: [1500, 8000],
      difficulty: "Moderate",
      behaviorChangeWeight: 0.62,
      emissionsCoefficientKgPerYear: 1800,
      wasteCoefficientLbsPerWeek: 0,
      baseAdoptionPercent: 46
    }
  },
  {
    id: "bike-racks",
    label: "Secure bike racks",
    description: "Add visible, covered bike parking near the main entrance.",
    icon: Bike,
    applicableActions: ["bike", "school-commute"],
    applicableCategories: ["bike access"],
    effect: {
      categoryDeltas: { accessGap: 9, safetyFriction: 3 },
      costTier: "Low",
      costRangeUsd: [600, 2500],
      difficulty: "Easy",
      behaviorChangeWeight: 0.5,
      emissionsCoefficientKgPerYear: 1200,
      wasteCoefficientLbsPerWeek: 0,
      baseAdoptionPercent: 52
    }
  },
  {
    id: "crosswalk",
    label: "Crosswalk and daylighting",
    description: "Mark a protected crossing and clear sightlines on the walking route.",
    icon: Footprints,
    applicableActions: ["walk", "transit", "school-commute"],
    applicableCategories: ["walking access", "transit access"],
    effect: {
      categoryDeltas: { safetyFriction: 11, accessGap: 10, equityAccessConcern: 3 },
      costTier: "Medium",
      costRangeUsd: [3000, 14000],
      difficulty: "Moderate",
      behaviorChangeWeight: 0.58,
      emissionsCoefficientKgPerYear: 1500,
      wasteCoefficientLbsPerWeek: 0,
      baseAdoptionPercent: 44
    }
  },
  {
    id: "compost-bins",
    label: "Relocated compost bins",
    description: "Place compost directly in the main disposal line with clear signage.",
    icon: Leaf,
    applicableActions: ["compost", "waste"],
    applicableCategories: ["waste diversion", "reuse access"],
    effect: {
      categoryDeltas: { accessGap: 10, fixFeasibility: 6 },
      costTier: "Low",
      costRangeUsd: [200, 1200],
      difficulty: "Easy",
      behaviorChangeWeight: 0.7,
      emissionsCoefficientKgPerYear: 900,
      wasteCoefficientLbsPerWeek: 140,
      baseAdoptionPercent: 60
    }
  },
  {
    id: "recycling-access",
    label: "Improved recycling access",
    description: "Add color-coded recycling next to every waste point and refill station.",
    icon: Recycle,
    applicableActions: ["waste", "reuse"],
    applicableCategories: ["waste diversion", "reuse access"],
    effect: {
      categoryDeltas: { accessGap: 8, equityAccessConcern: 2 },
      costTier: "Low",
      costRangeUsd: [300, 1800],
      difficulty: "Easy",
      behaviorChangeWeight: 0.55,
      emissionsCoefficientKgPerYear: 700,
      wasteCoefficientLbsPerWeek: 95,
      baseAdoptionPercent: 57
    }
  },
  {
    id: "bus-stop-relocation",
    label: "Bus stop relocation",
    description: "Move the nearest frequent stop inside a comfortable walk shed of the entrance.",
    icon: MapPin,
    applicableActions: ["transit", "school-commute"],
    applicableCategories: ["transit access"],
    effect: {
      categoryDeltas: { accessGap: 12, equityAccessConcern: 4, safetyFriction: 2 },
      costTier: "High",
      costRangeUsd: [8000, 30000],
      difficulty: "Hard",
      behaviorChangeWeight: 0.6,
      emissionsCoefficientKgPerYear: 2100,
      wasteCoefficientLbsPerWeek: 0,
      baseAdoptionPercent: 40
    }
  },
  {
    id: "shaded-walkway",
    label: "Shaded walkway",
    description: "Add shade, seating, and wayfinding along the approach corridor.",
    icon: TreePine,
    applicableActions: ["walk", "transit", "school-commute"],
    applicableCategories: ["walking access", "transit access", "air quality"],
    effect: {
      categoryDeltas: { accessGap: 5, equityAccessConcern: 4, safetyFriction: 3 },
      costTier: "Medium",
      costRangeUsd: [2500, 12000],
      difficulty: "Moderate",
      behaviorChangeWeight: 0.48,
      emissionsCoefficientKgPerYear: 800,
      wasteCoefficientLbsPerWeek: 0,
      baseAdoptionPercent: 42
    }
  }
];

const interventionById = new Map(interventions.map((intervention) => [intervention.id, intervention]));

export function getIntervention(id: InterventionId): Intervention | undefined {
  return interventionById.get(id);
}

export function getInterventions(ids: InterventionId[]): Intervention[] {
  return ids.map((id) => interventionById.get(id)).filter((value): value is Intervention => Boolean(value));
}
