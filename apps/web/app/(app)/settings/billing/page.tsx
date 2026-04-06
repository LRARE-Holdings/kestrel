import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/actions";
import { createClient } from "@kestrel/shared/supabase/server";
import { Badge } from "@/components/ui/badge";
import { BillingActions } from "./billing-actions";

export const metadata: Metadata = {
  title: "Billing — Kestrel",
};

async function getSubscription(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data;
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const subscription = await getSubscription(user.id);
  const params = await searchParams;
  const showSuccess = params.success === "true";

  const plan = subscription?.plan ?? "free";
  const status = subscription?.status ?? "active";
  const hasActiveSubscription =
    subscription && ["active", "trialing"].includes(status);

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
            className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-text-secondary hover:bg-stone/60 hover:text-ink transition-colors"
          >
            Security
          </Link>
          <Link
            href="/settings/billing"
            className="rounded-[var(--radius-sm)] bg-stone/60 px-3 py-2 text-sm font-medium text-ink"
          >
            Billing
          </Link>
        </nav>

        {/* Billing content */}
        <div className="lg:col-span-2 space-y-6">
          {showSuccess && (
            <div className="rounded-lg bg-kestrel/5 border border-kestrel/15 px-4 py-3 text-sm text-kestrel">
              Your subscription has been activated. Thank you for upgrading.
            </div>
          )}

          {/* Current plan */}
          <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-ink">Current plan</h2>
              <Badge variant={hasActiveSubscription ? "default" : "default"}>
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </Badge>
              {status === "past_due" && (
                <Badge variant="default" className="bg-warning/10 text-warning border-warning/20">
                  Payment overdue
                </Badge>
              )}
              {status === "canceled" && (
                <Badge variant="default" className="bg-error/10 text-error border-error/20">
                  Cancelled
                </Badge>
              )}
            </div>

            {hasActiveSubscription ? (
              <p className="mt-2 text-sm text-text-secondary">
                You&apos;re on the {plan} plan.
                {subscription?.current_period_end && (
                  <>
                    {" "}
                    Next billing date:{" "}
                    {new Date(subscription.current_period_end).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </>
                )}
              </p>
            ) : (
              <p className="mt-2 text-sm text-text-secondary">
                You&apos;re on the free plan. Upgrade to file disputes and save
                documents.
              </p>
            )}

            {!hasActiveSubscription && (
              <div className="mt-4">
                <Link
                  href="/pricing"
                  className="inline-flex items-center rounded-lg bg-kestrel px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-kestrel-hover"
                >
                  View plans
                </Link>
              </div>
            )}
          </div>

          {/* Payment management */}
          <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-6">
            <h2 className="text-lg font-semibold text-ink">
              Payment management
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Manage your payment method, view invoices, and update billing
              details through our secure payment portal.
            </p>
            <BillingActions hasSubscription={!!subscription?.stripe_customer_id} />
          </div>
        </div>
      </div>
    </div>
  );
}
