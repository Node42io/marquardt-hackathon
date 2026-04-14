/**
 * JobMap — faithful React port of the HTML job-map visualization.
 *
 * Source: JTBD-finfish_farming_and_fish_.html (lines 839–1414)
 * CSS:    ./jobmap.css (copied verbatim from the HTML's <style> block)
 *
 * DOM structure mirrors the HTML exactly:
 *   .job-map-container
 *     .job-map-header  (market name, stats)
 *     .aggregate-bar-section
 *     .timeline-scroll
 *       .timeline-connector  (dots + lines)
 *       .timeline-cards      (step cards with stacked bars)
 *       .detail-panel        (expanded needs table — shown below cards)
 *     .job-map-legend
 *
 * Data strategy:
 *   - `jobSteps` from jtbd.json drives the card row (verb, description, relevant)
 *   - `odiNeeds` from odi.json are grouped by matching need.jobStep (uppercase)
 *     to step.jobStep. When jobStep is empty the need is not counted per-step
 *     but IS included in the aggregate bar totals.
 *   - Needs distribution classification (Ulwick thresholds):
 *       overserved      : satisfaction > importance
 *       underserved     : importance - satisfaction >= 3 (high urgency gap)
 *       table_stakes    : importance >= 8 && satisfaction >= 7 (high + satisfied)
 *       appropriately   : everything else
 *
 * TODO items:
 *   #1  Verb prominent + "This step is about " + description
 *   #14 Plain-language legend labels (non-expert friendly)
 */

import { useState, useEffect, useCallback } from "react";
import "./jobmap.css";
import type { JobStep, ODINeed } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NeedsDistribution {
  underserved: number;
  appropriately_served: number;
  overserved: number;
  table_stakes: number;
}

interface StepNeeds {
  total: number;
  distribution: NeedsDistribution;
  topNeeds: ODINeed[];
}

