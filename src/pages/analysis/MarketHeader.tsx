/**
 * MarketHeader — market-overview strip rendered below the market tab row.
 *
 * Displays: market name, NAICS code (clickable), rank, composite score,
 * recommendation badge, and one-line rationale.
 *
 * Props:
 *   meta — the per-market meta.json object (MarketMeta type)
 *   ranked — the matching RankedMarket from ranking.json (for rationale / scores)
 */

import ClickableCode from "@/components/ClickableCode";
import type { MarketMeta, RankedMarket } from "@/types";

/* ── Recommendation → badge class ── */
const REC_CLASS: Record<string, string> = {
  pursue: "badge badge--strong",
  investigate: "badge badge--moderate",
  defer: "badge badge--weak",
  "no-go": "badge badge--weak",
};

function recBadgeClass(rec: string) {
  return REC_CLASS[rec] ?? "badge badge--neutral";
}

/* ── Score pill ── */
function ScorePill({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        minWidth: 64,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-gray-dark)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--accent-yellow)",
        }}
      >
        {typeof value === "number" ? value.toFixed(2) : value}
      </span>
    </div>
  );
}

/* ── Divider ── */
function VDivider() {
  return (
    <div
      style={{
        width: 1,
        alignSelf: "stretch",
        background: "var(--divider)",
        margin: "0 4px",
      }}
    />
  );
}

export interface MarketHeaderProps {
  meta: MarketMeta;
  ranked: RankedMarket | undefined;
}

export default function MarketHeader({ meta, ranked }: MarketHeaderProps) {
  const naics = meta.naicsCode;
  const composite = ranked?.scores.composite ?? meta.scores?.composite;
  const rec = ranked?.recommendation ?? meta.recommendation;
  const rationale = ranked?.rationale ?? meta.rationale ?? "";

  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: "20px 32px",
        display: "flex",
        alignItems: "flex-start",
        gap: 24,
        flexWrap: "wrap",
      }}
    >
      {/* Left: name + NAICS + rec badge */}
      <div style={{ flex: "1 1 320px", minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 6,
          }}
        >
          {/* Rank bubble */}
          {ranked?.rank != null && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-gray-dark)",
                background: "var(--surface-dark)",
                borderRadius: 4,
                padding: "2px 6px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Rank {ranked.rank}
            </span>
          )}
          <span className={recBadgeClass(rec ?? "")}>{rec ?? "—"}</span>
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "var(--text-white)",
            lineHeight: 1.25,
            marginBottom: 6,
          }}
        >
          {meta.name}
        </div>

        <div
          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}
        >
          <ClickableCode kind="naics" code={naics} />
        </div>

        {rationale && (
          <p
            style={{
              fontSize: 12.5,
              color: "var(--text-gray-light)",
              lineHeight: 1.5,
              margin: 0,
              maxWidth: 620,
            }}
          >
            {rationale}
          </p>
        )}
      </div>

      {/* Right: score strip */}
      {ranked && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            background: "var(--bg-card-inner)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            padding: "12px 16px",
            flexShrink: 0,
          }}
        >
          <ScorePill label="Composite" value={composite ?? 0} />
          <VDivider />
          <ScorePill label="ODI" value={ranked.scores.odi} />
          <VDivider />
          <ScorePill label="Fit" value={ranked.scores.featureFit} />
          <VDivider />
          <ScorePill label="Constraint" value={ranked.scores.constraintCompatibility} />
          <VDivider />
          <ScorePill label="Incumb." value={ranked.scores.incumbentVulnerability} />
        </div>
      )}
    </div>
  );
}
