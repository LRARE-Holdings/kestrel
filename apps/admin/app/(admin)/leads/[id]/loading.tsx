function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-stone/50 ${className ?? ""}`} />;
}

export default function LeadDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header with breadcrumb */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-2" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit form card */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <Skeleton className="h-3 w-24 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-20 mb-1.5" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
              <Skeleton className="h-10 w-24 rounded-lg mt-2" />
            </div>
          </div>

          {/* Interaction timeline */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <Skeleton className="h-3 w-32 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-2 w-2 rounded-full mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add interaction form */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <Skeleton className="h-3 w-28 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Status card */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <Skeleton className="h-3 w-14 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-20 mb-1.5" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>

          {/* Notes card */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <Skeleton className="h-3 w-12 mb-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-1" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </div>

          {/* Actions card */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <Skeleton className="h-3 w-16 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
