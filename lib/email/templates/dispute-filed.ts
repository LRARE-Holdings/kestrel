import { emailLayout } from "./layout";
import type { EmailResult } from "../types";

interface DisputeFiledParams {
  respondentName: string;
  initiatorName: string;
  initiatorBusiness: string;
  referenceNumber: string;
  subject: string;
  disputeType: string;
  amount?: string;
}

const DISPUTE_TYPE_LABELS: Record<string, string> = {
  payment: "Payment dispute",
  deliverables: "Deliverables dispute",
  service_quality: "Service quality dispute",
  contract_interpretation: "Contract interpretation dispute",
  other: "General dispute",
};

/**
 * Email sent to the RESPONDING party when a dispute is filed against them.
 * Tone: professional, calm, informative. Not accusatory or alarming.
 */
export function disputeFiledEmail(params: DisputeFiledParams): EmailResult {
  const {
    respondentName,
    initiatorName,
    initiatorBusiness,
    referenceNumber,
    subject,
    disputeType,
    amount,
  } = params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kestrel.law";
  const typeLabel = DISPUTE_TYPE_LABELS[disputeType] || "Dispute";

  const amountRow = amount
    ? `
      <tr>
        <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Amount</td>
        <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${amount}</td>
      </tr>`
    : "";

  const content = `
    <p style="margin: 0 0 16px 0;">Dear ${respondentName},</p>
    <p style="margin: 0 0 20px 0;">
      A dispute has been filed on Kestrel by <strong style="color: #0C1311;">${initiatorName}</strong>
      of <strong style="color: #0C1311;">${initiatorBusiness}</strong>.
      This is a structured communication process designed to help both parties reach a resolution
      efficiently and fairly.
    </p>

    <!-- Details card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="
      background-color: #F6F3EE;
      border-radius: 8px;
      margin: 8px 0 20px 0;
    ">
      <tr>
        <td style="padding: 20px 24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Reference</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right; font-weight: 600;">${referenceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Subject</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Type</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${typeLabel}</td>
            </tr>
            ${amountRow}
          </table>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 8px 0;">
      Please sign in to Kestrel to review the details and respond.
      Early engagement typically leads to faster, more favourable outcomes for both parties.
    </p>
  `;

  return {
    subject: `A dispute has been filed: ${subject}`,
    html: emailLayout({
      title: "A dispute has been filed",
      preheader: `${initiatorName} of ${initiatorBusiness} has filed a ${typeLabel.toLowerCase()} (${referenceNumber})`,
      content,
      ctaText: "View on Kestrel",
      ctaUrl: `${siteUrl}/sign-in`,
    }),
  };
}
