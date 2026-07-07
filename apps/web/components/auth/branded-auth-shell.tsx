import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { KestrelMark } from "@/components/ui/logo";
import type { ResolvedBranding } from "@/lib/branding/types";

/**
 * The auth shell for firm-branded login pages. Mirrors the standard
 * `(auth)/layout.tsx` — cream background, subtle orbs, centred card — but
 * parameterised by a firm's validated brand colour and logo.
 *
 * Brand colours are applied as CSS custom-property overrides on a wrapper via a
 * plain inline style object. Every value originates from {@link ResolvedBranding},
 * which guarantees valid 6-digit hex — no arbitrary strings reach the DOM.
 */
export function BrandedAuthShell({
  branding,
  children,
}: {
  branding: ResolvedBranding;
  children: ReactNode;
}) {
  // Only valid hex reaches here (resolveBranding guarantees it), so these
  // custom properties are safe to inject.
  const brandVars = {
    "--color-kestrel": branding.brandColor,
    "--color-kestrel-hover": branding.brandColorHover,
    "--raw-kestrel": branding.brandColor,
    "--raw-kestrel-hover": branding.brandColorHover,
  } as CSSProperties;

  return (
    <div
      style={brandVars}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 py-12"
    >
      {/* Subtle orbs — tinted by the firm's brand colour */}
      <div className="pointer-events-none absolute -top-32 right-1/3 h-[400px] w-[400px] rounded-full bg-kestrel/[0.04] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-[300px] w-[300px] rounded-full bg-sage/[0.04] blur-[80px]" />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Firm mark / logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          {branding.logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={branding.logoUrl}
              alt={branding.displayName}
              className="h-12 w-auto max-w-[220px] object-contain"
            />
          ) : branding.isBranded ? (
            <span className="font-display text-2xl font-semibold tracking-tight text-ink">
              {branding.displayName}
            </span>
          ) : (
            <Link
              href="/"
              className="text-kestrel transition-colors hover:text-kestrel-hover"
            >
              <KestrelMark className="h-10 w-auto" />
            </Link>
          )}

          {branding.tagline && (
            <p className="text-center text-sm text-text-secondary">
              {branding.tagline}
            </p>
          )}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border-subtle/60 bg-surface shadow-[var(--shadow-lg)] backdrop-blur-xl">
          <div className="p-8">{children}</div>
        </div>

        {/* Attribution + legal links */}
        <div className="mt-6 flex flex-col items-center gap-3">
          {branding.isBranded && (
            <Link
              href="/"
              className="group inline-flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-ink"
            >
              <span>Powered by</span>
              <KestrelMark className="h-3.5 w-auto text-kestrel transition-colors group-hover:text-kestrel-hover" />
              <span className="font-display font-semibold tracking-tight">Kestrel</span>
            </Link>
          )}

          <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
            <Link href="/privacy" className="transition-colors hover:text-ink">Privacy</Link>
            <span className="text-border">&middot;</span>
            <Link href="/terms" className="transition-colors hover:text-ink">Terms</Link>
            <span className="text-border">&middot;</span>
            <Link href="/" className="transition-colors hover:text-ink">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
