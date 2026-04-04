import { createServiceClient } from "@kestrel/shared/supabase/service";

export interface AdminMember {
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

export async function listAdminUsers(): Promise<AdminMember[]> {
  const supabase = createServiceClient();
  const { data: admins } = await supabase
    .from("admin_users")
    .select("user_id, role, created_at")
    .order("created_at", { ascending: true });

  if (!admins || admins.length === 0) return [];

  const members: AdminMember[] = [];
  for (const admin of admins) {
    const {
      data: { user },
    } = await supabase.auth.admin.getUserById(admin.user_id);
    members.push({
      user_id: admin.user_id,
      email: user?.email ?? "Unknown",
      role: admin.role,
      created_at: admin.created_at,
    });
  }
  return members;
}
