/**
 * Formatting helpers shared across the storefront.
 *
 * Prices are stored as integer paise (1 rupee = 100 paise). The owner sets a
 * price per item; when no price is set the UI shows "Price on request".
 */

/** Copy shown when a product has no price set yet. */
export const PRICE_ON_REQUEST = "Price on request";

/**
 * Render an integer paise amount as Indian Rupees.
 *
 * Uses the `en-IN` locale so thousands group in the lakh/crore convention
 * (₹1,20,000) and drops trailing `.00` for whole-rupee prices.
 */
export function formatPrice(priceInPaise?: number | bigint | null): string {
  if (priceInPaise == null) return PRICE_ON_REQUEST;
  // The generated bindings may hand back a bigint; normalize before arithmetic
  // so `bigint / 100` never throws "Cannot mix BigInt and other types".
  const paise =
    typeof priceInPaise === "bigint" ? Number(priceInPaise) : priceInPaise;
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/** True when a product has a concrete price the owner has set. */
export function hasPrice(priceInPaise?: number | bigint | null): boolean {
  return priceInPaise != null;
}

/**
 * Convert a backend nanosecond timestamp to a Date.
 * Returns null when the value cannot be represented as a valid date.
 */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a backend timestamp as a short readable date, or null when invalid. */
export function formatTimestamp(timestamp: bigint): string | null {
  const date = timestampToDate(timestamp);
  if (!date) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
