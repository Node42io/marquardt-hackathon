/**
 * Tabs — two-tier tab strip for the New Market Analysis page.
 *
 * Exports:
 *   - MarketTabs   — top-row large tabs for market selection
 *   - AnalysisTabs — second-row pill tabs within a selected market
 *
 * Both use CSS classes defined in report.css (added in the React additions section):
 *   .market-tabs / .market-tab / .market-tab.is-active
 *   .analysis-tabs / .analysis-tab / .analysis-tab.is-active
 *
 * Usage:
 *   <MarketTabs markets={markets} />
 *   <AnalysisTabs tabs={analysisTabs} marketSlug={slug} />
 */

import { NavLink, useParams } from "react-router-dom";

/* =========================================================================
   Types
   ========================================================================= */

export interface MarketTab {
  /** URL slug — used as :marketSlug param. */
  slug: string;
  /** Display name. */
  label: string;
  /** Small badge text (e.g. TAM size or composite score). */
  meta?: string;
}

export interface AnalysisTab {
  /** URL slug — used as :tab param. */
  slug: string;
  label: string;
}

/* =========================================================================
   MarketTabs
   ========================================================================= */

export interface MarketTabsProps {
  markets: MarketTab[];
}

/**
 * Top-row market tabs. Each tab links to `/analysis/:marketSlug`.
 * Active state is determined by the :marketSlug router param.
 */
export function MarketTabs({ markets }: MarketTabsProps) {
  const { marketSlug } = useParams<{ marketSlug?: string }>();

  return (
    <nav
      role="tablist"
      aria-label="Markets"
      className="market-tabs"
    >
      {markets.map((m) => {
        const isActive = m.slug === marketSlug;
        return (
          <NavLink
            key={m.slug}
            to={`/analysis/${m.slug}`}
            role="tab"
            aria-selected={isActive}
            className={["market-tab", isActive ? "is-active" : ""].filter(Boolean).join(" ")}
          >
            <span className="market-tab__label">{m.label}</span>
            {m.meta && (
              <span className="market-tab__meta">{m.meta}</span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

/* =========================================================================
   AnalysisTabs
   ========================================================================= */

export interface AnalysisTabsProps {
  tabs: AnalysisTab[];
  /** Current market slug — used to build the link path. */
  marketSlug: string;
}

/**
 * Second-row pill-style analysis tabs within a selected market.
 * Each tab links to `/analysis/:marketSlug/:tab`.
 */
export function AnalysisTabs({ tabs, marketSlug }: AnalysisTabsProps) {
  const { tab: activeTab } = useParams<{ tab?: string }>();

  return (
    <nav
      role="tablist"
      aria-label="Analysis sections"
      className="analysis-tabs"
    >
      {tabs.map((t) => {
        const isActive = t.slug === activeTab;
        return (
          <NavLink
            key={t.slug}
            to={`/analysis/${marketSlug}/${t.slug}`}
            role="tab"
            aria-selected={isActive}
            className={["analysis-tab", isActive ? "is-active" : ""].filter(Boolean).join(" ")}
          >
            {t.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
