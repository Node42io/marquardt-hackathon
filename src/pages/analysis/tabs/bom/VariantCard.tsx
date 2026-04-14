/**
 * VariantCard — individual variant chip with name + percentage + progress bar.
 *
 * Matches Figma design:
 *   - Chip name (12px, semibold)
 *   - Small percentage + thin horizontal progress bar (3px high)
 *   - Left accent border colored by confidence tier
 *   - Hover: tooltip with functional role; click: popover with full details
 *
 * Uses .bom-variant-card CSS classes from bom.css.
 */

import type { BOMAlternative, BOMConfidence } from "@/types";
import Tooltip from "@/components/Tooltip";
import Popover from "@/components/Popover";

export interface VariantCardProps {
  alternative: BOMAlternative;
  /** Confidence tier for color coding (derived from parent subsystem or module) */
  confidence: BOMConfidence;
  /** Functional role text shown in tooltip */
  functionalRole?: string;
  /** Extra detail shown in click popover */
  detail?: string;
}

function trendLabel(trend: string): string {
  if (trend === "growing") return "↑ Growing";
  if (trend === "declining") return "↓ Declining";
  return "→ Stable";
}

/** Popover detail panel */
function VariantDetailPanel({
  alternative,
  confidence,
  functionalRole,
  detail,
}: VariantCardProps) {
  return (
    <div className="r-popover__body bom-detail-popover">
      <div className="r-popover__header" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {alternative.isMarquardt && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--accent-yellow)",
              background: "rgba(253,255,152,0.1)",
              border: "1px solid rgba(253,255,152,0.3)",
              borderRadius: 3,
              padding: "2px 5px",
            }}
          >
            Marquardt
          </span>
        )}
        {alternative.name}
      </div>
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 0 }}>
        {functionalRole && (
          <div className="bom-detail-popover__attr">
            <span className="bom-detail-popover__attr-key">Functional Role</span>
            <span className="bom-detail-popover__attr-val">{functionalRole}</span>
          </div>
        )}
        <div className="bom-detail-popover__attr">
          <span className="bom-detail-popover__attr-key">Market Share</span>
          <span className="bom-detail-popover__attr-val">{alternative.sharePct}%</span>
        </div>
        <div className="bom-detail-popover__attr">
          <span className="bom-detail-popover__attr-key">Trend</span>
          <span className="bom-detail-popover__attr-val">{trendLabel(alternative.trend)}</span>
        </div>
        <div className="bom-detail-popover__attr">
          <span className="bom-detail-popover__attr-key">Confidence</span>
          <span className="bom-detail-popover__attr-val" style={{ textTransform: "capitalize" }}>{confidence}</span>
        </div>
        {detail && (
          <div className="bom-detail-popover__attr">
            <span className="bom-detail-popover__attr-key">Notes</span>
            <span className="bom-detail-popover__attr-val">{detail}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VariantCard({
  alternative,
  confidence,
  functionalRole,
  detail,
}: VariantCardProps) {
  const pct = Math.min(100, Math.max(0, alternative.sharePct));
  const cardCls = [
    "bom-variant-card",
    `bom-variant-card--${confidence}`,
    alternative.isMarquardt ? "bom-variant-card--marquardt" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const tooltipContent = functionalRole ?? alternative.name;

  return (
    <Popover
      placement="bottom-start"
      trigger={
        <Tooltip content={tooltipContent} placement="top">
          <div
            className={cardCls}
            role="button"
            tabIndex={0}
            style={
              alternative.isMarquardt
                ? {
                    borderLeft: "2px solid var(--accent-yellow)",
                    background: "rgba(253,255,152,0.05)",
                  }
                : undefined
            }
          >
            <span className="bom-variant-card__name">{alternative.name}</span>
            <div className="bom-variant-card__bar-row">
              <span className="bom-variant-card__pct">{pct}%</span>
              <div className="bom-variant-card__bar-track">
                <div
                  className={`bom-variant-card__bar-fill bom-variant-card__bar-fill--${confidence}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </Tooltip>
      }
      content={
        <VariantDetailPanel
          alternative={alternative}
          confidence={confidence}
          functionalRole={functionalRole}
          detail={detail}
        />
      }
    />
  );
}
