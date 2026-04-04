"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-cream">
      <p className="font-mono text-sm font-semibold text-error">Error</p>
      <h1 className="mt-4 font-display text-3xl text-ink sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-4 text-text-secondary">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-8">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
