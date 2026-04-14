/**
 * Source registry helpers.
 *
 * Sources are loaded from two JSON files:
 *   - src/data/sources.json           — keyed object map: { prefixedId: {id, label, url?, ...} }
 *   - src/data/researchedSources.json — { version, generatedAt, sources: [ {id, claim, sourceName, sourceUrl, ...} ] }
 */

export interface Source {
  id: string;
  label: string;
  /** Optional clickable URL. If absent, UI shows a "source pending" hint. */
  url?: string;
  description?: string;
  confidence?: "high" | "medium" | "low";
  quotedText?: string;
}

import rawStatic from "../data/sources.json";
import rawResearched from "../data/researchedSources.json";

type StaticEntry = {
  id: string;
  label: string;
  url?: string | null;
  prefixedId?: string;
  quote?: string;
};
type ResearchedEntry = {
  id: string;
  claim?: string;
  sourceName?: string;
  sourceUrl?: string | null;
  quotedText?: string;
  confidence?: "high" | "medium" | "low";
};

const staticMap = rawStatic as unknown as Record<string, StaticEntry>;
const researchedWrap = rawResearched as unknown as { sources?: ResearchedEntry[] };
const researched: ResearchedEntry[] = researchedWrap.sources ?? [];

const sourceMap = new Map<string, Source>();

for (const [prefixedId, entry] of Object.entries(staticMap)) {
  sourceMap.set(prefixedId, {
    id: prefixedId,
    label: entry.label,
    url: entry.url ?? undefined,
    quotedText: entry.quote,
  });
  // Also index by bare id if unique
  if (entry.id && !sourceMap.has(entry.id)) {
    sourceMap.set(entry.id, {
      id: prefixedId,
      label: entry.label,
      url: entry.url ?? undefined,
      quotedText: entry.quote,
    });
  }
}

for (const r of researched) {
  sourceMap.set(r.id, {
    id: r.id,
    label: r.sourceName || r.claim || r.id,
    url: r.sourceUrl ?? undefined,
    description: r.claim,
    quotedText: r.quotedText,
    confidence: r.confidence,
  });
}

/**
 * Return typed Source objects for the given IDs.
 * Unknown IDs are returned as stub entries so the UI can render them gracefully.
 */
export function getSources(ids: string[]): Source[] {
  return ids.map((id) => {
    const found = sourceMap.get(id);
    if (found) return found;
    return {
      id,
      label: id,
      url: undefined,
      description: "Source pending — not yet in registry.",
    } satisfies Source;
  });
}

export function getSource(id: string): Source | undefined {
  return sourceMap.get(id);
}

export function hasSource(id: string): boolean {
  return sourceMap.has(id);
}
