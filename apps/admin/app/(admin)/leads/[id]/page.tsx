import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadDetail } from "@/lib/leads/queries";
import { StatusBadge } from "@/components/admin/status-badge";
import { Timeline, type TimelineItem } from "@/components/admin/timeline";
import { formatRelativeDate } from "@kestrel/shared/dates/format";
import { EditLeadForm } from "./edit-lead-form";
import { AddInteractionForm } from "./add-interaction-form";
import { LeadActions } from "./lead-actions";
import { AiAssessmentCard } from "./ai-assessment-card";
import type { AiAssessment } from "@/lib/leads/types";

function formatLongDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const actionDate = new Date(dateStr);
  actionDate.setHours(0, 0, 0, 0);
  return actionDate < today;
}

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { lead, interactions } = await getLeadDetail(id);

  if (!lead) {
    notFound();
  }

  const overdue = isOverdue(lead.next_action_date);

  // Build interaction timeline items
  const timelineItems: TimelineItem[] = interactions.map((i) => ({
    id: i.id,
    type: i.type,
    content: i.content,
    date: i.created_at,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/leads"
              className="text-xs text-text-muted hover:text-kestrel transition-colors"
            >
              Leads
            </Link>
            <span className="text-text-muted">/</span>
            <span className="text-xs text-text-secondary">{lead.name}</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-ink">
            {lead.name}
          </h1>
          {lead.company && (
            <p className="text-text-secondary text-sm mt-0.5">
              {lead.company}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={lead.stage} variant="lead" />
          <StatusBadge status={lead.status} variant="lead" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead info card */}
          <EditLeadForm lead={lead} />

          {/* Interaction timeline */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
              Interaction history
            </h2>
            <Timeline items={timelineItems} />
          </div>

          {/* Add interaction form */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
              Add interaction
            </h2>
            <AddInteractionForm leadId={lead.id} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Status card */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
              Status
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-muted mb-1">Stage</p>
                <p className="text-sm font-medium text-ink">
                  {STAGE_LABELS[lead.stage] ?? lead.stage}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Next action</p>
                {lead.next_action_date ? (
                  <p
                    className={`text-sm ${overdue ? "text-error font-medium" : "text-ink"}`}
                  >
                    {overdue ? "Overdue: " : ""}
                    {formatLongDate(lead.next_action_date)}
                  </p>
                ) : (
                  <p className="text-sm text-text-muted">Not set</p>
                )}
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Source</p>
                <p className="text-sm text-ink">
                  {lead.source ?? "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Created</p>
                <p className="text-sm text-text-muted">
                  {formatRelativeDate(lead.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* AI plan recommendation */}
          <AiAssessmentCard
            leadId={lead.id}
            assessment={lead.ai_assessment as AiAssessment | null}
            assessedAt={lead.ai_assessed_at}
          />

          {/* Notes */}
          {lead.notes && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
                Notes
              </h2>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                {lead.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
              Actions
            </h2>
            <LeadActions leadId={lead.id} currentStage={lead.stage} currentStatus={lead.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
