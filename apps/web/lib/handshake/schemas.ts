import { z } from "zod/v4";

// ── Term Schema ─────────────────────────────────────────────────────────────

export const handshakeTermSchema = z.object({
  description: z.string().min(1, "Term description is required").max(2000, "Term description is too long"),
  responsibleParty: z.enum(["party_a", "party_b", "both"], {
    error: "Select who is responsible",
  }),
  deadline: z
    .string()
    .date("Must be a valid date (YYYY-MM-DD)")
    .optional()
    .or(z.literal("")),
  amount: z
    .number()
    .positive("Amount must be greater than zero")
    .optional()
    .or(z.nan()),
});

export type HandshakeTermInput = z.infer<typeof handshakeTermSchema>;

// ── Party Details ───────────────────────────────────────────────────────────

const partySchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  email: z.string().email("Must be a valid email address").max(320, "Email is too long"),
  businessName: z.string().min(1, "Business name is required").max(200, "Business name is too long"),
});

// ── Create Handshake ────────────────────────────────────────────────────────

export const createHandshakeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(5000, "Description is too long").optional().or(z.literal("")),
  partyA: partySchema,
  partyB: partySchema,
  terms: z.array(handshakeTermSchema).min(1, "At least one term is required"),
  includeDisputeClause: z.boolean(),
});

export type CreateHandshakeInput = z.infer<typeof createHandshakeSchema>;

// ── Respond to Handshake ────────────────────────────────────────────────────

export const handshakeResponseSchema = z.object({
  responseType: z.enum(["confirm", "modify", "decline"], {
    error: "Select a response type",
  }),
  message: z.string().max(5000, "Message is too long").optional().or(z.literal("")),
  respondentName: z.string().min(1, "Your name is required").max(200, "Name is too long"),
  respondentEmail: z.string().email("Must be a valid email address").max(320, "Email is too long"),
});

export type HandshakeResponseInput = z.infer<typeof handshakeResponseSchema>;
