/**
 * NeedsList — Outcome-Driven Innovation needs matrix table.
 *
 * Rules implemented:
 *  - Item 2: importanceRationale + satisfactionRationale shown as helper text.
 *  - Item 3: Overserved badge when satisfaction > importance.
 *  - Item 5: Tooltip on every opportunity score showing the formula.
 *  - Item 8: Click a row to expand inline NeedDetail panel.
 *  - Item 9: Column labels with tooltips explaining each metric.
 */

import { useState, useEffect, useRef } from "react";
import type { ODINeed } from "@/types";
import Tooltip from "@/components/Tooltip";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import NeedDetail from "./NeedDetail";

interface NeedsListProps {
  needs: ODINeed[];
  /** When set (from ODIMatrix click), auto-expand + scroll to that need. */
  highlightNeed?: ODINeed | null;
}

/** Opportunity score → heatmap colour */
function oppColor(score: number): string {
  if (score >= 15) return "#e74c3c";
  if (score >= 12) return "#e67e22";
  if (score >= 10) return "#f1c40f";
  return "#6b8e23";
}

/** Opportunity score → label */
function oppZone(score: number): string {
  if (score >= 15) return "Critical";
  if (score >= 12) return "High";
  if (score >= 10) return "Moderate";
  return "Low";
}

function ColumnHeaderTooltip({
  label,
  tip,
}: {
  label: string;
  tip: string;
}) {
  return (
    <Tooltip content={tip} placement="top">
      <span
        style={{
          cursor: "help",
          borderBottom: "1px dashed rgba(255,255,255,0.2)",
          paddingBottom: 1,
        }}
      >
        {label}
      </span>
    </Tooltip>
  );
}

