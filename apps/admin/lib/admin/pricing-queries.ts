/**
 * Admin queries for the dispute fee model.
 *
 * All queries use the service-role Supabase client (bypasses RLS) because
 * admins need to see payment rows across all disputes. Auth is enforced by
 * the calling page via getAdminUser() before these are invoked.
 *
 * Pricing values come from `@kestrel/shared/pricing/config` — never
 * hardcoded here. Refund eligibility logic comes from
 * `@kestrel/shared/pricing/tiers`.
 */

import { createServiceClient } from "@kestrel/shared/supabase/service";
import {
  evaluateGoodFaithRefund,
  quoteFee,
} from "@kestrel/shared/pricing/tiers";
import {
  GOOD_FAITH_REFUND_DAYS,
  RESPONDENT_PAYMENT_WINDOW_DAYS,
  MIN_SUBSTANTIVE_RESPONSE_WORDS,
} from "@kestrel/shared/pricing/config";
import type {
  GoodFaithEligibilityResult,
  PartyRole,
  PaymentPurpose,
  PaymentStatus,
  TierId,
} from "@kestrel/shared/pricing/types";

// ---------------------------------------------------------------------------
// Types returned to the admin UI
// ---------------------------------------------------------------------------

export interface DisputePaymentRow {
  id: string;
  dispute_id: string;
  party_role: PartyRole;
  purpose: PaymentPurpose;
  tier_id: TierId;
  amount_pence: number;
  currency: string;
  status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_refund_id: string | null;
  refund_reason: string | null;
  refund_processed_at: string | null;
  refund_processed_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Aggregated fee summary for a dispute, suitable for the admin fee panel.
 * Combines the dispute's tier + per-role payment status with the latest
 * `dispute_payments` rows and a fresh good-faith refund eligibility check.
 */
export interface DisputeFeeSummary {
  dispute_id: string;
  tier_id: TierId | null;
  tier_locked_at: string | null;

  claimant: {
    status: PaymentStatus | null;
    paid_at: string | null;
    payment_row: DisputePaymentRow | null;
    expected_per_party_pence: number | null;
  };

  respondent: {
    status: PaymentStatus | null;
    paid_at: string | null;
    payment_row: DisputePaymentRow | null;
    expected_per_party_pence: number | null;
    notified_at: string | null;
    engagement_recorded_at: string | null;
    engagement_word_count: number | null;
  };

