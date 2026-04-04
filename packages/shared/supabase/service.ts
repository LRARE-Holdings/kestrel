import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client using the service role key.
 * Bypasses RLS — use only in server-side API routes for
 * operations that require elevated privileges (e.g. anonymous
 * writes, cron jobs, webhook handlers).
 *
 * NEVER import this in client components or expose the key.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
