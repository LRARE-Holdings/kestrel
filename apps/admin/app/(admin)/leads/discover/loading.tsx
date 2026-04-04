function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-stone/50 ${className ?? ""}`}
    />
  );
}

export default function DiscoverLeadsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80 mt-2" />
      </div>

      {/* Search form outline */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <Skeleton className="h-3 w-20 mb-1" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-3 w-14 mb-1" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="flex items-end">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Empty results area */}
      <div className="bg-surface rounded-xl border border-border p-12">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </div>
  );
}
