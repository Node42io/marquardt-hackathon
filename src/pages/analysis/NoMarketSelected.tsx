/**
 * NoMarketSelected — shown at /analysis when no :marketSlug is in the URL.
 *
 * Renders a grid of market cards sourced from ranking.json (sorted by rank),
 * each linking to /analysis/<slug>/jtbd.
 */

import { Link } from "react-router-dom";
import { ranking, marketsIndex } from "@/data";

const REC_CLASS: Record<string, string> = {
  pursue: "badge badge--strong",
  investigate: "badge badge--moderate",
  defer: "badge badge--weak",
  "no-go": "badge badge--weak",
};

function recBadgeClass(rec: string) {
  return REC_CLASS[rec] ?? "badge badge--neutral";
}

export default function NoMarketSelected() {
  // Build a quick slug → indexEntry map for NAICS cross-ref
  const indexBySlug = Object.fromEntries(
    marketsIndex.map((m) => [m.slug, m])
  );

  // Sort ranked markets by rank ascending; include all (reference too, at bottom)
  const ranked = [...ranking.rankedMarkets].sort((a, b) => a.rank - b.rank);

  return (
    <div style={{ padding: "48px 56px" }}>
      {/* Page header */}
      <div className="section-meta" style={{ marginBottom: 8 }}>
        <span>Step 06</span>
        <span className="sep"> / </span>
        <span>Ulwick ODI · Kano · Adner VN · JTBD</span>
      </div>
      <div className="md" style={{ marginBottom: 6 }}>
        <h1 className="section-title">New Market Analysis</h1>
      </div>
      <p
        className="section__sub"
        style={{ marginBottom: 40, maxWidth: 740 }}
      >
        {ranking.executiveSummary}
      </p>

      {/* Market picker grid */}
      <div className="market-grid">
        {ranked.map((rm) => {
          const idx = indexBySlug[rm.slug];
          const isRef = idx?.isReference ?? false;

          return (
            <Link
              key={rm.slug}
              to={`/analysis/${rm.slug}/jtbd`}
              className="market-card"
              style={isRef ? { opacity: 0.55 } : undefined}
            >
              {/* Top row: rank + badge */}
              <div className="market-card__top">
                <span className="market-card__priority">
                  {isRef ? "Reference" : `Rank ${rm.rank}`}
                </span>
                <span className={recBadgeClass(rm.recommendation)}>
                  {rm.recommendation}
                </span>
              </div>

              {/* Title */}
              <div className="market-card__title">{rm.marketName}</div>

              {/* NAICS — plain span to avoid nested <a> inside <Link> */}
              <div className="market-card__tam">
                <span
                  className="clickable-code"
                  style={{ pointerEvents: "none", cursor: "default" }}
                >
                  NAICS {rm.naicsCode}
                </span>
              </div>

              {/* Composite score */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--accent-yellow)",
                  }}
                >
                  {rm.scores.composite != null ? rm.scores.composite.toFixed(2) : "—"}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-gray-dark)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Composite
                </span>
              </div>

              {/* Rationale */}
              <p className="market-card__headline">{rm.rationale}</p>

              {/* CTA */}
              <div className="market-card__cta">Explore analysis</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
