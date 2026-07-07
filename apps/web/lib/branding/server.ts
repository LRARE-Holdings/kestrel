import "server-only";
import { cache } from "react";
import { createClient } from "@kestrel/shared/supabase/server";
import { isValidSlug } from "@/lib/branding/slug";
import {
  DEFAULT_BRANDING,
  resolveBranding,
  type BrandingRow,
  type ResolvedBranding,
} from "@/lib/branding/types";

/**
 * Fetch firm branding for a slug via the anon-safe `get_organisation_branding`
 * RPC. This runs on the UNAUTHENTICATED login page, so it must never throw:
 *
 *   - An invalid slug, an unknown firm, an RPC error, or a not-yet-applied
 *     migration all resolve to the default Kestrel branding.
 *   - Wrapped in {@link cache} so a layout and its page share one round-trip
 *     per request.
 */
export const getBranding = cache(
  async (slug: string): Promise<ResolvedBranding> => {
    if (!isValidSlug(slug)) return DEFAULT_BRANDING;

    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc(
        // Cast: these definitions live in a migration that may not be applied
        // yet, so they are absent from the generated Supabase types.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "get_organisation_branding" as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { org_slug: slug } as any,
      );

      if (error) return DEFAULT_BRANDING;

      const row = (Array.isArray(data) ? data[0] : data) as
        | BrandingRow
        | null
        | undefined;

      return resolveBranding(row ?? null);
    } catch {
      // Missing env vars, missing function, network failure — degrade quietly.
      return DEFAULT_BRANDING;
    }
  },
);
