"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBranding, uploadLogo, type OrgRecord } from "@/lib/branding/actions";
import {
  LOGO_ALLOWED_TYPES,
  LOGO_MAX_BYTES,
} from "@/lib/branding/schemas";
import { HEX_COLOR_REGEX, isValidHex } from "@/lib/branding/colors";
import { BrandedPreview } from "@/components/app/settings/organisation/branded-preview";

function normaliseHex(value: string): string {
  const v = value.trim();
  return v.startsWith("#") ? v.toUpperCase() : `#${v.toUpperCase()}`;
}

export function OrganisationSettings({
  org,
  isOwner,
}: {
  org: OrgRecord;
  isOwner: boolean;
}) {
  const [displayName, setDisplayName] = useState(org.display_name);
  const [tagline, setTagline] = useState(org.tagline ?? "");
  const [brandColor, setBrandColor] = useState(org.brand_color);
  const [brandColorHover, setBrandColorHover] = useState(org.brand_color_hover);
  const [logoUrl, setLogoUrl] = useState<string | null>(org.logo_url);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [logoError, setLogoError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [copied, setCopied] = useState(false);

  const brandedPath = `/f/${org.slug}`;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${brandedPath}`
      : brandedPath;
  const subdomainUrl = `${org.slug}.onkestrel.com`;

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const colour = normaliseHex(brandColor);
    if (!HEX_COLOR_REGEX.test(colour)) {
      setError("Enter a 6-digit hex colour, e.g. #2B5C4F");
      setSaving(false);
      return;
    }

    const result = await updateBranding({
      displayName,
      tagline,
      brandColor: colour,
      brandColorHover: isValidHex(brandColorHover) ? brandColorHover : undefined,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
    }
    setSaving(false);
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError(null);

    if (!LOGO_ALLOWED_TYPES.includes(file.type as (typeof LOGO_ALLOWED_TYPES)[number])) {
      setLogoError("Logo must be a PNG, JPEG or SVG file.");
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      setLogoError("Logo must be 1 MB or smaller.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.set("logo", file);
    const result = await uploadLogo(formData);
    setUploading(false);

    if (result.error) {
      setLogoError(result.error);
    } else if (result.url) {
      setLogoUrl(result.url);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — no-op; the URL is visible for manual copy.
    }
  }

  return (
    <div className="space-y-6">
      {/* Shareable link */}
      <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-6">
        <h2 className="text-lg font-semibold text-ink">Your branded login</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Share this link with your clients. It shows your logo and colours.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <code className="flex-1 truncate rounded-[var(--radius-md)] border border-border bg-cream/50 px-3 py-2 text-sm text-ink">
            {shareUrl}
          </code>
          <Button type="button" variant="secondary" onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-text-muted">
          A dedicated web address (<span className="font-mono">{subdomainUrl}</span>)
          is coming soon.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-6">
          <h2 className="text-lg font-semibold text-ink">Branding</h2>
          {!isOwner && (
            <p className="mt-2 rounded-[var(--radius-md)] border border-border-subtle bg-cream/50 px-3 py-2 text-xs text-text-secondary">
              Only the organisation owner can change these settings.
            </p>
          )}

          <fieldset disabled={!isOwner} className="mt-4 space-y-5">
            <Input
              name="display_name"
              label="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your firm's name"
            />

            <Input
              name="tagline"
              label="Tagline (optional)"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="A short line shown under your name"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Brand colour</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  aria-label="Brand colour picker"
                  value={isValidHex(brandColor) ? brandColor : "#2B5C4F"}
                  onChange={(e) => setBrandColor(e.target.value.toUpperCase())}
                  className="h-10 w-14 cursor-pointer rounded-[var(--radius-md)] border border-border bg-surface p-1"
                />
                <input
                  aria-label="Brand colour hex"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  onBlur={(e) => setBrandColor(normaliseHex(e.target.value))}
                  placeholder="#2B5C4F"
                  className="w-32 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 font-mono text-sm text-ink focus-visible:border-kestrel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kestrel/40"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">
                Hover colour (optional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  aria-label="Hover colour picker"
                  value={isValidHex(brandColorHover) ? brandColorHover : "#234A40"}
                  onChange={(e) => setBrandColorHover(e.target.value.toUpperCase())}
                  className="h-10 w-14 cursor-pointer rounded-[var(--radius-md)] border border-border bg-surface p-1"
                />
                <input
                  aria-label="Hover colour hex"
                  value={brandColorHover}
                  onChange={(e) => setBrandColorHover(e.target.value)}
                  onBlur={(e) => setBrandColorHover(normaliseHex(e.target.value))}
                  placeholder="Auto (darker shade)"
                  className="w-32 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 font-mono text-sm text-ink focus-visible:border-kestrel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kestrel/40"
                />
              </div>
              <p className="text-xs text-text-muted">
                Leave blank to auto-generate a darker shade.
              </p>
            </div>

            {/* Logo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Logo</label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Current logo"
                    className="h-10 w-auto max-w-[140px] object-contain"
                  />
                ) : (
                  <span className="text-xs text-text-muted">No logo yet</span>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleLogoChange}
                  disabled={!isOwner || uploading}
                  className="text-sm text-text-secondary file:mr-3 file:rounded-[var(--radius-md)] file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-stone"
                />
              </div>
              <p className="text-xs text-text-muted">
                PNG, JPEG or SVG, up to 1 MB.
              </p>
              {uploading && (
                <p className="text-xs text-text-secondary">Uploading…</p>
              )}
              {logoError && <p className="text-xs text-error">{logoError}</p>}
            </div>

            {error && <p className="text-sm text-error">{error}</p>}
            {saved && <p className="text-sm text-sage">Branding saved.</p>}

            <Button type="button" onClick={handleSave} disabled={saving || !isOwner}>
              {saving ? "Saving…" : "Save branding"}
            </Button>
          </fieldset>
        </div>

        {/* Live preview */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-ink">Preview</h2>
          <BrandedPreview
            displayName={displayName}
            tagline={tagline}
            brandColor={brandColor}
            brandColorHover={brandColorHover}
            logoUrl={logoUrl}
          />
        </div>
      </div>
    </div>
  );
}
