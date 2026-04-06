import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/actions";
import { MfaSettings } from "@/components/app/settings/mfa-settings";

export const metadata: Metadata = {
  title: "Security Settings — Kestrel",
};

export default async function SecuritySettingsPage() {
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
            className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-text-secondary hover:bg-stone/60 hover:text-ink transition-colors"
          >
            Profile
          </Link>
          <Link
            href="/settings/security"
            className="rounded-[var(--radius-sm)] bg-stone/60 px-3 py-2 text-sm font-medium text-ink"
          >
            Security
          </Link>
          <Link
            href="/settings/billing"
            className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-text-secondary hover:bg-stone/60 hover:text-ink transition-colors"
          >
            Billing
          </Link>
        </nav>

        {/* Security content */}
        <div className="lg:col-span-2">
          <MfaSettings />
        </div>
      </div>
    </div>
  );
}
