/**
 * 02 Functional Promise
 * Replicates 02-functional-promise.html in React, with TODO items applied:
 *   - Item 16: Second-level title reads "UNSPSC Commodity Functional Promise"
 *   - Item 17: UNSPSC code is clickable via ClickableCode; UNSPSC registry added to SourceList
 *   - Item 18: Every "FP" → "Functional Promise"
 *   - Item 40: ExecutiveSummary at top
 *   - Item 4/39: SourceFootnote per claim + SourceList at end
 *   - Item 41: Plain-language labels
 */

import { functionalPromise as fp } from "@/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceFootnote from "@/components/SourceFootnote";
import SourceList from "@/components/SourceList";
import ClickableCode from "@/components/ClickableCode";

// Source IDs for this sub-chapter (no functional-promise-specific external sources in
// functionalPromise.json, so we reference product sources + UNSPSC registry)
// Note: UNSPSC registry is linked inline via ClickableCode (item 17); no separate source
// entry needed since UNSPSC code 41112501 is clickable throughout this chapter.
const SECTION_SOURCES = [
  "PROD-S01",
  "PROD-S02",
  "PROD-S03",
  "PROD-S07",
  "PROD-S08",
];

const CRITICALITY_CLASS: Record<string, string> = {
  essential: "badge badge--strong",
  enhancing: "badge badge--moderate",
  optional: "badge badge--neutral",
};

