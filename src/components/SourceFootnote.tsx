/**
 * SourceFootnote — inline superscript source indicator.
 *
 * Renders a small book/link icon + number in superscript style.
 * - Hover: tooltip with short source label.
 * - Click: popover listing all referenced sources with clickable URLs.
 * - Sources without URLs render as non-clickable with a "source pending" hint.
 *
 * Uses .source-footnote, .r-popover, .r-tooltip CSS classes from report.css.
 *
 * Usage:
 *   <SourceFootnote sourceIds={["RS001", "RS002"]} />
 */

import { getSources } from "@/lib/sources";
import Tooltip from "@/components/Tooltip";
import Popover from "@/components/Popover";

export interface SourceFootnoteProps {
  sourceIds: string[];
}

/** Small book/source SVG icon */
function BookIcon() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path
        d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9A1.5 1.5 0 0 1 12.5 14H3.5A1.5 1.5 0 0 1 2 12.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5 2v12M5 6h5M5 9.5h4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Popover panel listing all sources for this footnote */
function SourcePanel({ sourceIds }: { sourceIds: string[] }) {
  const sources = getSources(sourceIds);
  return (
    <div className="r-popover__body" style={{ minWidth: 220, maxWidth: 360 }}>
      <div className="r-popover__header">Sources</div>
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {sources.map((src, i) => {
          const isPending = !src.url;
          return (
            <div key={src.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-gray-dark)",
                width: 18,
                flexShrink: 0,
                textAlign: "right",
                paddingTop: 1,
              }}>
                {i + 1}.
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                {isPending ? (
                  <span style={{ fontSize: 12, color: "var(--text-gray-light)" }}>{src.label}</span>
                ) : (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 12,
                      color: "var(--text-white)",
                      borderBottom: "1px dashed rgba(255,255,255,0.25)",
                    }}
                  >
                    {src.label}
                  </a>
                )}
                {isPending && (
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontStyle: "italic", color: "var(--text-gray-dark)" }}>
                    source pending
                  </span>
                )}
                {src.description && !isPending && (
                  <span style={{ fontSize: 11, color: "var(--text-gray)", lineHeight: 1.4 }}>
                    {src.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SourceFootnote({ sourceIds }: SourceFootnoteProps) {
  if (sourceIds.length === 0) return null;

  const sources = getSources(sourceIds);
  const shortLabel = sources.map((s) => s.label).join(", ");
  const display = `[${sourceIds.length}]`;

  return (
    <Popover
      placement="bottom-start"
      trigger={
        <Tooltip content={shortLabel}>
          <button
            type="button"
            className="source-footnote"
            aria-label={`View sources: ${shortLabel}`}
          >
            <BookIcon />
            <span>{display}</span>
          </button>
        </Tooltip>
      }
      content={<SourcePanel sourceIds={sourceIds} />}
    />
  );
}
