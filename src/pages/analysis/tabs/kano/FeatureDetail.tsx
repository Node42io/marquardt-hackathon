/**
 * FeatureDetail — popover/panel content for a single Kano feature.
 *
 * Shows: name, classification badge, score radar (inline bar chart),
 * and the rationale text.
 *
 * Used inside a Popover (click-to-open) on each feature pill.
 */

import type { KanoFeature } from "@/types";
import { getClassMeta, SCORE_DIMS } from "./kanoConfig";

interface FeatureDetailProps {
  feature: KanoFeature;
}

function ScoreBar({ value, max = 10 }: { value: number | null; max?: number }) {
  const pct = value != null ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const color =
    pct >= 70 ? "var(--status-high)" : pct >= 40 ? "var(--status-medium)" : "var(--status-low)";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
      }}
    >
      <div
        style={{
          flex: 1,
          height: 4,
          borderRadius: 2,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 2,
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: value != null ? "var(--text-gray-light)" : "var(--text-gray-dark)",
          width: 16,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {value != null ? value : "—"}
      </span>
    </div>
  );
}

export default function FeatureDetail({ feature }: FeatureDetailProps) {
  const meta = getClassMeta(feature.kanoClassification);
  const scores = feature.scores as unknown as Record<string, number | null>;

  // Only strip the validation table boilerplate that sometimes appears after "### 09b"
  const rawRationale = feature.rationale ?? "";
  const rationaleClean = rawRationale.split(/\n###/)[0].trim();

  return (
    <div
      style={{
        width: 360,
        maxHeight: "80vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 18px 12px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <h4
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-white)",
              lineHeight: 1.3,
              margin: 0,
              flex: 1,
            }}
          >
            {feature.featureName}
          </h4>
          {/* Classification badge */}
          <span
            style={{
              ...meta.badgeStyle,
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "3px 8px",
              borderRadius: 4,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {meta.label}
          </span>
        </div>
      </div>

      {/* Scores */}
      <div
        style={{
          padding: "12px 18px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: 7,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--text-gray-dark)",
            marginBottom: 4,
          }}
        >
          Fit Scores (0–10)
        </div>
        {SCORE_DIMS.map((dim) => (
          <div
            key={dim.key}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-gray)",
                width: 90,
                flexShrink: 0,
              }}
            >
              {dim.label}
            </span>
            <ScoreBar value={scores[dim.key] ?? null} />
          </div>
        ))}
      </div>

      {/* Rationale */}
      {rationaleClean && (
        <div style={{ padding: "12px 18px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--text-gray-dark)",
              marginBottom: 8,
            }}
          >
            Rationale
          </div>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-gray-light)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {rationaleClean}
          </p>
        </div>
      )}
    </div>
  );
}
