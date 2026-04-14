/**
 * CompatibilityTab — constraint × market compatibility analysis.
 *
 * TODO items applied:
 *  - Item 22: ExecutiveSummary at top explaining what the reader sees (constraint × market
 *    compatibility matrix), what they learn, and why it matters.
 *  - Item 23: Per-constraint SourceFootnote.
 *  - Item 24: Constraint card title is visually prominent (large h3, bold, bigger size).
 *  - Item 38: Tab has full context — executive summary ties to the current market, summary
 *    bar shows overall verdict before diving into detail cards.
 *  - Item 39: Inline SourceFootnote on every claim; SourceList at the end.
 *  - Item 40: ExecutiveSummary present.
 *
 * Layout:
 *  1. Executive summary
 *  2. Compatibility matrix summary bar (knockout / mitigable / no-impact counts)
 *  3. Per-constraint detail cards (sorted: knockouts first, then mitigable, then no-impact)
 *  4. Chapter source list
 */

import { getMarket } from "@/data";
import type { CompatAssessment } from "@/types";

import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceFootnote from "@/components/SourceFootnote";
import SourceList from "@/components/SourceList";
import SectionAnchor from "@/components/SectionAnchor";
import ClickableCode from "@/components/ClickableCode";

import CompatSummaryBar from "./compat/CompatSummaryBar";
import CompatAssessmentCard from "./compat/CompatAssessmentCard";
import { sortByVerdict } from "./compat/verdictConfig";

/* ─── Verdict ordering helper ────────────────────────────────────────────── */

/** Build source ID list for a given assessment from the market's sources array */
function buildAssessmentSourceIds(
  sources: Array<{ id: string; prefixedId?: string }>
): string[] {
  if (!sources || sources.length === 0) return [];
  // Use prefixedId when available, fall back to bare id
  return sources.map((s) => s.prefixedId ?? s.id).filter(Boolean);
}

/* ─── Main component ─────────────────────────────────────────────────────── */

export default function CompatibilityTab({ marketSlug }: { marketSlug: string }) {
  const bundle = getMarket(marketSlug);
  const data = bundle.compatibility;

  const { assessments = [], result, sources = [], marketName, naicsCode } = data;

  // Section source IDs used across all footnotes
  const sectionSourceIds = buildAssessmentSourceIds(sources);

  // Source IDs used per-assessment: prefer the market-level sources since
  // assessments don't carry their own source array in the current schema
  const assessmentSourceIds =
    sectionSourceIds.length > 0 ? sectionSourceIds : [];

  // Sort assessments: knockouts first, then mitigable, then no-impact
  const sorted = sortByVerdict(assessments as CompatAssessment[]);

  const knockouts = sorted.filter((a) => a.verdict === "knockout");
  const mitigable = sorted.filter((a) => a.verdict === "mitigable");
  const noImpact = sorted.filter((a) => a.verdict === "none");

  const hasAssessments = assessments.length > 0;
  const hasResult = !!result;

  // Running index across all cards (1-based)
  let cardIndex = 0;

  return (
    <div className="section">
      {/* Eyebrow */}
      <div className="section__eyebrow">
        Step 08 · Constraint Compatibility · {marketName}
      </div>

      {/* Title */}
      <h2 className="section__title">Compatibility Analysis</h2>

      {/* Item 38 + 22 + 40: Executive summary tying tab to current market */}
      <ExecutiveSummary kicker="Compatibility / Executive Summary">
        <p className="answer">
          This tab tests every home-market constraint against the operating conditions of{" "}
          <strong>{marketName}</strong>
          {naicsCode && (
            <>
              {" "}(<ClickableCode kind="naics" code={naicsCode} />)
            </>
          )}
          . For each constraint the question is: does this market's typical operating
          environment exceed the sensor's limit, and if so, can it be mitigated?
          <SourceFootnote sourceIds={sectionSourceIds.slice(0, 2)} />
        </p>
        <p className="answer">
          The reader learns <strong>which constraints are absolute blockers</strong> (knockouts)
          versus which require only installation discipline or minor product choices (mitigable),
          versus those with no impact whatsoever. This is the feasibility gate:{" "}
          <strong>any knockout eliminates the market before investment</strong>;
          mitigable constraints add cost-to-enter that flows into the composite ranking score.
        </p>
        {hasResult && result.marketStatus && (
          <p className="answer">
            <strong>Verdict for {marketName}:</strong>{" "}
            {result.marketStatus}.
            {result.knockouts === 0 && result.mitigable === 0
              ? " All constraints are satisfied with no mitigation required."
              : result.knockouts === 0
              ? ` ${result.mitigable} constraint${result.mitigable !== 1 ? "s" : ""} require targeted mitigation.`
              : ` ${result.knockouts} knockout${result.knockouts !== 1 ? "s" : ""} detected — market is eliminated.`}
          </p>
        )}
      </ExecutiveSummary>

      {/* ── Summary bar ───────────────────────────────────────────────────── */}
      {hasResult && (
        <CompatSummaryBar result={result} />
      )}

      {/* ── No-data state ────────────────────────────────────────────────── */}
      {!hasAssessments && (
        <p style={{ color: "var(--text-gray)", fontStyle: "italic", fontSize: 13 }}>
          Data pending — compatibility assessments for {marketName} have not yet been generated.
        </p>
      )}

      {/* ── Detail cards by verdict group ────────────────────────────────── */}
      {hasAssessments && (
        <div>
          {/* Knockouts */}
          {knockouts.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionAnchor id={`compat-knockouts-${marketSlug}`}>
                <h3 style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--status-low)",
                  marginBottom: 12,
                  marginTop: 28,
                }}>
                  Knockout Constraints ({knockouts.length})
                </h3>
              </SectionAnchor>
              {knockouts.map((a) => {
                cardIndex++;
                return (
                  <CompatAssessmentCard
                    key={a.constraintName}
                    assessment={a}
                    index={cardIndex}
                    sourceIds={assessmentSourceIds}
                  />
                );
              })}
            </div>
          )}

          {/* Mitigable */}
          {mitigable.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionAnchor id={`compat-mitigable-${marketSlug}`}>
                <h3 style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--status-medium)",
                  marginBottom: 12,
                  marginTop: 28,
                }}>
                  Mitigable Constraints ({mitigable.length})
                </h3>
              </SectionAnchor>
              {mitigable.map((a) => {
                cardIndex++;
                return (
                  <CompatAssessmentCard
                    key={a.constraintName}
                    assessment={a}
                    index={cardIndex}
                    sourceIds={assessmentSourceIds}
                  />
                );
              })}
            </div>
          )}

          {/* No-impact */}
          {noImpact.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionAnchor id={`compat-none-${marketSlug}`}>
                <h3 style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--status-high)",
                  marginBottom: 12,
                  marginTop: 28,
                }}>
                  No-Impact Constraints ({noImpact.length})
                </h3>
              </SectionAnchor>
              {noImpact.map((a) => {
                cardIndex++;
                return (
                  <CompatAssessmentCard
                    key={a.constraintName}
                    assessment={a}
                    index={cardIndex}
                    sourceIds={assessmentSourceIds}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Item 39: Chapter source list */}
      {sectionSourceIds.length > 0 && (
        <SourceList
          sourceIds={sectionSourceIds}
          title={`Sources — Compatibility · ${marketName}`}
        />
      )}
    </div>
  );
}
