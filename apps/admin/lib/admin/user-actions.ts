"use server";

import { revalidatePath } from "next/cache";
import { toggleUserBan } from "@/lib/admin/user-queries";

export async function toggleBanAction(
  formData: FormData,
): Promise<void> {
  const userId = formData.get("userId") as string;
  const banned = formData.get("banned") === "true";

  if (!userId) {
    throw new Error("Missing userId");
  }

  const result = await toggleUserBan(userId, banned);

  if (!result.success) {
    throw new Error(result.error ?? "Failed to update user status");
  }

  revalidatePath(`/users/${userId}`);
}
