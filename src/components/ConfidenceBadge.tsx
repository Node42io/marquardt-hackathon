/**
 * ConfidenceBadge — colored badge with hover explanation of the confidence level.
 *
 * Styled with .confidence-badge / .confidence-badge--{level} from report.css.
 *
 * Usage:
 *   <ConfidenceBadge level="high" />
 *   <ConfidenceBadge level="medium" />
 *   <ConfidenceBadge level="low" />
 */

import Tooltip from "@/components/Tooltip";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
}

const DEFINITIONS: Record<ConfidenceLevel, string> = {
  high: "High — claim is supported by an authoritative, verifiable source (vendor catalog, analyst report, regulator).",
  medium: "Medium — claim is based on secondary sources or reasonable inference from primary data; may warrant verification.",
  low: "Low — claim is estimated, inferred, or sourced from low-confidence data; treat as directional only.",
};

const LABELS: Record<ConfidenceLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export default function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  return (
    <Tooltip content={DEFINITIONS[level]} placement="top">
      <span
        className={`confidence-badge confidence-badge--${level}`}
        aria-label={`Confidence: ${LABELS[level]}. ${DEFINITIONS[level]}`}
      >
        <span className="confidence-badge__dot" aria-hidden="true" />
        {LABELS[level]}
      </span>
    </Tooltip>
  );
}
