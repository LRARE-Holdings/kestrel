"use client";

import { useActionState } from "react";
import { updateSiteConfig } from "@/lib/admin/settings-actions";

interface Props {
  settings: Record<string, unknown>;
}

export function SiteConfigTab({ settings }: Props) {
  const [state, formAction, isPending] = useActionState(updateSiteConfig, null);

  const maintenanceMode = settings.maintenance_mode === true;

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      <div className="bg-surface border border-border-subtle rounded-lg p-6 space-y-5">
        <h2 className="text-lg font-display font-semibold text-ink">
          Site Configuration
        </h2>
        <p className="text-sm text-text-secondary">
          Global settings that affect the entire platform.
        </p>

        {/* Maintenance mode */}
        <div className="flex items-center justify-between py-3 border-b border-border-subtle">
          <div>
            <p className="text-sm font-medium text-ink">Maintenance Mode</p>
            <p className="text-xs text-text-muted mt-0.5">
              When enabled, users will see a maintenance page instead of the
              application.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="maintenance_mode"
              value="true"
              defaultChecked={maintenanceMode}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-border rounded-full peer-checked:bg-error peer-focus:ring-2 peer-focus:ring-error/20 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
          </label>
        </div>

        {maintenanceMode && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-error/5 border border-error/20 rounded-lg">
            <WarningIcon className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
            <p className="text-xs text-error">
              Maintenance mode is currently active. Users cannot access the
              platform.
            </p>
          </div>
        )}
      </div>

      {/* Feedback + submit */}
      {state?.error && (
        <p className="text-sm text-error">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-kestrel">Site configuration saved.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2.5 text-sm font-medium text-white bg-kestrel hover:bg-kestrel-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
