import { emailLayout } from "./layout";
import type { EmailResult } from "../types";

interface StatusChangedParams {
  recipientName: string;
  referenceNumber: string;
  disputeId: string;
  previousStatus: string;
  newStatus: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  filed: "Filed",
  awaiting_response: "Awaiting response",
  in_progress: "In progress",
  resolved: "Resolved",
  escalated: "Escalated",
  withdrawn: "Withdrawn",
  expired: "Expired",
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  filed:
    "The dispute has been formally filed. The responding party has been notified and invited to engage.",
  awaiting_response:
    "The dispute is awaiting a response from the other party. A response deadline has been set.",
  in_progress:
    "Both parties are actively engaged. Continue communicating through the platform to work towards a resolution.",
  resolved:
    "The dispute has been resolved. Both parties have agreed on an outcome.",
  escalated:
    "The dispute has been escalated to the next stage of the resolution process.",
  withdrawn:
    "The dispute has been withdrawn by the initiating party.",
  expired:
    "The response deadline has passed without a response. The dispute may be subject to escalation.",
};

/**
 * Email sent to BOTH parties when a dispute status changes.
 */
export function statusChangedEmail(params: StatusChangedParams): EmailResult {
  const {
    recipientName,
    referenceNumber,
    disputeId,
    previousStatus,
    newStatus,
  } = params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kestrel.law";
  const prevLabel = STATUS_LABELS[previousStatus] || previousStatus;
  const newLabel = STATUS_LABELS[newStatus] || newStatus;
  const description =
    STATUS_DESCRIPTIONS[newStatus] ||
    "The status of this dispute has been updated.";

  const content = `
    <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
    <p style="margin: 0 0 20px 0;">
      The status of dispute <strong style="color: #0C1311;">${referenceNumber}</strong>
      has changed.
    </p>

    <!-- Status change card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="
      background-color: #F6F3EE;
      border-radius: 8px;
      margin: 8px 0 20px 0;
    ">
      <tr>
        <td style="padding: 20px 24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 4px 0; font-size: 14px; color: #7A8583;">Previous status</td>
              <td style="padding: 4px 0; font-size: 14px; color: #0C1311; text-align: right;">${prevLabel}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 14px; color: #7A8583;">New status</td>
              <td style="padding: 4px 0; font-size: 14px; color: #0C1311; text-align: right; font-weight: 600;">${newLabel}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 8px 0;">
      ${description}
    </p>
  `;

  return {
    subject: `Dispute ${referenceNumber}: ${newLabel}`,
    html: emailLayout({
      title: `Status updated: ${newLabel}`,
      preheader: `Dispute ${referenceNumber} status changed from ${prevLabel} to ${newLabel}`,
      content,
      ctaText: "View dispute",
      ctaUrl: `${siteUrl}/disputes/${disputeId}`,
    }),
  };
}
