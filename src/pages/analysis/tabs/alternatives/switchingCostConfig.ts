/**
 * Switching cost badge utility for the AlternativesTab.
 *
 * Per-technology switching cost data (level, label, narrative) now lives in
 * src/data/homeMarketCompetition.json on each incumbent entry
 * (fields: switchingCostLevel, switchingCostLabel, switchingCostNarrative).
 * This file retains only the CSS badge-class lookup — a pure UI rule, not data.
 */

export type SwitchingCostLevel = "very-low" | "low" | "moderate" | "high";

const LEVEL_BADGE: Record<SwitchingCostLevel, string> = {
  "very-low": "badge badge--strong",
  low: "badge badge--strong",
  moderate: "badge badge--moderate",
  high: "badge badge--weak",
};

export function switchingCostBadgeClass(level: SwitchingCostLevel | string): string {
  return LEVEL_BADGE[level as SwitchingCostLevel] ?? "badge badge--neutral";
}
