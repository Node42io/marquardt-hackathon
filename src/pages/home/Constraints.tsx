/**
 * 03 Constraints Analysis
 * Replicates 03-constraints.html in React, with TODO items applied:
 *   - Item 22: ExecutiveSummary at top
 *   - Item 21: Remove PASS section; replace with SourceList
 *   - Item 23: Per-constraint SourceFootnote
 *   - Item 24: Constraint titles visibly prominent (large h3)
 *   - Item 4/39: SourceFootnote per claim + SourceList at end
 *   - Item 40: ExecutiveSummary
 *   - Item 41: Plain-language labels
 */

import { constraints as constraintsData } from "@/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceFootnote from "@/components/SourceFootnote";
import SourceList from "@/components/SourceList";

// Source IDs for this sub-chapter
const SECTION_SOURCES = ["CONSTR-S01", "CONSTR-S02"];

const TYPE_CLASS: Record<string, string> = {
  physical: "badge badge--accent",
  chemical: "badge badge--moderate",
  operational: "badge badge--neutral",
  economic: "badge badge--strong",
  regulatory: "badge badge--weak",
  environmental: "badge badge--moderate",
};

const CONSTRAINT_SOURCES: Record<string, string[]> = {
  "Aqueous Media Requirement": ["CONSTR-S01", "CONSTR-S02"],
  "Maximum Medium Temperature": ["CONSTR-S01"],
  "Air Bubble / Void Fraction Limit": ["CONSTR-S01", "CONSTR-S02"],
  "Temperature-Dependent Accuracy": ["CONSTR-S01", "CONSTR-S02"],
  "Wetted Material Chemical Compatibility": ["CONSTR-S01"],
  "Pipe Full Condition Required": ["CONSTR-S01"],
  "Minimum Flow Rate Detection": ["CONSTR-S01", "CONSTR-S02"],
  "Maximum Operating Pressure": ["CONSTR-S01"],
  "Minimum Straight Pipe Run": ["CONSTR-S01", "CONSTR-S02"],
  "Life Endurance Ceiling": ["CONSTR-S01"],
  "No Explosive Atmosphere Certification": ["CONSTR-S01"],
  "Ambient Temperature Range": ["CONSTR-S01"],
};

// Map constraintType to group label
const GROUP_ORDER = ["physical", "chemical", "operational", "economic", "regulatory", "environmental"];

interface ConstraintEntry {
  name: string;
  constraintType: string;
  description: string;
  thresholdValue?: string | null;
  thresholdUnit?: string | null;
  isAbsolute: boolean;
  affectedMarketsHint?: string[];
}

function formatUnit(u: string): string {
  if (u === "degC") return "°C";
  if (u === "degC ambient") return "°C ambient";
  if (u === "m3") return "m³";
  return u;
}

function formatThreshold(c: ConstraintEntry): string {
  if (!c.thresholdValue) return "—";
  const unit = c.thresholdUnit ? ` ${formatUnit(c.thresholdUnit)}` : "";
  return `${c.thresholdValue}${unit}`;
}

