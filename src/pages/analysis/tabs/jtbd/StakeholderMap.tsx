/**
 * StakeholderMap — renders the stakeholder list from JTBD data.
 *
 * Each stakeholder card shows:
 *  - Role (title)
 *  - Who description
 *  - Pyramid levels (what levels of the JTBD pyramid they operate on)
 *
 * Item 41: A legend strip decodes P1–P5 Burleson pyramid levels.
 */

import type { Stakeholder } from "@/types";

interface StakeholderMapProps {
  stakeholders: Stakeholder[];
  marketName: string;
}

/* Burleson pyramid level definitions — Item 41 legend */
const PYRAMID_LEVELS: { code: string; label: string }[] = [
  { code: "P1", label: "Core functional job" },
  { code: "P2", label: "Related jobs" },
  { code: "P3", label: "Emotional / social jobs" },
  { code: "P4", label: "Financial outcomes" },
  { code: "P5", label: "Consumption chain (acquire, install, maintain, dispose)" },
];

function PyramidLegend() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 20px",
        padding: "10px 14px",
        background: "var(--surface-dark)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        marginBottom: 16,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text-gray-dark)",
          width: "100%",
          marginBottom: 2,
        }}
      >
        Burleson Pyramid Level Key
      </span>
      {PYRAMID_LEVELS.map(({ code, label }) => (
        <div key={code} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              color: "var(--accent-yellow)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {code}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-gray-light)" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

const ROLE_ICON_COLORS: Record<string, string> = {
  operator: "#4682b4",
  manager: "#6b8e23",
  owner: "#e67e22",
  engineer: "#9b59b6",
  technician: "#1abc9c",
  procurement: "#e74c3c",
  default: "#7b9cc4",
};

function roleColor(role: string): string {
  const lower = role.toLowerCase();
  for (const [key, color] of Object.entries(ROLE_ICON_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return ROLE_ICON_COLORS.default;
}

function RoleInitial({ role }: { role: string }) {
  const color = roleColor(role);
  const initial = role.trim().charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background: `${color}22`,
        border: `1px solid ${color}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono)",
        fontWeight: 700,
        fontSize: 14,
        color,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

export default function StakeholderMap({
  stakeholders,
  marketName,
}: StakeholderMapProps) {
  if (!stakeholders || stakeholders.length === 0) {
    return (
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
        Stakeholder data pending — not yet extracted for {marketName}.
      </div>
    );
  }

  return (
    <div>
      <PyramidLegend />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
      {stakeholders.map((s, idx) => (
        <div
          key={idx}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 10,
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <RoleInitial role={s.role} />
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-white)",
                  lineHeight: 1.3,
                }}
              >
                {s.role}
              </div>
              {s.pyramidLevels && (
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-gray-dark)",
                    marginTop: 2,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {s.pyramidLevels}
                </div>
              )}
            </div>
          </div>

          {/* Who description */}
          {s.who && (
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "var(--text-gray-light)",
                lineHeight: 1.5,
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: 10,
              }}
            >
              {s.who}
            </p>
          )}
        </div>
      ))}
      </div>
    </div>
  );
}
