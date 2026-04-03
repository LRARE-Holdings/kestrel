"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { IconCopy, IconCheck, IconClock } from "@/components/ui/icons";
import { DISPUTE_TYPE_LABELS, STATUS_LABELS } from "@/lib/disputes/constants";
import type { DisputeWithParties, DisputeStatus } from "@/lib/disputes/types";

interface DisputeMetadataProps {
  dispute: DisputeWithParties;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDeadline(dateStr: string | null): {
  text: string;
  urgent: boolean;
  overdue: boolean;
} {
  if (!dateStr) return { text: "No deadline", urgent: false, overdue: false };

  const deadline = new Date(dateStr);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (diffDays < 0) {
    return {
      text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""}`,
      urgent: true,
      overdue: true,
    };
  }
  if (diffDays === 0) {
    return { text: "Due today", urgent: true, overdue: false };
  }
  if (diffDays <= 3) {
    return {
      text: `${diffDays} day${diffDays !== 1 ? "s" : ""} remaining`,
      urgent: true,
      overdue: false,
    };
  }
  return {
    text: `${diffDays} days remaining`,
    urgent: false,
    overdue: false,
  };
}

function getStatusBadgeVariant(
  status: DisputeStatus
): "default" | "sage" | "warm" | "outline" | "destructive" {
  switch (status) {
    case "filed":
    case "awaiting_response":
      return "default";
    case "in_progress":
      return "warm";
    case "resolved":
      return "sage";
    case "escalated":
      return "destructive";
    case "withdrawn":
    case "expired":
    case "draft":
      return "outline";
    default:
      return "outline";
  }
}

export function DisputeMetadata({ dispute }: DisputeMetadataProps) {
  const [copied, setCopied] = useState(false);

  const copyReference = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(dispute.reference_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [dispute.reference_number]);

  const deadline = formatDeadline(dispute.response_deadline);
  const activeStatuses = [
    "filed",
    "awaiting_response",
    "in_progress",
  ];
  const showDeadline = activeStatuses.includes(dispute.status);

  return (
    <div className="space-y-5 rounded-[var(--radius-lg)] border border-border-subtle bg-white p-5">
      {/* Reference number */}
      <div>
        <span className="text-xs text-text-muted">Reference</span>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-ink">
            {dispute.reference_number}
          </span>
          <button
            type="button"
            onClick={copyReference}
            className="rounded-[var(--radius-sm)] p-1 text-text-muted hover:bg-stone hover:text-ink transition-colors"
            aria-label="Copy reference number"
          >
            {copied ? (
              <IconCheck className="h-3.5 w-3.5 text-sage" />
            ) : (
              <IconCopy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Dispute type */}
      <div>
        <span className="text-xs text-text-muted">Type</span>
        <div className="mt-1">
          <Badge variant="sage">
            {DISPUTE_TYPE_LABELS[dispute.dispute_type] ?? dispute.dispute_type}
          </Badge>
        </div>
      </div>

      {/* Amount */}
      <div>
        <span className="text-xs text-text-muted">Amount</span>
        <p className="mt-1 text-sm font-medium text-ink">
          {dispute.amount_disputed != null
            ? formatCurrency(dispute.amount_disputed)
            : "Non-monetary"}
        </p>
      </div>

      {/* Status */}
      <div>
        <span className="text-xs text-text-muted">Status</span>
        <div className="mt-1">
          <Badge variant={getStatusBadgeVariant(dispute.status)}>
            {STATUS_LABELS[dispute.status] ?? dispute.status}
          </Badge>
        </div>
      </div>

      {/* Filed by */}
      <div>
        <span className="text-xs text-text-muted">Filed by</span>
        {dispute.initiating_party ? (
          <div className="mt-1">
            <p className="text-sm text-ink">
              {dispute.initiating_party.display_name}
            </p>
            {dispute.initiating_party.business_name && (
              <p className="text-xs text-text-muted">
                {dispute.initiating_party.business_name}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-1 text-sm text-text-muted">Unknown</p>
        )}
      </div>

      {/* Filed against */}
      <div>
        <span className="text-xs text-text-muted">Filed against</span>
        {dispute.responding_party ? (
          <div className="mt-1">
            <p className="text-sm text-ink">
              {dispute.responding_party.display_name}
            </p>
            {dispute.responding_party.business_name && (
              <p className="text-xs text-text-muted">
                {dispute.responding_party.business_name}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-1">
            <p className="text-sm text-text-muted">Awaiting response</p>
            <p className="text-xs text-text-muted">
              {dispute.responding_party_email}
            </p>
          </div>
        )}
      </div>

      {/* Response deadline */}
      {showDeadline && (
        <div>
          <span className="text-xs text-text-muted">Response deadline</span>
          <div className="mt-1 flex items-center gap-1.5">
            <IconClock
              className={`h-3.5 w-3.5 ${
                deadline.overdue
                  ? "text-error"
                  : deadline.urgent
                    ? "text-warning"
                    : "text-text-muted"
              }`}
            />
            <span
              className={`text-sm ${
                deadline.overdue
                  ? "font-medium text-error"
                  : deadline.urgent
                    ? "font-medium text-warning"
                    : "text-text-secondary"
              }`}
            >
              {deadline.text}
            </span>
          </div>
        </div>
      )}

      {/* Filed date */}
      <div>
        <span className="text-xs text-text-muted">Filed</span>
        <p className="mt-1 text-sm text-text-secondary">
          {dispute.created_at
            ? formatRelativeDate(dispute.created_at)
            : "Unknown"}
        </p>
      </div>
    </div>
  );
}
