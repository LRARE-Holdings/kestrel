import { createClient } from "@kestrel/shared/supabase/server";

export async function getAllSiteSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value, updated_at")
    .order("key");

  const result: Record<string, unknown> = {};
  for (const row of data ?? []) {
    result[row.key] = row.value;
  }
  return { data: result, error };
}

export async function getAllFeatureFlags() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feature_flags")
    .select("*")
    .order("flag_key");
  return { data: data ?? [], error };
}
