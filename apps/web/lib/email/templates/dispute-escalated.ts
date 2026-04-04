import { emailLayout } from "./layout";
import type { EmailResult } from "../types";

interface DisputeEscalatedParams {
  recipientName: string;
  escalatorName: string;
  referenceNumber: string;
  disputeId: string;
  reason: string;
}

/**
 * Email sent to BOTH parties when a dispute is escalated.
 *
 * Since there is no mediator marketplace yet, the email explains that
 * the dispute could not be resolved on-platform and recommends
 * seeking professional mediation or legal advice externally.
 */
export function disputeEscalatedEmail(
  params: DisputeEscalatedParams,
): EmailResult {
  const { recipientName, escalatorName, referenceNumber, disputeId, reason } =
    params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kestrel.law";

  const content = `
    <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
    <p style="margin: 0 0 20px 0;">
      Dispute <strong style="color: #0C1311;">${referenceNumber}</strong> has been
      <strong style="color: #B54444;">escalated</strong> by ${escalatorName}.
    </p>

    <!-- Reason card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="
      background-color: #F6F3EE;
      border-radius: 8px;
      margin: 8px 0 20px 0;
      border-left: 3px solid #B54444;
    ">
      <tr>
        <td style="padding: 20px 24px;">
          <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #7A8583; text-transform: uppercase; letter-spacing: 0.05em;">Reason for escalation</p>
          <p style="margin: 0; font-size: 14px; color: #0C1311; line-height: 1.5;">${reason}</p>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 8px 0;">
      This means the dispute could not be resolved through direct communication
      on the platform. All submissions and evidence remain available for your records.
    </p>

    <p style="margin: 0 0 8px 0;">
      <strong style="color: #0C1311;">What happens next?</strong>
    </p>
    <p style="margin: 0 0 8px 0;">
      We recommend seeking professional mediation or legal advice to resolve this
      matter. You may wish to contact a mediator accredited by the Civil Mediation
      Council or consult a solicitor. A full record of this dispute is available
      on the platform for your reference.
    </p>
  `;

  return {
    subject: `Dispute escalated: ${referenceNumber}`,
    html: emailLayout({
      title: "Dispute escalated",
      preheader: `Dispute ${referenceNumber} has been escalated`,
      content,
      ctaText: "View dispute",
      ctaUrl: `${siteUrl}/disputes/${disputeId}`,
    }),
  };
}
