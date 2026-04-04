"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateLeadStage, archiveLead } from "@/lib/leads/actions";
import { LEAD_STAGES } from "@/lib/leads/schemas";

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export function LeadActions({
  leadId,
  currentStage,
  currentStatus,
}: {
  leadId: string;
  currentStage: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);

  async function handleStageChange(newStage: string) {
    setPending(true);
    setError(null);
    const result = await updateLeadStage(leadId, newStage);
    setPending(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  async function handleArchive() {
    setPending(true);
    setError(null);
    const result = await archiveLead(leadId);
    setPending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setConfirmArchive(false);
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}

      {/* Stage change buttons */}
      <div>
        <p className="text-xs text-text-muted mb-2">Move to stage</p>
        <div className="flex flex-wrap gap-1.5">
          {LEAD_STAGES.filter((s) => s !== currentStage).map((stage) => (
            <button
              key={stage}
              onClick={() => handleStageChange(stage)}
              disabled={pending}
              className="px-2.5 py-1 text-xs font-medium text-text-secondary bg-stone/30 border border-border-subtle rounded-md hover:bg-stone/50 transition-colors disabled:opacity-50"
            >
              {STAGE_LABELS[stage]}
            </button>
          ))}
        </div>
      </div>

      {/* Archive */}
      {currentStatus === "active" && (
        <div className="pt-3 border-t border-border-subtle">
          {!confirmArchive ? (
            <button
              onClick={() => setConfirmArchive(true)}
              className="text-xs text-text-muted hover:text-error transition-colors"
            >
              Archive lead
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmArchive(false)}
                disabled={pending}
                className="px-2.5 py-1 text-xs font-medium text-text-secondary bg-surface border border-border rounded-md hover:bg-stone/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                disabled={pending}
                className="px-2.5 py-1 text-xs font-medium text-white bg-error rounded-md hover:bg-error/90 transition-colors disabled:opacity-50"
              >
                {pending ? "Archiving..." : "Confirm archive"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
