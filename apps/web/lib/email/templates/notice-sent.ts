import { emailLayout } from "./layout";
import type { EmailResult } from "../types";

interface NoticeSentToRecipientParams {
  recipientName: string;
  recipientBusiness: string;
  senderName: string;
  senderBusiness: string;
  noticeType: string;
  subject: string;
  requiredAction?: string;
  responseDeadline?: string;
  viewUrl: string;
}

const NOTICE_TYPE_LABELS: Record<string, string> = {
  breach: "Breach of contract notice",
  termination: "Termination notice",
  demand: "Formal demand",
  warning: "Warning notice",
  general: "Formal notice",
};

/**
 * Email sent to the RECIPIENT of a formal notice.
 *
 * Tone: formal, serious, respectful. The recipient needs to understand
 * they have received a formal communication that may require action.
 */
export function noticeSentToRecipientEmail(params: NoticeSentToRecipientParams): EmailResult {
  const {
    recipientName,
    senderName,
    senderBusiness,
    noticeType,
    subject,
    requiredAction,
    responseDeadline,
    viewUrl,
  } = params;

  const typeLabel = NOTICE_TYPE_LABELS[noticeType] || "Formal notice";

  const actionRow = requiredAction
    ? `<tr>
        <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Action required</td>
        <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${requiredAction}</td>
      </tr>`
    : "";

  const deadlineRow = responseDeadline
    ? `<tr>
        <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Respond by</td>
        <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right; font-weight: 600;">${responseDeadline}</td>
      </tr>`
    : "";

  const content = `
    <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
    <p style="margin: 0 0 20px 0;">
      You have received a formal notice from
      <strong style="color: #0C1311;">${senderName}</strong>
      of <strong style="color: #0C1311;">${senderBusiness}</strong>
      via Kestrel.
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
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Type</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right; font-weight: 600;">${typeLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Subject</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">From</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${senderName}, ${senderBusiness}</td>
            </tr>
            ${actionRow}
            ${deadlineRow}
          </table>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 20px 0;">
      This notice has been recorded on the Kestrel platform with a verifiable
      timestamp. You can view the full notice, including any relevant clauses
      and required actions, using the link below.
    </p>

    <p style="margin: 0 0 8px 0; font-size: 13px; color: #7A8583;">
      This link is unique to this notice. Keep it for your records.
    </p>
  `;

  return {
    subject: `Formal notice received: ${subject}`,
    html: emailLayout({
      title: "You have received a formal notice",
      preheader: `${senderName} of ${senderBusiness} has sent you a ${typeLabel.toLowerCase()} regarding: ${subject}`,
      content,
      ctaText: "View notice",
      ctaUrl: viewUrl,
    }),
  };
}

// ── Sender confirmation ──────────────────────────────────────────────────────

interface NoticeSentConfirmationParams {
  senderName: string;
  recipientName: string;
  recipientBusiness: string;
  recipientEmail: string;
  noticeType: string;
  subject: string;
  viewUrl: string;
}

/**
 * Email sent to the SENDER confirming their notice was dispatched.
 */
export function noticeSentConfirmationEmail(params: NoticeSentConfirmationParams): EmailResult {
  const {
    senderName,
    recipientName,
    recipientBusiness,
    recipientEmail,
    noticeType,
    subject,
    viewUrl,
  } = params;

  const typeLabel = NOTICE_TYPE_LABELS[noticeType] || "Formal notice";

  const content = `
    <p style="margin: 0 0 16px 0;">Dear ${senderName},</p>
    <p style="margin: 0 0 20px 0;">
      Your notice has been sent and recorded on the Kestrel platform. The details
      are set out below for your records.
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
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Type</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right; font-weight: 600;">${typeLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Subject</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Sent to</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${recipientName}, ${recipientBusiness}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Email</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${recipientEmail}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 8px 0;">
      You can view and track this notice at any time from your notice log.
    </p>
  `;

  return {
    subject: `Notice sent: ${subject}`,
    html: emailLayout({
      title: "Your notice has been sent",
      preheader: `Your ${typeLabel.toLowerCase()} to ${recipientName} of ${recipientBusiness} has been dispatched`,
      content,
      ctaText: "View notice",
      ctaUrl: viewUrl,
    }),
  };
}
