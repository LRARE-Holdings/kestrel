"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IconSend } from "@/components/ui/icons";
import { addSubmission } from "@/lib/disputes/actions";

interface ProposalFormProps {
  disputeId: string;
  onSubmitted?: () => void;
  onCancel: () => void;
}

const proposalFormSchema = z.object({
  proposed_amount: z
    .number()
    .positive("Amount must be a positive number")
    .optional(),
  proposed_terms: z
    .string()
    .min(1, "Proposed terms are required")
    .max(2000, "Proposed terms must be 2,000 characters or fewer"),
  message: z
    .string()
    .max(2000, "Message must be 2,000 characters or fewer")
    .optional(),
});

type ProposalFormData = z.infer<typeof proposalFormSchema>;

export function ProposalForm({
  disputeId,
  onSubmitted,
  onCancel,
}: ProposalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalFormSchema),
  });

  async function onSubmit(data: ProposalFormData) {
    setIsSubmitting(true);
    setError(null);

    const content = data.message
      ? `${data.proposed_terms}\n\n${data.message}`
      : data.proposed_terms;

    const result = await addSubmission({
      dispute_id: disputeId,
      submission_type: "proposal",
      content,
      metadata: {
        proposed_amount: data.proposed_amount ?? null,
        proposed_terms: data.proposed_terms,
      },
    });

    if ("error" in result) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onSubmitted?.();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-4 shadow-[var(--shadow-sm)] space-y-4"
    >
      <h3 className="text-sm font-medium text-ink">Propose a settlement</h3>

      {/* Proposed amount */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="proposed_amount"
          className="text-sm font-medium text-ink"
        >
          Proposed amount (optional)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
            GBP
          </span>
          <input
            id="proposed_amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className={`w-full rounded-[var(--radius-md)] border bg-surface py-2 pl-12 pr-3 text-sm text-ink placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel ${
              errors.proposed_amount
                ? "border-error focus:ring-error/40 focus:border-error"
                : "border-border"
            }`}
            {...register("proposed_amount", {
              setValueAs: (v: string) => {
                if (v === "" || v === undefined || v === null) return undefined;
                const parsed = parseFloat(v);
                return isNaN(parsed) ? undefined : parsed;
              },
            })}
          />
        </div>
        {errors.proposed_amount && (
          <p className="text-xs text-error">{errors.proposed_amount.message}</p>
        )}
      </div>

      {/* Proposed terms */}
      <Textarea
        label="Describe your proposed resolution"
        placeholder="Outline the terms of your settlement proposal..."
        rows={4}
        maxLength={2000}
        error={errors.proposed_terms?.message}
        {...register("proposed_terms")}
      />

      {/* Additional message */}
      <Textarea
        label="Additional message (optional)"
        placeholder="Any additional context or explanation..."
        rows={3}
        maxLength={2000}
        error={errors.message?.message}
        {...register("message")}
      />

      {error && <p className="text-xs text-error">{error}</p>}

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
          className="gap-1.5"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting...
            </>
          ) : (
            <>
              <IconSend className="h-3.5 w-3.5" />
              Submit proposal
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
