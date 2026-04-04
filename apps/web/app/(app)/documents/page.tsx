import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDocuments } from "@/lib/documents/actions";
import { formatRelativeDate, formatDocumentType } from "@kestrel/shared/dates/format";

export const metadata: Metadata = {
  title: "Documents — Kestrel",
};

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Documents</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Your saved contracts, letters, and generated documents.
          </p>
        </div>
        <Link href="/tools">
          <Button>Create document</Button>
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-border bg-white/50 py-16">
          <svg
            className="h-12 w-12 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-base font-semibold text-ink">
            No documents yet
          </h3>
          <p className="mt-2 max-w-sm text-center text-sm text-text-secondary">
            Documents you generate with our free tools will appear here when
            you save them.
          </p>
          <Link href="/tools" className="mt-6">
            <Button variant="secondary">Explore tools</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between card-hover rounded-[var(--radius-lg)] border border-border-subtle bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-ink">
                    {doc.title}
                  </p>
                  {doc.includes_dispute_clause && (
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      Kestrel clause
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                  <span>{formatDocumentType(doc.document_type)}</span>
                  <span>{formatRelativeDate(doc.created_at ?? "")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
