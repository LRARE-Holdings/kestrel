/**
 * Stripe webhook handlers for the per-dispute payment model.
 *
 * This module replaces the previous subscription-oriented webhook handlers
 * (which lived alongside `lib/stripe/config.ts` and the various subscription
 * routes — all deleted in the pricing rewrite). It handles three event
 * categories:
 *
 *  1. PaymentIntent succeeded → mark `dispute_payments` row as succeeded,
 *     update `disputes.{role}_payment_status`, and (for the claimant's
 *     filing payment) trigger the respondent notification email.
 *
 *  2. PaymentIntent failed → mark the row as `failed`. The user will see
 *     this on the dispute detail page and can retry.
 *
 *  3. Charge refunded → mark the row as `refunded` (full) or
 *     `partially_refunded` (partial), and update the dispute. Refunds are
 *     issued by the admin via apps/admin (Phase 7) so the webhook is the
 *     authoritative confirmation that the money has actually moved.
 *
 * All handlers are idempotent: replaying the same event leaves the database
 * in the same state. This is mandatory for Stripe webhooks because Stripe
 * retries failed deliveries with exponential backoff.
 *
 * The actual respondent notification email is NOT sent here yet — that
 * wiring is part of Phase 6, which the founder has deferred until live
 * Stripe IDs land. For now, the success handler just logs that it would
 * fire and leaves a TODO marker.
 */

import type Stripe from "stripe";
import { createServiceClient } from "@kestrel/shared/supabase/service";

type ServiceClient = ReturnType<typeof createServiceClient>;
type PartyRole = "claimant" | "respondent";

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(
        event.data.object as Stripe.PaymentIntent,
      );
      break;

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(
        event.data.object as Stripe.PaymentIntent,
      );
      break;

    case "charge.refunded":
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;

    default:
      // Quietly ignore events we don't handle. The webhook route still
      // returns 200 so Stripe doesn't retry.
      console.log(`[stripe] Ignoring unhandled event type: ${event.type}`);
  }
}

// ---------------------------------------------------------------------------
// PaymentIntent succeeded
// ---------------------------------------------------------------------------

async function handlePaymentIntentSucceeded(
  intent: Stripe.PaymentIntent,
): Promise<void> {
  const supabase = createServiceClient();

  // Look up the corresponding dispute_payments row by Stripe PaymentIntent ID.
  const { data: payment, error: lookupError } = await supabase
    .from("dispute_payments")
    .select("id, dispute_id, party_role, purpose, status")
    .eq("stripe_payment_intent_id", intent.id)
    .maybeSingle();

  if (lookupError) {
    console.error(
      `[stripe] Failed to look up dispute_payments for PI ${intent.id}:`,
      lookupError,
    );
    return;
  }

  if (!payment) {
    // The PaymentIntent exists in Stripe but we have no dispute_payments
    // row. This can happen during test/dev — log loudly and bail.
    console.warn(
      `[stripe] No dispute_payments row found for PaymentIntent ${intent.id}. ` +
        "Either the row was never created or it was created with a different PI ID.",
    );
    return;
  }

  // Idempotency: if we've already processed this payment, do nothing.
  if (payment.status === "succeeded") {
    return;
  }

  // Capture the charge ID if available — useful for refund processing later.
  // The PaymentIntent object exposes `latest_charge` (string when not expanded).
  const latestCharge = (intent as unknown as { latest_charge?: string | { id?: string } | null }).latest_charge;
  const chargeId =
    typeof latestCharge === "string"
      ? latestCharge
      : (latestCharge?.id ?? null);

  // Update the dispute_payments row.
  const { error: updateError } = await supabase
    .from("dispute_payments")
    .update({
      status: "succeeded",
      stripe_charge_id: chargeId,
    })
    .eq("id", payment.id);

  if (updateError) {
    console.error(
      `[stripe] Failed to mark dispute_payments ${payment.id} as succeeded:`,
      updateError,
    );
    return;
  }

  // Update the dispute's per-role payment status + paid_at timestamp.
  await updateDisputePaymentStatus(
    supabase,
    payment.dispute_id,
    payment.party_role as PartyRole,
    "succeeded",
  );

  // For the claimant's filing payment, this is the moment the dispute is
  // genuinely "live" and the respondent notification email should fire.
  // The actual email send is wired up in Phase 6 (deferred until Stripe
  // IDs land). For now we log a TODO.
  if (payment.party_role === "claimant" && payment.purpose === "filing") {
    console.log(
      `[stripe] Claimant filing payment confirmed for dispute ${payment.dispute_id}. ` +
        "TODO (Phase 6): trigger respondent notification email.",
    );
  }
}

