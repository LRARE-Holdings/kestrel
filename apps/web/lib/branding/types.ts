import {
  DEFAULT_BRAND_COLOR,
  DEFAULT_BRAND_COLOR_HOVER,
  darken,
  isValidHex,
  readableForeground,
  safeHex,
} from "@/lib/branding/colors";

/**
 * The raw shape returned by the `get_organisation_branding` RPC. Every field is
 * treated as untrusted here — the resolver below validates each one before use.
 */
export interface BrandingRow {
  slug?: unknown;
  display_name?: unknown;
  logo_url?: unknown;
  brand_color?: unknown;
  brand_color_hover?: unknown;
  tagline?: unknown;
}

/**
 * A fully-validated, render-ready branding object. Guaranteed safe to inject
 * into inline styles and `img`/`alt` attributes.
 */
export interface ResolvedBranding {
  /** The firm slug, or null when we fell back to default Kestrel branding. */
  slug: string | null;
  /** Whether a real organisation was matched (false = default Kestrel). */
  isBranded: boolean;
  displayName: string;
  logoUrl: string | null;
  /** Always a valid 6-digit hex. */
  brandColor: string;
  /** Always a valid 6-digit hex. */
  brandColorHover: string;
  /** Accessible foreground (white or ink) for text on the brand colour. */
  accentForeground: string;
  tagline: string | null;
}

/** The default, unbranded Kestrel appearance. */
export const DEFAULT_BRANDING: ResolvedBranding = {
  slug: null,
  isBranded: false,
  displayName: "Kestrel",
  logoUrl: null,
  brandColor: DEFAULT_BRAND_COLOR,
  brandColorHover: DEFAULT_BRAND_COLOR_HOVER,
  accentForeground: readableForeground(DEFAULT_BRAND_COLOR),
  tagline: null,
};

/** Only allow http(s) logo URLs; reject anything else (e.g. javascript:). */
function safeLogoUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? value : null;
  } catch {
    return null;
  }
}

function safeTagline(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, 160);
}

/**
 * Turn an untrusted RPC row (or null) into safe, render-ready branding.
 *
 * A null/empty row — an unknown slug, an RPC failure, or a not-yet-applied
 * migration — resolves to the default Kestrel branding. Individual invalid
 * fields degrade to their Kestrel defaults rather than failing the whole page.
 */
export function resolveBranding(
  row: BrandingRow | null | undefined,
): ResolvedBranding {
  if (!row || typeof row !== "object") {
    return DEFAULT_BRANDING;
  }

  const slug = typeof row.slug === "string" && row.slug.length > 0 ? row.slug : null;
  const displayName =
    typeof row.display_name === "string" && row.display_name.trim().length > 0
      ? row.display_name.trim().slice(0, 120)
      : "Kestrel";

  const brandColor = safeHex(row.brand_color, DEFAULT_BRAND_COLOR);
  // Prefer the supplied hover; otherwise synthesise a darker shade of the brand.
  const brandColorHover = isValidHex(row.brand_color_hover)
    ? (row.brand_color_hover as string)
    : darken(brandColor);

  return {
    slug,
    // A row is "branded" only when it carries a usable slug (i.e. a real match).
    isBranded: slug !== null,
    displayName,
    logoUrl: safeLogoUrl(row.logo_url),
    brandColor,
    brandColorHover,
    accentForeground: readableForeground(brandColor),
    tagline: safeTagline(row.tagline),
  };
}
