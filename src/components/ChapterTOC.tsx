/**
 * ChapterTOC — collapsible table of contents for long chapter pages.
 *
 * Usage:
 *   <ChapterTOC entries={[
 *     { id: "prod-mechanism", label: "What the Sensor Does" },
 *     { id: "prod-features",  label: "Features", level: "h3" },
 *   ]} />
 *
 * Clicking an entry smooth-scrolls to the corresponding `id` on the page.
 * Starts collapsed; toggle with the chevron.
 */

import { useState } from "react";

export interface TOCEntry {
  id: string;
  label: string;
  /** "h3" renders with extra left indent to indicate sub-section. Default: "h2" */
  level?: "h2" | "h3";
}

interface Props {
  entries: TOCEntry[];
}

export default function ChapterTOC({ entries }: Props) {
  const [open, setOpen] = useState(false);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div
      style={{
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        marginBottom: 28,
        background: "var(--surface-dark)",
        overflow: "hidden",
      }}
    >
      {/* Header row — always visible */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "10px 14px",
          background: "none",
          border: "none",
          cursor: "pointer",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Chevron */}
          <span
            style={{
              display: "inline-block",
              fontSize: 10,
              color: "var(--accent-yellow)",
              transition: "transform 0.2s ease",
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
              lineHeight: 1,
            }}
          >
            ▶
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-gray)",
            }}
          >
            Contents
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-gray-dark)",
          }}
        >
          {entries.length} sections
        </span>
      </button>

      {/* Expandable list */}
      <div
        style={{
          maxHeight: open ? `${entries.length * 34 + 12}px` : "0px",
          overflow: "hidden",
          transition: "max-height 0.25s ease",
        }}
      >
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            padding: "8px 0",
          }}
        >
          {entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => scrollTo(entry.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: `5px 14px 5px ${entry.level === "h3" ? 30 : 14}px`,
                fontSize: entry.level === "h3" ? 12 : 13,
                color: entry.level === "h3" ? "var(--text-gray)" : "var(--text-gray)",
                fontFamily: "inherit",
                lineHeight: 1.4,
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--accent-yellow)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-gray)")
              }
            >
              {entry.level === "h3" && (
                <span
                  style={{
                    display: "inline-block",
                    width: 12,
                    color: "var(--text-gray-dark)",
                    fontSize: 10,
                    marginRight: 4,
                  }}
                >
                  └
                </span>
              )}
              {entry.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
