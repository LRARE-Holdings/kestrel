"use client";

import { useActionState } from "react";
import { createLead } from "@/lib/leads/actions";
import { LEAD_STAGES } from "@/lib/leads/schemas";

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export function NewLeadForm() {
  const [state, formAction, isPending] = useActionState(createLead, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-3 text-sm text-error bg-red-50 border border-error/20 rounded-lg">
          {state.error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-ink mb-1.5"
          >
            Name <span className="text-error">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
            placeholder="Contact name"
          />
        </div>

        {/* Email + Phone row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
              placeholder="email@company.com"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
              placeholder="+44 7XXX XXXXXX"
            />
          </div>
        </div>

        {/* Company */}
        <div>
          <label
            htmlFor="company"
            className="block text-sm font-medium text-ink mb-1.5"
          >
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
            placeholder="Company name"
          />
        </div>

        {/* Source + Stage row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="source"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              Source
            </label>
            <input
              type="text"
              id="source"
              name="source"
              className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
              placeholder="e.g. LinkedIn, Referral, Website"
            />
          </div>
          <div>
            <label
              htmlFor="stage"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              Stage
            </label>
            <select
              id="stage"
              name="stage"
              defaultValue="lead"
              className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
            >
              {LEAD_STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABELS[s] ?? s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Next action date */}
        <div>
          <label
            htmlFor="next_action_date"
            className="block text-sm font-medium text-ink mb-1.5"
          >
            Next action date
          </label>
          <input
            type="date"
            id="next_action_date"
            name="next_action_date"
            className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
          />
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-ink mb-1.5"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full px-3 py-2 text-sm bg-white border border-border rounded-lg text-ink placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel resize-y"
            placeholder="Initial notes about this lead..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end">
        <a
          href="/leads"
          className="px-4 py-2 text-sm font-medium text-text-secondary bg-white border border-border rounded-lg hover:bg-stone/30 transition-colors"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-kestrel rounded-lg hover:bg-kestrel-hover transition-colors disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create lead"}
        </button>
      </div>
    </form>
  );
}
