import { resend } from "./client";
import { createServiceClient } from "@/lib/supabase/service";

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
 * Send a dispute-related email via Resend and create a notification record
 * in the database. Errors are logged but never thrown -- email failures
 * must not break the main application flow.
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

  // 2. Send the email via Resend
  try {
    const { error } = await resend.emails.send({
      from: "Kestrel <notifications@kestrel.law>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      console.error("[email] Resend API error:", error);
      return { success: false, error: error.message };
    }

    // 3. Mark notification as sent
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
