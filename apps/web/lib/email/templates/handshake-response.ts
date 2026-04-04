import { emailLayout } from "./layout";
import type { EmailResult } from "../types";

interface HandshakeResponseParams {
  partyAName: string;
  partyABusiness: string;
  partyBName: string;
  partyBBusiness: string;
  title: string;
  responseType: "confirm" | "modify" | "decline";
  message?: string;
  viewUrl: string;
}

const RESPONSE_LABELS: Record<string, { label: string; color: string; description: string }> = {
  confirm: {
    label: "Confirmed",
    color: "#7FA691",
    description: "has confirmed the terms of your handshake agreement.",
  },
  modify: {
    label: "Modifications requested",
    color: "#C4943A",
    description: "has reviewed your handshake agreement and requested modifications.",
  },
  decline: {
    label: "Declined",
    color: "#B54444",
    description: "has declined your handshake agreement.",
  },
};

/**
 * Email sent to Party A when Party B responds to a handshake.
 *
 * Tone: factual, neutral. Reports the outcome without editorialising.
 */
export function handshakeResponseEmail(params: HandshakeResponseParams): EmailResult {
  const {
    partyAName,
    partyBName,
    partyBBusiness,
    title,
    responseType,
    message,
    viewUrl,
  } = params;

  const response = RESPONSE_LABELS[responseType] ?? RESPONSE_LABELS.decline;

  const messageBlock = message
    ? `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="
        background-color: #F6F3EE;
        border-radius: 8px;
        margin: 8px 0 20px 0;
        border-left: 3px solid ${response.color};
      ">
        <tr>
          <td style="padding: 20px 24px;">
            <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #7A8583; text-transform: uppercase; letter-spacing: 0.05em;">Their message</p>
            <p style="margin: 0; font-size: 14px; color: #0C1311; line-height: 1.5;">${message}</p>
          </td>
        </tr>
      </table>`
    : "";

  const content = `
    <p style="margin: 0 0 16px 0;">Dear ${partyAName},</p>
    <p style="margin: 0 0 20px 0;">
      <strong style="color: #0C1311;">${partyBName}</strong>
      of <strong style="color: #0C1311;">${partyBBusiness}</strong>
      ${response.description}
    </p>

    <!-- Status badge -->
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
              <td style="padding: 8px 0; font-size: 14px; color: #7A8583;">Status</td>
              <td style="padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600; color: ${response.color};">${response.label}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${messageBlock}

    <p style="margin: 0 0 8px 0;">
      You can view the full details of this handshake on Kestrel.
    </p>
  `;

  return {
    subject: `Handshake ${responseType === "confirm" ? "confirmed" : responseType === "modify" ? "modifications requested" : "declined"}: ${title}`,
    html: emailLayout({
      title: `Handshake ${response.label.toLowerCase()}`,
      preheader: `${partyBName} ${response.description}`,
      content,
      ctaText: "View handshake",
      ctaUrl: viewUrl,
    }),
  };
}
