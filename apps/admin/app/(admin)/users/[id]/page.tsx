import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserDetail } from "@/lib/admin/user-queries";
import { toggleBanAction } from "@/lib/admin/user-actions";
import {
  formatRelativeDate,
  formatStatus,
} from "@kestrel/shared/dates/format";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const user = await getUserDetail(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div>
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-kestrel transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to users
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-ink">
              {user.display_name}
            </h1>
            <p className="text-text-secondary mt-1">{user.email}</p>
          </div>
          {user.isBanned && (
            <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-error/10 text-error">
              Disabled
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
            Profile
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <DetailField label="Full Name" value={user.display_name} />
            <DetailField label="Email" value={user.email} />
            <DetailField
              label="Business Name"
              value={user.business_name}
            />
            <DetailField
              label="Business Type"
              value={user.business_type ? formatStatus(user.business_type) : null}
            />
            <DetailField
              label="Company Size"
              value={user.company_size}
            />
            <DetailField
              label="Industry"
              value={user.industry ? formatStatus(user.industry) : null}
            />
            <DetailField label="Phone" value={user.phone} />
            <DetailField
              label="Onboarding"
              value={user.onboarding_completed ? "Completed" : "Incomplete"}
            />
            <DetailField
              label="Joined"
              value={
                user.created_at
                  ? formatRelativeDate(user.created_at)
                  : null
              }
            />
            <DetailField
              label="Last Updated"
              value={
                user.updated_at
                  ? formatRelativeDate(user.updated_at)
                  : null
              }
            />
          </dl>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Subscription card */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
              Subscription
            </h2>
            {user.subscription ? (
              <dl className="space-y-3">
                <DetailField
                  label="Plan"
                  value={formatStatus(user.subscription.plan)}
                />
                <DetailField
                  label="Status"
                  value={formatStatus(user.subscription.status)}
                />
                {user.subscription.current_period_start && (
                  <DetailField
                    label="Period Start"
                    value={new Date(
                      user.subscription.current_period_start,
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  />
                )}
                {user.subscription.current_period_end && (
                  <DetailField
                    label="Period End"
                    value={new Date(
                      user.subscription.current_period_end,
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  />
                )}
              </dl>
            ) : (
              <p className="text-sm text-text-muted">
                No subscription record.
              </p>
            )}
          </div>

          {/* Stats card */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
              Activity
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-display font-bold text-ink">
                  {user.documentCount}
                </p>
                <p className="text-sm text-text-muted">Documents</p>
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-ink">
                  {user.disputeCount}
                </p>
                <p className="text-sm text-text-muted">Disputes</p>
              </div>
            </div>
          </div>

          {/* Actions card */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">
              Actions
            </h2>
            <form action={toggleBanAction}>
              <input type="hidden" name="userId" value={user.id} />
              <input
                type="hidden"
                name="banned"
                value={user.isBanned ? "false" : "true"}
              />
              <button
                type="submit"
                className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  user.isBanned
                    ? "bg-sage/10 text-sage hover:bg-sage/20"
                    : "bg-error/10 text-error hover:bg-error/20"
                }`}
              >
                {user.isBanned ? "Enable User" : "Disable User"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-text-muted uppercase tracking-wider">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-ink">
        {value ?? <span className="text-text-muted">{"\u2014"}</span>}
      </dd>
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}