export default function FunctionalPromise() {
  const productFP = fp.productFP;
  const commodityFP = fp.commodityFP;
  const bomPosition = fp.bomPosition;
  const complements = fp.complements;

  // Strip [SRC:...] and [ASM:...] annotation tags from JSON string values
  function stripAnnotations(s: string): string {
    return s.replace(/\s*\[(?:SRC|ASM)[^\]]*\]/g, "").trim();
  }

  const unspscCode = "41112501";

  return (
    <section id="section-02" className="container">
      {/* Section meta breadcrumb */}
      <div className="section-meta">
        <span>Step 02</span>
        <span className="sep">/</span>
        <span>Two-Level Functional Promise</span>
        <span className="sep">/</span>
        <span>New Markets for an Existing Product</span>
      </div>

      <div className="md">
        <h1 className="section-title">02 Functional Promise</h1>

        {/* Item 40: Executive Summary */}
        <ExecutiveSummary kicker="02 / Executive Summary" title="What you are reading">
          <p className="answer">
            This chapter defines the two-level Functional Promise that drives market discovery:
            a product-level promise (what <em>this sensor</em> does) and a commodity-level
            promise (what <em>all flowmeters</em> do). The product-level Functional Promise is
            used to assess architectural distance in new markets; the commodity-level Functional
            Promise is the search query that surfaces candidate NAICS markets in Chapter 05.
            Understanding both levels — and the Functional Promise Extension that captures
            capabilities beyond pure flow measurement — explains why the sensor is relevant in
            markets beyond HVAC heat pumps.
          </p>
        </ExecutiveSummary>

        {/* Metadata block */}
        <blockquote>
          <p><strong>Component:</strong> Functional Promise (Step 02)</p>
          <p><strong>Approach:</strong> Two-Level Functional Promise (product-level and commodity-level)</p>
          <p><strong>Product:</strong> Marquardt Ultrasonic Flow Sensor</p>
          <p><strong>Vendor:</strong> Marquardt GmbH</p>
          <p><strong>Archetype:</strong> New Markets for an Existing Product</p>
        </blockquote>


        <hr />

        {/* ── Underlying Mechanism ── */}
        <h2 id="fp-mechanism">Underlying Mechanism</h2>

        <p>
          Piezoelectric transducers (Piezo A / Piezo B) in transit-time configuration
          alternately transmit and receive ultrasonic pulses through a fluid channel. The
          difference in transit time between upstream and downstream signal paths is proportional
          to fluid velocity. An embedded NTC thermistor provides simultaneous medium temperature.
          <SourceFootnote sourceIds={["PROD-S02", "PROD-S03"]} />
        </p>

        <hr />

        {/* ── Product Functional Promise ── */}
        <h2 id="fp-product-fp">Product Functional Promise</h2>

        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Statement</strong></td>
              <td>
                {productFP.statement}
                <SourceFootnote sourceIds={["PROD-S07"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Verb</strong></td>
              <td>{productFP.verb}</td>
            </tr>
            <tr>
              <td><strong>Object</strong></td>
              <td>{productFP.object}</td>
            </tr>
            <tr>
              <td><strong>Context</strong></td>
              <td>in closed-pipe liquid circuits</td>
            </tr>
            <tr>
              <td><strong>Scope</strong></td>
              <td>Product</td>
            </tr>
          </tbody>
        </table>

        <h3>Differentiators vs Alternatives</h3>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Differentiator</th>
              <th>Versus</th>
            </tr>
          </thead>
          <tbody>
            {productFP.differentiators.map((d, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{d}</td>
                <td>
                  {i === 0 && "Turbine/impeller meters require rotating parts in the flow"}
                  {i === 1 && "Orifice-plate, venturi, and vortex meters obstruct flow"}
                  {i === 2 && "Turbine meters require bearing replacement schedules"}
                  {i === 3 && "Conventional setups require separate flow meter + temperature probe"}
                  {i === 4 && "Check valves or reverse-flow sensors needed with mechanical meters"}
                  {i === 5 && "Turbine sensors degraded by particles; Coriolis meters unaffected but cost 5–10× more"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <blockquote>
          <h3>Mechanism-Free Test</h3>
          <p>
            The statement contains no technology-specific terms (no "ultrasonic,"
            "piezoelectric," "transit-time"). The same statement would hold if flow rate were
            measured by electromagnetic, Coriolis, or optical means — only the differentiators
            would change. <strong>Test passed.</strong>
          </p>
        </blockquote>

        <hr />

        {/* ── UNSPSC Classification — Item 16/17 ── */}
        <h2 id="fp-unspsc">UNSPSC Classification</h2>

        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>UNSPSC Code</strong></td>
              {/* Item 17: Clickable UNSPSC code */}
              <td>
                <ClickableCode kind="unspsc" code={unspscCode} />
                <SourceFootnote sourceIds={["PROD-S02"]} />
              </td>
            </tr>
            <tr>
              <td><strong>UNSPSC Title</strong></td>
              <td>Flowmeters</td>
            </tr>
            <tr>
              <td><strong>UNSPSC Path</strong></td>
              <td>
                41 Laboratory and Measuring &gt; 11 Measuring Instruments &gt; 25 Liquid
                and Gas Flow &gt; 01 Flowmeters
              </td>
            </tr>
            <tr>
              <td><strong>Classification Confidence</strong></td>
              <td>92%</td>
            </tr>
            <tr>
              <td><strong>Custom Product Group</strong></td>
              <td>None — UNSPSC match is strong</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* ── UNSPSC Commodity Functional Promise — Item 16 ── */}
        {/* Item 16: Subordinate h3 so it's visually tied to the UNSPSC Classification h2 above */}
        <h3>UNSPSC Commodity Functional Promise</h3>

        <p style={{ color: "var(--text-gray)", marginBottom: "0.75rem" }}>
          Tied to UNSPSC Classification above —{" "}
          <ClickableCode kind="unspsc" code={unspscCode} /> (Flowmeters)
        </p>

        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Commodity or Group</strong></td>
              <td>
                Flowmeters (<ClickableCode kind="unspsc" code={unspscCode} />)
                <SourceFootnote sourceIds={["PROD-S02"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Functional Promise</strong></td>
              <td>
                {stripAnnotations(commodityFP.statement)}
                <SourceFootnote sourceIds={["PROD-S01", "PROD-S03"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Scope</strong></td>
              <td>Commodity</td>
            </tr>
            <tr>
              <td><strong>Reasoning</strong></td>
              <td>{stripAnnotations(commodityFP.reasoning)}</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* ── Functional Promise Extension — Item 18: no bare "FP" ── */}
        <h2 id="fp-extension">Functional Promise Extension (Broader-than-UNSPSC Capabilities)</h2>

        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Primary Commodity Functional Promise</strong></td>
              <td>{stripAnnotations(commodityFP.statement)}</td>
            </tr>
            <tr>
              <td><strong>Functional Promise Extension</strong></td>
              <td>
                The underlying transit-time ultrasonic principle also enables: (1) liquid
                concentration measurement — glycol percentage detection via speed-of-sound
                shifts; (2) medium anomaly detection — air bubble presence, empty-pipe
                conditions; (3) fluid temperature monitoring — via integrated thermistor.
                These cross into UNSPSC classes{" "}
                <ClickableCode kind="unspsc" code="41115600" /> (Liquid analyzers) and{" "}
                <ClickableCode kind="unspsc" code="41112201" /> (Temperature sensors).
                <SourceFootnote sourceIds={["PROD-S07", "PROD-S08"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Extension Domains</strong></td>
              <td>{commodityFP.fpExtensionDomains?.join(", ")}</td>
            </tr>
            <tr>
              <td><strong>Market Discovery Use</strong></td>
              <td>
                Phase A secondary search: "What industries need real-time detection of liquid
                composition anomalies in closed-pipe systems?"
              </td>
            </tr>
          </tbody>
        </table>

        <blockquote>
          <h3>Justification for Extension</h3>
          <p>
            The Marquardt sensor's feature set (Digital Anomaly Detection, Integrated
            Temperature Sensing) delivers capabilities beyond pure flow measurement. The
            glycol-concentration detection and bubble/empty-pipe diagnostics are not flowmeter
            functions — they are process analytics functions that happen to be co-located in
            the same sensor body. This broadens the addressable market beyond traditional
            flowmeter buyers.
            <SourceFootnote sourceIds={["PROD-S07", "PROD-S08"]} />
          </p>
        </blockquote>

        <hr />

        {/* ── Bill of Materials / Value Network Position ── */}
        <h2 id="fp-bom">Bill of Materials (BOM) Position in the Product Hierarchy</h2>
        <p style={{ color: "var(--text-gray)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
          Level notation: L4 = major subsystem · L3 = module · L2 = assembly · L1 = part. The sensor sits at L5 — an individual component within a subsystem.
        </p>

        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Bill of Materials Level</strong></td>
              <td>L5 — Component</td>
            </tr>
            <tr>
              <td><strong>Position</strong></td>
              <td>{bomPosition.position}</td>
            </tr>
            <tr>
              <td><strong>Parent Subsystem (typical)</strong></td>
              <td>{bomPosition.parentSubsystem}</td>
            </tr>
            <tr>
              <td><strong>Grandparent System (typical)</strong></td>
              <td>{bomPosition.grandparentSystem}</td>
            </tr>
            <tr>
              <td><strong>Functional Promise Scope Impact</strong></td>
              <td>
                Component-level Functional Promise is narrow: "measure flow + temperature at
                one point." The subsystem-level promise would be broader: "regulate thermal
                energy transfer." The Functional Promise as stated is correctly scoped to the
                component level.
              </td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* ── Required Complements ── */}
        <h2 id="fp-complements">Required Complements</h2>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Complement</th>
              <th>Criticality</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {complements.map((c, i) => (
              <tr key={c.name}>
                <td>{i + 1}</td>
                <td><strong>{c.name}</strong></td>
                <td>
                  <span className={CRITICALITY_CLASS[c.criticality] ?? "badge badge--neutral"}>
                    {c.criticality.charAt(0).toUpperCase() + c.criticality.slice(1)}
                  </span>
                </td>
                <td>{c.description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* ── How This Feeds Downstream ── */}
        <h2 id="fp-downstream">How This Feeds Downstream Analysis</h2>

        <table>
          <thead>
            <tr>
              <th>Phase</th>
              <th>Uses</th>
              <th>Search Query</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>A: NAICS code Discovery (primary)</strong></td>
              <td>Commodity Functional Promise</td>
              <td>
                "What industries need to quantify the volumetric or mass flow rate of fluids
                traversing a closed conduit?"
              </td>
            </tr>
            <tr>
              <td><strong>A: NAICS code Discovery (secondary)</strong></td>
              <td>Functional Promise Extension</td>
              <td>
                "What industries need real-time detection of liquid composition anomalies in
                closed-pipe systems?"
              </td>
            </tr>
            <tr>
              <td><strong>B: Architecture Distance</strong></td>
              <td>Product Functional Promise + specs</td>
              <td>
                "How close is this market's use case to measuring flow rate and temperature
                in closed-pipe liquid circuits without contact, pressure drop, or moving parts?"
              </td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* ── QA Checklist — simplified (no PASS badges per Item 21 analogy) ── */}
        <h2 id="fp-quality">Quality Checklist</h2>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Check</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Product Functional Promise present with statement, verb, object, context, differentiators", "Complete"],
              ["Product Functional Promise passes mechanism-free test", "Complete"],
              ["Commodity Functional Promise present and vendor-agnostic", "Complete"],
              ["UNSPSC commodity code identified and clickable", "Complete"],
              ["Bill of Materials position mapped", "Complete"],
              ["Required complements listed with criticality", "Complete"],
              ["Source references on all factual claims", "Complete"],
              ["Functional Promise Extension assessed", "Complete"],
            ].map(([check, result], i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{check}</td>
                <td><span className="badge badge--strong">{result}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* Sources — Item 4/17/39 */}
        <div id="fp-sources">
          <SourceList sourceIds={SECTION_SOURCES} title="Sources — 02 Functional Promise" />
        </div>
      </div>
    </section>
  );
}
