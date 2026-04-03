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
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isActive = isCompleted || isCurrent;

          return (
            <div key={stepNumber} className="flex items-center">
              {/* Dot */}
              <div
                className={`h-2.5 w-2.5 rounded-full transition-colors duration-200 ${
                  isActive ? "bg-kestrel" : "bg-border"
                }`}
              />
              {/* Connecting line */}
              {stepNumber < totalSteps && (
                <div
                  className={`h-px w-8 sm:w-12 transition-colors duration-200 ${
                    isCompleted ? "bg-kestrel" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Labels - hidden on mobile */}
      <div className="hidden sm:flex items-center">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex items-center">
              <span
                className={`text-xs text-center ${
                  isCurrent
                    ? "text-kestrel font-medium"
                    : "text-text-muted"
                }`}
                style={{ width: "2.5rem" }}
              >
                {STEP_LABELS[i]}
              </span>
              {stepNumber < totalSteps && (
                <div className="w-8 sm:w-12 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
