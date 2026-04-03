"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  noticeSchema,
  NOTICE_TYPES,
  type NoticeInput,
} from "@/lib/notices/schemas";
import { CONSEQUENCE_TEMPLATES } from "@/lib/notices/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";

export function NoticeForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NoticeInput>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      noticeType: "breach",
      sender: { name: "", businessName: "", address: "", email: "" },
      recipient: { name: "", businessName: "", address: "", email: "" },
      reference: "",
      subject: "",
      content: "",
      relevantClause: "",
      requiredAction: "",
      responseDeadline: undefined,
      consequences: "",
      includeDisputeClause: true,
    },
  });

  const selectedType = watch("noticeType");
  const includeDisputeClause = watch("includeDisputeClause");

  function applyConsequenceTemplate() {
    const template = CONSEQUENCE_TEMPLATES[selectedType] ?? "";
    setValue("consequences", template);
  }

  async function onSubmit(data: NoticeInput) {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create notice");
      }

      const { accessToken } = await response.json();
      router.push(`/tools/notice-log/${accessToken}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Notice type selector */}
      <Card>
        <CardHeader>
          <CardTitle>Notice Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {NOTICE_TYPES.map((type) => (
            <label
              key={type.value}
              className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border p-3 transition-colors ${
                selectedType === type.value
                  ? "border-kestrel bg-kestrel/5"
                  : "border-border-subtle hover:border-border"
              }`}
            >
              <input
                type="radio"
                value={type.value}
                checked={selectedType === type.value}
                onChange={() => setValue("noticeType", type.value)}
                className="mt-0.5 accent-kestrel"
              />
              <div>
                <span className="text-sm font-medium text-ink">
                  {type.label}
                </span>
                <p className="text-xs text-text-muted">
                  {type.description}
                </p>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Sender details */}
      <Card>
        <CardHeader>
          <CardTitle>Your Details (Sender)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Your name"
            placeholder="e.g. Jane Smith"
            error={errors.sender?.name?.message}
            {...register("sender.name")}
          />
          <Input
            label="Business name"
            placeholder="e.g. Smith Consulting Ltd"
            error={errors.sender?.businessName?.message}
            {...register("sender.businessName")}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">
              Business address
            </label>
            <textarea
              rows={3}
              placeholder={"123 High Street\nNewcastle upon Tyne\nNE1 1AA"}
              className={`w-full rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm text-ink placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel resize-y ${
                errors.sender?.address
                  ? "border-error focus:ring-error/40 focus:border-error"
                  : "border-border"
              }`}
              {...register("sender.address")}
            />
            {errors.sender?.address && (
              <p className="text-xs text-error">
                {errors.sender.address.message}
              </p>
            )}
          </div>
          <Input
            label="Email address"
            type="email"
            placeholder="jane@smithconsulting.co.uk"
            error={errors.sender?.email?.message}
            {...register("sender.email")}
          />
        </CardContent>
      </Card>

      {/* Recipient details */}
      <Card>
        <CardHeader>
          <CardTitle>Recipient Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Contact name"
            placeholder="e.g. John Doe"
            error={errors.recipient?.name?.message}
            {...register("recipient.name")}
          />
          <Input
            label="Business name"
            placeholder="e.g. Doe Industries Ltd"
            error={errors.recipient?.businessName?.message}
            {...register("recipient.businessName")}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">
              Business address
            </label>
            <textarea
              rows={3}
              placeholder={"456 Market Street\nLondon\nEC1A 1BB"}
              className={`w-full rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm text-ink placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel resize-y ${
                errors.recipient?.address
                  ? "border-error focus:ring-error/40 focus:border-error"
                  : "border-border"
              }`}
              {...register("recipient.address")}
            />
            {errors.recipient?.address && (
              <p className="text-xs text-error">
                {errors.recipient.address.message}
              </p>
            )}
          </div>
          <Input
            label="Email address"
            type="email"
            placeholder="john@doeindustries.co.uk"
            error={errors.recipient?.email?.message}
            {...register("recipient.email")}
          />
        </CardContent>
      </Card>

      {/* Notice content */}
      <Card>
        <CardHeader>
          <CardTitle>Notice Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Reference (optional)"
            placeholder="e.g. Contract ref, invoice number, project name"
            error={errors.reference?.message}
            {...register("reference")}
          />
          <Input
            label="Subject"
            placeholder="e.g. Notice of breach of contract dated 1 January 2026"
            error={errors.subject?.message}
            {...register("subject")}
          />
          <Textarea
            label="Content"
            placeholder="Describe the matter in full. Include dates, facts, and any relevant details."
            error={errors.content?.message}
            className="min-h-[160px]"
            {...register("content")}
          />
          <Input
            label="Relevant clause (optional)"
            placeholder="e.g. Clause 7.2 of the Service Agreement"
            error={errors.relevantClause?.message}
            {...register("relevantClause")}
          />
          <Textarea
            label="Required action (optional)"
            placeholder="e.g. Remedy the breach by completing all outstanding deliverables"
            error={errors.requiredAction?.message}
            {...register("requiredAction")}
          />
          <Input
            label="Response deadline (optional)"
            type="date"
            error={errors.responseDeadline?.message}
            {...register("responseDeadline")}
          />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-ink">
                Consequences (optional)
              </label>
              <button
                type="button"
                onClick={applyConsequenceTemplate}
                className="text-xs font-medium text-kestrel hover:text-kestrel-hover transition-colors"
              >
                Use template
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Describe the consequences if the required action is not taken"
              className={`w-full rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm text-ink placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel resize-y ${
                errors.consequences
                  ? "border-error focus:ring-error/40 focus:border-error"
                  : "border-border"
              }`}
              {...register("consequences")}
            />
            {errors.consequences && (
              <p className="text-xs text-error">
                {errors.consequences.message}
              </p>
            )}
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
              Adds an invitation to resolve any dispute arising from this notice
              through Kestrel before formal proceedings. Recommended and can be
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

      {submitError && (
        <div className="rounded-[var(--radius-md)] border border-error/20 bg-error/5 px-4 py-3">
          <p className="text-sm text-error">{submitError}</p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        disabled={submitting}
      >
        {submitting ? "Creating notice..." : "Create notice"}
      </Button>
    </form>
  );
}
