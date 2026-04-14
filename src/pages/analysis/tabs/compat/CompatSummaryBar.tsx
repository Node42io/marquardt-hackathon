/**
 * CompatSummaryBar — at-a-glance result strip for the compatibility tab.
 *
 * Shows knockout count, mitigable count, and no-impact count in three
 * stat-tile style boxes, plus the overall market status verdict.
 */

import type { CompatResult } from "@/types";

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 10,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text-gray-dark)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 28,
          fontWeight: 500,
          color: accent ?? "var(--text-white)",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function CompatSummaryBar({ result }: { result: CompatResult }) {
  const statusIsGood = result.knockouts === 0;
  const statusColor = statusIsGood ? "var(--status-high)" : "var(--status-low)";
  const statusBg = statusIsGood
    ? "rgba(111,213,155,0.07)"
    : "rgba(213,111,111,0.07)";
  const statusBorder = statusIsGood
    ? "1px solid rgba(111,213,155,0.25)"
    : "1px solid rgba(213,111,111,0.25)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
      {/* Status banner */}
      <div
        style={{
          background: statusBg,
          border: statusBorder,
          borderRadius: 10,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 16, color: statusColor }}>{statusIsGood ? "✓" : "✗"}</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: statusColor,
          }}
        >
          {result.marketStatus || (statusIsGood ? "SURVIVING" : "ELIMINATED")}
        </span>
        {result.totalMitigationCost && (
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-gray)",
            }}
          >
            Mitigation cost: {result.totalMitigationCost}
            {result.totalMitigationTime ? ` · ${result.totalMitigationTime}` : ""}
          </span>
        )}
      </div>

      {/* Stat boxes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatBox
          label="Knockout constraints"
          value={result.knockouts ?? 0}
          accent={result.knockouts > 0 ? "var(--status-low)" : "var(--status-high)"}
        />
        <StatBox
          label="Mitigable constraints"
          value={result.mitigable ?? 0}
          accent={result.mitigable > 0 ? "var(--status-medium)" : "var(--text-gray-light)"}
        />
        <StatBox
          label="No-impact constraints"
          value={result.none ?? 0}
          accent="var(--text-gray-light)"
        />
      </div>
    </div>
  );
}
