import Link from "next/link";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import {
  formatRelativeDate,
  formatDeadline,
  formatCurrency,
  formatDisputeType,
  formatStatus,
} from "@kestrel/shared/dates/format";

interface Dispute {
  id: string;
  reference_number: string;
  subject: string;
  status:
    | "draft"
    | "filed"
    | "awaiting_response"
    | "in_progress"
    | "resolved"
    | "escalated"
    | "withdrawn"
    | "expired";
  dispute_type:
    | "payment"
    | "deliverables"
    | "service_quality"
    | "contract_interpretation"
    | "other";
  amount_disputed: number | null;
  currency: string | null;
  responding_party_email: string | null;
  response_deadline: string | null;
  created_at: string;
  updated_at: string;
}

interface DisputesTimelineProps {
  disputes: Dispute[];
}

const statusBadgeVariant: Record<string, BadgeVariant> = {
  draft: "outline",
  filed: "outline",
  awaiting_response: "outline",
  in_progress: "default",
  resolved: "sage",
  withdrawn: "warm",
  expired: "warm",
  escalated: "destructive",
};

function groupDisputes(disputes: Dispute[]) {
  const needsAttention: Dispute[] = [];
  const active: Dispute[] = [];
  const resolved: Dispute[] = [];
  const escalated: Dispute[] = [];

  const now = new Date();

  for (const d of disputes) {
    if (d.status === "escalated") {
      escalated.push(d);
    } else if (
      d.status === "awaiting_response" ||
      (d.status === "filed" &&
        d.response_deadline &&
        new Date(d.response_deadline) < now)
    ) {
      needsAttention.push(d);
    } else if (d.status === "filed" || d.status === "in_progress") {
      active.push(d);
    } else if (
      d.status === "resolved" ||
      d.status === "withdrawn" ||
      d.status === "expired"
    ) {
      resolved.push(d);
    }
  }

  return { needsAttention, active, resolved, escalated };
}

function isOverdue(deadline: string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

function DisputeRow({ dispute }: { dispute: Dispute }) {
  const overdue =
    dispute.response_deadline && isOverdue(dispute.response_deadline);
  const deadline = dispute.response_deadline
    ? formatDeadline(dispute.response_deadline)
    : null;

  const borderClass = overdue
    ? "border-l-2 border-l-error"
    : dispute.status === "awaiting_response"
      ? "border-l-2 border-l-warning"
      : "";

  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-4 ${borderClass}`}
    >
      {/* Top line: reference + status badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-text-muted">
          {dispute.reference_number}
        </span>
        <Badge variant={statusBadgeVariant[dispute.status] ?? "outline"}>
          {formatStatus(dispute.status)}
        </Badge>
      </div>

      {/* Subject */}
      <p className="mt-1.5 text-sm font-medium text-ink">{dispute.subject}</p>

      {/* Metadata row */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
        <span>{formatDisputeType(dispute.dispute_type)}</span>

        {dispute.amount_disputed != null && (
          <span>
            {formatCurrency(
              dispute.amount_disputed,
              dispute.currency ?? "GBP",
            )}
          </span>
        )}

        {dispute.responding_party_email && (
          <span>{dispute.responding_party_email}</span>
        )}

        {deadline && (
          <span className={deadline.urgent ? "font-medium text-error" : ""}>
            {deadline.text}
          </span>
        )}
      </div>

      {/* View link */}
      <Link
        href={`/disputes/${dispute.id}`}
        className="mt-3 inline-block text-xs font-medium text-kestrel transition-colors hover:text-kestrel-hover"
      >
        View dispute
      </Link>
    </div>
  );
}

function SectionHeader({
  title,
  dotColor,
}: {
  title: string;
  dotColor?: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {dotColor && (
        <span
          className={`inline-block h-2 w-2 rounded-full ${dotColor}`}
          aria-hidden="true"
        />
      )}
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
    </div>
  );
}

export function DisputesTimeline({ disputes }: DisputesTimelineProps) {
  if (disputes.length === 0) return null;

  const { needsAttention, active, resolved, escalated } =
    groupDisputes(disputes);

  return (
    <div className="space-y-8">
      {needsAttention.length > 0 && (
        <div>
          <SectionHeader title="Needs attention" dotColor="bg-warning" />
          <div className="space-y-3">
            {needsAttention.map((d) => (
              <DisputeRow key={d.id} dispute={d} />
            ))}
          </div>
        </div>
      )}

      {active.length > 0 && (
        <div>
          <SectionHeader title="Active disputes" />
          <div className="space-y-3">
            {active.map((d) => (
              <DisputeRow key={d.id} dispute={d} />
            ))}
          </div>
        </div>
      )}

      {escalated.length > 0 && (
        <div>
          <SectionHeader title="Escalated" dotColor="bg-error" />
          <div className="space-y-3">
            {escalated.map((d) => (
              <DisputeRow key={d.id} dispute={d} />
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <SectionHeader title="Resolved" />
          <div className="space-y-3">
            {resolved.map((d) => (
              <DisputeRow key={d.id} dispute={d} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
