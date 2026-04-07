import { emailLayout } from "./layout";
import { SITE_URL } from "@kestrel/shared/constants";
import {
  RESPONDENT_PAYMENT_WINDOW_DAYS,
  GOOD_FAITH_REFUND_DAYS,
  MIN_SUBSTANTIVE_RESPONSE_WORDS,
} from "@kestrel/shared/pricing/config";
import type { EmailResult } from "../types";

interface DisputePaymentRequiredParams {
  respondentName: string;
  initiatorName: string;
  initiatorBusiness: string;
  referenceNumber: string;
  subject: string;
  disputeType: string;
  /** Pre-formatted Sterling string for the disputed amount, if any */
  disputedAmount?: string;
  /** Pre-formatted Sterling string for the respondent's filing fee */
  responseFee: string;
  responseDeadline: string;
  /** Tier label for context (e.g. "Standard") */
  tierLabel: string;
}

const DISPUTE_TYPE_LABELS: Record<string, string> = {
  payment: "Payment dispute",
  deliverables: "Deliverables dispute",
  service_quality: "Service quality dispute",
  contract_interpretation: "Contract interpretation dispute",
  other: "General dispute",
};

/**
 * Email sent to the RESPONDENT after the claimant's filing payment has
 * succeeded. This is the dispute notification — the moment the respondent
 * first hears about the case.
 *
 * Headline strategy: lead with the good-faith refund, NOT the fee. The
 * fee feels like a deposit, not a penalty, when the refund mechanic is
 * the first thing the respondent reads.
 *
 * This template replaces (in code path) the existing dispute-filed.ts
 * once Phase 6 wires the new payment flow into fileDispute().
 */
export function disputePaymentRequiredEmail(
  params: DisputePaymentRequiredParams,
): EmailResult {
  const {
    respondentName,
    initiatorName,
    initiatorBusiness,
    referenceNumber,
    subject,
    disputeType,
    disputedAmount,
    responseFee,
    responseDeadline,
    tierLabel,
  } = params;

  const typeLabel = DISPUTE_TYPE_LABELS[disputeType] ?? "Dispute";

  const amountRow = disputedAmount
    ? `
      <tr>
        <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Amount in dispute</td>
        <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${disputedAmount}</td>
      </tr>`
    : "";

  const content = `
    <p style="margin: 0 0 16px 0;">Dear ${respondentName},</p>
    <p style="margin: 0 0 20px 0;">
      <strong style="color: #0C1311;">${initiatorName}</strong>
      of <strong style="color: #0C1311;">${initiatorBusiness}</strong>
      has raised a formal dispute against you through Kestrel and is asking
      to resolve it through structured communication.
    </p>

    <!-- Headline good-faith refund callout -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="
      background-color: #F0F5F2;
      border-left: 4px solid #2B5C4F;
      border-radius: 4px;
      margin: 0 0 24px 0;
    ">
      <tr>
        <td style="padding: 16px 20px;">
          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #0C1311;">
            Engage in good faith and your fee is refunded.
          </p>
          <p style="margin: 0; font-size: 13px; color: #4A5553; line-height: 1.6;">
            If you pay within ${RESPONDENT_PAYMENT_WINDOW_DAYS} days, submit a
            substantive response (at least ${MIN_SUBSTANTIVE_RESPONSE_WORDS} words),
            and the dispute reaches a recorded resolution within
            ${GOOD_FAITH_REFUND_DAYS} days of you joining,
            <strong style="color: #0C1311;">your ${responseFee} fee is refunded in full</strong>.
            The fee is a deposit on engagement, not a penalty.
          </p>
        </td>
      </tr>
    </table>

    <!-- Dispute details card -->
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
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Tier</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${tierLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Your fee to respond</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right; font-weight: 600;">${responseFee}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Respond by</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${responseDeadline}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 12px 0; font-weight: 600; color: #0C1311;">How to respond</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 4px 0; font-size: 14px; color: #4A5553; line-height: 1.6;">
          1.&nbsp;&nbsp;Click the button below to view the dispute and read the claimant&apos;s submission in full.
        </td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 14px; color: #4A5553; line-height: 1.6;">
          2.&nbsp;&nbsp;Sign in or create a free Kestrel account to access the case.
        </td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 14px; color: #4A5553; line-height: 1.6;">
          3.&nbsp;&nbsp;Pay the ${responseFee} response fee — refundable as described above.
        </td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 14px; color: #4A5553; line-height: 1.6;">
          4.&nbsp;&nbsp;Submit your response in your own words. You can upload evidence and propose settlement terms at any stage.
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 16px 0; font-size: 13px; color: #7A8583;">
      Kestrel does not take sides and does not adjudicate. The fee buys
      access to the structured communication venue and case management
      infrastructure — not mediation, legal advice, or representation.
    </p>

    <p style="margin: 0 0 8px 0; font-size: 13px; color: #7A8583;">
      Ignoring this notice is permitted, but the platform will record
      <em>&ldquo;respondent did not engage&rdquo;</em> against the case.
      That record may be cited in any subsequent action, including the
      Small Claims Court.
    </p>
  `;

  return {
    subject: `A dispute has been raised: ${referenceNumber}`,
    html: emailLayout({
      title: "A dispute has been raised against you",
      preheader: `Engage in good faith within ${GOOD_FAITH_REFUND_DAYS} days and your ${responseFee} fee is refunded in full`,
      content,
      ctaText: "View dispute and respond",
      ctaUrl: `${SITE_URL}/disputes`,
    }),
  };
}
