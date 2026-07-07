import { KESTREL_DOMAIN } from "@kestrel/shared/constants";

/**
 * Header/config inputs used to resolve the canonical request origin.
 * Kept as a plain object so the resolution logic stays pure and testable
 * without a live request context.
 */
export type OriginInput = {
  origin?: string | null;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
  host?: string | null;
  siteUrl?: string | null;
};

/** Normalise a value that may or may not carry a protocol into an origin. */
function normaliseOrigin(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = trimmed.includes("://")
      ? trimmed
      : `https://${trimmed}`;
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

/** Take the first value from a possibly comma-separated forwarded header. */
function firstValue(value?: string | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  return first ? first : null;
}

/** Derive an origin from the incoming request headers, if any are present. */
function originFromHeaders(input: OriginInput): string | null {
  const proto = firstValue(input.forwardedProto) ?? "https";

  const forwardedHost = firstValue(input.forwardedHost);
  if (forwardedHost) return normaliseOrigin(`${proto}://${forwardedHost}`);

  if (input.origin) {
    const fromOrigin = normaliseOrigin(input.origin);
    if (fromOrigin) return fromOrigin;
  }

  const host = firstValue(input.host);
  if (host) return normaliseOrigin(`${proto}://${host}`);

  return null;
}

/**
 * Resolve the canonical origin for building absolute URLs (email links, OAuth
 * callbacks). Resolution order:
 *   1. The incoming request's own origin (x-forwarded-host/proto, Origin, Host)
 *   2. NEXT_PUBLIC_SITE_URL (may be stale, so it is a fallback, not primary)
 *   3. The shared KESTREL_DOMAIN constant (always correct, never throws)
 *
 * Pure and synchronous so it can be unit tested without a request context.
 */
export function resolveOrigin(input: OriginInput): string {
  const fromHeaders = originFromHeaders(input);
  if (fromHeaders) return fromHeaders;

  if (input.siteUrl) {
    const fromSiteUrl = normaliseOrigin(input.siteUrl);
    if (fromSiteUrl) return fromSiteUrl;
  }

  return `https://${KESTREL_DOMAIN}`;
}

/**
 * Resolve the canonical origin from the live request headers within a Server
 * Action or route handler. Never throws — falls back through SITE_URL to the
 * shared domain constant.
 */
export async function getRequestOrigin(): Promise<string> {
  // Imported lazily so the module can be unit tested in a plain Node
  // environment without pulling in the Next.js request-scope runtime.
  const { headers } = await import("next/headers");
  const headerList = await headers();

  return resolveOrigin({
    origin: headerList.get("origin"),
    forwardedHost: headerList.get("x-forwarded-host"),
    forwardedProto: headerList.get("x-forwarded-proto"),
    host: headerList.get("host"),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  });
}
