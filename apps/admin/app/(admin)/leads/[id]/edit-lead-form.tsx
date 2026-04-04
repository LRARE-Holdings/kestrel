"use client";

import { useActionState, useState } from "react";
import { updateLead } from "@/lib/leads/actions";
import type { Lead } from "@/lib/leads/queries";
import { LEAD_STAGES } from "@/lib/leads/schemas";

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export function EditLeadForm({ lead }: { lead: Lead }) {
  const [editing, setEditing] = useState(false);
  const boundAction = updateLead.bind(null, lead.id);
  const [state, formAction, isPending] = useActionState(boundAction, null);

  // Close edit mode on success
  if (state?.success && editing) {
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
            Contact details
          </h2>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-kestrel hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-muted mb-1">Name</p>
            <p className="text-sm text-ink">{lead.name}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Email</p>
            <p className="text-sm text-ink">{lead.email ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Phone</p>
            <p className="text-sm text-ink">{lead.phone ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Company</p>
            <p className="text-sm text-ink">{lead.company ?? "-"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="bg-white rounded-xl border border-border p-6 space-y-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
          Edit contact details
        </h2>
      </div>

      {state?.error && (
        <div className="p-3 text-sm text-error bg-red-50 border border-error/20 rounded-lg">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="edit-name"
            className="block text-xs text-text-muted mb-1"
          >
            Name
          </label>
          <input
            type="text"
            id="edit-name"
            name="name"
            defaultValue={lead.name}
            required
            className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
          />
        </div>
        <div>
          <label
            htmlFor="edit-email"
            className="block text-xs text-text-muted mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="edit-email"
            name="email"
            defaultValue={lead.email ?? ""}
            className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
          />
        </div>
        <div>
          <label
            htmlFor="edit-phone"
            className="block text-xs text-text-muted mb-1"
          >
            Phone
          </label>
          <input
            type="tel"
            id="edit-phone"
            name="phone"
            defaultValue={lead.phone ?? ""}
            className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
          />
        </div>
        <div>
          <label
            htmlFor="edit-company"
            className="block text-xs text-text-muted mb-1"
          >
            Company
          </label>
          <input
            type="text"
            id="edit-company"
            name="company"
            defaultValue={lead.company ?? ""}
            className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
          />
        </div>
        <div>
          <label
            htmlFor="edit-source"
            className="block text-xs text-text-muted mb-1"
          >
            Source
          </label>
          <input
            type="text"
            id="edit-source"
            name="source"
            defaultValue={lead.source ?? ""}
            className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
          />
        </div>
        <div>
          <label
            htmlFor="edit-stage"
            className="block text-xs text-text-muted mb-1"
          >
            Stage
          </label>
          <select
            id="edit-stage"
            name="stage"
            defaultValue={lead.stage}
            className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
          >
            {LEAD_STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABELS[s] ?? s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="edit-next-action"
            className="block text-xs text-text-muted mb-1"
          >
            Next action date
          </label>
          <input
            type="date"
            id="edit-next-action"
            name="next_action_date"
            defaultValue={lead.next_action_date ?? ""}
            className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="edit-notes"
          className="block text-xs text-text-muted mb-1"
        >
          Notes
        </label>
        <textarea
          id="edit-notes"
          name="notes"
          rows={3}
          defaultValue={lead.notes ?? ""}
          className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel resize-y"
        />
      </div>

      <div className="flex items-center gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="px-3 py-1.5 text-xs font-medium text-text-secondary bg-white border border-border rounded-lg hover:bg-stone/30 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1.5 text-xs font-medium text-white bg-kestrel rounded-lg hover:bg-kestrel-hover transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
