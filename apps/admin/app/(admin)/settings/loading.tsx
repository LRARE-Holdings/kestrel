function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-stone/50 ${className ?? ""}`} />;
}

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border-subtle pb-px">
        <Skeleton className="h-8 w-20 rounded-t-md" />
        <Skeleton className="h-8 w-24 rounded-t-md" />
        <Skeleton className="h-8 w-20 rounded-t-md" />
      </div>

      {/* Content area */}
      <div className="bg-surface rounded-xl border border-border p-6 space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-24 mb-1.5" />
            <Skeleton className="h-10 w-full max-w-md rounded-lg" />
          </div>
        ))}
        <div className="pt-4 border-t border-border-subtle">
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
