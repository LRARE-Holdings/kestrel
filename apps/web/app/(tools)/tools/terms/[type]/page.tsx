import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BUSINESS_TYPES } from "@/lib/terms/schemas";
import { TermsForm } from "@/components/tools/terms/terms-form";

const VALID_TYPES = BUSINESS_TYPES.map((t) => t.value);

const META: Record<string, { title: string; description: string }> = {
  ecommerce: {
    title: "E-commerce Terms & Conditions — Kestrel",
    description: "Generate terms and conditions for your online shop. Includes Consumer Rights Act 2015 compliance, delivery, returns, and refund policies.",
  },
  saas: {
    title: "SaaS Terms of Service — Kestrel",
    description: "Generate terms of service for your SaaS or digital product. Covers subscriptions, acceptable use, data, SLAs, and cancellation.",
  },
  professional: {
    title: "Professional Services Terms — Kestrel",
    description: "Generate terms and conditions for consultants, agencies, and freelancers. Covers fees, liability, IP, and confidentiality.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const meta = META[type];
  if (!meta) return { title: "Terms & Conditions — Kestrel" };
  return meta;
}

export default async function TermsTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  if (!VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
    notFound();
  }

  const typeInfo = BUSINESS_TYPES.find((t) => t.value === type)!;

  return (
    <TermsForm
      businessType={type as typeof VALID_TYPES[number]}
      businessTypeLabel={typeInfo.label}
    />
  );
}
