"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@kestrel/shared/supabase/server";
import { getAdminUser } from "@/lib/auth/actions";

interface ActionResult {
  error?: string;
  success?: boolean;
}

// ---------------------------------------------------------------------------
// Announcement settings
// ---------------------------------------------------------------------------

const announcementSchema = z.object({
  enabled: z.boolean(),
  text: z.string().max(200, "Announcement text must be 200 characters or fewer"),
  link: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  style: z.enum(["info", "warning", "success"]),
});

export async function updateAnnouncementSettings(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const parsed = announcementSchema.safeParse({
    enabled: formData.get("enabled") === "true",
    text: formData.get("text") ?? "",
    link: formData.get("link") ?? "",
    style: formData.get("style") ?? "info",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const supabase = await createClient();
  const entries: Record<string, unknown> = {
    announcement_enabled: parsed.data.enabled,
    announcement_text: parsed.data.text,
    announcement_link: parsed.data.link || "",
    announcement_style: parsed.data.style,
  };

  for (const [key, val] of Object.entries(entries)) {
    // Ensure value is never null/undefined — jsonb column is NOT NULL
    const jsonValue = val === null || val === undefined ? "" : val;
    const { error } = await supabase.from("site_settings").upsert(
      {
        key,
        value: jsonValue as any,
        updated_by: admin.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
    if (error) return { error: `Failed to save ${key}: ${error.message}` };
  }

  revalidatePath("/settings");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Feature flags
// ---------------------------------------------------------------------------

export async function toggleFeatureFlag(
  flagId: string,
  enabled: boolean,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("feature_flags")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("id", flagId);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}

const createFlagSchema = z.object({
  flag_key: z
    .string()
    .min(1, "Flag key is required")
    .regex(/^[a-z][a-z0-9_]*$/, "Must be snake_case (lowercase letters, numbers, underscores)"),
  description: z.string().optional(),
});

export async function createFeatureFlag(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const parsed = createFlagSchema.safeParse({
    flag_key: formData.get("flag_key") ?? "",
    description: formData.get("description") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("feature_flags").insert({
    flag_key: parsed.data.flag_key,
    description: parsed.data.description || null,
    enabled: false,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A flag with that key already exists" };
    }
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Site config
// ---------------------------------------------------------------------------

export async function updateSiteConfig(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const maintenanceMode = formData.get("maintenance_mode") === "true";

  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert(
    {
      key: "maintenance_mode",
      value: maintenanceMode as any,
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}
