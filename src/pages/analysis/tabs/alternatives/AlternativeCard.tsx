/**
 * AlternativeCard — renders one entry from alternatives.json.
 *
 * Data shape (from JTBD markdown §2.4 Alternatives):
 *   { name: string, unspsc: string, tradeoffs: string }
 *
 * Does NOT try to force this shape into TechCard's richer incumbent shape.
 */

import ClickableCode from "@/components/ClickableCode";
import type { Alternative } from "@/types";

interface AlternativeCardProps {
  alternative: Alternative;
  rank: number;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/**
 * Extract a trailing [SRC: ...] suffix from the tradeoffs string.
 * Returns { clean: string without suffix, sources: string[] }.
 */
function extractSources(tradeoffs: string): {
  clean: string;
  sources: string[];
} {
  const srcMatch = tradeoffs.match(/\s*\[SRC:\s*([^\]]+)\]\s*$/);
  if (!srcMatch) return { clean: tradeoffs.trim(), sources: [] };
  const clean = tradeoffs.slice(0, srcMatch.index).trim();
  const sources = srcMatch[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { clean, sources };
}

/**
 * Split tradeoffs text on semicolons to produce bullet points.
 * Filters out empty strings.
 */
function splitBullets(text: string): string[] {
  return text
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Highlight $X–$Y price ranges and X% percentages inside a string,
 * wrapping them in an accent-yellow <mark> equivalent.
 */
function HighlightedText({ text }: { text: string }) {
  const parts = text.split(/([\$€£][\d,]+(?:[–\-][\$€£]?[\d,]+)?(?:\s*[A-Za-z]+)?|\d+(?:\.\d+)?%)/g);
  return (
    <>
      {parts.map((part, i) => {
        const isHighlight =
          /^[\$€£]/.test(part) || /^\d+(?:\.\d+)?%$/.test(part);
        return isHighlight ? (
          <span
            key={i}
            style={{
              color: "var(--accent-yellow)",
              fontWeight: 600,
            }}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}

/**
 * Parse **Bold** markdown name pattern — returns the inner text or falls back
 * to the full name string.
 */
function parseName(name: string): string {
  const m = name.match(/^\*\*(.+?)\*\*/);
  return m ? m[1] : name;
}

/* ─── Badge helpers ──────────────────────────────────────────────────────── */

function StatusBadge({ name }: { name: string }) {
  if (name.includes("[Status Quo]")) {
    return (
      <span
        style={{
          display: "inline-block",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          background: "rgba(255,255,255,0.06)",
          color: "var(--text-gray-light)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 4,
          padding: "1px 7px",
          marginLeft: 8,
          verticalAlign: "middle",
        }}
      >
        Status Quo
      </span>
    );
  }
  if (name.includes("Ultrasonic")) {
    return (
      <span
        style={{
          display: "inline-block",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          background: "rgba(253,255,152,0.10)",
          color: "var(--accent-yellow)",
          border: "1px solid rgba(253,255,152,0.25)",
          borderRadius: 4,
          padding: "1px 7px",
          marginLeft: 8,
          verticalAlign: "middle",
        }}
      >
        Marquardt's approach
      </span>
    );
  }
  return null;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function AlternativeCard({
  alternative,
  rank,
}: AlternativeCardProps) {
  const displayName = parseName(alternative.name);

  // Strip [Status Quo] / trailing qualifiers from display name for cleanliness
  const cleanDisplayName = displayName
    .replace(/\s*\[Status Quo\]\s*/gi, "")
    .trim();

  const hasUnspsc =
    alternative.unspsc && alternative.unspsc !== "—" && alternative.unspsc.trim() !== "";

  const { clean: tradeoffsClean, sources } = extractSources(
    alternative.tradeoffs ?? ""
  );
  const bullets = splitBullets(tradeoffsClean);
  const hasTradeoffs = bullets.length > 0;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 10,
        padding: "20px 24px",
        marginBottom: 20,
      }}
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          marginBottom: hasTradeoffs ? 16 : 0,
        }}
      >
        {/* Rank number */}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-gray-dark)",
            marginTop: 5,
            flexShrink: 0,
            width: 22,
          }}
        >
          A{rank}
        </span>

        <div style={{ flex: 1 }}>
          {/* Technology name + badges */}
          <h3
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "var(--text-white)",
              letterSpacing: "-0.01em",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {cleanDisplayName}
            <StatusBadge name={alternative.name} />
          </h3>

          {/* UNSPSC code */}
          {hasUnspsc && (
            <div style={{ marginTop: 6 }}>
              <ClickableCode kind="unspsc" code={alternative.unspsc} />
            </div>
          )}
        </div>
      </div>

      {/* ── Tradeoffs body ────────────────────────────────────────────── */}
      {hasTradeoffs && (
        <div style={{ marginLeft: 32 }}>
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.25rem",
              marginBottom: sources.length > 0 ? 10 : 0,
            }}
          >
            {bullets.map((bullet, i) => (
              <li
                key={i}
                style={{
                  fontSize: 13,
                  color: "var(--text-gray-light)",
                  lineHeight: 1.6,
                  marginBottom: 3,
                }}
              >
                <HighlightedText text={bullet} />
              </li>
            ))}
          </ul>

          {/* Sources line */}
          {sources.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
              }}
            >
              {/* Source icon */}
              <svg
                width="11"
                height="11"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                style={{ color: "var(--text-gray-dark)", flexShrink: 0 }}
              >
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                <path
                  d="M8 7v4M8 5.5v.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-gray-dark)",
                  letterSpacing: "0.04em",
                }}
              >
                Source:{" "}
                {sources.map((src, i) => (
                  <span key={i}>
                    {i > 0 && ", "}
                    <code
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: 3,
                        padding: "0 4px",
                        fontSize: 10,
                        color: "var(--text-gray-light)",
                      }}
                    >
                      {src}
                    </code>
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Data pending state (no tradeoffs yet) ────────────────────── */}
      {!hasTradeoffs && (
        <p
          style={{
            marginLeft: 32,
            marginTop: 6,
            margin: "6px 0 0 32px",
            fontSize: 12.5,
            color: "var(--text-gray-dark)",
            fontStyle: "italic",
          }}
        >
          Tradeoffs data pending.
        </p>
      )}
    </div>
  );
}
