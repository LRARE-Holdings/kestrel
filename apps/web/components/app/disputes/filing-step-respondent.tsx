"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { filingStep2Schema, type FilingStep2Data } from "@/lib/disputes/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconChevronLeft } from "@/components/ui/icons";

interface FilingStepRespondentProps {
  onNext: (data: FilingStep2Data) => void;
  onBack: () => void;
  initialData?: Partial<FilingStep2Data>;
}

export function FilingStepRespondent({
  onNext,
  onBack,
  initialData,
}: FilingStepRespondentProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FilingStep2Data>({
    resolver: zodResolver(filingStep2Schema),
    defaultValues: {
      responding_party_name: initialData?.responding_party_name ?? "",
      responding_party_email: initialData?.responding_party_email ?? "",
      responding_party_business: initialData?.responding_party_business ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <h2 className="font-display text-xl text-ink">
          Who is the dispute with?
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Provide the details of the party you are raising the dispute against.
        </p>
      </div>

      <Input
        label="Full name"
        placeholder="Jane Smith"
        error={errors.responding_party_name?.message}
        {...register("responding_party_name")}
      />

      <Input
        label="Email address"
        type="email"
        placeholder="jane@example.com"
        error={errors.responding_party_email?.message}
        {...register("responding_party_email")}
      />

      <Input
        label="Business name"
        placeholder="Smith Consulting Ltd"
        error={errors.responding_party_business?.message}
        {...register("responding_party_business")}
      />

      {/* Info box */}
      <div className="rounded-[var(--radius-md)] bg-stone p-4">
        <p className="text-xs leading-relaxed text-text-secondary">
          The respondent will receive an email notification and will need to
          create a Kestrel account to view and respond to this dispute. Their
          response deadline will be 14 days from the filing date.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          className="gap-1.5"
        >
          <IconChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button type="submit" className="gap-2">
          Continue
          <IconArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
