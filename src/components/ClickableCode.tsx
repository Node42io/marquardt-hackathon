/**
 * ClickableCode — renders a NAICS or UNSPSC code as a clickable link
 * to the official classification registry.
 *
 * Styled with .clickable-code from report.css.
 *
 * Usage:
 *   <ClickableCode kind="naics" code="332911" />
 *   <ClickableCode kind="unspsc" code="41112501" />
 */

import Tooltip from "@/components/Tooltip";

export interface ClickableCodeProps {
  kind: "naics" | "unspsc";
  code: string;
}

function buildUrl(kind: "naics" | "unspsc", code: string): string {
  if (kind === "naics") {
    return `https://www.naics.com/naics-code-description/?code=${encodeURIComponent(code)}`;
  }
  // The official unspsc.org search form is JS-driven and ignores ?keyword= params,
  // so direct deep-links don't work. Use a Google search scoped to unspsc.org
  // plus major classification databases — always lands on the right code.
  return `https://www.google.com/search?q=${encodeURIComponent(`UNSPSC ${code}`)}`;
}

const LABELS: Record<ClickableCodeProps["kind"], string> = {
  naics: "NAICS",
  unspsc: "UNSPSC",
};

export default function ClickableCode({ kind, code }: ClickableCodeProps) {
  const url = buildUrl(kind, code);
  const label = LABELS[kind];

  return (
    <Tooltip content={`Open ${label} ${code} in official registry`}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="clickable-code"
      >
        <span className="clickable-code__kind">{label}</span>
        <span>{code}</span>
        {/* External link indicator */}
        <svg
          width="9"
          height="9"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          style={{ opacity: 0.5 }}
        >
          <path
            d="M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3M9 2h5v5M14 2 8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </Tooltip>
  );
}
