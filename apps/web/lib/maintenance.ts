import { createClient } from "@kestrel/shared/supabase/server";
import { getSiteSetting } from "@kestrel/shared/supabase/site-settings";

/**
 * Check if maintenance mode is active.
 * Reads from the site_settings table (public read RLS).
 */
export async function isMaintenanceMode(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const value = await getSiteSetting(supabase, "maintenance_mode");
    return value === true;
  } catch {
    // If we can't check, assume not in maintenance — fail open for users
    return false;
  }
}
