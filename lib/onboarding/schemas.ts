import { z } from "zod/v4";

// ── Step 1: Profile ─────────────────────────────────────────────────────────

export const step1Schema = z.object({
  display_name: z.string().min(1, "Display name is required"),
});

export type Step1Input = z.infer<typeof step1Schema>;

// ── Step 2: Business Details ────────────────────────────────────────────────

export const step2Schema = z.object({
  business_name: z.string().optional(),
  business_type: z
    .enum(["sole_trader", "limited_company", "partnership", "llp", "charity", "other"])
    .optional(),
  company_size: z
    .enum(["solo", "2-10", "11-50", "51-200", "200+"])
    .optional(),
  industry: z
    .enum([
      "construction",
      "consulting",
      "retail",
      "tech",
      "creative",
      "legal",
      "professional_services",
      "manufacturing",
      "other",
    ])
    .optional(),
});

export type Step2Input = z.infer<typeof step2Schema>;

// ── Step 3: Usage ───────────────────────────────────────────────────────────

export const step3Schema = z.object({
  primary_use_case: z
    .enum(["contracts", "disputes", "late_payments", "general"])
    .optional(),
  estimated_disputes_per_year: z
    .enum(["0", "1-5", "6-20", "20+"])
    .optional(),
});

export type Step3Input = z.infer<typeof step3Schema>;

// ── Step 4: Referral ────────────────────────────────────────────────────────

export const step4Schema = z.object({
  referral_source: z
    .enum([
      "search_engine",
      "social_media",
      "word_of_mouth",
      "event_conference",
      "news_press",
      "other",
    ])
    .optional(),
  referral_code: z.string().optional(),
});

export type Step4Input = z.infer<typeof step4Schema>;

// ── Combined Schema ─────────────────────────────────────────────────────────

export const onboardingSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema);

export type OnboardingInput = z.infer<typeof onboardingSchema>;
