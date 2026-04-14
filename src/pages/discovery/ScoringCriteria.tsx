/**
 * ScoringCriteria — explains the 6-factor composite scoring model.
 * Item 36 from TODO list: opens with ExecutiveSummary + per-criterion explanations.
 */

import SectionAnchor from "@/components/SectionAnchor";
import ExecutiveSummary from "@/components/ExecutiveSummary";

const CRITERIA = [
  {
    code: "ODI",
    weight: "25%",
    name: "Customer Outcome Opportunity Score",
    description:
      "Sum of unmet customer-outcome opportunity scores per market (formula: Importance + max(Importance − Satisfaction, 0)). Higher = more demand waiting to be satisfied.",
  },
  {
    code: "Fit",
    weight: "15%",
    name: "Feature-Market Fit",
    description:
      "Average of technical feature ratings × vendor positioning scores across all matched features. Measures how well the sensor's specific capabilities align with what each market prizes.",
  },
  {
    code: "Constraint",
    weight: "15%",
    name: "Constraint Compatibility",
    description:
      "Starts at 10.0; deductions applied for each mitigable barrier (low: −0.5, medium: −1.0, high: −2.0). Knockout constraints (not present in any surviving market) would floor the score at 0.",
  },
  {
    code: "Coverage",
    weight: "15%",
    name: "Job Coverage",
    description:
      "Fraction of the 8-step job map that the sensor directly serves in each market × 10. HVAC contractors earn 10.00 because the sensor covers all 8 steps; most markets score 7.50 (6/8 steps).",
  },
  {
    code: "VN",
    weight: "10%",
    name: "Value Network Hierarchy",
    description:
      "Positional score based on where the sensor sits in each market's value chain: deep component = 3.0, mid-chain = 6.0, customer-facing = 9.0, adjusted by chain depth. Lower = more commodity risk.",
  },
  {
    code: "Incumbent",
    weight: "20%",
    name: "Incumbent Vulnerability",
    description:
      "Composite of technology obsolescence risk, market fragmentation bonus, and switching-cost penalty for entrenched players. High = incumbents are weak, fragmented, or using inferior technology.",
  },
];

export default function ScoringCriteria() {
  return (
    <section id="scoring-criteria" className="container">
      <SectionAnchor id="scoring-criteria" title="Scoring Criteria" />

      <ExecutiveSummary title="How We Rank Markets">
        <p className="answer">
          Each candidate market is scored on six independent dimensions, then
          combined into a single <strong>composite score</strong> using
          theory-grounded weights. The formula is:
        </p>
        <p className="answer" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
          composite = ODI × 0.25 + Fit × 0.15 + Constraint × 0.15 + Coverage
          × 0.15 + VN × 0.10 + Incumbent × 0.20
        </p>
        <p className="answer">
          Thresholds: <strong>&gt; 7.5 → Pursue</strong> |{" "}
          <strong>5.0–7.5 → Investigate</strong> |{" "}
          <strong>3.0–5.0 → Defer</strong> |{" "}
          <strong>&lt; 3.0 → No-Go</strong>. The purpose is to surface the
          best risk-adjusted bets quickly, not to replace customer-discovery
          interviews. Every investigate recommendation should be validated with
          real buyer conversations before resource allocation.
        </p>
      </ExecutiveSummary>

      <div className="md">
        <table>
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Weight</th>
              <th>What it measures</th>
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((c) => (
              <tr key={c.code}>
                <td>
                  <strong>{c.code}</strong>
                  <small style={{ display: "block", color: "var(--text-gray)", fontSize: 11, marginTop: 2 }}>
                    {c.name}
                  </small>
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {c.weight}
                </td>
                <td>{c.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
