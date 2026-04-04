function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-stone/50 ${className ?? ""}`} />;
}

export default function NewLeadLoading() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Header with breadcrumb */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-2" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-8 w-40" />
      </div>

      {/* Form skeleton */}
      <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-24 mb-1.5" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <div className="pt-2">
          <Skeleton className="h-3 w-16 mb-1.5" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
