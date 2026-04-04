import { z } from "zod";

export const LEAD_STAGES = [
  "lead",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
] as const;

export const LEAD_STATUSES = ["active", "archived"] as const;

export const INTERACTION_TYPES = [
  "email",
  "call",
  "meeting",
  "note",
  "linkedin",
] as const;

export const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),
  company: z.string().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  stage: z.enum(LEAD_STAGES).default("lead"),
  next_action_date: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const createInteractionSchema = z.object({
  type: z.enum(INTERACTION_TYPES),
  content: z.string().min(1, "Content is required"),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type CreateInteractionInput = z.infer<typeof createInteractionSchema>;
export type LeadStage = (typeof LEAD_STAGES)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type InteractionType = (typeof INTERACTION_TYPES)[number];
