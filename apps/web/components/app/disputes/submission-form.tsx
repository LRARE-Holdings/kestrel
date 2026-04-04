"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IconSend } from "@/components/ui/icons";
import { SUBMISSION_TYPE_LABELS } from "@/lib/disputes/constants";
import { addSubmission } from "@/lib/disputes/actions";
import type { SubmissionType } from "@/lib/disputes/types";

interface SubmissionFormProps {
  disputeId: string;
  allowedTypes: SubmissionType[];
  onSubmitted?: () => void;
}

const formSchema = z.object({
  submission_type: z.string().min(1, "Select a submission type"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content must be 5,000 characters or fewer"),
});

type FormData = z.infer<typeof formSchema>;

export function SubmissionForm({
  disputeId,
  allowedTypes,
  onSubmitted,
}: SubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submission_type: allowedTypes.length === 1 ? allowedTypes[0] : "",
      content: "",
    },
  });

  const contentLength = watch("content")?.length ?? 0;

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    setError(null);

    const result = await addSubmission({
      dispute_id: disputeId,
      submission_type: data.submission_type,
      content: data.content,
    });

    if ("error" in result) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    reset();
    setIsSubmitting(false);
    onSubmitted?.();
  }

  if (allowedTypes.length === 0) return null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-4 shadow-[var(--shadow-sm)]"
    >
      <h3 className="text-sm font-medium text-ink">Add a submission</h3>

      <div className="mt-3 space-y-3">
        {allowedTypes.length > 1 && (
          <Select
            label="Type"
            error={errors.submission_type?.message}
            {...register("submission_type")}
          >
            <option value="">Select type...</option>
            {allowedTypes.map((type) => (
              <option key={type} value={type}>
                {SUBMISSION_TYPE_LABELS[type] ?? type}
              </option>
            ))}
          </Select>
        )}

        <div>
          <Textarea
            label="Content"
            placeholder="Write your submission..."
            rows={4}
            maxLength={5000}
            error={errors.content?.message}
            {...register("content")}
          />
          <div className="mt-1 flex justify-end">
            <span
              className={`text-xs ${
                contentLength > 4800 ? "text-warning" : "text-text-muted"
              }`}
            >
              {contentLength}/5,000
            </span>
          </div>
        </div>

        {error && (
          <p className="text-xs text-error">{error}</p>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Submitting...
              </>
            ) : (
              <>
                <IconSend className="h-3.5 w-3.5" />
                Submit
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
