import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { IconArrowRight, IconClock } from "@/components/ui/icons";
import {
  DISPUTE_TYPE_LABELS,
  STATUS_LABELS,
} from "@/lib/disputes/constants";
import type { Dispute, DisputeStatus } from "@/lib/disputes/types";

interface DisputeCardProps {
  dispute: Dispute;
  currentUserId: string;
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

function getDeadlineState(
  deadlineStr: string | null
): { text: string; overdue: boolean; urgent: boolean } | null {
  if (!deadlineStr) return null;
  const deadline = new Date(deadlineStr);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (diffDays < 0) {
    return { text: "Overdue", overdue: true, urgent: true };
  }
  if (diffDays <= 3) {
    return {
      text: `${diffDays}d left`,
      overdue: false,
      urgent: true,
    };
  }
  return {
    text: `${diffDays}d left`,
    overdue: false,
    urgent: false,
  };
}

export function DisputeCard({ dispute, currentUserId }: DisputeCardProps) {
  const deadlineInfo = getDeadlineState(dispute.response_deadline);
  const isOverdue = deadlineInfo?.overdue ?? false;
  const isAwaitingResponse = dispute.status === "awaiting_response";

  const borderColor = isOverdue
    ? "border-l-error"
    : isAwaitingResponse
      ? "border-l-warning"
      : "border-l-transparent";

  return (
    <Link
      href={`/disputes/${dispute.id}`}
      className={`group block rounded-[var(--radius-lg)] border border-border-subtle bg-surface shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] border-l-4 ${borderColor}`}
    >
      <div className="p-5">
        {/* Top row: reference + status */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-text-muted">
            {dispute.reference_number}
          </span>
          <Badge variant={getStatusBadgeVariant(dispute.status)}>
            {STATUS_LABELS[dispute.status] ?? dispute.status}
          </Badge>
        </div>

        {/* Subject */}
        <h3 className="mt-2 text-sm font-medium text-ink group-hover:text-kestrel transition-colors">
          {dispute.subject}
        </h3>

        {/* Metadata row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
          <span>
            {DISPUTE_TYPE_LABELS[dispute.dispute_type] ?? dispute.dispute_type}
          </span>

          {dispute.amount_disputed != null && (
            <span className="font-medium text-text-secondary">
              {formatCurrency(dispute.amount_disputed)}
            </span>
          )}

          <span className="truncate max-w-[180px]">
            {dispute.responding_party_email}
          </span>

          {deadlineInfo && (
            <span
              className={`flex items-center gap-1 ${
                deadlineInfo.overdue
                  ? "text-error font-medium"
                  : deadlineInfo.urgent
                    ? "text-warning font-medium"
                    : ""
              }`}
            >
              <IconClock className="h-3 w-3" />
              {deadlineInfo.text}
            </span>
          )}
        </div>

        {/* View link */}
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-kestrel opacity-0 transition-opacity group-hover:opacity-100">
          View dispute
          <IconArrowRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}
