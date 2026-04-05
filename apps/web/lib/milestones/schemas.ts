import { z } from "zod/v4";

// ── Party Schema ─────────────────────────────────────────────────────────────

const partySchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  email: z.string().email("Must be a valid email address").max(320, "Email is too long"),
  businessName: z.string().min(1, "Business name is required").max(200, "Business name is too long"),
});

// ── Milestone Schema ─────────────────────────────────────────────────────────

export const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(5000, "Description is too long").optional(),
  responsibleParty: z.enum(["party_a", "party_b"]),
  dueDate: z.string().date("Must be a valid date (YYYY-MM-DD)"),
  paymentAmount: z
    .number()
    .positive("Payment amount must be greater than zero")
    .optional(),
  deliverables: z.array(z.string().min(1)).optional(),
});

export type MilestoneInput = z.infer<typeof milestoneSchema>;

// ── Create Project Schema ────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200, "Project name is too long"),
  description: z.string().max(5000, "Description is too long").optional(),
  partyA: partySchema,
  partyB: partySchema,
  startDate: z.string().date("Must be a valid date (YYYY-MM-DD)"),
  expectedEndDate: z
    .string()
    .date("Must be a valid date (YYYY-MM-DD)")
    .optional(),
  milestones: z
    .array(milestoneSchema)
    .min(1, "At least one milestone is required"),
  includeDisputeClause: z.boolean(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// ── Update Milestone Schema ──────────────────────────────────────────────────

export const updateMilestoneSchema = z.object({
  milestoneId: z.string().uuid("Invalid milestone ID"),
  status: z.enum(["pending", "in_progress", "completed", "disputed"]),
});

export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
