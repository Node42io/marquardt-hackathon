/**
 * 01 Product Decomposition
 * Replicates 01-product.html exactly in React, with TODO items applied:
 *   - Item 4/15/39: SourceFootnote per claim + SourceList at end
 *   - Item 40: ExecutiveSummary at top
 *   - Item 41: Plain-language labels
 *   - Item 9: NAICS/UNSPSC written out fully
 *   - ClickableCode for UNSPSC codes
 */

import { product } from "@/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceFootnote from "@/components/SourceFootnote";
import SourceList from "@/components/SourceList";
import ClickableCode from "@/components/ClickableCode";

// All source IDs used in this sub-chapter
const SECTION_SOURCES = [
  "PROD-S01",
  "PROD-S02",
  "PROD-S03",
  "PROD-S04",
  "PROD-S05",
  "PROD-S06",
  "PROD-S07",
  "PROD-S08",
];

const CATEGORY_CLASS: Record<string, string> = {
  performance: "badge badge--accent",
  integration: "badge badge--moderate",
  reliability: "badge badge--strong",
  usability: "badge badge--neutral",
  maintenance: "badge badge--neutral",
  safety: "badge badge--neutral",
};

const SEVERITY_CLASS: Record<string, string> = {
  hard: "badge badge--weak",
  soft: "badge badge--moderate",
};

function badgeClass(category: string): string {
  return CATEGORY_CLASS[category] ?? "badge badge--neutral";
}

