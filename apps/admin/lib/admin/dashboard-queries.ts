import { unstable_cache } from "next/cache";
import { createServiceClient } from "@kestrel/shared/supabase/service";

export interface DashboardMetrics {
  totalUsers: number;
  newUsersWeek: number;
  newUsersMonth: number;
  totalDocuments: number;
  docsByType: Record<string, number>;
  totalDisputes: number;
  activeDisputes: number;
  disputesByStatus: Record<string, number>;
  subscriptions: {
    total: number;
    paid: number;
    byPlan: Record<string, number>;
  };
  recentUsers: Array<{
    id: string;
    display_name: string;
    email: string;
    business_name: string | null;
    created_at: string | null;
  }>;
}

async function getDashboardMetricsInternal(): Promise<DashboardMetrics> {
  const supabase = createServiceClient();

  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [
    totalUsersResult,
    newUsersWeekResult,
    newUsersMonthResult,
    totalDocumentsResult,
    docsResult,
    totalDisputesResult,
    disputesResult,
    subscriptionsResult,
    recentUsersResult,
  ] = await Promise.all([
    // 1. Total users
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),

    // 2. New users in last 7 days
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("created_at", sevenDaysAgo),

    // 3. New users in last 30 days
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("created_at", thirtyDaysAgo),

    // 4. Total documents
    supabase
      .from("saved_documents")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),

    // 5. Documents by type
    supabase
      .from("saved_documents")
      .select("document_type")
      .is("deleted_at", null),

    // 6. Total disputes
    supabase
      .from("disputes")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),

    // 7. Disputes with status for breakdown
    supabase
      .from("disputes")
      .select("status")
      .is("deleted_at", null),

    // 8. Subscriptions
    supabase.from("subscriptions").select("plan, status"),

    // 9. Recent sign-ups
    supabase
      .from("profiles")
      .select("id, display_name, email, business_name, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Group documents by type
  const docsByType: Record<string, number> = {};
  if (docsResult.data) {
    for (const doc of docsResult.data) {
      const type = doc.document_type;
      docsByType[type] = (docsByType[type] ?? 0) + 1;
    }
  }

  // Group disputes by status and count active
  const disputesByStatus: Record<string, number> = {};
  const terminalStatuses = new Set(["resolved", "withdrawn", "expired"]);
  let activeDisputes = 0;

  if (disputesResult.data) {
    for (const dispute of disputesResult.data) {
      const status = dispute.status;
      disputesByStatus[status] = (disputesByStatus[status] ?? 0) + 1;
      if (!terminalStatuses.has(status)) {
        activeDisputes++;
      }
    }
  }

  // Aggregate subscriptions
  const subscriptionData = {
    total: 0,
    paid: 0,
    byPlan: {} as Record<string, number>,
  };

  if (subscriptionsResult.data) {
    subscriptionData.total = subscriptionsResult.data.length;
    for (const sub of subscriptionsResult.data) {
      subscriptionData.byPlan[sub.plan] =
        (subscriptionData.byPlan[sub.plan] ?? 0) + 1;
      if (sub.plan !== "free" && sub.status === "active") {
        subscriptionData.paid++;
      }
    }
  }

  return {
    totalUsers: totalUsersResult.count ?? 0,
    newUsersWeek: newUsersWeekResult.count ?? 0,
    newUsersMonth: newUsersMonthResult.count ?? 0,
    totalDocuments: totalDocumentsResult.count ?? 0,
    docsByType,
    totalDisputes: totalDisputesResult.count ?? 0,
    activeDisputes,
    disputesByStatus,
    subscriptions: subscriptionData,
    recentUsers: recentUsersResult.data ?? [],
  };
}

export const getDashboardMetrics = unstable_cache(
  getDashboardMetricsInternal,
  ["admin-dashboard-metrics"],
  { revalidate: 60 },
);
