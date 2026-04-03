import { z } from "zod/v4";

export const BUSINESS_TYPES = [
  { value: "ecommerce", label: "E-commerce", description: "Online shops selling physical or digital goods" },
  { value: "saas", label: "SaaS / Digital Services", description: "Software, apps, and digital service providers" },
  { value: "professional", label: "Professional Services", description: "Consultants, agencies, and freelancers" },
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number]["value"];

const businessDetailsSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  tradingName: z.string().optional(),
  registeredAddress: z.string().min(1, "Registered address is required"),
  companyNumber: z.string().optional(),
  businessStructure: z.enum(["sole_trader", "limited_company", "llp", "partnership"]),
  websiteUrl: z.string().optional(),
  contactEmail: z.string().email("Must be a valid email address"),
});

// ── E-commerce ──────────────────────────────────────────────────────────────

export const ecommerceSchema = z.object({
  business: businessDetailsSchema,
  productType: z.enum(["physical", "digital", "both"]),
  deliveryScope: z.enum(["uk_only", "uk_international"]),
  returnsPolicy: z.enum(["statutory", "extended"]),
  extendedReturnsDays: z.number().int().positive().optional(),
  pricesIncludeVat: z.boolean(),
  ageRestrictions: z.boolean(),
  ageRestrictionDetails: z.string().optional(),
  privacyPolicyUrl: z.string().optional(),
  includeDisputeClause: z.boolean(),
});

export type EcommerceInput = z.infer<typeof ecommerceSchema>;

// ── SaaS ────────────────────────────────────────────────────────────────────

export const saasSchema = z.object({
  business: businessDetailsSchema,
  hasFreeTier: z.boolean(),
  trialPeriodDays: z.number().int().min(0).optional(),
  billingCycle: z.enum(["monthly", "annual", "both"]),
  autoRenewal: z.boolean(),
  dataHostingLocation: z.string().optional(),
  uptimeCommitment: z.enum(["none", "99", "99.9", "99.99"]),
  privacyPolicyUrl: z.string().optional(),
  includeDisputeClause: z.boolean(),
});

export type SaasInput = z.infer<typeof saasSchema>;

// ── Professional Services ───────────────────────────────────────────────────

export const professionalSchema = z.object({
  business: businessDetailsSchema,
  serviceDescription: z.string().min(1, "Service description is required"),
  paymentTermsDays: z.number().int().min(0),
  liabilityCapMultiple: z.number().int().min(1).max(10),
  confidentiality: z.boolean(),
  ipOwnership: z.enum(["client", "provider", "shared"]),
  privacyPolicyUrl: z.string().optional(),
  includeDisputeClause: z.boolean(),
});

export type ProfessionalInput = z.infer<typeof professionalSchema>;
