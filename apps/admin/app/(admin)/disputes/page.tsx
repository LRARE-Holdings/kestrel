import Link from "next/link";
import { listDisputes } from "@/lib/admin/dispute-queries";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/admin/pagination";
import {
  formatRelativeDate,
  formatDeadline,
  formatDisputeType,
} from "@kestrel/shared/dates/format";

const DISPUTE_STATUSES = [
  { value: "", label: "All statuses" },
  { value: "filed", label: "Filed" },
  { value: "awaiting_response", label: "Awaiting response" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "escalated", label: "Escalated" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "expired", label: "Expired" },
];

const DISPUTE_TYPES = [
  { value: "", label: "All types" },
  { value: "payment", label: "Payment" },
  { value: "deliverables", label: "Deliverables" },
  { value: "service_quality", label: "Service quality" },
  { value: "contract_interpretation", label: "Contract interpretation" },
  { value: "other", label: "Other" },
];

export default async function DisputesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;
  const type = typeof params.type === "string" ? params.type : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;

  const { data: disputes, total } = await listDisputes({
    status,
    type,
    page,
    pageSize: 20,
  });

  // Build search params for pagination
  const filterParams: Record<string, string> = {};
  if (status) filterParams.status = status;
  if (type) filterParams.type = type;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">
          Dispute Oversight
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Monitor all platform disputes. Metadata only — submission content and
          evidence files are not accessible.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <form className="flex items-center gap-3" method="GET">
          {/* Preserve other params */}
          {type && <input type="hidden" name="type" value={type} />}
          <select
            name="status"
            defaultValue={status ?? ""}
            className="px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
            onChange="this.form.submit()"
          >
            {DISPUTE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </form>

        <form className="flex items-center gap-3" method="GET">
          {status && <input type="hidden" name="status" value={status} />}
          <select
            name="type"
            defaultValue={type ?? ""}
            className="px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
            onChange="this.form.submit()"
          >
            {DISPUTE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </form>

        {(status || type) && (
          <Link
            href="/disputes"
            className="text-xs text-text-muted hover:text-kestrel transition-colors"
          >
            Clear filters
          </Link>
        )}

        <div className="ml-auto text-xs text-text-muted">
          {total} dispute{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      {disputes.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <p className="text-text-muted text-sm">No disputes found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-stone/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider max-w-[200px]">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Initiating party
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Respondent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Filed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Deadline
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {disputes.map((d) => {
                  const deadline = d.response_deadline
                    ? formatDeadline(d.response_deadline)
                    : null;

                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-cream/50 transition-colors"
                    >
                      <td className="px-0 py-0">
                        <Link
                          href={`/disputes/${d.id}`}
                          className="block px-4 py-3 font-mono text-xs text-kestrel hover:underline"
                        >
                          {d.reference_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {formatDisputeType(d.dispute_type)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={d.status} variant="dispute" />
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-ink">
                        {d.subject}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {d.initiating_party?.display_name ?? "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {d.responding_party_email}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {d.created_at
                          ? formatRelativeDate(d.created_at)
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {deadline ? (
                          <span
                            className={`text-xs ${deadline.urgent ? "text-error font-medium" : "text-text-muted"}`}
                          >
                            {deadline.text}
                          </span>
                        ) : (
                          <span className="text-text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        pageSize={20}
        total={total}
        baseUrl="/disputes"
        searchParams={filterParams}
      />
    </div>
  );
}
