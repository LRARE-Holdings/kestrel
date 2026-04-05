import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@kestrel/shared/supabase/service";
import { computeLeadScore } from "@/lib/leads/scoring";

/**
 * GET /api/cron/lead-scoring
 *
 * Cron endpoint that scores platform users as leads based on
 * their activity signals. Secured by CRON_SECRET Bearer token.
 *
 * For each non-subscribed user with a score > 20:
 * - Updates existing lead record, or
 * - Creates a new lead from their profile
 *
 * Schedule: Daily at 03:00 UTC (see vercel.json)
 */
export async function GET(request: NextRequest) {
  // 1. Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // 2. Parallel fetch all data needed for scoring
    const [
      profilesRes,
      docsRes,
      disputesRes,
      toolEventsRes,
      subsRes,
      recentDocsRes,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, business_name, display_name, onboarding_completed")
        .is("deleted_at", null),
      supabase
        .from("saved_documents")
        .select("user_id")
        .is("deleted_at", null),
      supabase
        .from("disputes")
        .select("initiating_party_id")
        .is("deleted_at", null),
      supabase
        .from("tool_usage_events")
        .select("user_id, tool_name")
        .not("user_id", "is", null),
      supabase.from("subscriptions").select("user_id"),
      supabase
        .from("saved_documents")
        .select("user_id")
        .gte("created_at", sevenDaysAgo),
    ]);

    const profiles = profilesRes.data ?? [];
    if (profiles.length === 0) {
      return NextResponse.json({
        message: "No profiles to score",
        scored: 0,
        created: 0,
        total: 0,
      });
    }

    // 3. Build lookup maps for efficient scoring
    const docCountByUser = new Map<string, number>();
    for (const doc of docsRes.data ?? []) {
      docCountByUser.set(
        doc.user_id,
        (docCountByUser.get(doc.user_id) ?? 0) + 1,
      );
    }

    const hasDisputeByUser = new Set(
      (disputesRes.data ?? []).map((d) => d.initiating_party_id),
    );

    const toolsByUser = new Map<string, Set<string>>();
    for (const evt of toolEventsRes.data ?? []) {
      if (!evt.user_id) continue;
      if (!toolsByUser.has(evt.user_id))
        toolsByUser.set(evt.user_id, new Set());
      toolsByUser.get(evt.user_id)!.add(evt.tool_name);
    }

    const hasSubscription = new Set(
      (subsRes.data ?? []).map((s) => s.user_id),
    );
    const recentActiveUsers = new Set(
      (recentDocsRes.data ?? []).map((d) => d.user_id),
    );

    // 4. Score each user and upsert leads
    let scored = 0;
    let created = 0;

    for (const profile of profiles) {
      // Skip users who already have a paid subscription
      if (hasSubscription.has(profile.id)) continue;

      const breakdown = computeLeadScore({
        hasAccount: true,
        completedOnboarding: profile.onboarding_completed ?? false,
        documentsGenerated: docCountByUser.get(profile.id) ?? 0,
        filedDispute: hasDisputeByUser.has(profile.id),
        toolsUsed: toolsByUser.get(profile.id)?.size ?? 0,
        hasBusinessName: !!profile.business_name,
        lastActivityWithin7Days: recentActiveUsers.has(profile.id),
      });

      if (breakdown.total <= 20) continue;

      const now = new Date().toISOString();

      // Check if lead already exists by email
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id")
        .eq("email", profile.email)
        .maybeSingle();

      if (existingLead) {
        await supabase
          .from("leads")
          .update({
            score: breakdown.total,
            score_breakdown: breakdown,
            last_scored_at: now,
          })
          .eq("id", existingLead.id);
        scored++;
      } else {
        await supabase.from("leads").insert({
          name: profile.display_name,
          email: profile.email,
          company: profile.business_name,
          source: "platform",
          stage: "lead",
          status: "active",
          score: breakdown.total,
          score_breakdown: breakdown,
          last_scored_at: now,
        });
        created++;
      }
    }

    return NextResponse.json({ scored, created, total: profiles.length });
  } catch (error) {
    console.error("[lead-scoring] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
