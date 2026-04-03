"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { IconChevronLeft, IconPaperclip } from "@/components/ui/icons";
import { DISPUTE_TYPE_LABELS } from "@/lib/disputes/constants";
import type { DisputeFilingData } from "@/lib/disputes/types";
import type { FileWithMeta } from "@/components/app/disputes/evidence-upload";

interface FilingStepReviewProps {
  data: Omit<DisputeFilingData, "includes_dispute_clause">;
  files: FileWithMeta[];
  onBack: () => void;
  onSubmit: (includesClause: boolean) => void;
  isSubmitting: boolean;
}

export function FilingStepReview({
  data,
  files,
  onBack,
  onSubmit,
  isSubmitting,
}: FilingStepReviewProps) {
  const [includesClause, setIncludesClause] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const truncatedDescription =
    data.description.length > 200
      ? data.description.slice(0, 200) + "..."
      : data.description;

  function handleSubmit() {
    if (!confirmed) return;
    onSubmit(includesClause);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl text-ink">Review and file</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Check the details below before filing your dispute.
        </p>
      </div>

      {/* Dispute details */}
      <Card>
        <CardContent className="space-y-3">
          <h3 className="text-sm font-medium text-ink">Dispute details</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Type</span>
              <Badge variant="sage">
                {DISPUTE_TYPE_LABELS[data.dispute_type] ?? data.dispute_type}
              </Badge>
            </div>
            <div>
              <span className="text-xs text-text-muted">Subject</span>
              <p className="text-sm text-ink">{data.subject}</p>
            </div>
            <div>
              <span className="text-xs text-text-muted">Description</span>
              <p className="text-sm text-ink whitespace-pre-wrap">
                {showFullDescription ? data.description : truncatedDescription}
              </p>
              {data.description.length > 200 && (
                <button
                  type="button"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-1 text-xs font-medium text-kestrel hover:text-kestrel-hover"
                >
                  {showFullDescription ? "Show less" : "Show more"}
                </button>
              )}
            </div>
            {data.amount_disputed != null && (
              <div>
                <span className="text-xs text-text-muted">Amount</span>
                <p className="text-sm font-medium text-ink">
                  {new Intl.NumberFormat("en-GB", {
                    style: "currency",
                    currency: "GBP",
                  }).format(data.amount_disputed)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Respondent */}
      <Card>
        <CardContent className="space-y-3">
          <h3 className="text-sm font-medium text-ink">Respondent</h3>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-text-muted">Name</span>
              <p className="text-sm text-ink">
                {data.responding_party_name}
              </p>
            </div>
            <div>
              <span className="text-xs text-text-muted">Email</span>
              <p className="text-sm text-ink">
                {data.responding_party_email}
              </p>
            </div>
            <div>
              <span className="text-xs text-text-muted">Business</span>
              <p className="text-sm text-ink">
                {data.responding_party_business}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidence */}
      <Card>
        <CardContent className="space-y-3">
          <h3 className="text-sm font-medium text-ink">Evidence</h3>
          {files.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs text-text-muted">
                {files.length} file{files.length !== 1 ? "s" : ""} attached
              </p>
              <ul className="space-y-1">
                {files.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center gap-2 text-sm text-ink"
                  >
                    <IconPaperclip className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                    <span className="truncate">{f.file.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-text-muted">No evidence uploaded</p>
          )}
        </CardContent>
      </Card>

      {/* Kestrel dispute clause */}
      <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-white p-4">
        <div className="flex items-start gap-3">
          <Toggle
            checked={includesClause}
            onChange={(e) => setIncludesClause(e.target.checked)}
          />
          <div>
            <p className="text-sm font-medium text-ink">
              Include Kestrel dispute resolution clause
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              Both parties agree to attempt resolution through Kestrel before
              pursuing external legal action. This is recommended and can be
              removed at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border text-kestrel focus:ring-kestrel/40"
        />
        <span className="text-sm text-text-secondary">
          I confirm that the information provided is accurate and that I am
          authorised to file this dispute on behalf of my business.
        </span>
      </label>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={isSubmitting}
          className="gap-1.5"
        >
          <IconChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!confirmed || isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Filing...
            </>
          ) : (
            "File dispute"
          )}
        </Button>
      </div>
    </div>
  );
}
