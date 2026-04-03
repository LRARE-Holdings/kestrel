import { z } from "zod/v4";

// ── Term Schema ─────────────────────────────────────────────────────────────

export const handshakeTermSchema = z.object({
  description: z.string().min(1, "Term description is required"),
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
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email address"),
  businessName: z.string().min(1, "Business name is required"),
});

// ── Create Handshake ────────────────────────────────────────────────────────

export const createHandshakeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
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
  message: z.string().optional().or(z.literal("")),
  respondentName: z.string().min(1, "Your name is required"),
  respondentEmail: z.string().email("Must be a valid email address"),
});

export type HandshakeResponseInput = z.infer<typeof handshakeResponseSchema>;
