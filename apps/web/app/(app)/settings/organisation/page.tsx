import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/actions";
import { getOrganisationContext } from "@/lib/branding/actions";
import { OrganisationSettings } from "@/components/app/settings/organisation/organisation-settings";
import { CreateOrganisationForm } from "@/components/app/settings/organisation/create-organisation-form";

export const metadata: Metadata = {
  title: "Organisation — Kestrel",
};

export default async function OrganisationSettingsPage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const context = await getOrganisationContext();

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
            href="/settings/organisation"
            className="rounded-[var(--radius-sm)] bg-stone/60 px-3 py-2 text-sm font-medium text-ink"
          >
            Organisation
          </Link>
          <Link
            href="/settings/security"
            className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-text-secondary hover:bg-stone/60 hover:text-ink transition-colors"
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

        {/* Content */}
        <div className="lg:col-span-2">
          {context.state === "unavailable" ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-border-subtle bg-cream/40 p-8 text-center">
              <h2 className="text-lg font-semibold text-ink">
                Organisation branding isn&apos;t available yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
                This feature is being rolled out. Once it&apos;s live you&apos;ll
                be able to set up a branded login page for your firm — your logo,
                your colours, your web address.
              </p>
            </div>
          ) : context.state === "none" ? (
            <CreateOrganisationForm />
          ) : (
            <OrganisationSettings
              org={context.org}
              isOwner={context.role === "owner"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
