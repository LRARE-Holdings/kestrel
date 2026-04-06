/**
 * Validate a redirect path to prevent open redirect attacks.
 * Returns the sanitised path if safe, or the fallback otherwise.
 *
 * Uses URL parsing instead of string matching to handle encoded characters,
 * protocol-relative URLs, and other bypass techniques.
 */
export function safeRedirectPath(
  redirectTo: string | null | undefined,
  origin: string,
  fallback = "/dashboard",
): string {
  if (!redirectTo) return fallback;

  try {
    // Parse against origin — if redirectTo is absolute to a different host,
    // URL will resolve it but the origin won't match.
    const resolved = new URL(redirectTo, origin);
    const expected = new URL(origin);

    if (resolved.origin !== expected.origin) {
      return fallback;
    }

    // Return only the pathname + search (strip any hash for safety)
    return resolved.pathname + resolved.search;
  } catch {
    // Malformed URL — use fallback
    return fallback;
  }
}
