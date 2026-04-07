import { KestrelMark } from "@/components/ui/logo";

/**
 * Full-screen maintenance page shown when maintenance_mode is enabled in site_settings.
 * No interactive elements — purely informational.
 */
export function MaintenanceScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="relative z-10 mx-auto max-w-md text-center">
        <KestrelMark className="mx-auto h-12 w-auto text-kestrel" />
        <h1 className="mt-8 font-display text-3xl font-bold text-ink">
          We&rsquo;ll be right back
        </h1>
        <p className="mt-4 text-base leading-relaxed text-text-secondary">
          Kestrel is temporarily down for scheduled maintenance.
          We&rsquo;re making improvements and will be back shortly.
        </p>
        <p className="mt-6 text-sm text-text-muted">
          If you need immediate assistance, please email{" "}
          <a
            href="mailto:hello@onkestrel.com"
            className="font-medium text-kestrel hover:text-kestrel-hover transition-colors"
          >
            hello@onkestrel.com
          </a>
        </p>
      </div>
    </div>
  );
}
