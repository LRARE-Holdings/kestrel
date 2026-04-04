import { emailLayout } from "./layout";
import { SITE_URL } from "@kestrel/shared/constants";
import type { EmailResult } from "../types";

interface DeadlineReminderParams {
  recipientName: string;
  referenceNumber: string;
  disputeId: string;
  daysRemaining: number; // 7, 3, 1, 0 (today), or -1 (overdue)
}

/**
 * Email sent for approaching or overdue response deadlines.
 * Urgency increases as the deadline approaches:
 * - 7 days: gentle reminder
 * - 3 days: moderate reminder
 * - 1 day: urgent reminder
 * - 0 days: deadline today
 * - -1 (or less): overdue
 */
export function deadlineReminderEmail(
  params: DeadlineReminderParams,
): EmailResult {
  const { recipientName, referenceNumber, disputeId, daysRemaining } = params;

  let subject: string;
  let title: string;
  let urgencyColor: string;
  let bodyText: string;

  if (daysRemaining <= -1) {
    // Overdue
    subject = `Response overdue: ${referenceNumber}`;
    title = "Response overdue";
    urgencyColor = "#B54444";
    bodyText = `
      <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
      <p style="margin: 0 0 20px 0;">
        The response deadline for dispute
        <strong style="color: #0C1311;">${referenceNumber}</strong> has passed.
      </p>
      <p style="margin: 0 0 20px 0; padding: 16px 20px; background-color: #FDF2F2; border-radius: 8px; border-left: 3px solid ${urgencyColor};">
        <strong style="color: ${urgencyColor};">Action required.</strong>
        Failure to respond may result in the dispute being escalated or resolved
        without your input.
      </p>
      <p style="margin: 0 0 8px 0;">
        Please respond as soon as possible. If you need additional time,
        communicate this through the platform.
      </p>
    `;
  } else if (daysRemaining === 0) {
    // Today
    subject = `Response deadline today: ${referenceNumber}`;
    title = "Response deadline is today";
    urgencyColor = "#B54444";
    bodyText = `
      <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
      <p style="margin: 0 0 20px 0;">
        The response deadline for dispute
        <strong style="color: #0C1311;">${referenceNumber}</strong> is
        <strong style="color: ${urgencyColor};">today</strong>.
      </p>
      <p style="margin: 0 0 8px 0;">
        Please submit your response before the end of the day to ensure your
        position is recorded. After the deadline, the dispute may be subject
        to escalation.
      </p>
    `;
  } else if (daysRemaining === 1) {
    // 1 day
    subject = `Response deadline tomorrow: ${referenceNumber}`;
    title = "Response deadline tomorrow";
    urgencyColor = "#C4943A";
    bodyText = `
      <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
      <p style="margin: 0 0 20px 0;">
        The response deadline for dispute
        <strong style="color: #0C1311;">${referenceNumber}</strong> is
        <strong style="color: ${urgencyColor};">tomorrow</strong>.
      </p>
      <p style="margin: 0 0 8px 0;">
        Please ensure your response is submitted before the deadline.
        Engaging promptly helps both parties reach a fair resolution.
      </p>
    `;
  } else if (daysRemaining <= 3) {
    // 3 days
    subject = `Response deadline in ${daysRemaining} days: ${referenceNumber}`;
    title = `Response deadline in ${daysRemaining} days`;
    urgencyColor = "#C4943A";
    bodyText = `
      <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
      <p style="margin: 0 0 20px 0;">
        This is a reminder that the response deadline for dispute
        <strong style="color: #0C1311;">${referenceNumber}</strong> is in
        <strong style="color: ${urgencyColor};">${daysRemaining} days</strong>.
      </p>
      <p style="margin: 0 0 8px 0;">
        If you have not already done so, please review the dispute and submit
        your response through the platform.
      </p>
    `;
  } else {
    // 7 days (or more)
    subject = `Response deadline in ${daysRemaining} days: ${referenceNumber}`;
    title = `Response deadline approaching`;
    urgencyColor = "#2B5C4F";
    bodyText = `
      <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
      <p style="margin: 0 0 20px 0;">
        This is a courtesy reminder that the response deadline for dispute
        <strong style="color: #0C1311;">${referenceNumber}</strong> is in
        <strong style="color: #0C1311;">${daysRemaining} days</strong>.
      </p>
      <p style="margin: 0 0 8px 0;">
        Taking time to review the details and prepare a considered response
        will help move the process forward constructively.
      </p>
    `;
  }

  return {
    subject,
    html: emailLayout({
      title,
      preheader:
        daysRemaining <= -1
          ? `The response deadline for ${referenceNumber} has passed`
          : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining to respond to ${referenceNumber}`,
      content: bodyText,
      ctaText: "Respond now",
      ctaUrl: `${SITE_URL}/disputes/${disputeId}`,
    }),
  };
}
