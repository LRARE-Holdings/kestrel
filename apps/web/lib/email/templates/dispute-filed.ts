import { emailLayout } from "./layout";
import { SITE_URL } from "@kestrel/shared/constants";
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
  respondentIsExistingUser?: boolean;
}

const DISPUTE_TYPE_LABELS: Record<string, string> = {
  payment: "payment",
  deliverables: "deliverables",
  service_quality: "service quality",
  contract_interpretation: "contract interpretation",
  other: "general",
};

/**
 * Email sent to the RESPONDING party when a dispute is filed against them.
 *
 * Tone: formal, plain-spoken, action-oriented. The respondent has 14 days
 * to engage. The £35 response fee is refunded if the dispute resolves
 * within 14 days of their joining. Non-engagement is recorded and may be
 * cited as evidence in later proceedings.
 *
 * Pricing references (2026-04-07):
 *  - £35 response fee
 *  - Refunded in full if dispute resolves within 14 days of respondent joining
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
    respondentIsExistingUser = false,
  } = params;

  const typeLabel = DISPUTE_TYPE_LABELS[disputeType] || "general";
  const authPath = respondentIsExistingUser ? "sign-in" : "sign-up";
  const caseUrl = `${SITE_URL}/${authPath}?redirect=/disputes/${encodeURIComponent(disputeId)}`;

  // Build a one-sentence allegation summary from the subject and amount.
  // Example: "Outstanding invoice for web development services — £5,000.00"
  const claimSummary = amount ? `${subject} — ${amount}` : subject;

  const content = `
    <p style="margin: 0 0 16px 0;">Hello ${respondentName},</p>

    <p style="margin: 0 0 22px 0;">
      A dispute has been raised against
      <strong style="color: #0C1311;">${respondentBusiness}</strong>
      under the Kestrel resolution clause in your contract with
      <strong style="color: #0C1311;">${initiatorBusiness}</strong>.
    </p>

    <p style="margin: 0 0 12px 0; font-weight: 600; color: #0C1311;">What this means</p>
    <p style="margin: 0 0 22px 0;">
      When you signed that contract, both parties agreed that any disputes
      would first be raised on Kestrel &mdash; a structured communication
      venue designed to resolve SME disputes quickly and without solicitors.
      This notice is the formal start of that process.
    </p>

    <p style="margin: 0 0 10px 0;">
      ${initiatorName} of ${initiatorBusiness} alleges:
    </p>

    <!-- Claim summary card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="
      background-color: #F6F3EE;
      border-radius: 8px;
      margin: 0 0 24px 0;
    ">
      <tr>
        <td style="padding: 18px 24px;">
          <p style="
            margin: 0;
            font-size: 14px;
            color: #0C1311;
            line-height: 1.6;
            font-style: italic;
          ">
            &ldquo;${claimSummary}&rdquo;
          </p>
          <p style="
            margin: 12px 0 0 0;
            font-size: 11px;
            color: #7A8583;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-weight: 600;
          ">
            Reference ${referenceNumber} &middot; ${typeLabel} dispute
          </p>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 24px 0;">
      You can view the full submission here:
      <a href="${caseUrl}" style="color: #2B5C4F; text-decoration: underline;">Secure case link</a>
    </p>

    <p style="margin: 0 0 12px 0; font-weight: 600; color: #0C1311;">What happens next</p>
    <p style="margin: 0 0 16px 0;">
      You have until <strong style="color: #0C1311;">${responseDeadline}</strong>
      (14 days from the date of this email) to respond. Responding costs
      <strong style="color: #0C1311;">£35</strong> and gives you equal
      standing in a structured negotiation with the claimant. There is no
      mediator, no judge, and no imposed outcome &mdash; Kestrel provides
      the venue, you and the claimant resolve the matter directly.
    </p>
    <p style="margin: 0 0 24px 0;">
      If you respond in good faith and the dispute is resolved within
      <strong style="color: #0C1311;">14 days of your joining</strong>,
      your £35 fee is refunded in full.
    </p>

    <p style="margin: 0 0 12px 0; font-weight: 600; color: #0C1311;">If you ignore this notice</p>
    <p style="margin: 0 0 16px 0;">
      The case will be marked as
      <em>&ldquo;respondent did not engage&rdquo;</em>
      and the claimant will receive a record of the attempted resolution.
      This record can be used as evidence that alternative resolution was
      attempted before any further action &mdash; including a Small Claims
      Court claim, where it may affect costs awarded against you.
    </p>
    <p style="margin: 0 0 24px 0;">
      Responding on Kestrel is the cheapest, fastest way to resolve this.
      Court proceedings, even at the small claims level, typically cost
      <strong style="color: #0C1311;">£35&ndash;£455 in fees alone</strong>,
      take <strong style="color: #0C1311;">3&ndash;6 months</strong>, and
      involve significantly more administrative burden.
    </p>

    <p style="margin: 0 0 8px 0;">
      If you believe this notice has been sent in error, or you have
      questions about the Kestrel process, our
      <a href="${SITE_URL}/contact" style="color: #2B5C4F; text-decoration: underline;">support team</a>
      will respond within one working day.
    </p>

    <p style="
      margin: 28px 0 0 0;
      padding-top: 20px;
      border-top: 1px solid #E8E2D8;
      font-size: 12px;
      color: #7A8583;
      line-height: 1.6;
    ">
      Kestrel is a structured communication venue. We do not provide legal
      advice, mediation services, or adjudication.
      <a href="${SITE_URL}/terms" style="color: #7A8583; text-decoration: underline;">Full terms</a>.
    </p>
  `;

  return {
    subject: `Dispute notice: ${initiatorBusiness} — response required within 14 days`,
    html: emailLayout({
      title: "You've received a dispute notice",
      preheader: `${initiatorBusiness} has raised a ${typeLabel} dispute against ${respondentBusiness} under your Kestrel resolution clause — reference ${referenceNumber}`,
      content,
      ctaText: "Respond to this dispute",
      ctaUrl: caseUrl,
    }),
  };
}
