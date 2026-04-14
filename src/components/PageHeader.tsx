/**
 * PageHeader — standard page title with kicker, section title, and optional description.
 *
 * Matches the `.section-meta` + `.md h1.section-title` + `.section__sub` pattern
 * from the HTML reports.
 *
 * Usage:
 *   <PageHeader
 *     kicker="Step 01 / Christensen Capability Abstraction"
 *     title="Product Decomposition"
 *     description="Functional abstraction of the Marquardt Ultrasonic Flow Sensor."
 *   />
 */

export interface PageHeaderProps {
  /**
   * Mono eyebrow line, e.g. "Step 01 / Christensen" or "Page · 02".
   * Rendered as .section-meta (space-separated segments split on " / ").
   */
  kicker?: string;
  /** Main heading text — rendered as .md h1.section-title */
  title: string;
  /** Optional subtitle / description shown below the title. */
  description?: string;
}

export default function PageHeader({
  kicker,
  title,
  description,
}: PageHeaderProps) {
  // Split kicker on " / " to render with .sep dividers matching the HTML reports
  const kickerParts = kicker ? kicker.split(" / ") : [];

  return (
    <div className="page-header">
      {kicker && (
        <div className="section-meta">
          {kickerParts.map((part, i) => (
            <span key={i}>
              {part}
              {i < kickerParts.length - 1 && (
                <span className="sep"> / </span>
              )}
            </span>
          ))}
        </div>
      )}
      <div className="md">
        <h1 className="section-title">{title}</h1>
      </div>
      {description && (
        <p className="section__sub" style={{ marginTop: 8, marginBottom: 0 }}>
          {description}
        </p>
      )}
      <hr className="page-header-divider" />
    </div>
  );
}
