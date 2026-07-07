"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useForm,
  type FieldValues,
  type UseFormRegister,
  type UseFormWatch,
  type UseFormSetValue,
} from "react-hook-form";
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
import {
  assembleTerms,
  termsToMarkdown,
  termsToHtml,
  type AssembledTerms,
} from "@/lib/terms/assembler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { SaveDocumentButton } from "@/components/tools/save-document-button";
import { generateTermsPdf, downloadPdf } from "@/lib/pdf/generate";
import { DownloadPdfButton } from "@/components/tools/download-pdf-button";
import {
  FormWizard,
  DraftRestoredNotice,
  FieldHint,
  useWizardStep,
  type WizardStep,
} from "@/components/tools/form-wizard";
import { useFormDraft } from "@/components/tools/use-form-draft";

const SCHEMAS = {
  ecommerce: ecommerceSchema,
  saas: saasSchema,
  professional: professionalSchema,
} as const;

// Fields validated before leaving the "Business details" step.
const BUSINESS_FIELDS = [
  "business.businessName",
  "business.tradingName",
  "business.registeredAddress",
  "business.companyNumber",
  "business.businessStructure",
  "business.websiteUrl",
  "business.contactEmail",
];

// Fields validated before leaving the "Options" step, per business type.
const OPTION_FIELDS: Record<BusinessType, string[]> = {
  ecommerce: [
    "productType",
    "deliveryScope",
    "returnsPolicy",
    "extendedReturnsDays",
  ],
  saas: ["trialPeriodDays", "billingCycle", "uptimeCommitment"],
  professional: [
    "serviceDescription",
    "paymentTermsDays",
    "liabilityCapMultiple",
    "ipOwnership",
  ],
};

