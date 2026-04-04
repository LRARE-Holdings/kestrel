"use client";

import { useActionState, useRef } from "react";
import { addInteraction } from "@/lib/leads/actions";
import { INTERACTION_TYPES } from "@/lib/leads/schemas";

const TYPE_LABELS: Record<string, string> = {
  email: "Email",
  call: "Phone call",
  meeting: "Meeting",
  note: "Note",
  linkedin: "LinkedIn",
};

export function AddInteractionForm({ leadId }: { leadId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const boundAction = addInteraction.bind(null, leadId);
  const [state, formAction, isPending] = useActionState(boundAction, null);

  // Reset form on success
  if (state?.success && formRef.current) {
    formRef.current.reset();
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-3 text-sm text-error bg-red-50 border border-error/20 rounded-lg">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label
            htmlFor="interaction-type"
            className="block text-xs text-text-muted mb-1"
          >
            Type
          </label>
          <select
            id="interaction-type"
            name="type"
            defaultValue="note"
            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel"
          >
            {INTERACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t] ?? t}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3">
          <label
            htmlFor="interaction-content"
            className="block text-xs text-text-muted mb-1"
          >
            Content
          </label>
          <textarea
            id="interaction-content"
            name="content"
            rows={2}
            required
            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-ink placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel resize-y"
            placeholder="Describe the interaction..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-kestrel rounded-lg hover:bg-kestrel-hover transition-colors disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add interaction"}
        </button>
      </div>
    </form>
  );
}
