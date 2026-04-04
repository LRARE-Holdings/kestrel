import Link from "next/link";

interface Lead {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  next_action_date: string | null;
  status: string;
}

interface PipelineStage {
  key: string;
  label: string;
  leads: Lead[];
}

interface PipelineBoardProps {
  stages: PipelineStage[];
}

const stageColors: Record<string, string> = {
  lead: "bg-blue-500",
  contacted: "bg-amber-500",
  qualified: "bg-kestrel",
  proposal: "bg-purple-500",
  won: "bg-green-600",
  lost: "bg-text-muted",
};

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const actionDate = new Date(dateStr);
  actionDate.setHours(0, 0, 0, 0);
  return actionDate < today;
}

function formatActionDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function PipelineBoard({ stages }: PipelineBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => (
        <div
          key={stage.key}
          className="min-w-[260px] max-w-[300px] flex-1 flex flex-col"
        >
          {/* Stage header */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <div
              className={`w-2.5 h-2.5 rounded-full ${stageColors[stage.key] ?? "bg-text-muted"}`}
            />
            <h3 className="text-sm font-medium text-ink capitalize">
              {stage.label}
            </h3>
            <span className="text-xs text-text-muted bg-stone/50 rounded-full px-2 py-0.5">
              {stage.leads.length}
            </span>
          </div>

          {/* Lead cards */}
          <div className="space-y-2 flex-1">
            {stage.leads.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-4 text-center">
                <p className="text-xs text-text-muted">No leads</p>
              </div>
            )}
            {stage.leads.map((lead) => {
              const overdue = isOverdue(lead.next_action_date);

              return (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className={`block bg-white rounded-xl border p-3 hover:shadow-md transition-shadow ${
                    overdue ? "border-error/40" : "border-border"
                  }`}
                >
                  <p className="text-sm font-medium text-ink truncate">
                    {lead.name}
                  </p>
                  {lead.company && (
                    <p className="text-xs text-text-secondary mt-0.5 truncate">
                      {lead.company}
                    </p>
                  )}
                  {lead.next_action_date && (
                    <div className="mt-2 flex items-center gap-1">
                      <CalendarIcon
                        className={`w-3 h-3 ${overdue ? "text-error" : "text-text-muted"}`}
                      />
                      <span
                        className={`text-xs ${overdue ? "text-error font-medium" : "text-text-muted"}`}
                      >
                        {overdue ? "Overdue: " : ""}
                        {formatActionDate(lead.next_action_date)}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
