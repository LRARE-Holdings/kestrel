"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@kestrel/shared/supabase/service";
import { getAdminUser } from "@/lib/auth/actions";

interface ActionResult {
  error?: string;
  success?: boolean;
}

// ---------------------------------------------------------------------------
// Invite admin
// ---------------------------------------------------------------------------

const inviteSchema = z.object({
  email: z.string().email("A valid email address is required"),
  role: z.enum(["admin", "super_admin"], {
    message: "Role must be admin or super_admin",
  }),
});

export async function inviteAdmin(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };
  if (admin.role !== "super_admin") return { error: "Only super admins can invite new admins" };

  const parsed = inviteSchema.safeParse({
    email: formData.get("email") ?? "",
    role: formData.get("role") ?? "admin",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const supabase = createServiceClient();

  // Look up the user by email
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) return { error: `Failed to look up users: ${listError.message}` };

  const targetUser = listData.users.find(
    (u) => u.email?.toLowerCase() === parsed.data.email.toLowerCase(),
  );

  if (!targetUser) {
    return { error: "No user found with that email address. They must have an account first." };
  }

  // Check if already an admin
  const { data: existing } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", targetUser.id)
    .maybeSingle();

  if (existing) {
    return { error: "This user is already an admin" };
  }

  // Insert into admin_users
  const { error: insertError } = await supabase.from("admin_users").insert({
    user_id: targetUser.id,
    role: parsed.data.role,
  });

  if (insertError) return { error: insertError.message };

  // Update app_metadata
  const { error: metaError } = await supabase.auth.admin.updateUserById(targetUser.id, {
    app_metadata: { admin: true, admin_role: parsed.data.role },
  });

  if (metaError) return { error: `Admin added but failed to update metadata: ${metaError.message}` };

  revalidatePath("/settings");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Remove admin
// ---------------------------------------------------------------------------

export async function removeAdmin(userId: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };
  if (admin.role !== "super_admin") return { error: "Only super admins can remove admins" };
  if (admin.id === userId) return { error: "You cannot remove yourself" };

  const supabase = createServiceClient();

  const { error: deleteError } = await supabase
    .from("admin_users")
    .delete()
    .eq("user_id", userId);

  if (deleteError) return { error: deleteError.message };

  const { error: metaError } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { admin: false, admin_role: null },
  });

  if (metaError) return { error: `Admin removed but failed to update metadata: ${metaError.message}` };

  revalidatePath("/settings");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Change admin role
// ---------------------------------------------------------------------------

export async function changeAdminRole(
  userId: string,
  newRole: string,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };
  if (admin.role !== "super_admin") return { error: "Only super admins can change roles" };

  if (newRole !== "admin" && newRole !== "super_admin") {
    return { error: "Invalid role" };
  }

  const supabase = createServiceClient();

  const { error: updateError } = await supabase
    .from("admin_users")
    .update({ role: newRole })
    .eq("user_id", userId);

  if (updateError) return { error: updateError.message };

  const { error: metaError } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { admin: true, admin_role: newRole },
  });

  if (metaError) return { error: `Role updated but failed to update metadata: ${metaError.message}` };

  revalidatePath("/settings");
  return { success: true };
}
