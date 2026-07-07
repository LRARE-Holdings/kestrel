"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@kestrel/shared/dates/format";
import type { UserToolRecords } from "@/lib/tool-records/actions";

function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const absolute =
          typeof window !== "undefined"
            ? `${window.location.origin}${path}`
            : path;
        await navigator.clipboard.writeText(absolute);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard unavailable — no-op.
      }
    },
    [path],
  );

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-[var(--radius-sm)] border border-border-subtle px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-border hover:text-ink"
    >
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}

function humanStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function RecordRow({
  href,
  title,
  meta,
  status,
  sharePath,
  clause,
  createdAt,
}: {
  href: string;
  title: string;
  meta: string;
  status: string;
  sharePath: string;
  clause: boolean;
  createdAt: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-4">
      <Link href={href} className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-ink">{title}</p>
          {clause && (
            <Badge variant="outline" className="shrink-0 text-[10px]">
              Kestrel clause
            </Badge>
          )}
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
          {meta && <span className="truncate">{meta}</span>}
          <span className="shrink-0">{humanStatus(status)}</span>
          <span className="shrink-0">{formatRelativeDate(createdAt ?? "")}</span>
        </div>
      </Link>
      <CopyLinkButton path={sharePath} />
    </div>
  );
}

export function ToolRecordsSection({ records }: { records: UserToolRecords }) {
  return (
    <div className="mt-12 space-y-8">
      <div>
        <h2 className="font-display text-xl text-ink">Shared tools you created</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Handshakes, notices, and milestone trackers linked to your account.
        </p>
      </div>

      {records.handshakes.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-text-secondary">Handshakes</h3>
          <div className="mt-3 space-y-3">
            {records.handshakes.map((h) => (
              <RecordRow
                key={h.id}
                href={h.shareUrl}
                title={h.title}
                meta={h.counterpartyBusiness || h.counterpartyName}
                status={h.status}
                sharePath={h.shareUrl}
                clause={h.includesDisputeClause}
                createdAt={h.createdAt}
              />
            ))}
          </div>
        </section>
      )}

      {records.notices.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-text-secondary">Notices</h3>
          <div className="mt-3 space-y-3">
            {records.notices.map((n) => (
              <RecordRow
                key={n.id}
                href={n.shareUrl}
                title={n.subject}
                meta={n.recipientBusiness || n.recipientName}
                status={n.status}
                sharePath={n.shareUrl}
                clause={n.includesDisputeClause}
                createdAt={n.createdAt}
              />
            ))}
          </div>
        </section>
      )}

      {records.projects.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-text-secondary">
            Milestone trackers
          </h3>
          <div className="mt-3 space-y-3">
            {records.projects.map((p) => (
              <RecordRow
                key={p.id}
                href={p.shareUrl}
                title={p.name}
                meta={p.counterpartyBusiness || p.counterpartyName}
                status={p.status}
                sharePath={p.shareUrl}
                clause={p.includesDisputeClause}
                createdAt={p.createdAt}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
