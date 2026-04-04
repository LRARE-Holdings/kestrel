"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { filingStep1Schema, type FilingStep1Data } from "@/lib/disputes/schemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  IconCalculator,
  IconClipboard,
  IconScale,
  IconFileText,
  IconMessageSquare,
  IconArrowRight,
} from "@/components/ui/icons";

interface FilingStepTypeProps {
  onNext: (data: FilingStep1Data) => void;
  initialData?: Partial<FilingStep1Data>;
}

const DISPUTE_TYPES = [
  {
    value: "payment" as const,
    label: "Payment",
    description: "Late or missing payments",
    icon: IconCalculator,
  },
  {
    value: "deliverables" as const,
    label: "Deliverables",
    description: "Undelivered or substandard work",
    icon: IconClipboard,
  },
  {
    value: "service_quality" as const,
    label: "Service quality",
    description: "Quality of service disputes",
    icon: IconScale,
  },
  {
    value: "contract_interpretation" as const,
    label: "Contract interpretation",
    description: "Disagreements over contract terms",
    icon: IconFileText,
  },
  {
    value: "other" as const,
    label: "Other",
    description: "Other business disputes",
    icon: IconMessageSquare,
  },
];

export function FilingStepType({ onNext, initialData }: FilingStepTypeProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FilingStep1Data>({
    resolver: zodResolver(filingStep1Schema),
    defaultValues: {
      dispute_type: initialData?.dispute_type,
      subject: initialData?.subject ?? "",
      description: initialData?.description ?? "",
      amount_disputed: initialData?.amount_disputed,
    },
  });

  const selectedType = watch("dispute_type");
  const descriptionLength = watch("description")?.length ?? 0;

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      {/* Dispute type selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-ink">
          What is this dispute about?
        </label>
        {errors.dispute_type && (
          <p className="text-xs text-error">{errors.dispute_type.message}</p>
        )}
        <Controller
          name="dispute_type"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DISPUTE_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = field.value === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => field.onChange(type.value)}
                    className={`flex items-start gap-3 rounded-[var(--radius-lg)] border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-kestrel bg-kestrel/5 ring-1 ring-kestrel"
                        : "border-border-subtle bg-white hover:border-border hover:bg-stone/30"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${
                        isSelected
                          ? "bg-kestrel/10 text-kestrel"
                          : "bg-stone text-text-muted"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isSelected ? "text-kestrel" : "text-ink"
                        }`}
                      >
                        {type.label}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {type.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        />
      </div>

      {/* Subject */}
      <Input
        label="Subject"
        placeholder="Brief summary of the dispute"
        maxLength={200}
        error={errors.subject?.message}
        {...register("subject")}
      />
      <p className="!mt-1 text-xs text-text-muted">
        Brief summary of the dispute (max 200 characters)
      </p>

      {/* Amount */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="amount_disputed"
          className="text-sm font-medium text-ink"
        >
          Amount in dispute
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
            GBP
          </span>
          <input
            id="amount_disputed"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className={`w-full rounded-[var(--radius-md)] border bg-white py-2 pl-12 pr-3 text-sm text-ink placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel ${
              errors.amount_disputed
                ? "border-error focus:ring-error/40 focus:border-error"
                : "border-border"
            }`}
            {...register("amount_disputed", {
              setValueAs: (v: string) => {
                if (v === "" || v === undefined || v === null) return undefined;
                const parsed = parseFloat(v);
                return isNaN(parsed) ? undefined : parsed;
              },
            })}
          />
        </div>
        {errors.amount_disputed && (
          <p className="text-xs text-error">{errors.amount_disputed.message}</p>
        )}
        <p className="text-xs text-text-muted">
          Leave blank if not a monetary dispute
        </p>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Textarea
          label="Describe the dispute"
          placeholder="Provide details of what happened, when, and what you've tried so far"
          rows={6}
          maxLength={5000}
          error={errors.description?.message}
          {...register("description")}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Provide details of what happened, when, and what you&apos;ve tried
            so far
          </p>
          <p
            className={`text-xs ${
              descriptionLength > 4800 ? "text-warning" : "text-text-muted"
            }`}
          >
            {descriptionLength}/5,000
          </p>
        </div>
      </div>

      {/* Continue */}
      <div className="flex justify-end">
        <Button type="submit" className="gap-2">
          Continue
          <IconArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
