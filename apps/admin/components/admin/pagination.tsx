import Link from "next/link";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
}

export function Pagination({
  page,
  pageSize,
  total,
  baseUrl,
  searchParams = {},
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  function buildUrl(targetPage: number): string {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(targetPage));
    return `${baseUrl}?${params.toString()}`;
  }

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-text-muted">
        Showing {(page - 1) * pageSize + 1}
        {" - "}
        {Math.min(page * pageSize, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        {hasPrev ? (
          <Link
            href={buildUrl(page - 1)}
            className="px-3 py-1.5 text-xs font-medium text-text-secondary bg-surface border border-border rounded-lg hover:bg-stone/30 transition-colors"
          >
            Previous
          </Link>
        ) : (
          <span className="px-3 py-1.5 text-xs font-medium text-text-muted bg-stone/20 border border-border-subtle rounded-lg cursor-not-allowed">
            Previous
          </span>
        )}
        {hasNext ? (
          <Link
            href={buildUrl(page + 1)}
            className="px-3 py-1.5 text-xs font-medium text-text-secondary bg-surface border border-border rounded-lg hover:bg-stone/30 transition-colors"
          >
            Next
          </Link>
        ) : (
          <span className="px-3 py-1.5 text-xs font-medium text-text-muted bg-stone/20 border border-border-subtle rounded-lg cursor-not-allowed">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
