/**
 * KanoTab — Kano Classification visualisation for a single market.
 *
 * Layout: Option C — horizontal bands, one per Kano classification.
 * Each band contains feature pills that expand to a detail popover on click.
 *
 * Items addressed:
 *  #6  — Tooltip portals (via Popover + Tooltip) never clipped by overflow:hidden
 *  #7  — Full-viewport layout: bands use CSS grid, no initial scroll needed
 *  #39 — SourceFootnote + SourceList
 *  #40 — ExecutiveSummary
 *  #41 — Plain-language legend with tooltips on each classification name
 */

import { useMemo } from "react";

import type { KanoFeature, KanoData } from "@/types";
import { getMarket } from "@/data";

import Tooltip from "@/components/Tooltip";
import Popover from "@/components/Popover";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceList from "@/components/SourceList";

import {
  KANO_CLASSES,
  normaliseClass,
  type KanoClassMeta,
} from "./kano/kanoConfig";
import FeatureDetail from "./kano/FeatureDetail";

/* =========================================================================
   Valid feature guard
   ========================================================================= */

/**
 * A "real" feature has a non-numeric name and a known classification.
 * The finfish-farming JSON accidentally includes a validation table
 * as extra array entries (featureName: "#", "1", "2"…) — filter those out.
 */
function isRealFeature(f: KanoFeature): boolean {
  if (!f.featureName || /^\s*#?\d*\s*$/.test(f.featureName)) return false;
  const knownKeys = new Set<string>(KANO_CLASSES.map((c) => c.key));
  const norm = normaliseClass(f.kanoClassification ?? "");
  return knownKeys.has(norm);
}

/* =========================================================================
   Legend
   ========================================================================= */

function KanoLegend() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 16px",
        padding: "12px 16px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        marginBottom: 20,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--text-gray-dark)",
          alignSelf: "center",
          marginRight: 4,
        }}
      >
        Legend
      </span>
      {KANO_CLASSES.map((cls) => (
        <Tooltip
          key={cls.key}
          content={cls.plain}
          placement="top"
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              cursor: "default",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                flexShrink: 0,
                ...cls.dotStyle,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 500,
                color: "var(--text-gray-light)",
              }}
            >
              {cls.label}
            </span>
          </span>
        </Tooltip>
      ))}
    </div>
  );
}

/* =========================================================================
   Feature pill — click opens Popover with FeatureDetail
   ========================================================================= */

interface FeaturePillProps {
  feature: KanoFeature;
  meta: KanoClassMeta;
}

function FeaturePill({ feature, meta }: FeaturePillProps) {
  const overall = feature.scores?.overall;

  const triggerEl = (
    <button
      type="button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 6,
        border: `1px solid ${(meta.badgeStyle.border as string).replace("1px solid ", "")}`,
        background: meta.badgeStyle.background as string,
        color: meta.badgeStyle.color as string,
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        transition: "opacity 0.15s ease, transform 0.1s ease",
        lineHeight: 1.3,
        textAlign: "left",
        whiteSpace: "nowrap",
        maxWidth: 240,
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      title={feature.featureName}
    >
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {feature.featureName}
      </span>
      {overall != null && overall > 0 && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            opacity: 0.7,
            flexShrink: 0,
          }}
        >
          {overall.toFixed(1)}
        </span>
      )}
    </button>
  );

  return (
    <Popover
      trigger={triggerEl}
      content={
        <FeatureDetail feature={feature} />
      }
      placement="bottom-start"
    />
  );
}

/* =========================================================================
   Classification band — one row per Kano category
   ========================================================================= */

interface BandProps {
  meta: KanoClassMeta;
  features: KanoFeature[];
}

function ClassificationBand({ meta, features }: BandProps) {
  return (
    <div
      style={{
        ...meta.bandStyle,
        borderRadius: 8,
        padding: "14px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        minHeight: 52,
      }}
    >
      {/* Band label */}
      <div style={{ width: 108, flexShrink: 0 }}>
        <Tooltip content={meta.plain} placement="right">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              cursor: "default",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                flexShrink: 0,
                ...meta.dotStyle,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: meta.badgeStyle.color as string,
              }}
            >
              {meta.label}
            </span>
          </span>
        </Tooltip>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "var(--text-gray-dark)",
            marginTop: 3,
            paddingLeft: 13,
          }}
        >
          {features.length} {features.length === 1 ? "feature" : "features"}
        </div>
      </div>

      {/* Feature pills */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexWrap: "wrap",
          gap: "6px 8px",
          alignItems: "center",
        }}
      >
        {features.length === 0 ? (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-gray-dark)",
              fontStyle: "italic",
            }}
          >
            None identified for this market
          </span>
        ) : (
          features.map((f) => (
            <FeaturePill key={f.featureName} feature={f} meta={meta} />
          ))
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   Overall fit gauge — a compact summary bar
   ========================================================================= */

function OverallFitBar({ avg, total }: { avg: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (avg / 10) * 100));
  const color =
    pct >= 65 ? "var(--status-high)" : pct >= 40 ? "var(--status-medium)" : "var(--status-low)";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        marginBottom: 20,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text-gray-dark)",
          width: 120,
          flexShrink: 0,
        }}
      >
        Avg Overall Fit
      </span>
      <div
        style={{
          flex: 1,
          height: 6,
          borderRadius: 3,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 3,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          fontWeight: 600,
          color,
          width: 36,
          textAlign: "right",
        }}
      >
        {avg.toFixed(2)}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--text-gray-dark)",
        }}
      >
        / 10 &nbsp;·&nbsp; {total} features
      </span>
    </div>
  );
}

