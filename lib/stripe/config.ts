/**
 * Stripe pricing configuration.
 * All price IDs come from environment variables — never hardcoded.
 */

export type PlanId = "free" | "professional" | "business";

export interface PlanConfig {
  id: PlanId;
  name: string;
  description: string;
  features: string[];
  monthlyPriceId?: string;
  annualPriceId?: string;
}

export const plans: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    description: "Professional tools for every business.",
    features: [
      "Late payment calculator",
      "Letter generator",
      "Contract templates",
      "Terms & conditions generator",
      "Handshake agreements",
    ],
  },
  professional: {
    id: "professional",
    name: "Professional",
    description: "Save documents and manage disputes.",
    monthlyPriceId: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY,
    annualPriceId: process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL,
    features: [
      "Everything in Free",
      "Save and manage documents",
      "File disputes",
      "Structured communication",
      "Evidence management",
      "Email notifications",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    description: "For teams managing multiple contracts.",
    monthlyPriceId: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    annualPriceId: process.env.STRIPE_PRICE_BUSINESS_ANNUAL,
    features: [
      "Everything in Professional",
      "Priority dispute handling",
      "Escalation to mediators",
      "Bulk contract generation",
      "API access",
      "Dedicated support",
    ],
  },
};

export const disputeFilingPriceId = process.env.STRIPE_PRICE_DISPUTE_FILING;
