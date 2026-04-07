/**
 * Pure tier-resolution and fee-quoting functions.
 *
 * No DB, no Stripe, no React, no environment access. Every function in this
 * module is deterministic and unit-testable in isolation. The companion test
 * suite in `__tests__/tiers.test.ts` covers the boundaries.
 *
 * All inputs and outputs are integer pence — no floats. The single place
 * where a floating-point intermediate appears is the Complex tier's
 * marginal-rate calculation, which is rounded to whole pence at the end via
 * `Math.round`.
 */

import {
  YEAR_1_TIERS,
  GOOD_FAITH_REFUND_DAYS,
  RESPONDENT_PAYMENT_WINDOW_DAYS,
  MIN_SUBSTANTIVE_RESPONSE_WORDS,
  STRIPE_FEE_RETENTION_PENCE,
  type TierId,
} from "./config";
import { formatGBP, formatGBPCompact } from "./format";
import type {
  FeeQuote,
  GoodFaithEligibilityInput,
  GoodFaithEligibilityResult,
  TierBumpQuote,
} from "./types";

/**
 * Resolve the tier ID for a given dispute value (in integer pence).
 *
 * - `null`, `undefined`, or `0` → smallest tier (no value declared).
 * - Negative values throw — the schema layer should reject these before us.
 * - Values exactly on a boundary land in the higher tier (boundaries are
 *   inclusive lower, exclusive upper).
 */
export function resolveTier(disputeValuePence: number | null | undefined): TierId {
  if (disputeValuePence == null || disputeValuePence === 0) {
    return YEAR_1_TIERS[0].id;
  }
  if (disputeValuePence < 0) {
    throw new Error(`resolveTier: negative dispute value (${disputeValuePence})`);
  }

  for (const tier of YEAR_1_TIERS) {
    const aboveMin = disputeValuePence >= tier.minValuePence;
    const belowMax = tier.maxValuePence == null || disputeValuePence < tier.maxValuePence;
    if (aboveMin && belowMax) {
      return tier.id;
    }
  }
  // Unreachable: the last tier has maxValuePence === null. Belt-and-braces.
  return YEAR_1_TIERS[YEAR_1_TIERS.length - 1].id;
}

/**
 * Compute the per-party fee for a given tier and dispute value.
 *
 * For Small/Standard/Larger this is the flat fee defined in config.
 * For Complex it is `basePence + Math.round(disputeValuePence * marginalRate)`,
 * capped at the tier cap.
 */
export function quoteFee(
  tierId: TierId,
  disputeValuePence: number | null | undefined,
): FeeQuote {
  const tier = YEAR_1_TIERS.find((t) => t.id === tierId);
  if (!tier) {
    throw new Error(`quoteFee: unknown tier id "${tierId}"`);
  }

  let perPartyPence = tier.perPartyFeePence;
  let explanation = `Flat fee for the ${tier.label} tier (${formatGBP(perPartyPence)} per party).`;

  if (tier.marginalRate != null && disputeValuePence != null && disputeValuePence > tier.minValuePence) {
    const overage = disputeValuePence - tier.minValuePence;
    const marginalPence = Math.round(overage * tier.marginalRate);
    perPartyPence = tier.perPartyFeePence + marginalPence;

    if (tier.perPartyCapPence != null && perPartyPence > tier.perPartyCapPence) {
      perPartyPence = tier.perPartyCapPence;
      explanation =
        `${tier.label} tier base ${formatGBP(tier.perPartyFeePence)} + ` +
        `${(tier.marginalRate * 100).toFixed(2)}% of value over ${formatGBPCompact(tier.minValuePence)}, ` +
        `capped at ${formatGBP(tier.perPartyCapPence)} per party.`;
    } else {
      explanation =
        `${tier.label} tier base ${formatGBP(tier.perPartyFeePence)} + ` +
        `${formatGBP(marginalPence)} marginal ` +
        `(${(tier.marginalRate * 100).toFixed(2)}% of value over ${formatGBPCompact(tier.minValuePence)}).`;
    }
  }

  return {
    tierId: tier.id,
    perPartyPence,
    totalPence: perPartyPence * 2,
    explanation,
  };
}

