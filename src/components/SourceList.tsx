/**
 * SourceList — chapter-level footnote list.
 *
 * Renders every source used in a section as a numbered list with
 * clickable links where available. Styled with .source-list CSS from report.css.
 *
 * Usage:
 *   <SourceList sourceIds={["RS001", "RS002", "RS003"]} />
 *   <SourceList sourceIds={ids} title="References" />
 */

import { getSources } from "@/lib/sources";

export interface SourceListProps {
  sourceIds: string[];
  /** Section heading. Defaults to "Sources". */
  title?: string;
}

export default function SourceList({
  sourceIds,
  title = "Sources",
}: SourceListProps) {
  if (sourceIds.length === 0) return null;

  const sources = getSources(sourceIds);

  return (
    <div className="source-list">
      <div className="source-list__title">{title}</div>
      <ol>
        {sources.map((src, i) => {
          const isPending = !src.url;
          return (
            <li key={src.id}>
              <span className="num">{i + 1}.</span>
              <div>
                {isPending ? (
                  <span style={{ color: "var(--text-gray)" }}>{src.label}</span>
                ) : (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {src.label}
                  </a>
                )}
                {isPending && (
                  <span className="pending" style={{ display: "block" }}>
                    source pending
                  </span>
                )}
                {src.description && !isPending && (
                  <span style={{
                    display: "block",
                    fontSize: 11,
                    color: "var(--text-gray)",
                    marginTop: 2,
                    lineHeight: 1.4,
                  }}>
                    {src.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
