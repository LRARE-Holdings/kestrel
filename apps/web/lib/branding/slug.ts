/**
 * Slug helpers for organisation (firm) URLs: `/f/{slug}` and `{slug}.onkestrel.com`.
 * Pure and dependency-free so they can run on the server, the client, and in tests.
 */

/** Lowercase, hyphen-separated segments of alphanumerics. Mirrors the DB CHECK. */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SLUG_MIN_LENGTH = 2;
export const SLUG_MAX_LENGTH = 63;

/**
 * Derive a candidate slug from a free-text organisation name. Lowercases,
 * strips accents/punctuation, collapses whitespace to single hyphens and trims
 * to the maximum length. May return an empty string for input with no usable
 * characters — callers should treat that as "not yet valid".
 */
export function generateSlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-") // whitespace/underscores → hyphen
    .replace(/[^a-z0-9-]/g, "") // drop anything not alphanumeric/hyphen
    .replace(/-+/g, "-") // collapse repeated hyphens
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, ""); // re-trim in case slicing left a trailing hyphen
}

/** True when a string is a valid organisation slug (shape + length). */
export function isValidSlug(slug: unknown): slug is string {
  return (
    typeof slug === "string" &&
    slug.length >= SLUG_MIN_LENGTH &&
    slug.length <= SLUG_MAX_LENGTH &&
    SLUG_REGEX.test(slug)
  );
}
