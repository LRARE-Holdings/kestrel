import { z } from "zod";

// ---------------------------------------------------------------------------
// Filing wizard step schemas
// ---------------------------------------------------------------------------

/** Step 1: Dispute details */
export const filingStep1Schema = z.object({
  dispute_type: z.enum([
    "payment",
    "deliverables",
    "service_quality",
    "contract_interpretation",
    "other",
  ]),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be 200 characters or fewer"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be 5,000 characters or fewer"),
  amount_disputed: z
    .number()
    .positive("Amount must be a positive number")
    .optional(),
});

/** Step 2: Responding party details */
export const filingStep2Schema = z.object({
  responding_party_name: z
    .string()
    .min(1, "Responding party name is required"),
  responding_party_email: z
    .string()
    .email("A valid email address is required"),
  responding_party_business: z
    .string()
    .min(1, "Responding party business name is required"),
});

/** Step 4: Kestrel clause and confirmation */
export const filingStep4Schema = z.object({
  includes_dispute_clause: z.boolean(),
  confirmed: z.literal(true, {
    message: "You must confirm the information is accurate",
  }),
});

/**
 * Combined filing schema used for server-side validation.
 * Merges steps 1, 2, and 4 (step 3 is evidence upload, validated separately).
 */
export const disputeFilingSchema = filingStep1Schema
  .merge(filingStep2Schema)
  .merge(
    z.object({
      includes_dispute_clause: z.boolean(),
    }),
  );

// ---------------------------------------------------------------------------
// Submission schemas
// ---------------------------------------------------------------------------

/** Schema for adding a submission to an existing dispute */
export const submissionSchema = z.object({
  dispute_id: z.string().uuid("Invalid dispute ID"),
  submission_type: z.enum([
    "initial_claim",
    "response",
    "reply",
    "evidence_summary",
    "proposal",
    "acceptance",
    "rejection",
    "withdrawal",
  ]),
  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content must be 5,000 characters or fewer"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/** Metadata shape for settlement proposals */
export const proposalMetadataSchema = z.object({
  proposed_amount: z
    .number()
    .positive("Proposed amount must be positive")
    .optional(),
  proposed_terms: z
    .string()
    .min(1, "Proposed terms are required")
    .max(2000, "Proposed terms must be 2,000 characters or fewer"),
});

/** Schema for the evidence upload request (file validation is separate) */
export const evidenceUploadSchema = z.object({
  dispute_id: z.string().uuid("Invalid dispute ID"),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type FilingStep1Data = z.infer<typeof filingStep1Schema>;
export type FilingStep2Data = z.infer<typeof filingStep2Schema>;
export type FilingStep4Data = z.infer<typeof filingStep4Schema>;
export type DisputeFilingInput = z.infer<typeof disputeFilingSchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;
export type ProposalMetadata = z.infer<typeof proposalMetadataSchema>;
export type EvidenceUploadInput = z.infer<typeof evidenceUploadSchema>;
