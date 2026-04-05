import { z } from "zod/v4";

// ── Notice Types ─────────────────────────────────────────────────────────────

export const NOTICE_TYPES = [
  { value: "breach", label: "Breach of Contract", description: "Notify the other party of a contract breach and demand remedy" },
  { value: "termination", label: "Termination Notice", description: "Formally terminate an agreement with notice" },
  { value: "change_request", label: "Change Request", description: "Propose a change to existing terms or scope" },
  { value: "payment_demand", label: "Payment Demand", description: "Formal demand for outstanding payment" },
  { value: "general", label: "General Notice", description: "A formal notice that does not fit the above categories" },
] as const;

export type NoticeType = (typeof NOTICE_TYPES)[number]["value"];

// ── Party Schema ─────────────────────────────────────────────────────────────

const partySchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  businessName: z.string().min(1, "Business name is required").max(200, "Business name is too long"),
  address: z.string().min(1, "Address is required").max(500, "Address is too long"),
  email: z.string().email("Must be a valid email address").max(320, "Email is too long"),
});

// ── Notice Schema ────────────────────────────────────────────────────────────

export const noticeSchema = z.object({
  noticeType: z.enum(["breach", "termination", "change_request", "payment_demand", "general"]),
  sender: partySchema,
  recipient: partySchema,
  reference: z.string().max(200, "Reference is too long").optional(),
  subject: z.string().min(1, "Subject is required").max(200, "Subject is too long"),
  content: z.string().min(1, "Notice content is required").max(10000, "Content is too long"),
  relevantClause: z.string().max(2000, "Clause reference is too long").optional(),
  requiredAction: z.string().max(2000, "Required action is too long").optional(),
  responseDeadline: z.string().date("Must be a valid date (YYYY-MM-DD)").optional(),
  consequences: z.string().max(2000, "Consequences text is too long").optional(),
  includeDisputeClause: z.boolean(),
});

export type NoticeInput = z.infer<typeof noticeSchema>;

// ── Acknowledge Schema ───────────────────────────────────────────────────────

export const acknowledgeSchema = z.object({
  acknowledgerName: z.string().min(1, "Your name is required").max(200, "Name is too long"),
  acknowledgerEmail: z.string().email("Must be a valid email address").max(320, "Email is too long"),
});

export type AcknowledgeInput = z.infer<typeof acknowledgeSchema>;
