"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { KestrelMark } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { markTutorialComplete } from "@/lib/auth/actions";

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SESSION_KEY = "kestrel-tutorial-shown";

/* ------------------------------------------------------------------ */
/*  Step definitions                                                    */
/* ------------------------------------------------------------------ */

interface TutorialStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
  action?: { label: string; href: string };
}

const iconBase =
  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl";

const STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Kestrel",
    subtitle: "Your dispute prevention toolkit",
    description:
      "Kestrel gives your business structured tools to prevent disagreements from becoming disputes. Here's a quick look at what you can do.",
    details: [
      "Create professional contracts with built-in dispute resolution clauses",
      "Chase late payments using UK statutory interest calculations",
      "Set up clear agreements and track project milestones",
      "If things go wrong, resolve disputes without a courtroom",
    ],
    icon: (
      <div className={`${iconBase} bg-kestrel/10`}>
        <KestrelMark className="h-7 w-7 text-kestrel" />
      </div>
    ),
  },
  {
    id: "tools",
    title: "Free Toolkit",
    subtitle: "Six tools, no sign-up required",
    description:
      "Your toolkit is accessible from the sidebar. Each tool is fully functional without a subscription -- signing in lets you save and manage your documents.",
    details: [
      "Late Payment Calculator -- work out statutory interest and compensation",
      "Letter Generator -- four-stage escalation letters for unpaid invoices",
      "Contract Templates -- professional UK contracts for freelancers, NDAs, and more",
      "T&C Generator -- UK-compliant terms for your website or service",
      "Handshake -- simple agreements both parties can confirm online",
      "Notice Log -- formal notices with delivery tracking",
    ],
    icon: (
      <div className={`${iconBase} bg-sage/15`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={28}
          height={28}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-kestrel"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94L6.73 20.2a2 2 0 0 1-2.83 0l-.1-.1a2 2 0 0 1 0-2.83l6.83-6.73a6 6 0 0 1 7.94-7.94l-3.87 3.7z" />
        </svg>
      </div>
    ),
    action: { label: "Browse tools", href: "/tools" },
  },
  {
    id: "documents",
    title: "Documents",
    subtitle: "Everything you create, saved automatically",
    description:
      "When you generate a contract, letter, or set of terms, it's automatically saved to your Documents page. You can revisit, edit, or download anything you've created.",
    details: [
      "All generated documents appear in Documents in your sidebar",
      "Download as PDF or copy to clipboard at any time",
      "Documents include the Kestrel dispute clause by default -- you can remove it with one click",
      "Your documents are private and encrypted at rest",
    ],
    icon: (
      <div className={`${iconBase} bg-kestrel/10`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={28}
          height={28}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-kestrel"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8" />
          <path d="M8 17h6" />
        </svg>
      </div>
    ),
    action: { label: "View documents", href: "/documents" },
  },
  {
    id: "disputes",
    title: "Dispute Resolution",
    subtitle: "Structured communication, not courtrooms",
    description:
      "If a disagreement arises with a client, supplier, or partner, Kestrel provides a structured path to resolution. Both parties communicate through formal submissions -- keeping things clear and on the record.",
    details: [
      "File a dispute with a reference number and deadline",
      "Both parties submit structured responses, proposals, and evidence",
      "Every submission is hashed for integrity -- nothing can be altered",
      "If resolution isn't possible, escalate for external mediation",
    ],
    icon: (
      <div className={`${iconBase} bg-sage/15`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={28}
          height={28}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-kestrel"
        >
          <path d="M12 3v18" />
          <path d="M8 21h8" />
          <path d="M3 9l4-6h10l4 6" />
          <path d="M3 9a4 4 0 0 0 4 4 4 4 0 0 0 4-4" />
          <path d="M13 9a4 4 0 0 0 4 4 4 4 0 0 0 4-4" />
        </svg>
      </div>
    ),
    action: { label: "View disputes", href: "/disputes" },
  },
  {
    id: "settings",
    title: "Your Profile & Settings",
    subtitle: "Keep your details up to date",
    description:
      "Your profile information appears on contracts and disputes. You can update your business details, notification preferences, and subscription plan at any time from Settings.",
    details: [
      "Update your display name, business details, and industry",
      "Manage your subscription and billing",
      "Your dashboard adapts as you use the platform -- it'll show active disputes and recent documents",
      "The sidebar collapses for more screen space when you need it",
    ],
    icon: (
      <div className={`${iconBase} bg-kestrel/10`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={28}
          height={28}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-kestrel"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </div>
    ),
    action: { label: "Open settings", href: "/settings" },
  },
];

/* ------------------------------------------------------------------ */
/*  Progress indicator                                                  */
/* ------------------------------------------------------------------ */

function TutorialProgress({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === currentStep
              ? "w-6 bg-kestrel"
              : i < currentStep
                ? "w-1.5 bg-kestrel/40"
                : "w-1.5 bg-border"
          }`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step card                                                           */
/* ------------------------------------------------------------------ */

function StepContent({ step }: { step: TutorialStep }) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
      >
        {step.icon}
      </motion.div>

      {/* Title */}
      <motion.h2
        className="mt-5 font-display text-2xl tracking-tight text-ink sm:text-3xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: EASE_OUT_EXPO }}
      >
        {step.title}
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        className="mt-1 text-sm font-medium text-kestrel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15, ease: EASE_OUT_EXPO }}
      >
        {step.subtitle}
      </motion.p>

      {/* Description */}
      <motion.p
        className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: EASE_OUT_EXPO }}
      >
        {step.description}
      </motion.p>

      {/* Detail bullets */}
      <motion.ul
        className="mt-5 space-y-2.5 text-left"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3, ease: EASE_OUT_EXPO }}
      >
        {step.details.map((detail, i) => (
          <motion.li
            key={i}
            className="flex items-start gap-2.5 text-sm text-text-secondary"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.35 + i * 0.06,
              ease: EASE_OUT_EXPO,
            }}
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-kestrel/50" />
            <span>{detail}</span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

interface GuidedTutorialProps {
  firstName: string;
}

export function GuidedTutorial({ firstName }: GuidedTutorialProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Gate: only show once per session, respect reduced motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY) === "true") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem(SESSION_KEY, "true");
      markTutorialComplete();
      return;
    }

    // Wait for greeting splash to finish (1.8s reveal + 0.6s exit = ~2.5s)
    const timer = setTimeout(() => setVisible(true), 2600);
    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll while visible
  useEffect(() => {
    if (!visible || exiting) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible, exiting]);

  const dismiss = useCallback(async () => {
    setExiting(true);
    sessionStorage.setItem(SESSION_KEY, "true");
    await markTutorialComplete();
  }, []);

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }, [step, dismiss]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  const handleSkip = useCallback(() => {
    dismiss();
  }, [dismiss]);

  const handleAction = useCallback(
    (href: string) => {
      dismiss().then(() => router.push(href));
    },
    [dismiss, router],
  );

  const handleExitComplete = useCallback(() => {
    setVisible(false);
  }, []);

  if (!visible) return null;

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {!exiting && (
        <motion.div
          key="tutorial-overlay"
          className="fixed inset-0 z-[90] flex flex-col bg-cream"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <TutorialProgress
              currentStep={step}
              totalSteps={STEPS.length}
            />
            <button
              onClick={handleSkip}
              className="text-xs font-medium text-text-muted transition-colors hover:text-ink"
            >
              Skip tutorial
            </button>
          </div>

          {/* Content area */}
          <div className="flex flex-1 items-center justify-center overflow-hidden px-5 sm:px-8">
            <div className="w-full max-w-lg">
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
                  <StepContent step={currentStep} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom navigation */}
          <div className="border-t border-border-subtle bg-surface/50 px-5 py-4 sm:px-8">
            <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
              {/* Back button */}
              <div className="w-20">
                {step > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Step counter */}
              <span className="text-xs text-text-muted">
                {step + 1} of {STEPS.length}
              </span>

              {/* Next / action area */}
              <div className="flex items-center gap-2">
                {currentStep.action && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAction(currentStep.action!.href)}
                  >
                    {currentStep.action.label}
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                >
                  {isLastStep ? "Get started" : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
