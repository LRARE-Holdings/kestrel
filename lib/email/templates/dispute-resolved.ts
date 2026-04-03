import { emailLayout } from "./layout";
import type { EmailResult } from "../types";

interface DisputeResolvedParams {
  recipientName: string;
  referenceNumber: string;
  disputeId: string;
  resolutionSummary?: string;
}

/**
 * Email sent to both parties when a dispute is resolved.
 */
export function disputeResolvedEmail(
  params: DisputeResolvedParams,
): EmailResult {
  const { recipientName, referenceNumber, disputeId, resolutionSummary } =
    params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kestrel.law";

  const summaryBlock = resolutionSummary
    ? `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="
        background-color: #F6F3EE;
        border-radius: 8px;
        margin: 8px 0 20px 0;
        border-left: 3px solid #7FA691;
      ">
        <tr>
          <td style="padding: 20px 24px;">
            <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #7A8583; text-transform: uppercase; letter-spacing: 0.05em;">Resolution summary</p>
            <p style="margin: 0; font-size: 14px; color: #0C1311; line-height: 1.5;">${resolutionSummary}</p>
          </td>
        </tr>
      </table>`
    : "";

  const content = `
    <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
    <p style="margin: 0 0 20px 0;">
      Dispute <strong style="color: #0C1311;">${referenceNumber}</strong> has
      been <strong style="color: #2B5C4F;">resolved</strong>.
    </p>
    ${summaryBlock}
    <p style="margin: 0 0 8px 0;">
      A record of this dispute and its resolution is available on the platform
      for your reference. Thank you for using Kestrel to resolve this matter.
    </p>
  `;

  return {
    subject: `Dispute resolved: ${referenceNumber}`,
    html: emailLayout({
      title: "Dispute resolved",
      preheader: `Dispute ${referenceNumber} has been resolved`,
      content,
      ctaText: "View resolution",
      ctaUrl: `${siteUrl}/disputes/${disputeId}`,
    }),
  };
}
