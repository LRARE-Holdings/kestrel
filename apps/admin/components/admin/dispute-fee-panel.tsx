"use client";

import { useState, useTransition } from "react";
import { formatGBP, formatTierLabel } from "@kestrel/shared/pricing/format";
import {
  GOOD_FAITH_REFUND_TARGET_HOURS,
  WITHDRAWAL_REFUND_TARGET_HOURS,
} from "@kestrel/shared/pricing/config";
import {
  processGoodFaithRefund,
  processWithdrawalRefund,
} from "@/lib/admin/pricing-actions";
import type { DisputeFeeSummary } from "@/lib/admin/pricing-queries";

interface Props {
  summary: DisputeFeeSummary;
}

/**
 * Dispute fee panel — slotted into the right column of the admin dispute
 * detail page. Shows tier, claimant + respondent payment status, the four
 * good-faith refund eligibility criteria, and action buttons.
 *
 * The action buttons call server actions that re-evaluate eligibility on
 * the server before doing anything — the client-side checklist is just for
 * display, never trusted as authorisation.
 */
export function DisputeFeePanel({ summary }: Props) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const claimantStatus = summary.claimant.status;
  const respondentStatus = summary.respondent.status;
  const refundEligible = summary.goodFaithRefund.eligible;

  function runGoodFaithRefund() {
    if (!confirm("Confirm: process the good-faith refund for this respondent?")) {
      return;
    }
    setFeedback(null);
    startTransition(async () => {
      const result = await processGoodFaithRefund({
        disputeId: summary.dispute_id,
      });
      if ("error" in result) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({
          type: "success",
          message: "Good-faith refund recorded.",
        });
      }
    });
  }

  function runWithdrawalRefund() {
    if (!confirm("Confirm: process the withdrawal refund per PRICING.md §4.4?")) {
      return;
    }
    setFeedback(null);
    startTransition(async () => {
      const result = await processWithdrawalRefund({
        disputeId: summary.dispute_id,
      });
      if ("error" in result) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({
          type: "success",
          message: "Withdrawal refund recorded.",
        });
      }
    });
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
        Dispute fee
      </h2>

      {/* Tier */}
      <div className="space-y-3 text-sm">
        <Row label="Tier">
          {summary.tier_id ? (
            <span className="font-medium text-ink">
              {formatTierLabel(summary.tier_id)}
              {summary.claimant.expected_per_party_pence != null && (
                <span className="ml-2 text-xs text-text-muted">
                  ({formatGBP(summary.claimant.expected_per_party_pence)} per party)
                </span>
              )}
            </span>
          ) : (
            <span className="text-text-muted italic">Pre-pricing dispute</span>
          )}
        </Row>

        <Row label="Claimant">
          <PaymentBadge status={claimantStatus} />
        </Row>

        <Row label="Respondent">
          <PaymentBadge status={respondentStatus} />
        </Row>
      </div>

      {/* Eligibility checklist — only relevant if there's a respondent payment */}
      {summary.respondent.payment_row && (
        <div className="mt-5 pt-4 border-t border-border-subtle">
          <p className="text-xs uppercase tracking-wider text-text-muted mb-3">
            Good-faith refund eligibility
          </p>
          <ul className="space-y-2">
            {summary.goodFaithRefund.criteria.map((criterion) => (
              <li
                key={criterion.label}
                className="flex items-start gap-2.5 text-xs"
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                    criterion.met
                      ? "bg-kestrel/15 text-kestrel"
                      : "bg-stone/60 text-text-muted"
                  }`}
                  aria-hidden="true"
                >
                  {criterion.met ? "✓" : "·"}
                </span>
                <div className="flex-1">
                  <p
                    className={
                      criterion.met
                        ? "text-ink font-medium"
                        : "text-text-secondary"
                    }
                  >
                    {criterion.label}
                  </p>
                  <p className="text-text-muted">{criterion.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 pt-4 border-t border-border-subtle space-y-2">
        <button
          onClick={runGoodFaithRefund}
          disabled={!refundEligible || pending}
          className="w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-kestrel text-white hover:bg-kestrel-hover"
        >
          {pending ? "Processing…" : "Process good-faith refund"}
        </button>
        <button
          onClick={runWithdrawalRefund}
          disabled={pending}
          className="w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 bg-surface border border-border text-text-secondary hover:bg-stone/40"
        >
          Process withdrawal refund
        </button>

        {feedback && (
          <p
            className={`text-xs ${
              feedback.type === "success" ? "text-kestrel" : "text-error"
            }`}
          >
            {feedback.message}
          </p>
        )}

        <p className="text-xs text-text-muted pt-2">
          Targets: good-faith {GOOD_FAITH_REFUND_TARGET_HOURS}h, withdrawal{" "}
          {WITHDRAWAL_REFUND_TARGET_HOURS}h.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-secondary">{label}</span>
      <span>{children}</span>
    </div>
  );
}

function PaymentBadge({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-text-muted italic text-xs">Not yet</span>;
  }
  const styles: Record<string, string> = {
    pending: "bg-warning/10 text-warning border-warning/20",
    succeeded: "bg-kestrel/10 text-kestrel border-kestrel/20",
    failed: "bg-error/10 text-error border-error/20",
    refunded: "bg-sage/15 text-sage border-sage/30",
    partially_refunded: "bg-sage/10 text-sage border-sage/20",
  };
  const labels: Record<string, string> = {
    pending: "Pending",
    succeeded: "Paid",
    failed: "Failed",
    refunded: "Refunded",
    partially_refunded: "Partial refund",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
        styles[status] ?? "bg-stone/60 text-text-muted border-border"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
