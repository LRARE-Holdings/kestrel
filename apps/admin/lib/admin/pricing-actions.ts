"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServiceClient } from "@kestrel/shared/supabase/service";
import {
  evaluateGoodFaithRefund,
  quoteWithdrawalRefund,
} from "@kestrel/shared/pricing/tiers";
import type { TierId } from "@kestrel/shared/pricing/types";
import { getAdminUser } from "@/lib/auth/actions";
import { getDisputeFeeSummary } from "./pricing-queries";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const processGoodFaithRefundSchema = z.object({
  disputeId: z.string().uuid("Invalid dispute ID"),
  notes: z.string().max(2000).optional(),
});

const processWithdrawalRefundSchema = z.object({
  disputeId: z.string().uuid("Invalid dispute ID"),
  notes: z.string().max(2000).optional(),
});

const manualTierAdjustmentSchema = z.object({
  disputeId: z.string().uuid("Invalid dispute ID"),
  newTier: z.enum(["small", "standard", "larger", "complex"]),
  reason: z
    .string()
    .min(20, "Reason must be at least 20 characters")
    .max(2000, "Reason must be 2,000 characters or fewer"),
});

// ---------------------------------------------------------------------------
// processGoodFaithRefund
// ---------------------------------------------------------------------------

/**
 * Process a good-faith refund to the respondent — see PRICING.md §5.
 *
 * Workflow:
 *   1. Confirm caller is an authenticated admin (aal2 + admin claim).
 *   2. Re-evaluate refund eligibility server-side. Don't trust the client
 *      checklist — admins can be impatient and the criteria are mechanical.
 *   3. Issue the Stripe refund via stripe.refunds.create() — DEFERRED until
 *      live Stripe keys land (Phase 6 in the plan). For now we record the
 *      admin decision in dispute_payments + audit log and the webhook will
 *      flip status to `refunded` when the actual refund event arrives.
 *   4. Audit log the action with the admin's user ID.
 *   5. Email the respondent — DEFERRED until Phase 8 templates land.
 *   6. Revalidate the dispute detail page.
 */