interface FieldsProps {
  register: UseFormRegister<FieldValues>;
  watch: UseFormWatch<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  getError: (path: string) => string | undefined;
}

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
  const defaultValues = getDefaults(businessType);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FieldValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  const draft = useFormDraft({
    tool: `terms-${businessType}`,
    watch,
    reset,
    defaultValues,
    enabled: !terms,
  });

  const includeDisputeClause = watch("includeDisputeClause") as boolean;

  // Nested-safe error accessor.
  function getError(path: string): string | undefined {
    const parts = path.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = errors;
    for (const part of parts) {
      if (!current) return undefined;
      current = current[part];
    }
    return current?.message as string | undefined;
  }

  function onGenerate(data: FieldValues) {
    const assembled = assembleTerms(
      businessType,
      data as EcommerceInput | SaasInput | ProfessionalInput,
    );
    setTerms(assembled);
    draft.clear();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function editAnswers() {
    setTerms(null);
  }

  function startAnother() {
    reset(defaultValues);
    setTerms(null);
    draft.startAfresh();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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

  function downloadAsPdf() {
    if (!terms) return;
    const pdf = generateTermsPdf(terms);
    const slug =
      terms.businessName.toLowerCase().replace(/\s+/g, "-") || "terms";
    downloadPdf(pdf, `${slug}-terms.pdf`);
  }

  function copyFullText() {
    if (!terms) return;
    const text = terms.sections
      .map((s) => `${s.number}. ${s.title}\n\n${s.content}`)
      .join("\n\n---\n\n");
    copyText(text, "text");
  }

  const steps: WizardStep[] = [
    {
      id: "business",
      label: "Business",
      fields: BUSINESS_FIELDS,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Business details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Business name"
              placeholder="e.g. Acme Ltd"
              error={getError("business.businessName")}
              {...register("business.businessName")}
            />
            <Input
              label="Trading name (if different)"
              placeholder="e.g. Acme Store"
              error={getError("business.tradingName")}
              {...register("business.tradingName")}
            />
            <Textarea
              label="Registered address"
              rows={3}
              placeholder={"123 High Street\nNewcastle upon Tyne\nNE1 1AA"}
              error={getError("business.registeredAddress")}
              {...register("business.registeredAddress")}
            />
            <Input
              label="Company number (optional)"
              placeholder="e.g. 12345678"
              error={getError("business.companyNumber")}
              {...register("business.companyNumber")}
            />
            <Select
              label="Business structure"
              error={getError("business.businessStructure")}
              {...register("business.businessStructure")}
            >
              <option value="limited_company">Limited Company</option>
              <option value="sole_trader">Sole Trader</option>
              <option value="llp">Limited Liability Partnership</option>
              <option value="partnership">Partnership</option>
            </Select>
            <Input
              label="Website URL"
              type="url"
              placeholder="https://www.example.com"
              error={getError("business.websiteUrl")}
              {...register("business.websiteUrl")}
            />
            <Input
              label="Contact email"
              type="email"
              placeholder="hello@example.com"
              error={getError("business.contactEmail")}
              {...register("business.contactEmail")}
            />
          </CardContent>
        </Card>
      ),
    },
    {
      id: "options",
      label: "Your terms",
      fields: OPTION_FIELDS[businessType],
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Business-specific options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {businessType === "ecommerce" && (
              <EcommerceFields
                register={register}
                watch={watch}
                setValue={setValue}
                getError={getError}
              />
            )}
            {businessType === "saas" && (
              <SaasFields
                register={register}
                watch={watch}
                setValue={setValue}
                getError={getError}
              />
            )}
            {businessType === "professional" && (
              <ProfessionalFields
                register={register}
                watch={watch}
                setValue={setValue}
                getError={getError}
              />
            )}
          </CardContent>
        </Card>
      ),
    },
    {
      id: "data-protection",
      label: "Data",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Data protection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Privacy policy URL (optional)"
              type="url"
              placeholder="https://www.example.com/privacy"
              error={getError("privacyPolicyUrl")}
              {...register("privacyPolicyUrl")}
            />
            <FieldHint>
              If you have a privacy policy, we will reference it in the data
              protection section. If not, we will include a note recommending
              you create one.
            </FieldHint>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "clause",
      label: "Clause",
      content: (
        <Card>
          <CardContent className="flex items-start justify-between gap-4 pt-6">
            <div>
              <p className="text-sm font-medium text-ink">
                Include Kestrel dispute resolution clause
              </p>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                Adds a clause inviting customers to resolve disputes through
                Kestrel before pursuing other remedies. Recommended and can be
                removed with one click.
              </p>
            </div>
            <Toggle
              checked={includeDisputeClause}
              onChange={(e) =>
                setValue("includeDisputeClause", e.target.checked)
              }
            />
          </CardContent>
        </Card>
      ),
    },
    {
      id: "review",
      label: "Review",
      content: (
        <TermsReviewStep
          watch={watch}
          businessTypeLabel={businessTypeLabel}
          includeDisputeClause={includeDisputeClause}
        />
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8 2xl:px-12">
      <Link
        href="/tools/terms"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-kestrel"
      >
        &larr; Terms &amp; Conditions Generator
      </Link>

      <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-8 shadow-sm backdrop-blur-xl sm:p-12">
        <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
          {businessTypeLabel} Terms
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-text-secondary">
          Fill in your business details and preferences. Your terms will be
          generated from our clause library — no AI, fully deterministic.
        </p>

        <div className="mx-auto mt-8 max-w-2xl">
          {terms ? (
            <TermsResult
              terms={terms}
              copied={copied}
              includeDisputeClause={includeDisputeClause}
              onCopyText={copyFullText}
              onCopyMarkdown={() => copyText(termsToMarkdown(terms), "markdown")}
              onCopyHtml={() => copyText(termsToHtml(terms), "html")}
              onDownload={downloadAsPdf}
              onEdit={editAnswers}
              onStartAnother={startAnother}
              businessName={
                (watch("business.businessName") as string) || "Unknown"
              }
              configuration={watch() as Record<string, unknown>}
            />
          ) : (
            <FormWizard
              steps={steps}
              validate={(fields) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                trigger(fields as any, { shouldFocus: true })
              }
              onSubmit={() => handleSubmit(onGenerate)()}
              submitLabel="Generate terms"
              header={
                draft.restored ? (
                  <DraftRestoredNotice
                    onStartAfresh={draft.startAfresh}
                    onDismiss={draft.dismissRestoredNotice}
                  />
                ) : null
              }
            />
          )}
        </div>

        <p className="mt-12 text-xs leading-relaxed text-text-muted">
          These terms are generated from pre-written clauses and do not
          constitute legal advice. They are a starting point and should be
          reviewed by a qualified solicitor before use. Relevant legislation
          includes the Consumer Rights Act 2015, the Consumer Contracts
          Regulations 2013, and the UK GDPR.
        </p>
      </div>
    </div>
  );
}

// ── Review step ──────────────────────────────────────────────────────────────

function TermsReviewStep({
  watch,
  businessTypeLabel,
  includeDisputeClause,
}: {
  watch: UseFormWatch<FieldValues>;
  businessTypeLabel: string;
  includeDisputeClause: boolean;
}) {
  const { goToStep } = useWizardStep();
  const business = (watch("business") ?? {}) as Record<string, string>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review &amp; generate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-text-secondary">
          Check the details below, then generate your {businessTypeLabel} terms.
        </p>

        <ReviewGroup title="Business" onEdit={() => goToStep(0)}>
          <ReviewRow label="Name" value={business.businessName} />
          <ReviewRow label="Contact email" value={business.contactEmail} />
          <ReviewRow label="Website" value={business.websiteUrl} />
        </ReviewGroup>

        <ReviewGroup title="Options" onEdit={() => goToStep(1)}>
          <ReviewRow label="Business type" value={businessTypeLabel} />
        </ReviewGroup>

        <ReviewGroup title="Dispute clause" onEdit={() => goToStep(3)}>
          <ReviewRow
            label="Kestrel dispute clause"
            value={includeDisputeClause ? "Included" : "Not included"}
          />
        </ReviewGroup>
      </CardContent>
    </Card>
  );
}

