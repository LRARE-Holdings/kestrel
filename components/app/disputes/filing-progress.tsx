"use client";

import { IconCheck } from "@/components/ui/icons";

const STEP_LABELS = ["Details", "Respondent", "Evidence", "Review"];

interface FilingProgressProps {
  currentStep: number;
  totalSteps?: number;
}

export function FilingProgress({
  currentStep,
  totalSteps = 4,
}: FilingProgressProps) {
  return (
    <div className="flex items-center justify-center">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div key={stepNumber} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors duration-200 ${
                  isCompleted
                    ? "bg-sage text-white"
                    : isCurrent
                      ? "bg-kestrel text-white"
                      : "border-2 border-border text-text-muted"
                }`}
              >
                {isCompleted ? (
                  <IconCheck className="h-4 w-4" />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`text-xs transition-colors duration-200 ${
                  isCurrent
                    ? "font-medium text-kestrel"
                    : isCompleted
                      ? "text-text-secondary"
                      : "text-text-muted"
                }`}
              >
                {STEP_LABELS[i]}
              </span>
            </div>

            {/* Connecting line */}
            {stepNumber < totalSteps && (
              <div
                className={`mx-2 mb-6 h-px w-8 transition-colors duration-200 sm:mx-4 sm:w-12 ${
                  isCompleted ? "bg-sage" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