export default function NeedsList({ needs, highlightNeed }: NeedsListProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // When ODIMatrix selection changes, auto-expand + scroll to that row
  useEffect(() => {
    if (!highlightNeed) return;
    const idx = needs.findIndex(
      (n) => n.statement === highlightNeed.statement
    );
    if (idx === -1) return;
    setExpandedIdx(idx);
    // Scroll after a short delay so the row has rendered
    const timer = setTimeout(() => {
      rowRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    return () => clearTimeout(timer);
  }, [highlightNeed, needs]);

  if (!needs || needs.length === 0) {
    return (
      <div
        style={{
          padding: "32px 28px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 10,
          color: "var(--text-gray-dark)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontStyle: "italic",
        }}
      >
        Outcome needs data pending for this market.
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Column header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 60px 60px 80px 80px",
          gap: 8,
          padding: "10px 20px",
          background: "var(--surface-dark)",
          borderBottom: "1px solid var(--border-subtle)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text-gray-dark)",
          alignItems: "center",
        }}
      >
        <span>Outcome Need</span>
        <span style={{ textAlign: "center" }}>
          <ColumnHeaderTooltip
            label="Imp."
            tip="Importance — how critical this outcome is to the customer (1 = nice to have, 10 = must-have)."
          />
        </span>
        <span style={{ textAlign: "center" }}>
          <ColumnHeaderTooltip
            label="Sat."
            tip="Satisfaction — how well current solutions deliver this outcome today (1 = very poorly, 10 = excellent)."
          />
        </span>
        <span style={{ textAlign: "center" }}>
          <ColumnHeaderTooltip
            label="Opp."
            tip="Opportunity Score (Ulwick ODI formula) — higher means more market whitespace. = Importance + (Importance − Satisfaction)."
          />
        </span>
        <span style={{ textAlign: "center" }}>Status</span>
      </div>

      {/* Rows */}
      {needs.map((need, idx) => {
        const isExpanded = expandedIdx === idx;
        const isOverserved = need.satisfaction > need.importance;
        const isUnderserved = need.isUnderserved ?? (need.importance >= 7 && need.satisfaction < 5);
        const rationalesPending = !!need.needsRationale;

        const oScore = need.opportunity;
        const oppTooltipContent = (
          <span>
            <strong style={{ color: "var(--accent-yellow)" }}>
              Opportunity = Importance + (Importance − Satisfaction)
            </strong>
            <br />
            = {need.importance} + ({need.importance} − {need.satisfaction}) = {oScore}
          </span>
        );

        return (
          <div
            key={`${need.statement}-${idx}`}
            ref={(el) => { rowRefs.current[idx] = el; }}
            style={{
              outline: highlightNeed?.statement === need.statement
                ? "2px solid rgba(253,255,152,0.4)"
                : undefined,
              borderRadius: highlightNeed?.statement === need.statement ? 4 : undefined,
            }}
          >
            {/* Main row */}
            <div
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpandedIdx(isExpanded ? null : idx);
                }
              }}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 60px 60px 80px 80px",
                gap: 8,
                padding: "14px 20px",
                borderBottom: isExpanded
                  ? "none"
                  : "1px solid var(--border-subtle)",
                cursor: "pointer",
                background: isExpanded
                  ? "var(--surface-dark-hover, #2f3440)"
                  : "transparent",
                transition: "background 0.15s ease",
                alignItems: "start",
              }}
              onMouseEnter={(e) => {
                if (!isExpanded)
                  (e.currentTarget as HTMLDivElement).style.background =
                    "var(--surface-dark)";
              }}
              onMouseLeave={(e) => {
                if (!isExpanded)
                  (e.currentTarget as HTMLDivElement).style.background =
                    "transparent";
              }}
            >
              {/* Need statement + rationale helper text */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-white)",
                      lineHeight: 1.5,
                    }}
                  >
                    {need.statement}
                  </span>
                  {need.productRelated && (
                    <span
                      className="badge badge--accent"
                      style={{ fontSize: 9, flexShrink: 0, marginTop: 2 }}
                    >
                      Product
                    </span>
                  )}
                </div>

                {/* Stakeholder badge */}
                {need.primaryStakeholder && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 9,
                      fontFamily: "var(--font-mono)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--accent-yellow)",
                      background: "rgba(253,255,152,0.08)",
                      border: "1px solid rgba(253,255,152,0.18)",
                      borderRadius: 4,
                      padding: "2px 6px",
                      alignSelf: "flex-start",
                    }}
                  >
                    <span style={{ opacity: 0.7 }}>▶</span>
                    {need.primaryStakeholder}
                  </span>
                )}

                {/* Satisfaction rationale */}
                {!rationalesPending && need.satisfactionRationale && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: "var(--text-gray-dark)",
                      lineHeight: 1.4,
                      fontStyle: "normal",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginRight: 4,
                        color: "var(--text-gray-dark)",
                      }}
                    >
                      Sat. basis:
                    </span>
                    {need.satisfactionRationale}
                  </p>
                )}

                {/* Importance rationale */}
                {!rationalesPending && need.importanceRationale && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: "var(--text-gray-dark)",
                      lineHeight: 1.4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginRight: 4,
                        color: "var(--text-gray-dark)",
                      }}
                    >
                      Imp. basis:
                    </span>
                    {need.importanceRationale}
                  </p>
                )}

                {/* Rationale pending hint */}
                {rationalesPending && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      fontStyle: "italic",
                      color: "var(--text-gray-dark)",
                    }}
                  >
                    rationale pending
                  </p>
                )}

                {/* Click hint */}
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: isExpanded ? "var(--accent-yellow)" : "var(--text-gray-dark)",
                    marginTop: 2,
                  }}
                >
                  {isExpanded ? "▲ Collapse" : "▼ Detail"}
                </span>
              </div>

              {/* Importance */}
              <div
                style={{ textAlign: "center", paddingTop: 2 }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--text-white)",
                  }}
                >
                  {need.importance}
                </span>
              </div>

              {/* Satisfaction */}
              <div style={{ textAlign: "center", paddingTop: 2 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--text-white)",
                  }}
                >
                  {need.satisfaction}
                </span>
              </div>

              {/* Opportunity score with tooltip */}
              <div style={{ textAlign: "center", paddingTop: 2 }}>
                <Tooltip content={oppTooltipContent} placement="top">
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      fontSize: 14,
                      color: oppColor(oScore),
                      borderBottom: "1px dashed rgba(255,255,255,0.2)",
                      paddingBottom: 1,
                      cursor: "help",
                    }}
                  >
                    {oScore}
                  </span>
                </Tooltip>
                <div
                  style={{
                    fontSize: 9,
                    fontFamily: "var(--font-mono)",
                    color: oppColor(oScore),
                    marginTop: 2,
                    opacity: 0.8,
                  }}
                >
                  {oppZone(oScore)}
                </div>
              </div>

              {/* Status badges */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  alignItems: "center",
                  paddingTop: 2,
                }}
              >
                {isOverserved && (
                  <span
                    className="badge badge--neutral"
                    style={{ fontSize: 9, background: "rgba(108,117,125,0.18)", color: "#a0adb8" }}
                  >
                    Overserved
                  </span>
                )}
                {isUnderserved && !isOverserved && (
                  <span
                    className="badge badge--weak"
                    style={{ fontSize: 9 }}
                  >
                    Underserved
                  </span>
                )}
                {!isUnderserved && !isOverserved && (
                  <span
                    className="badge badge--neutral"
                    style={{ fontSize: 9 }}
                  >
                    Served
                  </span>
                )}
                {/* Confidence badge if available from JTBD need cross-ref */}
                {typeof (need as ODINeed & { confidence?: number }).confidence === "number" &&
                  (need as ODINeed & { confidence?: number }).confidence! >= 0.8 && (
                    <ConfidenceBadge level="high" />
                  )}
                {typeof (need as ODINeed & { confidence?: number }).confidence === "number" &&
                  (need as ODINeed & { confidence?: number }).confidence! >= 0.5 &&
                  (need as ODINeed & { confidence?: number }).confidence! < 0.8 && (
                    <ConfidenceBadge level="medium" />
                  )}
                {typeof (need as ODINeed & { confidence?: number }).confidence === "number" &&
                  (need as ODINeed & { confidence?: number }).confidence! < 0.5 && (
                    <ConfidenceBadge level="low" />
                  )}
              </div>
            </div>

            {/* Inline expanded detail panel */}
            {isExpanded && (
              <NeedDetail need={need} onClose={() => setExpandedIdx(null)} />
            )}
          </div>
        );
      })}
    </div>
  );
}
