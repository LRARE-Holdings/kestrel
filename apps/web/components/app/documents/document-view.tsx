"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  generateContractPdf,
  generateTermsPdf,
  generateLetterPdf,
  downloadPdf,
} from "@/lib/pdf/generate";
import type { RenderedDocument } from "@/lib/documents/render";

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "document"
  );
}

export function DocumentView({
  rendered,
  includesDisputeClause,
}: {
  rendered: RenderedDocument;
  includesDisputeClause: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!rendered.plainText) return;
    try {
      await navigator.clipboard.writeText(rendered.plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — no-op; the document text is still on screen.
    }
  }, [rendered.plainText]);

  const handleDownload = useCallback(() => {
    const filename = `${slugify(rendered.title)}.pdf`;
    if (rendered.kind === "contract" && rendered.contractDoc) {
      downloadPdf(generateContractPdf(rendered.contractDoc), filename);
    } else if (rendered.kind === "terms" && rendered.termsDoc) {
      downloadPdf(generateTermsPdf(rendered.termsDoc), filename);
    } else if (rendered.kind === "letter" && rendered.letterDoc) {
      downloadPdf(generateLetterPdf(rendered.letterDoc), filename);
    }
  }, [rendered]);

  const canRender = rendered.kind !== "unavailable" && !!rendered.plainText;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/documents"
            className="text-xs font-medium text-text-muted transition-colors hover:text-ink"
          >
            ← Back to documents
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-ink">{rendered.title}</h1>
            {includesDisputeClause && (
              <Badge variant="outline" className="text-[10px]">
                Kestrel clause
              </Badge>
            )}
          </div>
          {rendered.subtitle && (
            <p className="mt-1 text-sm text-text-secondary">{rendered.subtitle}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {canRender && (
            <>
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                {copied ? "Copied" : "Copy to clipboard"}
              </Button>
              <Button size="sm" onClick={handleDownload}>
                Download PDF
              </Button>
            </>
          )}
          {rendered.editHref && (
            <Link href={rendered.editHref}>
              <Button variant="ghost" size="sm">
                {rendered.editLabel ?? "Edit in tool"}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Body */}
      {canRender ? (
        <div className="mt-8 overflow-hidden rounded-[var(--radius-xl)] border border-border-subtle bg-surface shadow-[var(--shadow-sm)]">
          <div className="max-h-none overflow-x-auto px-6 py-8 sm:px-10 sm:py-10">
            <pre className="whitespace-pre-wrap break-words font-body text-sm leading-relaxed text-ink">
              {rendered.plainText}
            </pre>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-[var(--radius-xl)] border border-dashed border-border bg-surface/50 px-6 py-12 text-center">
          <h2 className="text-base font-semibold text-ink">
            Preview unavailable
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            {rendered.reason}
          </p>
          {rendered.editHref && (
            <Link href={rendered.editHref} className="mt-6 inline-block">
              <Button variant="secondary" size="sm">
                {rendered.editLabel ?? "Open tool"}
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
