"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BillingActions({
  hasSubscription,
}: {
  hasSubscription: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function openPortal() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to open billing portal");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <Button
        variant="secondary"
        onClick={openPortal}
        disabled={!hasSubscription || loading}
      >
        {loading ? "Opening..." : "Open billing portal"}
      </Button>
      {!hasSubscription && (
        <p className="text-xs text-text-muted">
          Powered by Stripe. Available after upgrading.
        </p>
      )}
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
