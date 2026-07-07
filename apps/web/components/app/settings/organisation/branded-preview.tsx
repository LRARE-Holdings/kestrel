"use client";

import type { CSSProperties } from "react";
import {
  DEFAULT_BRAND_COLOR,
  darken,
  isValidHex,
  readableForeground,
  safeHex,
} from "@/lib/branding/colors";

/**
 * A compact, live preview of the firm-branded sign-in card. Purely
 * presentational — mirrors the real `/f/[slug]` shell so an owner sees exactly
 * how their branding reads before saving.
 */
export function BrandedPreview({
  displayName,
  tagline,
  brandColor,
  brandColorHover,
  logoUrl,
}: {
  displayName: string;
  tagline?: string;
  brandColor: string;
  brandColorHover?: string;
  logoUrl?: string | null;
}) {
  const color = safeHex(brandColor, DEFAULT_BRAND_COLOR);
  const hover =
    brandColorHover && isValidHex(brandColorHover)
      ? brandColorHover
      : darken(color);
  const foreground = readableForeground(color);

  const orbStyle = { backgroundColor: color, opacity: 0.05 } as CSSProperties;

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-cream p-6">
      <div
        style={orbStyle}
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-2xl"
      />
      <div className="relative mx-auto w-full max-w-[260px]">
        <div className="mb-5 flex flex-col items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={displayName || "Logo preview"}
              className="h-9 w-auto max-w-[160px] object-contain"
            />
          ) : (
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              {displayName || "Your firm"}
            </span>
          )}
          {tagline && (
            <p className="text-center text-xs text-text-secondary">{tagline}</p>
          )}
        </div>

        <div className="rounded-xl border border-border-subtle/60 bg-surface p-5 shadow-[var(--shadow-md)]">
          <p className="text-center text-sm font-semibold text-ink">
            Sign in to {displayName || "your firm"}
          </p>
          <div className="mt-4 space-y-2.5">
            <div className="h-8 rounded-[var(--radius-md)] border border-border bg-cream/40" />
            <div className="h-8 rounded-[var(--radius-md)] border border-border bg-cream/40" />
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              style={{ backgroundColor: color, color: foreground }}
              className="pointer-events-none h-8 w-full rounded-[var(--radius-md)] text-xs font-medium"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = hover;
              }}
            >
              Sign in
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] text-text-muted">
          Powered by Kestrel
        </p>
      </div>
    </div>
  );
}