  goodFaithRefund: GoodFaithEligibilityResult & {
    /** Description of each criterion in plain English for UI display */
    criteria: Array<{
      label: string;
      met: boolean;
      detail: string;
    }>;
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Fetch all payment rows for a dispute, newest first.
 */
export async function getDisputePayments(
  disputeId: string,
): Promise<DisputePaymentRow[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("dispute_payments")
    .select("*")
    .eq("dispute_id", disputeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`[admin/pricing] getDisputePayments(${disputeId}):`, error);
    return [];
  }
  return (data ?? []) as DisputePaymentRow[];
}

/**
 * Build a complete fee summary for the admin fee panel.
 *
 * Performs three queries:
 *  1. The dispute itself (tier, payment statuses, response_deadline,
 *     respondent_engagement_recorded_at, amount_disputed).
 *  2. All dispute_payments rows for that dispute.
 *  3. The most recent respondent submission (to compute engagement word
 *     count for the good-faith refund check).
 */
export async function getDisputeFeeSummary(
  disputeId: string,
): Promise<DisputeFeeSummary | null> {
  const supabase = createServiceClient();

  // 1. The dispute row with all pricing-related columns
  const { data: dispute, error: disputeError } = await supabase
    .from("disputes")
    .select(
      `
        id,
        amount_disputed,
        tier_id,
        tier_locked_at,
        claimant_payment_status,
        claimant_paid_at,
        respondent_payment_status,
        respondent_paid_at,
        respondent_engagement_recorded_at,
        responding_party_id
      `,
    )
    .eq("id", disputeId)
    .maybeSingle();

  if (disputeError || !dispute) {
    console.error(
      `[admin/pricing] getDisputeFeeSummary(${disputeId}):`,
      disputeError,
    );
    return null;
  }

  // 2. All payment rows for this dispute
  const payments = await getDisputePayments(disputeId);

  const claimantPayment =
    payments.find((p) => p.party_role === "claimant" && p.purpose === "filing") ??
    null;
  const respondentPayment =
    payments.find(
      (p) => p.party_role === "respondent" && p.purpose === "filing",
    ) ?? null;

  // 3. Compute respondent's engagement word count from their most recent
  //    `response` submission. This drives the good-faith refund check.
  let engagementWordCount: number | null = null;
  let respondentNotifiedAt: string | null = null;

  if (dispute.responding_party_id) {
    const { data: latestResponse } = await supabase
      .from("dispute_submissions")
      .select("content, created_at")
      .eq("dispute_id", disputeId)
      .eq("submission_type", "response")
      .eq("submitted_by", dispute.responding_party_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestResponse?.content) {
      engagementWordCount = countWords(latestResponse.content);
    }
  }

  // The "respondent notified" timestamp is when the respondent first
  // received the notification email — for now we approximate it as the
  // dispute's `created_at` timestamp once the claimant's filing payment
  // has succeeded. (Phase 6 will surface a precise notified_at column.)
  respondentNotifiedAt = dispute.claimant_paid_at;

  // Compute good-faith refund eligibility
  const eligibility = computeGoodFaithEligibility({
    respondentNotifiedAt,
    respondentPaidAt: dispute.respondent_paid_at,
    engagementWordCount,
    resolvedAt: null, // Resolution comes from a separate dispute status check
    refundAlreadyIssued: respondentPayment?.status === "refunded",
    disputeStatus: null, // wired up properly in pricing actions
  });

  // Compute the *expected* per-party fees from the tier (so the UI can show
  // "should have paid £75" even before the row arrives).
  const expectedPerParty =
    dispute.tier_id != null
      ? quoteFee(dispute.tier_id as TierId, (dispute.amount_disputed ?? 0) * 100)
          .perPartyPence
      : null;

  return {
    dispute_id: dispute.id,
    tier_id: (dispute.tier_id as TierId | null) ?? null,
    tier_locked_at: dispute.tier_locked_at,
    claimant: {
      status: (dispute.claimant_payment_status as PaymentStatus | null) ?? null,
      paid_at: dispute.claimant_paid_at,
      payment_row: claimantPayment,
      expected_per_party_pence: expectedPerParty,
    },
    respondent: {
      status:
        (dispute.respondent_payment_status as PaymentStatus | null) ?? null,
      paid_at: dispute.respondent_paid_at,
      payment_row: respondentPayment,
      expected_per_party_pence: expectedPerParty,
      notified_at: respondentNotifiedAt,
      engagement_recorded_at: dispute.respondent_engagement_recorded_at,
      engagement_word_count: engagementWordCount,
    },
    goodFaithRefund: eligibility,
  };
}

/**
 * Compute days between two ISO timestamps. Returns null if either is null.
 */
function daysBetween(
  fromIso: string | null,
  toIso: string | null,
): number | null {
  if (!fromIso || !toIso) return null;
  const fromMs = new Date(fromIso).getTime();
  const toMs = new Date(toIso).getTime();
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) return null;
  return Math.floor((toMs - fromMs) / (1000 * 60 * 60 * 24));
}

/** Word counter matching the founder's "≥100 substantive words" rule. */
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

/**
 * Compute the good-faith refund eligibility result with human-readable
 * criteria. The pure predicate lives in `tiers.ts`; this function adapts
 * its inputs from raw DB values and decorates the output for UI display.
 */
function computeGoodFaithEligibility(input: {
  respondentNotifiedAt: string | null;
  respondentPaidAt: string | null;
  engagementWordCount: number | null;
  resolvedAt: string | null;
  refundAlreadyIssued: boolean;
  disputeStatus: string | null;
}): DisputeFeeSummary["goodFaithRefund"] {
  const paidWithinDays = daysBetween(
    input.respondentNotifiedAt,
    input.respondentPaidAt,
  );
  const resolvedWithinDays = daysBetween(
    input.respondentPaidAt,
    input.resolvedAt,
  );

  const result = evaluateGoodFaithRefund({
    paidWithinDays,
    engagementWords: input.engagementWordCount,
    resolvedWithinDays,
    refundAlreadyIssued: input.refundAlreadyIssued,
  });

  const criteria: DisputeFeeSummary["goodFaithRefund"]["criteria"] = [
    {
      label: `Respondent paid within ${RESPONDENT_PAYMENT_WINDOW_DAYS} days of notification`,
      met: result.reasons.paidInTime,
      detail:
        paidWithinDays == null
          ? "Respondent has not paid yet."
          : `Paid ${paidWithinDays} day${paidWithinDays === 1 ? "" : "s"} after notification.`,
    },
    {
      label: `Substantive response (≥${MIN_SUBSTANTIVE_RESPONSE_WORDS} words)`,
      met: result.reasons.engagedSubstantively,
      detail:
        input.engagementWordCount == null
          ? "No response submitted yet."
          : `${input.engagementWordCount} word${input.engagementWordCount === 1 ? "" : "s"} in latest response.`,
    },
    {
      label: `Resolved within ${GOOD_FAITH_REFUND_DAYS} days of respondent joining`,
      met: result.reasons.resolvedInTime,
      detail:
        resolvedWithinDays == null
          ? "Dispute not yet resolved."
          : `Resolved ${resolvedWithinDays} day${resolvedWithinDays === 1 ? "" : "s"} after respondent paid.`,
    },
    {
      label: "Refund not already processed",
      met: result.reasons.notAlreadyRefunded,
      detail: input.refundAlreadyIssued
        ? "A refund has already been issued for this dispute."
        : "No refund has been issued yet.",
    },
  ];

  return {
    ...result,
    criteria,
  };
}
