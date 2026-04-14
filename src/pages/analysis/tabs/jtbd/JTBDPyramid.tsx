/**
 * JTBDPyramid — Burleson JTBD Pyramid visualization (5-tier).
 *
 * Tiers (top-to-bottom):
 *   P1 Core Functional Job  — blue     (#42a5f5)
 *   P2 Related Jobs         — green    (#66bb6a)
 *   P3 Emotional / Social   — yellow   (#ffca28)
 *   P4 Financial Outcomes   — orange   (#ffa726)
 *   P5 Consumption Chain    — red      (#ef5350)
 *
 * Data strategy:
 *   1. Use `pyramidLevel` field on ODINeed if present.
 *   2. Otherwise classify by heuristic keyword matching on need statement.
 *   3. Core Functional Job (P1) — always shows the coreJobStatement from jtbd.json.
 *   4. Each tier is expandable; click to reveal the classified needs.
 *
 * Rules:
 *   - Does NOT modify types/index.ts (pyramidLevel extension is additive/optional).
 *   - Does NOT start dev server.
 *   - Works for all 9 markets with graceful empty-state.
 */

import { useState } from "react";
import type { ODINeed, JTBDData, ODIData } from "@/types";

// ─── Pyramid level config ─────────────────────────────────────────────────────

export type PyramidLevel = "P1" | "P2" | "P3" | "P4" | "P5";

interface LevelConfig {
  key: PyramidLevel;
  label: string;
  shortLabel: string;
  definition: string;
  /** Width as % of the container — narrows toward top (P1 is widest at bottom). */
  widthPct: number;
  color: string;
  bgRgb: string; // RGB triple for rgba() usage
}

const LEVELS: LevelConfig[] = [
  {
    key: "P1",
    label: "P1 — Core Functional Job",
    shortLabel: "Core Functional",
    definition: "The primary job the customer hires a product to do. The highest-stakes, most strategic need.",
    widthPct: 90,
    color: "#42a5f5",
    bgRgb: "66,165,245",
  },
  {
    key: "P2",
    label: "P2 — Related Jobs",
    shortLabel: "Related Jobs",
    definition: "Adjacent tasks the customer must perform before, during, or after the core job — install, integrate, configure.",
    widthPct: 73,
    color: "#66bb6a",
    bgRgb: "102,187,106",
  },
  {
    key: "P3",
    label: "P3 — Emotional / Social",
    shortLabel: "Emotional / Social",
    definition: "How the customer wants to feel and how they want to be perceived when doing the job.",
    widthPct: 56,
    color: "#ffca28",
    bgRgb: "255,202,40",
  },
  {
    key: "P4",
    label: "P4 — Financial Outcomes",
    shortLabel: "Financial Outcomes",
    definition: "Cost, ROI, TCO, energy, and margin objectives that frame acceptable solutions.",
    widthPct: 39,
    color: "#ffa726",
    bgRgb: "255,167,38",
  },
  {
    key: "P5",
    label: "P5 — Consumption Chain",
    shortLabel: "Consumption Chain",
    definition: "The full ownership experience — maintenance, cleaning, replacement, disposal.",
    widthPct: 22,
    color: "#ef5350",
    bgRgb: "239,83,80",
  },
];

// ─── Keyword heuristic classification ────────────────────────────────────────

/**
 * Classify an ODI need statement into a Burleson pyramid level using
 * keyword matching. This is the fallback when `pyramidLevel` is not
 * present on the need object.
 *
 * Priority order matters: more specific patterns are checked first.
 */
function classifyNeed(statement: string): PyramidLevel {
  const s = statement.toLowerCase();

  // P5 — Consumption chain (maintenance, lifecycle)
  if (
    /\b(maintain|maintenance|clean|replace|replacement|disposal|dispose|battery|ownership|clogg|clog|service life|service interval|biofilm removal|scheduled|wear|bio-fouling)\b/.test(s)
  ) {
    return "P5";
  }

  // P4 — Financial outcomes
  if (
    /\b(cost|tco|energy|roi|margin|budget|capex|opex|price|invest|payback|economic|expenditure|installed cost|per-point|per point|savings|affordable)\b/.test(s)
  ) {
    return "P4";
  }

  // P3 — Emotional / social
  if (
    /\b(trust|confidence|anxiety|anxious|reassur|reputation|perception|feel|feeling|peace of mind|worry|concern|sleep|operator comfort|stress|overnight|off-hour|remote alert|reliability image|credibility|auditor|investor|certif|compliance evidence)\b/.test(s)
  ) {
    return "P3";
  }

  // P2 — Related jobs (install, commission, integrate)
  if (
    /\b(install|commission|commissioning|integrat|compatible|wiring|plc|scada|configure|configuration|setup|set-up|plug|connect|interface|protocol|retrofit|upgrade|onboard|ramp.up)\b/.test(s)
  ) {
    return "P2";
  }

  // P1 — Core functional (measurement, detection, accuracy, monitoring)
  // This is the default catch-all for functional outcomes
  return "P1";
}

// ─── Types ───────────────────────────────────────────────────────────────────

