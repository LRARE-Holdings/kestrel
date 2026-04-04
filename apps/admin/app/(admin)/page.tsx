import { getDashboardMetrics } from "@/lib/admin/dashboard-queries";
import { StatCard } from "@/components/admin/stat-card";
import { HorizontalBarChart } from "@/components/admin/horizontal-bar-chart";
import { formatRelativeDate, formatDocumentType, formatStatus } from "@kestrel/shared/dates/format";
import Link from "next/link";

export default async function AdminDashboard() {
  const metrics = await getDashboardMetrics();

  const activeSubscriptionLabel =
    metrics.subscriptions.paid > 0
      ? `${metrics.subscriptions.paid} paid / ${metrics.subscriptions.total} total`
      : `${metrics.subscriptions.total} total`;

  const disputeStatusItems = Object.entries(metrics.disputesByStatus)
    .sort(([, a], [, b]) => b - a)
    .map(([status, count]) => ({
      label: formatStatus(status),
      value: count,
    }));

  const docTypeItems = Object.entries(metrics.docsByType)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({
      label: formatDocumentType(type),
      value: count,
    }));

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Dashboard</h1>
        <p className="text-text-secondary mt-1">
          Platform overview and key metrics.
        </p>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={metrics.totalUsers}
          subtitle={`${metrics.newUsersWeek} new this week`}
          trend={metrics.newUsersWeek > 0 ? "up" : "neutral"}
        />
        <StatCard
          label="Documents Generated"
          value={metrics.totalDocuments}
        />
        <StatCard
          label="Active Disputes"
          value={metrics.activeDisputes}
          subtitle={`${metrics.totalDisputes} total`}
        />
        <StatCard
          label="Subscriptions"
          value={metrics.subscriptions.paid}
          subtitle={activeSubscriptionLabel}
        />
      </div>

      {/* Recent sign-ups */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
            Recent Sign-ups
          </h2>
          <Link
            href="/users"
            className="text-sm text-kestrel hover:text-kestrel-hover transition-colors font-medium"
          >
            View all
          </Link>
        </div>
        {metrics.recentUsers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-text-muted">No users yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {metrics.recentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-stone/30 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm text-ink font-medium">
                      <Link
                        href={`/users/${user.id}`}
                        className="hover:text-kestrel transition-colors"
                      >
                        {user.display_name}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-text-secondary">
                      {user.email}
                    </td>
                    <td className="px-6 py-3 text-sm text-text-secondary">
                      {user.business_name ?? "\u2014"}
                    </td>
                    <td className="px-6 py-3 text-sm text-text-muted">
                      {user.created_at
                        ? formatRelativeDate(user.created_at)
                        : "\u2014"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HorizontalBarChart
          title="Disputes by Status"
          items={disputeStatusItems}
        />
        <HorizontalBarChart
          title="Documents by Type"
          items={docTypeItems}
        />
      </div>
    </div>
  );
}
