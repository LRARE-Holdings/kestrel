import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/app/settings/profile-form";

export const metadata: Metadata = {
  title: "Settings — Kestrel",
};

export default async function SettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in");

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

        {/* Profile form + data export */}
        <div className="lg:col-span-2">
          <ProfileForm profile={profile} />

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
