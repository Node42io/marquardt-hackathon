/**
 * Page 06 — New Market Analysis
 *
 * Routes:
 *   /analysis                     → NoMarketSelected picker
 *   /analysis/:marketSlug         → redirect to jtbd tab
 *   /analysis/:marketSlug/:tab    → full analysis view
 *
 * Layout (when a market is selected):
 *   PageHeader (title + exec summary)
 *   MarketTabs — all 8 markets
 *   MarketHeader — name, NAICS, composite score, rec badge, rationale
 *   AnalysisTabs — jtbd / value-network / kano / compatibility / alternatives
 *   Tab content area
 */

import { Navigate, useParams } from "react-router-dom";

import { marketsIndex, ranking, markets } from "@/data";
import PageHeader from "@/components/PageHeader";
import { MarketTabs, AnalysisTabs } from "@/components/Tabs";
import type { MarketTab, AnalysisTab } from "@/components/Tabs";

import MarketHeader from "@/pages/analysis/MarketHeader";
import NoMarketSelected from "@/pages/analysis/NoMarketSelected";

// Tab components (specialist-owned — import only, do not modify)
import JTBDTab from "@/pages/analysis/tabs/JTBDTab";
import ValueNetworkTab from "@/pages/analysis/tabs/ValueNetworkTab";
import BOMTab from "@/pages/analysis/tabs/BOMTab";
import KanoTab from "@/pages/analysis/tabs/KanoTab";
import CompatibilityTab from "@/pages/analysis/tabs/CompatibilityTab";
import AlternativesTab from "@/pages/analysis/tabs/AlternativesTab";

/* =========================================================================
   Constants
   ========================================================================= */

const ANALYSIS_TABS: AnalysisTab[] = [
  { slug: "jtbd", label: "Job-to-be-Done Analysis" },
  { slug: "value-network", label: "Value Network" },
  { slug: "bom", label: "Bill of Materials" },
  { slug: "kano", label: "Kano Analysis" },
  { slug: "compatibility", label: "Compatibility & Constraint Analysis" },
  { slug: "alternatives", label: "Alternative Solutions Analysis" },
];

const DEFAULT_TAB = "jtbd";

/* =========================================================================
   Build the market tab list from ranking.json (rank order) merged with
   the index.json for slug→name, falling back on index order.
   ========================================================================= */
function buildMarketTabs(): MarketTab[] {
  // Create a rank lookup by slug
  const rankBySLug = Object.fromEntries(
    ranking.rankedMarkets.map((rm) => [
      rm.slug,
      { rank: rm.rank, composite: rm.scores.composite },
    ])
  );

  return marketsIndex.map((m) => {
    const ranked = rankBySLug[m.slug];
    return {
      slug: m.slug,
      label: m.name,
      meta: ranked && ranked.composite != null ? ranked.composite.toFixed(2) : undefined,
    };
  });
}

/* =========================================================================
   Tab switcher — renders the correct tab component for the active slug
   ========================================================================= */
function TabContent({
  tabSlug,
  marketSlug,
}: {
  tabSlug: string;
  marketSlug: string;
}) {
  switch (tabSlug) {
    case "jtbd":
      return <JTBDTab marketSlug={marketSlug} />;
    case "value-network":
      return <ValueNetworkTab marketSlug={marketSlug} />;
    case "bom":
      return <BOMTab marketSlug={marketSlug} />;
    case "kano":
      return <KanoTab marketSlug={marketSlug} />;
    case "compatibility":
      return <CompatibilityTab marketSlug={marketSlug} />;
    case "alternatives":
      return <AlternativesTab marketSlug={marketSlug} />;
    default:
      // Unknown tab — fallback to jtbd
      return <JTBDTab marketSlug={marketSlug} />;
  }
}

/* =========================================================================
   Main page component
   ========================================================================= */
export default function NewMarketAnalysis() {
  const { marketSlug, tab } = useParams<{
    marketSlug?: string;
    tab?: string;
  }>();

  // ── Case 1: no slug at all → show market picker
  if (!marketSlug) {
    return <NoMarketSelected />;
  }

  // ── Case 2: slug given but no tab → redirect to default tab
  if (!tab) {
    return <Navigate to={`/analysis/${marketSlug}/${DEFAULT_TAB}`} replace />;
  }

  // ── Case 3: validate the slug
  const bundle = markets[marketSlug];
  if (!bundle) {
    return (
      <div style={{ padding: "48px 56px" }}>
        <PageHeader
          kicker="Page · 06 / New Market Analysis"
          title="Market not found"
          description={`No market data found for slug: "${marketSlug}". Please select a valid market.`}
        />
      </div>
    );
  }

  // ── Data for this market
  const meta = bundle.meta;
  const ranked = ranking.rankedMarkets.find((rm) => rm.slug === marketSlug);
  const marketTabs = buildMarketTabs();

  return (
    <div>
      {/* ─── Page header ─────────────────────────────────────────────── */}
      <PageHeader
        kicker="Page 06 / Deep-dive per market"
        title="New Market Analysis"
        description={ranking.executiveSummary}
      />

      {/* ─── Market tab row ───────────────────────────────────────────── */}
      <MarketTabs markets={marketTabs} />

      {/* ─── Market overview strip ────────────────────────────────────── */}
      <MarketHeader meta={meta} ranked={ranked} />

      {/* ─── Analysis tab row ─────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          padding: "0 32px",
          background: "var(--bg-page)",
        }}
      >
        <AnalysisTabs tabs={ANALYSIS_TABS} marketSlug={marketSlug} />
      </div>

      {/* ─── Tab content ──────────────────────────────────────────────── */}
      <div style={{ padding: "0 56px" }}>
        <TabContent tabSlug={tab} marketSlug={marketSlug} />
      </div>
    </div>
  );
}
