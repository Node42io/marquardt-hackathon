/**
 * Shared verdict configuration for the Compatibility tab.
 * Maps CompatVerdict strings to display labels, badge class, and short description.
 */

export type VerdictKey = "none" | "mitigable" | "knockout" | string;

export interface VerdictConfig {
  label: string;
  badgeClass: string;
  description: string;
}

export const VERDICT_CONFIG: Record<string, VerdictConfig> = {
  none: {
    label: "No Impact",
    badgeClass: "badge badge--strong",
    description: "This constraint does not affect normal operation in this market.",
  },
  mitigable: {
    label: "Mitigable",
    badgeClass: "badge badge--moderate",
    description:
      "A concern exists but can be resolved through installation practice, product selection, or process design.",
  },
  knockout: {
    label: "Knockout",
    badgeClass: "badge badge--weak",
    description:
      "This constraint eliminates the market entirely — no engineering solution overcomes it.",
  },
};

export function getVerdictConfig(verdict: string): VerdictConfig {
  return (
    VERDICT_CONFIG[verdict] ?? {
      label: verdict,
      badgeClass: "badge badge--neutral",
      description: "",
    }
  );
}

/** Verdict display order: knockouts first, then mitigable, then none */
export const VERDICT_ORDER: string[] = ["knockout", "mitigable", "none"];

export function sortByVerdict<T extends { verdict: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => VERDICT_ORDER.indexOf(a.verdict) - VERDICT_ORDER.indexOf(b.verdict)
  );
}
