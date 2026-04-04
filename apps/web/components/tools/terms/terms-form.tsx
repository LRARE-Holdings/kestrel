"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ecommerceSchema,
  saasSchema,
  professionalSchema,
  type EcommerceInput,
  type SaasInput,
  type ProfessionalInput,
  type BusinessType,
} from "@/lib/terms/schemas";
import { assembleTerms, termsToMarkdown, termsToHtml, type AssembledTerms } from "@/lib/terms/assembler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { SaveDocumentButton } from "@/components/tools/save-document-button";

const SCHEMAS = {
  ecommerce: ecommerceSchema,
  saas: saasSchema,
  professional: professionalSchema,
} as const;

export function TermsForm({
  businessType,
  businessTypeLabel,
}: {
  businessType: BusinessType;
  businessTypeLabel: string;
}) {
  const [terms, setTerms] = useState<AssembledTerms | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const schema = SCHEMAS[businessType];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaults(businessType),
  });

  const includeDisputeClause = watch("includeDisputeClause");

  function onSubmit(data: EcommerceInput | SaasInput | ProfessionalInput) {
    const assembled = assembleTerms(businessType, data);
    setTerms(assembled);
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // noop
    }
  }

  function copyFullText() {
    if (!terms) return;
    const text = terms.sections.map((s) => `${s.number}. ${s.title}\n\n${s.content}`).join("\n\n---\n\n");
    copyText(text, "text");
  }

  function copyMarkdown() {
    if (!terms) return;
    copyText(termsToMarkdown(terms), "markdown");
  }

  function copyHtml() {
    if (!terms) return;
    copyText(termsToHtml(terms), "html");
  }

  // Type-safe error access helper
  const e = errors as Record<string, any>;
  const be = e.business || {};

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8 2xl:px-12">
      <Link
        href="/tools/terms"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-kestrel transition-colors"
      >
        &larr; Terms & Conditions Generator
      </Link>

      <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-8 shadow-sm backdrop-blur-xl sm:p-12">
      <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
        {businessTypeLabel} Terms
      </h1>
      <p className="mt-3 max-w-2xl text-text-secondary leading-relaxed">
        Fill in your business details and preferences. Your terms will be
        generated from our clause library — no AI, fully deterministic.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          {/* Business details */}
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Business name"
                placeholder="e.g. Acme Ltd"
                error={be.businessName?.message}
                {...register("business.businessName")}
              />
              <Input
                label="Trading name (if different)"
                placeholder="e.g. Acme Store"
                {...register("business.tradingName")}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Registered address</label>
                <textarea
                  rows={3}
                  placeholder={"123 High Street\nNewcastle upon Tyne\nNE1 1AA"}
                  className={`w-full rounded-[var(--radius-md)] border bg-surface px-3 py-2 text-sm text-ink placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel ${be.registeredAddress ? "border-error" : "border-border"}`}
                  {...register("business.registeredAddress")}
                />
                {be.registeredAddress && <p className="text-xs text-error">{be.registeredAddress.message}</p>}
              </div>
              <Input
                label="Company number (optional)"
                placeholder="e.g. 12345678"
                {...register("business.companyNumber")}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Business structure</label>
                <select
                  className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel"
                  {...register("business.businessStructure")}
                >
                  <option value="limited_company">Limited Company</option>
                  <option value="sole_trader">Sole Trader</option>
                  <option value="llp">Limited Liability Partnership</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>
              <Input
                label="Website URL"
                type="url"
                placeholder="https://www.example.com"
                {...register("business.websiteUrl")}
              />
              <Input
                label="Contact email"
                type="email"
                placeholder="hello@example.com"
                error={be.contactEmail?.message}
                {...register("business.contactEmail")}
              />
            </CardContent>
          </Card>

          {/* Type-specific fields */}
          <Card>
            <CardHeader>
              <CardTitle>Business-Specific Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {businessType === "ecommerce" && <EcommerceFields register={register} errors={e} watch={watch} />}
              {businessType === "saas" && <SaasFields register={register} errors={e} watch={watch} setValue={setValue} />}
              {businessType === "professional" && <ProfessionalFields register={register} errors={e} />}
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Privacy policy URL (optional)"
                type="url"
                placeholder="https://www.example.com/privacy"
                {...register("privacyPolicyUrl")}
              />
              <p className="text-xs text-text-muted">
                If you have a privacy policy, we will reference it in the data
                protection section. If not, we will include a note recommending
                you create one.
              </p>
            </CardContent>
          </Card>

          {/* Kestrel clause */}
          <Card>
            <CardContent className="flex items-start justify-between gap-4 pt-6">
              <div>
                <p className="text-sm font-medium text-ink">
                  Include Kestrel dispute resolution clause
                </p>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">
                  Adds a clause inviting customers to resolve disputes through
                  Kestrel before pursuing other remedies.
                </p>
              </div>
              <Toggle
                checked={includeDisputeClause as boolean}
                onChange={(e) => setValue("includeDisputeClause", e.target.checked)}
              />
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Generate terms
          </Button>
        </form>

        {/* Preview */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          {terms ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{terms.title}</CardTitle>
                  <span className="rounded-[var(--radius-sm)] bg-kestrel/10 px-2.5 py-1 text-xs font-medium text-kestrel">
                    {terms.sections.length} sections
                  </span>
                </div>
                <p className="text-sm text-text-secondary">{terms.businessName}</p>
              </CardHeader>
              <CardContent>
                <div className="max-h-[600px] overflow-auto space-y-4">
                  {terms.sections.map((section) => (
                    <div key={section.number}>
                      <h4 className="text-sm font-semibold text-ink">
                        {section.number}. {section.title}
                      </h4>
                      <pre className="mt-1 whitespace-pre-wrap font-body text-xs leading-relaxed text-text-secondary">
                        {section.content}
                      </pre>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button onClick={copyFullText} size="sm">
                    {copied === "text" ? "Copied!" : "Copy text"}
                  </Button>
                  <Button onClick={copyMarkdown} size="sm" variant="secondary">
                    {copied === "markdown" ? "Copied!" : "Copy Markdown"}
                  </Button>
                  <Button onClick={copyHtml} size="sm" variant="secondary">
                    {copied === "html" ? "Copied!" : "Copy HTML"}
                  </Button>
                  <SaveDocumentButton
                    documentType="terms_and_conditions"
                    title={`Terms & Conditions — ${watch("business.businessName") || "Unknown"}`}
                    configuration={watch() as Record<string, unknown>}
                    includesDisputeClause={includeDisputeClause as boolean}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex min-h-[400px] items-center justify-center">
              <CardContent className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                    <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
                <p className="text-sm text-text-muted">
                  Fill in the form and your terms will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <p className="mt-12 text-xs leading-relaxed text-text-muted">
        These terms are generated from pre-written clauses and do not constitute
        legal advice. They are a starting point and should be reviewed by a
        qualified solicitor before use. Relevant legislation includes the
        Consumer Rights Act 2015, the Consumer Contracts Regulations 2013, and
        the UK GDPR.
      </p>
      </div>
    </div>
  );
}

// ── Type-specific field components ──────────────────────────────────────────

function EcommerceFields({ register, errors, watch }: any) {
  const returnsPolicy = watch("returnsPolicy");
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Products</label>
        <select className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel" {...register("productType")}>
          <option value="physical">Physical goods</option>
          <option value="digital">Digital products</option>
          <option value="both">Both physical and digital</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Delivery scope</label>
        <select className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel" {...register("deliveryScope")}>
          <option value="uk_only">UK only</option>
          <option value="uk_international">UK + International</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Returns policy</label>
        <select className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel" {...register("returnsPolicy")}>
          <option value="statutory">Statutory only (14 days)</option>
          <option value="extended">Extended returns window</option>
        </select>
      </div>
      {returnsPolicy === "extended" && (
        <Input label="Extended returns period (days)" type="number" min="15" placeholder="30" {...register("extendedReturnsDays", { valueAsNumber: true })} />
      )}
      <div className="flex items-center gap-3">
        <input type="checkbox" id="vat" className="accent-kestrel" {...register("pricesIncludeVat")} />
        <label htmlFor="vat" className="text-sm text-ink">Prices include VAT</label>
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="age" className="accent-kestrel" {...register("ageRestrictions")} />
        <label htmlFor="age" className="text-sm text-ink">Age-restricted products</label>
      </div>
    </>
  );
}

function SaasFields({ register, errors, watch, setValue }: any) {
  return (
    <>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="free-tier" className="accent-kestrel" {...register("hasFreeTier")} />
        <label htmlFor="free-tier" className="text-sm text-ink">Free tier available</label>
      </div>
      <Input label="Trial period (days, 0 for none)" type="number" min="0" placeholder="14" {...register("trialPeriodDays", { valueAsNumber: true })} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Billing cycle</label>
        <select className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel" {...register("billingCycle")}>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
          <option value="both">Monthly and Annual</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="auto-renew" className="accent-kestrel" {...register("autoRenewal")} />
        <label htmlFor="auto-renew" className="text-sm text-ink">Auto-renewal</label>
      </div>
      <Input label="Data hosting location" placeholder="e.g. United Kingdom" {...register("dataHostingLocation")} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Uptime commitment</label>
        <select className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel" {...register("uptimeCommitment")}>
          <option value="none">No commitment</option>
          <option value="99">99%</option>
          <option value="99.9">99.9%</option>
          <option value="99.99">99.99%</option>
        </select>
      </div>
    </>
  );
}

function ProfessionalFields({ register, errors }: any) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Service description</label>
        <textarea
          rows={3}
          placeholder="Brief description of the services you provide"
          className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel"
          {...register("serviceDescription")}
        />
      </div>
      <Input label="Payment terms (days)" type="number" min="0" placeholder="30" {...register("paymentTermsDays", { valueAsNumber: true })} />
      <Input label="Liability cap (multiple of fees)" type="number" min="1" max="10" placeholder="2" {...register("liabilityCapMultiple", { valueAsNumber: true })} />
      <div className="flex items-center gap-3">
        <input type="checkbox" id="confidentiality" className="accent-kestrel" {...register("confidentiality")} />
        <label htmlFor="confidentiality" className="text-sm text-ink">Include confidentiality clause</label>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">IP ownership</label>
        <select className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel" {...register("ipOwnership")}>
          <option value="client">Client owns all IP</option>
          <option value="provider">Provider retains IP (licence to client)</option>
          <option value="shared">Jointly owned</option>
        </select>
      </div>
    </>
  );
}

// ── Default values ──────────────────────────────────────────────────────────

function getDefaults(type: BusinessType) {
  const base = {
    business: {
      businessName: "",
      tradingName: "",
      registeredAddress: "",
      companyNumber: "",
      businessStructure: "limited_company" as const,
      websiteUrl: "",
      contactEmail: "",
    },
    privacyPolicyUrl: "",
    includeDisputeClause: true,
  };

  switch (type) {
    case "ecommerce":
      return {
        ...base,
        productType: "physical" as const,
        deliveryScope: "uk_only" as const,
        returnsPolicy: "statutory" as const,
        extendedReturnsDays: 30,
        pricesIncludeVat: true,
        ageRestrictions: false,
        ageRestrictionDetails: "",
      };
    case "saas":
      return {
        ...base,
        hasFreeTier: false,
        trialPeriodDays: 14,
        billingCycle: "monthly" as const,
        autoRenewal: true,
        dataHostingLocation: "",
        uptimeCommitment: "99" as const,
      };
    case "professional":
      return {
        ...base,
        serviceDescription: "",
        paymentTermsDays: 30,
        liabilityCapMultiple: 2,
        confidentiality: true,
        ipOwnership: "client" as const,
      };
  }
}
