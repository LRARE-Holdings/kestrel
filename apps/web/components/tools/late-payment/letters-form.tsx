"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { letterSchema, type LetterInput } from "@/lib/late-payment/schemas";
import { generateLetter, type LetterOutput } from "@/lib/late-payment/letters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { SaveDocumentButton } from "@/components/tools/save-document-button";

const STAGES = [
  {
    value: 1,
    name: "Stage 1: Friendly Reminder",
    description: "Polite first contact, 1-7 days overdue",
  },
  {
    value: 2,
    name: "Stage 2: Firm Reminder",
    description: "Urgent tone, references payment terms, 14-21 days overdue",
  },
  {
    value: 3,
    name: "Stage 3: Letter Before Action",
    description:
      "Formal demand, references Late Payment Act and statutory interest, 30+ days overdue",
  },
  {
    value: 4,
    name: "Stage 4: Notice of Intent",
    description: "Final warning before court proceedings, 45+ days overdue",
  },
];

export function LettersForm({ baseRate }: { baseRate: number }) {
  const [letter, setLetter] = useState<LetterOutput | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LetterInput>({
    resolver: zodResolver(letterSchema),
    defaultValues: {
      creditor: { name: "", businessName: "", address: "", email: "" },
      debtor: { name: "", businessName: "", address: "", email: "" },
      invoiceNumber: "",
      invoiceDate: "",
      amountOwed: undefined,
      paymentTermsDays: 30,
      includeKestrelClause: true,
      letterStage: 1,
    },
  });

  const includeKestrelClause = watch("includeKestrelClause");
  const selectedStage = watch("letterStage");

  function onSubmit(data: LetterInput) {
    const output = generateLetter(data, { baseRate });
    setLetter(output);
  }

  async function copyToClipboard() {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(letter.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = letter.body;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8 2xl:px-12">
      <Link
        href="/tools/late-payment"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-kestrel transition-colors"
      >
        &larr; Late Payment Toolkit
      </Link>

      <div className="rounded-2xl border border-border-subtle/60 bg-white/70 p-8 shadow-sm backdrop-blur-xl sm:p-12">
      <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
        Letter Generator
      </h1>
      <p className="mt-3 max-w-2xl text-text-secondary leading-relaxed">
        Payment chasing letters in four escalating stages. Each references UK
        business practice and, where relevant, the Late Payment of Commercial
        Debts (Interest) Act 1998.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Letter stage selector */}
          <Card>
            <CardHeader>
              <CardTitle>Letter Stage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {STAGES.map((stage) => (
                <label
                  key={stage.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border p-3 transition-colors ${
                    selectedStage === stage.value
                      ? "border-kestrel bg-kestrel/5"
                      : "border-border-subtle hover:border-border"
                  }`}
                >
                  <input
                    type="radio"
                    value={stage.value}
                    checked={selectedStage === stage.value}
                    onChange={() => setValue("letterStage", stage.value)}
                    className="mt-0.5 accent-kestrel"
                  />
                  <div>
                    <span className="text-sm font-medium text-ink">
                      {stage.name}
                    </span>
                    <p className="text-xs text-text-muted">
                      {stage.description}
                    </p>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Creditor details */}
          <Card>
            <CardHeader>
              <CardTitle>Your Details (Creditor)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Your name"
                placeholder="e.g. Jane Smith"
                error={errors.creditor?.name?.message}
                {...register("creditor.name")}
              />
              <Input
                label="Business name"
                placeholder="e.g. Smith Consulting Ltd"
                error={errors.creditor?.businessName?.message}
                {...register("creditor.businessName")}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">
                  Business address
                </label>
                <textarea
                  rows={3}
                  placeholder={"123 High Street\nNewcastle upon Tyne\nNE1 1AA"}
                  className={`w-full rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm text-ink placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel ${
                    errors.creditor?.address
                      ? "border-error focus:ring-error/40 focus:border-error"
                      : "border-border"
                  }`}
                  {...register("creditor.address")}
                />
                {errors.creditor?.address && (
                  <p className="text-xs text-error">
                    {errors.creditor.address.message}
                  </p>
                )}
              </div>
              <Input
                label="Email address"
                type="email"
                placeholder="jane@smithconsulting.co.uk"
                error={errors.creditor?.email?.message}
                {...register("creditor.email")}
              />
            </CardContent>
          </Card>

          {/* Debtor details */}
          <Card>
            <CardHeader>
              <CardTitle>Debtor Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Contact name"
                placeholder="e.g. John Doe"
                error={errors.debtor?.name?.message}
                {...register("debtor.name")}
              />
              <Input
                label="Business name"
                placeholder="e.g. Doe Industries Ltd"
                error={errors.debtor?.businessName?.message}
                {...register("debtor.businessName")}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">
                  Business address
                </label>
                <textarea
                  rows={3}
                  placeholder={"456 Market Street\nLondon\nEC1A 1BB"}
                  className={`w-full rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm text-ink placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel ${
                    errors.debtor?.address
                      ? "border-error focus:ring-error/40 focus:border-error"
                      : "border-border"
                  }`}
                  {...register("debtor.address")}
                />
                {errors.debtor?.address && (
                  <p className="text-xs text-error">
                    {errors.debtor.address.message}
                  </p>
                )}
              </div>
              <Input
                label="Email address"
                type="email"
                placeholder="john@doeindustries.co.uk"
                error={errors.debtor?.email?.message}
                {...register("debtor.email")}
              />
            </CardContent>
          </Card>

          {/* Invoice details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Invoice number"
                placeholder="e.g. INV-2026-001"
                error={errors.invoiceNumber?.message}
                {...register("invoiceNumber")}
              />
              <Input
                label="Invoice date"
                type="date"
                error={errors.invoiceDate?.message}
                {...register("invoiceDate")}
              />
              <Input
                label="Amount owed (GBP)"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 5000.00"
                error={errors.amountOwed?.message}
                {...register("amountOwed", { valueAsNumber: true })}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">
                  Payment terms (days)
                </label>
                <select
                  className="w-full rounded-[var(--radius-md)] border border-border bg-white px-3 py-2 text-sm text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel"
                  {...register("paymentTermsDays", { valueAsNumber: true })}
                >
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={45}>45 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>
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
                  Adds an invitation to resolve the dispute through Kestrel
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
            Generate letter
          </Button>
        </form>

        {/* Letter preview */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          {letter ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{letter.stageName}</CardTitle>
                  <span className="rounded-[var(--radius-sm)] bg-kestrel/10 px-2.5 py-1 text-xs font-medium text-kestrel">
                    Stage {letter.stage}
                  </span>
                </div>
                <p className="text-sm font-medium text-text-secondary">
                  {letter.subject}
                </p>
              </CardHeader>
              <CardContent>
                <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap font-body text-sm leading-relaxed text-ink">
                  {letter.body}
                </pre>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={copyToClipboard} size="md">
                    {copied ? "Copied!" : "Copy to clipboard"}
                  </Button>
                  <SaveDocumentButton
                    documentType="late_payment_letter"
                    title={`${letter.stageName} — ${watch("debtor.businessName") || "Unknown"}`}
                    configuration={{
                      creditor: watch("creditor"),
                      debtor: watch("debtor"),
                      invoiceNumber: watch("invoiceNumber"),
                      invoiceDate: watch("invoiceDate"),
                      amountOwed: watch("amountOwed"),
                      paymentTermsDays: watch("paymentTermsDays"),
                      letterStage: watch("letterStage"),
                      includeKestrelClause: watch("includeKestrelClause"),
                    }}
                    includesDisputeClause={includeKestrelClause}
                  />
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
                  Fill in the form and your letter preview will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-12 text-xs leading-relaxed text-text-muted">
        These letter templates are provided for informational purposes only and
        do not constitute legal advice. They are intended as a starting point and
        should be reviewed before sending. If you are considering legal action,
        seek independent legal advice. The Late Payment of Commercial Debts
        (Interest) Act 1998 applies to commercial debts in England and Wales
        only.
      </p>
      </div>
    </div>
  );
}
