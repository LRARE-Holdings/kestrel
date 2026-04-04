export default function DisputeDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back link skeleton */}
      <div className="h-5 w-32 rounded bg-stone" />

      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-3/4 rounded bg-stone" />
        <div className="h-4 w-40 rounded bg-stone" />
      </div>

      {/* Status bar skeleton */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-6 w-6 rounded-full bg-stone" />
              <div className="hidden h-3 w-16 rounded bg-stone sm:block" />
            </div>
            {i < 4 && (
              <div className="mx-1.5 mb-6 hidden h-px flex-1 bg-stone sm:block" />
            )}
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-4 lg:col-span-2">
          {/* Timeline skeletons */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-stone" />
                {i < 3 && <div className="w-px flex-1 bg-stone" />}
              </div>
              <div className="mb-4 flex-1 rounded-[var(--radius-lg)] border border-border-subtle bg-white p-4">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-20 rounded-full bg-stone" />
                  <div className="h-4 w-24 rounded bg-stone" />
                  <div className="ml-auto h-3 w-12 rounded bg-stone" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-full rounded bg-stone" />
                  <div className="h-3 w-4/5 rounded bg-stone" />
                  <div className="h-3 w-3/5 rounded bg-stone" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata skeleton */}
          <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-white p-5 space-y-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-16 rounded bg-stone" />
                <div className="h-4 w-32 rounded bg-stone" />
              </div>
            ))}
          </div>

          {/* Evidence skeleton */}
          <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-white p-5 space-y-3">
            <div className="h-4 w-16 rounded bg-stone" />
            <div className="h-10 w-full rounded bg-stone" />
          </div>
        </div>
      </div>
    </div>
  );
}
