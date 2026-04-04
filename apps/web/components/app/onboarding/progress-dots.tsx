"use client";

const STEP_LABELS = ["You", "Business", "Usage", "Discovery"];

interface ProgressDotsProps {
  currentStep: number;
  totalSteps?: number;
}

export function ProgressDots({
  currentStep,
  totalSteps = 4,
}: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isActive = isCompleted || isCurrent;

        return (
          <div key={stepNumber} className="flex items-center">
            {/* Dot + label column */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`h-2.5 w-2.5 rounded-full transition-colors duration-200 ${
                  isActive ? "bg-kestrel" : "bg-border"
                }`}
              />
              <span
                className={`hidden text-xs sm:block ${
                  isCurrent
                    ? "text-kestrel font-medium"
                    : "text-text-muted"
                }`}
              >
                {STEP_LABELS[i]}
              </span>
            </div>

            {/* Connecting line */}
            {stepNumber < totalSteps && (
              <div
                className={`mx-3 sm:mx-4 mb-5 hidden h-px w-8 transition-colors duration-200 sm:block ${
                  isCompleted ? "bg-kestrel" : "bg-border"
                }`}
              />
            )}
            {stepNumber < totalSteps && (
              <div
                className={`mx-2 h-px w-6 transition-colors duration-200 sm:hidden ${
                  isCompleted ? "bg-kestrel" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
