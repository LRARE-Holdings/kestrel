import { SubmissionCard } from "@/components/app/disputes/submission-card";
import type { SubmissionWithAuthor, UserRole } from "@/lib/disputes/types";

interface SubmissionTimelineProps {
  submissions: SubmissionWithAuthor[];
  currentUserId: string;
  disputeRole: UserRole;
}

export function SubmissionTimeline({
  submissions,
  currentUserId,
  disputeRole,
}: SubmissionTimelineProps) {
  if (submissions.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-text-muted">No submissions yet.</p>
      </div>
    );
  }

  return (
    <div>
      {submissions.map((submission, i) => (
        <SubmissionCard
          key={submission.id}
          submission={submission}
          currentUserId={currentUserId}
          disputeRole={disputeRole}
          isLast={i === submissions.length - 1}
        />
      ))}
    </div>
  );
}
