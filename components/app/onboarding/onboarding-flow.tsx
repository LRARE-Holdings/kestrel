"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { KestrelMark } from "@/components/ui/logo";
import { ProgressDots } from "@/components/app/onboarding/progress-dots";
import { StepIdentity } from "@/components/app/onboarding/step-identity";
import { StepBusiness } from "@/components/app/onboarding/step-business";
import { StepUsage } from "@/components/app/onboarding/step-usage";
import { StepDiscovery } from "@/components/app/onboarding/step-discovery";
import { completeOnboarding } from "@/lib/auth/actions";

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface OnboardingData {
  display_name?: string;
  business_name?: string;
  business_type?: string;
  company_size?: string;
  industry?: string;
  primary_use_case?: string;
  estimated_disputes_per_year?: string;
  referral_source?: string;
  referral_code?: string;
}

interface OnboardingFlowProps {
  defaultName: string;
}

export function OnboardingFlow({ defaultName }: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<OnboardingData>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goForward = useCallback(() => {
    setDirection(1);
    setStep((s) => s + 1);
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => s - 1);
  }, []);

  const mergeAndAdvance = useCallback(
    (stepData: Partial<OnboardingData>) => {
      setData((prev) => ({ ...prev, ...stepData }));
      goForward();
    },
    [goForward]
  );

  const handleSkip = useCallback(() => {
    goForward();
  }, [goForward]);

  const handleComplete = useCallback(
    async (stepData: Partial<OnboardingData>) => {
      const finalData = { ...data, ...stepData };
      setData(finalData);
      setSubmitting(true);
      setError(null);

      const result = await completeOnboarding({
        display_name: finalData.display_name ?? "",
        business_name: finalData.business_name,
        business_type: finalData.business_type,
        company_size: finalData.company_size,
        industry: finalData.industry,
        primary_use_case: finalData.primary_use_case,
        estimated_disputes_per_year: finalData.estimated_disputes_per_year,
        referral_source: finalData.referral_source,
        referral_code: finalData.referral_code,
      });

      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      router.push("/dashboard");
    },
    [data, router]
  );

  const handleFinalSkip = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    const result = await completeOnboarding({
      display_name: data.display_name ?? "",
      business_name: data.business_name,
      business_type: data.business_type,
      company_size: data.company_size,
      industry: data.industry,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
  }, [data, router]);

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
      case 1:
        return (
          <StepIdentity
            defaultName={data.display_name ?? defaultName}
            onNext={mergeAndAdvance}
          />
        );
      case 2:
        return (
          <StepBusiness
            defaultValues={{
              business_name: data.business_name,
              business_type: data.business_type,
              company_size: data.company_size,
              industry: data.industry,
            }}
            onNext={mergeAndAdvance}
            onBack={goBack}
          />
        );
      case 3:
        return (
          <StepUsage
            defaultValues={{
              primary_use_case: data.primary_use_case,
              estimated_disputes_per_year: data.estimated_disputes_per_year,
            }}
            onNext={mergeAndAdvance}
            onBack={goBack}
            onSkip={handleSkip}
          />
        );
      case 4:
        return (
          <StepDiscovery
            defaultValues={{
              referral_source: data.referral_source,
              referral_code: data.referral_code,
            }}
            onNext={handleComplete}
            onBack={goBack}
            onSkip={handleFinalSkip}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 pt-16 sm:pt-24">
      {/* Logo */}
      <div className="text-kestrel">
        <KestrelMark className="h-10 w-auto" />
      </div>

      {/* Progress */}
      <div className="mt-8">
        <ProgressDots currentStep={step} />
      </div>

      {/* Step content */}
      <div className="mt-8 w-full max-w-md">
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

        {/* Error message */}
        {error && (
          <p className="mt-4 text-center text-sm text-error">{error}</p>
        )}

        {/* Submitting overlay */}
        {submitting && (
          <div className="mt-4 text-center text-sm text-text-muted">
            Setting up your account...
          </div>
        )}

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-text-muted">
          You can update this information anytime in settings.
        </p>
      </div>
    </div>
  );
}