export default function ProductDecomposition() {
  const technologyFeatures = product.features.filter((f) => f.scope === "technology");
  const vendorFeatures = product.features.filter((f) => f.scope === "vendor");

  return (
    <section id="section-01" className="container">
      {/* Section meta breadcrumb */}
      <div className="section-meta">
        <span>Step 01</span>
        <span className="sep">/</span>
        <span>Christensen Capability Abstraction</span>
        <span className="sep">/</span>
        <span>New Markets for an Existing Product</span>
      </div>

      <div className="md">
        <h1 className="section-title">01 Product Decomposition</h1>

        {/* Item 40: Executive Summary */}
        <ExecutiveSummary kicker="01 / Executive Summary" title="What you are reading">
          <p className="answer">
            This chapter decomposes the Marquardt Ultrasonic Flow Sensor into its underlying
            mechanism, functional promise, feature set, and physical specifications — following
            the Christensen Capability Abstraction framework. Understanding what the product
            actually <em>does</em> at each level of abstraction (mechanism → function → outcome)
            is the foundation for every market-entry decision that follows: it tells us which
            markets are structurally compatible, which features differentiate, and which
            constraints limit entry. The next chapter (02 Functional Promise) uses this
            decomposition to derive the two-level functional promise that drives market discovery.
          </p>
        </ExecutiveSummary>

        {/* Metadata block */}
        <blockquote>
          <p><strong>Component:</strong> Product Decomposition (Step 01)</p>
          <p><strong>Framework:</strong> Christensen Capability Abstraction</p>
          <p><strong>Product:</strong> {product.productName}</p>
          <p><strong>Vendor:</strong> {product.vendorName}</p>
          <p><strong>Archetype:</strong> New Markets for an Existing Product</p>
        </blockquote>

        <hr />

        {/* ── Christensen Abstraction ── */}
        <h2>Christensen Abstraction</h2>

        <table>
          <thead>
            <tr>
              <th>Level</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Mechanism</strong></td>
              <td>
                {product.christensen.mechanism}
                <SourceFootnote sourceIds={["PROD-S02", "PROD-S03"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Function</strong></td>
              <td>
                {product.christensen.function}
                <SourceFootnote sourceIds={["PROD-S01", "PROD-S07"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Outcome</strong></td>
              <td>
                {product.christensen.outcome}
                <SourceFootnote sourceIds={["PROD-S07", "PROD-S08"]} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Technology Classification ── */}
        <h2>Technology Classification</h2>

        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Technology Class</strong></td>
              <td>{product.technology.class}</td>
            </tr>
            <tr>
              <td><strong>Underlying Mechanism</strong></td>
              <td>
                {product.technology.underlyingMechanism}
                <SourceFootnote sourceIds={["PROD-S02"]} />
              </td>
            </tr>
            <tr>
              <td><strong>UNSPSC Code</strong></td>
              <td>
                <ClickableCode kind="unspsc" code={product.technology.unspscCode} />
              </td>
            </tr>
            <tr>
              <td><strong>UNSPSC Title</strong></td>
              <td>{product.technology.unspscTitle}</td>
            </tr>
            <tr>
              <td><strong>UNSPSC Path</strong></td>
              <td>{product.technology.unspscPath}</td>
            </tr>
          </tbody>
        </table>

        {/* ── Functional Promise ── */}
        <h2>Functional Promise</h2>

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
                {product.functionalPromise.statement}
                <SourceFootnote sourceIds={["PROD-S07"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Verb</strong></td>
              <td>{product.functionalPromise.verb}</td>
            </tr>
            <tr>
              <td><strong>Object</strong></td>
              <td>{product.functionalPromise.object}</td>
            </tr>
            <tr>
              <td><strong>Context</strong></td>
              <td>{product.functionalPromise.context}</td>
            </tr>
          </tbody>
        </table>

        <h3>Differentiators vs Alternative Flow Measurement Mechanisms</h3>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Differentiator</th>
            </tr>
          </thead>
          <tbody>
            {product.differentiators.map((d, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  {d}
                  <SourceFootnote
                    sourceIds={i < 2 ? ["PROD-S01", "PROD-S05"] : ["PROD-S03", "PROD-S07"]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Commodity-Level Functional Promise ── */}
        <h2>Commodity-Level Functional Promise</h2>

        <blockquote>
          <p>
            <strong>{product.commodityFunctionalPromise}</strong>
            <SourceFootnote sourceIds={["PROD-S01", "PROD-S02"]} />
          </p>
        </blockquote>

        <p>
          <em>
            All flowmeter technologies (ultrasonic, Coriolis, electromagnetic, turbine, vortex,
            orifice-plate, thermal) share the same fundamental function — measuring how much
            fluid passes through. The differences are in mechanism, accuracy, media
            compatibility, and installation constraints, not in function.
          </em>
          <SourceFootnote sourceIds={["PROD-S03", "PROD-S05"]} />
        </p>

        <hr />

        {/* ── Features ── */}
        <h2>Features</h2>

        <h3>Technology-Level Features (apply to all ultrasonic transit-time flowmeters)</h3>

        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Description</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {technologyFeatures.map((f) => (
              <tr key={f.name}>
                <td><strong>{f.name}</strong></td>
                <td>
                  {f.long}
                  <SourceFootnote sourceIds={["PROD-S02", "PROD-S03"]} />
                </td>
                <td><span className={badgeClass(f.category)}>{f.category}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Vendor-Level Features (Marquardt-specific)</h3>

        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Description</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {vendorFeatures.map((f) => (
              <tr key={f.name}>
                <td><strong>{f.name}</strong></td>
                <td>
                  {f.long}
                  <SourceFootnote sourceIds={["PROD-S07", "PROD-S08"]} />
                </td>
                <td><span className={badgeClass(f.category)}>{f.category}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* ── Specifications ── */}
        <h2>Specifications</h2>

        <table>
          <thead>
            <tr>
              <th>Specification</th>
              <th>Value</th>
              <th>Unit</th>
              <th>Test Condition</th>
            </tr>
          </thead>
          <tbody>
            {product.specifications.map((s) => (
              <tr key={s.name}>
                <td><strong>{s.name}</strong></td>
                <td>{s.value}</td>
                <td>
                  {s.unit === "C" ? "°C" :
                   s.unit === "uA" ? "μA" :
                   s.unit === "m3" ? "m³" :
                   s.unit === "3/4-pole" ? "—" :
                   s.unit}
                </td>
                <td>{s.testCondition ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* ── Constraints summary ── */}
        <h2>Key Product Constraints</h2>

        <table>
          <thead>
            <tr>
              <th>Constraint</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Description</th>
              <th>Threshold</th>
            </tr>
          </thead>
          <tbody>
            {product.constraints.map((c) => (
              <tr key={c.name}>
                <td><strong>{c.name}</strong></td>
                <td>{c.constraintType}</td>
                <td>
                  <span className={(c.severity && SEVERITY_CLASS[c.severity]) || "badge badge--neutral"}>
                    {c.severity ?? "—"}
                  </span>
                </td>
                <td>
                  {c.description}
                  <SourceFootnote sourceIds={["PROD-S04", "PROD-S06", "PROD-S07"]} />
                </td>
                <td>
                  {c.thresholdValue
                    ? `${c.thresholdValue}${c.thresholdUnit ? ` ${c.thresholdUnit}` : ""}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* ── UNSPSC Classification ── */}
        <h2>UNSPSC Classification</h2>

        <table>
          <thead>
            <tr>
              <th>UNSPSC Commodity Code</th>
              <th>Commodity Name</th>
              <th>Confidence</th>
              <th>Reasoning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>
                  <ClickableCode kind="unspsc" code="41112501" />
                </strong>
              </td>
              <td>Flowmeters</td>
              <td><span className="badge badge--strong">92%</span></td>
              <td>
                Ultrasonic flow sensors are a type of flowmeter. UNSPSC code 41112501 covers
                all flowmeter technologies including ultrasonic, electromagnetic, Coriolis,
                and turbine variants.
                <SourceFootnote sourceIds={["PROD-S02", "PROD-S03"]} />
              </td>
            </tr>
            <tr>
              <td>
                <ClickableCode kind="unspsc" code="41111927" />
              </td>
              <td>Ultrasonic sensors</td>
              <td><span className="badge badge--moderate">52%</span></td>
              <td>
                Matches the sensing technology (ultrasonic transduction) but describes the
                transducer type, not the product's primary function (flow measurement).
              </td>
            </tr>
            <tr>
              <td>
                <ClickableCode kind="unspsc" code="41112201" />
              </td>
              <td>Temperature sensors</td>
              <td><span className="badge badge--weak">35%</span></td>
              <td>
                The sensor includes integrated temperature measurement, but this is a secondary
                function. The primary product identity is a flowmeter.
              </td>
            </tr>
          </tbody>
        </table>

        <p>
          <strong>Selected:</strong>{" "}
          <ClickableCode kind="unspsc" code="41112501" /> — Flowmeters (highest confidence,
          validated)
        </p>

        <hr />

        {/* ── Validation Notes ── */}
        <h2>Validation Notes</h2>

        <p>
          The decomposition was cross-referenced against published research on ultrasonic
          transit-time flow measurement technology.
          <SourceFootnote sourceIds={["PROD-S01", "PROD-S02", "PROD-S03"]} />
          Key validation findings:
        </p>

        <ul>
          <li>
            <strong>Functional Promise</strong> confirmed solution-agnostic: does not mention
            "ultrasonic," "Marquardt," or "piezoelectric."
            <SourceFootnote sourceIds={["PROD-S07"]} />
          </li>
          <li>
            <strong>Feature scoping</strong> validated: technology-level features apply to
            any ultrasonic transit-time flowmeter; vendor-level features are Marquardt-specific.
            <SourceFootnote sourceIds={["PROD-S08"]} />
          </li>
          <li>
            <strong>Air bubble constraint</strong> added from published research — well-documented
            limitation of transit-time technology (&gt;2% vol degrades accuracy).
            <SourceFootnote sourceIds={["PROD-S04", "PROD-S05"]} />
          </li>
          <li>
            <strong>Minimum straight pipe run</strong> added from published research — standard
            installation constraint for inline flowmeters.
            <SourceFootnote sourceIds={["PROD-S03"]} />
          </li>
          <li>
            <strong>Temperature-dependent accuracy</strong> quantified: ~1.5% error
            uncompensated, ~0.2% with NTC compensation.
            <SourceFootnote sourceIds={["PROD-S04", "PROD-S06"]} />
          </li>
          <li>
            <strong>UNSPSC code 41112501 "Flowmeters"</strong> confirmed as the correct
            commodity classification — classifies by primary function, not sensing mechanism.
            <SourceFootnote sourceIds={["PROD-S02"]} />
          </li>
        </ul>

        <hr />

        {/* Sources list — Item 4/15/39 */}
        <SourceList sourceIds={SECTION_SOURCES} title="Sources — 01 Product Decomposition" />
      </div>
    </section>
  );
}
