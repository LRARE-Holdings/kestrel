"use client";

import {
  useState,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IconCheck } from "@/components/ui/icons";

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Context so a Review step can offer "Edit" links back to earlier steps.
const StepContext = createContext<{ goToStep: (n: number) => void }>({
  goToStep: () => {},
});

export function useWizardStep() {
  return useContext(StepContext);
}

/** Scroll the first invalid field into view (RHF handles focus). */
export function scrollToFirstError() {
  if (typeof document === "undefined") return;
  requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

// ── Progress indicator ───────────────────────────────────────────────────────

interface WizardProgressProps {
  labels: string[];
  currentStep: number; // 1-based
}

export function WizardProgress({ labels, currentStep }: WizardProgressProps) {
  return (
    <div className="flex items-center justify-center overflow-x-auto pb-1">
      {labels.map((label, i) => {
        const stepNumber = i + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors duration-200 ${
                  isCompleted
                    ? "bg-sage text-white"
                    : isCurrent
                      ? "bg-kestrel text-white"
                      : "border-2 border-border text-text-muted"
                }`}
              >
                {isCompleted ? <IconCheck className="h-4 w-4" /> : stepNumber}
              </div>
              <span
                className={`whitespace-nowrap text-xs transition-colors duration-200 ${
                  isCurrent
                    ? "font-medium text-kestrel"
                    : isCompleted
                      ? "text-text-secondary"
                      : "text-text-muted"
                }`}
              >
                {label}
              </span>
            </div>
            {stepNumber < labels.length && (
              <div
                className={`mx-2 mb-6 h-px w-6 flex-shrink-0 transition-colors duration-200 sm:mx-4 sm:w-10 ${
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

// ── Draft restored notice ────────────────────────────────────────────────────

interface DraftRestoredNoticeProps {
  onStartAfresh: () => void;
  onDismiss: () => void;
}

export function DraftRestoredNotice({
  onStartAfresh,
  onDismiss,
}: DraftRestoredNoticeProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-border-subtle bg-stone/40 px-4 py-3">
      <p className="text-sm text-text-secondary">
        We restored your unsaved draft on this device.
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onStartAfresh}
          className="text-xs font-medium text-kestrel transition-colors hover:text-kestrel-hover"
        >
          Start afresh
        </button>
        <span className="text-border" aria-hidden>
          |
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-medium text-text-muted transition-colors hover:text-ink"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ── Inline spinner (for submit buttons) ─────────────────────────────────────

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-4 w-4 animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ── Field hint (helper text) ─────────────────────────────────────────────────

export function FieldHint({ children }: { children: ReactNode }) {
  return (
    <p className="-mt-0.5 text-xs leading-relaxed text-text-muted">{children}</p>
  );
}

// ── Wizard shell ─────────────────────────────────────────────────────────────

export interface WizardStep {
  id: string;
  label: string;
  /** Field paths validated before leaving this step. Omit for no gate. */
  fields?: string[];
  content: ReactNode;
}

interface FormWizardProps {
  steps: WizardStep[];
  /**
   * Validate the given field paths. Should focus the first error
   * (e.g. RHF `trigger(fields, { shouldFocus: true })`). Returns validity.
   */
  validate: (fields?: string[]) => Promise<boolean>;
  /** Invoked when the user completes the final step. */
  onSubmit: () => void | Promise<void>;
  submitLabel: string;
  submittingLabel?: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  /** Rendered above the progress bar (e.g. the "Draft restored" notice). */
  header?: ReactNode;
}

export function FormWizard({
  steps,
  validate,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting = false,
  submitError,
  header,
}: FormWizardProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const isLast = step === steps.length - 1;
  const current = steps[step];

  async function goNext() {
    const ok = await validate(current.fields);
    if (!ok) {
      scrollToFirstError();
      return;
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  function goToStep(target: number) {
    // Allow jumping back to a completed step (e.g. from Review) without gating.
    if (target < step) {
      setDirection(-1);
      setStep(target);
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    if (isLast) {
      await onSubmit();
    } else {
      await goNext();
    }
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {header}

      <WizardProgress
        labels={steps.map((s) => s.label)}
        currentStep={step + 1}
      />

      <div className="relative">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={current.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            className="space-y-6"
          >
            <StepContext.Provider value={{ goToStep }}>
              {current.content}
            </StepContext.Provider>
          </motion.div>
        </AnimatePresence>
      </div>

      {submitError && (
        <div className="rounded-[var(--radius-md)] border border-error/20 bg-error/5 px-4 py-3">
          <p className="text-sm text-error">{submitError}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        {step > 0 ? (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={goBack}
            disabled={isSubmitting}
          >
            Back
          </Button>
        ) : (
          <span />
        )}

        {isLast ? (
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (submittingLabel ?? submitLabel) : submitLabel}
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={goNext}>
            Continue
          </Button>
        )}
      </div>
    </form>
  );
}
