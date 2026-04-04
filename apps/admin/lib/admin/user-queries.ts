import { createServiceClient } from "@kestrel/shared/supabase/service";

const DEFAULT_PAGE_SIZE = 20;

export interface UserListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface UserListItem {
  id: string;
  display_name: string;
  email: string;
  business_name: string | null;
  plan: string | null;
  document_count: number;
  dispute_count: number;
  created_at: string | null;
}

export interface UserListResult {
  users: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listUsers({
  search,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: UserListParams): Promise<UserListResult> {
  const supabase = createServiceClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Build the profiles query
  let query = supabase
    .from("profiles")
    .select("id, display_name, email, business_name, created_at", {
      count: "exact",
    })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  // Apply search filter across multiple columns
  if (search && search.trim().length > 0) {
    const term = `%${search.trim()}%`;
    query = query.or(
      `display_name.ilike.${term},email.ilike.${term},business_name.ilike.${term}`,
    );
  }

  const { data: profiles, count, error } = await query;

  if (error) {
    throw new Error(`Failed to list users: ${error.message}`);
  }

  if (!profiles || profiles.length === 0) {
    return {
      users: [],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  const userIds = profiles.map((p) => p.id);

  // Fetch subscription plans and counts in parallel
  const [subscriptionsResult, documentCountsResult, disputeCountsResult] =
    await Promise.all([
      supabase
        .from("subscriptions")
        .select("user_id, plan")
        .in("user_id", userIds),

      supabase
        .from("saved_documents")
        .select("user_id")
        .is("deleted_at", null)
        .in("user_id", userIds),

      supabase
        .from("disputes")
        .select("initiating_party_id")
        .is("deleted_at", null)
        .in("initiating_party_id", userIds),
    ]);

  // Build lookup maps
  const planMap = new Map<string, string>();
  if (subscriptionsResult.data) {
    for (const sub of subscriptionsResult.data) {
      planMap.set(sub.user_id, sub.plan);
    }
  }

  const docCountMap = new Map<string, number>();
  if (documentCountsResult.data) {
    for (const doc of documentCountsResult.data) {
      docCountMap.set(doc.user_id, (docCountMap.get(doc.user_id) ?? 0) + 1);
    }
  }

  const disputeCountMap = new Map<string, number>();
  if (disputeCountsResult.data) {
    for (const d of disputeCountsResult.data) {
      disputeCountMap.set(
        d.initiating_party_id,
        (disputeCountMap.get(d.initiating_party_id) ?? 0) + 1,
      );
    }
  }

  const users: UserListItem[] = profiles.map((p) => ({
    id: p.id,
    display_name: p.display_name,
    email: p.email,
    business_name: p.business_name,
    plan: planMap.get(p.id) ?? null,
    document_count: docCountMap.get(p.id) ?? 0,
    dispute_count: disputeCountMap.get(p.id) ?? 0,
    created_at: p.created_at,
  }));

  const total = count ?? 0;

  return {
    users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export interface UserDetail {
  id: string;
  display_name: string;
  email: string;
  business_name: string | null;
  business_type: string | null;
  company_size: string | null;
  industry: string | null;
  phone: string | null;
  onboarding_completed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  subscription: {
    plan: string;
    status: string;
    current_period_start: string | null;
    current_period_end: string | null;
  } | null;
  documentCount: number;
  disputeCount: number;
  isBanned: boolean;
}

export async function getUserDetail(
  userId: string,
): Promise<UserDetail | null> {
  const supabase = createServiceClient();

  const [profileResult, subscriptionResult, docCountResult, disputeCountResult, authUserResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, display_name, email, business_name, business_type, company_size, industry, phone, onboarding_completed, created_at, updated_at",
        )
        .eq("id", userId)
        .is("deleted_at", null)
        .single(),

      supabase
        .from("subscriptions")
        .select("plan, status, current_period_start, current_period_end")
        .eq("user_id", userId)
        .maybeSingle(),

      supabase
        .from("saved_documents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("deleted_at", null),

      supabase
        .from("disputes")
        .select("*", { count: "exact", head: true })
        .eq("initiating_party_id", userId)
        .is("deleted_at", null),

      supabase.auth.admin.getUserById(userId),
    ]);

  if (profileResult.error || !profileResult.data) {
    return null;
  }

  const profile = profileResult.data;
  const isBanned =
    authUserResult.data?.user?.banned_until != null &&
    new Date(authUserResult.data.user.banned_until).getTime() > Date.now();

  return {
    id: profile.id,
    display_name: profile.display_name,
    email: profile.email,
    business_name: profile.business_name,
    business_type: profile.business_type,
    company_size: profile.company_size,
    industry: profile.industry,
    phone: profile.phone,
    onboarding_completed: profile.onboarding_completed,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    subscription: subscriptionResult.data,
    documentCount: docCountResult.count ?? 0,
    disputeCount: disputeCountResult.count ?? 0,
    isBanned,
  };
}

export async function toggleUserBan(
  userId: string,
  banned: boolean,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();

  const banUntil = banned ? "2099-12-31T23:59:59Z" : "1970-01-01T00:00:00Z";

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: banned ? "876000h" : "none",
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
