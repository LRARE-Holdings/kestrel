"use client";

import { useState, useCallback } from "react";
import { zipSync } from "fflate";
import { IconDownload } from "@/components/ui/icons";
import { getSignedUrl, getAllEvidenceUrls } from "@/lib/disputes/actions";
import type { EvidenceFileWithMeta } from "@/lib/disputes/types";

interface EvidencePanelProps {
  files: EvidenceFileWithMeta[];
  disputeId: string;
  initiatingPartyName?: string;
  respondingPartyName?: string;
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

function sanitiseFolderName(name: string): string {
  return name.replace(/[^a-zA-Z0-9 _-]/g, "").trim() || "Party";
}

function getFileTypeIcon(fileType: string): string {
  if (fileType.includes("pdf")) return "PDF";
  if (fileType.includes("word") || fileType.includes("docx")) return "DOCX";
  if (fileType.includes("sheet") || fileType.includes("xlsx")) return "XLSX";
  if (fileType.includes("image")) return "IMG";
  return "FILE";
}

export function EvidencePanel({
  files,
  disputeId,
  initiatingPartyName,
  respondingPartyName,
}: EvidencePanelProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
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

  const handleDownloadAll = useCallback(async () => {
    setDownloadingAll(true);
    setError(null);
    try {
      const result = await getAllEvidenceUrls(disputeId);
      if ("error" in result) {
        setError(result.error);
        return;
      }

      // Fetch all file contents in parallel
      const fetched = await Promise.all(
        result.files.map(async (f) => {
          try {
            const res = await fetch(f.url);
            if (!res.ok) return null;
            const buf = await res.arrayBuffer();
            return { ...f, data: new Uint8Array(buf) };
          } catch {
            return null;
          }
        }),
      );

      const valid = fetched.filter(
        (f): f is NonNullable<typeof f> & { data: Uint8Array } => f !== null,
      );

      if (valid.length === 0) {
        setError("Failed to download evidence files.");
        return;
      }

      // Build folder names
      const initiatingFolder = sanitiseFolderName(
        initiatingPartyName ?? "Initiating Party",
      );
      const respondingFolder = sanitiseFolderName(
        respondingPartyName ?? "Responding Party",
      );

      // Build the zip structure with deduped file names per folder
      const zipData: Record<string, Uint8Array> = {};
      const nameCount: Record<string, number> = {};

      for (const file of valid) {
        let folder: string;
        if (file.party === "initiating") {
          folder = initiatingFolder;
        } else if (file.party === "responding") {
          folder = respondingFolder;
        } else {
          folder = "Other";
        }

        // Deduplicate file names within each folder
        const key = `${folder}/${file.fileName}`;
        if (zipData[key] !== undefined) {
          nameCount[key] = (nameCount[key] ?? 1) + 1;
          const ext = file.fileName.lastIndexOf(".");
          const name =
            ext > 0 ? file.fileName.slice(0, ext) : file.fileName;
          const extension = ext > 0 ? file.fileName.slice(ext) : "";
          zipData[`${folder}/${name} (${nameCount[key]})${extension}`] =
            file.data;
        } else {
          zipData[key] = file.data;
        }
      }

      // Generate the zip
      const zipped = zipSync(zipData);
      const blob = new Blob([zipped.buffer as ArrayBuffer], { type: "application/zip" });
      const url = URL.createObjectURL(blob);

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `evidence-${disputeId.slice(0, 8)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to create zip. Please try again.");
    } finally {
      setDownloadingAll(false);
    }
  }, [disputeId, initiatingPartyName, respondingPartyName]);

  return (
    <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink">Evidence</h3>
        {files.length > 0 && (
          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1 text-xs text-text-muted hover:bg-stone hover:text-ink transition-colors disabled:opacity-50"
            aria-label="Download all evidence as zip"
          >
            {downloadingAll ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-text-muted border-t-transparent" />
            ) : (
              <IconDownload className="h-3.5 w-3.5" />
            )}
            {downloadingAll ? "Zipping\u2026" : "Download all"}
          </button>
        )}
      </div>

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
