/**
 * ExecutiveSummary — styled callout card for exec summaries and briefing answers.
 *
 * Renders as an `.answer-box` from report.css — the yellow-tinted callout
 * with "BRIEFING ANSWER" floating label seen throughout the HTML reports.
 *
 * Usage:
 *   <ExecutiveSummary kicker="Section 0.0" title="Executive Summary">
 *     <p>...</p>
 *   </ExecutiveSummary>
 *
 *   // With sub-sections (like the original HTML):
 *   <ExecutiveSummary>
 *     <h3>Q1 — Kernfrage</h3>
 *     <p className="question">…</p>
 *     <p className="answer">…</p>
 *   </ExecutiveSummary>
 */

import type { ReactNode } from "react";

export interface ExecutiveSummaryProps {
  /** Card title shown as a mono h3 inside the box (optional). */
  title?: string;
  /** Small eyebrow kicker (optional). */
  kicker?: string;
  children: ReactNode;
}

export default function ExecutiveSummary({
  title,
  kicker,
  children,
}: ExecutiveSummaryProps) {
  return (
    <div className="answer-box">
      {kicker && (
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text-gray-dark)",
          marginBottom: 4,
        }}>
          {kicker}
        </p>
      )}
      {title && (
        <h3 style={{ marginTop: 0 }}>{title}</h3>
      )}
      {children}
    </div>
  );
}
