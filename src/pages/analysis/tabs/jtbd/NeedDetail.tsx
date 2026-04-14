/**
 * NeedDetail — inline expanded panel shown when a user clicks an ODI need row.
 *
 * Displays:
 *  - Need statement
 *  - Importance with rationale
 *  - Satisfaction with rationale
 *  - Opportunity score
 *
 * Intentionally does NOT include attributes or incumbent_technology fields.
 */

import type { ODINeed } from "@/types";

interface NeedDetailProps {
  need: ODINeed;
  onClose: () => void;
}

function ScoreBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div
      style={{
        height: 4,
        background: "var(--surface-dark)",
        borderRadius: 2,
        overflow: "hidden",
        marginTop: 4,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: "var(--accent-yellow)",
          borderRadius: 2,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

function RationaleText({
  text,
  pending,
}: {
  text: string;
  pending?: boolean;
}) {
  if (pending || !text) {
    return (
      <p
        style={{
          margin: "4px 0 0",
          fontSize: 11,
          fontStyle: "italic",
          color: "var(--text-gray-dark)",
          fontFamily: "var(--font-mono)",
          lineHeight: 1.4,
        }}
      >
        rationale pending
      </p>
    );
  }
  return (
    <p
      style={{
        margin: "4px 0 0",
        fontSize: 12,
        color: "var(--text-gray-light)",
        lineHeight: 1.5,
      }}
    >
      {text}
    </p>
  );
}

export default function NeedDetail({ need, onClose }: NeedDetailProps) {
  const rationalesPending = !!need.needsRationale;
  const oppFormula = `${need.importance} + (${need.importance} − ${need.satisfaction}) = ${need.opportunity}`;

  return (
    <div
      style={{
        background: "var(--bg-card-inner, #16181c)",
        border: "1px solid var(--border-subtle)",
        borderTop: "2px solid var(--accent-yellow)",
        borderRadius: "0 0 10px 10px",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Close button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail panel"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-gray-dark)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            padding: "2px 8px",
            borderRadius: 4,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLButtonElement).style.color = "var(--accent-yellow)")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLButtonElement).style.color = "var(--text-gray-dark)")
          }
        >
          Close ×
        </button>
      </div>

      {/* Need statement */}
      <div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--text-gray-dark)",
          }}
        >
          Outcome Statement
        </span>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 13,
            color: "var(--text-white)",
            lineHeight: 1.6,
          }}
        >
          {need.statement}
        </p>
        {/* Primary stakeholder */}
        {need.primaryStakeholder && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-gray-dark)",
              }}
            >
              Primary Stakeholder
            </span>
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--accent-yellow)",
                background: "rgba(253,255,152,0.08)",
                border: "1px solid rgba(253,255,152,0.18)",
                borderRadius: 4,
                padding: "2px 8px",
              }}
            >
              {need.primaryStakeholder}
            </span>
            {need.stakeholderIds && need.stakeholderIds.length > 1 && (
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-gray-dark)",
                }}
              >
                + {need.stakeholderIds.slice(1).join(", ")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Scores grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
        }}
      >
        {/* Importance */}
        <div
          style={{
            background: "var(--surface-dark)",
            borderRadius: 8,
            padding: "14px 16px",
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
            Importance
          </span>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--accent-yellow)",
              marginTop: 4,
            }}
          >
            {need.importance}
            <span
              style={{ fontSize: 12, fontWeight: 400, color: "var(--text-gray-dark)" }}
            >
              /10
            </span>
          </div>
          <ScoreBar value={need.importance} />
          <RationaleText
            text={need.importanceRationale}
            pending={rationalesPending || !need.importanceRationale}
          />
        </div>

        {/* Satisfaction */}
        <div
          style={{
            background: "var(--surface-dark)",
            borderRadius: 8,
            padding: "14px 16px",
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
            Satisfaction
          </span>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--accent-yellow)",
              marginTop: 4,
            }}
          >
            {need.satisfaction}
            <span
              style={{ fontSize: 12, fontWeight: 400, color: "var(--text-gray-dark)" }}
            >
              /10
            </span>
          </div>
          <ScoreBar value={need.satisfaction} />
          <RationaleText
            text={need.satisfactionRationale}
            pending={rationalesPending || !need.satisfactionRationale}
          />
        </div>

        {/* Opportunity */}
        <div
          style={{
            background: "rgba(253, 255, 152, 0.04)",
            border: "1px solid rgba(253, 255, 152, 0.18)",
            borderRadius: 8,
            padding: "14px 16px",
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
            Opportunity Score
          </span>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--accent-yellow)",
              marginTop: 4,
            }}
          >
            {need.opportunity}
          </div>
          <ScoreBar value={need.opportunity} max={20} />
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--text-gray-dark)",
              lineHeight: 1.4,
            }}
          >
            = Imp + (Imp − Sat)
            <br />
            = {oppFormula}
          </p>
        </div>
      </div>
    </div>
  );
}
