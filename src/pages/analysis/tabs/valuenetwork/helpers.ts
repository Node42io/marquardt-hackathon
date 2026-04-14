/**
 * Value Network helpers — pure utility functions, no React imports.
 */

import type { VNUnit, L6System } from "@/types";

/**
 * Derive a 2-sentence plain-language description for a VN unit.
 * Uses the unit's functionalJob as the primary source; strips source tags.
 */
export function deriveDescription(unit: VNUnit, systemName: string): string {
  if (unit.description && unit.description.trim()) return unit.description.trim();

  // Strip source annotations like [SRC: web_search] and MARQUARDT indicators
  const clean = unit.functionalJob
    .replace(/\[SRC:[^\]]*\]/gi, "")
    .replace(/\*\*MARQUARDT[^*]*\*\*/gi, "")
    .replace(/MARQUARDT[^.]*\./gi, "")
    .trim()
    .replace(/\s+/g, " ");

  // Build a 2-sentence description from the functional job
  const sentences = clean.split(/(?<=[.!?])\s+/);
  const first = sentences[0] ?? clean;

  // Second sentence: add context about the system it belongs to
  const second = `It is part of the ${systemName} system in the production chain.`;

  return `${first.endsWith(".") ? first : first + "."} ${second}`;
}

/**
 * Return true if a VN unit is Marquardt's primary position.
 */
export function isMarquardtAnchor(unit: VNUnit): boolean {
  const text = (unit.functionalJob + " " + unit.description).toLowerCase();
  return text.includes("marquardt primary") || text.includes("marquardt");
}

/**
 * Return the Marquardt position label for a unit, if any.
 */
export function marquardtPositionLabel(unit: VNUnit): string | null {
  const text = unit.functionalJob + " " + unit.description;
  if (/MARQUARDT PRIMARY/i.test(text)) return "PRIMARY";
  if (/MARQUARDT SECONDARY/i.test(text)) return "SECONDARY";
  if (/MARQUARDT TERTIARY/i.test(text)) return "TERTIARY";
  if (/MARQUARDT/i.test(text)) return "SENSOR";
  return null;
}

/**
 * Extract the L6 prefix from an L5 unit ID (e.g. "L5.10.1" → "L5.10").
 */
export function getL6Prefix(l5Id: string): string {
  const parts = l5Id.split(".");
  // L5.6.3 → "6" → match to L6.6
  if (parts.length >= 2) {
    return parts[1] ?? "";
  }
  return "";
}

/**
 * Group L5 units by their parent L6 system.
 * Matching is done by numeric section: L5.6.x → L6.6
 */
export function groupUnitsByL6(
  units: VNUnit[],
  systems: L6System[]
): Map<string, VNUnit[]> {
  const map = new Map<string, VNUnit[]>();

  for (const sys of systems) {
    map.set(sys.id, []);
  }

  for (const unit of units) {
    // Parse section from unit ID: "L5.6.3" → "6", "L5.H1.1" → "H1"
    const parts = unit.id.split(".");
    const section = parts[1] ?? "";
    const l6Id = `L6.${section}`;
    const bucket = map.get(l6Id);
    if (bucket) {
      bucket.push(unit);
    } else {
      // Fallback — try numeric ordinal index (for purely numeric IDs)
      const sectionNum = parseInt(section, 10);
      if (!isNaN(sectionNum)) {
        const fallbackKey = systems[sectionNum - 1]?.id;
        if (fallbackKey && map.has(fallbackKey)) {
          map.get(fallbackKey)!.push(unit);
        }
      }
    }
  }

  return map;
}

/**
 * Clean a functional job string for display (remove source tags, tidy whitespace).
 */
export function cleanFunctionalJob(raw: string): string {
  return raw
    .replace(/\[SRC:[^\]]*\]/gi, "")
    .replace(/\*\*/g, "")
    .trim()
    .replace(/\s{2,}/g, " ");
}
