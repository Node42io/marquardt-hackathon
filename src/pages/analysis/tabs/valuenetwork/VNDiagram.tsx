/**
 * VNDiagram — Value Network tree visualization.
 *
 * Renders L6 systems as expandable rows with their L5 child units.
 * Matches the dark charcoal + chartreuse design from the HTML reports.
 * Legend is rendered at the TOP per TODO item 10.
 */

import { useState } from "react";
import type { ValueNetworkData, VNUnit, L6System } from "@/types";
import {
  groupUnitsByL6,
  marquardtPositionLabel,
  cleanFunctionalJob,
  deriveDescription,
} from "./helpers";

/* ── Colour tokens (matches VN HTML CSS variables) ─────────────────────── */
const C = {
  bg: "#1f2329",
  bgElevated: "#262a31",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  textPrimary: "#f3f1eb",
  textSecondary: "#787a7d",
  textTertiary: "#5a5c5f",
  accent: "#fdff98",
  accentDim: "rgba(253,255,152,0.12)",
  levelL6Core: { bg: "rgba(42,157,143,0.22)", text: "#b7fff6" },
  levelL6Horiz: { bg: "rgba(42,157,143,0.10)", text: "#7dd6cc" },
  levelL5: { bg: "rgba(233,196,106,0.18)", text: "#e9c46a" },
  sensorGreen: "#6fd59b",
  sensorGreenBg: "rgba(111,213,155,0.12)",
  sensorOrange: "#e9c46a",
  rowHover: "rgba(255,255,255,0.025)",
};

/* ── Types ──────────────────────────────────────────────────────────────── */
interface DetailState {
  unit: VNUnit | null;
  system: L6System | null;
}

/* ── Level badge ─────────────────────────────────────────────────────────── */
function LevelBadge({ level, type }: { level: string; type?: string }) {
  const isHoriz = type === "Horizontal";
  const style: React.CSSProperties =
    level === "L6"
      ? {
          background: isHoriz
            ? C.levelL6Horiz.bg
            : C.levelL6Core.bg,
          color: isHoriz ? C.levelL6Horiz.text : C.levelL6Core.text,
        }
      : {
          background: C.levelL5.bg,
          color: C.levelL5.text,
        };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 4,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
        flexShrink: 0,
        ...style,
      }}
    >
      {level}
    </span>
  );
}

/* ── Marquardt badge ─────────────────────────────────────────────────────── */
function MarquardtBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        fontWeight: 700,
        padding: "2px 6px",
        borderRadius: 3,
        background: C.accentDim,
        color: C.accent,
        letterSpacing: "0.05em",
        marginLeft: 8,
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

/* ── Legend (TOP of diagram per TODO 10) ────────────────────────────────── */
function Legend() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "10px 16px",
        borderBottom: `1px solid ${C.border}`,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 700,
          color: C.textTertiary,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginRight: 4,
        }}
      >
        Legend
      </span>

      {/* L6 Core */}
      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.textSecondary }}>
        <span
          style={{
            width: 28,
            height: 14,
            borderRadius: 4,
            background: C.levelL6Core.bg,
            border: `1px solid ${C.levelL6Core.text}30`,
            flexShrink: 0,
          }}
        />
        L6 Core Process
      </span>

      {/* L6 Horizontal */}
      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.textSecondary }}>
        <span
          style={{
            width: 28,
            height: 14,
            borderRadius: 4,
            background: C.levelL6Horiz.bg,
            border: `1px solid ${C.levelL6Horiz.text}30`,
            flexShrink: 0,
            opacity: 0.7,
          }}
        />
        L6 Horizontal (Cross-cutting)
      </span>

      {/* L5 unit */}
      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.textSecondary }}>
        <span
          style={{
            width: 28,
            height: 14,
            borderRadius: 4,
            background: C.levelL5.bg,
            flexShrink: 0,
          }}
        />
        L5 Process Unit
      </span>

      <span style={{ width: 1, height: 16, background: C.border, margin: "0 4px" }} />

      {/* Sensor anchor */}
      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.accent }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: C.accent,
            flexShrink: 0,
          }}
        />
        Marquardt sensor position
      </span>
    </div>
  );
}

