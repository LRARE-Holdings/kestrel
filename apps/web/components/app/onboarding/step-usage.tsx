"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";
import { USE_CASES, DISPUTE_ESTIMATES } from "@kestrel/shared/constants";

interface StepUsageData {
  primary_use_case?: string;
  estimated_disputes_per_year?: string;
}

interface StepUsageProps {
  defaultValues?: StepUsageData;
  onNext: (data: StepUsageData) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function StepUsage({
  defaultValues = {},
  onNext,
  onBack,
  onSkip,
}: StepUsageProps) {
  const [useCase, setUseCase] = useState(defaultValues.primary_use_case ?? "");
  const [disputes, setDisputes] = useState(
    defaultValues.estimated_disputes_per_year ?? ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    onNext({
      primary_use_case: useCase || undefined,
      estimated_disputes_per_year: disputes || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">
          How will you use Kestrel?
        </h1>
      </div>

      {/* Use case cards - 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {USE_CASES.map((uc) => {
          const selected = useCase === uc.value;
          return (
            <button
              key={uc.value}
              type="button"
              onClick={() => setUseCase(selected ? "" : uc.value)}
              className={`relative rounded-lg border p-4 text-left transition-colors cursor-pointer ${
                selected
                  ? "border-kestrel bg-kestrel/5"
                  : "border-border-subtle hover:border-kestrel/30"
              }`}
            >
              {selected && (
                <div className="absolute top-2 right-2">
                  <IconCheck className="h-4 w-4 text-kestrel" />
                </div>
              )}
              <span className="block text-sm font-medium text-ink">
                {uc.label}
              </span>
              <span className="mt-1 block text-xs text-text-muted">
                {uc.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dispute estimates - pills */}
      <div className="space-y-2.5">
        <p className="text-sm text-text-secondary">
          How many disputes do you expect per year?
        </p>
        <div className="flex flex-wrap gap-2">
          {DISPUTE_ESTIMATES.map((de) => {
            const selected = disputes === de.value;
            return (
              <button
                key={de.value}
                type="button"
                onClick={() => setDisputes(selected ? "" : de.value)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors cursor-pointer ${
                  selected
                    ? "border-kestrel bg-kestrel text-white"
                    : "border-border text-text-secondary hover:border-kestrel/30"
                }`}
              >
                {de.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <Button type="submit" className="gap-2">
            Continue
            <IconArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
