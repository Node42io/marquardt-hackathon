/**
 * Hero — big intro card for top-level pages.
 *
 * Matches the `.hero` pattern from the HTML reports — eyebrow, large headline,
 * subhead text, and optional stat tiles or summary content.
 *
 * CSS classes used: .hero, .hero__eyebrow, .hero__headline, .hero__subhead
 * (all from report.css).
 *
 * Usage:
 *   <Hero
 *     eyebrow="Clayton Analysis · 2026-04-14"
 *     headline="Eight applications, three beachheads"
 *     subhead="Marquardt's DN20 ultrasonic flow sensor scored against 8 NAICS adjacencies."
 *   />
 *
 *   // With rich children (stat tiles, answer box, etc.):
 *   <Hero eyebrow="..." headline="...">
 *     <div className="stat-row">…</div>
 *   </Hero>
 */

import type { ReactNode } from "react";
import ExecutiveSummary from "@/components/ExecutiveSummary";

export interface HeroProps {
  /** Mono eyebrow line above the headline (e.g. "Clayton Analysis · 2026-04-14"). */
  eyebrow?: string;
  /** Large hero headline. Supports JSX for `.accent` spans. */
  headline: ReactNode;
  /** Subhead paragraph text. */
  subhead?: string;
  /** Short string summary — rendered inside an ExecutiveSummary block below the subhead. */
  summary?: string;
  /** Rich summary content — takes precedence over `summary` string. */
  children?: ReactNode;
  /** Executive summary kicker (default: none). */
  summaryKicker?: string;
}

export default function Hero({
  eyebrow,
  headline,
  subhead,
  summary,
  children,
  summaryKicker,
}: HeroProps) {
  const hasSummary = Boolean(children || summary);

  return (
    <div className="hero">
      {eyebrow && (
        <div className="hero__eyebrow">{eyebrow}</div>
      )}
      <h1 className="hero__headline">{headline}</h1>
      {subhead && (
        <p className="hero__subhead">{subhead}</p>
      )}
      {hasSummary && (
        <ExecutiveSummary kicker={summaryKicker}>
          {children ?? <p className="answer">{summary}</p>}
        </ExecutiveSummary>
      )}
    </div>
  );
}
