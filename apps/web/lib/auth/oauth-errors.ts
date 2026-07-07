/**
 * OAuth / social sign-in error handling.
 *
 * We never reflect raw provider or Supabase error text back to the browser.
 * Instead the callback maps whatever it receives to one of a small set of
 * whitelisted codes, and the sign-in / sign-up pages map that code to calm,
 * plain-English copy. This prevents error-message injection and keeps the
 * wording consistent and reassuring.
 */

export type OAuthErrorCode =
  | "oauth_unavailable"
  | "access_denied"
  | "session_exchange_failed"
  | "server_error"
  | "unknown";

const MESSAGES: Record<OAuthErrorCode, string> = {
  oauth_unavailable:
    "Social sign-in is not available at the moment. Please use your email and password below.",
  access_denied:
    "That sign-in was cancelled before it finished. Please try again, or use your email and password below.",
  session_exchange_failed:
    "We could not complete your sign-in. Please try again, or use your email and password below.",
  server_error:
    "Something went wrong during sign-in. Please try again in a moment, or use your email and password below.",
  unknown:
    "We could not sign you in. Please try again, or use your email and password below.",
};

/**
 * Map a whitelisted error code (as carried in the ?error= query param) to a
 * user-facing message. Any unrecognised value collapses to the generic
 * message, so an attacker cannot inject arbitrary text via the query string.
 */
export function oauthErrorMessage(
  code: string | null | undefined,
): string | null {
  if (!code) return null;
  return MESSAGES[code as OAuthErrorCode] ?? MESSAGES.unknown;
}

/**
 * Reduce the raw error parameters returned by Supabase / the OAuth provider to
 * one of our whitelisted codes. Matching is done against a lower-cased haystack
 * so we never have to trust the exact upstream wording.
 */
export function mapSupabaseOAuthError(
  error?: string | null,
  errorCode?: string | null,
  description?: string | null,
): OAuthErrorCode {
  const haystack = `${error ?? ""} ${errorCode ?? ""} ${description ?? ""}`
    .toLowerCase()
    .trim();

  if (
    haystack.includes("provider is not enabled") ||
    haystack.includes("unsupported provider") ||
    haystack.includes("provider_disabled") ||
    haystack.includes("validation_failed")
  ) {
    return "oauth_unavailable";
  }

  if (haystack.includes("access_denied")) {
    return "access_denied";
  }

  if (haystack.includes("server_error")) {
    return "server_error";
  }

  return "unknown";
}
