"use client";

import { useState } from "react";
import { EvidenceUpload, type FileWithMeta } from "@/components/app/disputes/evidence-upload";
import { Button } from "@/components/ui/button";
import { IconArrowRight, IconChevronLeft } from "@/components/ui/icons";

interface FilingStepEvidenceProps {
  onNext: (files: FileWithMeta[]) => void;
  onBack: () => void;
  initialFiles?: FileWithMeta[];
}

export function FilingStepEvidence({
  onNext,
  onBack,
  initialFiles = [],
}: FilingStepEvidenceProps) {
  const [files, setFiles] = useState<FileWithMeta[]>(initialFiles);

  function handleContinue() {
    onNext(files);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl text-ink">Supporting evidence</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Upload any documents, invoices, emails, or images that support your
          claim. This step is optional — you can upload evidence later.
        </p>
      </div>

      <EvidenceUpload files={files} onFilesChange={setFiles} />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          className="gap-1.5"
        >
          <IconChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button type="button" onClick={handleContinue} className="gap-2">
          Continue
          <IconArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
