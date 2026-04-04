import Link from "next/link";
import { listUsers } from "@/lib/admin/user-queries";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { formatRelativeDate, formatStatus } from "@kestrel/shared/dates/format";

interface UsersPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

interface UserRow {
  id: string;
  display_name: string;
  email: string;
  business_name: string | null;
  plan: string | null;
  document_count: number;
  dispute_count: number;
  created_at: string | null;
}

const columns: Column<UserRow>[] = [
  {
    key: "display_name",
    header: "Name",
    render: (row) => (
      <Link
        href={`/users/${row.id}`}
        className="font-medium text-ink hover:text-kestrel transition-colors"
      >
        {row.display_name}
      </Link>
    ),
  },
  {
    key: "email",
    header: "Email",
    render: (row) => (
      <span className="text-text-secondary">{row.email}</span>
    ),
  },
  {
    key: "business_name",
    header: "Business",
    render: (row) => (
      <span className="text-text-secondary">
        {row.business_name ?? "\u2014"}
      </span>
    ),
  },
  {
    key: "plan",
    header: "Plan",
    render: (row) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
          row.plan === "professional" || row.plan === "business"
            ? "bg-kestrel/10 text-kestrel"
            : "bg-stone text-text-secondary"
        }`}
      >
        {row.plan ? formatStatus(row.plan) : "Free"}
      </span>
    ),
  },
  {
    key: "document_count",
    header: "Docs",
    render: (row) => (
      <span className="text-text-secondary tabular-nums">
        {row.document_count}
      </span>
    ),
  },
  {
    key: "dispute_count",
    header: "Disputes",
    render: (row) => (
      <span className="text-text-secondary tabular-nums">
        {row.dispute_count}
      </span>
    ),
  },
  {
    key: "created_at",
    header: "Joined",
    render: (row) => (
      <span className="text-text-muted">
        {row.created_at ? formatRelativeDate(row.created_at) : "\u2014"}
      </span>
    ),
  },
];

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const search = params.search ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const result = await listUsers({ search, page, pageSize: 20 });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Users</h1>
        <p className="text-text-secondary mt-1">
          {result.total} {result.total === 1 ? "user" : "users"} registered.
        </p>
      </div>

      {/* Search bar */}
      <form method="GET" action="/users" className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name, email, or business..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-kestrel/20 focus:border-kestrel transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 text-sm font-medium text-white bg-kestrel hover:bg-kestrel-hover rounded-lg transition-colors"
        >
          Search
        </button>
        {search && (
          <Link
            href="/users"
            className="px-4 py-2.5 text-sm font-medium text-text-secondary bg-white border border-border hover:bg-stone/30 rounded-lg transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={result.users}
        emptyMessage={
          search
            ? `No users matching "${search}".`
            : "No users registered yet."
        }
      />

      {/* Pagination */}
      <Pagination
        page={result.page}
        pageSize={20}
        total={result.total}
        baseUrl="/users"
        searchParams={search ? { search } : {}}
      />
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