interface JobMapProps {
  steps: JobStep[];
  odiNeeds?: ODINeed[];
  marketName: string;
  naicsCode?: string;
  productName?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function classifyNeed(
  n: ODINeed
): keyof NeedsDistribution {
  if (n.satisfaction > n.importance) return "overserved";
  if (n.importance - n.satisfaction >= 3) return "underserved";
  if (n.importance >= 8 && n.satisfaction >= 7) return "table_stakes";
  return "appropriately_served";
}

function pct(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

function oppClass(score: number): string {
  if (score >= 15) return "opp-critical";
  if (score >= 12) return "opp-high";
  if (score >= 9) return "opp-medium";
  return "opp-low";
}

/** Group ODI needs by step verb (uppercase match) */
function groupNeedsByStep(
  steps: JobStep[],
  odiNeeds: ODINeed[]
): Map<string, StepNeeds> {
  const map = new Map<string, StepNeeds>();

  for (const step of steps) {
    const stepKey = step.jobStep?.toUpperCase() ?? step.verb?.toUpperCase() ?? "";
    const matched = odiNeeds.filter(
      (n) => n.jobStep?.toUpperCase() === stepKey
    );
    const dist: NeedsDistribution = {
      underserved: 0,
      appropriately_served: 0,
      overserved: 0,
      table_stakes: 0,
    };
    for (const n of matched) {
      dist[classifyNeed(n)]++;
    }
    map.set(stepKey, {
      total: matched.length,
      distribution: dist,
      topNeeds: [...matched].sort((a, b) => b.opportunity - a.opportunity),
    });
  }
  return map;
}

/** Compute aggregate distribution over ALL needs */
function computeAggregate(odiNeeds: ODINeed[]): {
  totals: NeedsDistribution;
  sum: number;
  totalNeeds: number;
  avgOpportunity: number;
} {
  const totals: NeedsDistribution = {
    underserved: 0,
    appropriately_served: 0,
    overserved: 0,
    table_stakes: 0,
  };
  let oppSum = 0;
  for (const n of odiNeeds) {
    totals[classifyNeed(n)]++;
    oppSum += n.opportunity ?? 0;
  }
  const sum = totals.underserved + totals.appropriately_served + totals.overserved + totals.table_stakes;
  return {
    totals,
    sum,
    totalNeeds: odiNeeds.length,
    avgOpportunity: odiNeeds.length > 0 ? Math.round((oppSum / odiNeeds.length) * 10) / 10 : 0,
  };
}

// ─── Chevron SVG ──────────────────────────────────────────────────────────────

const ChevronIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function JobMap({
  steps,
  odiNeeds = [],
  marketName,
  naicsCode,
  productName,
}: JobMapProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && expandedStep !== null) {
        setExpandedStep(null);
      }
    },
    [expandedStep]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ── Empty state ────────────────────────────────────────────────────
  if (!steps || steps.length === 0) {
    return (
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 10,
          padding: "32px 28px",
          color: "var(--text-gray-dark)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontStyle: "italic",
        }}
      >
        Job map data pending — steps not yet extracted for this market.
      </div>
    );
  }

  // ── Data computation ───────────────────────────────────────────────
  const stepNeedsMap = groupNeedsByStep(steps, odiNeeds);
  const agg = computeAggregate(odiNeeds);

  // ── Connector segment width matches card-width + card-gap - node-width ─
  const CARD_W = 252;
  const CARD_GAP = 12;
  const NODE_W = 8;
  const segWidth = CARD_W + CARD_GAP - NODE_W;

  return (
    <div className="job-map-container">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="job-map-header">
        <div className="header-top">
          <div className="header-title-group">
            <div className="header-label">Universal Job Map</div>
            <div className="header-market-name">{marketName}</div>
            {(naicsCode || productName) && (
              <div className="header-meta" style={{ marginTop: 4 }}>
                {naicsCode && (
                  <div className="meta-tag">
                    NAICS <span className="meta-value">{naicsCode}</span>
                  </div>
                )}
                {productName && (
                  <div className="meta-tag">
                    PRODUCT <span className="meta-value">{productName}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="header-stats">
            <div className="stat-block">
              <div className="stat-value">{steps.length}</div>
              <div className="stat-label">Steps</div>
            </div>
            <div className="stat-block">
              <div className="stat-value">{agg.totalNeeds}</div>
              <div className="stat-label">Total Needs</div>
            </div>
            <div className="stat-block">
              <div className="stat-value">{agg.totals.underserved}</div>
              <div className="stat-label">Underserved</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Aggregate bar ─────────────────────────────────────────────── */}
      <div className="aggregate-bar-section">
        <div className="aggregate-bar-container">
          {agg.sum > 0 && (
            <>
              <div
                className="aggregate-bar-segment"
                style={{
                  width: `${pct(agg.totals.underserved, agg.sum)}%`,
                  background: "var(--color-underserved)",
                }}
              />
              <div
                className="aggregate-bar-segment"
                style={{
                  width: `${pct(agg.totals.appropriately_served, agg.sum)}%`,
                  background: "var(--color-appropriately)",
                }}
              />
              <div
                className="aggregate-bar-segment"
                style={{
                  width: `${pct(agg.totals.overserved, agg.sum)}%`,
                  background: "var(--color-overserved)",
                }}
              />
              <div
                className="aggregate-bar-segment"
                style={{
                  width: `${pct(agg.totals.table_stakes, agg.sum)}%`,
                  background: "var(--color-tablestakes)",
                }}
              />
            </>
          )}
        </div>
        <div className="aggregate-labels">
          <div className="aggregate-label-item">
            <div
              className="aggregate-dot"
              style={{ background: "var(--color-underserved)" }}
            />
            {agg.totals.underserved} Underserved
          </div>
          <div className="aggregate-label-item">
            <div
              className="aggregate-dot"
              style={{ background: "var(--color-appropriately)" }}
            />
            {agg.totals.appropriately_served} Served
          </div>
          <div className="aggregate-label-item">
            <div
              className="aggregate-dot"
              style={{ background: "var(--color-overserved)" }}
            />
            {agg.totals.overserved} Overserved
          </div>
          <div className="aggregate-label-item">
            <div
              className="aggregate-dot"
              style={{ background: "var(--color-tablestakes)" }}
            />
            {agg.totals.table_stakes} Table Stakes
          </div>
        </div>
      </div>

      {/* ── Timeline ──────────────────────────────────────────────────── */}
      <div className="timeline-scroll">
        {/* Connector dots + lines */}
        <div className="timeline-connector">
          <div className="connector-line">
            {steps.map((step, i) => (
              <span key={step.stepNumber} style={{ display: "contents" }}>
                <div
                  className={`connector-node${step.relevant ? " active" : " inactive"}`}
                />
                {i < steps.length - 1 && (
                  <div
                    className="connector-segment"
                    style={{ width: segWidth }}
                  />
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Step cards */}
        <div className="timeline-cards">
          {steps.map((step) => {
            const stepKey =
              step.jobStep?.toUpperCase() ?? step.verb?.toUpperCase() ?? "";
            const sn = stepNeedsMap.get(stepKey);
            const dist = sn?.distribution ?? {
              underserved: 0,
              appropriately_served: 0,
              overserved: 0,
              table_stakes: 0,
            };
            const totalNeeds = sn?.total ?? 0;
            const topNeeds = sn?.topNeeds ?? [];
            const isExpanded = expandedStep === step.stepNumber;
            const isRelevant = step.relevant !== false;
            const hasNeeds = topNeeds.length > 0;

            const cardClass = [
              "step-card",
              isExpanded ? "expanded" : "",
              !isRelevant ? "irrelevant" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={step.stepNumber}
                className={cardClass}
                onClick={() => {
                  if (!isRelevant || !hasNeeds) return;
                  setExpandedStep(isExpanded ? null : step.stepNumber);
                }}
              >
                {/* Card header */}
                <div className="card-header">
                  <div className="step-number">{step.stepNumber}</div>
                  <div className="card-title-area">
                    <div className="card-title-row">
                      {/* TODO #1: Verb prominent */}
                      <div className="step-name">{step.verb}</div>
                      {isRelevant && hasNeeds && (
                        <div className="expand-chevron">
                          <ChevronIcon />
                        </div>
                      )}
                    </div>
                    {/* TODO #1: "This step is about " + description */}
                    {step.description && (
                      <div className="step-description">
                        This step is about {step.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Market needs badge */}
                <div className="needs-badge-row">
                  <span className="needs-label">Market Needs</span>
                  <div className="needs-count-badge">
                    <span className="needs-count-value">{totalNeeds}</span>
                  </div>
                </div>

                {/* Stacked bar */}
                <div className="stacked-bar-section">
                  <div className="stacked-bar-track">
                    {totalNeeds > 0 && (
                      <>
                        <div
                          className="stacked-bar-seg seg-underserved"
                          style={{
                            width: `${pct(dist.underserved, totalNeeds)}%`,
                          }}
                        />
                        <div
                          className="stacked-bar-seg seg-appropriately"
                          style={{
                            width: `${pct(dist.appropriately_served, totalNeeds)}%`,
                          }}
                        />
                        <div
                          className="stacked-bar-seg seg-overserved"
                          style={{
                            width: `${pct(dist.overserved, totalNeeds)}%`,
                          }}
                        />
                        <div
                          className="stacked-bar-seg seg-tablestakes"
                          style={{
                            width: `${pct(dist.table_stakes, totalNeeds)}%`,
                          }}
                        />
                      </>
                    )}
                  </div>
                  <div className="bar-pct-labels">
                    <div className="bar-pct-item">
                      <div
                        className="bar-pct-dot"
                        style={{ background: "var(--color-underserved)" }}
                      />
                      {pct(dist.underserved, totalNeeds)}%
                    </div>
                    <div className="bar-pct-item">
                      <div
                        className="bar-pct-dot"
                        style={{ background: "var(--color-appropriately)" }}
                      />
                      {pct(dist.appropriately_served, totalNeeds)}%
                    </div>
                    <div className="bar-pct-item">
                      <div
                        className="bar-pct-dot"
                        style={{ background: "var(--color-overserved)" }}
                      />
                      {pct(dist.overserved, totalNeeds)}%
                    </div>
                    <div className="bar-pct-item">
                      <div
                        className="bar-pct-dot"
                        style={{ background: "var(--color-tablestakes)" }}
                      />
                      {pct(dist.table_stakes, totalNeeds)}%
                    </div>
                  </div>
                </div>

                {/* Rationale / sensor dependency as commodity-style tag */}
                {isRelevant && step.rationale && (
                  <div className="commodity-tags">
                    <div className="commodity-tag" style={{ maxWidth: "100%", whiteSpace: "normal" }}>
                      {step.rationale}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Detail panel (below the card row, inside timeline-scroll) ── */}
        {expandedStep !== null && (() => {
          const step = steps.find((s) => s.stepNumber === expandedStep);
          if (!step) return null;
          const stepKey =
            step.jobStep?.toUpperCase() ?? step.verb?.toUpperCase() ?? "";
          const sn = stepNeedsMap.get(stepKey);
          const topNeeds = sn?.topNeeds ?? [];
          if (topNeeds.length === 0) return null;

          return (
            <div className="detail-panel">
              <div className="detail-header">
                <div className="detail-header-left">
                  <span className="detail-step-num">{step.stepNumber}</span>
                  <span className="detail-step-name">{step.verb}</span>
                  <span className="detail-section-label">
                    Top Outcome Needs
                  </span>
                </div>
                <button
                  className="detail-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedStep(null);
                  }}
                >
                  ESC
                </button>
              </div>
              <div className="needs-table-wrapper">
                <table className="needs-table">
                  <thead>
                    <tr>
                      <th style={{ width: "50%" }}>Need Statement</th>
                      <th className="col-right">Importance</th>
                      <th className="col-right">Satisfaction</th>
                      <th className="col-right">Opportunity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topNeeds.map((need, idx) => (
                      <tr key={need.id || idx}>
                        <td className="need-statement">{need.statement}</td>
                        <td className="metric-cell importance">
                          {need.importance}
                        </td>
                        <td className="metric-cell satisfaction">
                          {need.satisfaction}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: 18 }}>
                          <span
                            className={`opp-badge ${oppClass(need.opportunity)}`}
                          >
                            {need.opportunity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── Legend (TODO #14: plain-language labels) ──────────────────── */}
      <div className="job-map-legend">
        <div className="legend-title">Market Needs State</div>
        <div className="legend-items">
          <div className="legend-item">
            <div
              className="legend-swatch"
              style={{ background: "var(--color-underserved)" }}
            />
            <span className="legend-label">Underserved — opportunity exists</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-swatch"
              style={{ background: "var(--color-appropriately)" }}
            />
            <span className="legend-label">Appropriately Served</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-swatch"
              style={{ background: "var(--color-overserved)" }}
            />
            <span className="legend-label">Overserved — satisfaction exceeds importance</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-swatch"
              style={{ background: "var(--color-tablestakes)" }}
            />
            <span className="legend-label">Table Stakes — expected baseline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
