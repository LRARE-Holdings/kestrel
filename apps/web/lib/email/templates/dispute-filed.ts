import { emailLayout } from "./layout";
import type { EmailResult } from "../types";

interface DisputeFiledParams {
  respondentName: string;
  respondentBusiness: string;
  initiatorName: string;
  initiatorBusiness: string;
  referenceNumber: string;
  disputeId: string;
  subject: string;
  disputeType: string;
  amount?: string;
  responseDeadline: string;
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
 *
 * Tone: formal, respectful, neutral. Conveys the seriousness and
 * legitimacy of the process without being accusatory, threatening, or
 * alarmist. The respondent is being informed, not blamed.
 */
export function disputeFiledEmail(params: DisputeFiledParams): EmailResult {
  const {
    respondentName,
    respondentBusiness,
    initiatorName,
    initiatorBusiness,
    referenceNumber,
    disputeId,
    subject,
    disputeType,
    amount,
    responseDeadline,
  } = params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kestrel.law";
  const typeLabel = DISPUTE_TYPE_LABELS[disputeType] || "Dispute";

  const amountRow = amount
    ? `
      <tr>
        <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Amount in dispute</td>
        <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${amount}</td>
      </tr>`
    : "";

  const content = `
    <p style="margin: 0 0 16px 0;">Dear ${respondentName},</p>
    <p style="margin: 0 0 20px 0;">
      <strong style="color: #0C1311;">${initiatorName}</strong>
      of <strong style="color: #0C1311;">${initiatorBusiness}</strong>
      has raised a formal dispute through Kestrel, an independent dispute
      resolution platform. The details are set out below.
    </p>

    <!-- Details card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="
      background-color: #F6F3EE;
      border-radius: 8px;
      margin: 8px 0 24px 0;
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
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Filed by</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${initiatorName}, ${initiatorBusiness}</td>
            </tr>
            ${amountRow}
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Response requested by</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right; font-weight: 600;">${responseDeadline}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 20px 0;">
      Kestrel provides a structured, impartial process for both parties
      to present their position and work towards a resolution. You are
      encouraged to review the full details and submit your response at
      your earliest convenience.
    </p>

    <p style="margin: 0 0 12px 0; font-weight: 600; color: #0C1311;">How to respond</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 4px 0; font-size: 14px; color: #4A5553; line-height: 1.6;">
          1.&nbsp;&nbsp;Sign in or create a Kestrel account using this email address.
        </td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 14px; color: #4A5553; line-height: 1.6;">
          2.&nbsp;&nbsp;Review the claim and any supporting evidence.
        </td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 14px; color: #4A5553; line-height: 1.6;">
          3.&nbsp;&nbsp;Submit your response with your account of the matter.
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 8px 0;">
      If you have any questions about this process, our
      <a href="${siteUrl}/contact" style="color: #2B5C4F; text-decoration: underline;">support team</a>
      is available to help. Kestrel does not take sides — we facilitate
      fair resolution between both parties.
    </p>
  `;

  return {
    subject: `A dispute has been raised: ${referenceNumber}`,
    html: emailLayout({
      title: "You have received a dispute",
      preheader: `${initiatorName} of ${initiatorBusiness} has filed a ${typeLabel.toLowerCase()} — reference ${referenceNumber}`,
      content,
      ctaText: "Review and respond",
      ctaUrl: `${siteUrl}/sign-in?redirect=/disputes/${encodeURIComponent(disputeId)}`,
    }),
  };
}
