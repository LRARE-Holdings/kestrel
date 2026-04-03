"use client";

import { useState } from "react";
import Link from "next/link";
import { updateProfile } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BUSINESS_TYPES, COMPANY_SIZES, INDUSTRIES } from "@/lib/constants";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSaved(false);

    const result = await updateProfile(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
    }
    setLoading(false);
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Settings</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Manage your account and preferences.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Sidebar nav */}
        <nav className="flex flex-col gap-1">
          <Link
            href="/settings"
            className="rounded-[var(--radius-sm)] bg-stone/60 px-3 py-2 text-sm font-medium text-ink"
          >
            Profile
          </Link>
          <Link
            href="/settings/billing"
            className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-text-secondary hover:bg-stone/60 hover:text-ink transition-colors"
          >
            Billing
          </Link>
        </nav>

        {/* Profile form */}
        <div className="lg:col-span-2">
          <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-white p-6">
            <h2 className="text-lg font-semibold text-ink">Profile</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Your personal and business details.
            </p>

            <form action={handleSubmit} className="mt-6 space-y-5">
              <Input
                name="display_name"
                label="Display name"
                placeholder="Your name"
                required
              />

              <Input
                name="business_name"
                label="Business name"
                placeholder="Your business"
              />

              <Select name="business_type" label="Business type">
                {BUSINESS_TYPES.map((bt) => (
                  <option key={bt.value} value={bt.value}>
                    {bt.label}
                  </option>
                ))}
              </Select>

              <Select name="company_size" label="Company size">
                {COMPANY_SIZES.map((cs) => (
                  <option key={cs.value} value={cs.value}>
                    {cs.label}
                  </option>
                ))}
              </Select>

              <Select name="industry" label="Industry">
                {INDUSTRIES.map((ind) => (
                  <option key={ind.value} value={ind.value}>
                    {ind.label}
                  </option>
                ))}
              </Select>

              {error && <p className="text-sm text-error">{error}</p>}
              {saved && (
                <p className="text-sm text-sage">Profile updated.</p>
              )}

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </div>

          {/* Data export */}
          <div className="mt-6 rounded-[var(--radius-lg)] border border-border-subtle bg-white p-6">
            <h2 className="text-lg font-semibold text-ink">Your data</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Download all data Kestrel holds about you (UK GDPR right of
              access).
            </p>
            <Button variant="secondary" className="mt-4" disabled>
              Export data (coming soon)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
