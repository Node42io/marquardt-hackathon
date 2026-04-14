/**
 * 00 Overview
 * Covers: the question being answered, Marquardt GmbH profile,
 * product hierarchy, and portfolio priorities.
 * Data lives in src/data/overview.json — never hardcoded here.
 */

import overviewRaw from "@/data/overview.json";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceFootnote from "@/components/SourceFootnote";
import ClickableCode from "@/components/ClickableCode";

/* ── Types ────────────────────────────────────────────────────────────────── */
interface Source { id: string; label: string; url: string | null; }
interface Division {
  name: string; type: string; description: string; isSubjectDivision: boolean;
}
interface OverviewData {
  company: {
    name: string; legalForm: string; ownership: string; founded: number;
    hq: string;
    ceo: { name: string; since: string; note: string };
    revenue: { value: string; year: number; note: string };
    employees: { value: number; year: number; note: string };
    sites: number; countries: number; continents: number;
    rdIntensity: string; patentsTotal: number; patentsGranted: number;
    primaryNaics: string; primaryNaicsTitle: string;
  };
  globalFootprint: { regions: { region: string; sites: string[] }[] };
  divisions: Division[];
  productGroup: {
    name: string; scope: string;
    families: { name: string; technology: string; status: string }[];
  };
  product: {
    name: string; family: string; bomLevel: string;
    homeMarketNaics: string; homeMarketTitle: string;
    variants: {
      id: string; status: string; innerDiameter: string;
      flowRange: string; dimensions: string; note?: string; isSerial?: boolean;
    }[];
  };
  studyQuestion: {
    q1: { german: string; english: string; answer: string };
    q2: { german: string; english: string; answer: string };
  };
  portfolioPriorities: {
    priority: string; market: string;
    fitScore: number; fitLabel: string; compositeScore: number;
    timeToFirstRevenue: string; hardwareDelta: string;
    y5RevenueBaseM: number; role: string;
  }[];
  financials: {
    y5RevenueBase: string; y5RevenueUpside: string; y5RevenueDownside: string;
    npvBase: string; npvUpside: string; npvDownside: string;
    irrBase: string; irrUpside: string; irrDownside: string;
    breakevenBase: string; breakevenUpside: string; breakevenDownside: string;
    cumulativeInvestment: string; discountRate: string; note: string;
  };
  sources: Source[];
}

const data = overviewRaw as OverviewData;

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const FIT_CLASS: Record<string, string> = {
  "STRONG": "badge badge--strong",
  "MODERATE-top": "badge badge--moderate",
  "MODERATE": "badge badge--moderate",
  "WEAK": "badge badge--weak",
};

function fitBadge(label: string) {
  return <span className={FIT_CLASS[label] ?? "badge badge--neutral"}>{label}</span>;
}

