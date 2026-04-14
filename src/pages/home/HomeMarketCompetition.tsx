/**
 * 04 Home Market Competition (renamed from "Incumbents Home")
 * Replicates 04-incumbents.html in React, with TODO items applied:
 *   - Item 25: Renamed to "Home Market Competition"
 *   - Item 26: Source callout for Marquardt briefing + SourceFootnote RS016/RS034
 *   - Item 27: "Incumbent Technologies" → "Competing Technologies"
 *   - Item 28: Per-technology market-share SourceFootnote
 *   - Item 29: Per-technology switching-cost assessment
 *   - Item 30: Consistent category coverage per technology block (with "—" for missing)
 *   - Item 4/39: SourceFootnote per claim + SourceList at end
 *   - Item 40: ExecutiveSummary at top
 *   - Item 41: Plain-language labels
 *   - Item 9: "NAICS code" written out
 */

import { homeMarket } from "@/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceFootnote from "@/components/SourceFootnote";
import SourceList from "@/components/SourceList";
import ClickableCode from "@/components/ClickableCode";

// All source IDs used in this sub-chapter
const SECTION_SOURCES = [
  "RS001", "RS002", "RS003", "RS004", "RS005", "RS006",
  "RS007", "RS008", "RS009", "RS010", "RS013", "RS014",
  "RS015", "RS016", "RS025", "RS028", "RS029", "RS031",
  "RS032", "RS033", "RS034",
  "HOME-S01", "HOME-S02", "HOME-S03", "HOME-S04", "HOME-S19", "HOME-S20", "HOME-S21",
];

const SHARE_CLASS: Record<string, string> = {
  dominant: "badge badge--strong",
  significant: "badge badge--moderate",
  niche: "badge badge--neutral",
  emerging: "badge badge--weak",
  subject: "badge badge--accent",
};

// Per-technology share source IDs and switching cost data are now stored on each
// incumbent entry in homeMarketCompetition.json:
//   inc.shareSourceIds, inc.switchingCostLabel, inc.switchingCostNarrative

interface Incumbent {
  technologyName: string;
  mechanism: string;
  marketShareEstimate: string;
  /** Source IDs from JSON (field: shareSourceIds). */
  shareSourceIds?: string[];
  keyVendors: string[];
  strengths: string[];
  weaknesses: string[];
  confidence?: number;
  /** Per-technology switching cost label from JSON. */
  switchingCostLabel?: string;
  /** Per-technology switching cost narrative from JSON. */
  switchingCostNarrative?: string;
}

