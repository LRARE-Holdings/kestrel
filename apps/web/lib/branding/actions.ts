"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@kestrel/shared/supabase/server";
import { verifyFileMagicBytes } from "@/lib/security/file-validation";
import { darken, isValidHex } from "@/lib/branding/colors";
import { isValidSlug } from "@/lib/branding/slug";
import {
  createOrganisationSchema,
  updateBrandingSchema,
  LOGO_ALLOWED_TYPES,
  LOGO_MAX_BYTES,
} from "@/lib/branding/schemas";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface OrgRecord {
  id: string;
  slug: string;
  display_name: string;
  logo_url: string | null;
  brand_color: string;
  brand_color_hover: string;
  tagline: string | null;
}

export type OrgContext =
  | { state: "unavailable" }
  | { state: "none" }
  | { state: "member"; role: "owner" | "member"; org: OrgRecord };

/**
 * A missing table/function (migration not applied) is a legitimate
 * "feature not live yet" state, not a crash. Detect it broadly so we can show an
 * honest "not available yet" message instead of a 500.
 */
function isMissingRelationError(
  error: { code?: string; message?: string } | null,
): boolean {
  if (!error) return false;
  const code = error.code ?? "";
  if (["PGRST205", "PGRST202", "42P01", "42883"].includes(code)) return true;
  const message = error.message ?? "";
  return /(does not exist|schema cache|could not find|not find)/i.test(message);
}

/**
 * Resolve the signed-in user's organisation context for the settings page.
 * Never throws — a missing migration or query failure yields "unavailable".
 */
export async function getOrganisationContext(): Promise<OrgContext> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { state: "none" };

    const { data: membership, error } = await supabase
      .from("organisation_members" as any)
      .select("role, organisation_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      if (isMissingRelationError(error)) return { state: "unavailable" };
      return { state: "unavailable" };
    }
    if (!membership) return { state: "none" };

    const { data: org, error: orgError } = await supabase
      .from("organisations" as any)
      .select(
        "id, slug, display_name, logo_url, brand_color, brand_color_hover, tagline",
      )
      .eq("id", (membership as any).organisation_id)
      .maybeSingle();

    if (orgError || !org) return { state: "unavailable" };

    return {
      state: "member",
      role: (membership as any).role === "owner" ? "owner" : "member",
      org: org as unknown as OrgRecord,
    };
  } catch {
    return { state: "unavailable" };
  }
}

/**
 * Check whether a slug is free. Falls back gracefully: if the RPC is
 * unavailable (migration not applied), returns `checked: false` so the UI can
 * present the slug as tentatively usable without a false "taken" claim.
 */
export async function checkSlugAvailability(
  slug: string,
): Promise<{ available: boolean; checked: boolean }> {
  if (!isValidSlug(slug)) return { available: false, checked: true };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(
      "organisation_slug_available" as any,
      { org_slug: slug } as any,
    );
    if (error) return { available: true, checked: false };
    return { available: data === true, checked: true };
  } catch {
    return { available: true, checked: false };
  }
}

/**
 * Create an organisation for the signed-in user (org + owner membership +
 * profile link), performed atomically by the `create_organisation` RPC.
 */
export async function createOrganisation(input: {
  name: string;
  slug: string;
}): Promise<{ success?: true; slug?: string; error?: string }> {
  const parsed = createOrganisationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in." };

    const { data, error } = await supabase.rpc("create_organisation" as any, {
      org_name: parsed.data.name,
      org_slug: parsed.data.slug,
    } as any);

    if (error) {
      if (isMissingRelationError(error)) {
        return {
          error:
            "Organisation branding isn't available yet. Please try again later.",
        };
      }
      if (error.code === "23505" || /already/i.test(error.message ?? "")) {
        return {
          error:
            "That name or web address is already taken. Please choose another.",
        };
      }
      return { error: "Could not create your organisation. Please try again." };
    }

    revalidatePath("/settings/organisation");
    const org = (Array.isArray(data) ? data[0] : data) as any;
    return { success: true, slug: org?.slug ?? parsed.data.slug };
  } catch {
    return { error: "Could not create your organisation. Please try again." };
  }
}

/** Update a firm's branding fields. Owner-only (enforced by RLS and re-checked here). */
export async function updateBranding(input: {
  displayName: string;
  tagline?: string;
  brandColor: string;
  brandColorHover?: string;
}): Promise<{ success?: true; error?: string }> {
  const parsed = updateBrandingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in." };

    const { data: membership, error: mErr } = await supabase
      .from("organisation_members" as any)
      .select("organisation_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (mErr && isMissingRelationError(mErr)) {
      return { error: "Organisation branding isn't available yet." };
    }
    if (!membership) return { error: "You don't belong to an organisation." };
    if ((membership as any).role !== "owner") {
      return { error: "Only the organisation owner can edit branding." };
    }

    const brandColor = parsed.data.brandColor;
    const brandColorHover =
      parsed.data.brandColorHover && isValidHex(parsed.data.brandColorHover)
        ? parsed.data.brandColorHover
        : darken(brandColor);

    const { error } = await supabase
      .from("organisations" as any)
      .update({
        display_name: parsed.data.displayName,
        tagline: parsed.data.tagline ? parsed.data.tagline : null,
        brand_color: brandColor,
        brand_color_hover: brandColorHover,
      })
      .eq("id", (membership as any).organisation_id);

    if (error) return { error: "Could not save branding. Please try again." };

    revalidatePath("/settings/organisation");
    return { success: true };
  } catch {
    return { error: "Could not save branding. Please try again." };
  }
}

/**
 * Upload a firm logo to the public `org-logos` bucket under the org's prefix
 * and record its URL. Validates type + size server-side (client also validates).
 */
export async function uploadLogo(
  formData: FormData,
): Promise<{ success?: true; url?: string; error?: string }> {
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a logo file." };
  }
  if (!LOGO_ALLOWED_TYPES.includes(file.type as (typeof LOGO_ALLOWED_TYPES)[number])) {
    return { error: "Logo must be a PNG, JPEG or SVG file." };
  }
  if (file.size > LOGO_MAX_BYTES) {
    return { error: "Logo must be 1 MB or smaller." };
  }
  // Magic-byte check for raster types (SVG is text — MIME/size checks apply).
  if (file.type !== "image/svg+xml") {
    const ok = await verifyFileMagicBytes(file);
    if (!ok) return { error: "That file doesn't look like a valid image." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in." };

    const { data: membership, error: mErr } = await supabase
      .from("organisation_members" as any)
      .select("organisation_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (mErr && isMissingRelationError(mErr)) {
      return { error: "Organisation branding isn't available yet." };
    }
    if (!membership) return { error: "You don't belong to an organisation." };
    if ((membership as any).role !== "owner") {
      return { error: "Only the organisation owner can change the logo." };
    }

    const orgId = (membership as any).organisation_id as string;
    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/jpeg"
          ? "jpg"
          : "svg";
    const path = `${orgId}/logo-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("org-logos")
      .upload(path, file, { contentType: file.type, upsert: true });

    if (uploadError) {
      return { error: "Could not upload the logo. Please try again." };
    }

    const { data: publicUrlData } = supabase.storage
      .from("org-logos")
      .getPublicUrl(path);
    const url = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from("organisations" as any)
      .update({ logo_url: url })
      .eq("id", orgId);

    if (updateError) {
      return { error: "Logo uploaded but could not be saved. Please retry." };
    }

    revalidatePath("/settings/organisation");
    return { success: true, url };
  } catch {
    return { error: "Could not upload the logo. Please try again." };
  }
}
