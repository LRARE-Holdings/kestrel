"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CONTRACT_TYPES,
  type ContractType,
  type FreelancerInput,
  type NdaInput,
  type GeneralServiceInput,
  type ConsultingInput,
  type SaasInput,
  type SubcontractorInput,
} from "@/lib/contracts/schemas";
import {
  assembleContract,
  renderDocumentToText,
} from "@/lib/contracts/assembler";
import type { AssembledDocument } from "@/lib/clauses/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { SaveDocumentButton } from "@/components/tools/save-document-button";
import { generateContractPdf, downloadPdf } from "@/lib/pdf/generate";
import { DownloadPdfButton } from "@/components/tools/download-pdf-button";
import {
  FormWizard,
  DraftRestoredNotice,
  FieldHint,
  useWizardStep,
  type WizardStep,
} from "@/components/tools/form-wizard";
import { useFormDraft } from "@/components/tools/use-form-draft";

type AnyContractData =
  | FreelancerInput
  | NdaInput
  | GeneralServiceInput
  | ConsultingInput
  | SaasInput
  | SubcontractorInput;

interface ContractFormProps {
  contractType: ContractType;
}

const DEFAULT_PARTY = {
  name: "",
  businessName: "",
  address: "",
  email: "",
  companyNumber: "",
};

// Field paths validated before leaving the "Agreement details" step, per type.
const AGREEMENT_FIELDS: Record<ContractType, string[]> = {
  freelancer: [
    "effectiveDate",
    "serviceDescription",
    "deliverables",
    "paymentType",
    "paymentAmount",
    "paymentTermsDays",
    "ipOwnership",
    "confidentialityDurationMonths",
    "terminationNoticeDays",
  ],
  nda: [
    "effectiveDate",
    "confidentialInfoDescription",
    "obligations",
    "durationMonths",
    "exceptions",
  ],
  "general-service": [
    "effectiveDate",
    "serviceDescription",
    "serviceDuration",
    "paymentAmount",
    "paymentFrequency",
    "paymentTermsDays",
    "terminationNoticeDays",
    "liabilityCap",
  ],
  consulting: [
    "effectiveDate",
    "engagementScope",
    "deliverables",
    "dayRate",
    "estimatedDays",
    "paymentTermsDays",
    "ipOwnership",
    "terminationNoticeDays",
  ],
  saas: [
    "effectiveDate",
    "serviceDescription",
    "subscriptionTerm",
    "subscriptionFee",
    "paymentTermsDays",
    "uptimeCommitment",
    "supportLevel",
    "terminationNoticeDays",
  ],
  subcontractor: [
    "effectiveDate",
    "headContractReference",
    "scopeOfWorks",
    "paymentAmount",
    "paymentType",
    "paymentTermsDays",
    "completionDate",
    "defectsLiabilityPeriodMonths",
    "terminationNoticeDays",
  ],
};

function getDefaultValues(type: ContractType): Record<string, unknown> {
  const base = {
    partyA: { ...DEFAULT_PARTY },
    partyB: { ...DEFAULT_PARTY },
    effectiveDate: "",
    includeKestrelClause: true,
  };

  switch (type) {
    case "freelancer":
      return {
        ...base,
        serviceDescription: "",
        deliverables: [""],
        paymentType: "fixed",
        paymentAmount: undefined,
        paymentTermsDays: 30,
        ipOwnership: "client",
        confidentiality: true,
        confidentialityDurationMonths: 24,
        terminationNoticeDays: 14,
      };
    case "nda":
      return {
        ...base,
        confidentialInfoDescription: "",
        obligations: "",
        durationMonths: 24,
        exceptions: "",
      };
    case "general-service":
      return {
        ...base,
        serviceDescription: "",
        serviceDuration: "",
        paymentAmount: undefined,
        paymentFrequency: "monthly",
        paymentTermsDays: 30,
        terminationNoticeDays: 30,
        liabilityCap: "",
      };
    case "consulting":
      return {
        ...base,
        engagementScope: "",
        deliverables: [""],
        dayRate: undefined,
        estimatedDays: undefined,
        paymentTermsDays: 30,
        ipOwnership: "client",
        confidentiality: true,
        terminationNoticeDays: 14,
      };
    case "saas":
      return {
        ...base,
        serviceDescription: "",
        subscriptionTerm: "monthly",
        subscriptionFee: undefined,
        paymentTermsDays: 30,
        dataProcessing: true,
        uptimeCommitment: "99.9%",
        supportLevel: "standard",
        terminationNoticeDays: 30,
      };
    case "subcontractor":
      return {
        ...base,
        headContractReference: "",
        scopeOfWorks: "",
        paymentAmount: undefined,
        paymentType: "fixed",
        paymentTermsDays: 30,
        completionDate: "",
        defectsLiabilityPeriodMonths: 12,
        insuranceRequired: true,
        terminationNoticeDays: 14,
      };
  }
}

