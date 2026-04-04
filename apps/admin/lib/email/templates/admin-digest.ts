import { emailLayout } from "@kestrel/shared/email/templates/layout";
import { ADMIN_URL } from "@kestrel/shared/constants";

interface RecentSignUp {
  display_name: string;
  email: string;
  business_name: string | null;
  created_at: string;
}

export interface AdminDigestData {
  newSignUps: number;
  newDisputes: number;
  escalatedDisputes: number;
  overdueFollowUps: number;
  totalUsers: number;
  totalDisputes: number;
  recentSignUps: RecentSignUp[];
  date: string;
}

const COLORS = {
  kestrel: "#2B5C4F",
  ink: "#0C1311",
  cream: "#F6F3EE",
  sage: "#7FA691",
  stone: "#E8E2D8",
  textSecondary: "#4A5553",
  textMuted: "#7A8583",
  border: "#D4CEC6",
  white: "#FFFFFF",
  error: "#B54444",
  warning: "#C4943A",
} as const;

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif";

function metricBox(
  label: string,
  value: number,
  accent: string,
): string {
  return `
    <td width="50%" style="padding: 6px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="
        background-color: ${COLORS.cream};
        border-radius: 8px;
        border: 1px solid ${COLORS.stone};
      ">
        <tr>
          <td style="padding: 16px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="
                  font-family: ${FONT_STACK};
                  font-size: 28px;
                  font-weight: 700;
                  color: ${accent};
                  line-height: 1.2;
                ">${value}</td>
              </tr>
              <tr>
                <td style="
                  font-family: ${FONT_STACK};
                  font-size: 12px;
                  font-weight: 500;
                  color: ${COLORS.textMuted};
                  text-transform: uppercase;
                  letter-spacing: 0.06em;
                  padding-top: 4px;
                  line-height: 1.4;
                ">${label}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>`;
}

function formatSignUpDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function signUpRow(signUp: RecentSignUp, isLast: boolean): string {
  const borderBottom = isLast
    ? ""
    : `border-bottom: 1px solid ${COLORS.stone};`;

  const businessTag = signUp.business_name
    ? `<span style="
        font-family: ${FONT_STACK};
        font-size: 12px;
        color: ${COLORS.textMuted};
      "> &middot; ${signUp.business_name}</span>`
    : "";

  return `
    <tr>
      <td style="padding: 12px 16px; ${borderBottom}">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="
              font-family: ${FONT_STACK};
              font-size: 14px;
              font-weight: 600;
              color: ${COLORS.ink};
              line-height: 1.4;
            ">
              ${signUp.display_name || "Unnamed user"}${businessTag}
            </td>
            <td align="right" style="
              font-family: ${FONT_STACK};
              font-size: 12px;
              color: ${COLORS.textMuted};
              white-space: nowrap;
            ">${formatSignUpDate(signUp.created_at)}</td>
          </tr>
          <tr>
            <td colspan="2" style="
              font-family: ${FONT_STACK};
              font-size: 13px;
              color: ${COLORS.textSecondary};
              padding-top: 2px;
              line-height: 1.4;
            ">${signUp.email}</td>
          </tr>
        </table>
      </td>
    </tr>`;
}

/**
 * Generates the daily admin digest email HTML.
 *
 * Sections:
 *  1. Key metrics (2x2 grid): new sign-ups, new disputes, escalated, overdue
 *  2. Platform totals (context line)
 *  3. Recent sign-ups list (last 5)
 *  4. Action items (only if escalated or overdue counts > 0)
 *
 * Uses the shared emailLayout wrapper for consistent Kestrel branding.
 */
