import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const HOOK_SECRET = Deno.env.get("SEND_EMAIL_HOOK_SECRET")!;
const SITE_URL =
  Deno.env.get("SITE_URL") || "https://kestrel.pellar.co.uk";
const FROM_DOMAIN =
  Deno.env.get("RESEND_FROM_DOMAIN") || "kestrel.pellar.co.uk";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HookPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
    identities?: Array<{ provider: string }>;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new: string;
    token_hash_new: string;
  };
}

// ---------------------------------------------------------------------------
// Kestrel branded email HTML
// ---------------------------------------------------------------------------

const COLORS = {
  kestrel: "#2B5C4F",
  ink: "#0C1311",
  cream: "#F6F3EE",
  stone: "#E8E2D8",
  textSecondary: "#4A5553",
  textMuted: "#7A8583",
  borderSubtle: "#E8E2D8",
  warm: "#C4B5A0",
  white: "#FFFFFF",
};

const FONT =
  "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif";

function buildEmail(params: {
  title: string;
  preheader: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  const { title, preheader, bodyHtml, ctaText, ctaUrl } = params;

  const ctaBlock =
    ctaText && ctaUrl
      ? `<tr><td style="padding: 32px 0 0 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
            <td style="background-color: ${COLORS.kestrel}; border-radius: 8px;">
              <a href="${ctaUrl}" target="_blank" style="
                display: inline-block; padding: 14px 32px;
                font-family: ${FONT}; font-size: 15px; font-weight: 600;
                color: ${COLORS.white}; text-decoration: none; border-radius: 8px;
              ">${ctaText}</a>
            </td>
          </tr></table>
        </td></tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${COLORS.cream};-webkit-text-size-adjust:100%;">
  <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${COLORS.cream};">
    <tr><td style="padding:32px 16px 40px 16px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px;margin:0 auto;">
        <!-- Header -->
        <tr><td style="padding:0 0 20px 0;">
          <span style="font-family:${FONT};font-size:20px;font-weight:700;color:${COLORS.kestrel};letter-spacing:0.02em;">Kestrel</span>
        </td></tr>
        <!-- Card -->
        <tr><td style="background-color:${COLORS.white};padding:44px 40px 40px 40px;border-radius:12px;border:1px solid ${COLORS.borderSubtle};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr><td style="font-family:${FONT};font-size:21px;font-weight:700;color:${COLORS.ink};padding-bottom:24px;line-height:1.3;">${title}</td></tr>
            <tr><td style="font-family:${FONT};font-size:15px;color:${COLORS.textSecondary};line-height:1.7;">${bodyHtml}</td></tr>
            ${ctaBlock}
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:28px 40px 0 40px;">
          <p style="font-family:${FONT};font-size:12px;color:${COLORS.textMuted};line-height:1.6;margin:0;">
            Kestrel Solutions Limited &middot; England &amp; Wales
          </p>
          <p style="font-family:${FONT};font-size:11px;color:${COLORS.warm};line-height:1.6;margin:16px 0 0 0;">
            <strong style="color:${COLORS.textMuted};">Protect yourself from scams.</strong>
            Kestrel will never ask for passwords or bank details outside our platform.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Build the confirmation URL that points to YOUR app, not Supabase's verify endpoint.
// This ensures the token exchange happens in your /auth/confirm route, which sets
// the recovery cookie and controls the redirect.
// ---------------------------------------------------------------------------

function buildConfirmationUrl(emailData: HookPayload["email_data"]): string {
  const params = new URLSearchParams({
    token_hash: emailData.token_hash,
    type: emailData.email_action_type,
  });

  // For recovery, always redirect to update-password after token exchange
  if (emailData.email_action_type === "recovery") {
    params.set("redirect", "/update-password");
  } else if (emailData.redirect_to) {
    // Preserve the original redirect_to for other flows
    const redirectUrl = new URL(emailData.redirect_to);
    // Extract the path from the redirect_to (which may be a full URL like
    // https://kestrel.pellar.co.uk/auth/callback?redirect=/dashboard)
    // We want to use /auth/confirm directly with the token_hash instead.
  }

  return `${SITE_URL}/auth/confirm?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Email content by action type
// ---------------------------------------------------------------------------

function getEmailContent(
  emailData: HookPayload["email_data"],
  userEmail: string,
): {
  subject: string;
  title: string;
  preheader: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
} {
  const confirmUrl = buildConfirmationUrl(emailData);
  const otp = emailData.token;

  switch (emailData.email_action_type) {
    case "recovery":
      return {
        subject: "Reset your password — Kestrel",
        title: "Reset your password",
        preheader: "Use this link to set a new password for your Kestrel account.",
        bodyHtml: `
          <p>We received a request to reset the password for your Kestrel account (<strong>${userEmail}</strong>).</p>
          <p>Click the button below to choose a new password. This link expires in 1 hour.</p>
          <p style="margin-top:24px;padding:16px;background-color:${COLORS.cream};border-radius:8px;font-family:'JetBrains Mono','SF Mono',Consolas,monospace;font-size:18px;font-weight:700;color:${COLORS.kestrel};letter-spacing:0.1em;text-align:center;">${otp}</p>
          <p style="font-size:13px;color:${COLORS.textMuted};margin-top:8px;">You can also enter this code manually on the reset page.</p>
          <p style="font-size:13px;color:${COLORS.textMuted};margin-top:16px;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
        `,
        ctaText: "Reset password",
        ctaUrl: confirmUrl,
      };

    case "signup":
      return {
        subject: "Confirm your email — Kestrel",
        title: "Confirm your email",
        preheader: "Verify your email address to get started with Kestrel.",
        bodyHtml: `
          <p>Welcome to Kestrel. Please confirm your email address to activate your account.</p>
          <p style="margin-top:24px;padding:16px;background-color:${COLORS.cream};border-radius:8px;font-family:'JetBrains Mono','SF Mono',Consolas,monospace;font-size:18px;font-weight:700;color:${COLORS.kestrel};letter-spacing:0.1em;text-align:center;">${otp}</p>
          <p style="font-size:13px;color:${COLORS.textMuted};margin-top:8px;">Or click the button below.</p>
        `,
        ctaText: "Confirm email",
        ctaUrl: confirmUrl,
      };

    case "invite":
      return {
        subject: "You've been invited to Kestrel",
        title: "You've been invited",
        preheader: "Accept your invitation to join Kestrel.",
        bodyHtml: `
          <p>You've been invited to create an account on Kestrel. Click below to accept the invitation.</p>
        `,
        ctaText: "Accept invitation",
        ctaUrl: confirmUrl,
      };

    case "email_change":
      return {
        subject: "Confirm email change — Kestrel",
        title: "Confirm your email change",
        preheader: "Confirm the update to your email address.",
        bodyHtml: `
          <p>You requested to change the email address on your Kestrel account. Click below to confirm.</p>
          <p style="margin-top:24px;padding:16px;background-color:${COLORS.cream};border-radius:8px;font-family:'JetBrains Mono','SF Mono',Consolas,monospace;font-size:18px;font-weight:700;color:${COLORS.kestrel};letter-spacing:0.1em;text-align:center;">${otp}</p>
        `,
        ctaText: "Confirm email change",
        ctaUrl: confirmUrl,
      };

    case "reauthentication":
      return {
        subject: "Confirm your identity — Kestrel",
        title: "Confirm your identity",
        preheader: "Enter this code to verify your identity.",
        bodyHtml: `
          <p>To complete this action, please enter the verification code below:</p>
          <p style="margin-top:24px;padding:16px;background-color:${COLORS.cream};border-radius:8px;font-family:'JetBrains Mono','SF Mono',Consolas,monospace;font-size:24px;font-weight:700;color:${COLORS.kestrel};letter-spacing:0.15em;text-align:center;">${otp}</p>
        `,
      };

    default:
      // Fallback for any other email action types (notifications, etc.)
      return {
        subject: "Notification from Kestrel",
        title: "Notification",
        preheader: "You have a notification from Kestrel.",
        bodyHtml: `<p>You have a notification from Kestrel. If this requires action, please sign in to your account.</p>`,
        ctaText: "Go to Kestrel",
        ctaUrl: SITE_URL,
      };
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  // Verify the webhook signature
  const secret = HOOK_SECRET.replace("v1,whsec_", "");
  const wh = new Webhook(secret);

  let data: HookPayload;
  try {
    data = wh.verify(payload, headers) as HookPayload;
  } catch (err) {
    console.error("[send-email] Webhook verification failed:", err);
    return new Response(
      JSON.stringify({
        error: { http_code: 401, message: "Invalid webhook signature" },
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const { user, email_data } = data;

  // Skip notification-type emails (password_changed_notification, etc.)
  // — these don't need a link/token and we can let Supabase handle them
  // or ignore them for now.
  const notificationTypes = [
    "password_changed_notification",
    "email_changed_notification",
    "phone_changed_notification",
    "identity_linked_notification",
    "identity_unlinked_notification",
    "mfa_factor_enrolled_notification",
    "mfa_factor_unenrolled_notification",
  ];

  if (notificationTypes.includes(email_data.email_action_type)) {
    // Return 200 to acknowledge but don't send — or build a simple notification email
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Build the email
  const content = getEmailContent(email_data, user.email);
  const html = buildEmail({
    title: content.title,
    preheader: content.preheader,
    bodyHtml: content.bodyHtml,
    ctaText: content.ctaText,
    ctaUrl: content.ctaUrl,
  });

  // Send via Resend
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Kestrel <auth@${FROM_DOMAIN}>`,
        to: [user.email],
        subject: content.subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[send-email] Resend error:", err);
      return new Response(
        JSON.stringify({
          error: {
            http_code: res.status,
            message: err.message || "Failed to send email",
          },
        }),
        { status: res.status, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log(
      `[send-email] Sent ${email_data.email_action_type} email to ${user.email}`,
    );
  } catch (err) {
    console.error("[send-email] Exception:", err);
    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message: err instanceof Error ? err.message : "Internal error",
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
