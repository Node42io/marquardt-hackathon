/**
 * ODIMatrix — Interactive scatter-plot visualisation of ODI needs.
 *
 * Replicates the HTML report's ODI-*.html design in React/SVG.
 *
 * Views:
 *   - Scatter (default): importance (X) vs satisfaction (Y), coloured by zone
 *   - Table: sortable, filterable list of all needs
 *
 * TODO items implemented:
 *   #3  — Overserved quadrant rendered in blue (satisfaction > importance)
 *   #5  — ODI formula shown in hover tooltip: Opp = Imp + (Imp − Sat)
 *   #8  — Click a dot to open the inline detail panel + scroll to NeedsList row
 */

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import type { ODINeed } from "@/types";

// ─── Zone configuration (mirrors ZONES in the HTML report) ────────────────────

const ZONES = {
  highly_underserved: {
    label: "Highly Underserved",
    shortLabel: ">15",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    textOnBadge: "#fff",
  },
  underserved: {
    label: "Underserved",
    shortLabel: "12–15",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    textOnBadge: "#1c1207",
  },
  appropriately_served: {
    label: "Appropriately Served",
    shortLabel: "opp <12",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    textOnBadge: "#052e16",
  },
  overserved: {
    label: "Overserved",
    shortLabel: "sat > imp",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    textOnBadge: "#fff",
  },
} as const;

type ZoneKey = keyof typeof ZONES;

/**
 * Derive zone key from an ODINeed.
 * Overserved is defined strictly as satisfaction > importance (TODO item 3).
 * Remaining needs are classified by opportunity magnitude.
 */
function zoneOf(need: ODINeed): ZoneKey {
  if (need.isOverserved || need.satisfaction > need.importance) return "overserved";
  if (need.opportunity >= 15) return "highly_underserved";
  if (need.opportunity >= 12) return "underserved";
  return "appropriately_served";
}

/** Truncate statement for display (avoids SVG overflow). */
function trunc(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

// ─── Tooltip (portal-based, mirrors Tooltip.tsx approach) ─────────────────────

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  need: ODINeed | null;
}

function ODITooltip({ state }: { state: TooltipState }) {
  if (!state.visible || !state.need) return null;
  const need = state.need;
  const zone = ZONES[zoneOf(need)];
  const oppFormula = `${need.importance} + (${need.importance} − ${need.satisfaction}) = ${need.opportunity}`;

  const content = (
    <div
      style={{
        position: "fixed",
        left: state.x + 16,
        top: state.y - 10,
        zIndex: 9999,
        background: "#1a1d22",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 10,
        padding: "14px 18px",
        maxWidth: 340,
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
        backdropFilter: "blur(12px)",
        pointerEvents: "none",
        fontFamily: "var(--font-sans, Inter, sans-serif)",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#f3f1eb",
          marginBottom: 8,
          lineHeight: 1.4,
        }}
      >
        {need.id ? `${need.id}: ` : ""}{trunc(need.statement, 90)}
      </div>
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          margin: "6px 0",
        }}
      />
      {/* Metrics */}
      {[
        { label: "Importance", value: String(need.importance) },
        { label: "Satisfaction", value: String(need.satisfaction) },
        {
          label: "Opp. Score",
          value: String(need.opportunity),
          valueColor: zone.color,
        },
      ].map(({ label, value, valueColor }) => (
        <div
          key={label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            padding: "2px 0",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              color: "#7b7a79",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: valueColor ?? "#f3f1eb",
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            }}
          >
            {value}
          </span>
        </div>
      ))}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          margin: "6px 0",
        }}
      />
      {/* ODI formula (Item #5) */}
      <div
        style={{
          fontSize: 10,
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          color: "#fdff98",
          marginBottom: 4,
          letterSpacing: "0.01em",
        }}
      >
        Opp = Imp + (Imp − Sat)
      </div>
      <div
        style={{
          fontSize: 10,
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          color: "#b9b9b9",
        }}
      >
        = {oppFormula}
      </div>
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          margin: "6px 0",
        }}
      />
      {/* Zone */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "2px 0",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            color: "#7b7a79",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Zone
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: zone.color,
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          }}
        >
          {zone.label}
        </span>
      </div>
      {need.jobStep && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "2px 0",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              color: "#7b7a79",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Job Step
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#f3f1eb",
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            }}
          >
            {need.jobStep}
          </span>
        </div>
      )}
      {/* Click hint (Item #8) */}
      <div
        style={{
          marginTop: 8,
          fontSize: 10,
          color: "#4f5358",
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          fontStyle: "italic",
        }}
      >
        click dot to see full rationale ↓
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function ZoneBadge({ zoneKey }: { zoneKey: ZoneKey }) {
  const z = ZONES[zoneKey];
  return (
    <span
      style={{
        display: "inline-block",
        borderRadius: 12,
        padding: "5px 14px",
        fontSize: 11,
        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
        textTransform: "uppercase",
        fontWeight: 600,
        letterSpacing: "0.03em",
        background: z.color,
        color: z.textOnBadge,
      }}
    >
      {z.label}
    </span>
  );
}

