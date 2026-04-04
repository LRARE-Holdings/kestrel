import { createClient } from "@kestrel/shared/supabase/server";

/**
 * Check whether a feature flag is enabled.
 * Returns false if the flag does not exist or the query fails.
 */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("feature_flags")
    .select("enabled")
    .eq("flag_key", key)
    .single();
  return data?.enabled ?? false;
}
