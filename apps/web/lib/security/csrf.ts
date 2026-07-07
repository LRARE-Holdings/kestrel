import { NextResponse } from "next/server";

/**
 * Validate the Origin header on mutation requests to prevent CSRF.
 * Returns a 403 response if the Origin doesn't match the expected site URL,
 * or null if the request is allowed.
 *
 * This is a lightweight CSRF protection that works because:
 * - Browsers always send Origin on cross-origin POST requests
 * - Browsers also send Origin on same-origin POST for fetch/XHR
 * - Simple form submissions from other origins include Origin
 */
export function validateOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");

  // In development, allow all.
  if (process.env.NODE_ENV === "development") {
    return null;
  }

  // No Origin header — could be a server-to-server call (cron, webhook).
  // These are protected by their own auth mechanisms (CRON_SECRET, Stripe signature).
  if (!origin) {
    return null;
  }

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    // Malformed Origin header — reject.
    return forbidden();
  }

  // Same-origin check: the Origin host matches the request's own host. This is
  // the primary defence and does not depend on NEXT_PUBLIC_SITE_URL being fresh
  // (a stale env var must never 403 a legitimate same-origin submission).
  const requestHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (requestHost && originHost === requestHost) {
    return null;
  }

  // Also accept the explicitly configured site URL, if set and parseable.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      if (new URL(siteUrl).host === originHost) {
        return null;
      }
    } catch {
      // Ignore a malformed SITE_URL and fall through to reject.
    }
  }

  // Cross-origin — reject. No wildcard allow.
  return forbidden();
}

function forbidden(): NextResponse {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
