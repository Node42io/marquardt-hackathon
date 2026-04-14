/**
 * RankingTable — final composite-score ranking of all 8 markets.
 * Item 37: shows ALL markets, not just 6.
 */

import { Link } from "react-router-dom";
import ClickableCode from "@/components/ClickableCode";
import SectionAnchor from "@/components/SectionAnchor";
import type { RankedMarket } from "./types";

interface Props {
  markets: RankedMarket[];
}

const REC_BADGE: Record<string, string> = {
  pursue: "badge badge--strong",
  investigate: "badge badge--moderate",
  defer: "badge badge--neutral",
  "no-go": "badge badge--weak",
};

function scoreCell(val: number | null | undefined) {
  return (
    <td
      className="num"
      style={{ fontVariantNumeric: "tabular-nums", textAlign: "right", whiteSpace: "nowrap" }}
    >
      {val != null ? val.toFixed(2) : <span style={{ color: "var(--text-gray-dark)" }}>—</span>}
    </td>
  );
}

export default function RankingTable({ markets }: Props) {
  return (
    <section id="final-ranking" className="container">
      <SectionAnchor id="final-ranking" title="Final Ranking" />
      <div className="md">
        <p>
          All {markets.length} markets surviving the constraint filter are
          shown below. Scores run 0–10 per dimension; composite uses the
          6-factor weighted formula. Click any NAICS code to open its official
          registry entry. Click a market name to jump to its deep-dive
          rationale card.
        </p>

        <div style={{ overflowX: "auto" }}>
          <table style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>#</th>
                <th>Market</th>
                <th>NAICS</th>
                <th style={{ textAlign: "right" }}>ODI</th>
                <th style={{ textAlign: "right" }}>Fit</th>
                <th style={{ textAlign: "right" }}>Constr</th>
                <th style={{ textAlign: "right" }}>Cov</th>
                <th style={{ textAlign: "right" }}>VN</th>
                <th style={{ textAlign: "right" }}>Incum</th>
                <th style={{ textAlign: "right" }}>Composite</th>
                <th>Rec</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((m) => (
                <tr key={m.slug}>
                  <td
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "var(--accent-yellow)",
                      textAlign: "center",
                    }}
                  >
                    {m.rank}
                  </td>
                  <td>
                    <Link
                      to={`/analysis/${m.slug}`}
                      style={{
                        fontWeight: 500,
                        color: "var(--text-white)",
                        borderBottom: "1px dashed rgba(255,255,255,0.15)",
                      }}
                    >
                      {m.marketName}
                    </Link>
                    {m.naicsCode === "41112501" && (
                      <small
                        style={{
                          display: "block",
                          color: "var(--text-gray)",
                          fontSize: 10,
                          fontFamily: "var(--font-mono)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginTop: 2,
                        }}
                      >
                        reference only
                      </small>
                    )}
                  </td>
                  <td>
                    <ClickableCode kind="naics" code={m.naicsCode} />
                  </td>
                  {scoreCell(m.scores.odi)}
                  {scoreCell(m.scores.featureFit)}
                  {scoreCell(m.scores.constraintCompatibility)}
                  {scoreCell(m.scores.jobCoverage)}
                  {scoreCell(m.scores.vnHierarchy)}
                  {scoreCell(m.scores.incumbentVulnerability)}
                  <td
                    className="num"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      textAlign: "right",
                      color: "var(--text-white)",
                    }}
                  >
                    {m.scores.composite != null ? m.scores.composite.toFixed(2) : "—"}
                  </td>
                  <td>
                    <span className={REC_BADGE[m.recommendation] ?? "badge badge--neutral"}>
                      {m.recommendation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p>
          All {markets.length} markets fall in the{" "}
          <strong>investigate</strong> band (5.0–7.5). None clear the 7.5
          pursue threshold — primarily due to uniformly moderate feature fit
          (avg ~5.1/10) and the sensor's deep-component value-network position.
        </p>
      </div>
    </section>
  );
}
