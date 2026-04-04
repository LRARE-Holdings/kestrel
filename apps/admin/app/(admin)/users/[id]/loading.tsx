function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-stone/50 ${className ?? ""}`} />;
}

export default function UserDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div>
        <Skeleton className="h-4 w-24 mb-4" />
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-56 mt-2" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card (left 2/3) */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6">
          <Skeleton className="h-3 w-16 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20 mb-1.5" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar (1/3) */}
        <div className="space-y-6">
          {/* Subscription card */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <Skeleton className="h-3 w-24 mb-4" />
            <div className="space-y-3">
              <div>
                <Skeleton className="h-3 w-12 mb-1.5" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div>
                <Skeleton className="h-3 w-14 mb-1.5" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div>
                <Skeleton className="h-3 w-20 mb-1.5" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>

          {/* Activity card */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <Skeleton className="h-3 w-16 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-8 w-10 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div>
                <Skeleton className="h-8 w-10 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>

          {/* Actions card */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <Skeleton className="h-3 w-16 mb-4" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
