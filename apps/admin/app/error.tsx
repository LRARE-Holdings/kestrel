"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-2xl font-bold font-display text-ink">Something went wrong</h2>
        <p className="text-text-secondary">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center px-4 py-2 bg-kestrel text-white rounded-lg hover:bg-kestrel-hover transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
