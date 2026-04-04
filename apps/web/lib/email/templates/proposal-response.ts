import { emailLayout } from "./layout";
import { SITE_URL } from "@kestrel/shared/constants";
import type { EmailResult } from "../types";

interface ProposalResponseParams {
  recipientName: string;
  responderName: string;
  referenceNumber: string;
  disputeId: string;
  accepted: boolean;
}

/**
 * Email sent when a settlement proposal is accepted or rejected.
 */
export function proposalResponseEmail(
  params: ProposalResponseParams,
): EmailResult {
  const { recipientName, responderName, referenceNumber, disputeId, accepted } =
    params;

  const outcome = accepted ? "accepted" : "rejected";

  const acceptedContent = `
    <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
    <p style="margin: 0 0 20px 0;">
      <strong style="color: #0C1311;">${responderName}</strong> has
      <strong style="color: #2B5C4F;">accepted</strong> your settlement proposal
      on dispute <strong style="color: #0C1311;">${referenceNumber}</strong>.
    </p>
    <p style="margin: 0 0 8px 0;">
      Both parties are now in agreement. You can view the resolution details
      and any next steps on the dispute page.
    </p>
  `;

  const rejectedContent = `
    <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
    <p style="margin: 0 0 20px 0;">
      <strong style="color: #0C1311;">${responderName}</strong> has
      <strong style="color: #B54444;">declined</strong> your settlement proposal
      on dispute <strong style="color: #0C1311;">${referenceNumber}</strong>.
    </p>
    <p style="margin: 0 0 8px 0;">
      You may submit a revised proposal or continue the dispute process.
      The dispute remains active and both parties can continue communicating
      through the platform.
    </p>
  `;

  return {
    subject: `Your proposal was ${outcome}: ${referenceNumber}`,
    html: emailLayout({
      title: `Proposal ${outcome}`,
      preheader: `${responderName} has ${outcome} your settlement proposal on dispute ${referenceNumber}`,
      content: accepted ? acceptedContent : rejectedContent,
      ctaText: "View dispute",
      ctaUrl: `${SITE_URL}/disputes/${disputeId}`,
    }),
  };
}
