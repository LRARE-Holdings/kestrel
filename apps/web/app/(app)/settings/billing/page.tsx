import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/actions";
import { createClient } from "@kestrel/shared/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatGBP, formatTierLabel } from "@/lib/pricing/format";
import type { TierId } from "@/lib/pricing/types";

export const metadata: Metadata = {
  title: "Billing & receipts — Kestrel",
};

// ---------------------------------------------------------------------------
// Types — kept local until the dispute_payments table is in the generated
// Supabase types (Phase 4 migration). Until then the query is best-effort
// and falls back to an empty list.
// ---------------------------------------------------------------------------

interface DisputePaymentSummary {
  id: string;
  dispute_id: string;
  reference_number: string | null;
  party_role: "claimant" | "respondent";
  purpose: "filing" | "tier_bump" | "counter_claim";
  tier_id: TierId;
  amount_pence: number;
  status:
    | "pending"
    | "succeeded"
    | "failed"
    | "refunded"
    | "partially_refunded";
  created_at: string;
}

async function getDisputeFeeHistory(
  userId: string,
): Promise<DisputePaymentSummary[]> {
  const supabase = await createClient();

  // Best-effort query: if the dispute_payments table doesn't exist yet
  // (pre-migration), we return an empty list rather than throw.
  try {
    const { data, error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("dispute_payments" as any)
      .select(
        `
          id,
          dispute_id,
          party_role,
          purpose,
          tier_id,
          amount_pence,
          status,
          created_at,
          disputes!inner(reference_number, initiating_party_id, responding_party_id)
        `,
      )
      .or(
        `disputes.initiating_party_id.eq.${userId},disputes.responding_party_id.eq.${userId}`,
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map((row) => ({
      id: row.id,
      dispute_id: row.dispute_id,
      reference_number: row.disputes?.reference_number ?? null,
      party_role: row.party_role,
      purpose: row.purpose,
      tier_id: row.tier_id,
      amount_pence: row.amount_pence,
      status: row.status,
      created_at: row.created_at,
    }));
  } catch {
    return [];
  }
}

function statusBadgeVariant(
  status: DisputePaymentSummary["status"],
): { label: string; className: string } {
  switch (status) {
    case "succeeded":
      return {
        label: "Paid",
        className: "bg-kestrel/10 text-kestrel border-kestrel/20",
      };
    case "refunded":
      return {
        label: "Refunded",
        className: "bg-sage/15 text-sage border-sage/30",
      };
    case "partially_refunded":
      return {
        label: "Partially refunded",
        className: "bg-sage/10 text-sage border-sage/20",
      };
    case "failed":
      return {
        label: "Failed",
        className: "bg-error/10 text-error border-error/20",
      };
    case "pending":
    default:
      return {
        label: "Pending",
        className: "bg-warning/10 text-warning border-warning/20",
      };
  }
}

export default async function BillingPage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const payments = await getDisputeFeeHistory(user.id);
  const hasPayments = payments.length > 0;

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
            Billing &amp; receipts
          </Link>
        </nav>

        {/* Billing content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pricing summary card */}
          <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-6">
            <h2 className="text-lg font-semibold text-ink">How Kestrel charges</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Free tools are free forever. You only pay if you file a dispute,
              and the per-party fee is set by the disputed value. If you are
              the respondent and engage in good faith within 14 days, your fee
              is fully refunded.
            </p>
            <div className="mt-4">
              <Link
                href="/pricing"
                className="inline-flex items-center text-sm font-medium text-kestrel hover:text-kestrel-hover transition-colors"
              >
                See the full pricing model →
              </Link>
            </div>
          </div>

          {/* Dispute fee history */}
          <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">
                Dispute fee history
              </h2>
              {hasPayments && (
                <Badge variant="default">{payments.length}</Badge>
              )}
            </div>

            {!hasPayments ? (
              <div className="mt-4 rounded-[var(--radius-md)] border border-dashed border-border-subtle bg-cream/40 px-4 py-8 text-center">
                <p className="text-sm font-medium text-ink">
                  No dispute fees yet
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Free tools stay free. You will only see entries here if you
                  file or respond to a dispute.
                </p>
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-[var(--radius-md)] border border-border-subtle">
                <table className="w-full text-sm">
                  <thead className="bg-cream/60 text-left text-xs uppercase tracking-wider text-text-muted">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Date</th>
                      <th className="px-4 py-2 font-semibold">Dispute</th>
                      <th className="px-4 py-2 font-semibold">Tier</th>
                      <th className="px-4 py-2 font-semibold">Role</th>
                      <th className="px-4 py-2 font-semibold text-right">
                        Amount
                      </th>
                      <th className="px-4 py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {payments.map((payment) => {
                      const badge = statusBadgeVariant(payment.status);
                      return (
                        <tr key={payment.id} className="hover:bg-cream/40">
                          <td className="px-4 py-3 text-text-secondary">
                            {new Date(payment.created_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/disputes/${payment.dispute_id}`}
                              className="font-medium text-kestrel hover:text-kestrel-hover transition-colors"
                            >
                              {payment.reference_number ?? payment.dispute_id.slice(0, 8)}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-text-secondary">
                            {formatTierLabel(payment.tier_id)}
                          </td>
                          <td className="px-4 py-3 text-text-secondary capitalize">
                            {payment.party_role}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-ink">
                            {formatGBP(payment.amount_pence)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Future Kestrel Pro placeholder */}
          <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface/60 p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-warm/40 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Coming later
              </span>
              <h2 className="text-lg font-semibold text-ink">Kestrel Pro</h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              A monthly subscription for businesses managing multiple ongoing
              relationships. Document vault, branded exports, multi-user
              accounts. Launching in Year 2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