export function ContractForm({ contractType }: ContractFormProps) {
  const config = CONTRACT_TYPES[contractType];
  const [document, setDocument] = useState<AssembledDocument | null>(null);
  const [copied, setCopied] = useState(false);

  const defaultValues = getDefaultValues(contractType);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    trigger,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<any>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(config.schema) as any,
    defaultValues,
  });

  const draft = useFormDraft({
    tool: `contract-${contractType}`,
    watch,
    reset,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: defaultValues as any,
    enabled: !document,
  });

  const includeKestrelClause = watch("includeKestrelClause") as boolean;

  // Field arrays for deliverables (freelancer and consulting)
  const hasDeliverables =
    contractType === "freelancer" || contractType === "consulting";
  const fieldArray = useFieldArray({
    control,
    name: "deliverables",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onGenerate(data: any) {
    const assembled = assembleContract(contractType, data as AnyContractData);
    setDocument(assembled);
    draft.clear();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function editAnswers() {
    setDocument(null);
  }

  function startAnother() {
    reset(defaultValues);
    setDocument(null);
    draft.startAfresh();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function downloadAsPdf() {
    if (!document) return;
    const pdf = generateContractPdf(document);
    const slug = document.title.toLowerCase().replace(/\s+/g, "-");
    downloadPdf(pdf, `${slug}.pdf`);
  }

  async function copyToClipboard() {
    if (!document) return;
    const text = renderDocumentToText(document);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = window.document.createElement("textarea");
      textArea.value = text;
      window.document.body.appendChild(textArea);
      textArea.select();
      window.document.execCommand("copy");
      window.document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // Helper to access nested errors safely
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

  const steps: WizardStep[] = [
    {
      id: "your-details",
      label: "Your details",
      fields: [
        "partyA.name",
        "partyA.businessName",
        "partyA.address",
        "partyA.email",
        "partyA.companyNumber",
      ],
      content: (
        <PartyFields
          prefix="partyA"
          title="Your details (Party A)"
          intro="The business issuing this agreement."
          register={register}
          getError={getError}
          namePlaceholder="e.g. Jane Smith"
          businessPlaceholder="e.g. Smith Consulting Ltd"
          addressPlaceholder={"123 High Street\nNewcastle upon Tyne\nNE1 1AA"}
          emailPlaceholder="jane@smithconsulting.co.uk"
        />
      ),
    },
    {
      id: "other-party",
      label: "Other party",
      fields: [
        "partyB.name",
        "partyB.businessName",
        "partyB.address",
        "partyB.email",
        "partyB.companyNumber",
      ],
      content: (
        <PartyFields
          prefix="partyB"
          title="Other party (Party B)"
          intro="The business on the other side of this agreement."
          register={register}
          getError={getError}
          namePlaceholder="e.g. John Doe"
          businessPlaceholder="e.g. Doe Industries Ltd"
          addressPlaceholder={"456 Market Street\nLondon\nEC1A 1BB"}
          emailPlaceholder="john@doeindustries.co.uk"
        />
      ),
    },
    {
      id: "agreement",
      label: "Agreement",
      fields: AGREEMENT_FIELDS[contractType],
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Agreement details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Effective date"
              type="date"
              error={getError("effectiveDate")}
              {...register("effectiveDate")}
            />
            <FieldHint>The date the agreement takes effect.</FieldHint>

            <TypeSpecificFields
              contractType={contractType}
              register={register}
              watch={watch}
              setValue={setValue}
              getError={getError}
              fieldArray={hasDeliverables ? fieldArray : undefined}
            />
          </CardContent>
        </Card>
      ),
    },
    {
      id: "options",
      label: "Options",
      content: (
        <Card>
          <CardContent className="flex items-start justify-between gap-4 pt-6">
            <div>
              <p className="text-sm font-medium text-ink">
                Include Kestrel dispute resolution clause
              </p>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                Adds a structured dispute resolution clause recommending the
                parties attempt to resolve disputes through Kestrel before
                formal proceedings. This is recommended and can be removed with
                one click.
              </p>
            </div>
            <Toggle
              checked={includeKestrelClause}
              onChange={(e) =>
                setValue("includeKestrelClause", e.target.checked)
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
        <ReviewStep
          contractType={contractType}
          watch={watch}
          includeKestrelClause={includeKestrelClause}
        />
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8 2xl:px-12">
      <Link
        href="/tools/contracts"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-kestrel"
      >
        &larr; Contract Templates
      </Link>

      <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-8 shadow-sm backdrop-blur-xl sm:p-12">
        <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
          {config.title}
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-text-secondary">
          {config.description}
        </p>

        <div className="mx-auto mt-8 max-w-2xl">
          {document ? (
            <ContractResult
              document={document}
              copied={copied}
              onCopy={copyToClipboard}
              onDownload={downloadAsPdf}
              onEdit={editAnswers}
              onStartAnother={startAnother}
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
              submitLabel="Generate contract"
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
          This contract template is provided for informational purposes only and
          does not constitute legal advice. It is intended as a starting point
          for businesses in England and Wales and should be reviewed by a
          qualified legal professional before execution. Kestrel does not accept
          liability for any loss arising from the use of this template.
        </p>
      </div>
    </div>
  );
}

// ── Party fieldset ───────────────────────────────────────────────────────────

interface PartyFieldsProps {
  prefix: "partyA" | "partyB";
  title: string;
  intro: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  getError: (path: string) => string | undefined;
  namePlaceholder: string;
  businessPlaceholder: string;
  addressPlaceholder: string;
  emailPlaceholder: string;
}

function PartyFields({
  prefix,
  title,
  intro,
  register,
  getError,
  namePlaceholder,
  businessPlaceholder,
  addressPlaceholder,
  emailPlaceholder,
}: PartyFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-text-secondary">{intro}</p>
        <Input
          label="Contact name"
          placeholder={namePlaceholder}
          error={getError(`${prefix}.name`)}
          {...register(`${prefix}.name`)}
        />
        <Input
          label="Business name"
          placeholder={businessPlaceholder}
          error={getError(`${prefix}.businessName`)}
          {...register(`${prefix}.businessName`)}
        />
        <Textarea
          label="Business address"
          rows={3}
          placeholder={addressPlaceholder}
          error={getError(`${prefix}.address`)}
          {...register(`${prefix}.address`)}
        />
        <Input
          label="Email address"
          type="email"
          placeholder={emailPlaceholder}
          error={getError(`${prefix}.email`)}
          {...register(`${prefix}.email`)}
        />
        <Input
          label="Company number (optional)"
          placeholder="e.g. 12345678"
          error={getError(`${prefix}.companyNumber`)}
          {...register(`${prefix}.companyNumber`)}
        />
        <FieldHint>
          Your Companies House registration number, if the business is a
          registered company.
        </FieldHint>
      </CardContent>
    </Card>
  );
}

// ── Review step ──────────────────────────────────────────────────────────────

interface ReviewStepProps {
  contractType: ContractType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: any;
  includeKestrelClause: boolean;
}

function ReviewStep({ watch, includeKestrelClause }: ReviewStepProps) {
  const { goToStep } = useWizardStep();
  const partyA = watch("partyA") ?? {};
  const partyB = watch("partyB") ?? {};
  const effectiveDate = watch("effectiveDate");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review &amp; generate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-text-secondary">
          Check the details below, then generate your contract.
        </p>

        <ReviewGroup title="Your details" onEdit={() => goToStep(0)}>
          <ReviewRow label="Contact" value={partyA.name} />
          <ReviewRow label="Business" value={partyA.businessName} />
          <ReviewRow label="Email" value={partyA.email} />
        </ReviewGroup>

        <ReviewGroup title="Other party" onEdit={() => goToStep(1)}>
          <ReviewRow label="Contact" value={partyB.name} />
          <ReviewRow label="Business" value={partyB.businessName} />
          <ReviewRow label="Email" value={partyB.email} />
        </ReviewGroup>

        <ReviewGroup title="Agreement" onEdit={() => goToStep(2)}>
          <ReviewRow label="Effective date" value={effectiveDate} />
        </ReviewGroup>

        <ReviewGroup title="Options" onEdit={() => goToStep(3)}>
          <ReviewRow
            label="Kestrel dispute clause"
            value={includeKestrelClause ? "Included" : "Not included"}
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

// ── Generated contract result ────────────────────────────────────────────────

interface ContractResultProps {
  document: AssembledDocument;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onStartAnother: () => void;
  configuration: Record<string, unknown>;
}

function ContractResult({
  document,
  copied,
  onCopy,
  onDownload,
  onEdit,
  onStartAnother,
  configuration,
}: ContractResultProps) {
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
        <p className="text-sm font-medium text-ink">
          Your contract is ready.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{document.title}</CardTitle>
            {document.includesDisputeClause && (
              <span className="rounded-[var(--radius-sm)] bg-kestrel/10 px-2.5 py-1 text-xs font-medium text-kestrel">
                Kestrel clause
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary">
            Effective date: {document.date}
          </p>
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] overflow-auto">
            <div className="mb-4 rounded-[var(--radius-md)] bg-stone/40 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                Parties
              </p>
              <p className="text-sm text-ink">
                <span className="font-medium">(1)</span>{" "}
                {document.parties.a.businessName}
              </p>
              <p className="mt-1 text-sm text-ink">
                <span className="font-medium">(2)</span>{" "}
                {document.parties.b.businessName}
              </p>
            </div>

            <div className="space-y-4">
              {document.sections.map((section) => (
                <div key={section.number}>
                  <h4 className="text-sm font-semibold text-ink">
                    {section.number}. {section.title}
                  </h4>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                    {section.content}
                  </p>
                  {section.subSections?.map((sub) => (
                    <p
                      key={sub.number}
                      className="ml-4 mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary"
                    >
                      {sub.number} {sub.content}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={onCopy} size="md">
              {copied ? "Copied!" : "Copy to clipboard"}
            </Button>
            <DownloadPdfButton onClick={onDownload} />
            <SaveDocumentButton
              documentType="contract"
              title={document.title}
              configuration={configuration}
              includesDisputeClause={document.includesDisputeClause}
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

// ── Type-specific form fields ────────────────────────────────────────────────

interface TypeFieldsProps {
  contractType: ContractType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: any;
  getError: (path: string) => string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fieldArray?: any;
}

function TypeSpecificFields({
  contractType,
  register,
  watch,
  setValue,
  getError,
  fieldArray,
}: TypeFieldsProps) {
  switch (contractType) {
    case "freelancer":
      return (
        <FreelancerFields
          register={register}
          watch={watch}
          setValue={setValue}
          getError={getError}
          fieldArray={fieldArray}
        />
      );
    case "nda":
      return <NdaFields register={register} getError={getError} />;
    case "general-service":
      return <GeneralServiceFields register={register} getError={getError} />;
    case "consulting":
      return (
        <ConsultingFields
          register={register}
          watch={watch}
          setValue={setValue}
          getError={getError}
          fieldArray={fieldArray}
        />
      );
    case "saas":
      return (
        <SaasFields
          register={register}
          watch={watch}
          setValue={setValue}
          getError={getError}
        />
      );
    case "subcontractor":
      return <SubcontractorFields register={register} getError={getError} />;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FreelancerFields({ register, watch, setValue, getError, fieldArray }: any) {
  const confidentiality = watch("confidentiality") as boolean;
  const fields = fieldArray?.fields ?? [];

  return (
    <>
      <Textarea
        label="Service description"
        placeholder="Describe the services to be provided..."
        error={getError("serviceDescription")}
        {...register("serviceDescription")}
      />

      {/* Deliverables */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Deliverables</label>
        <div className="space-y-2">
          {fields.map((_: unknown, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Deliverable ${index + 1}`}
                error={getError(`deliverables.${index}`)}
                {...register(`deliverables.${index}`)}
              />
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fieldArray.remove(index)}
                  className="shrink-0"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fieldArray.append("")}
          className="mt-1 self-start"
        >
          Add deliverable
        </Button>
      </div>

      <Select
        label="Payment type"
        error={getError("paymentType")}
        {...register("paymentType")}
      >
        <option value="fixed">Fixed fee</option>
        <option value="hourly">Hourly rate</option>
        <option value="milestone">Milestone-based</option>
      </Select>

      <Input
        label="Payment amount (GBP)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="e.g. 5000.00"
        error={getError("paymentAmount")}
        {...register("paymentAmount", { valueAsNumber: true })}
      />

      <Select
        label="Payment terms (days)"
        error={getError("paymentTermsDays")}
        {...register("paymentTermsDays", { valueAsNumber: true })}
      >
        <option value={14}>14 days</option>
        <option value={30}>30 days</option>
        <option value={45}>45 days</option>
        <option value={60}>60 days</option>
      </Select>
      <FieldHint>
        How long the client has to pay each invoice after receiving it.
      </FieldHint>

      <Select
        label="IP ownership"
        error={getError("ipOwnership")}
        {...register("ipOwnership")}
      >
        <option value="client">Client owns all IP</option>
        <option value="freelancer">
          Freelancer retains IP (licence to client)
        </option>
        <option value="joint">Joint ownership</option>
      </Select>
      <FieldHint>
        Who owns the intellectual property (designs, code, written work) created
        under this agreement.
      </FieldHint>

      <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-border-subtle p-3">
        <div>
          <p className="text-sm font-medium text-ink">
            Enhanced confidentiality clause
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            Extended obligations with defined duration
          </p>
        </div>
        <Toggle
          checked={confidentiality}
          onChange={(e) => setValue("confidentiality", e.target.checked)}
        />
      </div>

      {confidentiality && (
        <Input
          label="Confidentiality duration (months)"
          type="number"
          min="1"
          max="120"
          error={getError("confidentialityDurationMonths")}
          {...register("confidentialityDurationMonths", {
            valueAsNumber: true,
          })}
        />
      )}

      <Input
        label="Termination notice period (days)"
        type="number"
        min="1"
        max="180"
        error={getError("terminationNoticeDays")}
        {...register("terminationNoticeDays", { valueAsNumber: true })}
      />
      <FieldHint>
        How much notice either party must give to end the agreement early.
      </FieldHint>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NdaFields({ register, getError }: any) {
  return (
    <>
      <Textarea
        label="Confidential information description"
        placeholder="Describe the categories of confidential information covered by this agreement..."
        error={getError("confidentialInfoDescription")}
        {...register("confidentialInfoDescription")}
      />

      <Textarea
        label="Receiving party obligations"
        placeholder="Describe the specific obligations of the receiving party..."
        error={getError("obligations")}
        {...register("obligations")}
      />

      <Input
        label="Duration (months)"
        type="number"
        min="1"
        max="120"
        placeholder="e.g. 24"
        error={getError("durationMonths")}
        {...register("durationMonths", { valueAsNumber: true })}
      />
      <FieldHint>
        How long the confidentiality obligations last after the agreement
        starts.
      </FieldHint>

      <Textarea
        label="Additional exceptions (optional)"
        placeholder="Any additional exceptions to the confidentiality obligations..."
        error={getError("exceptions")}
        {...register("exceptions")}
      />
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GeneralServiceFields({ register, getError }: any) {
  return (
    <>
      <Textarea
        label="Service description"
        placeholder="Describe the services to be provided..."
        error={getError("serviceDescription")}
        {...register("serviceDescription")}
      />

      <Input
        label="Service duration"
        placeholder="e.g. 12 months, ongoing, or project completion"
        error={getError("serviceDuration")}
        {...register("serviceDuration")}
      />

      <Input
        label="Payment amount (GBP)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="e.g. 2000.00"
        error={getError("paymentAmount")}
        {...register("paymentAmount", { valueAsNumber: true })}
      />

      <Select
        label="Payment frequency"
        error={getError("paymentFrequency")}
        {...register("paymentFrequency")}
      >
        <option value="one-off">One-off payment</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="quarterly">Quarterly</option>
        <option value="annually">Annually</option>
      </Select>

      <Select
        label="Payment terms (days)"
        error={getError("paymentTermsDays")}
        {...register("paymentTermsDays", { valueAsNumber: true })}
      >
        <option value={14}>14 days</option>
        <option value={30}>30 days</option>
        <option value={45}>45 days</option>
        <option value={60}>60 days</option>
      </Select>
      <FieldHint>
        How long the client has to pay each invoice after receiving it.
      </FieldHint>

      <Input
        label="Termination notice period (days)"
        type="number"
        min="1"
        max="180"
        error={getError("terminationNoticeDays")}
        {...register("terminationNoticeDays", { valueAsNumber: true })}
      />

      <Input
        label="Liability cap (optional)"
        placeholder="e.g. the total fees paid under this contract"
        error={getError("liabilityCap")}
        {...register("liabilityCap")}
      />
      <FieldHint>
        The most one party can be required to pay the other if something goes
        wrong. Leaving this blank uses the template default.
      </FieldHint>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ConsultingFields({ register, watch, setValue, getError, fieldArray }: any) {
  const confidentiality = watch("confidentiality") as boolean;
  const fields = fieldArray?.fields ?? [];

  return (
    <>
      <Textarea
        label="Engagement scope"
        placeholder="Describe the scope of the consulting engagement..."
        error={getError("engagementScope")}
        {...register("engagementScope")}
      />

      {/* Deliverables */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Deliverables</label>
        <div className="space-y-2">
          {fields.map((_: unknown, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Deliverable ${index + 1}`}
                error={getError(`deliverables.${index}`)}
                {...register(`deliverables.${index}`)}
              />
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fieldArray.remove(index)}
                  className="shrink-0"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fieldArray.append("")}
          className="mt-1 self-start"
        >
          Add deliverable
        </Button>
      </div>

      <Input
        label="Day rate (GBP)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="e.g. 750.00"
        error={getError("dayRate")}
        {...register("dayRate", { valueAsNumber: true })}
      />

      <Input
        label="Estimated number of days"
        type="number"
        min="1"
        placeholder="e.g. 20"
        error={getError("estimatedDays")}
        {...register("estimatedDays", { valueAsNumber: true })}
      />

      <Select
        label="Payment terms (days)"
        error={getError("paymentTermsDays")}
        {...register("paymentTermsDays", { valueAsNumber: true })}
      >
        <option value={14}>14 days</option>
        <option value={30}>30 days</option>
        <option value={45}>45 days</option>
        <option value={60}>60 days</option>
      </Select>
      <FieldHint>
        How long the client has to pay each invoice after receiving it.
      </FieldHint>

      <Select
        label="IP ownership"
        error={getError("ipOwnership")}
        {...register("ipOwnership")}
      >
        <option value="client">Client owns all IP</option>
        <option value="consultant">
          Consultant retains IP (licence to client)
        </option>
        <option value="joint">Joint ownership</option>
      </Select>

      <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-border-subtle p-3">
        <div>
          <p className="text-sm font-medium text-ink">
            Enhanced confidentiality clause
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            Extended obligations beyond engagement
          </p>
        </div>
        <Toggle
          checked={confidentiality}
          onChange={(e) => setValue("confidentiality", e.target.checked)}
        />
      </div>

      <Input
        label="Termination notice period (days)"
        type="number"
        min="1"
        max="180"
        error={getError("terminationNoticeDays")}
        {...register("terminationNoticeDays", { valueAsNumber: true })}
      />
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SaasFields({ register, watch, setValue, getError }: any) {
  const dataProcessing = watch("dataProcessing") as boolean;

  return (
    <>
      <Textarea
        label="Service description"
        placeholder="Describe the SaaS service being provided..."
        error={getError("serviceDescription")}
        {...register("serviceDescription")}
      />

      <Select
        label="Subscription term"
        error={getError("subscriptionTerm")}
        {...register("subscriptionTerm")}
      >
        <option value="monthly">Monthly</option>
        <option value="annual">Annual</option>
      </Select>

      <Input
        label="Subscription fee (GBP)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="e.g. 99.00"
        error={getError("subscriptionFee")}
        {...register("subscriptionFee", { valueAsNumber: true })}
      />

      <Select
        label="Payment terms (days)"
        error={getError("paymentTermsDays")}
        {...register("paymentTermsDays", { valueAsNumber: true })}
      >
        <option value={14}>14 days</option>
        <option value={30}>30 days</option>
        <option value={45}>45 days</option>
      </Select>

      <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-border-subtle p-3">
        <div>
          <p className="text-sm font-medium text-ink">
            Data processing clause (UK GDPR)
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            Include data protection obligations for personal data processing
          </p>
        </div>
        <Toggle
          checked={dataProcessing}
          onChange={(e) => setValue("dataProcessing", e.target.checked)}
        />
      </div>

      <Input
        label="Uptime commitment (optional)"
        placeholder="e.g. 99.9%"
        error={getError("uptimeCommitment")}
        {...register("uptimeCommitment")}
      />
      <FieldHint>
        The percentage of time you commit the service will be available.
      </FieldHint>

      <Select
        label="Support level"
        error={getError("supportLevel")}
        {...register("supportLevel")}
      >
        <option value="standard">Standard (business hours)</option>
        <option value="priority">Priority (extended hours)</option>
        <option value="premium">Premium (24/7)</option>
      </Select>

      <Input
        label="Termination notice period (days)"
        type="number"
        min="1"
        max="180"
        error={getError("terminationNoticeDays")}
        {...register("terminationNoticeDays", { valueAsNumber: true })}
      />
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SubcontractorFields({ register, getError }: any) {
  return (
    <>
      <Input
        label="Head contract reference"
        placeholder="e.g. HC-2026-001 or main contract title"
        error={getError("headContractReference")}
        {...register("headContractReference")}
      />
      <FieldHint>
        The main contract this subcontract sits under, so the two can be linked.
      </FieldHint>

      <Textarea
        label="Scope of works"
        placeholder="Describe the subcontract works..."
        error={getError("scopeOfWorks")}
        {...register("scopeOfWorks")}
      />

      <Input
        label="Payment amount (GBP)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="e.g. 25000.00"
        error={getError("paymentAmount")}
        {...register("paymentAmount", { valueAsNumber: true })}
      />

      <Select
        label="Payment type"
        error={getError("paymentType")}
        {...register("paymentType")}
      >
        <option value="fixed">Fixed price</option>
        <option value="measured">Measured (remeasurable)</option>
        <option value="cost-plus">Cost-plus</option>
      </Select>

      <Select
        label="Payment terms (days)"
        error={getError("paymentTermsDays")}
        {...register("paymentTermsDays", { valueAsNumber: true })}
      >
        <option value={14}>14 days</option>
        <option value={30}>30 days</option>
        <option value={45}>45 days</option>
        <option value={60}>60 days</option>
      </Select>

      <Input
        label="Completion date"
        type="date"
        error={getError("completionDate")}
        {...register("completionDate")}
      />

      <Input
        label="Defects liability period (months)"
        type="number"
        min="1"
        max="60"
        placeholder="e.g. 12"
        error={getError("defectsLiabilityPeriodMonths")}
        {...register("defectsLiabilityPeriodMonths", {
          valueAsNumber: true,
        })}
      />
      <FieldHint>
        The period after completion during which you remain responsible for
        putting right any defects in the works.
      </FieldHint>

      <Input
        label="Termination notice period (days)"
        type="number"
        min="1"
        max="180"
        error={getError("terminationNoticeDays")}
        {...register("terminationNoticeDays", { valueAsNumber: true })}
      />
    </>
  );
}
