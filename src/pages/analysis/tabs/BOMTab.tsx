/**
 * BOMTab — Bill of Materials tab component.
 *
 * Implements the Figma design (node 3950:3696):
 *   - Executive summary explaining BOM and its relevance to market entry
 *   - Output type chip row (product variant selector)
 *   - L6.N rows (L4 subsystems) with confidence badges and variant chips
 *   - Expandable L3 module detail per subsystem
 *   - Marquardt anchor highlighting (yellow border + badge)
 *   - Data-pending placeholder for markets without BOM markdown
 *   - Source footnote + source list
 *
 * Data flows: bom.json → getBOM(slug) → component (no hand-authored data in code).
 */

import { useState } from "react";
import { getMarket } from "@/data";
import type { BOMData } from "@/types";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SectionAnchor from "@/components/SectionAnchor";
import SourceList from "@/components/SourceList";

import VariantChips from "./bom/VariantChips";
import BOMCategoryRow from "./bom/BOMCategoryRow";
import "./bom/bom.css";

/* BOM source IDs — registered in src/data/sources.json */
const BOM_SOURCE_IDS = [
  "BOM-S01", "BOM-S02", "BOM-S03", "BOM-S04",
  "BOM-S05", "BOM-S06", "BOM-S07",
];

/* ── Pending placeholder ─────────────────────────────────────────────────── */
function BOMPendingPlaceholder({ bomData }: { bomData: BOMData }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 12,
        padding: "40px 32px",
        textAlign: "center",
        marginTop: 24,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--text-gray-dark)",
          marginBottom: 12,
        }}
      >
        BOM Data Pending
      </div>
      <p style={{ fontSize: 14, color: "var(--text-gray)", lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
        A Bill of Materials breakdown has not yet been generated for{" "}
        <strong style={{ color: "var(--text-white)" }}>{bomData.marketName}</strong>
        . A component breakdown has not yet been generated for this market.
      </p>
      {bomData.sensorNote && (
        <p
          style={{
            marginTop: 16,
            color: "var(--text-gray-light)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 6,
            padding: "10px 16px",
            maxWidth: 560,
            margin: "16px auto 0",
            lineHeight: 1.55,
          }}
        >
          <span style={{ color: "var(--text-gray-dark)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Sensor note:{" "}
          </span>
          {bomData.sensorNote}
        </p>
      )}
    </div>
  );
}

/* ── Sensor note callout ─────────────────────────────────────────────────── */
function SensorNoteCallout({ note }: { note: string }) {
  if (!note) return null;
  return (
    <div
      style={{
        background: "rgba(253,255,152,0.04)",
        border: "1px solid rgba(253,255,152,0.15)",
        borderLeft: "3px solid rgba(253,255,152,0.5)",
        borderRadius: 8,
        padding: "12px 16px",
        marginBottom: 20,
        fontSize: 13,
        color: "var(--text-white)",
        lineHeight: 1.55,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "rgba(253,255,152,0.65)",
          display: "block",
          marginBottom: 5,
        }}
      >
        Sensor position note
      </span>
      {note}
    </div>
  );
}

/* ── Output type detail callout ──────────────────────────────────────────── */
function OutputTypeDetail({ outputTypes, selectedId }: { outputTypes: BOMData["outputTypes"]; selectedId: string | null }) {
  const selected = outputTypes.find((ot) => ot.id === selectedId);
  if (!selected) return null;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        padding: "10px 16px",
        marginBottom: 16,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--text-gray-dark)",
            display: "block",
            marginBottom: 3,
          }}
        >
          {selected.id} · {selected.sensorFit} fit
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-white)" }}>
          {selected.name}
        </span>
      </div>
      {selected.notes && (
        <span style={{ fontSize: 12, color: "var(--text-gray-light)", lineHeight: 1.45, paddingTop: 14 }}>
          {selected.notes}
        </span>
      )}
    </div>
  );
}

/* ── Sources ─────────────────────────────────────────────────────────────── */
// Source URLs and labels moved to src/data/sources.json (BOM-S01 through BOM-S07).
// Rendered via SourceList component using the BOM_SOURCE_IDS constant above.
function BOMSourceList() {
  return <SourceList sourceIds={BOM_SOURCE_IDS} title="Sources — Bill of Materials" />;
}

