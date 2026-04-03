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

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<any>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(config.schema) as any,
    defaultValues: getDefaultValues(contractType),
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
  function onSubmit(data: any) {
    const assembled = assembleContract(
      contractType,
      data as AnyContractData,
    );
    setDocument(assembled);
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

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8 2xl:px-12">
      <Link
        href="/tools/contracts"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-kestrel transition-colors"
      >
        &larr; Contract Templates
      </Link>

      <div className="rounded-2xl border border-border-subtle/60 bg-white/70 p-8 shadow-sm backdrop-blur-xl sm:p-12">
      <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
        {config.title}
      </h1>
      <p className="mt-3 max-w-2xl text-text-secondary leading-relaxed">
        {config.description}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Party A */}
          <Card>
            <CardHeader>
              <CardTitle>Party A Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Contact name"
                placeholder="e.g. Jane Smith"
                error={getError("partyA.name")}
                {...register("partyA.name")}
              />
              <Input
                label="Business name"
                placeholder="e.g. Smith Consulting Ltd"
                error={getError("partyA.businessName")}
                {...register("partyA.businessName")}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">
                  Business address
                </label>
                <textarea
                  rows={3}
                  placeholder={"123 High Street\nNewcastle upon Tyne\nNE1 1AA"}
                  className={`w-full rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm text-ink placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel ${
                    getError("partyA.address")
                      ? "border-error focus:ring-error/40 focus:border-error"
                      : "border-border"
                  }`}
                  {...register("partyA.address")}
                />
                {getError("partyA.address") && (
                  <p className="text-xs text-error">
                    {getError("partyA.address")}
                  </p>
                )}
              </div>
              <Input
                label="Email address"
                type="email"
                placeholder="jane@smithconsulting.co.uk"
                error={getError("partyA.email")}
                {...register("partyA.email")}
              />
              <Input
                label="Company number (optional)"
                placeholder="e.g. 12345678"
                error={getError("partyA.companyNumber")}
                {...register("partyA.companyNumber")}
              />
            </CardContent>
          </Card>

          {/* Party B */}
          <Card>
            <CardHeader>
              <CardTitle>Party B Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Contact name"
                placeholder="e.g. John Doe"
                error={getError("partyB.name")}
                {...register("partyB.name")}
              />
              <Input
                label="Business name"
                placeholder="e.g. Doe Industries Ltd"
                error={getError("partyB.businessName")}
                {...register("partyB.businessName")}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">
                  Business address
                </label>
                <textarea
                  rows={3}
                  placeholder={"456 Market Street\nLondon\nEC1A 1BB"}
                  className={`w-full rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm text-ink placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel ${
                    getError("partyB.address")
                      ? "border-error focus:ring-error/40 focus:border-error"
                      : "border-border"
                  }`}
                  {...register("partyB.address")}
                />
                {getError("partyB.address") && (
                  <p className="text-xs text-error">
                    {getError("partyB.address")}
                  </p>
                )}
              </div>
              <Input
                label="Email address"
                type="email"
                placeholder="john@doeindustries.co.uk"
                error={getError("partyB.email")}
                {...register("partyB.email")}
              />
              <Input
                label="Company number (optional)"
                placeholder="e.g. 87654321"
                error={getError("partyB.companyNumber")}
                {...register("partyB.companyNumber")}
              />
            </CardContent>
          </Card>

          {/* Agreement basics */}
          <Card>
            <CardHeader>
              <CardTitle>Agreement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Effective date"
                type="date"
                error={getError("effectiveDate")}
                {...register("effectiveDate")}
              />

              {/* Type-specific fields */}
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

          {/* Kestrel clause toggle */}
          <Card>
            <CardContent className="flex items-start justify-between gap-4 pt-6">
              <div>
                <p className="text-sm font-medium text-ink">
                  Include Kestrel dispute resolution clause
                </p>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">
                  Adds a structured dispute resolution clause recommending
                  the parties attempt to resolve disputes through Kestrel
                  before formal proceedings. This is recommended and can be
                  removed with one click.
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

          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Generate contract
          </Button>
        </form>

        {/* Preview */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          {document ? (
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
                  {/* Parties */}
                  <div className="mb-4 rounded-[var(--radius-md)] bg-stone/40 p-3">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
                      Parties
                    </p>
                    <p className="text-sm text-ink">
                      <span className="font-medium">(1)</span>{" "}
                      {document.parties.a.businessName}
                    </p>
                    <p className="text-sm text-ink mt-1">
                      <span className="font-medium">(2)</span>{" "}
                      {document.parties.b.businessName}
                    </p>
                  </div>

                  {/* Sections */}
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
                            className="mt-2 ml-4 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary"
                          >
                            {sub.number} {sub.content}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button onClick={copyToClipboard} size="md">
                    {copied ? "Copied!" : "Copy to clipboard"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex min-h-[400px] items-center justify-center">
              <CardContent className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-text-muted"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <p className="text-sm text-text-muted">
                  Fill in the form and your contract preview will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-12 text-xs leading-relaxed text-text-muted">
        This contract template is provided for informational purposes only and
        does not constitute legal advice. It is intended as a starting point for
        businesses in England and Wales and should be reviewed by a qualified
        legal professional before execution. Kestrel does not accept liability
        for any loss arising from the use of this template.
      </p>
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
      return (
        <NdaFields register={register} getError={getError} />
      );
    case "general-service":
      return (
        <GeneralServiceFields register={register} getError={getError} />
      );
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
      return (
        <SubcontractorFields register={register} getError={getError} />
      );
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
          className="self-start mt-1"
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

      <Select
        label="IP ownership"
        error={getError("ipOwnership")}
        {...register("ipOwnership")}
      >
        <option value="client">Client owns all IP</option>
        <option value="freelancer">Freelancer retains IP (licence to client)</option>
        <option value="joint">Joint ownership</option>
      </Select>

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
          className="self-start mt-1"
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

      <Select
        label="IP ownership"
        error={getError("ipOwnership")}
        {...register("ipOwnership")}
      >
        <option value="client">Client owns all IP</option>
        <option value="consultant">Consultant retains IP (licence to client)</option>
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
