import { emailLayout } from "./layout";
import { SITE_URL } from "@kestrel/shared/constants";
import type { EmailResult } from "../types";

export type RefundType = "good_faith" | "withdrawal" | "manual";

interface RefundIssuedParams {
  recipientName: string;
  type: RefundType;
  referenceNumber: string;
  /** Pre-formatted Sterling string, e.g. "£75.00" */
  amount: string;
  /** ISO date string for when the refund was processed */
  refundedAt: string;
  /** Optional admin note. Always includes a sanitised excerpt — no PII. */
  note?: string;
}

const TYPE_HEADLINES: Record<RefundType, string> = {
  good_faith: "Your engagement fee has been refunded",
  withdrawal: "Your dispute fee has been refunded",
  manual: "A refund has been issued for your dispute fee",
};

const TYPE_PREHEADERS: Record<RefundType, string> = {
  good_faith:
    "Thank you for engaging in good faith — your fee has been returned in full",
  withdrawal:
    "The dispute was withdrawn — your fee has been returned per our refund policy",
  manual: "An administrator has issued a refund on your dispute fee",
};

/**
 * Email sent when an admin processes any kind of refund on a dispute fee.
 *
 * Variants:
 *  - good_faith: respondent met all four eligibility criteria. Tone:
 *    appreciative, light. Reinforces the platform's promise.
 *  - withdrawal: claimant withdrew per §4.4. Tone: factual, no judgement.
 *  - manual: founder override. Tone: neutral, brief.
 */
export function refundIssuedEmail(params: RefundIssuedParams): EmailResult {
  const { recipientName, type, referenceNumber, amount, refundedAt, note } =
    params;

  const formattedDate = new Date(refundedAt).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const intro = (() => {
    switch (type) {
      case "good_faith":
        return `
          <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
          <p style="margin: 0 0 20px 0;">
            Thank you for engaging substantively with the dispute raised
            against you. Because the matter reached a recorded resolution
            within the good-faith refund window, we are returning your fee
            in full as promised.
          </p>
          <p style="margin: 0 0 20px 0;">
            This is the system working as intended. Your willingness to
            engage made the resolution possible, and you should incur no
            cost as a result.
          </p>`;
      case "withdrawal":
        return `
          <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
          <p style="margin: 0 0 20px 0;">
            The dispute referenced below has been withdrawn. We are
            processing a refund of your fee in line with the platform&apos;s
            withdrawal refund policy.
          </p>`;
      case "manual":
      default:
        return `
          <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
          <p style="margin: 0 0 20px 0;">
            An administrator has issued a refund on your dispute fee. The
            details are below.
          </p>`;
    }
  })();

  const noteRow = note
    ? `
      <tr>
        <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Note</td>
        <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${escapeHtml(note)}</td>
      </tr>`
    : "";

  const content = `
    ${intro}

    <!-- Refund details card -->
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
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Refund amount</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right; font-weight: 600;">${amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Processed</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${formattedDate}</td>
            </tr>
            ${noteRow}
          </table>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 16px 0; font-size: 13px; color: #7A8583;">
      Refunds typically appear in your statement within 5–10 business days,
      depending on your card issuer.
    </p>
  `;

  return {
    subject: `Refund issued: ${referenceNumber}`,
    html: emailLayout({
      title: TYPE_HEADLINES[type],
      preheader: TYPE_PREHEADERS[type],
      content,
      ctaText: "View dispute",
      ctaUrl: `${SITE_URL}/disputes`,
    }),
  };
}

/** Minimal HTML escaping for the optional note field. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
