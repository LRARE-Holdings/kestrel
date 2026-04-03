import Link from "next/link";
import { DisputesTimeline } from "@/components/app/dashboard/disputes-timeline";
import { StatsPanel } from "@/components/app/dashboard/stats-panel";
import { IconScale, IconArrowRight } from "@/components/ui/icons";

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

interface RecentDocument {
  id: string;
  title: string;
  document_type: string;
  created_at: string;
  updated_at: string;
}

interface PopulatedDashboardProps {
  disputes: Dispute[];
  recentDocuments: RecentDocument[];
  documentCount: number;
}

function NoDisputesMessage() {
  return (
    <div className="rounded-xl border border-border-subtle bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sage/15">
          <IconScale className="h-5 w-5 text-kestrel" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">No disputes yet</p>
          <p className="mt-1 text-sm text-text-muted">
            When you file a dispute or someone files one involving you, it will
            appear here. In the meantime, keep using the toolkit to build
            stronger agreements.
          </p>
          <Link
            href="/tools"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-kestrel transition-colors hover:text-kestrel-hover"
          >
            Explore tools
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PopulatedDashboard({
  disputes,
  recentDocuments,
  documentCount,
}: PopulatedDashboardProps) {
  const activeDisputeCount = disputes.filter(
    (d) =>
      d.status === "filed" ||
      d.status === "awaiting_response" ||
      d.status === "in_progress" ||
      d.status === "escalated",
  ).length;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {disputes.length > 0 ? (
          <DisputesTimeline disputes={disputes} />
        ) : (
          <NoDisputesMessage />
        )}
      </div>
      <div>
        <StatsPanel
          documentCount={documentCount}
          activeDisputeCount={activeDisputeCount}
          recentDocuments={recentDocuments}
        />
      </div>
    </div>
  );
}
