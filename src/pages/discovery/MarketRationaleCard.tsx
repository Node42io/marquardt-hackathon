/**
 * MarketRationaleCard — per-market rationale, entry strategy, and score breakdown.
 * One card rendered per ranked market.
 */

import { Link } from "react-router-dom";
import ClickableCode from "@/components/ClickableCode";
import type { RankedMarket } from "./types";

interface Props {
  market: RankedMarket;
}

const REC_BADGE: Record<string, string> = {
  pursue: "badge badge--strong",
  investigate: "badge badge--moderate",
  defer: "badge badge--neutral",
  "no-go": "badge badge--weak",
};

function ScoreBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div
      style={{
        background: "var(--surface-dark)",
        borderRadius: 3,
        height: 4,
        width: "100%",
        overflow: "hidden",
        marginTop: 4,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: pct >= 70 ? "var(--status-high)" : pct >= 40 ? "var(--status-medium)" : "var(--status-low)",
          borderRadius: 3,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

function ScoreDimension({ label, value }: { label: string; value: number | null | undefined }) {
  const isMissing = value == null;
  return (
    <div style={{ minWidth: 90 }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-gray-dark)",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          fontWeight: 600,
          color: isMissing ? "var(--text-gray-dark)" : "var(--text-white)",
        }}
      >
        {isMissing ? "—" : value.toFixed(2)}
      </div>
      {isMissing ? <div style={{ height: 6, marginTop: 4 }} /> : <ScoreBar value={value} />}
    </div>
  );
}

/**
 * Parse the pipe-separated entry strategy into bullets.
 * Strategies are formatted as "1) ... 2) ... 3) ..."
 */
function parseStrategySteps(raw: string): string[] {
  // Split on numbered items like "1)" "2)" etc.
  const parts = raw.split(/\d+\)/).map((s) => s.trim()).filter(Boolean);
  return parts;
}

export default function MarketRationaleCard({ market }: Props) {
  const steps = parseStrategySteps(market.entryStrategy);
  const isReference = market.naicsCode === "41112501";

  return (
    <div
      id={`market-${market.slug}`}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 14,
        padding: "28px 32px",
        marginBottom: 20,
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--accent-yellow)",
              marginBottom: 6,
            }}
          >
            Rank {market.rank}
          </div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 500,
              color: "var(--text-white)",
              marginBottom: 8,
              lineHeight: 1.25,
            }}
          >
            {market.marketName}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <ClickableCode kind="naics" code={market.naicsCode} />
            <span className={REC_BADGE[market.recommendation] ?? "badge badge--neutral"}>
              {market.recommendation}
            </span>
            {isReference && (
              <span className="badge badge--neutral">reference only</span>
            )}
          </div>
        </div>

        {/* Composite score */}
        <div
          style={{
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray-dark)",
              marginBottom: 4,
            }}
          >
            Composite
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--accent-yellow)",
              lineHeight: 1,
            }}
          >
            {market.scores.composite != null ? market.scores.composite.toFixed(2) : "—"}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--text-gray-dark)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginTop: 4,
            }}
          >
            /10
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          padding: "16px 0",
          borderTop: "1px solid var(--divider)",
          borderBottom: "1px solid var(--divider)",
          marginBottom: 20,
        }}
      >
        <ScoreDimension label="ODI" value={market.scores.odi} />
        <ScoreDimension label="Fit" value={market.scores.featureFit} />
        <ScoreDimension label="Constraint" value={market.scores.constraintCompatibility} />
        <ScoreDimension label="Coverage" value={market.scores.jobCoverage} />
        <ScoreDimension label="VN" value={market.scores.vnHierarchy} />
        <ScoreDimension label="Incumbent" value={market.scores.incumbentVulnerability} />
      </div>

      {/* Rationale */}
      <div className="md" style={{ marginBottom: 20 }}>
        <h4 style={{ marginTop: 0 }}>Recommendation Rationale</h4>
        <p style={{ marginBottom: 0 }}>{market.rationale}</p>
      </div>

      {/* Entry strategy */}
      {!isReference && steps.length > 0 && (
        <div className="md" style={{ marginBottom: 20 }}>
          <h4>Entry Strategy</h4>
          <ol>
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
      {isReference && (
        <div className="md" style={{ marginBottom: 20 }}>
          <h4>Note</h4>
          <p style={{ marginBottom: 0 }}>{market.entryStrategy}</p>
        </div>
      )}

      {/* Time & investment */}
      {!isReference && (
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            padding: "12px 0",
            borderTop: "1px solid var(--divider)",
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--text-gray-dark)",
                marginBottom: 3,
              }}
            >
              Time to Entry
            </div>
            <div style={{ fontSize: 13, color: "var(--text-white)", fontWeight: 500 }}>
              {market.estimatedTimeToEntry}
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--text-gray-dark)",
                marginBottom: 3,
              }}
            >
              Investment Range
            </div>
            <div style={{ fontSize: 13, color: "var(--text-white)", fontWeight: 500 }}>
              {market.estimatedInvestment}
            </div>
          </div>
        </div>
      )}

      {/* Link to deep-dive */}
      {!isReference && (
        <div style={{ paddingTop: 12, borderTop: "1px solid var(--divider)" }}>
          <Link
            to={`/analysis/${market.slug}`}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--accent-yellow)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Full analysis: Compatibility · JTBD · ODI · Value Network
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
