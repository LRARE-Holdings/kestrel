import type { SupabaseClient } from "@supabase/supabase-js";

export interface AnnouncementSettings {
  enabled: boolean;
  text: string;
  link: string | null;
  style: "info" | "warning" | "success";
}

export async function getAnnouncementSettings(
  supabase: SupabaseClient,
): Promise<AnnouncementSettings> {
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", [
      "announcement_enabled",
      "announcement_text",
      "announcement_link",
      "announcement_style",
    ]);

  const settings: Record<string, unknown> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }

  return {
    enabled: settings.announcement_enabled === true,
    text: typeof settings.announcement_text === "string" ? settings.announcement_text : "",
    link:
      typeof settings.announcement_link === "string" && settings.announcement_link
        ? settings.announcement_link
        : null,
    style: ["info", "warning", "success"].includes(settings.announcement_style as string)
      ? (settings.announcement_style as "info" | "warning" | "success")
      : "info",
  };
}

export async function getSiteSetting(
  supabase: SupabaseClient,
  key: string,
): Promise<unknown> {
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single();
  return data?.value ?? null;
}

export async function getAllSiteSettings(
  supabase: SupabaseClient,
): Promise<Record<string, unknown>> {
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .order("key");

  const result: Record<string, unknown> = {};
  for (const row of data ?? []) {
    result[row.key] = row.value;
  }
  return result;
}
