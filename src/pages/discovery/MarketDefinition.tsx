/**
 * MarketDefinition — explains what NAICS is and why it's used.
 * Item 33 + 34 from TODO list.
 */

import SectionAnchor from "@/components/SectionAnchor";
import ClickableCode from "@/components/ClickableCode";
import SourceFootnote from "@/components/SourceFootnote";

export default function MarketDefinition() {
  return (
    <section id="market-definition" className="container">
      <SectionAnchor id="market-definition" title="Market Definition" />
      <div className="md">
        <p>
          Every candidate market in this report is defined by a{" "}
          <strong>NAICS code</strong> — a 6-digit industry classification number
          issued by the U.S. Census Bureau.{" "}
          <SourceFootnote sourceIds={["DISC-S08"]} /> NAICS stands for the
          North American Industry Classification System. It organizes all
          economic activity into a hierarchy: 2-digit sectors narrow to
          3-digit subsectors, then 4-digit industry groups, then 5-digit
          industries, and finally 6-digit national-level detail. For example,
          NAICS <ClickableCode kind="naics" code="333414" /> identifies
          "Heating Equipment (except Warm Air Furnaces) Manufacturing" as a
          distinct industry with its own workforce, revenue, and establishment
          count data.
        </p>

        <p>
          NAICS was chosen as the market taxonomy for this analysis for three
          reasons. First, it provides{" "}
          <strong>stable, legally defined industry boundaries</strong> —
          two analysts using the same code will be looking at the same set of
          establishments, eliminating definitional ambiguity. Second, NAICS
          codes unlock <strong>government-grade data</strong>: the U.S.
          Economic Census, County Business Patterns, and IBISWorld industry
          reports all index to NAICS, giving us comparable size, growth, and
          concentration metrics across all candidate markets.{" "}
          <SourceFootnote sourceIds={["DISC-S09"]} /> Third, using a frozen
          external taxonomy prevents the LLM research layer from silently
          redefining markets across pipeline runs — each code is a
          reproducible anchor.
        </p>

        <p>
          In the discovery phase (Phase 02a), the pipeline cross-classifies
          the product's UNSPSC commodity code{" "}
          <ClickableCode kind="unspsc" code="41112501" /> (Flowmeters) against
          NAICS industry descriptions to find all industries where flow
          measurement is a recognized need. This surfaces candidate markets
          beyond the product team's immediate frame of reference — including
          emergent adjacencies like aquaculture recirculating systems or data
          center liquid cooling.
        </p>

        <p>
          In this report, every NAICS code appears as a{" "}
          <ClickableCode kind="naics" code="238220" /> badge. Clicking any
          badge opens the official NAICS registry entry in a new tab, where
          you can verify the industry definition, see example establishments,
          and cross-reference with Census data.
        </p>
      </div>
    </section>
  );
}
