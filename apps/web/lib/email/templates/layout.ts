import { SITE_URL, EMAILS } from "@kestrel/shared/constants";

const FONT_STACK =
  "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif";

const COLORS = {
  kestrel: "#2B5C4F",
  kestrelHover: "#234A40",
  ink: "#0C1311",
  cream: "#F6F3EE",
  sage: "#7FA691",
  stone: "#E8E2D8",
  warm: "#C4B5A0",
  textSecondary: "#4A5553",
  textMuted: "#7A8583",
  border: "#D4CEC6",
  borderSubtle: "#E8E2D8",
  white: "#FFFFFF",
  error: "#B54444",
} as const;

/** Green Kestrel bird mark SVG, base64-encoded for light-background header. */
const LOGO_BASE64 =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0yNTYgMzJjLTMwIDAtNjUgMTUtMTAwIDUyLTM1IDM3LTY1IDkwLTg1IDE0Mmw5MC01MGMxNS0xMiAzNS0yOCA1NS00MiAxMC03IDIyLTE0IDQwLTIyIDE4IDggMzAgMTUgNDAgMjIgMjAgMTQgNDAgMzAgNTUgNDJsOTAgNTBjLTIwLTUyLTUwLTEwNS04NS0xNDItMzUtMzctNzAtNTItMTAwLTUyeiIgZmlsbD0iIzJCNUM0RiIvPjxwYXRoIGQ9Ik0xNjEgMTc2bDk1LTcyIDk1IDcyLTMwIDIyYy0xMiAxMC0zMCAyNS00NSA0OC04IDE0LTEzIDI4LTE1IDQwLTItMTItNy0yNi0xNS00MC0xNS0yMy0zMy0zOC00NS00OGwtMzAtMjJ6IiBmaWxsPSIjMkI1QzRGIi8+PHBhdGggZD0iTTI0MSAzMTZjLTQgMjAtOCA1MC0xMCA4MGwtNiA4NGg2MmwtNi04NGMtMi0zMC02LTYwLTEwLTgwIiBmaWxsPSIjMkI1QzRGIiBvcGFjaXR5PSIuMyIvPjwvc3ZnPgo=";

interface EmailLayoutParams {
  title: string;
  preheader?: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  /** Verification code to display in the footer. If omitted, placeholder used. */
  verificationCode?: string;
}

/**
 * Shared HTML email layout for all Kestrel transactional emails.
 *
 * Design: airy, light, spacious. Green logo on white header.
 * Clean card with generous padding. Verification code and scam
 * disclaimer in a quiet, separated footer zone.
 */
export const VERIFICATION_CODE_PLACEHOLDER = "{{VERIFICATION_CODE}}";

