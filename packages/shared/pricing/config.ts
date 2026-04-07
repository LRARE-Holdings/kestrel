/**
 * Kestrel pricing configuration — Year 1.
 *
 * Single source of truth for all dispute fee tier values, refund rules,
 * and engagement criteria. Read by both apps/web and apps/admin.
 *
 * IMPORTANT:
 * - All amounts are integer pence (no floats).
 * - Tier ranges are inclusive of the minimum, exclusive of the maximum
 *   (so "Up to £1,000" means [0p, 100,000p)).
 * - Per-party fees are exactly the values in PRICING.md §4.1.
 * - The Complex tier has a marginal rate above £25,000 capped at £1,500/party.
 *
 * Source: /PRICING.md §4 (do not edit values here without updating PRICING.md
 * and logging the change in memory/DECISIONS.md).
 */

export type TierId = "small" | "standard" | "larger" | "complex";

export interface TierConfig {
  id: TierId;
  label: string;
  /** Inclusive lower bound of dispute value, in pence. */
  minValuePence: number;
  /** Exclusive upper bound of dispute value, in pence. `null` = no upper bound. */
  maxValuePence: number | null;
  /** Flat per-party fee, in pence. For Complex tier this is the BASE fee. */
  perPartyFeePence: number;
  /**
   * Optional marginal rate applied to the dispute value above the tier's
   * minimum. Expressed as a basis-point fraction (0.005 = 0.5%).
   * Only set on the Complex tier.
   */
  marginalRate?: number;
  /**
   * Optional cap on the per-party fee, in pence. The Complex tier caps at
   * £1,500 per party (so £3,000 total). Only set on the Complex tier.
   */
  perPartyCapPence?: number;
}

/**
 * Year 1 tier definitions — see PRICING.md §4.1.
 *
 * | Tier     | Dispute value     | Per-party fee                                          |
 * | -------- | ----------------- | ------------------------------------------------------ |
 * | Small    | Up to £1,000      | £35                                                    |
 * | Standard | £1,000–£10,000    | £75                                                    |
 * | Larger   | £10,000–£25,000   | £150                                                   |
 * | Complex  | £25,000+          | £250 + 0.5% over £25k (capped at £1,500/party)         |
 */
export const YEAR_1_TIERS: ReadonlyArray<TierConfig> = [
  {
    id: "small",
    label: "Small",
    minValuePence: 0,
    maxValuePence: 100_000, // £1,000.00
    perPartyFeePence: 3_500, // £35.00
  },
  {
    id: "standard",
    label: "Standard",
    minValuePence: 100_000, // £1,000.00
    maxValuePence: 1_000_000, // £10,000.00
    perPartyFeePence: 7_500, // £75.00
  },
  {
    id: "larger",
    label: "Larger",
    minValuePence: 1_000_000, // £10,000.00
    maxValuePence: 2_500_000, // £25,000.00
    perPartyFeePence: 15_000, // £150.00
  },
  {
    id: "complex",
    label: "Complex",
    minValuePence: 2_500_000, // £25,000.00
    maxValuePence: null,
    perPartyFeePence: 25_000, // £250.00 base
    marginalRate: 0.005, // 0.5%
    perPartyCapPence: 150_000, // £1,500.00 cap per party
  },
] as const;

/**
 * Good-faith refund rules — see PRICING.md §5.
 *
 * The respondent's filing fee is fully refunded if all of these are true:
 *  1. They paid within `RESPONDENT_PAYMENT_WINDOW_DAYS` of being notified.
 *  2. They submitted a substantive response (≥ MIN_SUBSTANTIVE_RESPONSE_WORDS).
 *  3. The dispute reached a recorded resolution within
 *     `GOOD_FAITH_REFUND_DAYS` of them joining.
 */
export const RESPONDENT_PAYMENT_WINDOW_DAYS = 14;
export const GOOD_FAITH_REFUND_DAYS = 14;
export const MIN_SUBSTANTIVE_RESPONSE_WORDS = 100;

/**
 * Withdrawal refund rules — see PRICING.md §4.4.
 *
 * - Pre-notification: claimant gets a full refund minus the Stripe fee
 *   retention (£5).
 * - Post-notification: claimant retains nothing; respondent is fully
 *   refunded if they had already paid.
 */
export const STRIPE_FEE_RETENTION_PENCE = 500; // £5.00

/**
 * Refund processing latency targets — see PRICING.md §6.5.
 * Used by the admin panel to surface deadlines.
 */
export const GOOD_FAITH_REFUND_TARGET_HOURS = 48;
export const WITHDRAWAL_REFUND_TARGET_HOURS = 24;

/**
 * Currency — Year 1 is GBP only. England & Wales focus.
 * Stored on every dispute_payments row for forward compatibility.
 */
export const KESTREL_CURRENCY = "GBP";

/**
 * Statement descriptor configured in the Stripe Dashboard.
 * Documented here so the admin app can reference it consistently.
 * See PRICING.md §6.2.
 */
export const STRIPE_STATEMENT_DESCRIPTOR = "KESTREL DISPUTE FEE";
