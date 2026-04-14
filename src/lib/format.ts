/**
 * Number-formatting helpers for the Marquardt report UI.
 */

/** Format an ODI / Kano score (0–10 range, 1 decimal place). */
export function fmtScore(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/**
 * Format a currency amount.
 * @param value   Raw number (in full dollars / units).
 * @param currency ISO 4217 currency code (default "USD").
 * @param compact  If true, abbreviates large numbers (e.g. $1.4B).
 */
export function fmtCurrency(
  value: number,
  currency = "USD",
  compact = true,
): string {
  if (compact) {
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(1)}T`;
    if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
    return `${sign}$${abs.toFixed(0)}`;
  }
  return value.toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}

/**
 * Format a percentage.
 * @param value  Fraction (0–1) or percentage (0–100). If > 1, treated as already a percentage.
 * @param decimals Number of decimal places (default 1).
 */
export function fmtPct(value: number, decimals = 1): string {
  const pct = value > 1 ? value : value * 100;
  return `${pct.toFixed(decimals)}%`;
}
