"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RealtimeProvider } from "@/components/app/disputes/realtime-provider";
import { DisputeStatusBar } from "@/components/app/disputes/dispute-status-bar";
import { DisputeMetadata } from "@/components/app/disputes/dispute-metadata";
import { SubmissionTimeline } from "@/components/app/disputes/submission-timeline";
import { SubmissionForm } from "@/components/app/disputes/submission-form";
import { ActionPanel } from "@/components/app/disputes/action-panel";
import { EvidencePanel } from "@/components/app/disputes/evidence-panel";
import { ProposalResponse } from "@/components/app/disputes/proposal-response";
import { ProposalForm } from "@/components/app/disputes/proposal-form";
import { IconChevronLeft } from "@/components/ui/icons";
import type {
  DisputeWithParties,
  SubmissionWithAuthor,
  EvidenceFileWithMeta,
  UserRole,
  SubmissionType,
} from "@/lib/disputes/types";

interface DisputeDetailProps {
  dispute: DisputeWithParties;
  submissions: SubmissionWithAuthor[];
  evidenceFiles: EvidenceFileWithMeta[];
  userRole: UserRole;
  currentUserId: string;
  mediatorMarketplaceEnabled: boolean;
}

function getAllowedSubmissionTypes(
  status: string,
  role: UserRole
): SubmissionType[] {
  const types: SubmissionType[] = [];

  if (
    role === "responding" &&
    (status === "filed" || status === "awaiting_response")
  ) {
    types.push("response");
  }

  if (status === "in_progress") {
    types.push("reply");
  }

  return types;
}

export function DisputeDetail({
  dispute,
  submissions,
  evidenceFiles,
  userRole,
  currentUserId,
  mediatorMarketplaceEnabled,
}: DisputeDetailProps) {
  const router = useRouter();
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleAction = useCallback(
    (action: string) => {
      switch (action) {
        case "respond":
        case "reply":
          setShowSubmissionForm(true);
          setShowProposalForm(false);
          break;
        case "propose_settlement":
          setShowProposalForm(true);
          setShowSubmissionForm(false);
          break;
        case "upload_evidence":
          // In a full implementation, this would open a modal or navigate
          // For now, scroll to evidence panel or show a form
          break;
        case "escalate":
          // Would open escalation modal
          break;
        case "withdraw":
          // Would open withdrawal confirmation modal
          break;
      }
    },
    []
  );

  // Find the latest pending proposal from the other party
  const pendingProposal = submissions
    .filter(
      (s) =>
        s.submission_type === "proposal" &&
        s.submitted_by !== currentUserId
    )
    .pop();

  // Check if the proposal has already been responded to
  const proposalResponded = pendingProposal
    ? submissions.some(
        (s) =>
          (s.submission_type === "acceptance" ||
            s.submission_type === "rejection") &&
          (s.metadata as Record<string, unknown> | null)
            ?.proposal_submission_id === pendingProposal.id
      )
    : false;

  const showProposalResponse =
    pendingProposal &&
    !proposalResponded &&
    dispute.status === "in_progress";

  const allowedTypes = getAllowedSubmissionTypes(dispute.status, userRole);

  return (
    <RealtimeProvider
      disputeId={dispute.id}
      onNewSubmission={handleRefresh}
      onNewEvidence={handleRefresh}
      onDisputeUpdate={handleRefresh}
    >
      <div className="space-y-6">
        {/* Back link */}
        <Link
          href="/disputes"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-ink transition-colors"
        >
          <IconChevronLeft className="h-4 w-4" />
          Back to disputes
        </Link>

        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl text-ink">
                {dispute.subject}
              </h1>
              <p className="mt-0.5 font-mono text-xs text-text-muted">
                {dispute.reference_number}
              </p>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <DisputeStatusBar status={dispute.status} />

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content (2/3) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Pending proposal response */}
            {showProposalResponse && pendingProposal && (
              <ProposalResponse
                proposalSubmission={pendingProposal}
                disputeId={dispute.id}
                onResponded={handleRefresh}
              />
            )}

            {/* Submission timeline */}
            <div>
              <h2 className="mb-4 text-sm font-medium text-ink">Timeline</h2>
              <SubmissionTimeline
                submissions={submissions}
                currentUserId={currentUserId}
                disputeRole={userRole}
              />
            </div>

            {/* Action panel */}
            <ActionPanel
              dispute={dispute}
              userRole={userRole}
              onAction={handleAction}
            />

            {/* Proposal form */}
            {showProposalForm && (
              <ProposalForm
                disputeId={dispute.id}
                onSubmitted={() => {
                  setShowProposalForm(false);
                  handleRefresh();
                }}
                onCancel={() => setShowProposalForm(false)}
              />
            )}

            {/* Submission form */}
            {(showSubmissionForm || allowedTypes.length > 0) &&
              !showProposalForm && (
                <SubmissionForm
                  disputeId={dispute.id}
                  allowedTypes={allowedTypes}
                  onSubmitted={handleRefresh}
                />
              )}
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            <DisputeMetadata dispute={dispute} />
            <EvidencePanel
              files={evidenceFiles}
              disputeId={dispute.id}
            />
          </div>
        </div>
      </div>
    </RealtimeProvider>
  );
}