function ReviewGroup({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border-subtle p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
          {title}
        </p>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-medium text-kestrel transition-colors hover:text-kestrel-hover"
        >
          Edit
        </button>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="text-right font-medium text-ink">
        {value && value.length > 0 ? value : "—"}
      </span>
    </div>
  );
}

// ── Generated terms result ───────────────────────────────────────────────────

interface TermsResultProps {
  terms: AssembledTerms;
  copied: string | null;
  includeDisputeClause: boolean;
  onCopyText: () => void;
  onCopyMarkdown: () => void;
  onCopyHtml: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onStartAnother: () => void;
  businessName: string;
  configuration: Record<string, unknown>;
}

function TermsResult({
  terms,
  copied,
  includeDisputeClause,
  onCopyText,
  onCopyMarkdown,
  onCopyHtml,
  onDownload,
  onEdit,
  onStartAnother,
  businessName,
  configuration,
}: TermsResultProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage/20">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-kestrel"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="text-sm font-medium text-ink">Your terms are ready.</p>
      </div>

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
          <div className="max-h-[600px] space-y-4 overflow-auto">
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
            <Button onClick={onCopyText} size="sm">
              {copied === "text" ? "Copied!" : "Copy text"}
            </Button>
            <Button onClick={onCopyMarkdown} size="sm" variant="secondary">
              {copied === "markdown" ? "Copied!" : "Copy Markdown"}
            </Button>
            <Button onClick={onCopyHtml} size="sm" variant="secondary">
              {copied === "html" ? "Copied!" : "Copy HTML"}
            </Button>
            <DownloadPdfButton onClick={onDownload} />
            <SaveDocumentButton
              documentType="terms_and_conditions"
              title={`Terms & Conditions — ${businessName}`}
              configuration={configuration}
              includesDisputeClause={includeDisputeClause}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" size="md" onClick={onEdit}>
          Edit answers
        </Button>
        <Button variant="ghost" size="md" onClick={onStartAnother}>
          Start another
        </Button>
      </div>
    </div>
  );
}

// ── Type-specific field components ──────────────────────────────────────────

function EcommerceFields({ register, watch, setValue, getError }: FieldsProps) {
  const returnsPolicy = watch("returnsPolicy");
  const pricesIncludeVat = watch("pricesIncludeVat") as boolean;
  const ageRestrictions = watch("ageRestrictions") as boolean;

  return (
    <>
      <Select
        label="Products"
        error={getError("productType")}
        {...register("productType")}
      >
        <option value="physical">Physical goods</option>
        <option value="digital">Digital products</option>
        <option value="both">Both physical and digital</option>
      </Select>

      <Select
        label="Delivery scope"
        error={getError("deliveryScope")}
        {...register("deliveryScope")}
      >
        <option value="uk_only">UK only</option>
        <option value="uk_international">UK + International</option>
      </Select>

      <Select
        label="Returns policy"
        error={getError("returnsPolicy")}
        {...register("returnsPolicy")}
      >
        <option value="statutory">Statutory only (14 days)</option>
        <option value="extended">Extended returns window</option>
      </Select>
      <FieldHint>
        &ldquo;Statutory&rdquo; is the 14-day right to cancel most online orders
        under the Consumer Contracts Regulations 2013. Choose extended to offer
        longer.
      </FieldHint>

      {returnsPolicy === "extended" && (
        <Input
          label="Extended returns period (days)"
          type="number"
          min="15"
          placeholder="30"
          error={getError("extendedReturnsDays")}
          {...register("extendedReturnsDays", { valueAsNumber: true })}
        />
      )}

      <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-border-subtle p-3">
        <div>
          <p className="text-sm font-medium text-ink">Prices include VAT</p>
          <p className="mt-0.5 text-xs text-text-muted">
            Displayed prices are inclusive of VAT.
          </p>
        </div>
        <Toggle
          checked={pricesIncludeVat}
          onChange={(e) => setValue("pricesIncludeVat", e.target.checked)}
        />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-border-subtle p-3">
        <div>
          <p className="text-sm font-medium text-ink">
            Age-restricted products
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            You sell items with a minimum age requirement.
          </p>
        </div>
        <Toggle
          checked={ageRestrictions}
          onChange={(e) => setValue("ageRestrictions", e.target.checked)}
        />
      </div>
    </>
  );
}