export function adminDigestEmail(data: AdminDigestData): {
  subject: string;
  html: string;
} {
  const subject = `Kestrel Admin Digest \u2014 ${data.date}`;

  // -- Metrics grid (2x2) --
  const metricsGrid = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        ${metricBox("New sign-ups", data.newSignUps, COLORS.kestrel)}
        ${metricBox("New disputes", data.newDisputes, COLORS.ink)}
      </tr>
      <tr>
        ${metricBox("Escalated", data.escalatedDisputes, COLORS.error)}
        ${metricBox("Overdue follow-ups", data.overdueFollowUps, COLORS.warning)}
      </tr>
    </table>`;

  // -- Platform totals context line --
  const totalsLine = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="
          padding: 16px 6px 0 6px;
          font-family: ${FONT_STACK};
          font-size: 13px;
          color: ${COLORS.textMuted};
          line-height: 1.5;
        ">
          Platform totals: <strong style="color: ${COLORS.textSecondary};">${data.totalUsers.toLocaleString("en-GB")}</strong> users &middot;
          <strong style="color: ${COLORS.textSecondary};">${data.totalDisputes.toLocaleString("en-GB")}</strong> disputes
        </td>
      </tr>
    </table>`;

  // -- Recent sign-ups --
  let recentSignUpsSection = "";
  if (data.recentSignUps.length > 0) {
    const rows = data.recentSignUps
      .map((s, i) => signUpRow(s, i === data.recentSignUps.length - 1))
      .join("");

    recentSignUpsSection = `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding-top: 28px;">
        <tr>
          <td style="
            font-family: ${FONT_STACK};
            font-size: 11px;
            font-weight: 600;
            color: ${COLORS.kestrel};
            text-transform: uppercase;
            letter-spacing: 0.1em;
            padding: 0 6px 12px 6px;
          ">Recent sign-ups</td>
        </tr>
        <tr>
          <td style="padding: 0 6px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="
              background-color: ${COLORS.white};
              border: 1px solid ${COLORS.border};
              border-radius: 8px;
            ">
              ${rows}
            </table>
          </td>
        </tr>
      </table>`;
  }

  // -- Action items (only when there are escalated disputes or overdue follow-ups) --
  let actionItemsSection = "";
  const actionItems: string[] = [];

  if (data.escalatedDisputes > 0) {
    actionItems.push(
      `<strong style="color: ${COLORS.error};">${data.escalatedDisputes}</strong> dispute${data.escalatedDisputes === 1 ? "" : "s"} escalated in the last 24 hours`,
    );
  }
  if (data.overdueFollowUps > 0) {
    actionItems.push(
      `<strong style="color: ${COLORS.warning};">${data.overdueFollowUps}</strong> lead follow-up${data.overdueFollowUps === 1 ? "" : "s"} overdue`,
    );
  }

  if (actionItems.length > 0) {
    const listItems = actionItems
      .map(
        (item) => `
        <tr>
          <td width="20" valign="top" style="
            font-family: ${FONT_STACK};
            font-size: 14px;
            color: ${COLORS.kestrel};
            padding: 4px 0;
          ">&bull;</td>
          <td style="
            font-family: ${FONT_STACK};
            font-size: 14px;
            color: ${COLORS.textSecondary};
            line-height: 1.5;
            padding: 4px 0;
          ">${item}</td>
        </tr>`,
      )
      .join("");

    actionItemsSection = `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding-top: 28px;">
        <tr>
          <td style="
            font-family: ${FONT_STACK};
            font-size: 11px;
            font-weight: 600;
            color: ${COLORS.kestrel};
            text-transform: uppercase;
            letter-spacing: 0.1em;
            padding: 0 6px 12px 6px;
          ">Requires attention</td>
        </tr>
        <tr>
          <td style="padding: 0 6px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="
              background-color: ${COLORS.cream};
              border: 1px solid ${COLORS.border};
              border-radius: 8px;
              padding: 16px 20px;
            ">
              ${listItems}
            </table>
          </td>
        </tr>
      </table>`;
  }

  // -- Assemble content --
  const content = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="
          font-family: ${FONT_STACK};
          font-size: 15px;
          color: ${COLORS.textSecondary};
          line-height: 1.6;
          padding-bottom: 24px;
        ">
          Here is your daily platform summary for <strong style="color: ${COLORS.ink};">${data.date}</strong>.
        </td>
      </tr>
      <tr>
        <td>${metricsGrid}</td>
      </tr>
      <tr>
        <td>${totalsLine}</td>
      </tr>
      <tr>
        <td>${recentSignUpsSection}</td>
      </tr>
      <tr>
        <td>${actionItemsSection}</td>
      </tr>
    </table>`;

  const adminUrl = ADMIN_URL;

  const html = emailLayout({
    title: "Admin Digest",
    preheader: `${data.newSignUps} new sign-up${data.newSignUps === 1 ? "" : "s"}, ${data.newDisputes} new dispute${data.newDisputes === 1 ? "" : "s"}`,
    content,
    ctaText: "Open Admin Panel",
    ctaUrl: adminUrl,
  });

  return { subject, html };
}
