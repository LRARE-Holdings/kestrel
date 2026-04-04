import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Billing — Kestrel",
};

export default function BillingPage() {
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
            href="/settings/billing"
            className="rounded-[var(--radius-sm)] bg-stone/60 px-3 py-2 text-sm font-medium text-ink"
          >
            Billing
          </Link>
        </nav>

        {/* Billing content */}
        <div className="lg:col-span-2">
          <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-ink">Current plan</h2>
              <Badge variant="default">Free</Badge>
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              You&apos;re on the free plan. Upgrade to file disputes and save
              documents.
            </p>

            <div className="mt-6">
              <Link href="/pricing">
                <Button>View plans</Button>
              </Link>
            </div>
          </div>

          {/* Stripe portal placeholder */}
          <div className="mt-6 rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-6">
            <h2 className="text-lg font-semibold text-ink">
              Payment management
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Manage your payment method, view invoices, and update billing
              details through our secure payment portal.
            </p>
            <Button variant="secondary" className="mt-4" disabled>
              Open billing portal
            </Button>
            <p className="mt-2 text-xs text-text-muted">
              Powered by Stripe. Available after upgrading.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
