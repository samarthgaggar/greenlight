import type { DeadZone, Severity } from "@/lib/types";

export const scoreCategories = [
  { key: "accessGap", label: "Access gap", max: 25, color: "var(--data)" },
  { key: "safetyFriction", label: "Safety/friction", max: 25, color: "var(--danger)" },
  { key: "actionImportance", label: "Action importance", max: 20, color: "var(--primary)" },
  { key: "equityAccessConcern", label: "Equity/access concern", max: 15, color: "var(--equity)" },
  { key: "fixFeasibility", label: "Fix feasibility", max: 15, color: "var(--warning)" }
] as const;

export function calculateScore(deadZone: DeadZone) {
  return Object.values(deadZone.scoringBreakdown).reduce((total, value) => total + value, 0);
}

export function getSeverity(score: number): { severity: Severity; label: string } {
  if (score >= 70) {
    return { severity: "High", label: "Blocked" };
  }

  if (score >= 40) {
    return { severity: "Medium", label: "Friction" };
  }

  return { severity: "Low", label: "Actionable" };
}

export function confidenceLabel(confidence: number) {
  if (confidence >= 0.8) {
    return "High confidence";
  }

  if (confidence >= 0.65) {
    return "Medium confidence";
  }

  return "Low confidence";
}

export function severityClass(severity: Severity) {
  if (severity === "High") {
    return "severity-high";
  }

  if (severity === "Medium") {
    return "severity-medium";
  }

  return "severity-low";
}
