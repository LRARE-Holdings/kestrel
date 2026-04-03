const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif";

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
  white: "#FFFFFF",
  error: "#B54444",
} as const;

interface EmailLayoutParams {
  title: string;
  preheader?: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
}

/**
 * Shared HTML email layout for all Kestrel transactional emails.
 *
 * Uses table-based layout with inline CSS for maximum email client
 * compatibility. Matches the Kestrel brand: calm, professional,
 * modern luxury legal.
 */
export function emailLayout(params: EmailLayoutParams): string {
  const { title, preheader, content, ctaText, ctaUrl } = params;

  const ctaBlock =
    ctaText && ctaUrl
      ? `
        <tr>
          <td style="padding: 32px 0 8px 0;">
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
      <td style="padding: 24px 16px;">
        <!-- Inner container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 560px; margin: 0 auto;">

          <!-- Header -->
          <tr>
            <td style="
              background-color: ${COLORS.kestrel};
              padding: 24px 32px;
              border-radius: 12px 12px 0 0;
            ">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="
                    font-family: ${FONT_STACK};
                    font-size: 22px;
                    font-weight: 700;
                    color: ${COLORS.white};
                    letter-spacing: 0.02em;
                  ">
                    Kestrel
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content area -->
          <tr>
            <td style="
              background-color: ${COLORS.white};
              padding: 36px 32px 32px 32px;
              border-left: 1px solid ${COLORS.border};
              border-right: 1px solid ${COLORS.border};
            ">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <!-- Title -->
                <tr>
                  <td style="
                    font-family: ${FONT_STACK};
                    font-size: 20px;
                    font-weight: 700;
                    color: ${COLORS.ink};
                    padding-bottom: 20px;
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
                    line-height: 1.65;
                  ">
                    ${content}
                  </td>
                </tr>
                <!-- CTA -->
                ${ctaBlock}
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="
              background-color: ${COLORS.white};
              padding: 0 32px;
              border-left: 1px solid ${COLORS.border};
              border-right: 1px solid ${COLORS.border};
            ">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="border-top: 1px solid ${COLORS.stone}; font-size: 1px; line-height: 1px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              background-color: ${COLORS.white};
              padding: 20px 32px 28px 32px;
              border-radius: 0 0 12px 12px;
              border-left: 1px solid ${COLORS.border};
              border-right: 1px solid ${COLORS.border};
              border-bottom: 1px solid ${COLORS.border};
            ">
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
                    You are receiving this email because of activity on your Kestrel account. To manage your notification preferences, visit your account settings.
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
