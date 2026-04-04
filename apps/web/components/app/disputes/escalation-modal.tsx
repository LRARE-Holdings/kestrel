"use client";

import { useState, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { escalateDispute } from "@/lib/disputes/actions";
import { IconAlertTriangle } from "@/components/ui/icons";

interface EscalationModalProps {
  open: boolean;
  onClose: () => void;
  disputeId: string;
  referenceNumber: string;
  onEscalated: () => void;
}

export function EscalationModal({
  open,
  onClose,
  disputeId,
  referenceNumber,
  onEscalated,
}: EscalationModalProps) {
  const [reason, setReason] = useState("");
  const [confirmWord, setConfirmWord] = useState("");
  const [confirmRef, setConfirmRef] = useState("");
  const [step, setStep] = useState<"reason" | "confirm">("reason");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordMatch = confirmWord.trim().toLowerCase() === "escalate";
  const refMatch = confirmRef.trim().toUpperCase() === referenceNumber.toUpperCase();
  const confirmValid = wordMatch && refMatch;

  const handleClose = useCallback(() => {
    if (submitting) return;
    setReason("");
    setConfirmWord("");
    setConfirmRef("");
    setStep("reason");
    setError(null);
    onClose();
  }, [submitting, onClose]);

  const handleContinue = useCallback(() => {
    if (reason.trim().length < 20) {
      setError("Please provide at least 20 characters explaining why you are escalating.");
      return;
    }
    setError(null);
    setConfirmWord("");
    setConfirmRef("");
    setStep("confirm");
  }, [reason]);

  const handleBack = useCallback(() => {
    setStep("reason");
    setConfirmWord("");
    setConfirmRef("");
    setError(null);
  }, []);

  const handleEscalate = useCallback(async () => {
    if (!confirmValid) return;

    setSubmitting(true);
    setError(null);

    const result = await escalateDispute({
      dispute_id: disputeId,
      reason: reason.trim(),
    });

    setSubmitting(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setReason("");
    setConfirmWord("");
    setConfirmRef("");
    setStep("reason");
    onEscalated();
    onClose();
  }, [confirmValid, disputeId, reason, onEscalated, onClose]);

  return (
    <Modal open={open} onClose={handleClose} title="Escalate dispute">
      {step === "reason" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-warning/30 bg-warning/5 p-3">
            <IconAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
            <p className="text-sm text-text-secondary">
              Escalation means this dispute could not be resolved through direct
              communication on Kestrel. This action is permanent and cannot be
              undone. Both parties will be notified.
            </p>
          </div>

          <div>
            <label
              htmlFor="escalation-reason"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Why are you escalating?
            </label>
            <textarea
              id="escalation-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this dispute cannot be resolved through direct communication on the platform..."
              rows={4}
              maxLength={2000}
              className="w-full resize-none rounded-[var(--radius-md)] border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-text-muted focus:border-kestrel focus:outline-none focus:ring-2 focus:ring-kestrel/20"
            />
            <p className="mt-1 text-xs text-text-muted">
              {reason.length}/2,000 characters (minimum 20)
            </p>
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleContinue}
              disabled={reason.trim().length < 20}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            You are about to escalate dispute{" "}
            <span className="font-mono font-medium text-ink">
              {referenceNumber}
            </span>
            . This action is <strong className="text-error">permanent</strong>.
          </p>

          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-error" />
              The dispute status will change to <strong className="text-ink">Escalated</strong> permanently
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-error" />
              Both parties will be notified by email
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-error" />
              No further submissions can be made on this dispute
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-error" />
              Both parties should seek professional mediation or legal advice
            </li>
          </ul>

          <div className="rounded-[var(--radius-md)] border border-border-subtle bg-cream p-3">
            <p className="mb-1 text-xs font-medium text-text-muted uppercase tracking-wider">
              Your reason
            </p>
            <p className="text-sm text-ink leading-relaxed">{reason}</p>
          </div>

          {/* Verification: type "escalate" */}
          <div>
            <label
              htmlFor="confirm-escalate"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Type <span className="font-mono font-semibold text-error">escalate</span> to confirm
            </label>
            <input
              id="confirm-escalate"
              type="text"
              value={confirmWord}
              onChange={(e) => setConfirmWord(e.target.value)}
              placeholder="escalate"
              autoComplete="off"
              spellCheck={false}
              className={`w-full rounded-[var(--radius-md)] border px-3 py-2 font-mono text-sm text-ink placeholder:text-text-muted focus:outline-none focus:ring-2 ${
                confirmWord.length > 0 && !wordMatch
                  ? "border-error/50 focus:border-error focus:ring-error/20"
                  : "border-border focus:border-kestrel focus:ring-kestrel/20"
              }`}
            />
          </div>

          {/* Verification: type dispute reference */}
          <div>
            <label
              htmlFor="confirm-reference"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Type the dispute reference{" "}
              <span className="font-mono font-semibold text-error">
                {referenceNumber}
              </span>
            </label>
            <input
              id="confirm-reference"
              type="text"
              value={confirmRef}
              onChange={(e) => setConfirmRef(e.target.value)}
              placeholder={referenceNumber}
              autoComplete="off"
              spellCheck={false}
              className={`w-full rounded-[var(--radius-md)] border px-3 py-2 font-mono text-sm text-ink placeholder:text-text-muted focus:outline-none focus:ring-2 ${
                confirmRef.length > 0 && !refMatch
                  ? "border-error/50 focus:border-error focus:ring-error/20"
                  : "border-border focus:border-kestrel focus:ring-kestrel/20"
              }`}
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleBack}
              disabled={submitting}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleEscalate}
              disabled={!confirmValid || submitting}
              className="gap-1.5"
            >
              {submitting ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Escalating...
                </>
              ) : (
                <>
                  <IconAlertTriangle className="h-3.5 w-3.5" />
                  Confirm escalation
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
