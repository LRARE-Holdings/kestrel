"use client";

import { Badge } from "@/components/ui/badge";
import { IconCheck } from "@/components/ui/icons";
import { STATUS_LABELS } from "@/lib/disputes/constants";
import type { DisputeStatus } from "@/lib/disputes/types";

interface DisputeStatusBarProps {
  status: DisputeStatus;
}

const MAIN_STEPS: { key: DisputeStatus; label: string }[] = [
  { key: "filed", label: "Filed" },
  { key: "awaiting_response", label: "Awaiting response" },
  { key: "in_progress", label: "In progress" },
  { key: "resolved", label: "Resolved" },
];

const STEP_ORDER: Record<string, number> = {
  draft: -1,
  filed: 0,
  awaiting_response: 1,
  in_progress: 2,
  resolved: 3,
};

const SPECIAL_STATUSES = ["escalated", "withdrawn", "expired"];

function getSpecialBadgeVariant(status: string) {
  if (status === "escalated") return "destructive" as const;
  if (status === "withdrawn") return "outline" as const;
  if (status === "expired") return "warm" as const;
  return "outline" as const;
}

export function DisputeStatusBar({ status }: DisputeStatusBarProps) {
  const isSpecial = SPECIAL_STATUSES.includes(status);
  const currentIndex = STEP_ORDER[status] ?? -1;

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {MAIN_STEPS.map((step, i) => {
          const isCompleted = currentIndex > i;
          const isCurrent = currentIndex === i && !isSpecial;
          const isFuture = currentIndex < i || isSpecial;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              {/* Step dot and label */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                      isCompleted
                        ? "bg-sage text-white"
                        : isCurrent
                          ? "bg-kestrel text-white"
                          : "border-2 border-border bg-surface"
                    }`}
                  >
                    {isCompleted ? (
                      <IconCheck className="h-3.5 w-3.5" />
                    ) : isCurrent ? (
                      <div className="h-2 w-2 rounded-full bg-surface" />
                    ) : null}
                  </div>
                  {/* Pulse animation for current step */}
                  {isCurrent && (
                    <div className="absolute inset-0 animate-ping rounded-full bg-kestrel/30" />
                  )}
                </div>
                <span
                  className={`hidden text-xs sm:block ${
                    isCurrent
                      ? "font-medium text-kestrel"
                      : isCompleted
                        ? "text-text-secondary"
                        : "text-text-muted"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {i < MAIN_STEPS.length - 1 && (
                <div
                  className={`mx-1.5 mb-6 hidden h-px flex-1 sm:block ${
                    isCompleted ? "bg-sage" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Special status overlay */}
      {isSpecial && (
        <div className="mt-3 flex justify-center">
          <Badge variant={getSpecialBadgeVariant(status)}>
            {STATUS_LABELS[status] ?? status}
          </Badge>
        </div>
      )}
    </div>
  );
}