/* ── Inline source list ───────────────────────────────────────────────────── */
function SourceList({ sources }: { sources: Source[] }) {
  return (
    <div className="source-list" style={{ marginTop: 32 }}>
      <div className="source-list__title">Sources — 00 Overview</div>
      <ol>
        {sources.map((src, i) => (
          <li key={src.id}>
            <span className="num">{i + 1}.</span>
            <div>
              {src.url ? (
                <a href={src.url} target="_blank" rel="noopener noreferrer">{src.label}</a>
              ) : (
                <span style={{ color: "var(--text-gray)" }}>{src.label}</span>
              )}
              {!src.url && (
                <span className="pending" style={{ display: "block" }}>source pending</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function Overview() {
  const { company, globalFootprint, divisions, productGroup, product,
          studyQuestion, portfolioPriorities, financials, sources } = data;
  const subjectDivision = divisions.find((d) => d.isSubjectDivision);

  return (
    <section id="section-00" className="container">
      {/* Breadcrumb */}
      <div className="section-meta">
        <span>Step 00</span>
        <span className="sep">/</span>
        <span>Overview &amp; Context</span>
        <span className="sep">/</span>
        <span>New Markets for an Existing Product</span>
      </div>

      <div className="md">
        <h1 className="section-title">00 Overview</h1>

        {/* ── Executive Summary ── */}
        <ExecutiveSummary kicker="00 / What you are reading" title="Report scope">
          <p className="answer">
            This report answers a single strategic question posed by Marquardt GmbH: which
            new markets can the existing DN20 Ultrasonic Flow Sensor enter, how attractive
            are they, and what business model fits? The analysis evaluated eight candidate
            markets through a six-factor composite scoring model covering architecture
            distance, job-to-be-done coverage, feature fit, constraint compatibility,
            value-network position, and incumbent vulnerability. Five markets advanced to
            full deep-dive. This page is the entry point — it explains the question,
            introduces the company and product, and gives a one-page summary of findings.
          </p>
        </ExecutiveSummary>

        {/* ── The Question ── */}
        <hr />
        <h2 id="ovw-question">The Question Marquardt Asked</h2>

        <div
          style={{
            border: "1px solid var(--border-subtle)",
            borderLeft: "3px solid var(--accent-yellow)",
            borderRadius: 8,
            padding: "20px 24px",
            marginBottom: 20,
            background: "var(--bg-card)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray-dark)",
              marginBottom: 8,
            }}
          >
            Q1 — Primary Question (original German)
          </div>
          <p
            style={{
              fontStyle: "italic",
              color: "var(--text-gray-light)",
              marginBottom: 8,
              fontSize: 14,
            }}
          >
            "{studyQuestion.q1.german}"
          </p>
          <p style={{ color: "var(--text-gray)", fontSize: 13, marginBottom: 16 }}>
            <strong style={{ color: "var(--text-white)" }}>In English:</strong>{" "}
            {studyQuestion.q1.english}
          </p>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray-dark)",
              marginBottom: 6,
            }}
          >
            Answer (summary)
          </div>
          <p style={{ color: "var(--text-white)", fontSize: 13, lineHeight: 1.6, marginBottom: 0 }}>
            {studyQuestion.q1.answer}
          </p>
        </div>

        <div
          style={{
            border: "1px solid var(--border-subtle)",
            borderLeft: "3px solid var(--status-medium)",
            borderRadius: 8,
            padding: "20px 24px",
            marginBottom: 24,
            background: "var(--bg-card)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray-dark)",
              marginBottom: 8,
            }}
          >
            Q2 — Secondary Question (original German)
          </div>
          <p
            style={{
              fontStyle: "italic",
              color: "var(--text-gray-light)",
              marginBottom: 8,
              fontSize: 14,
            }}
          >
            "{studyQuestion.q2.german}"
          </p>
          <p style={{ color: "var(--text-gray)", fontSize: 13, marginBottom: 16 }}>
            <strong style={{ color: "var(--text-white)" }}>In English:</strong>{" "}
            {studyQuestion.q2.english}
          </p>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray-dark)",
              marginBottom: 6,
            }}
          >
            Answer (summary)
          </div>
          <p style={{ color: "var(--text-white)", fontSize: 13, lineHeight: 1.6, marginBottom: 0 }}>
            {studyQuestion.q2.answer}
          </p>
        </div>

        <hr />

        {/* ── About Marquardt ── */}
        <h2 id="ovw-company">About Marquardt GmbH</h2>
        <SourceFootnote sourceIds={["OVW-S01", "OVW-S02", "OVW-S03"]} />

        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Legal name</strong></td>
              <td>{company.name} ({company.legalForm})</td>
            </tr>
            <tr>
              <td><strong>Founded</strong></td>
              <td>{company.founded}</td>
            </tr>
            <tr>
              <td><strong>Headquarters</strong></td>
              <td>{company.hq}</td>
            </tr>
            <tr>
              <td><strong>Ownership</strong></td>
              <td>{company.ownership}</td>
            </tr>
            <tr>
              <td><strong>Revenue</strong></td>
              <td>
                {company.revenue.value} ({company.revenue.year})
                <SourceFootnote sourceIds={["OVW-S02"]} />
                <span style={{ display: "block", fontSize: 11, color: "var(--text-gray-dark)", marginTop: 2 }}>
                  {company.revenue.note}
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>Employees</strong></td>
              <td>
                ~{company.employees.value.toLocaleString()} ({company.employees.year})
                <SourceFootnote sourceIds={["OVW-S01"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Global sites</strong></td>
              <td>{company.sites} locations across {company.countries} countries, {company.continents} continents</td>
            </tr>
            <tr>
              <td><strong>CEO</strong></td>
              <td>
                {company.ceo.name} (since {company.ceo.since})
                <SourceFootnote sourceIds={["OVW-S04", "OVW-S05"]} />
                <span style={{ display: "block", fontSize: 11, color: "var(--text-gray-dark)", marginTop: 2 }}>
                  {company.ceo.note}
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>R&amp;D intensity</strong></td>
              <td>{company.rdIntensity}</td>
            </tr>
            <tr>
              <td><strong>Patent portfolio</strong></td>
              <td>
                {company.patentsTotal.toLocaleString()} total · {company.patentsGranted.toLocaleString()} granted
                <SourceFootnote sourceIds={["OVW-S08"]} />
              </td>
            </tr>
            <tr>
              <td><strong>Primary NAICS</strong></td>
              <td>
                <ClickableCode kind="naics" code={company.primaryNaics} />{" "}
                — {company.primaryNaicsTitle}
              </td>
            </tr>
          </tbody>
        </table>

        <h3>Global Footprint</h3>

        <table>
          <thead>
            <tr>
              <th>Region</th>
              <th>Sites</th>
            </tr>
          </thead>
          <tbody>
            {globalFootprint.regions.map((r) => (
              <tr key={r.region}>
                <td><strong>{r.region}</strong></td>
                <td>{r.sites.join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* ── Division & Product Group ── */}
        <h2 id="ovw-hierarchy">Company → Division → Product Hierarchy</h2>
        <SourceFootnote sourceIds={["OVW-S01", "OVW-S07"]} />

        <table>
          <thead>
            <tr>
              <th>Level</th>
              <th>Entity</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="badge badge--accent">Company</span></td>
              <td><strong>{company.name}</strong></td>
              <td>Family-owned mechatronic systems supplier. Automotive (main) + Building/HVAC + Industrial.</td>
            </tr>
            {subjectDivision && (
              <tr>
                <td><span className="badge badge--moderate">Division</span></td>
                <td><strong>{subjectDivision.name}</strong></td>
                <td>{subjectDivision.description}</td>
              </tr>
            )}
            <tr>
              <td><span className="badge badge--neutral">Product Group</span></td>
              <td><strong>{productGroup.name}</strong></td>
              <td>{productGroup.scope}</td>
            </tr>
            <tr>
              <td><span className="badge badge--strong">Product (L5)</span></td>
              <td><strong>{product.name} — DN20 serial</strong></td>
              <td>
                Home market: <ClickableCode kind="naics" code={product.homeMarketNaics} />{" "}
                {product.homeMarketTitle}. Sellable unit — the subject of this entire analysis.
              </td>
            </tr>
          </tbody>
        </table>

        <h3>All Divisions</h3>
        <table>
          <thead>
            <tr>
              <th>Division</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {divisions.map((d) => (
              <tr key={d.name} style={d.isSubjectDivision ? { background: "rgba(253,255,152,0.04)" } : undefined}>
                <td>
                  <strong>{d.name}</strong>
                  {d.isSubjectDivision && (
                    <span className="badge badge--strong" style={{ marginLeft: 8 }}>Subject</span>
                  )}
                </td>
                <td style={{ fontSize: 12, color: "var(--text-gray)" }}>{d.type}</td>
                <td style={{ fontSize: 12 }}>{d.description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Sensor Product Families</h3>

        <table>
          <thead>
            <tr>
              <th>Product Family</th>
              <th>Technology</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {productGroup.families.map((f) => (
              <tr key={f.name}>
                <td><strong>{f.name}</strong></td>
                <td>{f.technology}</td>
                <td>
                  <span className={
                    f.status.startsWith("Current") ? "badge badge--strong" :
                    f.status.startsWith("Legacy") ? "badge badge--weak" :
                    "badge badge--moderate"
                  }>
                    {f.status.split(" — ")[0]}
                  </span>
                  {f.status.includes(" — ") && (
                    <span style={{ display: "block", fontSize: 11, color: "var(--text-gray)", marginTop: 2 }}>
                      {f.status.split(" — ")[1]}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* ── Product Variants ── */}
        <h2 id="ovw-product">The Product: Ultrasonic Flow Sensor Variants</h2>
        <SourceFootnote sourceIds={["OVW-S06", "OVW-S09"]} />

        <p>
          The sensor family spans four pipe diameters. The <strong>DN20 is the current
          serial product</strong> — it is the basis for all market analysis in this report.
          DN12 and DN25 expansions are required to unlock additional markets (residential
          combi-boiler DHW and commercial HVAC main headers respectively).
        </p>

        <table>
          <thead>
            <tr>
              <th>Variant</th>
              <th>Status</th>
              <th>Inner Ø</th>
              <th>Flow Range</th>
              <th>Dimensions (L×W×H)</th>
            </tr>
          </thead>
          <tbody>
            {product.variants.map((v) => (
              <tr key={v.id} style={v.isSerial ? { background: "rgba(253,255,152,0.04)" } : undefined}>
                <td>
                  <strong>{v.id}</strong>
                  {v.isSerial && <span className="badge badge--strong" style={{ marginLeft: 8 }}>Serial</span>}
                </td>
                <td>{v.status}</td>
                <td>{v.innerDiameter}</td>
                <td>{v.flowRange}</td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{v.dimensions}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* ── Portfolio Priorities ── */}
        <h2 id="ovw-portfolio">Market Priorities at a Glance</h2>

        <p>
          Eight candidate markets were screened. Five advanced to full deep-dive analysis.
          The table below shows the final priority ranking with fit score, time-to-first-revenue,
          required hardware changes, and projected 5-year base revenue.
        </p>

        <table>
          <thead>
            <tr>
              <th>Priority</th>
              <th>Market</th>
              <th>Fit Score</th>
              <th>Time to Revenue</th>
              <th>Hardware Delta</th>
              <th>Y5 Base Revenue</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {portfolioPriorities.map((p) => (
              <tr key={p.priority}>
                <td style={{ textAlign: "center", fontWeight: 700 }}>{p.priority}</td>
                <td><strong>{p.market}</strong></td>
                <td>
                  {p.fitScore.toFixed(2)}{" "}{fitBadge(p.fitLabel)}
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{p.timeToFirstRevenue}</td>
                <td style={{ fontSize: 12 }}>{p.hardwareDelta}</td>
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>€{p.y5RevenueBaseM}M</td>
                <td style={{ fontSize: 12, color: "var(--text-gray)" }}>{p.role}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* ── Financials ── */}
        <h2 id="ovw-financials">5-Year Financial Scenarios</h2>

        <table>
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Y5 Revenue</th>
              <th>5-yr NPV (@{financials.discountRate})</th>
              <th>5-yr IRR</th>
              <th>Break-even</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: "rgba(253,255,152,0.04)" }}>
              <td><strong>Base</strong></td>
              <td><strong>{financials.y5RevenueBase}</strong></td>
              <td><strong>{financials.npvBase}</strong></td>
              <td><strong>{financials.irrBase}</strong></td>
              <td><strong>{financials.breakevenBase}</strong></td>
            </tr>
            <tr>
              <td>Upside</td>
              <td>{financials.y5RevenueUpside}</td>
              <td>{financials.npvUpside}</td>
              <td>{financials.irrUpside}</td>
              <td>{financials.breakevenUpside}</td>
            </tr>
            <tr>
              <td>Downside</td>
              <td>{financials.y5RevenueDownside}</td>
              <td>{financials.npvDownside}</td>
              <td>{financials.irrDownside}</td>
              <td>{financials.breakevenDownside}</td>
            </tr>
          </tbody>
        </table>

        <p style={{ fontSize: 12, color: "var(--text-gray)", lineHeight: 1.6 }}>
          <strong>Total upfront investment:</strong> {financials.cumulativeInvestment}.{" "}
          <em>{financials.note}</em>
        </p>

        <hr />

        {/* ── How to Read This Report ── */}
        <h2 id="ovw-howto">How to Read This Report</h2>

        <table>
          <thead>
            <tr>
              <th>Chapter</th>
              <th>What it covers</th>
              <th>Key output</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["01 Product Profile", "What the sensor does at mechanism, function, and outcome level. Features, specs, UNSPSC classification.", "Foundation for every compatibility check that follows"],
              ["02 Functional Promise", "The two-level functional promise used as the market search query. What the product does independent of technology.", "Commodity-level promise drives the NAICS market discovery in Chapter 05"],
              ["03 Constraints", "12 physical, chemical, and operational limits. 3 are absolute barriers; 9 are conditional.", "Every new market candidate is screened against these — absolute violations eliminate a market"],
              ["04 Home Market", "Competition, alternatives, and value network position in the existing HVAC manufacturing market.", "Baseline for comparison — the sensor's current home"],
              ["05 New Market Discovery", "UNSPSC-to-NAICS cross-classification pipeline. Architecture distance scoring. 6-factor composite ranking.", "The ranked shortlist of markets to enter"],
              ["06 New Market Analysis", "Per-market deep-dive: Job-to-be-Done, ODI matrix, Kano fit, value network, alternatives, compatibility.", "Decision data per market — what to build, who to sell to, what it costs to enter"],
            ].map(([ch, what, output]) => (
              <tr key={ch}>
                <td><strong>{ch}</strong></td>
                <td>{what}</td>
                <td style={{ fontSize: 12, color: "var(--text-gray)" }}>{output}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* Sources */}
        <SourceList sources={sources} />
      </div>
    </section>
  );
}