export function emailLayout(params: EmailLayoutParams): string {
  const { title, preheader, content, ctaText, ctaUrl } = params;
  const verificationCode = params.verificationCode ?? VERIFICATION_CODE_PLACEHOLDER;

  const siteUrl = SITE_URL;

  const ctaBlock =
    ctaText && ctaUrl
      ? `
        <tr>
          <td style="padding: 36px 0 0 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="
                  background-color: ${COLORS.kestrel};
                  border-radius: 8px;
                ">
                  <a href="${ctaUrl}" target="_blank" style="
                    display: inline-block;
                    padding: 14px 32px;
                    font-family: ${FONT_STACK};
                    font-size: 15px;
                    font-weight: 600;
                    color: ${COLORS.white};
                    text-decoration: none;
                    border-radius: 8px;
                    letter-spacing: 0.01em;
                  ">${ctaText}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        `
      : "";

  const preheaderBlock = preheader
    ? `<span style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${preheader}</span>`
    : "";

  const verificationBlock = verificationCode
    ? `
          <!-- Verification code -->
          <tr>
            <td style="padding: 28px 40px 0 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="
                background-color: ${COLORS.cream};
                border-radius: 8px;
              ">
                <tr>
                  <td style="padding: 18px 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="
                          font-family: ${FONT_STACK};
                          font-size: 10px;
                          font-weight: 600;
                          color: ${COLORS.textMuted};
                          text-transform: uppercase;
                          letter-spacing: 0.1em;
                          padding-bottom: 6px;
                        ">
                          Email verification code
                        </td>
                      </tr>
                      <tr>
                        <td style="
                          font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, monospace;
                          font-size: 17px;
                          font-weight: 700;
                          color: ${COLORS.kestrel};
                          letter-spacing: 0.14em;
                        ">
                          ${verificationCode}
                        </td>
                      </tr>
                      <tr>
                        <td style="
                          font-family: ${FONT_STACK};
                          font-size: 12px;
                          color: ${COLORS.textMuted};
                          padding-top: 8px;
                          line-height: 1.5;
                        ">
                          Verify this email is genuine at
                          <a href="${siteUrl}/verify" style="color: ${COLORS.kestrel}; text-decoration: underline;">${siteUrl.replace("https://", "")}/verify</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="
  margin: 0;
  padding: 0;
  width: 100%;
  background-color: ${COLORS.cream};
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
">
  ${preheaderBlock}

  <!-- Outer wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.cream};">
    <tr>
      <td style="padding: 32px 16px 40px 16px;">
        <!-- Inner container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 560px; margin: 0 auto;">

          <!-- Header — light background, green logo -->
          <tr>
            <td style="padding: 0 0 8px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="vertical-align: middle; width: 40px;">
                    <img src="${LOGO_BASE64}" alt="Kestrel" width="40" height="40" style="display: block; border: 0;" />
                  </td>
                  <td style="padding-left: 14px; vertical-align: middle;">
                    <span style="
                      font-family: ${FONT_STACK};
                      font-size: 20px;
                      font-weight: 700;
                      color: ${COLORS.kestrel};
                      letter-spacing: 0.02em;
                    ">Kestrel</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height: 12px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>

          <!-- Content card -->
          <tr>
            <td style="
              background-color: ${COLORS.white};
              padding: 44px 40px 40px 40px;
              border-radius: 12px;
              border: 1px solid ${COLORS.borderSubtle};
              box-shadow: 0 1px 3px rgba(12, 19, 17, 0.04);
            ">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <!-- Title -->
                <tr>
                  <td style="
                    font-family: ${FONT_STACK};
                    font-size: 21px;
                    font-weight: 700;
                    color: ${COLORS.ink};
                    padding-bottom: 24px;
                    line-height: 1.3;
                  ">
                    ${title}
                  </td>
                </tr>
                <!-- Body content -->
                <tr>
                  <td style="
                    font-family: ${FONT_STACK};
                    font-size: 15px;
                    color: ${COLORS.textSecondary};
                    line-height: 1.7;
                  ">
                    ${content}
                  </td>
                </tr>
                <!-- CTA -->
                ${ctaBlock}
              </table>
            </td>
          </tr>

          ${verificationBlock}

          <!-- Footer -->
          <tr>
            <td style="padding: 28px 40px 0 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="
                    font-family: ${FONT_STACK};
                    font-size: 12px;
                    color: ${COLORS.textMuted};
                    line-height: 1.6;
                  ">
                    Kestrel Solutions Limited &middot; England &amp; Wales
                  </td>
                </tr>
                <tr>
                  <td style="
                    font-family: ${FONT_STACK};
                    font-size: 12px;
                    color: ${COLORS.textMuted};
                    line-height: 1.6;
                    padding-top: 6px;
                  ">
                    You received this email because of activity on Kestrel.
                  </td>
                </tr>
                <!-- Scam disclaimer -->
                <tr>
                  <td style="
                    font-family: ${FONT_STACK};
                    font-size: 11px;
                    color: ${COLORS.warm};
                    line-height: 1.6;
                    padding-top: 16px;
                  ">
                    <strong style="color: ${COLORS.textMuted};">Protect yourself from scams.</strong>
                    Kestrel will never ask for passwords, bank details, or payment outside our platform. If you receive a suspicious email claiming to be from Kestrel, do not click any links &mdash; forward it to
                    <a href="mailto:${EMAILS.security}" style="color: ${COLORS.kestrel}; text-decoration: underline;">${EMAILS.security}</a>
                    and verify it at
                    <a href="${siteUrl}/verify" style="color: ${COLORS.kestrel}; text-decoration: underline;">${siteUrl.replace("https://", "")}/verify</a>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
