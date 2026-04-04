import { resend } from "./client";
import { createServiceClient } from "@kestrel/shared/supabase/service";

/** Placeholder inserted by emailLayout — replaced with a real code before sending. */
const VERIFICATION_PLACEHOLDER = "{{VERIFICATION_CODE}}";

interface SendDisputeEmailParams {
  to: string;
  subject: string;
  html: string;
  /** Supabase user ID of the notification recipient */
  userId: string;
  /** Dispute this notification relates to */
  disputeId: string;
  /** Machine-readable notification type for deduplication (e.g. "dispute_filed", "deadline_reminder_7d") */
  notificationType: string;
  /** Human-readable notification title shown in-app */
  notificationTitle: string;
  /** Human-readable notification body shown in-app */
  notificationBody: string;
}

/**
 * Generate a human-readable verification code: KV-XXXX-XXXX.
 * Uppercase alphanumeric, excluding ambiguous characters (0/O, 1/I/L).
 */
function generateVerificationCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `KV-${segment()}-${segment()}`;
}

/**
 * Send a dispute-related email via Resend and create a notification record
 * in the database. Also generates an email verification code that recipients
 * can use to confirm the email is genuine. Errors are logged but never
 * thrown -- email failures must not break the main application flow.
 */
export async function sendDisputeEmail(
  params: SendDisputeEmailParams,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();

  // 1. Create the notification record first (even if email fails,
  //    the user will see it in-app)
  const { data: notification, error: notifError } = await supabase
    .from("notifications")
    .insert({
      user_id: params.userId,
      dispute_id: params.disputeId,
      type: params.notificationType,
      title: params.notificationTitle,
      body: params.notificationBody,
      email_sent: false,
    })
    .select("id")
    .single();

  if (notifError) {
    console.error("[email] Failed to create notification:", notifError);
  }

  // 2. Generate a verification code and inject it into the email HTML
  let html = params.html;
  if (html.includes(VERIFICATION_PLACEHOLDER)) {
    const code = generateVerificationCode();
    const { error: codeError } = await supabase.from("email_verifications").insert({
      verification_code: code,
      recipient_email: params.to,
      email_type: params.notificationType,
      subject: params.subject,
      dispute_id: params.disputeId,
      sent_at: new Date().toISOString(),
    });

    if (codeError) {
      console.error("[email] Failed to create verification code:", codeError);
      html = html.replace(VERIFICATION_PLACEHOLDER, "");
    } else {
      html = html.replace(VERIFICATION_PLACEHOLDER, code);
    }
  }

  // 3. Send the email via Resend
  try {
    const { error } = await resend.emails.send({
      from: `Kestrel <notifications@${process.env.RESEND_FROM_DOMAIN || "kestrel.pellar.co.uk"}>`,
      to: params.to,
      subject: params.subject,
      html,
    });

    if (error) {
      console.error("[email] Resend API error:", error);
      return { success: false, error: error.message };
    }

    // 4. Mark notification as sent
    if (notification?.id) {
      await supabase
        .from("notifications")
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
        })
        .eq("id", notification.id);
    }

    return { success: true };
  } catch (err) {
    console.error("[email] Send exception:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}
