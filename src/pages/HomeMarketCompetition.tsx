/**
 * Page: /home-market  and  /home-market/:tab
 * 04 Home Market — tabbed layout matching New Market Analysis structure.
 *
 * Tabs (in order):
 *   competition   — Home Market Competition (existing content)
 *   jtbd          — Job-to-be-Done Analysis
 *   value-network — Value Network & BOM
 *   kano          — Kano Analysis
 *   compatibility — Compatibility & Constraint Analysis
 *   alternatives  — Alternative Solutions Analysis
 *
 * Default tab: competition
 */

import { NavLink, useParams } from "react-router-dom";

import PageHeader from "@/components/PageHeader";
import ExecutiveSummary from "@/components/ExecutiveSummary";

// Existing competition section — DO NOT modify the source file
import HomeMarketCompetitionSection from "@/pages/home/HomeMarketCompetition";

// Tab components — same ones used by New Market Analysis
import JTBDTab from "@/pages/analysis/tabs/JTBDTab";
import ValueNetworkTab from "@/pages/analysis/tabs/ValueNetworkTab";
import BOMTab from "@/pages/analysis/tabs/BOMTab";
import KanoTab from "@/pages/analysis/tabs/KanoTab";
import CompatibilityTab from "@/pages/analysis/tabs/CompatibilityTab";
import AlternativesTab from "@/pages/analysis/tabs/AlternativesTab";

/* =========================================================================
   Constants
   ========================================================================= */

const HOME_MARKET_SLUG = "ac-home-heating";

const HOME_TABS = [
  { slug: "competition", label: "Market Competition" },
  { slug: "jtbd", label: "Job-to-be-Done Analysis" },
  { slug: "value-network", label: "Value Network" },
  { slug: "bom", label: "Bill of Materials" },
  { slug: "kano", label: "Kano Analysis" },
  { slug: "compatibility", label: "Compatibility & Constraint Analysis" },
  { slug: "alternatives", label: "Alternative Solutions Analysis" },
];

const VALID_TABS = new Set(HOME_TABS.map((t) => t.slug));
const DEFAULT_TAB = "competition";

/* =========================================================================
   Local tab strip (links to /home-market/:tab instead of /analysis/...)
   Uses the same .analysis-tabs / .analysis-tab CSS classes as AnalysisTabs.
   ========================================================================= */

function HomeMarketTabStrip({ activeTab }: { activeTab: string }) {
  return (
    <nav
      role="tablist"
      aria-label="Home market sections"
      className="analysis-tabs"
    >
      {HOME_TABS.map((t) => (
        <NavLink
          key={t.slug}
          to={`/home-market/${t.slug}`}
          role="tab"
          aria-selected={t.slug === activeTab}
          className={[
            "analysis-tab",
            t.slug === activeTab ? "is-active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}

/* =========================================================================
   Tab content switcher
   ========================================================================= */

function TabContent({ tabSlug }: { tabSlug: string }) {
  switch (tabSlug) {
    case "competition":
      return <HomeMarketCompetitionSection />;
    case "jtbd":
      return <JTBDTab marketSlug={HOME_MARKET_SLUG} />;
    case "value-network":
      return <ValueNetworkTab marketSlug={HOME_MARKET_SLUG} />;
    case "bom":
      return <BOMTab marketSlug={HOME_MARKET_SLUG} />;
    case "kano":
      return <KanoTab marketSlug={HOME_MARKET_SLUG} />;
    case "compatibility":
      return <CompatibilityTab marketSlug={HOME_MARKET_SLUG} />;
    case "alternatives":
      return <AlternativesTab marketSlug={HOME_MARKET_SLUG} />;
    default:
      return <HomeMarketCompetitionSection />;
  }
}

/* =========================================================================
   Main page component
   ========================================================================= */

export default function HomeMarketCompetition() {
  const { tab } = useParams<{ tab?: string }>();

  // Resolve active tab — fall back to default when missing or invalid
  const activeTab =
    tab && VALID_TABS.has(tab) ? tab : DEFAULT_TAB;

  return (
    <div>
      {/* ─── Page header ─────────────────────────────────────────────── */}
      <PageHeader
        kicker="04 · Market Competition · NAICS 333415"
        title="Market Competition"
      />

      {/* ─── Executive summary ────────────────────────────────────────── */}
      <div style={{ padding: "0 56px" }}>
        <ExecutiveSummary kicker="Market Competition / Overview" title="Our current ground">
          <p className="answer">
            Air-Conditioning and Warm Air Heating Equipment Manufacturing (NAICS 333415) is the
            Marquardt ultrasonic flow sensor's current, commercialized home market — the OEM
            slot inside residential and commercial heat pumps, boilers, and solar thermal systems.
            The Competition tab maps the incumbent technology landscape here, covering the six
            competing measurement technologies, their market-share tiers, and switching-cost
            dynamics. The remaining tabs — Job-to-be-Done, Value Network, Kano, Compatibility,
            and Alternatives — use the same analysis applied throughout New Market
            Analysis, giving a home-market baseline against which every new-market opportunity
            can be directly benchmarked.
          </p>
        </ExecutiveSummary>
      </div>

      {/* ─── Tab strip ────────────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          padding: "0 32px",
          background: "var(--bg-page)",
        }}
      >
        <HomeMarketTabStrip activeTab={activeTab} />
      </div>

      {/* ─── Tab content ──────────────────────────────────────────────── */}
      <div style={{ padding: "0 56px" }}>
        <TabContent tabSlug={activeTab} />
      </div>
    </div>
  );
}
