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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // In development or if SITE_URL is not set, allow all
  if (!siteUrl || process.env.NODE_ENV === "development") {
    return null;
  }

  // No Origin header — could be a server-to-server call (cron, webhook).
  // These are protected by their own auth mechanisms (CRON_SECRET, Stripe signature).
  if (!origin) {
    return null;
  }

  // Parse the expected origin from the site URL
  const expectedOrigin = new URL(siteUrl).origin;

  if (origin !== expectedOrigin) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 },
    );
  }

  return null;
}
