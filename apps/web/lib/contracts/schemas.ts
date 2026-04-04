import { z } from "zod/v4";

// ── Party Details ────────────────────────────────────────────────────────────

export const partyDetailsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  businessName: z.string().min(1, "Business name is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Must be a valid email address"),
  companyNumber: z.string().optional(),
});

export type PartyDetailsInput = z.infer<typeof partyDetailsSchema>;

// ── Freelancer Service Agreement ─────────────────────────────────────────────

export const freelancerSchema = z.object({
  partyA: partyDetailsSchema,
  partyB: partyDetailsSchema,
  effectiveDate: z
    .string({ error: "Effective date is required" })
    .date("Must be a valid date"),
  serviceDescription: z
    .string()
    .min(10, "Service description must be at least 10 characters"),
  deliverables: z
    .array(z.string().min(1, "Deliverable cannot be empty"))
    .min(1, "At least one deliverable is required"),
  paymentType: z.enum(["fixed", "hourly", "milestone"]),
  paymentAmount: z
    .number({ error: "Payment amount is required" })
    .positive("Amount must be greater than zero"),
  paymentTermsDays: z.number().int().min(1).max(120),
  ipOwnership: z.enum(["client", "freelancer", "joint"]),
  confidentiality: z.boolean(),
  confidentialityDurationMonths: z.number().int().min(1).max(120).optional(),
  terminationNoticeDays: z.number().int().min(1).max(180),
  includeKestrelClause: z.boolean(),
});

export type FreelancerInput = z.infer<typeof freelancerSchema>;

// ── Non-Disclosure Agreement (Mutual) ────────────────────────────────────────

export const ndaSchema = z.object({
  partyA: partyDetailsSchema,
  partyB: partyDetailsSchema,
  effectiveDate: z
    .string({ error: "Effective date is required" })
    .date("Must be a valid date"),
  confidentialInfoDescription: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  obligations: z
    .string()
    .min(10, "Obligations must be at least 10 characters"),
  durationMonths: z
    .number({ error: "Duration is required" })
    .int()
    .min(1, "Duration must be at least 1 month")
    .max(120, "Duration cannot exceed 120 months"),
  exceptions: z.string().optional(),
  includeKestrelClause: z.boolean(),
});

export type NdaInput = z.infer<typeof ndaSchema>;

// ── General Service Contract ─────────────────────────────────────────────────

export const generalServiceSchema = z.object({
  partyA: partyDetailsSchema,
  partyB: partyDetailsSchema,
  effectiveDate: z
    .string({ error: "Effective date is required" })
    .date("Must be a valid date"),
  serviceDescription: z
    .string()
    .min(10, "Service description must be at least 10 characters"),
  serviceDuration: z.string().min(1, "Service duration is required"),
  paymentAmount: z
    .number({ error: "Payment amount is required" })
    .positive("Amount must be greater than zero"),
  paymentFrequency: z.enum(["one-off", "weekly", "monthly", "quarterly", "annually"]),
  paymentTermsDays: z.number().int().min(1).max(120),
  terminationNoticeDays: z.number().int().min(1).max(180),
  liabilityCap: z.string().optional(),
  includeKestrelClause: z.boolean(),
});

export type GeneralServiceInput = z.infer<typeof generalServiceSchema>;

// ── Consulting Engagement Letter ─────────────────────────────────────────────

export const consultingSchema = z.object({
  partyA: partyDetailsSchema,
  partyB: partyDetailsSchema,
  effectiveDate: z
    .string({ error: "Effective date is required" })
    .date("Must be a valid date"),
  engagementScope: z
    .string()
    .min(10, "Engagement scope must be at least 10 characters"),
  deliverables: z
    .array(z.string().min(1, "Deliverable cannot be empty"))
    .min(1, "At least one deliverable is required"),
  dayRate: z
    .number({ error: "Day rate is required" })
    .positive("Day rate must be greater than zero"),
  estimatedDays: z
    .number({ error: "Estimated days is required" })
    .int()
    .positive("Must be at least 1 day"),
  paymentTermsDays: z.number().int().min(1).max(120),
  ipOwnership: z.enum(["client", "consultant", "joint"]),
  confidentiality: z.boolean(),
  terminationNoticeDays: z.number().int().min(1).max(180),
  includeKestrelClause: z.boolean(),
});