// ---------------------------------------------------------------------------
// PaymentIntent failed
// ---------------------------------------------------------------------------

async function handlePaymentIntentFailed(
  intent: Stripe.PaymentIntent,
): Promise<void> {
  const supabase = createServiceClient();

  const { data: payment, error: lookupError } = await supabase
    .from("dispute_payments")
    .select("id, dispute_id, party_role, status")
    .eq("stripe_payment_intent_id", intent.id)
    .maybeSingle();

  if (lookupError) {
    console.error(
      `[stripe] Failed to look up dispute_payments for failed PI ${intent.id}:`,
      lookupError,
    );
    return;
  }
  if (!payment) {
    console.warn(
      `[stripe] No dispute_payments row found for failed PaymentIntent ${intent.id}.`,
    );
    return;
  }
  if (payment.status === "failed") {
    return; // idempotent
  }

  const { error: updateError } = await supabase
    .from("dispute_payments")
    .update({ status: "failed" })
    .eq("id", payment.id);

  if (updateError) {
    console.error(
      `[stripe] Failed to mark dispute_payments ${payment.id} as failed:`,
      updateError,
    );
    return;
  }

  await updateDisputePaymentStatus(
    supabase,
    payment.dispute_id,
    payment.party_role as PartyRole,
    "failed",
  );
}

// ---------------------------------------------------------------------------
// Charge refunded
// ---------------------------------------------------------------------------

async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const supabase = createServiceClient();

  // Look up the dispute_payments row by Stripe charge ID. The PaymentIntent
  // ID is also available on the charge object as a fallback.
  const lookupCharge = await supabase
    .from("dispute_payments")
    .select("id, dispute_id, party_role, status, amount_pence")
    .eq("stripe_charge_id", charge.id)
    .maybeSingle();

  let payment = lookupCharge.data;

  if (!payment && charge.payment_intent) {
    const piId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent.id;

    const lookupPi = await supabase
      .from("dispute_payments")
      .select("id, dispute_id, party_role, status, amount_pence")
      .eq("stripe_payment_intent_id", piId)
      .maybeSingle();

    payment = lookupPi.data;
  }

  if (!payment) {
    console.warn(
      `[stripe] No dispute_payments row found for refunded charge ${charge.id}.`,
    );
    return;
  }

  // Determine refund completeness from the charge.amount_refunded vs
  // charge.amount. Stripe expresses both in the smallest currency unit
  // (pence for GBP).
  const fullyRefunded = charge.amount_refunded >= charge.amount;
  const newStatus: "refunded" | "partially_refunded" = fullyRefunded
    ? "refunded"
    : "partially_refunded";

  // Idempotency
  if (payment.status === newStatus) {
    return;
  }

  // Pull the most recent refund object for record-keeping. Stripe orders
  // refunds newest-first.
  const refunds = (charge as unknown as { refunds?: { data?: Array<{ id?: string }> } }).refunds;
  const latestRefundId = refunds?.data?.[0]?.id ?? null;

  const { error: updateError } = await supabase
    .from("dispute_payments")
    .update({
      status: newStatus,
      stripe_refund_id: latestRefundId,
    })
    .eq("id", payment.id);

  if (updateError) {
    console.error(
      `[stripe] Failed to mark dispute_payments ${payment.id} as ${newStatus}:`,
      updateError,
    );
    return;
  }

  await updateDisputePaymentStatus(
    supabase,
    payment.dispute_id,
    payment.party_role as PartyRole,
    newStatus,
  );

  console.log(
    `[stripe] Charge ${charge.id} refunded (${newStatus}) for dispute ${payment.dispute_id}. ` +
      "TODO (Phase 6): trigger refund-issued email.",
  );
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Update the {role}_payment_status and {role}_paid_at columns on the
 * disputes row. Centralised so the column-name pattern is in one place.
 */
async function updateDisputePaymentStatus(
  supabase: ServiceClient,
  disputeId: string,
  role: PartyRole,
  status: "succeeded" | "failed" | "refunded" | "partially_refunded",
): Promise<void> {
  const update: Record<string, unknown> = {};

  if (role === "claimant") {
    update.claimant_payment_status = status;
    if (status === "succeeded") {
      update.claimant_paid_at = new Date().toISOString();
    }
  } else {
    update.respondent_payment_status = status;
    if (status === "succeeded") {
      update.respondent_paid_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from("disputes")
    .update(update)
    .eq("id", disputeId);

  if (error) {
    console.error(
      `[stripe] Failed to update dispute ${disputeId} ${role}_payment_status to ${status}:`,
      error,
    );
  }
}
