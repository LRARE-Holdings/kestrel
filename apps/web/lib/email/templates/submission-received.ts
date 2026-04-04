import { emailLayout } from "./layout";
import { SITE_URL } from "@kestrel/shared/constants";
import type { EmailResult } from "../types";

interface SubmissionReceivedParams {
  recipientName: string;
  submitterName: string;
  referenceNumber: string;
  disputeId: string;
  submissionType: string;
}

const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  initial_claim: "initial claim",
  response: "response",
  reply: "reply",
  evidence_summary: "evidence summary",
  proposal: "settlement proposal",
  acceptance: "acceptance",
  rejection: "rejection",
  withdrawal: "withdrawal notice",
};

/**
 * Email sent to the OTHER party when a new submission is added to a dispute.
 */
export function submissionReceivedEmail(
  params: SubmissionReceivedParams,
): EmailResult {
  const {
    recipientName,
    submitterName,
    referenceNumber,
    disputeId,
    submissionType,
  } = params;

  const typeLabel =
    SUBMISSION_TYPE_LABELS[submissionType] || submissionType.replace(/_/g, " ");

  const content = `
    <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
    <p style="margin: 0 0 20px 0;">
      <strong style="color: #0C1311;">${submitterName}</strong> has submitted
      a new <strong style="color: #0C1311;">${typeLabel}</strong> on dispute
      <strong style="color: #0C1311;">${referenceNumber}</strong>.
    </p>
    <p style="margin: 0 0 8px 0;">
      Please review the submission at your earliest convenience. Timely engagement
      helps move the process forward for both parties.
    </p>
  `;

  return {
    subject: `New ${typeLabel} on ${referenceNumber}`,
    html: emailLayout({
      title: `New ${typeLabel} received`,
      preheader: `${submitterName} has submitted a ${typeLabel} on dispute ${referenceNumber}`,
      content,
      ctaText: "View dispute",
      ctaUrl: `${SITE_URL}/disputes/${disputeId}`,
    }),
  };
}
