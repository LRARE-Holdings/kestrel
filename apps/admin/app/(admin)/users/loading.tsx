function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-stone/50 ${className ?? ""}`} />;
}

export default function UsersLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-40 mt-2" />
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 max-w-md" />
        <Skeleton className="h-10 w-20" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-6 py-3 text-left"><Skeleton className="h-3 w-12" /></th>
                <th className="px-6 py-3 text-left"><Skeleton className="h-3 w-12" /></th>
                <th className="px-6 py-3 text-left"><Skeleton className="h-3 w-16" /></th>
                <th className="px-6 py-3 text-left"><Skeleton className="h-3 w-10" /></th>
                <th className="px-6 py-3 text-left"><Skeleton className="h-3 w-10" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-3"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-6 py-3"><Skeleton className="h-4 w-40" /></td>
                  <td className="px-6 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-3"><Skeleton className="h-5 w-16 rounded-md" /></td>
                  <td className="px-6 py-3"><Skeleton className="h-4 w-16" /></td>
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
