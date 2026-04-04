import Link from "next/link";
import { notFound } from "next/navigation";
import { getDisputeOverview } from "@/lib/admin/dispute-queries";
import { StatusBadge } from "@/components/admin/status-badge";
import { Timeline, type TimelineItem } from "@/components/admin/timeline";
import {
  formatCurrency,
  formatDisputeType,
} from "@kestrel/shared/dates/format";
import { EscalateButton } from "./escalate-button";

function formatLongDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const {
    dispute,
    respondingParty,
    submissionCount,
    evidenceCount,
    auditLog,
  } = await getDisputeOverview(id);

  if (!dispute) {
    notFound();
  }

  const canEscalate =
    dispute.status !== "escalated" &&
    dispute.status !== "resolved" &&
    dispute.status !== "withdrawn" &&
    dispute.status !== "expired";

  // Build timeline items from key dates
  const dateTimelineItems: TimelineItem[] = [];

  if (dispute.created_at) {
    dateTimelineItems.push({
      id: "filed",
      type: "dispute_filed",
      content: "Dispute filed",
      date: dispute.created_at,
    });
  }
  if (dispute.response_deadline) {
    dateTimelineItems.push({
      id: "deadline",
      type: "status_changed",
      content: `Response deadline: ${formatLongDate(dispute.response_deadline)}`,
      date: dispute.response_deadline,
    });
  }
  if (dispute.escalated_at) {
    dateTimelineItems.push({
      id: "escalated",
      type: "escalated",
      content: "Dispute escalated",
      date: dispute.escalated_at,
    });
  }
  if (dispute.resolved_at) {
    dateTimelineItems.push({
      id: "resolved",
      type: "resolved",
      content: "Dispute resolved",
      date: dispute.resolved_at,
    });
  }

  // Sort dates chronologically
  dateTimelineItems.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Build audit log timeline
  const auditTimelineItems: TimelineItem[] = auditLog.map((entry) => ({
    id: entry.id,
    type: entry.action,
    content: formatAuditAction(entry.action, entry.metadata),
    date: entry.created_at ?? "",
    author: entry.actor?.display_name,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/disputes"
              className="text-xs text-text-muted hover:text-kestrel transition-colors"
            >
              Disputes
            </Link>
            <span className="text-text-muted">/</span>
            <span className="font-mono text-xs text-text-secondary">
              {dispute.reference_number}
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-ink">
            {dispute.subject}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={dispute.status} variant="dispute" />
          {canEscalate && <EscalateButton disputeId={dispute.id} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: overview + parties */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview card */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
              Overview
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted mb-1">Reference</p>
                <p className="text-sm font-mono text-ink">
                  {dispute.reference_number}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Type</p>
                <p className="text-sm text-ink">
                  {formatDisputeType(dispute.dispute_type)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Amount</p>
                <p className="text-sm text-ink">
                  {dispute.amount_disputed
                    ? formatCurrency(
                        dispute.amount_disputed,
                        dispute.currency ?? "GBP",
                      )
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Dispute clause</p>
                <p className="text-sm text-ink">
                  {dispute.includes_dispute_clause ? "Included" : "Not included"}
                </p>
              </div>
            </div>
            {dispute.description && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-muted mb-1">Description</p>
                <p className="text-sm text-ink leading-relaxed">
                  {dispute.description}
                </p>
              </div>
            )}
          </div>

          {/* Parties card */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
              Parties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Initiating party */}
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
                  Initiating party
                </p>
                <p className="text-sm font-medium text-ink">
                  {dispute.initiating_party?.display_name ?? "Unknown"}
                </p>
                <p className="text-sm text-text-secondary">
                  {dispute.initiating_party?.email}
                </p>
                {dispute.initiating_party?.business_name && (
                  <p className="text-sm text-text-muted mt-0.5">
                    {dispute.initiating_party.business_name}
                  </p>
                )}
              </div>

              {/* Responding party */}
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
                  Responding party
                </p>
                {respondingParty ? (
                  <>
                    <p className="text-sm font-medium text-ink">
                      {respondingParty.display_name}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {respondingParty.email}
                    </p>
                    {respondingParty.business_name && (
                      <p className="text-sm text-text-muted mt-0.5">
                        {respondingParty.business_name}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-text-secondary">
                      {dispute.responding_party_email}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      No account registered
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Audit log */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
              Audit log
            </h2>
            <Timeline items={auditTimelineItems} />
          </div>
        </div>

        {/* Right column: timeline + stats */}
        <div className="space-y-6">
          {/* Key dates timeline */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
              Key dates
            </h2>
            <Timeline items={dateTimelineItems} />
          </div>

          {/* Stats card */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
              Activity
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  Submissions
                </span>
                <span className="text-sm font-medium text-ink">
                  {submissionCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  Evidence files
                </span>
                <span className="text-sm font-medium text-ink">
                  {evidenceCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Audit entries</span>
                <span className="text-sm font-medium text-ink">
                  {auditLog.length}
                </span>
              </div>
            </div>
            <p className="text-xs text-text-muted mt-4 pt-3 border-t border-border-subtle">
              Submission content and evidence files are not accessible to admins
              for data isolation purposes.
            </p>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
              Timestamps
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Created</span>
                <span className="text-text-muted">
                  {dispute.created_at
                    ? formatShortDateTime(dispute.created_at)
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Updated</span>
                <span className="text-text-muted">
                  {dispute.updated_at
                    ? formatShortDateTime(dispute.updated_at)
                    : "-"}
                </span>
              </div>
              {dispute.escalated_at && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Escalated</span>
                  <span className="text-error text-xs">
                    {formatShortDateTime(dispute.escalated_at)}
                  </span>
                </div>
              )}
              {dispute.resolved_at && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Resolved</span>
                  <span className="text-green-600 text-xs">
                    {formatShortDateTime(dispute.resolved_at)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatAuditAction(
  action: string,
  metadata: Record<string, unknown> | null,
): string {
  const labels: Record<string, string> = {
    dispute_filed: "Dispute was filed",
    status_changed: metadata
      ? `Status changed to ${String(metadata.new_status ?? "unknown")}`
      : "Status was changed",
    submission_added: metadata
      ? `${formatSubmissionType(String(metadata.submission_type ?? ""))} submitted`
      : "Submission added",
    evidence_uploaded: metadata
      ? `Evidence file uploaded: ${String(metadata.file_name ?? "file")}`
      : "Evidence file uploaded",
    escalated: "Dispute was escalated",
    resolved: "Dispute was resolved",
    proposal_sent: "Settlement proposal sent",
    proposal_accepted: "Settlement proposal accepted",
    proposal_rejected: "Settlement proposal rejected",
    withdrawn: "Dispute was withdrawn",
  };

  return labels[action] ?? action.replace(/_/g, " ");
}

function formatSubmissionType(type: string): string {
  const labels: Record<string, string> = {
    initial_claim: "Initial claim",
    response: "Response",
    reply: "Reply",
    evidence_summary: "Evidence summary",
    proposal: "Proposal",
    acceptance: "Acceptance",
    rejection: "Rejection",
    withdrawal: "Withdrawal",
  };
  return labels[type] ?? type;
}