function DetailPanel({
  need,
  onClose,
}: {
  need: ODINeed;
  onClose: () => void;
}) {
  const zone = zoneOf(need);
  const zoneConf = ZONES[zone];
  const oppFormula = `${need.importance} + (${need.importance} − ${need.satisfaction}) = ${need.opportunity}`;

  return (
    <div
      style={{
        flex: "0 0 320px",
        background: "var(--bg-secondary, #262b33)",
        borderRadius: 12,
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        position: "relative",
        overflowY: "auto",
        maxHeight: 520,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close detail panel"
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#7b7a79",
          padding: 4,
          borderRadius: 4,
          lineHeight: 1,
        }}
      >
        <svg
          viewBox="0 0 18 18"
          fill="none"
          width={18}
          height={18}
        >
          <line
            x1="4"
            y1="4"
            x2="14"
            y2="14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="14"
            y1="4"
            x2="4"
            y2="14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Need title */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#f3f1eb",
          lineHeight: 1.4,
          paddingRight: 28,
        }}
      >
        {need.id ? `${need.id}: ` : ""}
        {need.statement}
      </div>

      {/* Zone badge */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            textTransform: "uppercase",
            color: "#7b7a79",
            letterSpacing: "0.06em",
          }}
        >
          Opportunity Zone
        </span>
        <ZoneBadge zoneKey={zone} />
      </div>

      {/* Metrics grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
        }}
      >
        {[
          { label: "Importance", value: need.importance },
          { label: "Satisfaction", value: need.satisfaction },
          {
            label: "Opp. Score",
            value: need.opportunity,
            color: zoneConf.color,
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "rgba(0,0,0,0.25)",
              borderRadius: 10,
              padding: "14px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontFamily:
                  "var(--font-mono, 'JetBrains Mono', monospace)",
                textTransform: "uppercase",
                color: "#7b7a79",
                letterSpacing: "0.06em",
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: color ?? "#f3f1eb",
                lineHeight: 1,
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* ODI formula */}
      <div
        style={{
          background: "rgba(0,0,0,0.2)",
          borderRadius: 8,
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            textTransform: "uppercase",
            color: "#7b7a79",
            letterSpacing: "0.06em",
          }}
        >
          ODI Formula
        </span>
        <span
          style={{
            fontSize: 11,
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            color: "#fdff98",
          }}
        >
          Opp = Imp + (Imp − Sat)
        </span>
        <span
          style={{
            fontSize: 11,
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            color: "#b9b9b9",
          }}
        >
          = {oppFormula}
        </span>
      </div>

      {/* Attributes */}
      {(need.jobStep || need.productRelated) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontFamily:
                "var(--font-mono, 'JetBrains Mono', monospace)",
              textTransform: "uppercase",
              color: "#7b7a79",
              letterSpacing: "0.06em",
            }}
          >
            Attributes
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {need.jobStep && (
              <span
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  color: "#b9b9b9",
                  fontFamily:
                    "var(--font-mono, 'JetBrains Mono', monospace)",
                }}
              >
                {need.jobStep}
              </span>
            )}
            {need.productRelated && (
              <span
                style={{
                  background: "rgba(253,255,152,0.1)",
                  border: "1px solid rgba(253,255,152,0.25)",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  color: "#fdff98",
                  fontFamily:
                    "var(--font-mono, 'JetBrains Mono', monospace)",
                }}
              >
                Product-Related
              </span>
            )}
          </div>
        </div>
      )}

      {/* Satisfaction rationale (Item #8 — click shows rationale) */}
      {need.satisfactionRationale && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontFamily:
                "var(--font-mono, 'JetBrains Mono', monospace)",
              textTransform: "uppercase",
              color: "#7b7a79",
              letterSpacing: "0.06em",
            }}
          >
            Satisfaction Rationale
          </span>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#b9b9b9",
              lineHeight: 1.55,
              borderLeft: "2px solid rgba(255,255,255,0.1)",
              paddingLeft: 12,
            }}
          >
            {need.satisfactionRationale}
          </p>
        </div>
      )}

      {/* Importance rationale */}
      {need.importanceRationale && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontFamily:
                "var(--font-mono, 'JetBrains Mono', monospace)",
              textTransform: "uppercase",
              color: "#7b7a79",
              letterSpacing: "0.06em",
            }}
          >
            Importance Rationale
          </span>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#b9b9b9",
              lineHeight: 1.55,
              borderLeft: "2px solid rgba(255,255,255,0.1)",
              paddingLeft: 12,
            }}
          >
            {need.importanceRationale}
          </p>
        </div>
      )}

      {/* Scroll-to hint */}
      <div
        style={{
          fontSize: 10,
          color: "#4f5358",
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          fontStyle: "italic",
        }}
      >
        ↓ See full row in the needs table below
      </div>
    </div>
  );
}

