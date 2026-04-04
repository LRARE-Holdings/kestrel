import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@kestrel/shared/supabase/service";
import { resend } from "@kestrel/shared/email/client";
import { adminDigestEmail } from "@/lib/email/templates/admin-digest";

/**
 * GET /api/cron/admin-digest
 *
 * Cron endpoint that sends a daily admin digest email to all
 * admin users. Secured by CRON_SECRET Bearer token.
 *
 * Gathers platform metrics from the last 24 hours and sends
 * a branded summary email via Resend.
 *
 * Schedule: Weekdays at 07:00 UTC (see vercel.json)
 */
export async function GET(request: NextRequest) {
  // 1. Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();
    const today = new Date().toISOString().split("T")[0];

    // 2. Gather metrics (parallel queries)
    const [
      newSignUpsResult,
      newDisputesResult,
      escalatedDisputesResult,
      overdueFollowUpsResult,
      totalUsersResult,
      totalDisputesResult,
      recentSignUpsResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", twentyFourHoursAgo),
      supabase
        .from("disputes")
        .select("*", { count: "exact", head: true })
        .gte("created_at", twentyFourHoursAgo),
      supabase
        .from("disputes")
        .select("*", { count: "exact", head: true })
        .eq("status", "escalated")
        .gte("escalated_at", twentyFourHoursAgo),
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .lte("next_action_date", today),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("disputes")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("display_name, email, business_name, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    // 3. Get admin users
    const { data: adminUsers } = await supabase
      .from("admin_users")
      .select("user_id");

    if (!adminUsers || adminUsers.length === 0) {
      return NextResponse.json({
        message: "No admin users found, skipping digest",
        sent: 0,
        failed: 0,
      });
    }

    // 4. Get admin emails from auth.users
    const adminEmails: string[] = [];
    for (const admin of adminUsers) {
      const {
        data: { user },
      } = await supabase.auth.admin.getUserById(admin.user_id);
      if (user?.email) {
        adminEmails.push(user.email);
      }
    }

    if (adminEmails.length === 0) {
      return NextResponse.json({
        message: "No admin email addresses found, skipping digest",
        sent: 0,
        failed: 0,
      });
    }

    // 5. Generate digest email
    const dateStr = new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const { subject, html } = adminDigestEmail({
      newSignUps: newSignUpsResult.count ?? 0,
      newDisputes: newDisputesResult.count ?? 0,
      escalatedDisputes: escalatedDisputesResult.count ?? 0,
      overdueFollowUps: overdueFollowUpsResult.count ?? 0,
      totalUsers: totalUsersResult.count ?? 0,
      totalDisputes: totalDisputesResult.count ?? 0,
      recentSignUps: recentSignUpsResult.data ?? [],
      date: dateStr,
    });

    // 6. Send to all admins
    const results = await Promise.allSettled(
      adminEmails.map((email) =>
        resend.emails.send({
          from: `Kestrel <admin@${process.env.RESEND_FROM_DOMAIN || "kestrel.pellar.co.uk"}>`,
          to: email,
          subject,
          html,
        }),
      ),
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      sent,
      failed,
      total: adminEmails.length,
      date: dateStr,
    });
  } catch (error) {
    console.error("[admin-digest] Cron job failed:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
