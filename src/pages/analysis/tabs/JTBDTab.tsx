/**
 * JTBDTab — Job-to-be-Done Analysis tab for the New Market Analysis page.
 *
 * Sub-sections rendered in order:
 *  1. Executive summary
 *  2. Outcome-Driven Innovation needs matrix (ODI)
 *  3. Job-to-be-Done pyramid / Job Map
 *  4. Stakeholders
 *
 * Data source: per-market jtbd.json + odi.json loaded via the shared data layer.
 *
 * TODO items implemented:
 *   #1  Job map: verb prominent, "This step is about…" description
 *   #2  ODI rationale helper text (importance + satisfaction)
 *   #3  Overserved badge: satisfaction > importance
 *   #5  Opportunity score tooltip with formula substitution
 *   #8  Click-to-expand need detail panel (no attributes / incumbent fields)
 *   #9  Plain-language column labels with explanatory tooltips
 *   #41 "Outcome-Driven Innovation" on first mention, "ODI" thereafter
 */

import { useState } from "react";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceList from "@/components/SourceList";
import NeedsList from "./jtbd/NeedsList";
import JobMap from "./jtbd/JobMap";
import StakeholderMap from "./jtbd/StakeholderMap";
import ODIMatrix from "./jtbd/ODIMatrix";
import JTBDPyramid from "./jtbd/JTBDPyramid";
import { loadMarketData } from "./jtbd/loadMarketData";
import type { ODINeed } from "@/types";

