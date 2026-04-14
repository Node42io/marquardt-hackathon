/**
 * kanoConfig.ts — shared constants and helpers for the Kano classification system.
 *
 * Five classifications in Kano's model:
 *   must_be        — threshold quality; absence = customer dissatisfied
 *   one_dimensional — performance; more = proportionally better
 *   attractive      — excitement; unexpected delight; competitive advantage
 *   indifferent     — neither present nor absent affects satisfaction
 *   reverse         — more of this actually hurts satisfaction
 *
 * Normalised variants accepted from JSON (the model uses underscores):
 *   must_be | one_dimensional | attractive | indifferent | reverse
 * Plus legacy/alias variants seen in some markets:
 *   must-be | performance | must_be | "Must-be" etc.
 */

export type KanoClass =
  | "must_be"
  | "one_dimensional"
  | "attractive"
  | "indifferent"
  | "reverse";

export interface KanoClassMeta {
  key: KanoClass;
  label: string;
  shortLabel: string;
  plain: string; // plain-language definition for the legend
  badgeStyle: React.CSSProperties;
  bandStyle: React.CSSProperties;
  dotStyle: React.CSSProperties;
  order: number;
}

export const KANO_CLASSES: KanoClassMeta[] = [
  {
    key: "must_be",
    label: "Must-Be",
    shortLabel: "Must-Be",
    plain: "Customers expect it; absence kills the deal.",
    badgeStyle: {
      background: "rgba(120, 140, 80, 0.18)",
      border: "1px solid rgba(120, 140, 80, 0.45)",
      color: "#a8c46a",
    },
    bandStyle: {
      background: "rgba(120, 140, 80, 0.06)",
      borderLeft: "3px solid rgba(120, 140, 80, 0.45)",
    },
    dotStyle: { background: "#a8c46a" },
    order: 0,
  },
  {
    key: "one_dimensional",
    label: "Performance",
    shortLabel: "Performance",
    plain: "More is better — satisfaction scales linearly.",
    badgeStyle: {
      background: "rgba(34, 197, 94, 0.1)",
      border: "1px solid rgba(34, 197, 94, 0.35)",
      color: "#6fd59b",
    },
    bandStyle: {
      background: "rgba(34, 197, 94, 0.05)",
      borderLeft: "3px solid rgba(34, 197, 94, 0.4)",
    },
    dotStyle: { background: "#6fd59b" },
    order: 1,
  },
  {
    key: "attractive",
    label: "Attractive",
    shortLabel: "Attractive",
    plain: "Unexpected delight; drives competitive advantage.",
    badgeStyle: {
      background: "rgba(253, 255, 152, 0.1)",
      border: "1px solid rgba(253, 255, 152, 0.3)",
      color: "#fdff98",
    },
    bandStyle: {
      background: "rgba(253, 255, 152, 0.04)",
      borderLeft: "3px solid rgba(253, 255, 152, 0.35)",
    },
    dotStyle: { background: "#fdff98" },
    order: 2,
  },
  {
    key: "indifferent",
    label: "Indifferent",
    shortLabel: "Indifferent",
    plain: "Customers don't care whether it's present or absent.",
    badgeStyle: {
      background: "rgba(120, 120, 140, 0.12)",
      border: "1px solid rgba(120, 120, 140, 0.3)",
      color: "#9898b0",
    },
    bandStyle: {
      background: "rgba(120, 120, 140, 0.04)",
      borderLeft: "3px solid rgba(120, 120, 140, 0.3)",
    },
    dotStyle: { background: "#9898b0" },
    order: 3,
  },
  {
    key: "reverse",
    label: "Reverse",
    shortLabel: "Reverse",
    plain: "More of this actually hurts satisfaction.",
    badgeStyle: {
      background: "rgba(239, 68, 68, 0.1)",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      color: "#ef4444",
    },
    bandStyle: {
      background: "rgba(239, 68, 68, 0.04)",
      borderLeft: "3px solid rgba(239, 68, 68, 0.35)",
    },
    dotStyle: { background: "#ef4444" },
    order: 4,
  },
];

/** Map from raw JSON value → canonical KanoClass key. */
const ALIAS_MAP: Record<string, KanoClass> = {
  must_be: "must_be",
  "must-be": "must_be",
  mustbe: "must_be",
  must: "must_be",
  one_dimensional: "one_dimensional",
  "one-dimensional": "one_dimensional",
  onedimensional: "one_dimensional",
  performance: "one_dimensional",
  linear: "one_dimensional",
  attractive: "attractive",
  excitement: "attractive",
  delighter: "attractive",
  indifferent: "indifferent",
  neutral: "indifferent",
  reverse: "reverse",
  reversal: "reverse",
};

export function normaliseClass(raw: string): KanoClass {
  const key = raw.toLowerCase().replace(/\s+/g, "_");
  return ALIAS_MAP[key] ?? "indifferent";
}

export function getClassMeta(raw: string): KanoClassMeta {
  const key = normaliseClass(raw);
  return KANO_CLASSES.find((c) => c.key === key) ?? KANO_CLASSES[3];
}

/** Score dimensions in display order */
export const SCORE_DIMS: Array<{ key: string; label: string }> = [
  { key: "overall", label: "Overall Fit" },
  { key: "safety", label: "Safety" },
  { key: "reliability", label: "Reliability" },
  { key: "time", label: "Time" },
  { key: "cost", label: "Cost" },
  { key: "pain", label: "Pain Relief" },
  { key: "stress", label: "Stress" },
  { key: "confidence", label: "Confidence" },
  { key: "delight", label: "Delight" },
  { key: "skill", label: "Skill" },
];
