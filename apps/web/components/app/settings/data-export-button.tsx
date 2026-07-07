"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

/**
 * Triggers the UK GDPR data export (`/api/account/export`) and saves the
 * returned JSON to the user's device. Honest about failure rather than
 * pretending to work.
 */
export function DataExportButton() {
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");

  const handleExport = useCallback(async () => {
    setStatus("working");
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        setStatus("error");
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? "kestrel-data-export.json";

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, []);

  return (
    <div className="mt-4">
      <Button
        variant="secondary"
        onClick={handleExport}
        disabled={status === "working"}
      >
        {status === "working" ? "Preparing…" : "Download your data (JSON)"}
      </Button>
      {status === "error" && (
        <p className="mt-2 text-xs text-error">
          We couldn&apos;t prepare your export. Please try again shortly.
        </p>
      )}
    </div>
  );
}
