import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard — Kestrel",
};

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your documents and disputes.
          </p>
        </div>
        <Link href="/tools">
          <Button>Create document</Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saved Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-ink">0</p>
            <p className="mt-1 text-sm text-text-muted">
              Contracts, letters, and terms
            </p>
            <Link
              href="/documents"
              className="mt-3 inline-block text-sm font-medium text-kestrel hover:text-kestrel-hover transition-colors"
            >
              View documents
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-ink">0</p>
            <p className="mt-1 text-sm text-text-muted">
              No active disputes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-ink">Free</p>
            <p className="mt-1 text-sm text-text-muted">
              Free tools, no dispute filing
            </p>
            <Link
              href="/settings/billing"
              className="mt-3 inline-block text-sm font-medium text-kestrel hover:text-kestrel-hover transition-colors"
            >
              Upgrade plan
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="mt-12">
        <h2 className="font-display text-xl text-ink">Quick actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Calculate late payment",
              description: "Statutory interest and compensation",
              href: "/tools/late-payment/calculator",
            },
            {
              title: "Generate letter",
              description: "Demand letters for overdue invoices",
              href: "/tools/late-payment/letters",
            },
            {
              title: "Create contract",
              description: "Professional contract templates",
              href: "/tools/contracts",
            },
            {
              title: "Generate T&Cs",
              description: "UK-compliant terms and conditions",
              href: "/tools/terms",
            },
          ].map((action) => (
            <Link key={action.href} href={action.href} className="group">
              <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-white p-4 transition-all hover:border-kestrel/30 hover:shadow-[var(--shadow-sm)]">
                <h3 className="text-sm font-semibold text-ink group-hover:text-kestrel transition-colors">
                  {action.title}
                </h3>
                <p className="mt-1 text-xs text-text-muted">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