// ─── Scatter Plot (SVG) ────────────────────────────────────────────────────────

const W = 760;
const H = 500;
const PAD = { top: 30, right: 40, bottom: 50, left: 54 };
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;

function xPos(v: number) {
  return PAD.left + (v / 10) * plotW;
}
function yPos(v: number) {
  return PAD.top + plotH - (v / 10) * plotH;
}

/** Compute line endpoints for an opportunity-score iso-line.
 *  Opp = Imp + (Imp - Sat) = 2*Imp - Sat → Sat = 2*Imp - Opp
 *  For a given opp threshold, the line spans from min viable importance
 *  to max within the 0-10 box. */
function oppLineCoords(opp: number) {
  // When Sat=0: Imp = opp/2
  // When Imp=10: Sat = 20 - opp
  const impStart = opp / 2;
  const impEnd = Math.min(10, (opp + 10) / 2);
  const satEnd = Math.max(0, 2 * impEnd - opp);
  return {
    x1: xPos(impStart),
    y1: yPos(0),
    x2: xPos(impEnd),
    y2: yPos(satEnd),
  };
}

interface ScatterProps {
  needs: ODINeed[];
  selected: ODINeed | null;
  onDotHover: (need: ODINeed | null, x: number, y: number) => void;
  onDotClick: (need: ODINeed) => void;
}