/* =========================================================================
   Data-pending state
   ========================================================================= */

function DataPending({ marketSlug }: { marketSlug: string }) {
  return (
    <div className="section">
      <div className="section__eyebrow">Kano Classification · {marketSlug}</div>
      <h2 className="section__title">Kano Classification</h2>
      <p className="section__sub">
        Kano feature data for this market has not been generated yet.
        Run the FIT pipeline for <code>{marketSlug}</code> to populate this tab.
      </p>
    </div>
  );
}

/* =========================================================================
   Main KanoTab
   ========================================================================= */

export default function KanoTab({ marketSlug }: { marketSlug: string }) {
  let kanoData: KanoData | null = null;
  try {
    kanoData = getMarket(marketSlug).kano;
  } catch {
    return <DataPending marketSlug={marketSlug} />;
  }

  if (!kanoData) return <DataPending marketSlug={marketSlug} />;

  // Filter to real features only
  const features = useMemo(
    () => (kanoData?.features ?? []).filter(isRealFeature),
    [kanoData]
  );

  const hasFeatures = features.length > 0;

  // Group features by classification, preserving display order
  const grouped = useMemo(() => {
    const map = new Map<string, KanoFeature[]>();
    for (const cls of KANO_CLASSES) map.set(cls.key, []);
    for (const f of features) {
      const key = normaliseClass(f.kanoClassification);
      map.get(key)?.push(f);
    }
    return map;
  }, [features]);

  // Source IDs from the JSON sources array
  const sourceIds = useMemo(
    () => (kanoData?.sources ?? []).map((s) => s.prefixedId ?? s.id).filter(Boolean),
    [kanoData]
  );

  // Recalculate avg only from real features
  const avgFit = useMemo(() => {
    if (features.length === 0) return 0;
    const sum = features.reduce((acc, f) => acc + (f.scores?.overall ?? 0), 0);
    return sum / features.length;
  }, [features]);

  return (
    <div className="section">
      {/* Eyebrow + Title */}
      <div className="section__eyebrow">
        Kano Classification · {kanoData.marketName ?? marketSlug}
      </div>
      <h2 className="section__title">Kano Classification</h2>
      <p className="section__sub">
        Feature-market fit analysis grounded in Kano&apos;s quality model.
        Click any feature pill to see its full rationale and fit scores.
      </p>

      {/* ── Item #40 — Executive Summary ──────────────────────────────────── */}
      <ExecutiveSummary kicker="Kano · What you're reading">
        <p className="answer">
          We classified each product feature by how customers in{" "}
          <strong>{kanoData.marketName}</strong> perceive it — must-be, performance
          (one-dimensional), attractive, indifferent, or reverse — to identify where
          Marquardt&apos;s ultrasonic flow sensor wins or loses on value.{" "}
          <strong>Must-be</strong> features are the price of entry; <strong>attractive</strong>{" "}
          features are where differentiation lives. Click any feature pill below to see
          detailed fit scores across nine customer-value dimensions.
        </p>
      </ExecutiveSummary>

      {/* ── Item #41 — Legend ─────────────────────────────────────────────── */}
      <KanoLegend />

      {/* ── Avg fit bar ───────────────────────────────────────────────────── */}
      {hasFeatures && <OverallFitBar avg={avgFit} total={features.length} />}

      {/* ── Item #7 — Bands layout (no vertical overflow) ─────────────────── */}
      {hasFeatures ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {KANO_CLASSES.map((cls) => (
            <ClassificationBand
              key={cls.key}
              meta={cls}
              features={grouped.get(cls.key) ?? []}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: "32px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 10,
            textAlign: "center",
            color: "var(--text-gray)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
          }}
        >
          No features available for this market yet. Run the FIT pipeline for{" "}
          <code>{marketSlug}</code> to populate this visualization.
        </div>
      )}

      {/* ── Item #39 — SourceList ─────────────────────────────────────────── */}
      <SourceList sourceIds={sourceIds} title="Sources" />
    </div>
  );
}
