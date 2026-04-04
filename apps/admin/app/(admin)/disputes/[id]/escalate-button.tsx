"use client";

import { useState } from "react";
import { escalateDisputeAction } from "./actions";

export function EscalateButton({ disputeId }: { disputeId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEscalate() {
    setPending(true);
    setError(null);
    const result = await escalateDisputeAction(disputeId);
    setPending(false);

    if (result.error) {
      setError(result.error);
    } else {
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="px-3 py-1.5 text-xs font-medium text-error bg-red-50 border border-error/20 rounded-lg hover:bg-red-100 transition-colors"
      >
        Escalate
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-error">{error}</span>}
      <button
        onClick={() => setConfirming(false)}
        disabled={pending}
        className="px-3 py-1.5 text-xs font-medium text-text-secondary bg-white border border-border rounded-lg hover:bg-stone/30 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleEscalate}
        disabled={pending}
        className="px-3 py-1.5 text-xs font-medium text-white bg-error rounded-lg hover:bg-error/90 transition-colors disabled:opacity-50"
      >
        {pending ? "Escalating..." : "Confirm escalation"}
      </button>
    </div>
  );
}
