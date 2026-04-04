import { NextResponse } from "next/server";
import { createServiceClient } from "@kestrel/shared/supabase/service";
import { sendDisputeEmail } from "@kestrel/shared/email/send";
import { deadlineReminderEmail } from "@/lib/email/templates/deadline-reminder";

/**
 * Cron endpoint for sending deadline reminder emails.
 *
 * Checks disputes with status 'filed' or 'awaiting_response' where
 * the response_deadline is approaching (7d, 3d, 1d) or overdue.
 * Deduplicates by checking if a notification of the matching type
 * has already been sent for that dispute + user combination.
 *
 * Secured with CRON_SECRET Bearer token.
 * Intended to be called daily by Vercel Cron.
 */
export async function GET(request: Request) {
  // Verify cron secret
  if (
    request.headers.get("authorization") !==
    `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createServiceClient();

  try {
    // Fetch disputes with an active response deadline
    const { data: disputes, error: disputesError } = await supabase
      .from("disputes")
      .select(
        "id, reference_number, subject, response_deadline, responding_party_id, responding_party_email",
      )
      .in("status", ["filed", "awaiting_response"])
      .not("response_deadline", "is", null)
      .not("responding_party_id", "is", null);

    if (disputesError) {
      console.error("[cron/deadline-reminders] Query error:", disputesError);
      return NextResponse.json(
        { error: "Failed to query disputes" },
        { status: 500 },
      );
    }

    if (!disputes || disputes.length === 0) {
      return NextResponse.json({ message: "No disputes with active deadlines", sent: 0 });
    }

    const now = new Date();
    let sent = 0;
    let skipped = 0;

    for (const dispute of disputes) {
      if (!dispute.response_deadline || !dispute.responding_party_id) continue;

      const deadline = new Date(dispute.response_deadline);
      const diffMs = deadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Determine which reminder tier applies
      const tier = getReminderTier(diffDays);
      if (!tier) {
        skipped++;
        continue;
      }

      // Check if this reminder type has already been sent
      const { data: existingNotif } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", dispute.responding_party_id)
        .eq("dispute_id", dispute.id)
        .eq("type", tier.notificationType)
        .limit(1)
        .maybeSingle();

      if (existingNotif) {
        skipped++;
        continue;
      }

      // Look up the respondent profile for their name
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, email")
        .eq("id", dispute.responding_party_id)
        .single();

      const recipientName = profile?.display_name || "there";
      const recipientEmail =
        profile?.email || dispute.responding_party_email;

      if (!recipientEmail) {
        skipped++;
        continue;
      }

      // Generate the email
      const email = deadlineReminderEmail({
        recipientName,
        referenceNumber: dispute.reference_number,
        disputeId: dispute.id,
        daysRemaining: tier.daysRemaining,
      });

      // Send email + create notification
      const result = await sendDisputeEmail({
        to: recipientEmail,
        subject: email.subject,
        html: email.html,
        userId: dispute.responding_party_id,
        disputeId: dispute.id,
        notificationType: tier.notificationType,
        notificationTitle: email.subject,
        notificationBody: tier.notificationBody(dispute.reference_number),
      });

      if (result.success) {
        sent++;
      } else {
        console.error(
          `[cron/deadline-reminders] Failed for dispute ${dispute.id}:`,
          result.error,
        );
      }
    }

    return NextResponse.json({
      message: "Deadline reminders processed",
      total: disputes.length,
      sent,
      skipped,
    });
  } catch (err) {
    console.error("[cron/deadline-reminders] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 },
    );
  }
}

// ── Reminder tier logic ────────────────────────────────────────────────────

interface ReminderTier {
  daysRemaining: number;
  notificationType: string;
  notificationBody: (ref: string) => string;
}

/**
 * Map the number of days until deadline to a reminder tier.
 * Returns null if no reminder should be sent.
 *
 * Tiers:
 *  - 7 days remaining
 *  - 3 days remaining
 *  - 1 day remaining
 *  - 0 or fewer (overdue)
 */
function getReminderTier(daysUntilDeadline: number): ReminderTier | null {
  if (daysUntilDeadline <= 0) {
    return {
      daysRemaining: -1,
      notificationType: "deadline_overdue",
      notificationBody: (ref) =>
        `The response deadline for dispute ${ref} has passed. Please respond as soon as possible.`,
    };
  }

  if (daysUntilDeadline === 1) {
    return {
      daysRemaining: 1,
      notificationType: "deadline_reminder_1d",
      notificationBody: (ref) =>
        `The response deadline for dispute ${ref} is tomorrow.`,
    };
  }

  if (daysUntilDeadline <= 3) {
    return {
      daysRemaining: daysUntilDeadline,
      notificationType: "deadline_reminder_3d",
      notificationBody: (ref) =>
        `The response deadline for dispute ${ref} is in ${daysUntilDeadline} days.`,
    };
  }

  if (daysUntilDeadline <= 7) {
    return {
      daysRemaining: daysUntilDeadline,
      notificationType: "deadline_reminder_7d",
      notificationBody: (ref) =>
        `The response deadline for dispute ${ref} is in ${daysUntilDeadline} days.`,
    };
  }

  // More than 7 days out -- no reminder needed
  return null;
}