export default function JTBDTab({ marketSlug }: { marketSlug: string }) {
  const { jtbd, odi } = loadMarketData(marketSlug);
  // Track the need selected in the ODI matrix so we can scroll to it in NeedsList
  const [matrixSelected, setMatrixSelected] = useState<ODINeed | null>(null);

  // ── Graceful fallback for completely unknown markets ──────────────────────
  if (!jtbd && !odi) {
    return (
      <div className="section">
        <div className="section__eyebrow">JTBD · {marketSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</div>
        <h2 className="section__title">Job-to-be-Done Analysis</h2>
        <p className="section__sub" style={{ fontStyle: "italic" }}>
          Data pending — this market has not yet been extracted.
        </p>
      </div>
    );
  }

  const marketName = jtbd?.marketName ?? odi?.marketName ?? marketSlug;
  const coreJob = jtbd?.coreJobStatement;
  const jobSteps = jtbd?.jobSteps ?? [];
  const stakeholders = jtbd?.stakeholders ?? [];
  const odiNeeds = odi?.needs ?? [];

  // ── Source IDs for the SourceList footers ────────────────────────────────
  const jtbdSourceIds = (jtbd?.sources ?? [])
    .map((s) => s.prefixedId ?? s.id)
    .filter(Boolean) as string[];
  const odiSourceIds = (odi?.sources ?? [])
    .map((s) => s.prefixedId ?? s.id)
    .filter(Boolean) as string[];

  // ── ODI summary stats ────────────────────────────────────────────────────
  const underservedCount = odiNeeds.filter(
    (n) => n.isUnderserved ?? (n.importance >= 7 && n.satisfaction < 5)
  ).length;
  const overservedCount = odiNeeds.filter(
    (n) => n.satisfaction > n.importance
  ).length;
  const highOppCount = odiNeeds.filter((n) => n.opportunity >= 12).length;

  return (
    <div className="section">
      {/* ── Eyebrow + title ─────────────────────────────────────────────── */}
      <div className="section__eyebrow">JTBD · {marketName}</div>
      <h2 className="section__title">Job-to-be-Done Analysis</h2>
      {coreJob && (
        <p
          className="section__sub"
          style={{ fontStyle: "italic", color: "var(--text-gray-light)" }}
        >
          Core job: {coreJob}
        </p>
      )}

      {/* ── Executive summary ───────────────────────────────────────────── */}
      <ExecutiveSummary kicker="Section overview">
        <p style={{ margin: 0, lineHeight: 1.7 }}>
          Below we break down the main job your customer is trying to get done in this
          market, score how well current solutions deliver it, and pinpoint where the
          biggest opportunities lie. The{" "}
          <strong>opportunity score</strong> reveals exactly where the market is
          underserved. Below you will find: (1) the customer outcome opportunities matrix ranking all
          {odiNeeds.length > 0 ? ` ${odiNeeds.length}` : ""} identified outcomes,
          (2) the job map showing each step customers execute to complete their core
          job, and (3) the key stakeholders involved in the buying and usage process.
        </p>

        {/* Summary stats */}
        {odiNeeds.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 20,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Total outcomes", value: odiNeeds.length },
              { label: "Underserved (opp ≥ 12)", value: highOppCount },
              { label: "Underserved (imp > sat)", value: underservedCount },
              { label: "Overserved (sat > imp)", value: overservedCount },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "var(--accent-yellow)",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--text-gray-dark)",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
      </ExecutiveSummary>

      {/* ══════════════════════════════════════════════════════════════════
          Section 1 — Customer Outcome Opportunities
          ══════════════════════════════════════════════════════════════════ */}
      <div style={{ marginTop: 40 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-white)",
            }}
          >
            Customer Outcome Opportunities (ODI Matrix)
          </h3>
          <span
            className="badge badge--neutral"
            style={{ fontSize: 10 }}
          >
            {odiNeeds.length} outcomes
          </span>
        </div>

        <p
          style={{
            margin: "0 0 20px",
            fontSize: 13,
            color: "var(--text-gray-light)",
            lineHeight: 1.6,
          }}
        >
          Each outcome is scored using the opportunity formula:{" "}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--accent-yellow)",
            }}
          >
            Opportunity = Importance + (Importance − Satisfaction)
          </span>
          . Scores above 12 indicate high market whitespace. Click any row to
          expand the full rationale. Overserved outcomes (where satisfaction
          exceeds importance) are marked separately.
        </p>

        {/* ODI Matrix scatter-plot (above the table) */}
        {odiNeeds.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <ODIMatrix
              needs={odiNeeds}
              marketName={marketName}
              onNeedSelected={setMatrixSelected}
            />
          </div>
        )}

        {odiNeeds.length > 0 ? (
          <NeedsList needs={odiNeeds} highlightNeed={matrixSelected} />
        ) : (
          <div
            style={{
              padding: "32px 28px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              color: "var(--text-gray-dark)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontStyle: "italic",
            }}
          >
            ODI needs data pending for this market.
          </div>
        )}

        {odiSourceIds.length > 0 && (
          <SourceList sourceIds={odiSourceIds} title="Sources — Customer Outcome Opportunities" />
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          Section 2 — Customer Needs Pyramid
          ══════════════════════════════════════════════════════════════════ */}
      <div style={{ marginTop: 56 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-white)",
            }}
          >
            Job-to-be-Done Pyramid
          </h3>
          <span className="badge badge--neutral" style={{ fontSize: 10 }}>
            5-tier customer needs pyramid
          </span>
        </div>

        <JTBDPyramid jtbd={jtbd} odi={odi} marketName={marketName} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          Section 3 — Job Map
          ══════════════════════════════════════════════════════════════════ */}
      <div style={{ marginTop: 56 }}>
        <div style={{ marginBottom: 16 }}>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-white)",
            }}
          >
            Job Map
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "var(--text-gray-light)",
              lineHeight: 1.6,
            }}
          >
            The job map breaks the customer's core job into discrete sequential
            steps. Steps highlighted in{" "}
            <span style={{ color: "var(--accent-yellow)" }}>yellow</span> are
            directly relevant to flow sensing; dimmed steps represent phases
            where the Marquardt sensor has limited or no touchpoint.
          </p>
        </div>

        <JobMap
          steps={jobSteps}
          odiNeeds={odiNeeds}
          marketName={marketName}
          naicsCode={jtbd?.naicsCode ?? odi?.naicsCode}
        />

        {jtbdSourceIds.length > 0 && (
          <SourceList sourceIds={jtbdSourceIds} title="Sources — Job-to-be-Done Analysis" />
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          Section 4 — Stakeholders
          ══════════════════════════════════════════════════════════════════ */}
      <div style={{ marginTop: 56 }}>
        <div style={{ marginBottom: 16 }}>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-white)",
            }}
          >
            Stakeholders
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "var(--text-gray-light)",
              lineHeight: 1.6,
            }}
          >
            Key roles involved in purchasing, operating, and maintaining flow
            measurement solutions in this market — and their JTBD pyramid level
            (which layer of the job hierarchy they primarily act on).
          </p>
        </div>

        <StakeholderMap stakeholders={stakeholders} marketName={marketName} />
      </div>
    </div>
  );
}
