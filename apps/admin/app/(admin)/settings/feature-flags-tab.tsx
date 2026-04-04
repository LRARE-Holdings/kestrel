"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  toggleFeatureFlag,
  createFeatureFlag,
} from "@/lib/admin/settings-actions";

interface FeatureFlag {
  id: string;
  flag_key: string;
  description: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface Props {
  flags: FeatureFlag[];
}

export function FeatureFlagsTab({ flags }: Props) {
  const [createState, createAction, isCreating] = useActionState(
    createFeatureFlag,
    null,
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Flags table */}
      <div className="bg-white border border-border-subtle rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle">
          <h2 className="text-lg font-display font-semibold text-ink">
            Feature Flags
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Toggle features on or off across the platform.
          </p>
        </div>

        {flags.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-text-muted">
            No feature flags defined yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-cream/40">
                <th className="text-left px-6 py-3 font-medium text-text-secondary">
                  Key
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-secondary">
                  Description
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-secondary">
                  Status
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-secondary">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag) => (
                <FlagRow key={flag.id} flag={flag} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add flag form */}
      <div className="bg-white border border-border-subtle rounded-lg p-6 space-y-4">
        <h3 className="text-sm font-display font-semibold text-ink">
          Add New Flag
        </h3>
        <form action={createAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <label
              htmlFor="new-flag-key"
              className="block text-xs font-medium text-text-secondary"
            >
              Flag key
            </label>
            <input
              id="new-flag-key"
              type="text"
              name="flag_key"
              placeholder="e.g. enable_handshake_v2"
              required
              className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel transition-colors font-mono"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label
              htmlFor="new-flag-desc"
              className="block text-xs font-medium text-text-secondary"
            >
              Description <span className="text-text-muted">(optional)</span>
            </label>
            <input
              id="new-flag-desc"
              type="text"
              name="description"
              placeholder="What does this flag control?"
              className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="px-4 py-2 text-sm font-medium text-white bg-kestrel hover:bg-kestrel-hover rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {isCreating ? "Adding..." : "Add Flag"}
          </button>
        </form>
        {createState?.error && (
          <p className="text-sm text-error">{createState.error}</p>
        )}
        {createState?.success && (
          <p className="text-sm text-kestrel">Flag created.</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single flag row with toggle
// ---------------------------------------------------------------------------

function FlagRow({ flag }: { flag: FeatureFlag }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleFeatureFlag(flag.id, !flag.enabled);
      router.refresh();
    });
  }

  const updatedDate = new Date(flag.updated_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <tr className="border-b border-border-subtle last:border-b-0 hover:bg-cream/20 transition-colors">
      <td className="px-6 py-3 font-mono text-xs text-ink">{flag.flag_key}</td>
      <td className="px-6 py-3 text-text-secondary">
        {flag.description || <span className="text-text-muted">&mdash;</span>}
      </td>
      <td className="px-6 py-3">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="relative inline-flex items-center cursor-pointer disabled:opacity-50"
          aria-label={`Toggle ${flag.flag_key}`}
        >
          <div
            className={`w-10 h-5 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
              flag.enabled
                ? "bg-kestrel after:translate-x-5"
                : "bg-border"
            }`}
          />
        </button>
      </td>
      <td className="px-6 py-3 text-text-muted text-xs">{updatedDate}</td>
    </tr>
  );
}
