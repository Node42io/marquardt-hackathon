/**
 * Shell — root app layout: left nav sidebar + main content area.
 *
 * Sidebar structure:
 *   ANALYSIS
 *     01  Product Decomposition
 *     02  Functional Promise
 *     03  Constraints
 *     04  Home Market
 *     05  New Market Discovery
 *     06  New Market Analysis    ← tabbed
 */

import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/product", label: "Product Decomposition", kicker: "01" },
  { to: "/functional-promise", label: "Functional Promise", kicker: "02" },
  { to: "/constraints", label: "Constraints", kicker: "03" },
  { to: "/home-market", label: "Home Market", kicker: "04" },
  { to: "/discovery", label: "New Market Discovery", kicker: "05" },
  { to: "/analysis", label: "New Market Analysis", kicker: "06" },
];

export default function Shell() {
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
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/product"}
                className={({ isActive }) =>
                  ["app-nav-link", isActive ? "is-active" : ""].filter(Boolean).join(" ")
                }
              >
                <span className="app-nav-link__num">{item.kicker}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Framework footnote at bottom */}
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
          <div style={{ textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 8, marginBottom: 3 }}>
            Frameworks
          </div>
          <div style={{ color: "var(--text-gray-light)", fontSize: 11 }}>
            Christensen · Ulwick ODI · Kano · Adner VN
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
