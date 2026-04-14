/**
 * loadMarketData — thin typed adapter for per-market JTBD + ODI data.
 *
 * Uses the shared data layer (src/data/index.ts) which already registers
 * every market bundle. This keeps the JTBD tab decoupled from data/index.ts
 * while still reading from the same source of truth.
 */

import { getMarket } from "@/data";
import type { JTBDData, ODIData } from "@/types";

export interface MarketJTBDBundle {
  jtbd: JTBDData;
  odi: ODIData;
}

/**
 * Return the JTBD + ODI bundle for the given market slug.
 * Returns null fields for any slug that isn't registered so the
 * tab can render a graceful "data pending" state instead of throwing.
 */
export function loadMarketData(marketSlug: string): {
  jtbd: JTBDData | null;
  odi: ODIData | null;
} {
  try {
    const bundle = getMarket(marketSlug);
    return { jtbd: bundle.jtbd, odi: bundle.odi };
  } catch {
    return { jtbd: null, odi: null };
  }
}