function ScatterPlot({ needs, selected, onDotHover, onDotClick }: ScatterProps) {
  const line12 = oppLineCoords(12);
  const line15 = oppLineCoords(15);

  // Triangle zone corners
  const tl = `${PAD.left},${PAD.top}`;
  const tr = `${PAD.left + plotW},${PAD.top}`;
  const bl = `${PAD.left},${PAD.top + plotH}`;
  const br = `${PAD.left + plotW},${PAD.top + plotH}`;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ overflow: "visible", display: "block" }}
    >
      <defs>
        {/* Overserved zone gradient — top-left triangle */}
        <linearGradient id="odi-gZoneOver" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop
            offset="0%"
            stopColor={ZONES.overserved.color}
            stopOpacity="0.08"
          />
          <stop
            offset="100%"
            stopColor={ZONES.overserved.color}
            stopOpacity="0.01"
          />
        </linearGradient>
        {/* Underserved zone gradient — bottom-right triangle */}
        <linearGradient
          id="odi-gZoneUnder"
          x1="100%"
          y1="100%"
          x2="50%"
          y2="0%"
        >
          <stop
            offset="0%"
            stopColor={ZONES.highly_underserved.color}
            stopOpacity="0.08"
          />
          <stop
            offset="100%"
            stopColor={ZONES.highly_underserved.color}
            stopOpacity="0.01"
          />
        </linearGradient>
      </defs>

      {/* Zone background triangles */}
      <polygon points={`${tl} ${tr} ${bl}`} fill="url(#odi-gZoneOver)" />
      <polygon points={`${tr} ${br} ${bl}`} fill="url(#odi-gZoneUnder)" />

      {/* Grid lines */}
      {Array.from({ length: 9 }, (_, i) => i + 1).map((i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            y1={yPos(i)}
            x2={PAD.left + plotW}
            y2={yPos(i)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.5"
          />
          <line
            x1={xPos(i)}
            y1={PAD.top}
            x2={xPos(i)}
            y2={PAD.top + plotH}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.5"
          />
        </g>
      ))}

      {/* Axes */}
      <line
        x1={PAD.left}
        y1={PAD.top + plotH}
        x2={PAD.left + plotW}
        y2={PAD.top + plotH}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
      />
      <line
        x1={PAD.left}
        y1={PAD.top}
        x2={PAD.left}
        y2={PAD.top + plotH}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
      />

      {/* Axis tick labels */}
      {[2, 4, 6, 8, 10].map((i) => (
        <g key={i}>
          <text
            x={xPos(i)}
            y={PAD.top + plotH + 22}
            fill="#f3f1eb"
            fontSize="11"
            fontWeight="500"
            textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace"
          >
            {i}
          </text>
          <text
            x={PAD.left - 12}
            y={yPos(i) + 4}
            fill="#f3f1eb"
            fontSize="11"
            fontWeight="500"
            textAnchor="end"
            fontFamily="'JetBrains Mono', monospace"
          >
            {i}
          </text>
        </g>
      ))}

      {/* Axis labels */}
      <text
        x={PAD.left + plotW / 2}
        y={H - 4}
        fill="#7b7a79"
        fontSize="12"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
      >
        Importance
      </text>
      <text
        x={14}
        y={PAD.top + plotH / 2}
        fill="#7b7a79"
        fontSize="12"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        transform={`rotate(-90 14 ${PAD.top + plotH / 2})`}
      >
        Satisfaction
      </text>

      {/* Diagonal: opportunity frontier (Imp = Sat → opp = Imp, the diagonal where neither over nor underserved) */}
      <line
        x1={xPos(0)}
        y1={yPos(0)}
        x2={xPos(10)}
        y2={yPos(10)}
        stroke="#e5d35c"
        strokeWidth="1.5"
        opacity="0.6"
      />

      {/* Opportunity iso-lines (opp = 12, opp = 15) */}
      <line
        x1={line12.x1}
        y1={line12.y1}
        x2={line12.x2}
        y2={line12.y2}
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="0.8"
        strokeDasharray="6,4"
      />
      <text
        x={line12.x2 + 6}
        y={line12.y2 + 4}
        fill="rgba(255,255,255,0.28)"
        fontSize="9"
        fontFamily="'JetBrains Mono', monospace"
      >
        OPP=12
      </text>

      <line
        x1={line15.x1}
        y1={line15.y1}
        x2={line15.x2}
        y2={line15.y2}
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="0.8"
        strokeDasharray="6,4"
      />
      <text
        x={line15.x2 + 6}
        y={line15.y2 + 4}
        fill="rgba(255,255,255,0.28)"
        fontSize="9"
        fontFamily="'JetBrains Mono', monospace"
      >
        OPP=15
      </text>

      {/* Zone labels (watermark) */}
      <text
        x={xPos(2.5)}
        y={yPos(8)}
        fill="rgba(255,255,255,0.12)"
        fontSize="13"
        fontWeight="600"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
      >
        OVERSERVED
      </text>
      <text
        x={xPos(8)}
        y={yPos(1.5)}
        fill="rgba(255,255,255,0.12)"
        fontSize="13"
        fontWeight="600"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
      >
        UNDERSERVED
      </text>

      {/* Dots */}
      {needs.map((need, idx) => {
        const cx = xPos(need.importance);
        const cy = yPos(need.satisfaction);
        const zone = zoneOf(need);
        const color = ZONES[zone].color;
        const isSel = selected?.statement === need.statement;
        const r = isSel ? 8 : 6;

        return (
          <g key={idx}>
            {/* Selection rings */}
            {isSel && (
              <>
                <circle
                  cx={cx}
                  cy={cy}
                  r={16}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  opacity="0.3"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={12}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  opacity="0.5"
                />
              </>
            )}
            {/* Glow halo */}
            <circle cx={cx} cy={cy} r={r + 4} fill={color} opacity="0.12" />
            {/* Main dot */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill={color}
              stroke={isSel ? "#fff" : "rgba(255,255,255,0.2)"}
              strokeWidth={isSel ? 2 : 0.5}
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) => {
                (e.target as SVGCircleElement).setAttribute("r", "9");
                onDotHover(need, e.clientX, e.clientY);
              }}
              onMouseLeave={(e) => {
                (e.target as SVGCircleElement).setAttribute(
                  "r",
                  isSel ? "8" : "6"
                );
                onDotHover(null, 0, 0);
              }}
              onClick={() => onDotClick(need)}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Table view ────────────────────────────────────────────────────────────────

type SortKey = "importance" | "satisfaction" | "opportunity" | "statement" | "jobStep";

function TableView({
  needs,
  selected,
  onRowClick,
}: {
  needs: ODINeed[];
  selected: ODINeed | null;
  onRowClick: (need: ODINeed) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("opportunity");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = [...needs].sort((a, b) => {
    const va = a[sortKey as keyof ODINeed];
    const vb = b[sortKey as keyof ODINeed];
    if (typeof va === "number" && typeof vb === "number") {
      return sortDir === "asc" ? va - vb : vb - va;
    }
    const sa = String(va).toLowerCase();
    const sb = String(vb).toLowerCase();
    return sortDir === "asc"
      ? sa.localeCompare(sb)
      : sb.localeCompare(sa);
  });

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "statement" || key === "jobStep" ? "asc" : "desc");
    }
  }

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const cellStyle: React.CSSProperties = {
    padding: "12px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    verticalAlign: "middle",
    color: "#f3f1eb",
    fontSize: 12,
  };

  const hdrStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.35)",
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: 10,
    textTransform: "uppercase",
    color: "#7b7a79",
    letterSpacing: "0.06em",
    fontWeight: 500,
    padding: "11px 14px",
    textAlign: "left",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
  };

  if (needs.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 200,
          color: "#7b7a79",
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          fontSize: 13,
          fontStyle: "italic",
        }}
      >
        No needs match current filters
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: 13,
        }}
      >
        <thead>
          <tr>
            {need_id_present(needs) && (
              <th style={hdrStyle} onClick={() => handleSort("statement")}>
                ID
              </th>
            )}
            <th
              style={{ ...hdrStyle, maxWidth: 380 }}
              onClick={() => handleSort("statement")}
            >
              Need Statement{arrow("statement")}
            </th>
            <th
              style={{ ...hdrStyle, textAlign: "center" }}
              onClick={() => handleSort("importance")}
            >
              Imp.{arrow("importance")}
            </th>
            <th
              style={{ ...hdrStyle, textAlign: "center" }}
              onClick={() => handleSort("satisfaction")}
            >
              Sat.{arrow("satisfaction")}
            </th>
            <th
              style={{ ...hdrStyle, textAlign: "center" }}
              onClick={() => handleSort("opportunity")}
            >
              Opp.{arrow("opportunity")}
            </th>
            <th style={hdrStyle}>Zone</th>
            <th
              style={hdrStyle}
              onClick={() => handleSort("jobStep")}
            >
              Job Step{arrow("jobStep")}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((need, idx) => {
            const zone = zoneOf(need);
            const zoneConf = ZONES[zone];
            const isSel = selected?.statement === need.statement;
            return (
              <tr
                key={idx}
                onClick={() => onRowClick(need)}
                style={{
                  cursor: "pointer",
                  background: isSel
                    ? "rgba(253,255,152,0.06)"
                    : undefined,
                  transition: "background 0.12s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSel)
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (!isSel)
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      "";
                }}
              >
                {need_id_present(needs) && (
                  <td
                    style={{
                      ...cellStyle,
                      fontFamily:
                        "var(--font-mono, 'JetBrains Mono', monospace)",
                      fontSize: 10,
                      color: "#b9b9b9",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {need.id}
                  </td>
                )}
                <td
                  style={{
                    ...cellStyle,
                    maxWidth: 360,
                    lineHeight: 1.45,
                  }}
                >
                  {need.statement}
                </td>
                <td
                  style={{
                    ...cellStyle,
                    textAlign: "center",
                    fontFamily:
                      "var(--font-mono, 'JetBrains Mono', monospace)",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {need.importance}
                </td>
                <td
                  style={{
                    ...cellStyle,
                    textAlign: "center",
                    fontFamily:
                      "var(--font-mono, 'JetBrains Mono', monospace)",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {need.satisfaction}
                </td>
                <td
                  style={{
                    ...cellStyle,
                    textAlign: "center",
                    fontFamily:
                      "var(--font-mono, 'JetBrains Mono', monospace)",
                    fontWeight: 700,
                    fontSize: 13,
                    color: zoneConf.color,
                  }}
                >
                  {need.opportunity}
                </td>
                <td style={cellStyle}>
                  <span
                    style={{
                      display: "inline-block",
                      borderRadius: 8,
                      padding: "3px 9px",
                      fontSize: 10,
                      fontFamily:
                        "var(--font-mono, 'JetBrains Mono', monospace)",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      background: zoneConf.color,
                      color: zoneConf.textOnBadge,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {zoneConf.label}
                  </span>
                </td>
                <td
                  style={{
                    ...cellStyle,
                    fontFamily:
                      "var(--font-mono, 'JetBrains Mono', monospace)",
                    fontSize: 10,
                    color: "#b9b9b9",
                  }}
                >
                  {need.jobStep}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Check if any need has a non-empty id (finfish has ids, some markets may not). */
function need_id_present(needs: ODINeed[]) {
  return needs.some((n) => n.id && n.id.trim().length > 0);
}

// ─── Main component ────────────────────────────────────────────────────────────

interface ODIMatrixProps {
  needs: ODINeed[];
  marketName?: string;
  /** Optional callback — called with the need the user clicked so the
   *  parent can highlight the corresponding row in NeedsList below. */
  onNeedSelected?: (need: ODINeed | null) => void;
}

export default function ODIMatrix({
  needs,
  marketName,
  onNeedSelected,
}: ODIMatrixProps) {
  const [view, setView] = useState<"scatter" | "table">("scatter");
  const [activeZones, setActiveZones] = useState<Set<ZoneKey>>(
    new Set<ZoneKey>()
  );
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ODINeed | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    need: null,
  });

  // Compute per-zone counts from all needs
  const zoneCounts = needs.reduce<Partial<Record<ZoneKey, number>>>(
    (acc, n) => {
      const z = zoneOf(n);
      acc[z] = (acc[z] ?? 0) + 1;
      return acc;
    },
    {}
  );

  // Filter logic
  const filtered = needs.filter((n) => {
    const z = zoneOf(n);
    if (activeZones.size > 0 && !activeZones.has(z)) return false;
    if (search) {
      const q = search.toLowerCase();
      const haystack = [n.statement, n.jobStep, n.id].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const toggleZone = useCallback((z: ZoneKey) => {
    setActiveZones((prev) => {
      const next = new Set(prev);
      if (next.has(z)) next.delete(z);
      else next.add(z);
      return next;
    });
  }, []);

  const handleDotHover = useCallback(
    (need: ODINeed | null, x: number, y: number) => {
      setTooltip({ visible: need !== null, x, y, need });
    },
    []
  );

  const handleSelect = useCallback(
    (need: ODINeed) => {
      const next = selected?.statement === need.statement ? null : need;
      setSelected(next);
      onNeedSelected?.(next);
    },
    [selected, onNeedSelected]
  );

  const closeDetail = useCallback(() => {
    setSelected(null);
    onNeedSelected?.(null);
  }, [onNeedSelected]);

  // View button icon SVGs
  const ScatterIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" width={16} height={16}>
      <circle cx="4" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="3" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
  const TableIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" width={16} height={16}>
      <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );

  const btnBase: React.CSSProperties = {
    background: "var(--bg-secondary, #262b33)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6,
    padding: "7px 10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
  };
  const btnActive: React.CSSProperties = {
    ...btnBase,
    background: "#fdff98",
    borderColor: "#fdff98",
    color: "#262b33",
  };
  const btnInactive: React.CSSProperties = {
    ...btnBase,
    color: "#f3f1eb",
  };

  if (!needs || needs.length === 0) {
    return (
      <div
        style={{
          padding: "32px 28px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 12,
          color: "var(--text-gray-dark)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontStyle: "italic",
        }}
      >
        ODI matrix data pending for this market.
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--bg-primary, #16181c)",
        borderRadius: 12,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        border: "1px solid rgba(255,255,255,0.1)",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Tooltip portal */}
      <ODITooltip state={tooltip} />

      {/* ── Header row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 12,
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              textTransform: "uppercase",
              color: "#f3f1eb",
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            ODI Opportunity Matrix
          </span>
          <span
            style={{
              background: "#3c465a",
              borderRadius: 16,
              padding: "4px 10px",
              fontSize: 12,
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              color: "#fdff98",
              fontWeight: 500,
            }}
          >
            {filtered.length}
          </span>
          {marketName && (
            <span
              style={{
                background: "var(--bg-secondary, #262b33)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "5px 13px",
                fontSize: 12,
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                color: "#7b9cc4",
                letterSpacing: "0.02em",
              }}
            >
              {marketName}
            </span>
          )}
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 4 }}>
          <button
            type="button"
            title="Scatter Plot"
            onClick={() => setView("scatter")}
            style={view === "scatter" ? btnActive : btnInactive}
          >
            <ScatterIcon />
          </button>
          <button
            type="button"
            title="Table View"
            onClick={() => setView("table")}
            style={view === "table" ? btnActive : btnInactive}
          >
            <TableIcon />
          </button>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div
        style={{
          background: "var(--bg-secondary, #262b33)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          padding: "9px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          height: 42,
        }}
      >
        <svg
          viewBox="0 0 18 18"
          fill="none"
          width={16}
          height={16}
          style={{ flexShrink: 0 }}
        >
          <circle cx="8" cy="8" r="5.5" stroke="#7b7a79" strokeWidth="1.5" />
          <line
            x1="12"
            y1="12"
            x2="16"
            y2="16"
            stroke="#7b7a79"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          placeholder="Search need statements…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 13,
            color: "#f3f1eb",
            flex: 1,
            fontFamily: "Inter, sans-serif",
          }}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#7b7a79",
              fontSize: 16,
              lineHeight: 1,
              padding: 0,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* ── Filter pills ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(Object.entries(ZONES) as [ZoneKey, (typeof ZONES)[ZoneKey]][]).map(
          ([key, z]) => {
            const count = zoneCounts[key] ?? 0;
            const isActive = activeZones.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleZone(key)}
                style={{
                  background: isActive
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 20,
                  padding: "5px 12px",
                  fontSize: 12,
                  fontFamily: "Inter, sans-serif",
                  color: "#f3f1eb",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  transition: "all 0.15s ease",
                  userSelect: "none",
                }}
              >
                {isActive && (
                  <span style={{ fontSize: 10, fontWeight: 700 }}>✓</span>
                )}
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: z.color,
                    flexShrink: 0,
                  }}
                />
                {z.label}
                <span
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: 8,
                    padding: "1px 6px",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* ── Content area (scatter or table + detail panel) ── */}
      <div
        style={{
          display: "flex",
          gap: 16,
          minHeight: 520,
          alignItems: "flex-start",
        }}
      >
        {/* Chart/table panel */}
        <div
          style={{
            flex: 1,
            background: "var(--bg-secondary, #262b33)",
            borderRadius: 12,
            padding: view === "scatter" ? 24 : 0,
            position: "relative",
            overflow: "hidden",
            minHeight: 420,
          }}
        >
          {view === "scatter" ? (
            <ScatterPlot
              needs={filtered}
              selected={selected}
              onDotHover={handleDotHover}
              onDotClick={handleSelect}
            />
          ) : (
            <TableView
              needs={filtered}
              selected={selected}
              onRowClick={handleSelect}
            />
          )}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                color: "#7b7a79",
              }}
            >
              <svg viewBox="0 0 40 40" fill="none" width={40} height={40}>
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#4f5358"
                  strokeWidth="2"
                />
                <line
                  x1="14"
                  y1="14"
                  x2="26"
                  y2="26"
                  stroke="#4f5358"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="26"
                  y1="14"
                  x2="14"
                  y2="26"
                  stroke="#4f5358"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span style={{ fontSize: 13 }}>No needs match current filters</span>
            </div>
          )}
        </div>

        {/* Detail panel (Item #8) */}
        {selected && (
          <DetailPanel need={selected} onClose={closeDetail} />
        )}
      </div>

      {/* ── Legend ── */}
      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
          paddingTop: 4,
          flexWrap: "wrap",
        }}
      >
        {(Object.entries(ZONES) as [ZoneKey, (typeof ZONES)[ZoneKey]][]).map(
          ([key, z]) => (
            <span
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                color: "#7b7a79",
                fontFamily:
                  "var(--font-mono, 'JetBrains Mono', monospace)",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: z.color,
                  flexShrink: 0,
                }}
              />
              {z.label} ({z.shortLabel})
            </span>
          )
        )}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "#7b7a79",
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          }}
        >
          <span
            style={{
              width: 20,
              height: 2,
              background: "#e5d35c",
              borderRadius: 1,
            }}
          />
          Opportunity Frontier (Imp = Sat)
        </span>
      </div>
    </div>
  );
}
