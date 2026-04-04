import { emailLayout } from "./layout";
import type { EmailResult } from "../types";

interface DisputeWithdrawnParams {
  recipientName: string;
  initiatorName: string;
  initiatorBusiness: string;
  referenceNumber: string;
  disputeId: string;
}

/**
 * Email sent to the RESPONDING party when the initiating party
 * withdraws a dispute.
 *
 * Tone: neutral, factual. Simply informs that the dispute has been
 * withdrawn — no judgement, no celebration.
 */
export function disputeWithdrawnEmail(params: DisputeWithdrawnParams): EmailResult {
  const {
    recipientName,
    initiatorName,
    initiatorBusiness,
    referenceNumber,
    disputeId,
  } = params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kestrel.law";

  const content = `
    <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
    <p style="margin: 0 0 20px 0;">
      <strong style="color: #0C1311;">${initiatorName}</strong>
      of <strong style="color: #0C1311;">${initiatorBusiness}</strong>
      has withdrawn dispute
      <strong style="color: #0C1311;">${referenceNumber}</strong>.
    </p>

    <p style="margin: 0 0 20px 0;">
      No further action is required from you. A record of this dispute and
      its withdrawal is retained on the platform for your reference.
    </p>

    <p style="margin: 0 0 8px 0; font-size: 13px; color: #7A8583;">
      If you believe this withdrawal is in error, or if you have any
      questions, please contact our support team.
    </p>
  `;

  return {
    subject: `Dispute withdrawn: ${referenceNumber}`,
    html: emailLayout({
      title: "Dispute withdrawn",
      preheader: `${initiatorName} has withdrawn dispute ${referenceNumber}`,
      content,
      ctaText: "View dispute",
      ctaUrl: `${siteUrl}/disputes/${disputeId}`,
    }),
  };
}
