"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent, updateGtagConsent } from "@/lib/consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if the user hasn't already chosen
    if (getConsent() === null) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    setConsent("granted");
    updateGtagConsent("granted");
    setVisible(false);
    // Reload so the analytics script tag picks up consent
    window.location.reload();
  }

  function handleReject() {
    setConsent("denied");
    updateGtagConsent("denied");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 animate-[fade-up_0.4s_ease-out_both] p-4 sm:p-6"
    >
      <div className="mx-auto flex max-w-screen-md flex-col gap-4 rounded-[var(--radius-xl)] border border-border bg-white/95 px-6 py-5 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:gap-6">
        <p className="flex-1 text-sm leading-relaxed text-text-secondary">
          We use cookies for analytics (Google Analytics and Vercel) to
          understand how you use Kestrel and improve the experience. No personal
          data is sold.{" "}
          <Link
            href="/privacy"
            className="font-medium text-kestrel underline decoration-kestrel/30 underline-offset-2 hover:decoration-kestrel"
          >
            Privacy policy
          </Link>
        </p>

        <div className="flex shrink-0 gap-3">
          <button
            onClick={handleReject}
            className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kestrel/40 focus-visible:ring-offset-2"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="rounded-[var(--radius-md)] bg-kestrel px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-kestrel-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kestrel/40 focus-visible:ring-offset-2"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