export type ConsultingInput = z.infer<typeof consultingSchema>;

// ── SaaS Subscription Agreement ──────────────────────────────────────────────

export const saasSchema = z.object({
  partyA: partyDetailsSchema,
  partyB: partyDetailsSchema,
  effectiveDate: z
    .string({ error: "Effective date is required" })
    .date("Must be a valid date"),
  serviceDescription: z
    .string()
    .min(10, "Service description must be at least 10 characters"),
  subscriptionTerm: z.enum(["monthly", "annual"]),
  subscriptionFee: z
    .number({ error: "Subscription fee is required" })
    .positive("Fee must be greater than zero"),
  paymentTermsDays: z.number().int().min(1).max(120),
  dataProcessing: z.boolean(),
  uptimeCommitment: z.string().optional(),
  supportLevel: z.enum(["standard", "priority", "premium"]),
  terminationNoticeDays: z.number().int().min(1).max(180),
  includeKestrelClause: z.boolean(),
});

export type SaasInput = z.infer<typeof saasSchema>;

// ── Subcontractor Agreement ──────────────────────────────────────────────────

export const subcontractorSchema = z.object({
  partyA: partyDetailsSchema,
  partyB: partyDetailsSchema,
  effectiveDate: z
    .string({ error: "Effective date is required" })
    .date("Must be a valid date"),
  headContractReference: z.string().min(1, "Head contract reference is required"),
  scopeOfWorks: z
    .string()
    .min(10, "Scope of works must be at least 10 characters"),
  paymentAmount: z
    .number({ error: "Payment amount is required" })
    .positive("Amount must be greater than zero"),
  paymentType: z.enum(["fixed", "measured", "cost-plus"]),
  paymentTermsDays: z.number().int().min(1).max(120),
  completionDate: z
    .string({ error: "Completion date is required" })
    .date("Must be a valid date"),
  defectsLiabilityPeriodMonths: z.number().int().min(1).max(60),
  insuranceRequired: z.boolean(),
  terminationNoticeDays: z.number().int().min(1).max(180),
  includeKestrelClause: z.boolean(),
});

export type SubcontractorInput = z.infer<typeof subcontractorSchema>;

// ── Contract Type Registry ───────────────────────────────────────────────────

export const CONTRACT_TYPES = {
  freelancer: {
    slug: "freelancer",
    title: "Freelancer Service Agreement",
    shortTitle: "Freelancer Agreement",
    description:
      "For hiring freelancers or independent contractors. Covers scope, payment, IP ownership, confidentiality, and termination.",
    schema: freelancerSchema,
    toolContext: "agreement",
  },
  nda: {
    slug: "nda",
    title: "Non-Disclosure Agreement (Mutual)",
    shortTitle: "Mutual NDA",
    description:
      "Mutual confidentiality agreement protecting both parties' sensitive business information.",
    schema: ndaSchema,
    toolContext: "agreement",
  },
  "general-service": {
    slug: "general-service",
    title: "General Service Contract",
    shortTitle: "Service Contract",
    description:
      "Standard service agreement suitable for most business-to-business service arrangements.",
    schema: generalServiceSchema,
    toolContext: "contract",
  },
  consulting: {
    slug: "consulting",
    title: "Consulting Engagement Letter",
    shortTitle: "Consulting Letter",
    description:
      "Engagement letter for consulting arrangements. Day rate, scope, deliverables, and IP ownership.",
    schema: consultingSchema,
    toolContext: "engagement",
  },
  saas: {
    slug: "saas",
    title: "SaaS Subscription Agreement",
    shortTitle: "SaaS Agreement",
    description:
      "Software-as-a-Service subscription terms covering access, data, uptime, support, and billing.",
    schema: saasSchema,
    toolContext: "agreement",
  },
  subcontractor: {
    slug: "subcontractor",
    title: "Subcontractor Agreement",
    shortTitle: "Subcontractor Agreement",
    description:
      "Agreement for engaging subcontractors under a head contract. Covers scope, payment, completion, and defects liability.",
    schema: subcontractorSchema,
    toolContext: "agreement",
  },
} as const;

export type ContractType = keyof typeof CONTRACT_TYPES;

export function isValidContractType(type: string): type is ContractType {
  return type in CONTRACT_TYPES;
}
