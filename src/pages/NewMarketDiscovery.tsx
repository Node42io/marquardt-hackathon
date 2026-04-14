/**
 * NewMarketDiscovery — Page 02
 *
 * Combines HTML reports 05-market-discovery + 10-ranking into a single
 * scrollable React page:
 *   1. Executive Summary
 *   2. Market Definition (NAICS explainer)
 *   3. Discovery Process (Phase 02a search config + candidates table)
 *   4. Architecture Distance (Phase 02b)
 *   5. Scoring Criteria (with exec summary)
 *   6. Confidence Legend
 *   7. Final Ranking Table (all 8 markets)
 *   8. Per-market Rationale Cards
 *   9. Sources
 *
 * TODO items applied: 31, 32, 33, 34, 35, 36, 37, 39.
 */

import PageHeader from "@/components/PageHeader";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import ClickableCode from "@/components/ClickableCode";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import SectionAnchor from "@/components/SectionAnchor";
import SourceFootnote from "@/components/SourceFootnote";
import SourceList from "@/components/SourceList";

import marketDiscovery from "@/data/marketDiscovery.json";
import ranking from "@/data/ranking.json";
import type { ArchDistanceRow, CandidateDetail } from "@/types";

import MarketDefinition from "./discovery/MarketDefinition";
import ScoringCriteria from "./discovery/ScoringCriteria";
import RankingTable from "./discovery/RankingTable";
import MarketRationaleCard from "./discovery/MarketRationaleCard";
import type { RankedMarket } from "./discovery/types";

/* ---- helpers ---- */

function confidenceLevel(val: number): "high" | "medium" | "low" {
  if (val >= 0.85) return "high";
  if (val >= 0.75) return "medium";
  return "low";
}

const FIT_BADGE: Record<string, string> = {
  direct: "badge badge--strong",
  adjacent: "badge badge--moderate",
  stretch: "badge badge--weak",
};

const ADOPTION_BADGE: Record<string, string> = {
  established: "badge badge--strong",
  growing: "badge badge--accent",
  emerging: "badge badge--moderate",
};

const DISTANCE_BADGE: Record<string, string> = {
  HIGH: "badge badge--strong",
  MEDIUM: "badge badge--accent",
  LOW: "badge badge--weak",
};

// Architecture distance data is now stored in marketDiscovery.json (field: archDistanceData)

/* Collect all source IDs used on this page */
const PAGE_SOURCE_IDS = [
  "DISC-S01", "DISC-S02", "DISC-S03", "DISC-S04", "DISC-S05",
  "DISC-S06", "DISC-S07", "DISC-S08", "DISC-S09", "DISC-S10",
  "DISC-S11", "DISC-S12", "DISC-S13", "DISC-S14", "DISC-S15", "DISC-S16",
  "RS007",
];

/* ---- component ---- */

