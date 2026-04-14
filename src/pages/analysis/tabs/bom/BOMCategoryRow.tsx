/**
 * BOMCategoryRow — one L6.N (L4) row with label, confidence badge, and variant chips.
 *
 * Matches Figma design:
 *   - Left: collapse/expand caret, L6.N identifier in mono font, row label, confidence badge
 *   - Right: inline row of variant chips (VariantCard × N)
 *   - Expandable detail panel showing L3 modules and their variant chips
 *
 * Uses .bom-category-row CSS classes from bom.css.
 */

import { useState } from "react";
import type { BOML4Subsystem, BOMModule, BOMConfidence } from "@/types";
import ConfidenceTierBadge from "./ConfidenceTierBadge";
import VariantCard from "./VariantCard";

/* ── Chevron icon ────────────────────────────────────────────────────────── */
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ transition: "transform 0.18s ease", transform: open ? "rotate(180deg)" : "none" }}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Marquardt anchor badge ──────────────────────────────────────────────── */
function MarquardtBadge({ note }: { note?: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--accent-yellow)",
        background: "rgba(253,255,152,0.08)",
        border: "1px solid rgba(253,255,152,0.2)",
        borderRadius: 3,
        padding: "2px 6px",
        whiteSpace: "nowrap",
      }}
      title={note}
    >
      Marquardt anchor
    </span>
  );
}

/* ── Module row (L3 level, inside expanded panel) ─────────────────────────── */
function ModuleRow({ module, parentConfidence }: { module: BOMModule; parentConfidence: BOMConfidence }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "10px 0",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-gray-dark)",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 3,
            padding: "2px 6px",
            whiteSpace: "nowrap",
          }}
        >
          {module.id}
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-white)" }}>
          {module.name}
        </span>
        {module.isMarquardtAnchor && <MarquardtBadge note={module.sensorNote} />}
      </div>
      {module.alternatives && module.alternatives.length > 0 && (
        <div className="bom-inline-variants">
          {module.alternatives.map((alt) => (
            <VariantCard
              key={alt.name}
              alternative={alt}
              confidence={parentConfidence}
              functionalRole={module.name}
              detail={module.sensorNote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export interface BOMCategoryRowProps {
  subsystem: BOML4Subsystem;
  /** Display index for the L6.N label (1-based) */
  rowIndex: number;
}

export default function BOMCategoryRow({ subsystem, rowIndex }: BOMCategoryRowProps) {
  const [open, setOpen] = useState(false);

  const hasModules = subsystem.modules && subsystem.modules.length > 0;
  const hasAlternatives = subsystem.alternatives && subsystem.alternatives.length > 0;
  // Use the real L4 ID from the markdown (e.g. "L4-A"); fall back to index only if missing.
  const idLabel = subsystem.id?.startsWith("L4") ? subsystem.id : `L4.${rowIndex}`;

  return (
    <div
      className="bom-category-row"
      style={
        subsystem.isMarquardtAnchor
          ? { borderLeft: "2px solid rgba(253,255,152,0.4)" }
          : undefined
      }
    >
      {/* ── Header row ── */}
      <div
        className="bom-category-row__header"
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        {/* Caret cell */}
        <div
          className={`bom-category-row__caret${open ? " is-open" : ""}`}
          aria-hidden="true"
        >
          <ChevronIcon open={open} />
        </div>

        {/* L6.N identifier cell */}
        <div className="bom-category-row__id-cell">
          <span className="bom-category-row__id">{idLabel}</span>
        </div>

        {/* Label + badge + variant chips */}
        <div className="bom-category-row__text-cell">
          <div className="bom-category-row__label-row">
            <span className="bom-category-row__label">{subsystem.name}</span>
            <ConfidenceTierBadge confidence={subsystem.confidence} />
            {subsystem.isMarquardtAnchor && <MarquardtBadge />}
            {subsystem.costSharePct != null && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-gray-dark)",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 3,
                  padding: "2px 6px",
                  whiteSpace: "nowrap",
                }}
              >
                ~{subsystem.costSharePct}% BOM cost
              </span>
            )}
          </div>

          {/* Top-level alternatives */}
          {hasAlternatives && (
            <div className="bom-inline-variants">
              {subsystem.alternatives.map((alt) => (
                <VariantCard
                  key={alt.name}
                  alternative={alt}
                  confidence={subsystem.confidence}
                  functionalRole={subsystem.keyDesignChoice}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Expanded module detail ── */}
      {open && hasModules && (
        <div className="bom-category-row__detail">
          <div className="bom-category-row__detail-label">
            L3 Modules — {subsystem.name}
          </div>
          {subsystem.modules.map((mod) => (
            <ModuleRow
              key={mod.id}
              module={mod}
              parentConfidence={subsystem.confidence}
            />
          ))}
          {subsystem.keyDesignChoice && (
            <div style={{ marginTop: 10 }}>
              <div className="bom-attr-chip">
                <span className="bom-attr-chip__key">Key design choice:</span>
                {subsystem.keyDesignChoice}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Expanded no-module fallback ── */}
      {open && !hasModules && (
        <div className="bom-category-row__detail">
          <p className="bom-category-row__detail-text" style={{ color: "var(--text-gray)" }}>
            No sub-module breakdown available for this subsystem.
          </p>
        </div>
      )}
    </div>
  );
}