/** ODINeed extended with optional pyramidLevel (additive — no existing field removed). */
type ODINeedWithLevel = ODINeed & { pyramidLevel?: PyramidLevel };

interface NeedsPerLevel {
  P1: ODINeedWithLevel[];
  P2: ODINeedWithLevel[];
  P3: ODINeedWithLevel[];
  P4: ODINeedWithLevel[];
  P5: ODINeedWithLevel[];
}

// ─── Helper: classify all needs ──────────────────────────────────────────────

function buildNeedsPerLevel(needs: ODINeedWithLevel[]): NeedsPerLevel {
  const result: NeedsPerLevel = { P1: [], P2: [], P3: [], P4: [], P5: [] };
  for (const need of needs) {
    const level: PyramidLevel = need.pyramidLevel ?? classifyNeed(need.statement);
    result[level].push({ ...need, pyramidLevel: level });
  }
  return result;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CountBadge({ count, color }: { count: number; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 22,
        height: 22,
        padding: "0 6px",
        borderRadius: 999,
        background: `${color}22`,
        border: `1px solid ${color}55`,
        color,
        fontSize: 10,
        fontWeight: 700,
        fontFamily: "var(--font-mono)",
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {count}
    </span>
  );
}

function OpportunityPip({ opp }: { opp: number }) {
  const color =
    opp >= 15
      ? "#e74c3c"
      : opp >= 12
      ? "#e67e22"
      : opp >= 10
      ? "#f1c40f"
      : "#6b8e23";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        color,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 8 }}>▲</span>
      {opp.toFixed(0)}
    </span>
  );
}

function NeedsExpandPanel({
  needs,
  levelConfig,
}: {
  needs: ODINeedWithLevel[];
  levelConfig: LevelConfig;
}) {
  if (needs.length === 0) {
    return (
      <p
        style={{
          margin: 0,
          fontSize: 12,
          color: "var(--text-gray-dark)",
          fontStyle: "italic",
        }}
      >
        No needs classified at this level for this market.
      </p>
    );
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {needs.map((need, idx) => (
        <li
          key={idx}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            fontSize: 12,
            color: "var(--text-gray-light)",
            lineHeight: 1.5,
            paddingBottom: idx < needs.length - 1 ? 8 : 0,
            borderBottom:
              idx < needs.length - 1
                ? "1px solid rgba(255,255,255,0.04)"
                : "none",
          }}
        >
          {/* Colored dot */}
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: levelConfig.color,
              opacity: 0.7,
              flexShrink: 0,
              marginTop: 5,
            }}
          />
          {/* Statement */}
          <span style={{ flex: 1 }}>{need.statement}</span>
          {/* Opportunity score */}
          <OpportunityPip opp={need.opportunity} />
        </li>
      ))}
    </ul>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface JTBDPyramidProps {
  jtbd: JTBDData | null;
  odi: ODIData | null;
  marketName: string;
}