/**
 * Compute the top-up amount the claimant must pay when their dispute is
 * tier-bumped upward (e.g. respondent contested the value as higher).
 *
 * The top-up equals (new tier's per-party fee at the new value) minus
 * (old tier's per-party fee at the old value). Never negative — if the
 * new tier is the same as or below the old tier, returns 0.
 *
 * The respondent's tier-bump charge is handled separately: PRICING.md §4.1
 * states that contesting upward never costs the respondent more (the bump
 * is charged to the claimant), so this function only ever computes a
 * claimant-side delta.
 */
export function quoteTierBump({
  fromTier,
  toTier,
  fromValuePence,
  toValuePence,
}: {
  fromTier: TierId;
  toTier: TierId;
  fromValuePence: number | null | undefined;
  toValuePence: number | null | undefined;
}): TierBumpQuote {
  const fromOrder = YEAR_1_TIERS.findIndex((t) => t.id === fromTier);
  const toOrder = YEAR_1_TIERS.findIndex((t) => t.id === toTier);
  if (fromOrder === -1 || toOrder === -1) {
    throw new Error(
      `quoteTierBump: unknown tier id ("${fromTier}" → "${toTier}")`,
    );
  }
  if (toOrder <= fromOrder) {
    return { fromTier, toTier, topUpPence: 0 };
  }

  const oldFee = quoteFee(fromTier, fromValuePence).perPartyPence;
  const newFee = quoteFee(toTier, toValuePence).perPartyPence;
  return {
    fromTier,
    toTier,
    topUpPence: Math.max(0, newFee - oldFee),
  };
}

/**
 * Pure predicate for the good-faith refund mechanic — see PRICING.md §5.
 *
 * The respondent's filing fee is fully refunded iff:
 *  1. They paid within the respondent payment window.
 *  2. Their response was substantive (≥ minimum word count).
 *  3. The dispute resolved within the good-faith refund window.
 *  4. A refund hasn't already been issued.
 *
 * Inputs are expressed as days/word counts so this function can be reused
 * by both the admin tooling (server-side) and the user-facing eligibility
 * indicator (read-only).
 */
export function evaluateGoodFaithRefund(
  input: GoodFaithEligibilityInput,
): GoodFaithEligibilityResult {
  const paidInTime =
    input.paidWithinDays != null &&
    input.paidWithinDays >= 0 &&
    input.paidWithinDays <= RESPONDENT_PAYMENT_WINDOW_DAYS;

  const engagedSubstantively =
    input.engagementWords != null &&
    input.engagementWords >= MIN_SUBSTANTIVE_RESPONSE_WORDS;

  const resolvedInTime =
    input.resolvedWithinDays != null &&
    input.resolvedWithinDays >= 0 &&
    input.resolvedWithinDays <= GOOD_FAITH_REFUND_DAYS;

  const notAlreadyRefunded = input.refundAlreadyIssued === false;

  return {
    eligible:
      paidInTime && engagedSubstantively && resolvedInTime && notAlreadyRefunded,
    reasons: {
      paidInTime,
      engagedSubstantively,
      resolvedInTime,
      notAlreadyRefunded,
    },
  };
}

/**
 * Compute the refund amount for a withdrawn case — see PRICING.md §4.4.
 *
 * - Pre-notification withdrawal: claimant gets full refund minus the
 *   Stripe fee retention (£5).
 * - Post-notification withdrawal: claimant retains nothing (returns 0).
 *
 * The respondent's refund (when applicable) is always the full per-party
 * fee — the Stripe retention only applies to the claimant.
 */
export function quoteWithdrawalRefund({
  paidPence,
  respondentNotified,
}: {
  paidPence: number;
  respondentNotified: boolean;
}): { refundPence: number; reason: string } {
  if (paidPence <= 0) {
    return { refundPence: 0, reason: "No payment recorded." };
  }
  if (respondentNotified) {
    return {
      refundPence: 0,
      reason: "Withdrawn after respondent notification — claimant fee retained.",
    };
  }
  const refundPence = Math.max(0, paidPence - STRIPE_FEE_RETENTION_PENCE);
  return {
    refundPence,
    reason: `Pre-notification withdrawal: full refund minus ${formatGBP(STRIPE_FEE_RETENTION_PENCE)} Stripe retention.`,
  };
}