/* ── Detail panel ─────────────────────────────────────────────────────────── */
function DetailPanel({
  detail,
  groupedUnits,
}: {
  detail: DetailState;
  groupedUnits: Map<string, VNUnit[]>;
}) {
  if (!detail.unit && !detail.system) {
    return (
      <div
        style={{
          padding: "48px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 12,
          color: C.textTertiary,
          height: "100%",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <path d="M3 3h6l2 3H3V3zM3 9h10l2 3H3V9zM3 15h14l2 3H3v-3z" />
        </svg>
        <p style={{ fontSize: 13, lineHeight: 1.5 }}>
          Select a row to see details
        </p>
      </div>
    );
  }

  if (detail.unit) {
    const unit = detail.unit;
    const sys = detail.system;
    const mLabel = marquardtPositionLabel(unit);
    const desc = deriveDescription(unit, sys?.name ?? "");

    return (
      <div style={{ padding: "22px 22px" }}>
        {/* breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          <LevelBadge level={unit.level} />
          {sys && (
            <>
              <span style={{ fontSize: 13, color: C.textTertiary }}>›</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: C.textTertiary }}>{sys.name}</span>
            </>
          )}
        </div>

        {/* title */}
        <h3 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, marginBottom: 8, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
          {unit.name}
          {mLabel && <MarquardtBadge label={mLabel} />}
        </h3>

        {/* unit ID mono tag */}
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: C.textTertiary, display: "block", marginBottom: 16 }}>
          {unit.id}
        </span>

        {/* functional job */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textTertiary, marginBottom: 6 }}>
            Core Functional Job
          </p>
          <p style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65, fontStyle: "italic" }}>
            <strong style={{ color: C.textPrimary, fontStyle: "normal" }}>
              {cleanFunctionalJob(unit.functionalJob)}
            </strong>
          </p>
        </div>

        {/* 2-sentence description (TODO 11) */}
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textTertiary, marginBottom: 6 }}>
            Description
          </p>
          <p style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }}>
            {desc}
          </p>
        </div>
      </div>
    );
  }

  if (detail.system) {
    const sys = detail.system;
    const units = groupedUnits.get(sys.id) ?? [];
    const isHoriz = sys.type === "Horizontal";

    return (
      <div style={{ padding: "22px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
          <LevelBadge level="L6" type={sys.type} />
          {isHoriz && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: C.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Horizontal
            </span>
          )}
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, marginBottom: 8, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
          {sys.name}
        </h3>

        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: C.textTertiary, display: "block", marginBottom: 16 }}>
          {sys.id}
        </span>

        {sys.jobFamily && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textTertiary, marginBottom: 6 }}>
              System Job
            </p>
            <p style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65, fontStyle: "italic" }}>
              {cleanFunctionalJob(sys.jobFamily)}
            </p>
          </div>
        )}

        {sys.scope && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textTertiary, marginBottom: 6 }}>
              Scope / Output Types
            </p>
            <p style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.65 }}>
              {sys.scope}
            </p>
          </div>
        )}

        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textTertiary, marginBottom: 8 }}>
            Process Units ({units.length})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {units.map((u) => {
              const ml = marquardtPositionLabel(u);
              return (
                <div
                  key={u.id}
                  style={{
                    padding: "8px 12px",
                    background: ml ? C.accentDim : "rgba(255,255,255,0.03)",
                    borderRadius: 6,
                    border: `1px solid ${ml ? "rgba(253,255,152,0.18)" : C.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: ml ? C.accent : C.textSecondary,
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: C.textTertiary, flexShrink: 0 }}>
                    {u.id}
                  </span>
                  <span style={{ flex: 1 }}>{u.name}</span>
                  {ml && <MarquardtBadge label={ml} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ── Main diagram component ─────────────────────────────────────────────── */
export default function VNDiagram({ data }: { data: ValueNetworkData }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<DetailState>({ unit: null, system: null });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const grouped = groupUnitsByL6(data.vnUnits, data.l6Systems);

  function toggleSystem(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectSystem(sys: L6System) {
    setSelectedId(sys.id);
    setDetail({ unit: null, system: sys });
  }

  function selectUnit(unit: VNUnit, sys: L6System) {
    setSelectedId(unit.id);
    setDetail({ unit, system: sys });
  }

  const hasAnyAnchor = data.vnUnits.some((u) => marquardtPositionLabel(u) !== null);

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
      }}
    >
      {/* LEFT: Tree panel */}
      <div
        style={{
          flex: "1 1 620px",
          minWidth: 0,
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {/* Legend at TOP (TODO 10) */}
        <Legend />

        {/* Tree header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "36px 56px 1fr 90px",
            alignItems: "center",
            padding: "9px 16px",
            borderBottom: `1px solid ${C.border}`,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {["", "Level", "System / Unit", "Units"].map((h, i) => (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: C.textTertiary,
                textAlign: i === 3 ? "center" : i === 0 ? "center" : "left",
                paddingLeft: i === 2 ? 4 : 0,
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div>
          {data.l6Systems.map((sys) => {
            const isOpen = expanded.has(sys.id);
            const isSelected = selectedId === sys.id;
            const children = grouped.get(sys.id) ?? [];
            const isHoriz = sys.type === "Horizontal";
            const hasAnchorChild = children.some((u) => marquardtPositionLabel(u) !== null);

            return (
              <div key={sys.id}>
                {/* L6 row */}
                <div
                  onClick={() => {
                    toggleSystem(sys.id);
                    selectSystem(sys);
                  }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 56px 1fr 90px",
                    alignItems: "center",
                    padding: "10px 16px",
                    borderBottom: `1px solid rgba(255,255,255,0.04)`,
                    cursor: "pointer",
                    background: isSelected
                      ? "rgba(253,255,152,0.04)"
                      : isHoriz
                      ? "rgba(38,70,83,0.14)"
                      : "transparent",
                    borderLeft: isSelected ? `3px solid ${C.accent}` : "3px solid transparent",
                    paddingLeft: isSelected ? 13 : 16,
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      (e.currentTarget as HTMLDivElement).style.background = C.rowHover;
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      (e.currentTarget as HTMLDivElement).style.background = isHoriz
                        ? "rgba(38,70,83,0.14)"
                        : "transparent";
                  }}
                >
                  {/* Chevron */}
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: C.textTertiary,
                      fontSize: 16,
                      transition: "transform 0.2s",
                      transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                    }}
                  >
                    ▾
                  </span>

                  {/* Level badge */}
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <LevelBadge level="L6" type={sys.type} />
                  </div>

                  {/* Name */}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isHoriz ? 500 : 600,
                      color: isHoriz ? C.textSecondary : C.textPrimary,
                      fontStyle: isHoriz ? "italic" : "normal",
                      paddingLeft: 4,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {sys.name}
                    {hasAnchorChild && !hasAnyAnchor && null}
                  </span>

                  {/* Unit count */}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: C.textSecondary,
                      textAlign: "center",
                    }}
                  >
                    {children.length}
                  </span>
                </div>

                {/* L5 child rows */}
                {isOpen &&
                  children.map((unit) => {
                    const mLabel = marquardtPositionLabel(unit);
                    const isUnitSelected = selectedId === unit.id;

                    return (
                      <div
                        key={unit.id}
                        onClick={() => selectUnit(unit, sys)}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "20px 56px 1fr 90px",
                          alignItems: "center",
                          padding: "8px 16px 8px 32px",
                          borderBottom: `1px solid rgba(255,255,255,0.03)`,
                          cursor: "pointer",
                          background: isUnitSelected
                            ? "rgba(253,255,152,0.05)"
                            : mLabel
                            ? "rgba(253,255,152,0.025)"
                            : "transparent",
                          borderLeft: isUnitSelected
                            ? `3px solid ${C.accent}`
                            : mLabel
                            ? `3px solid rgba(253,255,152,0.35)`
                            : "3px solid transparent",
                          paddingLeft: isUnitSelected || mLabel ? 29 : 32,
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isUnitSelected)
                            (e.currentTarget as HTMLDivElement).style.background =
                              mLabel ? "rgba(253,255,152,0.05)" : C.rowHover;
                        }}
                        onMouseLeave={(e) => {
                          if (!isUnitSelected)
                            (e.currentTarget as HTMLDivElement).style.background = mLabel
                              ? "rgba(253,255,152,0.025)"
                              : "transparent";
                        }}
                      >
                        {/* indent spacer */}
                        <span />

                        {/* Level badge */}
                        <div style={{ display: "flex", justifyContent: "flex-start" }}>
                          <LevelBadge level="L5" />
                        </div>

                        {/* Name */}
                        <span
                          style={{
                            fontSize: 12.5,
                            fontWeight: mLabel ? 600 : 400,
                            color: mLabel ? C.textPrimary : C.textSecondary,
                            paddingLeft: 4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {unit.name}
                          {mLabel && <MarquardtBadge label={mLabel} />}
                        </span>

                        {/* Empty count cell */}
                        <span />
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Detail panel */}
      <div
        style={{
          flex: "0 0 390px",
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: "hidden",
          position: "sticky",
          top: 84,
          maxHeight: "calc(100vh - 120px)",
          overflowY: "auto",
          minHeight: 280,
        }}
      >
        <DetailPanel detail={detail} groupedUnits={grouped} />
      </div>
    </div>
  );
}
