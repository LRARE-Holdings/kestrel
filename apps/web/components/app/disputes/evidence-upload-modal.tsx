"use client";

import { useState, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { EvidenceUpload, type FileWithMeta } from "@/components/app/disputes/evidence-upload";
import { uploadEvidence } from "@/lib/disputes/actions";
import { IconUpload } from "@/components/ui/icons";

interface EvidenceUploadModalProps {
  open: boolean;
  onClose: () => void;
  disputeId: string;
  onUploaded: () => void;
}

export function EvidenceUploadModal({
  open,
  onClose,
  disputeId,
  onUploaded,
}: EvidenceUploadModalProps) {
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    for (const f of files) {
      formData.append("files", f.file);
      formData.append("descriptions", f.description);
    }

    const result = await uploadEvidence(disputeId, formData);

    if ("error" in result) {
      setError(result.error);
      setUploading(false);
      return;
    }

    setFiles([]);
    setUploading(false);
    onUploaded();
    onClose();
  }, [files, disputeId, onUploaded, onClose]);

  const handleClose = useCallback(() => {
    if (uploading) return;
    setFiles([]);
    setError(null);
    onClose();
  }, [uploading, onClose]);

  return (
    <Modal open={open} onClose={handleClose} title="Upload evidence">
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Upload documents, invoices, emails, or images that support your
          position. Files are shared with both parties.
        </p>

        <EvidenceUpload
          files={files}
          onFilesChange={setFiles}
          disabled={uploading}
        />

        {error && (
          <p className="text-sm text-error">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="gap-1.5"
          >
            {uploading ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Uploading...
              </>
            ) : (
              <>
                <IconUpload className="h-3.5 w-3.5" />
                Upload {files.length > 0 ? `${files.length} file${files.length !== 1 ? "s" : ""}` : ""}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
