import { emailLayout } from "./layout";
import { SITE_URL } from "@kestrel/shared/constants";
import type { EmailResult } from "../types";

interface DisputeInitiatedParams {
  initiatorName: string;
  respondentName: string;
  respondentBusiness: string;
  referenceNumber: string;
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
 * Email sent to the INITIATING party confirming their dispute has been filed.
 *
 * Tone: confirming, composed, clear on next steps. Acknowledges the
 * significance of filing without dramatising it. Reassures the initiator
 * that the process is structured and fair.
 */
export function disputeInitiatedEmail(
  params: DisputeInitiatedParams,
): EmailResult {
  const {
    initiatorName,
    respondentName,
    respondentBusiness,
    referenceNumber,
    subject,
    disputeType,
    amount,
    responseDeadline,
  } = params;

  const typeLabel = DISPUTE_TYPE_LABELS[disputeType] || "Dispute";

  const amountRow = amount
    ? `
      <tr>
        <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Amount in dispute</td>
        <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${amount}</td>
      </tr>`
    : "";

  const content = `
    <p style="margin: 0 0 16px 0;">Dear ${initiatorName},</p>
    <p style="margin: 0 0 20px 0;">
      Your dispute has been filed successfully. A notification has been sent to
      <strong style="color: #0C1311;">${respondentName}</strong>
      of <strong style="color: #0C1311;">${respondentBusiness}</strong>,
      inviting them to review the matter and respond through Kestrel.
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
            ${amountRow}
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Response due by</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${responseDeadline}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 12px 0; font-weight: 600; color: #0C1311;">What happens next</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 4px 0; font-size: 14px; color: #4A5553; line-height: 1.6;">
          1.&nbsp;&nbsp;${respondentName} has been sent a formal dispute notice with 14 days to respond.
        </td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 14px; color: #4A5553; line-height: 1.6;">
          2.&nbsp;&nbsp;You will be notified as soon as they respond, or if the deadline passes without engagement.
        </td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 14px; color: #4A5553; line-height: 1.6;">
          3.&nbsp;&nbsp;Once they join, both parties can submit evidence and settlement proposals at any stage.
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 12px 0; font-weight: 600; color: #0C1311;">What ${respondentName} has been told</p>
    <p style="margin: 0 0 16px 0;">
      ${respondentName} has been informed that responding costs
      <strong style="color: #0C1311;">£35</strong>, and that the fee is
      refunded in full if the dispute is resolved within 14 days of their
      joining. They have also been told that ignoring the notice will be
      recorded as
      <em>&ldquo;respondent did not engage&rdquo;</em> &mdash; a record
      that can be used as evidence of attempted resolution before any
      further action, including Small Claims Court.
    </p>
    <p style="margin: 0 0 24px 0;">
      This is deliberate. The structure rewards good-faith engagement and
      makes non-engagement costly &mdash; so most respondents join.
    </p>

    <p style="margin: 0 0 8px 0;">
      You can view your dispute, upload evidence, and track progress from
      your dashboard. Please keep your reference number for your records.
    </p>
  `;

  return {
    subject: `Dispute filed: ${referenceNumber}`,
    html: emailLayout({
      title: "Your dispute has been filed",
      preheader: `Reference ${referenceNumber} — your ${typeLabel.toLowerCase()} has been submitted and the other party has been notified`,
      content,
      ctaText: "View your dispute",
      ctaUrl: `${SITE_URL}/disputes`,
    }),
  };
}
