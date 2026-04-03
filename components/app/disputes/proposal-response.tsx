"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconCheck, IconX } from "@/components/ui/icons";
import { addSubmission } from "@/lib/disputes/actions";
import type { SubmissionWithAuthor } from "@/lib/disputes/types";

interface ProposalResponseProps {
  proposalSubmission: SubmissionWithAuthor;
  disputeId: string;
  onResponded?: () => void;
}

export function ProposalResponse({
  proposalSubmission,
  disputeId,
  onResponded,
}: ProposalResponseProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const metadata = proposalSubmission.metadata as Record<string, unknown> | null;
  const proposedAmount = metadata?.proposed_amount as number | undefined;
  const proposedTerms = metadata?.proposed_terms as string | undefined;

  async function handleAccept() {
    setIsSubmitting(true);
    setError(null);

    const result = await addSubmission({
      dispute_id: disputeId,
      submission_type: "acceptance",
      content: "Proposal accepted.",
      metadata: {
        proposal_submission_id: proposalSubmission.id,
      },
    });

    if ("error" in result) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onResponded?.();
  }

  async function handleReject() {
    if (!rejectionReason.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const result = await addSubmission({
      dispute_id: disputeId,
      submission_type: "rejection",
      content: rejectionReason.trim(),
      metadata: {
        proposal_submission_id: proposalSubmission.id,
      },
    });

    if ("error" in result) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onResponded?.();
  }

  return (
    <Card className="border-warm/50 bg-warm/5">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="warm">Settlement proposal</Badge>
          <span className="text-xs text-text-muted">
            from {proposalSubmission.author?.display_name ?? "Unknown"}
          </span>
        </div>

        {/* Proposal details */}
        <div className="space-y-2">
          {proposedAmount != null && (
            <div>
              <span className="text-xs text-text-muted">Proposed amount</span>
              <p className="text-sm font-medium text-ink">
                {new Intl.NumberFormat("en-GB", {
                  style: "currency",
                  currency: "GBP",
                }).format(proposedAmount)}
              </p>
            </div>
          )}
          {proposedTerms && (
            <div>
              <span className="text-xs text-text-muted">Proposed terms</span>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">
                {proposedTerms}
              </p>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-error">{error}</p>}

        {/* Action buttons */}
        {!showRejectForm ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAccept}
              disabled={isSubmitting}
              className="gap-1.5 bg-sage hover:bg-sage/90"
            >
              <IconCheck className="h-3.5 w-3.5" />
              Accept
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowRejectForm(true)}
              disabled={isSubmitting}
              className="gap-1.5"
            >
              <IconX className="h-3.5 w-3.5" />
              Reject
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              label="Reason for rejection"
              placeholder="Explain why you are rejecting this proposal..."
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleReject}
                disabled={isSubmitting || !rejectionReason.trim()}
                className="gap-1.5 bg-error hover:bg-error/90"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <IconX className="h-3.5 w-3.5" />
                    Reject proposal
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
