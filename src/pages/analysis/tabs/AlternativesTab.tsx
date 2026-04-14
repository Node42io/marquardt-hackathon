/**
 * AlternativesTab — competing technologies and alternative solutions analysis.
 *
 * Renders the alternatives data from src/data/markets/{slug}/alternatives.json.
 * Shape: { name: string, unspsc: string, tradeoffs: string }[]
 *
 * This tab renders the ACTUAL data shape from the JTBD alternatives table
 * (§2.4 Alternatives — columns: # | Alternative | UNSPSC | Inherent Trade-Offs).
 * It does NOT cast to TechCardData — that richer shape belongs to
 * HomeMarketCompetition's Competing Technologies section.
 *
 * TODO items honoured:
 *  - Item 38: Tab has full context — opens with ExecutiveSummary explaining
 *    what an "alternative" is and why it matters (displacement difficulty,
 *    switching cost, pricing pressure).
 *  - Item 41: Plain-language labels ("Competing Technologies / Alternatives").
 */

import { getMarket } from "@/data";

import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceFootnote from "@/components/SourceFootnote";
import SectionAnchor from "@/components/SectionAnchor";
import ClickableCode from "@/components/ClickableCode";

import AlternativeCard from "./alternatives/AlternativeCard";

/* ─── Main component ─────────────────────────────────────────────────────── */

export default function AlternativesTab({ marketSlug }: { marketSlug: string }) {
  const bundle = getMarket(marketSlug);
  const data = bundle.alternatives;

  const { marketName, naicsCode, alternatives = [] } = data;
  const hasData = alternatives.length > 0;

  return (
    <div className="section">
      {/* Eyebrow */}
      <div className="section__eyebrow">
        Competitive Landscape · Alternatives &amp; Competing Technologies · {marketName}
      </div>

      {/* Item 41: plain-language title */}
      <h2 className="section__title">Competing Technologies</h2>

      {/* Item 38: Executive summary with full context */}
      <ExecutiveSummary kicker="Alternatives / Executive Summary">
        <p className="answer">
          This tab maps the <strong>competing technologies</strong> that customers in{" "}
          <strong>{marketName}</strong>
          {naicsCode && (
            <>
              {" "}(<ClickableCode kind="naics" code={naicsCode} />)
            </>
          )}{" "}
          could use <em>instead of</em> Marquardt's ultrasonic flow sensor to fulfil their
          flow-measurement need. An "alternative" here means any technology, workaround, or
          existing installed solution that satisfies the same functional requirement — whether
          or not it is technically equivalent.
          <SourceFootnote sourceIds={["HOME-S19", "HOME-S20"]} />
        </p>
        <p className="answer">
          The reader learns: <strong>how hard is displacement?</strong> — i.e., what are the
          inherent trade-offs of each alternative and how does Marquardt's ultrasonic approach
          compare? This matters because displacement difficulty directly sets the sales cycle
          length, the required value-proposition strength, and the expected pricing pressure
          in the target market.
        </p>
      </ExecutiveSummary>

      {/* ── Alternative cards ────────────────────────────────────────────── */}
      {!hasData ? (
        <p style={{ color: "var(--text-gray)", fontStyle: "italic", fontSize: 13 }}>
          Data pending — alternative technology data for {marketName} has not yet been generated.
        </p>
      ) : (
        <div>
          <SectionAnchor id={`alternatives-techs-${marketSlug}`}>
            <h3
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--text-gray)",
                marginBottom: 16,
                marginTop: 8,
              }}
            >
              Competing Technologies in {marketName} ({alternatives.length})
            </h3>
          </SectionAnchor>

          <div className="alternatives-grid">
            {alternatives.map((alt, i) => (
              <AlternativeCard
                key={alt.name}
                alternative={alt}
                rank={i + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
