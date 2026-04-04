function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-stone/50 ${className ?? ""}`} />;
}

export default function LeadsLoading() {
  return (
    <div className="space-y-6">
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>

      {/* View toggle + filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-stone/30">
                <th className="px-4 py-3 text-left"><Skeleton className="h-3 w-10" /></th>
                <th className="px-4 py-3 text-left"><Skeleton className="h-3 w-16" /></th>
                <th className="px-4 py-3 text-left"><Skeleton className="h-3 w-12" /></th>
                <th className="px-4 py-3 text-left"><Skeleton className="h-3 w-12" /></th>
                <th className="px-4 py-3 text-left"><Skeleton className="h-3 w-12" /></th>
                <th className="px-4 py-3 text-left"><Skeleton className="h-3 w-20" /></th>
                <th className="px-4 py-3 text-left"><Skeleton className="h-3 w-16" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-18 rounded-md" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-md" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}
