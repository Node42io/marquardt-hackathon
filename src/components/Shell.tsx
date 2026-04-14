/**
 * Shell — root app layout: left nav sidebar + main content area.
 *
 * Sidebar structure:
 *   ANALYSIS
 *     01  Product Profile       ▶ (expandable section links)
 *     02  Functional Promise    ▶
 *     03  Constraints           ▶
 *     04  Market Competition
 *     05  New Market Discovery
 *     06  New Market Analysis    ← tabbed
 */

import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

interface NavSection {
  id: string;
  label: string;
  sub?: boolean;
}

interface NavItem {
  to: string;
  label: string;
  kicker: string;
  sections?: NavSection[];
}

const navItems: NavItem[] = [
  {
    to: "/overview",
    label: "Overview",
    kicker: "00",
    sections: [
      { id: "ovw-question",   label: "The Question" },
      { id: "ovw-company",    label: "About Marquardt" },
      { id: "ovw-hierarchy",  label: "Division → Product" },
      { id: "ovw-product",    label: "Sensor Variants" },
      { id: "ovw-portfolio",  label: "Market Priorities" },
      { id: "ovw-financials", label: "Financial Scenarios" },
      { id: "ovw-howto",      label: "How to Read" },
    ],
  },
  {
    to: "/product",
    label: "Product Profile",
    kicker: "01",
    sections: [
      { id: "prod-three-levels", label: "What the Sensor Does" },
      { id: "prod-tech-class",   label: "Technology Classification" },
      { id: "prod-fp",           label: "Functional Promise" },
      { id: "prod-commodity-fp", label: "Commodity-Level FP", sub: true },
      { id: "prod-features",     label: "Features" },
      { id: "prod-specs",        label: "Specifications" },
      { id: "prod-constraints",  label: "Key Constraints" },
      { id: "prod-unspsc",       label: "UNSPSC Classification" },
      { id: "prod-validation",   label: "Validation Notes" },
      { id: "prod-sources",      label: "Sources" },
    ],
  },
  {
    to: "/functional-promise",
    label: "Functional Promise",
    kicker: "02",
    sections: [
      { id: "fp-mechanism",    label: "Underlying Mechanism" },
      { id: "fp-product-fp",  label: "Product Functional Promise" },
      { id: "fp-unspsc",      label: "UNSPSC Classification" },
      { id: "fp-extension",   label: "FP Extension", sub: true },
      { id: "fp-bom",         label: "BOM Position" },
      { id: "fp-complements", label: "Required Complements" },
      { id: "fp-downstream",  label: "Downstream Analysis" },
      { id: "fp-quality",     label: "Quality Checklist" },
      { id: "fp-sources",     label: "Sources" },
    ],
  },
  {
    to: "/constraints",
    label: "Constraints",
    kicker: "03",
    sections: [
      { id: "con-summary",      label: "Summary" },
      { id: "con-detailed",     label: "Detailed Constraints" },
      { id: "con-physical",     label: "Physical", sub: true },
      { id: "con-chemical",     label: "Chemical", sub: true },
      { id: "con-operational",  label: "Operational", sub: true },
      { id: "con-economic",     label: "Economic", sub: true },
      { id: "con-regulatory",   label: "Regulatory", sub: true },
      { id: "con-environmental",label: "Environmental", sub: true },
      { id: "con-coverage",     label: "Coverage Table" },
      { id: "con-absolute",     label: "Absolute vs Conditional" },
      { id: "con-downstream",   label: "Downstream Analysis" },
      { id: "con-sources",      label: "Sources" },
    ],
  },
  { to: "/home-market", label: "Market Competition", kicker: "04" },
  { to: "/discovery", label: "New Market Discovery", kicker: "05" },
  { to: "/analysis", label: "New Market Analysis", kicker: "06" },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Shell() {
  const location = useLocation();
  // Track which nav items have their sections expanded.
  // Key = nav item `to` path. Auto-expand the active route.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Auto-expand when the active route changes
  useEffect(() => {
    const activeItem = navItems.find((item) =>
      location.pathname === item.to ||
      location.pathname.startsWith(item.to + "/") ||
      (item.to === "/overview" && location.pathname === "/")
    );
    if (activeItem?.sections) {
      setExpanded((prev) => ({ ...prev, [activeItem.to]: true }));
    }
  }, [location.pathname]);

  function toggle(to: string) {
    setExpanded((prev) => ({ ...prev, [to]: !prev[to] }));
  }

  return (
    <div className="app-shell">
      {/* Left navigation sidebar */}
      <aside className="app-sidebar">
        {/* Brand block */}
        <div className="app-sidebar__brand">
          <div className="app-sidebar__brand-kicker">Clayton / Node42</div>
          <div className="app-sidebar__brand-title">
            Marquardt Ultrasonic Flow Sensor
          </div>
          <div className="app-sidebar__brand-sub">New-Markets Analysis</div>
        </div>

        {/* Navigation */}
        <div className="app-sidebar__section">
          <div className="app-sidebar__section-label">Analysis</div>
          <nav>
            {navItems.map((item) => {
              const hasSections = item.sections && item.sections.length > 0;
              const isOpen = hasSections && !!expanded[item.to];

              return (
                <div key={item.to}>
                  {/* Main nav row */}
                  <div style={{ display: "flex", alignItems: "stretch" }}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/overview" || item.to === "/product"}
                      className={({ isActive }) =>
                        ["app-nav-link", isActive ? "is-active" : ""].filter(Boolean).join(" ")
                      }
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <span className="app-nav-link__num">{item.kicker}</span>
                      <span>{item.label}</span>
                    </NavLink>

                    {/* Chevron toggle — only for items with sections */}
                    {hasSections && (
                      <button
                        onClick={() => toggle(item.to)}
                        title={isOpen ? "Collapse sections" : "Expand sections"}
                        style={{
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 28,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          color: "var(--text-gray-dark)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: 9,
                            transition: "transform 0.2s ease",
                            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                            color: isOpen ? "var(--accent-yellow)" : "var(--text-gray-dark)",
                          }}
                        >
                          ▶
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Section links — slide in/out */}
                  {hasSections && (
                    <div
                      style={{
                        maxHeight: isOpen ? `${item.sections!.length * 26 + 8}px` : "0px",
                        overflow: "hidden",
                        transition: "max-height 0.25s ease",
                      }}
                    >
                      <div style={{ paddingBottom: 4 }}>
                        {item.sections!.map((sec) => (
                          <button
                            key={sec.id}
                            onClick={() => scrollToSection(sec.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              width: "100%",
                              textAlign: "left",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: `3px 10px 3px ${sec.sub ? 36 : 28}px`,
                              fontSize: 11,
                              color: "var(--text-gray-dark)",
                              fontFamily: "inherit",
                              lineHeight: 1.4,
                              transition: "color 0.15s ease",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "var(--accent-yellow)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = "var(--text-gray-dark)")
                            }
                          >
                            <span
                              style={{
                                fontSize: 8,
                                opacity: 0.5,
                                flexShrink: 0,
                              }}
                            >
                              {sec.sub ? "└" : "·"}
                            </span>
                            {sec.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Tagline at bottom */}
        <div style={{
          padding: "20px",
          marginTop: "auto",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--text-gray-dark)",
          lineHeight: 1.6,
          borderTop: "1px solid var(--border-subtle)",
        }}>
          <div style={{ textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>
            Archetype
          </div>
          <div style={{ color: "var(--text-gray-light)", fontSize: 11 }}>
            New Markets for Existing Product
          </div>
          <div style={{ color: "var(--text-gray-light)", fontSize: 11, marginTop: 8 }}>
            Data-driven market analysis across product, customer, value network, and competitive landscape
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
