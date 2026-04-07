/**
 * Zod schemas for pricing-related API route bodies.
 *
 * These guard the boundary between client and server. Every payment API
 * route should validate its body with one of these schemas before touching
 * Stripe or the database.
 */

import { z } from "zod";

export const tierIdSchema = z.enum(["small", "standard", "larger", "complex"]);
export const partyRoleSchema = z.enum(["claimant", "respondent"]);
export const paymentPurposeSchema = z.enum([
  "filing",
  "tier_bump",
  "counter_claim",
]);

/**
 * Body schema for the POST /api/disputes/[id]/payment/initiate route.
 * Note that the dispute ID itself comes from the URL, not the body.
 */
export const initiateDisputePaymentSchema = z.object({
  /** Optional override; ordinarily resolved server-side from the dispute. */
  expectedTier: tierIdSchema.optional(),
});

/**
 * Body schema for the POST /api/disputes/[id]/payment/tier-bump route.
 * Used by the admin app to top-up a claimant's payment after manual tier
 * adjustment.
 */
export const tierBumpRequestSchema = z.object({
  newTier: tierIdSchema,
  newDisputeValuePence: z
    .number()
    .int("Dispute value must be an integer (pence)")
    .nonnegative("Dispute value cannot be negative"),
  reason: z
    .string()
    .min(20, "Please provide at least 20 characters explaining the bump")
    .max(2000, "Reason must be 2,000 characters or fewer"),
});

/**
 * Body schema for the admin good-faith refund action. The dispute ID
 * comes from the form/URL — the body just confirms intent.
 */
export const processRefundSchema = z.object({
  disputeId: z.string().uuid("Invalid dispute ID"),
  type: z.enum(["good_faith", "withdrawal", "manual"]),
  notes: z
    .string()
    .max(2000, "Notes must be 2,000 characters or fewer")
    .optional(),
});

export type InitiateDisputePaymentInput = z.infer<typeof initiateDisputePaymentSchema>;
export type TierBumpRequestInput = z.infer<typeof tierBumpRequestSchema>;
export type ProcessRefundInput = z.infer<typeof processRefundSchema>;