function SaasFields({ register, watch, setValue, getError }: FieldsProps) {
  const hasFreeTier = watch("hasFreeTier") as boolean;
  const autoRenewal = watch("autoRenewal") as boolean;

  return (
    <>
      <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-border-subtle p-3">
        <div>
          <p className="text-sm font-medium text-ink">Free tier available</p>
          <p className="mt-0.5 text-xs text-text-muted">
            You offer a permanently free plan.
          </p>
        </div>
        <Toggle
          checked={hasFreeTier}
          onChange={(e) => setValue("hasFreeTier", e.target.checked)}
        />
      </div>

      <Input
        label="Trial period (days, 0 for none)"
        type="number"
        min="0"
        placeholder="14"
        error={getError("trialPeriodDays")}
        {...register("trialPeriodDays", { valueAsNumber: true })}
      />

      <Select
        label="Billing cycle"
        error={getError("billingCycle")}
        {...register("billingCycle")}
      >
        <option value="monthly">Monthly</option>
        <option value="annual">Annual</option>
        <option value="both">Monthly and Annual</option>
      </Select>

      <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-border-subtle p-3">
        <div>
          <p className="text-sm font-medium text-ink">Auto-renewal</p>
          <p className="mt-0.5 text-xs text-text-muted">
            Subscriptions renew automatically unless cancelled.
          </p>
        </div>
        <Toggle
          checked={autoRenewal}
          onChange={(e) => setValue("autoRenewal", e.target.checked)}
        />
      </div>

      <Input
        label="Data hosting location"
        placeholder="e.g. United Kingdom"
        error={getError("dataHostingLocation")}
        {...register("dataHostingLocation")}
      />

      <Select
        label="Uptime commitment"
        error={getError("uptimeCommitment")}
        {...register("uptimeCommitment")}
      >
        <option value="none">No commitment</option>
        <option value="99">99%</option>
        <option value="99.9">99.9%</option>
        <option value="99.99">99.99%</option>
      </Select>
      <FieldHint>
        The percentage of time you commit the service will be available to
        customers.
      </FieldHint>
    </>
  );
}

function ProfessionalFields({ register, watch, setValue, getError }: FieldsProps) {
  const confidentiality = watch("confidentiality") as boolean;

  return (
    <>
      <Textarea
        label="Service description"
        rows={3}
        placeholder="Brief description of the services you provide"
        error={getError("serviceDescription")}
        {...register("serviceDescription")}
      />

      <Input
        label="Payment terms (days)"
        type="number"
        min="0"
        placeholder="30"
        error={getError("paymentTermsDays")}
        {...register("paymentTermsDays", { valueAsNumber: true })}
      />
      <FieldHint>
        How long your clients have to pay each invoice after receiving it.
      </FieldHint>

      <Input
        label="Liability cap (multiple of fees)"
        type="number"
        min="1"
        max="10"
        placeholder="2"
        error={getError("liabilityCapMultiple")}
        {...register("liabilityCapMultiple", { valueAsNumber: true })}
      />
      <FieldHint>
        Limits what you can be required to pay a client if something goes wrong,
        as a multiple of the fees they have paid you.
      </FieldHint>

      <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-border-subtle p-3">
        <div>
          <p className="text-sm font-medium text-ink">
            Include confidentiality clause
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            Both sides keep each other&rsquo;s information confidential.
          </p>
        </div>
        <Toggle
          checked={confidentiality}
          onChange={(e) => setValue("confidentiality", e.target.checked)}
        />
      </div>

      <Select
        label="IP ownership"
        error={getError("ipOwnership")}
        {...register("ipOwnership")}
      >
        <option value="client">Client owns all IP</option>
        <option value="provider">Provider retains IP (licence to client)</option>
        <option value="shared">Jointly owned</option>
      </Select>
      <FieldHint>
        Who owns the work you create (documents, designs, code) once the client
        has paid.
      </FieldHint>
    </>
  );
}

// ── Default values ──────────────────────────────────────────────────────────

function getDefaults(type: BusinessType): FieldValues {
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
