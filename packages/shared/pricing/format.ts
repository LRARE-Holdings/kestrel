/**
 * Currency and tier formatting helpers.
 *
 * All amounts in the pricing system are integer pence. UI code should NEVER
 * format pence directly with arithmetic — always go through formatGBP.
 */

import { YEAR_1_TIERS, type TierId } from "./config";

/**
 * Format an integer-pence amount as a Sterling currency string.
 *
 * Examples:
 *   formatGBP(0)       → "£0.00"
 *   formatGBP(3500)    → "£35.00"
 *   formatGBP(150_000) → "£1,500.00"
 *
 * Always renders two decimal places, en-GB locale.
 */
export function formatGBP(pence: number): string {
  if (!Number.isFinite(pence)) return "£—";
  const pounds = pence / 100;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pounds);
}

/**
 * Format an integer-pence amount as a compact Sterling string with no
 * decimal portion when the amount is whole pounds. Used for headline copy
 * in the pricing page hero.
 *
 *   formatGBPCompact(3500)   → "£35"
 *   formatGBPCompact(3550)   → "£35.50"
 *   formatGBPCompact(150_000) → "£1,500"
 */
export function formatGBPCompact(pence: number): string {
  if (!Number.isFinite(pence)) return "£—";
  const pounds = pence / 100;
  const isWhole = pence % 100 === 0;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  }).format(pounds);
}

/** Returns the human label for a tier ID, or the ID itself as a fallback. */
export function formatTierLabel(tierId: TierId): string {
  return YEAR_1_TIERS.find((t) => t.id === tierId)?.label ?? tierId;
}

/**
 * Format a tier's value-range as a single string for display in pricing
 * cards and admin tables.
 *
 *   small    → "Up to £1,000"
 *   standard → "£1,000–£10,000"
 *   complex  → "£25,000+"
 */
export function formatTierRange(tierId: TierId): string {
  const tier = YEAR_1_TIERS.find((t) => t.id === tierId);
  if (!tier) return "—";

  if (tier.minValuePence === 0 && tier.maxValuePence != null) {
    return `Up to ${formatGBPCompact(tier.maxValuePence)}`;
  }
  if (tier.maxValuePence == null) {
    return `${formatGBPCompact(tier.minValuePence)}+`;
  }
  return `${formatGBPCompact(tier.minValuePence)}–${formatGBPCompact(tier.maxValuePence)}`;
}
