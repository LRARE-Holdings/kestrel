import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { IconArrowRight } from "@/components/ui/icons";
import {
  formatRelativeDate,
  formatDocumentType,
} from "@/lib/dates/format";

interface RecentDocument {
  id: string;
  title: string;
  document_type: string;
  created_at: string;
  updated_at: string;
}

interface StatsPanelProps {
  documentCount: number;
  activeDisputeCount: number;
  recentDocuments: RecentDocument[];
  planName?: string;
}

const quickActions = [
  { label: "Create contract", href: "/tools/contracts" },
  { label: "Late payment", href: "/tools/late-payment/calculator" },
  { label: "New handshake", href: "/tools/handshake" },
];

export function StatsPanel({
  documentCount,
  activeDisputeCount,
  recentDocuments,
  planName = "Free",
}: StatsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Stats card */}
      <div className="rounded-xl border border-border-subtle bg-white p-5">
        <div className="space-y-0 divide-y divide-border-subtle">
          {/* Documents */}
          <div className="pb-4">
            <p className="font-mono text-2xl font-semibold text-ink">
              {documentCount}
            </p>
            <p className="mt-0.5 text-xs uppercase tracking-wider text-text-muted">
              Saved documents
            </p>
          </div>

          {/* Disputes */}
          <div className="py-4">
            <p className="font-mono text-2xl font-semibold text-ink">
              {activeDisputeCount}
            </p>
            <p className="mt-0.5 text-xs uppercase tracking-wider text-text-muted">
              Active disputes
            </p>
          </div>

          {/* Plan */}
          <div className="pt-4">
            <Badge variant="sage">{planName}</Badge>
            <p className="mt-1.5 text-xs uppercase tracking-wider text-text-muted">
              Current plan
            </p>
          </div>
        </div>
      </div>

      {/* Recent documents */}
      <div>
        <h3 className="text-sm font-semibold text-ink">Recent documents</h3>
        {recentDocuments.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {recentDocuments.slice(0, 5).map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/documents/${doc.id}`}
                  className="group block rounded-lg px-2 py-1.5 transition-colors hover:bg-stone/40"
                >
                  <p className="truncate text-sm text-ink transition-colors group-hover:text-kestrel">
                    {doc.title}
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatDocumentType(doc.document_type)}
                    {" \u00B7 "}
                    {formatRelativeDate(doc.updated_at)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-text-muted">No documents yet</p>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-ink">Quick actions</h3>
        <ul className="mt-2 space-y-1">
          {quickActions.map((action) => (
            <li key={action.href}>
              <Link
                href={action.href}
                className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-ink transition-colors hover:bg-stone/40 hover:text-kestrel"
              >
                <span>{action.label}</span>
                <IconArrowRight className="h-3.5 w-3.5 text-text-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-kestrel group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
