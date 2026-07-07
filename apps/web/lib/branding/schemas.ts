import { z } from "zod/v4";
import { HEX_COLOR_REGEX } from "@/lib/branding/colors";
import { SLUG_REGEX, SLUG_MAX_LENGTH, SLUG_MIN_LENGTH } from "@/lib/branding/slug";

/** Allowed logo MIME types and maximum size (kept in sync client + server). */
export const LOGO_ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
] as const;
export const LOGO_MAX_BYTES = 1_048_576; // 1 MB

const hexColor = z
  .string()
  .trim()
  .regex(HEX_COLOR_REGEX, "Enter a 6-digit hex colour, e.g. #2B5C4F");

export const updateBrandingSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(120, "Display name is too long"),
  tagline: z
    .string()
    .trim()
    .max(160, "Tagline is too long")
    .optional()
    .or(z.literal("")),
  brandColor: hexColor,
  brandColorHover: hexColor.optional().or(z.literal("")),
});

export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;

export const createOrganisationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Organisation name is required")
    .max(120, "Organisation name is too long"),
  slug: z
    .string()
    .trim()
    .min(SLUG_MIN_LENGTH, "Slug is too short")
    .max(SLUG_MAX_LENGTH, "Slug is too long")
    .regex(SLUG_REGEX, "Use lowercase letters, numbers and hyphens only"),
});

export type CreateOrganisationInput = z.infer<typeof createOrganisationSchema>;
