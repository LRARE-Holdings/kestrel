import { Badge } from "@/components/ui/badge";
import { SUBMISSION_TYPE_LABELS } from "@/lib/disputes/constants";
import type { SubmissionWithAuthor, UserRole } from "@/lib/disputes/types";

interface SubmissionCardProps {
  submission: SubmissionWithAuthor;
  currentUserId: string;
  disputeRole: UserRole;
  isLast?: boolean;
}

function formatTimestamp(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getSubmissionDotColor(type: string): string {
  switch (type) {
    case "initial_claim":
      return "bg-kestrel";
    case "response":
      return "bg-sage";
    case "proposal":
      return "bg-warm";
    case "acceptance":
      return "bg-sage";
    case "rejection":
      return "bg-error";
    case "withdrawal":
      return "bg-error/60";
    case "evidence_summary":
      return "bg-stone";
    default:
      return "bg-border";
  }
}

function getSubmissionBadgeVariant(
  type: string
): "default" | "sage" | "warm" | "outline" | "destructive" {
  switch (type) {
    case "initial_claim":
      return "default";
    case "response":
    case "acceptance":
      return "sage";
    case "proposal":
      return "warm";
    case "rejection":
    case "withdrawal":
      return "destructive";
    default:
      return "outline";
  }
}

function getRoleLabel(
  submittedBy: string,
  currentUserId: string,
  disputeRole: UserRole
): string {
  if (submittedBy === currentUserId) {
    return disputeRole === "initiating"
      ? "Initiating party (you)"
      : "Responding party (you)";
  }
  return disputeRole === "initiating"
    ? "Responding party"
    : "Initiating party";
}

export function SubmissionCard({
  submission,
  currentUserId,
  disputeRole,
  isLast = false,
}: SubmissionCardProps) {
  const dotColor = getSubmissionDotColor(submission.submission_type);
  const badgeVariant = getSubmissionBadgeVariant(submission.submission_type);
  const roleLabel = getRoleLabel(
    submission.submitted_by,
    currentUserId,
    disputeRole
  );
  const isCurrentUser = submission.submitted_by === currentUserId;

  const metadata = submission.metadata as Record<string, unknown> | null;
  const submissionContent: string = submission.content;

  return (
    <div className="flex gap-4">
      {/* Timeline dot and line */}
      <div className="flex flex-col items-center">
        <div
          className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${dotColor}`}
        />
        {!isLast && <div className="w-px flex-1 bg-border-subtle" />}
      </div>

      {/* Card */}
      <div className="mb-4 min-w-0 flex-1 rounded-[var(--radius-lg)] border border-border-subtle bg-white p-4 shadow-[var(--shadow-sm)]">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={badgeVariant} className="shrink-0">
            {SUBMISSION_TYPE_LABELS[submission.submission_type] ??
              submission.submission_type}
          </Badge>
          <span className="text-sm font-medium text-ink">
            {submission.author?.display_name ?? "Unknown"}
          </span>
          <span className="text-xs text-text-muted">{roleLabel}</span>
          <span className="ml-auto text-xs text-text-muted">
            {formatTimestamp(submission.created_at)}
          </span>
        </div>

        {/* Content */}
        <p className="mt-3 whitespace-pre-wrap text-sm text-text-secondary leading-relaxed">
          {submissionContent}
        </p>

        {/* Proposal details */}
        {submission.submission_type === "proposal" && metadata != null ? (
          <div className="mt-3 rounded-[var(--radius-md)] bg-warm/10 p-3 space-y-2">
            {metadata.proposed_amount != null ? (
              <div>
                <span className="text-xs font-medium text-text-muted">
                  Proposed amount
                </span>
                <p className="text-sm font-medium text-ink">
                  {new Intl.NumberFormat("en-GB", {
                    style: "currency",
                    currency: "GBP",
                  }).format(Number(metadata.proposed_amount))}
                </p>
              </div>
            ) : null}
            {metadata.proposed_terms != null ? (
              <div>
                <span className="text-xs font-medium text-text-muted">
                  Proposed terms
                </span>
                <p className="text-sm text-text-secondary">
                  {String(metadata.proposed_terms)}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Acceptance / Rejection reference */}
        {(submission.submission_type === "acceptance" ||
          submission.submission_type === "rejection") &&
        metadata?.proposal_submission_id != null ? (
          <p className="mt-2 text-xs text-text-muted">
            In response to proposal{" "}
            <span className="font-mono">
              {String(metadata.proposal_submission_id).slice(0, 8)}
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
