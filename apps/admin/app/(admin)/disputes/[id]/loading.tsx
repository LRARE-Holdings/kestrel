function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-stone/50 ${className ?? ""}`} />;
}

export default function DisputeDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header with breadcrumb */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-2" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview card */}
          <div className="bg-white rounded-xl border border-border p-6">
            <Skeleton className="h-3 w-20 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-16 mb-1.5" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <Skeleton className="h-3 w-20 mb-1.5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </div>
          </div>

          {/* Parties card */}
          <div className="bg-white rounded-xl border border-border p-6">
            <Skeleton className="h-3 w-16 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-28 mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Audit log card */}
          <div className="bg-white rounded-xl border border-border p-6">
            <Skeleton className="h-3 w-20 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-2 w-2 rounded-full mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Key dates */}
          <div className="bg-white rounded-xl border border-border p-6">
            <Skeleton className="h-3 w-20 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-2 w-2 rounded-full mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity card */}
          <div className="bg-white rounded-xl border border-border p-6">
            <Skeleton className="h-3 w-16 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>

          {/* Timestamps card */}
          <div className="bg-white rounded-xl border border-border p-6">
            <Skeleton className="h-3 w-24 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
