/**
 * ConfidenceTierBadge — HIGH CONF / MEDIUM CONF / LOW CONF badge.
 *
 * Matches Figma design: mono font, colored background + border, dot indicator.
 * Uses .bom-conf-badge CSS classes from bom.css.
 */

import type { BOMConfidence } from "@/types";

export interface ConfidenceTierBadgeProps {
  confidence: BOMConfidence;
}

const LABELS: Record<BOMConfidence, string> = {
  high: "HIGH CONF.",
  medium: "MEDIUM CONF.",
  low: "LOW CONF.",
};

export default function ConfidenceTierBadge({ confidence }: ConfidenceTierBadgeProps) {
  const tier = confidence as BOMConfidence;
  const label = LABELS[tier] ?? "CONF.";
  const cls = `bom-conf-badge bom-conf-badge--${tier}`;

  return (
    <span className={cls}>
      <span className="bom-conf-badge__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
