/**
 * Pricing types — used by the dispute fee resolver, the public pricing page,
 * the Stripe webhook handlers, and the admin refund tooling.
 *
 * The canonical tier configuration lives in
 * `@kestrel/shared/pricing/config`. This module re-exports the TierId type
 * for app-internal use and adds derived types that are not part of the
 * shared config (FeeQuote, payment status enums, etc.).
 */

import type { TierId } from "./config";

export type { TierId };

/** Which side of a dispute is paying. */
export type PartyRole = "claimant" | "respondent";

/** What a payment is for. */
export type PaymentPurpose = "filing" | "tier_bump" | "counter_claim";

/** Lifecycle status of a single payment row. */
export type PaymentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded"
  | "partially_refunded";

/**
 * Resolved fee quote for a single party at a given tier and dispute value.
 *
 * For all tiers except Complex, `perPartyPence` equals the tier's flat fee.
 * For Complex, it equals `basePence + marginalPence`, capped at the tier cap.
 */
export interface FeeQuote {
  tierId: TierId;
  perPartyPence: number;
  /** Two parties × per-party fee. Useful for headline figures in copy. */
  totalPence: number;
  /** Plain-English explanation of how the fee was computed. */
  explanation: string;
}

/**
 * Result of computing a tier-bump top-up charge to the claimant.
 * `topUpPence` is what the claimant must pay in addition to their original
 * fee. Always non-negative; zero means no top-up is required.
 */
export interface TierBumpQuote {
  fromTier: TierId;
  toTier: TierId;
  topUpPence: number;
}

/**
 * Inputs for the good-faith refund eligibility predicate.
 * Built from timestamps and submission content at the call site.
 */
export interface GoodFaithEligibilityInput {
  /** Days between respondent notification and respondent payment. */
  paidWithinDays: number | null;
  /**
   * Word count of the respondent's substantive response submission.
   * Null if the respondent has not yet submitted a response.
   */
  engagementWords: number | null;
  /**
   * Days between respondent payment and dispute resolution. Null if not
   * yet resolved.
   */
  resolvedWithinDays: number | null;
  /** Has a refund already been issued for this respondent payment? */
  refundAlreadyIssued: boolean;
}

/** Detailed eligibility result with per-rule reasons. */
export interface GoodFaithEligibilityResult {
  eligible: boolean;
  reasons: {
    paidInTime: boolean;
    engagedSubstantively: boolean;
    resolvedInTime: boolean;
    notAlreadyRefunded: boolean;
  };
}