export default function NewMarketDiscovery() {
  const rankedMarkets = (ranking.rankedMarkets ?? []) as RankedMarket[];
  const candidates = marketDiscovery.candidates ?? [];

  /* guard against missing data */
  if (!rankedMarkets.length) {
    return (
      <>
        <p style={{ color: "var(--text-gray)" }}>Data pending — ranking data not available.</p>
      </>
    );
  }

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <PageHeader
        kicker="Step 02a + 02b / Product-to-Industry Cross-Classification & Architecture Distance / New Markets for an Existing Product"
        title="New Market Discovery"
        description="Candidate markets discovered, scored by architecture distance, and ranked by 6-factor composite scoring for the Marquardt Ultrasonic Flow Sensor."
      />

      {/* ── 1. Executive Summary ─────────────────────────────────────── */}
      <section id="executive-summary" className="container">
        <SectionAnchor id="executive-summary" title="Executive Summary" />
        <div className="md">
        <ExecutiveSummary title="What You're Looking At">
          <p className="answer">
            This page covers the full new-market discovery pipeline for the
            Marquardt Ultrasonic Flow Sensor (UNSPSC{" "}
            <ClickableCode kind="unspsc" code="41112501" /> — Flowmeters). The
            pipeline discovered <strong>16 candidate markets</strong> via
            UNSPSC-to-NAICS cross-classification, ranked them by architecture
            distance, carried 8 through full constraint and fit analysis, and
            produced a <strong>6-factor composite score</strong> for each.
          </p>
          <p className="answer">
            What you learn here: which NAICS industry adjacencies scored
            best, why they scored the way they did across customer outcome opportunity,
            feature fit, constraint compatibility, job coverage, value-network
            position, and incumbent vulnerability — and what specific
            go-to-market moves are recommended for each.
          </p>
          <p className="answer">
            What's next: all 8 surviving markets fall in the{" "}
            <strong>investigate</strong> band (5.0–7.5 composite). The top
            three — <strong>Finfish Farming / RAS</strong> (6.97),{" "}
            <strong>HVAC Contractors</strong> (6.61), and{" "}
            <strong>District Energy / Steam &amp; AC Supply</strong> (6.30) —
            are recommended for customer-discovery sprints before resource
            allocation. Deep-dive analysis for each market (JTBD, ODI matrix,
            feature-market fit, value network) lives on the{" "}
            <strong>Analysis</strong> page.
          </p>
          <p className="answer">
            {ranking.executiveSummary}
          </p>
        </ExecutiveSummary>
        </div>
      </section>

      {/* ── 2. Market Definition ─────────────────────────────────────── */}
      <MarketDefinition />

      {/* ── 3. Discovery Process — Phase 02a ─────────────────────────── */}
      <section id="discovery-process" className="container">
        <SectionAnchor
          id="discovery-process"
          title="Discovery Process — Phase 02a"
          kicker="Product-to-Industry Cross-Classification"
        />
        <div className="md">
          <h3>Search Configuration</h3>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Commodity Functional Promise</strong></td>
                <td>
                  {marketDiscovery.commodityFP}{" "}
                  <SourceFootnote sourceIds={["DISC-S15"]} />
                </td>
              </tr>
              <tr>
                <td><strong>UNSPSC Context</strong></td>
                <td>
                  <ClickableCode kind="unspsc" code="41112501" /> — Flowmeters{" "}
                  <SourceFootnote sourceIds={["DISC-S14"]} />
                </td>
              </tr>
              <tr>
                <td><strong>Functional Promise Extension</strong></td>
                <td>
                  {marketDiscovery.fpExtension}{" "}
                  <SourceFootnote sourceIds={["DISC-S15"]} />
                </td>
              </tr>
              <tr>
                <td><strong>Extension Domains</strong></td>
                <td>{marketDiscovery.extensionDomains}</td>
              </tr>
              <tr>
                <td><strong>Excluded Markets</strong></td>
                <td>
                  <ClickableCode kind="naics" code="333415" /> — Air-Conditioning
                  and Warm Air Heating Equipment and Commercial and Industrial
                  Refrigeration Equipment Manufacturing (current home market —
                  sensor already deployed in heat pump and chiller OEM
                  applications)
                </td>
              </tr>
            </tbody>
          </table>

          <h3>Primary Functional Promise Search Query</h3>
          <pre>
            <code>{`"41112501 Flowmeters applications industries markets NAICS codes.
 Where is this commodity class used across manufacturing, process industries,
 healthcare, agriculture, energy, infrastructure, food processing, beverage,
 pharmaceutical, chemical, semiconductor, building systems, HVAC, automotive,
 data centers, water/wastewater, marine, laboratory/research?
 What industries need to quantify the volumetric or mass flow rate of
 fluids traversing a closed conduit?
 Return specific industry names and 6-digit NAICS codes."`}</code>
          </pre>

          <h3>Functional Promise Extension Search Query</h3>
          <pre>
            <code>{`"What industries need real-time detection of liquid composition anomalies
 in closed-pipe systems? Glycol concentration monitoring, bubble detection,
 empty-pipe diagnostics, fluid temperature monitoring.
 Return specific industry names and 6-digit NAICS codes."`}</code>
          </pre>

          <h3>
            Candidates ({candidates.length} discovered, 1 excluded as home
            market)
          </h3>

          {/* Confidence legend — Item 35: shown once near first confidence badge */}
          <div
            style={{
              background: "var(--surface-dark)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 16,
              fontSize: 12,
              color: "var(--text-gray-light)",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-gray-dark)",
                flexShrink: 0,
                paddingTop: 2,
              }}
            >
              Confidence key
            </span>
            <span>
              <ConfidenceBadge level="high" /> — claim supported by authoritative,
              verifiable source.{" "}
              <ConfidenceBadge level="medium" /> — directionally correct but
              proxied or inferred.{" "}
              <ConfidenceBadge level="low" /> — not independently verified;
              treat as directional only.
            </span>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>NAICS</th>
                <th>Title</th>
                <th>Functional Promise Fit</th>
                <th>Adoption</th>
                <th>Discovery Source</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => (
                <tr key={c.naics}>
                  <td style={{ fontFamily: "var(--font-mono)", textAlign: "center" }}>
                    {i + 1}
                  </td>
                  <td>
                    <ClickableCode kind="naics" code={c.naics} />
                  </td>
                  <td>{c.title}</td>
                  <td>
                    <span className={FIT_BADGE[c.fpFit] ?? "badge badge--neutral"}>
                      {c.fpFit}
                    </span>
                  </td>
                  <td>
                    <span
                      className={ADOPTION_BADGE[c.adoption] ?? "badge badge--neutral"}
                    >
                      {c.adoption}
                    </span>
                  </td>
                  <td
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-gray)",
                    }}
                  >
                    {c.discoverySource}
                  </td>
                  <td>
                    <ConfidenceBadge level={confidenceLevel(c.confidence)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 3b. Candidate Details (Phase 02a) ───────────────────────── */}
      <section id="candidate-details" className="container">
        <SectionAnchor id="candidate-details" title="Candidate Details" kicker="Phase 02a" />
        <div className="md">
          <p>
            The table below summarises why each NAICS code was selected:
            the primary job to be done, why flow measurement is required, what
            alternatives exist, and our best-available market size estimate.
          </p>

          {((marketDiscovery as unknown as { candidateDetails?: CandidateDetail[] }).candidateDetails ?? []).map((d, i) => (
            <div
              key={d.naics}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                padding: "20px 24px",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--accent-yellow)",
                    fontWeight: 600,
                  }}
                >
                  #{i + 1}
                </span>
                <ClickableCode kind="naics" code={d.naics} />
                <span style={{ fontSize: 15, fontWeight: 500, color: "var(--text-white)" }}>
                  {d.title}
                </span>
              </div>
              <table style={{ marginTop: 0, marginBottom: 0 }}>
                <tbody>
                  <tr>
                    <td style={{ width: 160 }}><strong>Job</strong></td>
                    <td>{d.job}</td>
                  </tr>
                  <tr>
                    <td><strong>Why needed</strong></td>
                    <td>{d.whyNeeded}</td>
                  </tr>
                  <tr>
                    <td><strong>Alternatives</strong></td>
                    <td>{d.alternatives}</td>
                  </tr>
                  <tr>
                    <td><strong>Market size est.</strong></td>
                    <td>
                      {d.marketSize}{" "}
                      <ConfidenceBadge level={confidenceLevel(d.confidence)} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Phase 02b — Architecture Distance ────────────────────── */}
      <section id="architecture-distance" className="container">
        <SectionAnchor
          id="architecture-distance"
          title="Architecture Distance Ranking"
          kicker="Phase 02b — Prioritization Filter"
        />
        <div className="md">
          <h3>Scoring Configuration</h3>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Product</strong></td>
                <td>Marquardt Ultrasonic Flow Sensor</td>
              </tr>
              <tr>
                <td><strong>Technology Class</strong></td>
                <td>Ultrasonic Transit-Time Flow Measurement</td>
              </tr>
              <tr>
                <td><strong>Mechanism</strong></td>
                <td>Piezoelectric transducers, transit-time difference proportional to fluid velocity</td>
              </tr>
              <tr>
                <td><strong>Key Specs</strong></td>
                <td>Flow 0.25–60 l/min, DN12–DN25, 0–10 bar, +2 to 90°C, water/glycol media, RAST 2.5 connector</td>
              </tr>
              <tr>
                <td><strong>Scoring Type</strong></td>
                <td>Hardware components (L1–L4, where L4 = major subsystem, L3 = module, L2 = assembly, L1 = part) — criteria U1–U5 + H1–H4</td>
              </tr>
              <tr>
                <td><strong>Tiered Discovery</strong></td>
                <td>Not used (16 candidates &lt; 20 threshold)</td>
              </tr>
            </tbody>
          </table>

          <h3>Scoring Criteria</h3>
          <h4>Universal (U1–U5)</h4>
          <ul>
            <li><strong>U1:</strong> Operating environment similarity</li>
            <li><strong>U2:</strong> Regulatory regime distance</li>
            <li><strong>U3:</strong> Customer type similarity</li>
            <li><strong>U4:</strong> Integration architecture</li>
            <li><strong>U5:</strong> Price point alignment</li>
          </ul>
          <h4>Hardware-Specific (H1–H4)</h4>
          <ul>
            <li><strong>H1:</strong> Physical envelope match (size, weight, mounting, interfaces)</li>
            <li><strong>H2:</strong> Media / material compatibility</li>
            <li><strong>H3:</strong> Performance specification match (accuracy, throughput, capacity)</li>
            <li><strong>H4:</strong> Certification transferability</li>
          </ul>
          <p>
            <em>Scale: 1 = nearly identical, 10 = completely different.</em>
          </p>

          <h3>Ranked Results</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>NAICS</th>
                <th>Title</th>
                <th style={{ textAlign: "center" }}>Distance</th>
                <th style={{ textAlign: "center" }}>Uses Tech</th>
                <th>Functional Promise Fit</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {((marketDiscovery as unknown as { archDistanceData?: ArchDistanceRow[] }).archDistanceData ?? []).map((row, i) => (
                <tr key={row.naics}>
                  <td
                    style={{
                      fontFamily: "var(--font-mono)",
                      textAlign: "center",
                      color: "var(--text-gray)",
                    }}
                  >
                    {i + 1}
                  </td>
                  <td>
                    <ClickableCode kind="naics" code={row.naics} />
                  </td>
                  <td>{row.title}</td>
                  <td
                    style={{
                      textAlign: "center",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      color: "var(--text-white)",
                    }}
                  >
                    {row.distance}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: row.usesTech ? "var(--status-high)" : "var(--text-gray)",
                      }}
                    >
                      {row.usesTech ? "yes" : "no"}
                    </span>
                  </td>
                  <td>
                    <span className={FIT_BADGE[row.fpFit] ?? "badge badge--neutral"}>
                      {row.fpFit}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        DISTANCE_BADGE[row.priority] ?? "badge badge--neutral"
                      }
                    >
                      {row.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 5. Scoring Criteria ─────────────────────────────────────── */}
      <ScoringCriteria />

      {/* ── 6. Pipeline Summary ─────────────────────────────────────── */}
      <section id="pipeline-summary" className="container">
        <SectionAnchor id="pipeline-summary" title="Pipeline Summary" />
        <div className="md">
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Markets Discovered (Step 02)</strong></td>
                <td>16</td>
              </tr>
              <tr>
                <td><strong>Home Market Excluded</strong></td>
                <td>
                  1 (<ClickableCode kind="naics" code="333415" /> — current heat pump OEM market)
                </td>
              </tr>
              <tr>
                <td><strong>Carried Through Downstream Analysis</strong></td>
                <td>{ranking.totalMarketsEvaluated} candidate markets</td>
              </tr>
              <tr>
                <td><strong>Eliminated by Constraint Knockout</strong></td>
                <td>{ranking.marketsEliminatedByConstraints}</td>
              </tr>
              <tr>
                <td><strong>Markets Ranked</strong></td>
                <td>{rankedMarkets.length}</td>
              </tr>
              <tr>
                <td><strong>Not Analyzed Downstream</strong></td>
                <td>
                  9 (Data Centers, Wineries, Boilers/HX, Dairy, Soft Drinks,
                  Water Utilities, Pharma, Wastewater, Semiconductor, Chemical
                  — pipeline scope limit)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 7. Final Ranking Table — all 8 markets ───────────────────── */}
      <RankingTable markets={rankedMarkets} />

      {/* ── 8. Per-market Rationale Cards ───────────────────────────── */}
      <section id="market-rationale" className="container">
        <SectionAnchor
          id="market-rationale"
          title="Per-Market Rationale"
          kicker="Strategic Synthesis"
        />
        <div className="md" style={{ marginBottom: 24 }}>
          <p>
            Each card below details the recommendation rationale, entry
            strategy, time and investment estimates for one candidate market.
            Click the link at the bottom of any card to open the full
            market-level deep-dive (Compatibility, Job-to-be-Done, Outcomes, Value Network)
            on the Analysis page.
          </p>
        </div>
        {rankedMarkets.map((m) => (
          <MarketRationaleCard key={m.slug} market={m} />
        ))}
      </section>

      {/* ── 9. Sources ───────────────────────────────────────────────── */}
      <section id="sources" className="container">
        <SourceList
          sourceIds={PAGE_SOURCE_IDS}
          title="Sources — Market Discovery & Ranking"
        />
      </section>
    </>
  );
}

// candidateDetails data moved to src/data/marketDiscovery.json
// archDistanceData moved to src/data/marketDiscovery.json
// Both types (CandidateDetail, ArchDistanceRow) imported from src/types/index.ts
