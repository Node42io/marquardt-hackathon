/**
 * SectionAnchor — anchored H2 with a copy-link affordance on hover.
 *
 * Matches the `.md h2` style from report.css (22px, accent-yellow, font-weight 500).
 * Hover shows a small link icon that copies the anchor URL to clipboard.
 *
 * Usage:
 *   <SectionAnchor id="odi-matrix" title="ODI Opportunity Matrix" />
 *   <SectionAnchor id="features" kicker="Step 04" title="Features" />
 */

import { useState } from "react";
import type { ReactNode } from "react";

export interface SectionAnchorProps {
  id: string;
  /** Section heading text. Optional when children provides its own heading. */
  title?: string;
  /** Optional eyebrow kicker above the heading. */
  kicker?: string;
  /** Optional children rendered below the heading. */
  children?: ReactNode;
}

function LinkIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.5 9.5a3.5 3.5 0 0 0 4.95.05l1.5-1.5A3.5 3.5 0 0 0 8 3.08L7 4.08M9.5 6.5a3.5 3.5 0 0 0-4.95-.05L3.05 7.95A3.5 3.5 0 0 0 8 12.92L9 11.92"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 8.5 6 12l7.5-8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SectionAnchor({
  id,
  title,
  kicker,
  children,
}: SectionAnchorProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    const url = `${window.location.href.split("#")[0]}#${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div id={id} className="section-anchor md">
      {kicker && (
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--text-gray)",
          marginBottom: 8,
        }}>
          {kicker}
        </p>
      )}
      {title && (
        <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {title}
          <a
            href={`#${id}`}
            onClick={handleCopy}
            aria-label={copied ? "Link copied!" : `Copy link to ${title}`}
            className="section-anchor__copy"
          >
            {copied ? <CheckIcon /> : <LinkIcon />}
          </a>
        </h2>
      )}
      {children}
    </div>
  );
}
