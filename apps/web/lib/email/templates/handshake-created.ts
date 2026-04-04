import { emailLayout } from "./layout";
import type { EmailResult } from "../types";

interface HandshakeCreatedParams {
  partyBName: string;
  partyBBusiness: string;
  partyAName: string;
  partyABusiness: string;
  title: string;
  termCount: number;
  shareUrl: string;
}

/**
 * Email sent to Party B when Party A creates a handshake agreement.
 *
 * Tone: professional, inviting, non-threatening. The recipient is
 * being asked to review and confirm terms — not sign a contract.
 */
export function handshakeCreatedEmail(params: HandshakeCreatedParams): EmailResult {
  const {
    partyBName,
    partyBBusiness,
    partyAName,
    partyABusiness,
    title,
    termCount,
    shareUrl,
  } = params;

  const content = `
    <p style="margin: 0 0 16px 0;">Dear ${partyBName},</p>
    <p style="margin: 0 0 20px 0;">
      <strong style="color: #0C1311;">${partyAName}</strong>
      of <strong style="color: #0C1311;">${partyABusiness}</strong>
      has created a handshake agreement on Kestrel and invited you to review it.
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
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Agreement</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right; font-weight: 600;">${title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">From</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${partyAName}, ${partyABusiness}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Terms</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0C1311; text-align: right;">${termCount} term${termCount === 1 ? "" : "s"}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 20px 0;">
      Please review the terms and let ${partyAName} know whether you agree.
      You can confirm, request modifications, or decline. No account is required.
    </p>

    <p style="margin: 0 0 8px 0; font-size: 13px; color: #7A8583;">
      This link is unique to you. Do not share it with others.
    </p>
  `;

  return {
    subject: `${partyAName} has sent you a handshake agreement`,
    html: emailLayout({
      title: "You have a handshake agreement to review",
      preheader: `${partyAName} of ${partyABusiness} has sent you a handshake agreement: ${title}`,
      content,
      ctaText: "Review agreement",
      ctaUrl: shareUrl,
    }),
  };
}
