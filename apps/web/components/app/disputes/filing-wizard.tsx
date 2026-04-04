"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FilingProgress } from "@/components/app/disputes/filing-progress";
import { FilingStepType } from "@/components/app/disputes/filing-step-type";
import { FilingStepRespondent } from "@/components/app/disputes/filing-step-respondent";
import { FilingStepEvidence } from "@/components/app/disputes/filing-step-evidence";
import { FilingStepReview } from "@/components/app/disputes/filing-step-review";
import { fileDispute } from "@/lib/disputes/actions";
import type { FileWithMeta } from "@/components/app/disputes/evidence-upload";
import type { FilingStep1Data, FilingStep2Data } from "@/lib/disputes/schemas";

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface WizardData {
  step1?: FilingStep1Data;
  step2?: FilingStep2Data;
}

export function FilingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<WizardData>({});
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goForward = useCallback(() => {
    setDirection(1);
    setStep((s) => s + 1);
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => s - 1);
  }, []);

  const handleStep1 = useCallback(
    (step1Data: FilingStep1Data) => {
      setData((prev) => ({ ...prev, step1: step1Data }));
      goForward();
    },
    [goForward]
  );

  const handleStep2 = useCallback(
    (step2Data: FilingStep2Data) => {
      setData((prev) => ({ ...prev, step2: step2Data }));
      goForward();
    },
    [goForward]
  );

  const handleStep3 = useCallback(
    (uploadedFiles: FileWithMeta[]) => {
      setFiles(uploadedFiles);
      goForward();
    },
    [goForward]
  );

  const handleSubmit = useCallback(
    async (includesClause: boolean) => {
      if (!data.step1 || !data.step2) return;

      setIsSubmitting(true);
      setError(null);

      const result = await fileDispute({
        dispute_type: data.step1.dispute_type,
        subject: data.step1.subject,
        description: data.step1.description,
        amount_disputed: data.step1.amount_disputed,
        responding_party_name: data.step2.responding_party_name,
        responding_party_email: data.step2.responding_party_email,
        responding_party_business: data.step2.responding_party_business,
        includes_dispute_clause: includesClause,
      });

      if ("error" in result) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      // Upload evidence files if any
      if (files.length > 0) {
        // File uploads would be handled by a separate action/API route
        // that uploads to Supabase Storage and creates evidence_files records.
        // For now we navigate to the dispute; the user can upload via the detail page.
      }

      router.push(`/disputes/${result.disputeId}`);
    },
    [data, files, router]
  );

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <FilingStepType onNext={handleStep1} initialData={data.step1} />
        );
      case 1:
        return (
          <FilingStepRespondent
            onNext={handleStep2}
            onBack={goBack}
            initialData={data.step2}
          />
        );
      case 2:
        return (
          <FilingStepEvidence
            onNext={handleStep3}
            onBack={goBack}
            initialFiles={files}
          />
        );
      case 3:
        return data.step1 && data.step2 ? (
          <FilingStepReview
            data={{
              ...data.step1,
              ...data.step2,
            }}
            files={files}
            onBack={goBack}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ) : null;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-8">
      <FilingProgress currentStep={step + 1} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {error && (
        <div className="rounded-[var(--radius-md)] border border-error/20 bg-error/5 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}
    </div>
  );
}