/* ── Main tab component ──────────────────────────────────────────────────── */
export default function BOMTab({ marketSlug }: { marketSlug: string }) {
  let bomData: BOMData | null = null;
  let marketName = marketSlug;
  let naicsCode = "";

  try {
    const bundle = getMarket(marketSlug);
    bomData = bundle.bom;
    marketName = bomData.marketName;
    naicsCode = bomData.naicsCode;
  } catch {
    return (
      <div className="section">
        <div className="section__eyebrow">Bill of Materials · {marketSlug}</div>
        <h2 className="section__title">Bill of Materials</h2>
        <p className="section__sub" style={{ color: "var(--status-low)" }}>
          No BOM data found for market &ldquo;{marketSlug}&rdquo;.
        </p>
      </div>
    );
  }

  // Determine default selected output type
  const primaryOTs = bomData.outputTypes.filter((ot) => ot.sensorFit === "primary");
  const defaultOTId = primaryOTs.length > 0 ? primaryOTs[0].id : (bomData.outputTypes[0]?.id ?? null);

  const [selectedOTId, setSelectedOTId] = useState<string | null>(defaultOTId);

  return (
    <div className="section">
      {/* ── Section eyebrow ── */}
      <div className="section__eyebrow">
        Bill of Materials · NAICS {naicsCode}
      </div>

      <h2 className="section__title">Bill of Materials</h2>

      <p className="section__sub">
        {marketName}
      </p>

      {/* ── Executive summary ── */}
      <ExecutiveSummary kicker="What you are reading" title="Bill of Materials Analysis">
        <p className="answer">
          A Bill of Materials (BOM) is the complete hierarchical breakdown of every component,
          module, and sub-system that makes up the final product or equipment in this market.
          Reading the BOM for market entry reveals <strong>where the Marquardt sensor fits
          in the physical product architecture</strong> — whether it is a critical measurement
          component inside the OEM's assembly (e.g., inside a heat pump hydronic circuit) or
          a piece of process equipment that monitors how the product is manufactured (e.g.,
          glycol cooling in a brewery).
        </p>
        <p className="answer" style={{ marginTop: 12 }}>
          Each row below is a <strong>L4 subsystem</strong> (the top-level functional block — L4 = major subsystem, L3 = module, L2 = assembly, L1 = part). Clicking a row expands the
          L3 modules. The variant chips in each row show which technologies compete for that
          slot and their current market-share percentages. Rows with a{" "}
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase",
              color: "var(--accent-yellow)",
              background: "rgba(253,255,152,0.1)",
              border: "1px solid rgba(253,255,152,0.25)",
              borderRadius: 3,
              padding: "1px 5px",
              letterSpacing: "0.06em",
            }}
          >
            Marquardt anchor
          </span>{" "}
          badge are the subsystems or modules where the DN20 sensor competes directly.
        </p>
      </ExecutiveSummary>

      {/* ── Data pending placeholder ── */}
      {bomData.dataPending ? (
        <BOMPendingPlaceholder bomData={bomData} />
      ) : (
        <>
          {/* ── Sensor note ── */}
          <SensorNoteCallout note={bomData.sensorNote} />

          {/* ── Output type filter row ── */}
          {bomData.outputTypes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div className="bom-filter-label">Select a Product Output Type to filter context:</div>
              <VariantChips
                outputTypes={bomData.outputTypes}
                selectedId={selectedOTId}
                onSelect={setSelectedOTId}
              />
              <OutputTypeDetail outputTypes={bomData.outputTypes} selectedId={selectedOTId} />
            </div>
          )}

          {/* ── L4 subsystem rows ── */}
          <SectionAnchor
            id="bom-subsystems"
            kicker="Product Decomposition L4"
            title="Subsystem Breakdown with Competitive Alternatives"
          />

          <ExecutiveSummary kicker="How to read this table">
            <p className="answer">
              Each row is a top-level subsystem (L4 = major subsystem) of the product. The percentage shown
              next to the identifier is the approximate BOM cost share. The colored chips
              show competing technologies for that subsystem — <strong>green = high
              confidence data</strong>, amber = medium confidence, red = low confidence /
              analyst estimate. Click any row to see L3 module-level detail and the specific
              BOM position where Marquardt competes.
            </p>
          </ExecutiveSummary>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
            {bomData.l4Subsystems.map((subsystem, idx) => (
              <BOMCategoryRow
                key={subsystem.id}
                subsystem={subsystem}
                rowIndex={idx + 1}
              />
            ))}
          </div>

          {/* ── Sources ── */}
          <BOMSourceList />
        </>
      )}
    </div>
  );
}
