/**
 * DefinitionList — two-column key/value block for product specs and field listings.
 *
 * Matches the "Field | Value" table style from the HTML reports.
 * Uses .definition-list CSS classes from report.css.
 *
 * Usage:
 *   <DefinitionList
 *     items={[
 *       { key: "technology_class", value: "Ultrasonic Transit-Time Flow Measurement" },
 *       { key: "UNSPSC Code", value: <ClickableCode kind="unspsc" code="41112501" /> },
 *     ]}
 *   />
 */

import type { ReactNode } from "react";

export interface DefinitionItem {
  key: string;
  value: ReactNode;
}

export interface DefinitionListProps {
  items: DefinitionItem[];
  /** Optional section heading above the list (rendered as mono header). */
  title?: string;
}

export default function DefinitionList({ items, title }: DefinitionListProps) {
  return (
    <div className="definition-list">
      {title && (
        <span className="definition-list__header">{title}</span>
      )}
      <dl style={{ margin: 0 }}>
        {items.map((item, i) => (
          <div key={i} className="definition-list__row">
            <dt className="definition-list__key">{item.key}</dt>
            <dd className="definition-list__value">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
