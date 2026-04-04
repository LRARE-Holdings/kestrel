"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  inviteAdmin,
  removeAdmin,
  changeAdminRole,
} from "@/lib/admin/admin-team-actions";
import type { AdminMember } from "@/lib/admin/admin-team-queries";

interface Props {
  adminUsers: AdminMember[];
  adminRole: string;
  currentAdminId: string;
}

export function AdminTeamTab({ adminUsers, adminRole, currentAdminId }: Props) {
  const [inviteState, inviteAction, isInviting] = useActionState(
    inviteAdmin,
    null,
  );
  const isSuperAdmin = adminRole === "super_admin";

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Admin users table */}
      <div className="bg-white border border-border-subtle rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle">
          <h2 className="text-lg font-display font-semibold text-ink">
            Admin Team
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            {adminUsers.length} admin{adminUsers.length !== 1 ? "s" : ""} with
            access to this panel.
          </p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-cream/40">
              <th className="text-left px-6 py-3 font-medium text-text-secondary">
                Email
              </th>
              <th className="text-left px-6 py-3 font-medium text-text-secondary">
                Role
              </th>
              <th className="text-left px-6 py-3 font-medium text-text-secondary">
                Added
              </th>
              {isSuperAdmin && (
                <th className="text-right px-6 py-3 font-medium text-text-secondary">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((member) => (
              <AdminRow
                key={member.user_id}
                member={member}
                isSuperAdmin={isSuperAdmin}
                isSelf={member.user_id === currentAdminId}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite form (super_admin only) */}
      {isSuperAdmin && (
        <div className="bg-white border border-border-subtle rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-display font-semibold text-ink">
            Invite Admin
          </h3>
          <p className="text-xs text-text-muted">
            The user must already have a Kestrel account before they can be
            added as an admin.
          </p>
          <form
            action={inviteAction}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-1">
              <label
                htmlFor="invite-email"
                className="block text-xs font-medium text-text-secondary"
              >
                Email
              </label>
              <input
                id="invite-email"
                type="email"
                name="email"
                required
                placeholder="colleague@example.com"
                className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel transition-colors"
              />
            </div>
            <div className="w-40 space-y-1">
              <label
                htmlFor="invite-role"
                className="block text-xs font-medium text-text-secondary"
              >
                Role
              </label>
              <select
                id="invite-role"
                name="role"
                defaultValue="admin"
                className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel transition-colors"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isInviting}
              className="px-4 py-2 text-sm font-medium text-white bg-kestrel hover:bg-kestrel-hover rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isInviting ? "Inviting..." : "Invite"}
            </button>
          </form>
          {inviteState?.error && (
            <p className="text-sm text-error">{inviteState.error}</p>
          )}
          {inviteState?.success && (
            <p className="text-sm text-kestrel">Admin invited successfully.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin row
// ---------------------------------------------------------------------------

function AdminRow({
  member,
  isSuperAdmin,
  isSelf,
}: {
  member: AdminMember;
  isSuperAdmin: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const canEdit = isSuperAdmin && !isSelf;

  const addedDate = new Date(member.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value;
    startTransition(async () => {
      await changeAdminRole(member.user_id, newRole);
      router.refresh();
    });
  }

  function handleRemove() {
    if (!confirm(`Remove ${member.email} as admin?`)) return;
    startTransition(async () => {
      await removeAdmin(member.user_id);
      router.refresh();
    });
  }

  return (
    <tr className="border-b border-border-subtle last:border-b-0 hover:bg-cream/20 transition-colors">
      <td className="px-6 py-3">
        <span className="text-ink">{member.email}</span>
        {isSelf && (
          <span className="ml-2 text-xs text-text-muted">(you)</span>
        )}
      </td>
      <td className="px-6 py-3">
        {canEdit ? (
          <select
            value={member.role}
            onChange={handleRoleChange}
            disabled={isPending}
            className="px-2 py-1 text-xs bg-white border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel transition-colors disabled:opacity-50"
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        ) : (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
              member.role === "super_admin"
                ? "bg-kestrel/10 text-kestrel"
                : "bg-stone text-text-secondary"
            }`}
          >
            {member.role === "super_admin" ? "Super Admin" : "Admin"}
          </span>
        )}
      </td>
      <td className="px-6 py-3 text-text-muted text-xs">{addedDate}</td>
      {isSuperAdmin && (
        <td className="px-6 py-3 text-right">
          {canEdit && (
            <button
              onClick={handleRemove}
              disabled={isPending}
              className="text-xs text-error hover:text-error/80 font-medium transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </td>
      )}
    </tr>
  );
}
