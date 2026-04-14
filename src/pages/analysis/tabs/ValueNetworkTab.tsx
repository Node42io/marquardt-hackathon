/**
 * ValueNetworkTab — Value Network & BOM analysis for a given market.
 *
 * Implements TODO items:
 *   10  — Legend at top of VN diagram
 *   11  — Per-unit 2-sentence description in detail panel
 *   19  — "Position in General Value Network" heading + ExecutiveSummary
 *   20  — Method explanation before follow-up analysis
 *   39  — SourceList at chapter end
 *   40/41 — Opening ExecutiveSummary with plain-language framing
 */

import { getMarket } from "@/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SectionAnchor from "@/components/SectionAnchor";
import type { Source } from "@/types";

import VNDiagram from "./valuenetwork/VNDiagram";

/* ── Helpers ────────────────────────────────────────────────────────────── */

/**
 * Register VN sources locally (they are in the market JSON, not the global
 * sources.json registry). Returns a formatted SourceList-compatible ID array
 * and renders a standalone source list.
 */
function LocalSourceList({ sources }: { sources: Source[] }) {
  if (!sources || sources.length === 0) return null;
  const validSources = sources.filter(
    (s) => s.label && s.label !== "--" && s.prefixedId
  );
  if (validSources.length === 0) return null;

  return (
    <div className="source-list">
      <div className="source-list__title">Sources — Value Network</div>
      <ol>
        {validSources.map((src, i) => (
          <li key={src.prefixedId ?? src.id}>
            <span className="num">{i + 1}.</span>
            <div>
              {src.url ? (
                <a href={src.url} target="_blank" rel="noopener noreferrer">
                  {src.label}
                </a>
              ) : (
                <span style={{ color: "var(--text-gray)" }}>{src.label}</span>
              )}
              {!src.url && (
                <span className="pending" style={{ display: "block" }}>
                  source pending
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── Architecture distance label ─────────────────────────────────────────── */
function archDistanceLabel(dist: number): string {
  if (dist <= 1) return "very close — direct application";
  if (dist <= 2) return "close — minor adaptation";
  if (dist <= 3) return "moderate — process similarity";
  if (dist <= 5) return "moderate-to-distant — cross-sector";
  return "distant — significant adaptation required";
}

/* ── Tab component ──────────────────────────────────────────────────────── */
export default function ValueNetworkTab({ marketSlug }: { marketSlug: string }) {
  // Graceful data load
  let vnData = null;
  try {
    const bundle = getMarket(marketSlug);
    vnData = bundle.valueNetwork;
  } catch {
    return (
      <div className="section">
        <div className="section__eyebrow">Value Network · {marketSlug}</div>
        <h2 className="section__title">Value Network</h2>
        <p className="section__sub" style={{ color: "var(--status-low)" }}>
          No value network data found for market "{marketSlug}".
        </p>
      </div>
    );
  }

  const archDist = vnData.architectureDistance ?? 4;
  const hasL6 = vnData.l6Systems && vnData.l6Systems.length > 0;
  const hasUnits = vnData.vnUnits && vnData.vnUnits.length > 0;

  return (
    <div className="section">
      {/* ── Section eyebrow ── */}
      <div className="section__eyebrow">
        Value Network · NAICS {vnData.naicsCode}
      </div>

      <h2 className="section__title">Position in the Value Network</h2>

      <p className="section__sub">
        {vnData.marketName} — {vnData.hierarchy}
      </p>

      {/* ── TODO 40/41: Opening executive summary ── */}
      <ExecutiveSummary
        kicker="What you are reading"
        title="Value Network Analysis"
      >
        <p className="answer">
          This section maps where the Marquardt Ultrasonic Flow Sensor fits within the{" "}
          <strong>{vnData.marketName}</strong> value network. Value-network positioning
          directly informs sales-channel strategy: it tells the sales team which buyers
          to approach first, which systems integrators control purchasing decisions,
          and where Marquardt can capture margin rather than ceding it to a channel
          partner. The analysis is based on NAICS code{" "}
          <strong>{vnData.naicsCode}</strong> and an architecture distance score of{" "}
          <strong>{archDist}</strong> ({archDistanceLabel(archDist)}).
        </p>
        <p className="answer" style={{ marginTop: 12 }}>
          The tab is structured in two parts: (1) position in the general value
          network, and (2) the detailed process-level map with Marquardt's anchor
          position. The sensor's Bill of Materials is available on the separate{" "}
          <strong>Bill of Materials</strong> tab.
        </p>
      </ExecutiveSummary>

      {/* ── TODO 19: "Position in General Value Network" heading ── */}
      <SectionAnchor
        id="vn-position"
        kicker="Step 02c"
        title="Position in General Value Network"
      />

      {/* TODO 19: Short description of what a value network is */}
      <ExecutiveSummary kicker="What is a value network?">
        <p className="answer">
          <strong>What is a value network?</strong> A value network is the chain of
          organizations, process steps, and enabling systems that together deliver a
          finished product or service to an end user. In a manufacturing context it
          spans raw-material suppliers, equipment vendors, integrators, operators, and
          distributors.
        </p>
        <p className="answer" style={{ marginTop: 12 }}>
          In this section you are seeing the <strong>{vnData.marketName}</strong>{" "}
          production chain decomposed to the L6 (sub-system) and L5 (process-unit)
          levels. The highlighted rows show where the Marquardt sensor fits as a primary,
          secondary, or tertiary measurement point. Click any row to read the functional
          job statement and a plain-language description of that process unit.
        </p>
      </ExecutiveSummary>

      {/* ── Market context stat row ── */}
      {(vnData.marketSize || vnData.coreJobStatement) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 12,
            marginBottom: 28,
          }}
        >
          {vnData.marketSize && (
            <div className="stat-tile">
              <div className="stat-tile__label">Market Size</div>
              <div
                className="stat-tile__value"
                style={{ fontSize: 16, lineHeight: 1.35 }}
              >
                {vnData.marketSize.split(";")[0].trim()}
              </div>
            </div>
          )}
          <div className="stat-tile">
            <div className="stat-tile__label">Architecture Distance</div>
            <div className="stat-tile__value">
              <span className="accent">{archDist}</span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-gray)",
                  display: "block",
                  marginTop: 4,
                  fontWeight: 400,
                }}
              >
                {archDistanceLabel(archDist)}
              </span>
            </div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__label">L6 Systems</div>
            <div className="stat-tile__value">
              <span className="accent">{vnData.l6Systems?.length ?? 0}</span>
            </div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__label">L5 Process Units</div>
            <div className="stat-tile__value">
              <span className="accent">{vnData.vnUnits?.length ?? 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Core job statement */}
      {vnData.coreJobStatement && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderLeft: "3px solid var(--accent-yellow)",
            borderRadius: 8,
            padding: "14px 18px",
            marginBottom: 24,
            fontSize: 14,
            color: "var(--text-white)",
            lineHeight: 1.6,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray-dark)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Core Job Statement
          </span>
          {vnData.coreJobStatement}
        </div>
      )}

      {/* Output types */}
      {vnData.outputTypes && vnData.outputTypes.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray-dark)",
              marginBottom: 10,
            }}
          >
            Output Types / Segments
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {vnData.outputTypes.map((ot) => (
              <span
                key={ot}
                style={{
                  padding: "5px 12px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 20,
                  fontSize: 12,
                  color: "var(--text-gray-light)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {ot}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── TODO 20: Method explanation ── */}
      <SectionAnchor
        id="vn-method"
        kicker="Method"
        title="How This Analysis Was Conducted"
      />

      <ExecutiveSummary kicker="Analysis method">
        <p className="answer">
          <strong>Why these steps are listed.</strong> The value network is decomposed
          hierarchically: L7 is the full ecosystem, L6 are functional sub-systems
          (e.g., "Mechanical Filtration" or "Gas Management"), and L5 are the specific
          process units within each sub-system (e.g., "Drum Filter" or "UV Sterilizer").
          This decomposition maps all co-innovation dependencies before committing to a market entry
          strategy.
        </p>
        <p className="answer" style={{ marginTop: 12 }}>
          <strong>What the steps mean.</strong> Each L5 unit represents a discrete
          buying occasion or integration point. The Marquardt sensor must fit into at
          least one L5 unit as the measurement device of record. The "PRIMARY" badge
          marks the L5 unit where the sensor's functional promise (measuring flow rate
          and temperature of liquids with no moving parts) maps most directly. Secondary
          and tertiary positions are adjacent buying opportunities once the primary
          position is established.
        </p>
        <p className="answer" style={{ marginTop: 12 }}>
          <strong>How the following analysis will be conducted.</strong> The diagram
          below is interactive — click any L6 row to expand its L5 children, and click
          any row to read the functional job statement and a plain-language description.
          The goal is to identify the shortest path from the sensor's current positioning
          to a volume-production relationship with a systems integrator or OEM in this
          market.
        </p>
      </ExecutiveSummary>

      {/* ── VN Diagram ── */}
      <SectionAnchor
        id="vn-diagram"
        kicker="Process Map"
        title={`${vnData.marketName} — Process Value Network`}
      />

      {hasL6 && hasUnits ? (
        <div style={{ marginTop: 16 }}>
          <VNDiagram data={vnData} />
        </div>
      ) : (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12,
            padding: "40px 32px",
            textAlign: "center",
            color: "var(--text-gray)",
            marginTop: 16,
          }}
        >
          <p>Value network diagram data not yet available for this market.</p>
        </div>
      )}

      {/* ── Strategic position note ── */}
      {vnData.marquardtPosition && (
        <div
          style={{
            marginTop: 24,
            padding: "14px 18px",
            background: "rgba(253,255,152,0.04)",
            border: "1px solid rgba(253,255,152,0.2)",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--text-white)",
            lineHeight: 1.6,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--accent-yellow)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Marquardt Strategic Position
          </span>
          {vnData.marquardtPosition}
        </div>
      )}

      {/* ── TODO 39: Sources ── */}
      <LocalSourceList sources={vnData.sources ?? []} />
    </div>
  );
}
