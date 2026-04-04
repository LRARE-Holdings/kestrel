"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { IconDownload, IconFileText, IconPaperclip } from "@/components/ui/icons";
import { getSignedUrl } from "@/lib/disputes/actions";
import type { EvidenceFileWithMeta } from "@/lib/disputes/types";

interface EvidencePanelProps {
  files: EvidenceFileWithMeta[];
  disputeId: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function getFileTypeIcon(fileType: string): string {
  if (fileType.includes("pdf")) return "PDF";
  if (fileType.includes("word") || fileType.includes("docx")) return "DOCX";
  if (fileType.includes("sheet") || fileType.includes("xlsx")) return "XLSX";
  if (fileType.includes("image")) return "IMG";
  return "FILE";
}

export function EvidencePanel({ files, disputeId }: EvidencePanelProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = useCallback(async (fileId: string) => {
    setDownloading(fileId);
    setError(null);
    try {
      const result = await getSignedUrl(fileId);
      if ("url" in result) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else {
        setError(result.error);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setDownloading(null);
    }
  }, []);

  return (
    <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-white p-5">
      <h3 className="text-sm font-medium text-ink">Evidence</h3>

      {error && (
        <p className="mt-3 rounded-[var(--radius-sm)] bg-error/5 px-3 py-2 text-xs text-error">
          {error}
        </p>
      )}

      {files.length > 0 ? (
        <div className="mt-3 space-y-2.5">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border-subtle p-3"
            >
              {/* Type badge */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-stone">
                <span className="text-[10px] font-semibold text-text-secondary">
                  {getFileTypeIcon(file.file_type)}
                </span>
              </div>

              {/* File info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{file.file_name}</p>
                <p className="text-xs text-text-muted">
                  {formatFileSize(file.file_size_bytes)}
                  {file.uploader?.display_name &&
                    ` \u00B7 ${file.uploader.display_name}`}
                  {file.created_at && ` \u00B7 ${formatDate(file.created_at)}`}
                </p>
              </div>

              {/* Download */}
              <button
                type="button"
                onClick={() => handleDownload(file.id)}
                disabled={downloading === file.id}
                className="shrink-0 rounded-[var(--radius-sm)] p-1.5 text-text-muted hover:bg-stone hover:text-ink transition-colors disabled:opacity-50"
                aria-label={`Download ${file.file_name}`}
              >
                {downloading === file.id ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-text-muted border-t-transparent" />
                ) : (
                  <IconDownload className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-text-muted">
          No evidence uploaded yet.
        </p>
      )}
    </div>
  );
}
