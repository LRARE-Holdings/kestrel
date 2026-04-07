import { emailLayout } from "./layout";
import { SITE_URL } from "@kestrel/shared/constants";
import type { EmailResult } from "../types";

interface PaymentReceiptParams {
  recipientName: string;
  /** "claimant" or "respondent" — used to phrase the body copy */
  partyRole: "claimant" | "respondent";
  referenceNumber: string;
  tierLabel: string;
  /** Pre-formatted Sterling string, e.g. "£75.00" */
  amount: string;
  /** ISO date string for the payment timestamp */
  paidAt: string;
  /**
   * For respondents only — set when the respondent's payment is eligible
   * for the good-faith refund mechanic. Highlights the refund headline.
   */
  goodFaithRefundEligible?: boolean;
}

/**
 * Receipt email sent after a successful dispute fee payment.
 *
 * Tone: brisk and factual. This is a receipt, not a marketing email — the
 * goal is to give the recipient something they can file with their
 * accountant. The good-faith refund headline appears for respondent
 * payments to remind them that engagement is rewarded.
 */
export function paymentReceiptEmail(params: PaymentReceiptParams): EmailResult {
  const {
    recipientName,
    partyRole,
    referenceNumber,
    tierLabel,
    amount,
    paidAt,
    goodFaithRefundEligible,
  } = params;

  const formattedDate = new Date(paidAt).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const refundCallout =
    partyRole === "respondent" && goodFaithRefundEligible
      ? `
    <p style="margin: 0 0 16px 0; padding: 12px 16px; background-color: #F0F5F2; border-left: 3px solid #2B5C4F; border-radius: 4px;">
      <strong style="color: #0C1311;">Reminder:</strong> if you submit a
      substantive response and the dispute is resolved within 14 days of
      your joining, this fee is refunded in full.
    </p>`
      : "";

  const content = `
    <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
    <p style="margin: 0 0 20px 0;">
      Thank you. Your payment for dispute reference
      <strong style="color: #0C1311;">${referenceNumber}</strong> has been
      received.
    </p>

    <!-- Receipt card -->
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
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Tier</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${tierLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Amount paid</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right; font-weight: 600;">${amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Date</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${formattedDate}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${refundCallout}

    <p style="margin: 0 0 16px 0; font-size: 13px; color: #7A8583;">
      The fee buys access to Kestrel&apos;s structured communication venue and
      case management infrastructure. It does not buy mediation, legal advice,
      adjudication, or representation.
    </p>

    <p style="margin: 0 0 8px 0; font-size: 13px; color: #7A8583;">
      Please retain this email for your records. Statement descriptor:
      <strong>KESTREL DISPUTE FEE</strong>.
    </p>
  `;

  return {
    subject: `Payment receipt: ${referenceNumber}`,
    html: emailLayout({
      title: "Payment received",
      preheader: `${amount} received for dispute ${referenceNumber}`,
      content,
      ctaText: "View dispute",
      ctaUrl: `${SITE_URL}/disputes`,
    }),
  };
}
