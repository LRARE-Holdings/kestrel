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
  name: z.string().min(1, "Name is required"),
  businessName: z.string().min(1, "Business name is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Must be a valid email address"),
});

// ── Notice Schema ────────────────────────────────────────────────────────────

export const noticeSchema = z.object({
  noticeType: z.enum(["breach", "termination", "change_request", "payment_demand", "general"]),
  sender: partySchema,
  recipient: partySchema,
  reference: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Notice content is required"),
  relevantClause: z.string().optional(),
  requiredAction: z.string().optional(),
  responseDeadline: z.string().date("Must be a valid date (YYYY-MM-DD)").optional(),
  consequences: z.string().optional(),
  includeDisputeClause: z.boolean(),
});

export type NoticeInput = z.infer<typeof noticeSchema>;

// ── Acknowledge Schema ───────────────────────────────────────────────────────

export const acknowledgeSchema = z.object({
  acknowledgerName: z.string().min(1, "Your name is required"),
  acknowledgerEmail: z.string().email("Must be a valid email address"),
});

export type AcknowledgeInput = z.infer<typeof acknowledgeSchema>;
