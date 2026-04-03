import { emailLayout } from "./layout";
import type { EmailResult } from "../types";

interface ProposalReceivedParams {
  recipientName: string;
  proposerName: string;
  referenceNumber: string;
  disputeId: string;
}

/**
 * Email sent when a settlement proposal is made by the other party.
 */
export function proposalReceivedEmail(
  params: ProposalReceivedParams,
): EmailResult {
  const { recipientName, proposerName, referenceNumber, disputeId } = params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kestrel.law";

  const content = `
    <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
    <p style="margin: 0 0 20px 0;">
      <strong style="color: #0C1311;">${proposerName}</strong> has submitted
      a settlement proposal on dispute
      <strong style="color: #0C1311;">${referenceNumber}</strong>.
    </p>
    <p style="margin: 0 0 8px 0;">
      Please review the proposal carefully. You can accept, reject, or submit
      a counter-proposal through the platform. Reaching an agreement at this
      stage avoids the need for further escalation.
    </p>
  `;

  return {
    subject: `Settlement proposal on ${referenceNumber}`,
    html: emailLayout({
      title: "Settlement proposal received",
      preheader: `${proposerName} has proposed a settlement on dispute ${referenceNumber}`,
      content,
      ctaText: "Review proposal",
      ctaUrl: `${siteUrl}/disputes/${disputeId}`,
    }),
  };
}