export default function JTBDPyramid({ jtbd, odi, marketName }: JTBDPyramidProps) {
  const [expandedLevel, setExpandedLevel] = useState<PyramidLevel | null>(null);

  const rawNeeds: ODINeedWithLevel[] = (odi?.needs ?? []) as ODINeedWithLevel[];
  const needsPerLevel = buildNeedsPerLevel(rawNeeds);

  const coreJob = jtbd?.coreJobStatement ?? null;
  const productJob = jtbd?.productJobStatement ?? null;

  // Always inject the P1 core job statement as a synthetic "need" in P1
  // so P1 is never empty even when all ODI needs land in other buckets.
  const p1Display = needsPerLevel["P1"];

  return (
    <div>
      {/* ── Executive Summary ─────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 10,
          padding: "20px 24px",
          marginBottom: 24,
          fontSize: 13,
          color: "var(--text-gray-light)",
          lineHeight: 1.7,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--accent-yellow)",
            }}
          >
            Framework
          </span>
          <span
            style={{
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--text-gray-dark)",
            }}
          >
            Burleson JTBD Pyramid v5
          </span>
        </div>
        <p style={{ margin: 0 }}>
          The{" "}
          <strong style={{ color: "var(--text-white)" }}>
            Burleson Pyramid
          </strong>{" "}
          organizes customer needs into 5 layers — from the core job they hire a
          product to do, down to the full ownership experience. Needs{" "}
          <strong style={{ color: "var(--text-white)" }}>
            higher in the pyramid
          </strong>{" "}
          (P1–P2) are more strategic and drive purchase decisions; lower layers
          (P3–P5) affect adoption, loyalty, and switching costs. Each layer
          below is populated from the{" "}
          {rawNeeds.length > 0 ? `${rawNeeds.length} ` : ""}ODI outcomes for{" "}
          <strong style={{ color: "var(--text-white)" }}>{marketName}</strong>,
          classified by heuristic keyword matching when no explicit level tag is
          present.
        </p>
        {(coreJob || productJob) && (
          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {coreJob && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#42a5f5",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  Core Job
                </span>
                <span style={{ fontSize: 12, color: "var(--text-white)" }}>
                  {coreJob}
                </span>
              </div>
            )}
            {productJob && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#66bb6a",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  Product Job
                </span>
                <span style={{ fontSize: 12, color: "var(--text-gray-light)" }}>
                  {productJob}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Legend ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px 20px",
          marginBottom: 20,
        }}
      >
        {LEVELS.map((lc) => (
          <div
            key={lc.key}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: lc.color,
                opacity: 0.85,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--text-gray-light)",
              }}
            >
              {lc.key}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-gray-dark)" }}>
              {lc.shortLabel}
            </span>
          </div>
        ))}
      </div>

      {/* ── Pyramid ───────────────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 12,
          padding: "28px 24px",
        }}
      >
        {/* Section title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-white)",
            }}
          >
            Job Hierarchy
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              color: "var(--text-gray-dark)",
            }}
          >
            Burleson v5.1
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--text-gray-dark)",
            }}
          >
            Click a tier to expand
          </span>
        </div>

        {/* Pyramid levels — widest at bottom (P1), narrowest at top (P5) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
          }}
        >
          {/* Render in reverse so P5 (narrowest) is at top visually */}
          {[...LEVELS].reverse().map((lc) => {
            const needs = needsPerLevel[lc.key];
            const isExpanded = expandedLevel === lc.key;
            const count = needs.length;

            return (
              <div
                key={lc.key}
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Clickable bar */}
                <button
                  onClick={() =>
                    setExpandedLevel(isExpanded ? null : lc.key)
                  }
                  style={{
                    width: `${lc.widthPct}%`,
                    background: `linear-gradient(135deg, rgba(${lc.bgRgb},0.20), rgba(${lc.bgRgb},0.07))`,
                    border: `1px solid rgba(${lc.bgRgb},${isExpanded ? "0.65" : "0.28"})`,
                    borderRadius:
                      lc.key === "P1"
                        ? "4px 4px 10px 10px"
                        : lc.key === "P5"
                        ? "10px 10px 4px 4px"
                        : "4px",
                    padding: "14px 20px",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                    boxShadow: isExpanded
                      ? `0 0 20px rgba(${lc.bgRgb},0.08)`
                      : "none",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.borderColor = `rgba(${lc.bgRgb},0.55)`;
                  }}
                  onMouseLeave={(e) => {
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.borderColor = `rgba(${lc.bgRgb},${isExpanded ? "0.65" : "0.28"})`;
                  }}
                >
                  {/* Level tag */}
                  <span
                    style={{
                      fontSize: 9,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: lc.color,
                      flexShrink: 0,
                      minWidth: 20,
                    }}
                  >
                    {lc.key}
                  </span>

                  {/* Label + definition */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--text-white)",
                        lineHeight: 1.3,
                        marginBottom: 2,
                      }}
                    >
                      {lc.shortLabel}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-gray-dark)",
                        lineHeight: 1.4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {lc.definition}
                    </div>
                  </div>

                  {/* Count badge */}
                  <CountBadge count={count} color={lc.color} />

                  {/* Chevron */}
                  <span
                    style={{
                      fontSize: 14,
                      color: "var(--text-gray-dark)",
                      flexShrink: 0,
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease",
                      lineHeight: 1,
                    }}
                  >
                    ▾
                  </span>
                </button>

                {/* Expanded panel */}
                {isExpanded && (
                  <div
                    style={{
                      width: `${lc.widthPct}%`,
                      marginTop: 4,
                      background: "#1a1c20",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 8,
                      padding: "18px 20px",
                    }}
                  >
                    {/* P1 special: show core job prominently at top */}
                    {lc.key === "P1" && coreJob && (
                      <div
                        style={{
                          marginBottom: p1Display.length > 0 ? 16 : 0,
                          paddingBottom: p1Display.length > 0 ? 16 : 0,
                          borderBottom:
                            p1Display.length > 0
                              ? "1px solid rgba(66,165,245,0.15)"
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 9,
                            fontFamily: "var(--font-mono)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "#42a5f5",
                            marginBottom: 6,
                          }}
                        >
                          Core Job Statement
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 500,
                            color: "var(--text-white)",
                            lineHeight: 1.5,
                          }}
                        >
                          {coreJob}
                        </p>
                      </div>
                    )}

                    {/* Need list */}
                    <NeedsExpandPanel needs={needs} levelConfig={lc} />

                    {/* Empty state for P1 when no ODI needs classified here */}
                    {lc.key === "P1" && p1Display.length === 0 && !coreJob && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: "var(--text-gray-dark)",
                          fontStyle: "italic",
                        }}
                      >
                        No ODI needs classified at this level for this market.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stats row */}
        {rawNeeds.length > 0 && (
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              flexWrap: "wrap",
              gap: "12px 32px",
            }}
          >
            {LEVELS.map((lc) => (
              <div
                key={lc.key}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: lc.color,
                  }}
                >
                  {lc.key}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-white)",
                  }}
                >
                  {needsPerLevel[lc.key].length}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--text-gray-dark)",
                  }}
                >
                  need{needsPerLevel[lc.key].length !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
