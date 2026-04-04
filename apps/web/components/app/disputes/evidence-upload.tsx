"use client";

import { useRef, useCallback, useState } from "react";
import { IconUpload, IconFileText, IconX, IconPaperclip } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import {
  ALLOWED_EVIDENCE_TYPES,
  ALLOWED_EVIDENCE_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_EVIDENCE_FILES,
} from "@/lib/disputes/constants";

export interface FileWithMeta {
  file: File;
  description: string;
  id: string;
}

interface EvidenceUploadProps {
  files: FileWithMeta[];
  onFilesChange: (files: FileWithMeta[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function generateId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "PDF";
  if (ext === "docx") return "DOCX";
  if (ext === "xlsx") return "XLSX";
  if (ext === "png" || ext === "jpg" || ext === "jpeg") return "IMG";
  return "FILE";
}

export function EvidenceUpload({
  files,
  onFilesChange,
  maxFiles = MAX_EVIDENCE_FILES,
  disabled = false,
}: EvidenceUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndAddFiles = useCallback(
    (incoming: FileList | File[]) => {
      setError(null);
      const newFiles: FileWithMeta[] = [];

      for (const file of Array.from(incoming)) {
        // Check max files
        if (files.length + newFiles.length >= maxFiles) {
          setError(`Maximum ${maxFiles} files allowed`);
          break;
        }

        // Check file type
        const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
        if (
          !ALLOWED_EVIDENCE_TYPES.includes(file.type) &&
          !ALLOWED_EVIDENCE_EXTENSIONS.includes(ext)
        ) {
          setError(
            `"${file.name}" is not an allowed file type. Use PDF, DOCX, XLSX, PNG, or JPG.`
          );
          continue;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
          setError(
            `"${file.name}" exceeds the 25 MB limit (${formatFileSize(file.size)})`
          );
          continue;
        }

        newFiles.push({
          file,
          description: "",
          id: generateId(),
        });
      }

      if (newFiles.length > 0) {
        onFilesChange([...files, ...newFiles]);
      }
    },
    [files, maxFiles, onFilesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (disabled) return;
      if (e.dataTransfer.files.length > 0) {
        validateAndAddFiles(e.dataTransfer.files);
      }
    },
    [disabled, validateAndAddFiles]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setDragActive(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        validateAndAddFiles(e.target.files);
      }
      // Reset the input so the same file can be selected again
      e.target.value = "";
    },
    [validateAndAddFiles]
  );

  const removeFile = useCallback(
    (id: string) => {
      onFilesChange(files.filter((f) => f.id !== id));
    },
    [files, onFilesChange]
  );

  const updateDescription = useCallback(
    (id: string, description: string) => {
      onFilesChange(
        files.map((f) => (f.id === id ? { ...f, description } : f))
      );
    },
    [files, onFilesChange]
  );

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <button
        type="button"
        disabled={disabled || files.length >= maxFiles}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex w-full flex-col items-center gap-3 rounded-[var(--radius-lg)] border-2 border-dashed px-6 py-8 transition-colors ${
          disabled || files.length >= maxFiles
            ? "cursor-not-allowed border-border-subtle bg-stone/30 opacity-60"
            : dragActive
              ? "border-kestrel bg-kestrel/5"
              : "border-border-subtle bg-surface hover:border-border hover:bg-stone/20"
        }`}
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            dragActive ? "bg-kestrel/10 text-kestrel" : "bg-stone text-text-muted"
          }`}
        >
          <IconUpload className="h-5 w-5" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-ink">
            Drag files here or click to upload
          </p>
          <p className="mt-1 text-xs text-text-muted">
            PDF, DOCX, XLSX, PNG, JPG up to 25 MB each
          </p>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_EVIDENCE_EXTENSIONS.join(",")}
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {/* Error message */}
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((f) => {
            const typeLabel = getFileIcon(f.file.name);
            return (
              <div
                key={f.id}
                className="flex items-start gap-3 rounded-[var(--radius-md)] border border-border-subtle bg-surface p-3"
              >
                {/* File type icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-stone">
                  <span className="text-[10px] font-semibold text-text-secondary">
                    {typeLabel}
                  </span>
                </div>

                {/* File info */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {f.file.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatFileSize(f.file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(f.id)}
                      disabled={disabled}
                      className="shrink-0 rounded-[var(--radius-sm)] p-1 text-text-muted hover:bg-stone hover:text-error transition-colors"
                      aria-label={`Remove ${f.file.name}`}
                    >
                      <IconX className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Add a description (optional)"
                    value={f.description}
                    onChange={(e) => updateDescription(f.id, e.target.value)}
                    disabled={disabled}
                    className="w-full rounded-[var(--radius-sm)] border border-border-subtle bg-cream/50 px-2.5 py-1.5 text-xs text-ink placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-kestrel/40"
                  />
                </div>
              </div>
            );
          })}

          {/* Summary */}
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </span>
            <span>Total: {formatFileSize(totalSize)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