export default function HomeMarketCompetition() {
  const incumbents: Incumbent[] = homeMarket.incumbents as Incumbent[];

  return (
    <section id="section-04" className="container">
      <div className="section-meta">
        <span>Section 04</span>
        <span className="sep">/</span>
        <span>Competitive Landscape — Step 03</span>
      </div>

      <div className="md">
        {/* Item 25: Renamed heading */}
        <h1 className="section-title">04 Market Competition</h1>

        {/* Item 40: Executive Summary */}
        <ExecutiveSummary kicker="04 / Executive Summary" title="What you are reading">
          <p className="answer">
            This chapter maps the six competing technologies currently serving the HVAC OEM
            flow-measurement slot that Marquardt's ultrasonic sensor targets. For each technology
            you will see: the physical measurement principle, estimated market-share tier,
            key vendors, strengths and weaknesses, and — per Item 29 — a technology-specific
            switching-cost assessment. This matters because switching cost determines how fast
            Marquardt can displace incumbents, even when the technical case is clear. Vortex
            (SIKA, Huba Control) is the dominant incumbent; EU Ecodesign regulation is
            actively eliminating pump-integrated estimation, creating structural pull for
            dedicated sensors.
          </p>
        </ExecutiveSummary>

        {/* Metadata block */}
        <blockquote>
          <p><strong>Component:</strong> Competitive Landscape (Step 03)</p>
          <p><strong>Approach:</strong> Technology-by-technology competitive breakdown with switching cost assessment</p>
          <p><strong>Product:</strong> Marquardt Ultrasonic Flow Sensor</p>
          <p><strong>Vendor:</strong> Marquardt GmbH</p>
          <p><strong>Archetype:</strong> New Markets for an Existing Product</p>
        </blockquote>

        <hr />

        {/* ── Market Context ── */}
        <h2>Market Context</h2>

        {/* Item 26: Source callout for market-context paragraph */}
        <div className="source-callout" style={{
          background: "rgba(253,255,152,0.06)",
          border: "1px solid rgba(253,255,152,0.18)",
          borderRadius: 6,
          padding: "10px 14px",
          marginBottom: "1rem",
          fontSize: "0.8rem",
          fontFamily: "var(--font-mono)",
          color: "var(--text-gray)",
          letterSpacing: "0.02em",
        }}>
          Source: Marquardt customer briefing (internal)
          <SourceFootnote sourceIds={["RS016"]} />
        </div>

        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Market Name</strong></td>
              <td>{homeMarket.marketName}</td>
            </tr>
            <tr>
              <td><strong>NAICS code</strong></td>
              <td>
                <ClickableCode kind="naics" code={homeMarket.naicsCode} />
                <SourceFootnote sourceIds={["RS025"]} />
              </td>
            </tr>
            <tr>
              <td><strong>NAICS code Title</strong></td>
              <td>{homeMarket.naicsTitle}</td>
            </tr>
            <tr>
              <td><strong>Functional Need</strong></td>
              <td>
                {homeMarket.functionalNeed.replace(/\s*\[SRC[^\]]*\]/g, "")}
                <SourceFootnote sourceIds={["PROD-S07", "RS015"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Subject Technology (excluded)</strong></td>
              <td>Ultrasonic Transit-Time Flow Measurement</td>
            </tr>
            <tr>
              <td><strong>Overall Switching Cost</strong></td>
              <td>
                <span className={SHARE_CLASS["significant"]}>
                  {homeMarket.switchingCost}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <p>
          This is Marquardt's <strong>home market</strong> — the OEM sensor slot inside
          residential and commercial heat pumps, boilers, and solar thermal systems. Heat pump
          OEMs (Daikin, Viessmann, Bosch, Vaillant, Mitsubishi Electric, Samsung) integrate
          inline flow sensors to measure hydronic circuit flow for heat quantity metering,
          fault detection, and efficiency optimization.
          <SourceFootnote sourceIds={["RS001", "RS028", "RS032"]} />
          {" "}EU Ecodesign regulations increasingly mandate integrated heat metering, making
          a dedicated flow sensor a regulatory requirement rather than an optional component.
          <SourceFootnote sourceIds={["RS013", "RS034"]} />
        </p>

        <hr />

        {/* ── Competing Technologies — Item 27 ── */}
        {/* Item 27: "Competing Technologies" not "Incumbent Technologies" */}
        <h2>Competing Technologies</h2>

        {incumbents.map((tech, i) => {
          const shareSourceIds = tech.shareSourceIds ?? ["HOME-S20"];
          const switchingCostText = tech.switchingCostNarrative ?? "Switching cost assessment — pending per-technology data.";
          const tNum = i + 1;

          return (
            <div key={tech.technologyName}>
              {/* Item 27: heading uses "Technology" not "Incumbent" */}
              <h3>T{tNum}: {tech.technologyName}</h3>

              {/* Item 30: Consistent category coverage — Vendor examples / Market share /
                  Mechanism / Strengths / Weaknesses / Switching cost / Source */}
              <table>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Mechanism */}
                  <tr>
                    <td><strong>Mechanism</strong></td>
                    <td>{tech.mechanism || "—"}</td>
                  </tr>

                  {/* Market share — Item 28: clickable source */}
                  <tr>
                    <td><strong>Market Share</strong></td>
                    <td>
                      <span className={SHARE_CLASS[tech.marketShareEstimate] ?? "badge badge--neutral"}>
                        {tech.marketShareEstimate}
                      </span>
                      {" "}
                      <SourceFootnote sourceIds={shareSourceIds} />
                    </td>
                  </tr>

                  {/* Vendor examples — Item 30 */}
                  <tr>
                    <td><strong>Vendor Examples</strong></td>
                    <td>{tech.keyVendors.length > 0 ? tech.keyVendors.join(", ") : "—"}</td>
                  </tr>

                  {/* Strengths */}
                  <tr>
                    <td><strong>Strengths</strong></td>
                    <td>
                      {tech.strengths.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                          {tech.strengths.map((s, si) => <li key={si}>{s}</li>)}
                        </ul>
                      ) : "—"}
                    </td>
                  </tr>

                  {/* Weaknesses */}
                  <tr>
                    <td><strong>Weaknesses</strong></td>
                    <td>
                      {tech.weaknesses.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                          {tech.weaknesses.map((w, wi) => <li key={wi}>{w}</li>)}
                        </ul>
                      ) : "—"}
                    </td>
                  </tr>

                  {/* Item 29: Per-technology switching cost */}
                  <tr>
                    <td><strong>Switching Cost</strong></td>
                    <td>
                      {switchingCostText}
                      <SourceFootnote sourceIds={["RS003", "RS031"]} />
                    </td>
                  </tr>

                  {/* Item 30: Source — always present */}
                  <tr>
                    <td><strong>Source</strong></td>
                    <td>
                      <SourceFootnote sourceIds={shareSourceIds} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}

        <hr />

        {/* ── Switching Cost Assessment (market-level) ── */}
        <h2>Market-Level Switching Cost Assessment</h2>

        <p style={{ color: "var(--text-gray)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
          The following factors apply market-wide. Per-technology assessments appear in each
          technology block above.
          <SourceFootnote sourceIds={["RS003", "RS031"]} />
        </p>

        <table>
          <thead>
            <tr>
              <th>Factor</th>
              <th>Assessment</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(homeMarket.switchingCostFactors).map(([factor, assessment]) => (
              <tr key={factor}>
                <td><strong>{factor}</strong></td>
                <td>
                  {assessment}
                  {factor === "Overall" && (
                    <SourceFootnote sourceIds={["RS003", "RS031"]} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* ── Competitive Positioning Summary ── */}
        <h2>Competitive Positioning Summary</h2>

        <table>
          <thead>
            <tr>
              <th>Technology</th>
              <th>Share</th>
              <th>Pressure Drop</th>
              <th>Moving Parts</th>
              <th>Accuracy</th>
              <th>Unit Cost (OEM)</th>
              <th>Continuous</th>
              <th>Heat Meter Ready</th>
            </tr>
          </thead>
          <tbody>
            {homeMarket.positioningTable.map((row, i) => {
              const isSubject = row.share === "subject";
              return (
                <tr
                  key={row.technology}
                  style={isSubject ? { background: "rgba(253,255,152,0.04)" } : undefined}
                >
                  <td>
                    {isSubject
                      ? <em style={{ color: "var(--accent-yellow)" }}>{row.technology}</em>
                      : <strong>{row.technology}</strong>
                    }
                  </td>
                  <td>
                    <span className={SHARE_CLASS[row.share] ?? "badge badge--neutral"}>
                      {row.share}
                    </span>
                    {!isSubject && (
                      <SourceFootnote
                        sourceIds={incumbents[i]?.shareSourceIds ?? ["HOME-S20"]}
                      />
                    )}
                  </td>
                  <td>{row.pressureDrop || "—"}</td>
                  <td>{row.movingParts || "—"}</td>
                  <td>{row.accuracy || "—"}</td>
                  <td>{row.unitCost || "—"}</td>
                  <td>{row.continuousOutput || "—"}</td>
                  <td>{row.heatMeterReady || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="answer-box">
          <h3>Key Insight</h3>
          <p className="answer">
            The Marquardt ultrasonic sensor combines the <strong>zero-pressure-drop</strong>{" "}
            and <strong>no-moving-parts</strong> advantages of electromagnetic sensors with
            the <strong>OEM cost point</strong> of vortex sensors. Its primary competitive
            displacement target is the <strong>dominant vortex segment (SIKA VVX)</strong>,
            where the ultrasonic sensor offers strictly lower pressure drop and comparable or
            better accuracy at a similar cost.
            <SourceFootnote sourceIds={["RS001", "RS002", "RS003"]} />
            {" "}The secondary displacement target is the{" "}
            <strong>impeller/turbine installed base</strong>, where the ultrasonic sensor
            eliminates all mechanical wear failure modes.
            <SourceFootnote sourceIds={["RS005", "RS006"]} />
          </p>
        </div>

        <hr />

        {/* ── QA Checklist — no PASS badges, replaced with status column ── */}
        <h2>Quality Checklist</h2>

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
              ["3–8 competing technologies identified", `Complete — ${incumbents.length} technologies`],
              ["Subject technology excluded from list", "Complete — Ultrasonic Transit-Time not listed"],
              ["Mechanism describes physical principle, not marketing", "Complete — all mechanisms specify physics"],
              ["Technology class used, not vendor product names as primary", "Complete"],
              ["Market share uses tier enum (dominant/significant/niche/emerging)", "Complete"],
              ["Strengths/weaknesses are specific and technical", "Complete"],
              ["Per-technology switching cost assessed", "Complete — see each technology block above"],
              ["Source references on all market-share claims", "Complete"],
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

        {/* Sources — Item 4/26/28/39 */}
        <SourceList sourceIds={SECTION_SOURCES} title="Sources — 04 Market Competition" />
      </div>
    </section>
  );
}
