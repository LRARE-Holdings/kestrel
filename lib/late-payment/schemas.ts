import { z } from "zod/v4";

// ── Calculator Schema ────────────────────────────────────────────────────────

export const calculatorSchema = z.object({
  invoiceAmount: z
    .number({ error: "Invoice amount is required" })
    .positive("Invoice amount must be greater than zero"),
  invoiceDate: z
    .string({ error: "Invoice date is required" })
    .date("Must be a valid date (YYYY-MM-DD)"),
  paymentTermsDays: z
    .number()
    .int("Payment terms must be a whole number")
    .min(0, "Payment terms cannot be negative"),
  calculationDate: z
    .string()
    .date("Must be a valid date (YYYY-MM-DD)")
    .optional(),
});

export type CalculatorInput = z.infer<typeof calculatorSchema>;

// ── Letter Schema ────────────────────────────────────────────────────────────

const partyDetailsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  businessName: z.string().min(1, "Business name is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Must be a valid email address"),
});

export const letterSchema = z.object({
  creditor: partyDetailsSchema,
  debtor: partyDetailsSchema,
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z
    .string({ error: "Invoice date is required" })
    .date("Must be a valid date (YYYY-MM-DD)"),
  amountOwed: z
    .number({ error: "Amount owed is required" })
    .positive("Amount must be greater than zero"),
  paymentTermsDays: z
    .number()
    .int()
    .min(0),
  previousCorrespondenceDates: z
    .array(z.string().date())
    .optional(),
  includeKestrelClause: z.boolean(),
  letterStage: z
    .number()
    .int()
    .min(1, "Stage must be between 1 and 4")
    .max(4, "Stage must be between 1 and 4"),
});

export type LetterInput = z.infer<typeof letterSchema>;
export type PartyDetails = z.infer<typeof partyDetailsSchema>;
