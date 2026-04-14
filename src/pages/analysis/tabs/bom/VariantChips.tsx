/**
 * VariantChips — top product-variant chip group (Output Types).
 *
 * Matches Figma design: pill chips for product variants (OT-1, OT-2, …).
 * Shows only output types that have sensor relevance (primary or secondary).
 * Selected chip is highlighted in accent-yellow.
 *
 * Uses .bom-variant-chips / .bom-variant-chip CSS from bom.css.
 */

import type { BOMOutputType } from "@/types";

export interface VariantChipsProps {
  outputTypes: BOMOutputType[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function sensorFitLabel(fit: BOMOutputType["sensorFit"]): string {
  if (fit === "primary") return "primary";
  if (fit === "secondary") return "secondary";
  return "";
}

export default function VariantChips({
  outputTypes,
  selectedId,
  onSelect,
}: VariantChipsProps) {
  // Show all output types (including "none") so users can see scope
  const relevant = outputTypes.filter((ot) => ot.sensorFit !== "none");

  if (relevant.length === 0) return null;

  return (
    <div className="bom-variant-chips" role="group" aria-label="Product output types">
      {relevant.map((ot) => {
        const isActive = ot.id === selectedId;
        const fitLabel = sensorFitLabel(ot.sensorFit);
        return (
          <button
            key={ot.id}
            type="button"
            className={`bom-variant-chip${isActive ? " is-active" : ""}`}
            aria-pressed={isActive}
            onClick={() => onSelect(ot.id)}
            title={ot.notes}
          >
            {ot.name}
            {fitLabel && (
              <span className="bom-variant-chip__status">{fitLabel}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
