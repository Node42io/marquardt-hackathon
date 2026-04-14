/**
 * TechCard — one competing technology / alternative solution card.
 *
 * Per TODO items 29, 41:
 *  - Shows: technology name, vendor examples, strengths, weaknesses,
 *    estimated market share (with source), per-technology switching cost
 *  - Uses plain language labels ("Competing Technologies", not "Incumbents")
 *  - Per-technology switching-cost assessment (not a single global one)
 */

import SourceFootnote from "@/components/SourceFootnote";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import type { ConfidenceLevel } from "@/components/ConfidenceBadge";
import { switchingCostBadgeClass } from "./switchingCostConfig";

export interface TechCardData {
  technologyName: string;
  mechanism?: string;
  marketShareEstimate?: string;
  keyVendors?: string[];
  strengths?: string[];
  weaknesses?: string[];
  confidence?: number;
  /** Human-readable label such as "Low–Moderate" or "High". */
  switchingCost?: string;
  /** Severity level used to pick badge CSS class. */
  switchingCostLevel?: string;
  switchingCostNarrative?: string;
  sourceIds?: string[];
}

interface TechCardProps {
  tech: TechCardData;
  index: number;
  /** Fallback source IDs if tech.sourceIds is empty */
  fallbackSourceIds: string[];
}

const SHARE_CLASS: Record<string, string> = {
  dominant: "badge badge--weak",       // dominant incumbents = harder to displace
  significant: "badge badge--moderate",
  niche: "badge badge--strong",        // niche = easier to displace
  emerging: "badge badge--neutral",
  subject: "badge badge--accent",
};

function ListBlock({
  items,
  color,
}: {
  items: string[];
  color?: string;
}) {
  if (!items || items.length === 0) return <span style={{ color: "var(--text-gray)" }}>—</span>;
  return (
    <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{ fontSize: 13, color: color ?? "var(--text-white)", lineHeight: 1.55, marginBottom: 2 }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function TechCard({
  tech,
  index,
  fallbackSourceIds,
}: TechCardProps) {
  const srcIds =
    tech.sourceIds && tech.sourceIds.length > 0
      ? tech.sourceIds
      : fallbackSourceIds;

  // Switching cost fields come directly from JSON (homeMarketCompetition.json incumbents
  // or market-specific alternatives.json). No in-component lookup table needed.
  const switchingNarrative =
    tech.switchingCostNarrative ??
    "Switching cost assessment — data pending for this market.";
  const switchingLabel = tech.switchingCost ?? "—";
  const switchingLevel = tech.switchingCostLevel ?? "moderate";
  const switchingBadgeClass = switchingCostBadgeClass(switchingLevel);

  // Confidence badge from numeric 0–1 confidence
  let confLevel: ConfidenceLevel | null = null;
  if (typeof tech.confidence === "number") {
    if (tech.confidence >= 0.75) confLevel = "high";
    else if (tech.confidence >= 0.5) confLevel = "medium";
    else confLevel = "low";
  }

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 10,
        padding: "20px 24px",
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-gray-dark)",
            marginTop: 5,
            flexShrink: 0,
            width: 22,
          }}
        >
          T{index}
        </span>

        {/* Item 41: Plain-language heading — "Competing Technology" not "Incumbent" */}
        <h3
          style={{
            flex: 1,
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "var(--text-white)",
            letterSpacing: "-0.01em",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {tech.technologyName}
          <SourceFootnote sourceIds={srcIds} />
        </h3>

        {confLevel && (
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            <ConfidenceBadge level={confLevel} />
          </div>
        )}
      </div>

      {/* Details definition list */}
      <div
        className="definition-list"
        style={{ marginLeft: 32, marginTop: 0, marginBottom: 0 }}
      >
        {/* Mechanism */}
        {tech.mechanism && (
          <div className="definition-list__row">
            <div className="definition-list__key">Mechanism</div>
            <div
              className="definition-list__value"
              style={{ fontSize: 13, color: "var(--text-gray-light)" }}
            >
              {tech.mechanism}
            </div>
          </div>
        )}

        {/* Market share */}
        <div className="definition-list__row">
          <div className="definition-list__key">Market share</div>
          <div className="definition-list__value">
            {tech.marketShareEstimate ? (
              <>
                <span
                  className={SHARE_CLASS[tech.marketShareEstimate] ?? "badge badge--neutral"}
                >
                  {tech.marketShareEstimate}
                </span>{" "}
                <SourceFootnote sourceIds={srcIds} />
              </>
            ) : (
              <span style={{ color: "var(--text-gray)", fontStyle: "italic", fontSize: 12 }}>
                data pending
              </span>
            )}
          </div>
        </div>

        {/* Vendor examples */}
        <div className="definition-list__row">
          <div className="definition-list__key">Vendor examples</div>
          <div className="definition-list__value">
            {tech.keyVendors && tech.keyVendors.length > 0
              ? tech.keyVendors.join(", ")
              : <span style={{ color: "var(--text-gray)" }}>—</span>}
          </div>
        </div>

        {/* Strengths */}
        <div className="definition-list__row">
          <div className="definition-list__key">Strengths</div>
          <div className="definition-list__value">
            <ListBlock items={tech.strengths ?? []} color="var(--status-high)" />
          </div>
        </div>

        {/* Weaknesses */}
        <div className="definition-list__row">
          <div className="definition-list__key">Weaknesses</div>
          <div className="definition-list__value">
            <ListBlock items={tech.weaknesses ?? []} color="var(--status-low)" />
          </div>
        </div>

        {/* Item 29: Per-technology switching cost — not a single global assessment */}
        <div className="definition-list__row">
          <div className="definition-list__key">Switching cost</div>
          <div className="definition-list__value" style={{ flexDirection: "column", gap: 6 }}>
            <div>
              <span className={switchingBadgeClass}>{switchingLabel}</span>
            </div>
            <p
              style={{
                margin: 0,
                marginTop: 6,
                fontSize: 12.5,
                color: "var(--text-gray-light)",
                lineHeight: 1.55,
              }}
            >
              {switchingNarrative}
              <SourceFootnote sourceIds={srcIds} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