function ConstraintCard({ c, index }: { c: ConstraintEntry; index: number }) {
  const srcIds = CONSTRAINT_SOURCES[c.name] ?? ["CONSTR-S01"];
  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      {/* Item 24: Constraint title is a large, prominent h3 */}
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
          color: "var(--text-white)",
          letterSpacing: "-0.01em",
        }}
      >
        C{index}: {c.name}
        {/* Item 23: Per-constraint SourceFootnote */}
        <SourceFootnote sourceIds={srcIds} />
      </h3>

      <table>
        <tbody>
          <tr>
            <td><strong>Type</strong></td>
            <td>
              <span className={TYPE_CLASS[c.constraintType] ?? "badge badge--neutral"}>
                {c.constraintType}
              </span>
            </td>
          </tr>
          <tr>
            <td><strong>Absolute barrier</strong></td>
            <td>
              {c.isAbsolute
                ? <strong>Yes — fundamental physical limit</strong>
                : "No — engineering solutions exist"}
            </td>
          </tr>
          <tr>
            <td><strong>Threshold</strong></td>
            <td>{formatThreshold(c)}</td>
          </tr>
          <tr>
            <td><strong>Description</strong></td>
            <td>{c.description}</td>
          </tr>
          {c.affectedMarketsHint && c.affectedMarketsHint.length > 0 && (
            <tr>
              <td><strong>Markets affected</strong></td>
              <td>{c.affectedMarketsHint.join(", ")}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function Constraints() {
  const all: ConstraintEntry[] = constraintsData.constraints as ConstraintEntry[];
  const absoluteCount = all.filter((c) => c.isAbsolute).length;
  const conditionalCount = all.length - absoluteCount;

  // Group by type
  const grouped: Record<string, ConstraintEntry[]> = {};
  for (const c of all) {
    if (!grouped[c.constraintType]) grouped[c.constraintType] = [];
    grouped[c.constraintType].push(c);
  }

  let runningIndex = 1;

  return (
    <section id="section-03" className="container">
      <div className="section-meta">
        <span>Step 07</span>
        <span className="sep">/</span>
        <span>Constraints Analysis</span>
        <span className="sep">/</span>
        <span>Six-Type Constraint Taxonomy</span>
      </div>

      <div className="md">
        <h1 className="section-title">03 Constraints</h1>

        {/* Item 22: Executive Summary */}
        <ExecutiveSummary kicker="03 / Executive Summary" title="What you are reading">
          <p className="answer">
            This chapter maps the twelve constraints that bound the Marquardt sensor's addressable
            market scope — covering physical, chemical, operational, economic, regulatory, and
            environmental limits. Three constraints are <strong>absolute</strong> (non-aqueous
            media, high void fraction, partially-filled pipes) and cannot be overcome by any
            engineering change or investment; the remaining nine are{" "}
            <strong>conditional</strong> and can be mitigated at varying cost and lead time. Every
            new market candidate in Chapter 05 is screened against these constraints: absolute
            violations eliminate a market entirely, while conditional barriers reduce its fit
            score and add a cost-to-enter estimate.
          </p>
        </ExecutiveSummary>

        {/* Metadata block */}
        <blockquote>
          <p><strong>Component:</strong> Constraints Analysis (Step 07)</p>
          <p>
            <strong>Framework:</strong> Six-Type Constraint Taxonomy (physical, chemical,
            operational, economic, regulatory, environmental)
          </p>
          <p><strong>Product:</strong> Marquardt Ultrasonic Flow Sensor</p>
          <p><strong>Vendor:</strong> Marquardt GmbH</p>
          <p><strong>Archetype:</strong> New Markets for an Existing Product</p>
        </blockquote>

        <hr />

        {/* ── Constraint Summary Table ── */}
        <h2>Constraint Summary</h2>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Constraint</th>
              <th>Type</th>
              <th>Absolute</th>
              <th>Threshold</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {all.map((c, i) => (
              <tr key={c.name}>
                <td>{i + 1}</td>
                <td>
                  {c.name}
                  {/* Item 23: per-constraint source */}
                  <SourceFootnote sourceIds={CONSTRAINT_SOURCES[c.name] ?? ["CONSTR-S01"]} />
                </td>
                <td>
                  <span className={TYPE_CLASS[c.constraintType] ?? "badge badge--neutral"}>
                    {c.constraintType}
                  </span>
                </td>
                <td>{c.isAbsolute ? <strong>true</strong> : "false"}</td>
                <td>{c.thresholdValue ?? "—"}</td>
                <td>{c.thresholdUnit ? formatUnit(c.thresholdUnit) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p>
          <strong>Totals:</strong> {all.length} constraints — {absoluteCount} absolute,{" "}
          {conditionalCount} conditional. Types: 4 physical, 1 chemical, 4 operational, 1 economic,
          1 regulatory, 1 environmental.
        </p>

        <hr />

        {/* ── Detailed Constraints by Type ── */}
        <h2>Detailed Constraints</h2>

        {GROUP_ORDER.filter((type) => grouped[type]).map((type) => {
          const group = grouped[type];
          return (
            <div key={type}>
              {/* Item 24: Group headings are also clear */}
              <h3
                style={{
                  textTransform: "capitalize",
                  fontSize: "0.95rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-gray)",
                  letterSpacing: "0.08em",
                  marginBottom: "1rem",
                  marginTop: "2rem",
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)} ({group.length})
              </h3>
              {group.map((c) => {
                const idx = runningIndex++;
                return <ConstraintCard key={c.name} c={c} index={idx} />;
              })}
            </div>
          );
        })}

        <hr />

        {/* ── Coverage Table ── */}
        <h2>Constraint Type Coverage</h2>

        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Count</th>
              <th>Absolute</th>
              <th>Conditional</th>
            </tr>
          </thead>
          <tbody>
            {GROUP_ORDER.filter((t) => grouped[t]).map((t) => {
              const g = grouped[t];
              const abs = g.filter((c) => c.isAbsolute);
              const cond = g.filter((c) => !c.isAbsolute);
              return (
                <tr key={t}>
                  <td>{t}</td>
                  <td>{g.length}</td>
                  <td>{abs.length > 0 ? `${abs.length} (${abs.map((_, i) => `C${all.indexOf(abs[i]) + 1}`).join(", ")})` : "0"}</td>
                  <td>{cond.length > 0 ? cond.length : "0"}</td>
                </tr>
              );
            })}
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>{all.length}</strong></td>
              <td><strong>{absoluteCount}</strong></td>
              <td><strong>{conditionalCount}</strong></td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* ── Absolute vs Conditional Interpretation ── */}
        <h2>Absolute vs Conditional — What It Means</h2>

        <table>
          <thead>
            <tr>
              <th>Classification</th>
              <th>Meaning</th>
              <th>Constraints</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Absolute = true</strong></td>
              <td>
                Fundamental physical impossibility. No redesign, money, or time overcomes it.
                The constraint IS the physics.
              </td>
              <td>C1 (non-aqueous media), C3 (high void fraction), C6 (partially filled pipe)</td>
            </tr>
            <tr>
              <td><strong>Absolute = false</strong></td>
              <td>
                Barrier exists but known engineering solutions, design modifications, or
                certifications can overcome it.
              </td>
              <td>C2, C4, C5, C7, C8, C9, C10, C11, C12</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* ── Downstream Use ── */}
        <h2>How Constraints Feed Downstream Analysis</h2>

        <ul>
          <li>
            <strong>Step 08 (Constraint-Market Compatibility):</strong> Each constraint will
            be assessed against each candidate market from Market Discovery. Markets where any
            absolute constraint is exceeded in all normal operating conditions are eliminated.
            <SourceFootnote sourceIds={["CONSTR-S01"]} />
          </li>
          <li>
            <strong>Market Fit Assessment:</strong> Conditional constraints carry cost/time
            penalties into the Constraint Readiness (CR) dimension of market fit scores.
          </li>
          <li>
            <strong>Market Prioritization:</strong> Eliminated markets are excluded entirely;
            conditional costs factor into the final ranking.
          </li>
        </ul>

        <hr />

        {/* Item 21: Replace PASS section with SourceList */}
        <SourceList sourceIds={SECTION_SOURCES} title="Sources — 03 Constraints" />
      </div>
    </section>
  );
}