export async function processGoodFaithRefund(
  input: z.infer<typeof processGoodFaithRefundSchema>,
): Promise<{ success: true } | { error: string }> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Not authorised" };

  const parsed = processGoodFaithRefundSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { disputeId, notes } = parsed.data;

  // Re-evaluate eligibility server-side. Pull a fresh summary so we don't
  // trust whatever the client thought was true at render time.
  const summary = await getDisputeFeeSummary(disputeId);
  if (!summary) {
    return { error: "Dispute not found" };
  }

  const eligibility = evaluateGoodFaithRefund({
    paidWithinDays:
      summary.respondent.notified_at && summary.respondent.paid_at
        ? Math.floor(
            (new Date(summary.respondent.paid_at).getTime() -
              new Date(summary.respondent.notified_at).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null,
    engagementWords: summary.respondent.engagement_word_count,
    resolvedWithinDays: null, // TODO: pull from disputes.resolved_at when wired
    refundAlreadyIssued: summary.respondent.payment_row?.status === "refunded",
  });

  if (!eligibility.eligible) {
    return {
      error:
        "Refund not eligible. " +
        Object.entries(eligibility.reasons)
          .filter(([, met]) => !met)
          .map(([key]) => key)
          .join(", "),
    };
  }

  const respondentPaymentId = summary.respondent.payment_row?.id;
  if (!respondentPaymentId) {
    return { error: "No respondent payment row to refund" };
  }

  const supabase = createServiceClient();

  // ---- Stripe API call: DEFERRED until live keys land (Phase 6) ----
  //
  // When ready, this is the call:
  //
  //   const stripe = getStripe();
  //   const refund = await stripe.refunds.create({
  //     payment_intent: summary.respondent.payment_row.stripe_payment_intent_id,
  //     reason: "requested_by_customer",
  //     metadata: {
  //       dispute_id: disputeId,
  //       refund_type: "good_faith",
  //       processed_by: admin.id,
  //     },
  //   });
  //
  // The webhook handler (apps/web/lib/stripe/webhook-handlers.ts
  // handleChargeRefunded) will flip dispute_payments.status to "refunded"
  // when Stripe sends the charge.refunded event.
  //
  // For now, we mark the row as `refunded` directly so the admin UI
  // reflects the decision immediately. The webhook becomes a no-op once
  // the row is already refunded (idempotency check in the handler).
  // -----------------------------------------------------------------

  const { error: updateError } = await supabase
    .from("dispute_payments")
    .update({
      status: "refunded",
      refund_reason: notes
        ? `good_faith: ${notes}`
        : "good_faith",
      refund_processed_by: admin.id,
      refund_processed_at: new Date().toISOString(),
    })
    .eq("id", respondentPaymentId);

  if (updateError) {
    console.error(
      `[admin/pricing] Failed to mark refund for dispute_payments ${respondentPaymentId}:`,
      updateError,
    );
    return { error: "Failed to record refund" };
  }

  // Mirror the status onto the disputes row so the table view is consistent
  await supabase
    .from("disputes")
    .update({ respondent_payment_status: "refunded" })
    .eq("id", disputeId);

  // Audit log
  await supabase.from("audit_log").insert({
    action: "good_faith_refund_processed",
    actor_id: admin.id,
    resource_type: "dispute",
    resource_id: disputeId,
    metadata: {
      payment_id: respondentPaymentId,
      notes: notes ?? null,
      // Eligibility snapshot at the moment of decision, for audit
      eligibility_reasons: eligibility.reasons,
    },
  });

  // ---- Email send: DEFERRED until Phase 8 refund-issued template ----
  // When ready:
  //   await sendDisputeEmail({
  //     to: respondentEmail,
  //     ...refundIssuedEmail({ type: "good_faith", ... }),
  //     userId: respondentUserId,
  //     disputeId,
  //     notificationType: "refund_issued",
  //     ...
  //   });
  // -------------------------------------------------------------------

  revalidatePath(`/disputes/${disputeId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// processWithdrawalRefund
// ---------------------------------------------------------------------------

/**
 * Process a withdrawal refund — see PRICING.md §4.4.
 *
 * Pre-notification (respondent never received the email): claimant gets a
 * full refund minus the £5 Stripe retention fee.
 *
 * Post-notification: claimant retains nothing. The respondent (if they
 * paid) is fully refunded separately by the same admin action.
 */
export async function processWithdrawalRefund(
  input: z.infer<typeof processWithdrawalRefundSchema>,
): Promise<{ success: true } | { error: string }> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Not authorised" };

  const parsed = processWithdrawalRefundSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { disputeId, notes } = parsed.data;

  const summary = await getDisputeFeeSummary(disputeId);
  if (!summary) {
    return { error: "Dispute not found" };
  }

  const supabase = createServiceClient();
  const respondentNotified = summary.claimant.paid_at != null;
  const claimantPayment = summary.claimant.payment_row;

  if (!claimantPayment) {
    return { error: "No claimant payment row to refund" };
  }

  const { refundPence, reason } = quoteWithdrawalRefund({
    paidPence: claimantPayment.amount_pence,
    respondentNotified,
  });

  // ---- Stripe API call: DEFERRED until live keys land (Phase 6) ----
  // When ready, partial refund of the claimant's payment using
  // stripe.refunds.create({ amount: refundPence, payment_intent: ... }).
  // -----------------------------------------------------------------

  if (refundPence > 0) {
    await supabase
      .from("dispute_payments")
      .update({
        status:
          refundPence === claimantPayment.amount_pence
            ? "refunded"
            : "partially_refunded",
        refund_reason: notes
          ? `withdrawal: ${notes}`
          : `withdrawal: ${reason}`,
        refund_processed_by: admin.id,
        refund_processed_at: new Date().toISOString(),
      })
      .eq("id", claimantPayment.id);
  }

  // Audit log captures the rule applied even when no money moved
  await supabase.from("audit_log").insert({
    action: "withdrawal_refund_processed",
    actor_id: admin.id,
    resource_type: "dispute",
    resource_id: disputeId,
    metadata: {
      payment_id: claimantPayment.id,
      refund_pence: refundPence,
      respondent_notified: respondentNotified,
      reason,
      notes: notes ?? null,
    },
  });

  revalidatePath(`/disputes/${disputeId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// manuallyAdjustTier
// ---------------------------------------------------------------------------

/**
 * Manually move a dispute from one tier to another. Used when the
 * respondent contests the dispute value upward (PRICING.md §4.1) or when
 * the founder needs to correct a misclassified case.
 *
 * Does NOT issue a top-up charge — that's handled by a separate Stripe
 * flow (Phase 6 in the plan, deferred until live keys land). This action
 * just records the new tier and creates an audit trail.
 */
export async function manuallyAdjustTier(
  input: z.infer<typeof manualTierAdjustmentSchema>,
): Promise<{ success: true } | { error: string }> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Not authorised" };

  const parsed = manualTierAdjustmentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { disputeId, newTier, reason } = parsed.data;

  const supabase = createServiceClient();

  // Capture the previous tier for the audit log
  const { data: existing } = await supabase
    .from("disputes")
    .select("tier_id")
    .eq("id", disputeId)
    .maybeSingle();

  const { error: updateError } = await supabase
    .from("disputes")
    .update({
      tier_id: newTier as TierId,
      tier_locked_at: new Date().toISOString(),
    })
    .eq("id", disputeId);

  if (updateError) {
    return { error: "Failed to update tier" };
  }

  await supabase.from("audit_log").insert({
    action: "tier_manually_adjusted",
    actor_id: admin.id,
    resource_type: "dispute",
    resource_id: disputeId,
    metadata: {
      from_tier: existing?.tier_id ?? null,
      to_tier: newTier,
      reason,
    },
  });

  revalidatePath(`/disputes/${disputeId}`);
  return { success: true };
}
