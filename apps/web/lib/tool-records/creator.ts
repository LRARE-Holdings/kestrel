import { createClient } from "@kestrel/shared/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@kestrel/shared/supabase/types";

/**
 * Tool records (handshakes, notices, milestone projects) are created by
 * service-role API routes and read publicly via an access token. To let a
 * signed-in creator find them again we stamp an optional `created_by` column.
 *
 * The `created_by` column is added by a migration that CANNOT be applied from
 * the build session, so every read and write here degrades gracefully when the
 * column is not present yet: writes fall back to a plain insert and reads
 * simply return nothing.
 */

type Postgrestish = { code?: string; message?: string } | null | undefined;

/**
 * True when a Postgrest error indicates the `created_by` column does not exist
 * yet (pre-migration). PGRST204 = column not found in schema cache;
 * 42703 = undefined_column at the database level.
 */
export function isMissingCreatedByError(error: Postgrestish): boolean {
  if (!error) return false;
  if (error.code === "PGRST204" || error.code === "42703") return true;
  const message = error.message ?? "";
  return /created_by/i.test(message) && /column|schema cache/i.test(message);
}

/**
 * Resolve the currently signed-in user's id from the request cookies, if any.
 * Returns null for anonymous callers. Never throws.
 */
export async function resolveCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

interface InsertResult<T> {
  data: T | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

/**
 * Insert a tool record, stamping `created_by` when a creator id is available.
 * If the `created_by` column has not been migrated yet, the insert is retried
 * without it so tool creation never breaks in production.
 */
export async function insertToolRecord<T = { id?: string; access_token?: string }>(
  supabase: SupabaseClient<Database>,
  table: "handshakes" | "notices" | "projects",
  payload: Record<string, unknown>,
  createdBy: string | null,
  returning: string,
): Promise<InsertResult<T>> {
  if (createdBy) {
    const first = (await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(table as any)
      .insert({ ...payload, created_by: createdBy })
      .select(returning)
      .single()) as InsertResult<T>;

    if (!isMissingCreatedByError(first.error)) {
      return first;
    }
    // Column not migrated yet — fall through to a plain insert so the tool
    // keeps working. The record simply won't be linked to the creator until
    // the migration lands.
  }

  return (await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from(table as any)
    .insert(payload)
    .select(returning)
    .single()) as InsertResult<T>;
}
