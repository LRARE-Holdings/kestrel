import Link from "next/link";
import { listLeads, getLeadsByStage } from "@/lib/leads/queries";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/admin/pagination";
import { PipelineBoard } from "@/components/admin/pipeline-board";
import { formatRelativeDate } from "@kestrel/shared/dates/format";
import { LEAD_STAGES } from "@/lib/leads/schemas";

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

function formatActionDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
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

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const view =
    typeof params.view === "string" ? params.view : "list";
  const search =
    typeof params.search === "string" ? params.search : undefined;
  const stage =
    typeof params.stage === "string" ? params.stage : undefined;
  const status =
    typeof params.status === "string" ? params.status : undefined;
  const page =
    typeof params.page === "string" ? parseInt(params.page, 10) : 1;

  // Build filter params for pagination links
  const filterParams: Record<string, string> = {};
  if (view !== "list") filterParams.view = view;
  if (search) filterParams.search = search;
  if (stage) filterParams.stage = stage;
  if (status) filterParams.status = status;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Leads</h1>
          <p className="text-text-secondary text-sm mt-1">
            Track prospects through your sales pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/leads/discover"
            className="px-4 py-2 text-sm font-medium text-kestrel bg-surface border border-border rounded-lg hover:bg-stone/30 transition-colors"
          >
            Discover leads
          </Link>
          <Link
            href="/leads/new"
            className="px-4 py-2 text-sm font-medium text-white bg-kestrel rounded-lg hover:bg-kestrel-hover transition-colors"
          >
            Add lead
          </Link>
        </div>
      </div>

      {/* View toggle + filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* View toggle */}
        <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
          <Link
            href={buildFilterUrl({ ...filterParams, view: "list" })}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "list"
                ? "bg-kestrel text-white"
                : "text-text-secondary hover:bg-stone/30"
            }`}
          >
            List
          </Link>
          <Link
            href={buildFilterUrl({ ...filterParams, view: "pipeline" })}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "pipeline"
                ? "bg-kestrel text-white"
                : "text-text-secondary hover:bg-stone/30"
            }`}
          >
            Pipeline
          </Link>
        </div>

        {view === "list" && (
          <>
            {/* Search */}
            <form method="GET" className="flex items-center gap-2">
              {Object.entries(filterParams).map(
                ([k, v]) =>
                  k !== "search" &&
                  k !== "page" && (
                    <input key={k} type="hidden" name={k} value={v} />
                  ),
              )}
              <input
                type="text"
                name="search"
                placeholder="Search leads..."
                defaultValue={search ?? ""}
                className="px-3 py-2 text-sm bg-surface border border-border rounded-lg text-ink placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel w-48"
              />
              <button
                type="submit"
                className="px-3 py-2 text-xs font-medium text-text-secondary bg-surface border border-border rounded-lg hover:bg-stone/30 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Stage filter */}
            <form method="GET">
              {Object.entries(filterParams).map(
                ([k, v]) =>
                  k !== "stage" &&
                  k !== "page" && (
                    <input key={k} type="hidden" name={k} value={v} />
                  ),
              )}
              <select
                name="stage"
                defaultValue={stage ?? ""}
                className="px-3 py-2 text-sm bg-surface border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
                onChange="this.form.submit()"
              >
                <option value="">All stages</option>
                {LEAD_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABELS[s] ?? s}
                  </option>
                ))}
              </select>
            </form>

            {/* Status filter */}
            <form method="GET">
              {Object.entries(filterParams).map(
                ([k, v]) =>
                  k !== "status" &&
                  k !== "page" && (
                    <input key={k} type="hidden" name={k} value={v} />
                  ),
              )}
              <select
                name="status"
                defaultValue={status ?? ""}
                className="px-3 py-2 text-sm bg-surface border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
                onChange="this.form.submit()"
              >
                <option value="">Active</option>
                <option value="archived">Archived</option>
              </select>
            </form>

            {(search || stage || status) && (
              <Link
                href={`/leads?view=${view}`}
                className="text-xs text-text-muted hover:text-kestrel transition-colors"
              >
                Clear filters
              </Link>
            )}
          </>
        )}
      </div>

      {/* Content */}
      {view === "pipeline" ? (
        <PipelineView />
      ) : (
        <ListView
          search={search}
          stage={stage}
          status={status}
          page={page}
          filterParams={filterParams}
        />
      )}
    </div>
  );
}

async function PipelineView() {
  const grouped = await getLeadsByStage();

  const stages = LEAD_STAGES.map((key) => ({
    key,
    label: STAGE_LABELS[key] ?? key,
    leads: grouped[key].map((l) => ({
      id: l.id,
      name: l.name,
      company: l.company,
      email: l.email,
      next_action_date: l.next_action_date,
      status: l.status,
    })),
  }));

  return <PipelineBoard stages={stages} />;
}

async function ListView({
  search,
  stage,
  status,
  page,
  filterParams,
}: {
  search?: string;
  stage?: string;
  status?: string;
  page: number;
  filterParams: Record<string, string>;
}) {
  const { data: leads, total } = await listLeads({
    search,
    stage,
    status,
    page,
    pageSize: 20,
  });

  if (leads.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-12 text-center">
        <p className="text-text-muted text-sm">No leads found.</p>
        <Link
          href="/leads/new"
          className="text-sm text-kestrel hover:underline mt-2 inline-block"
        >
          Add your first lead
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-stone/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Next action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {leads.map((lead) => {
                const overdue = isOverdue(lead.next_action_date);

                return (
                  <tr
                    key={lead.id}
                    className="hover:bg-cream/50 transition-colors"
                  >
                    <td className="px-0 py-0">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="block px-4 py-3 font-medium text-ink hover:text-kestrel"
                      >
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {lead.company ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {lead.email ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.stage} variant="lead" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} variant="lead" />
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBadge score={lead.score} />
                    </td>
                    <td className="px-4 py-3">
                      {lead.next_action_date ? (
                        <span
                          className={`text-xs ${overdue ? "text-error font-medium" : "text-text-muted"}`}
                        >
                          {overdue ? "Overdue: " : ""}
                          {formatActionDate(lead.next_action_date)}
                        </span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {formatRelativeDate(lead.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        pageSize={20}
        total={total}
        baseUrl="/leads"
        searchParams={filterParams}
      />
    </>
  );
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null || score === 0)
    return <span className="text-text-muted">-</span>;
  const color =
    score >= 91
      ? "bg-sage/20 text-sage"
      : score >= 61
        ? "bg-warning/20 text-warning"
        : score >= 31
          ? "bg-kestrel/10 text-kestrel"
          : "bg-stone text-text-muted";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {score}
    </span>
  );
}

function buildFilterUrl(params: Record<string, string>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return `/leads${qs ? `?${qs}` : ""}`;
}
