"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AiAssessment } from "@/lib/leads/types";
import { formatRelativeDate } from "@kestrel/shared/dates/format";

const PLAN_STYLES: Record<string, { bg: string; text: string; label: string }> =
  {
    free: { bg: "bg-stone", text: "text-text-secondary", label: "Free" },
    professional: {
      bg: "bg-kestrel/10",
      text: "text-kestrel",
      label: "Professional",
    },
    business: { bg: "bg-sage/15", text: "text-kestrel", label: "Business" },
  };

const CONFIDENCE_STYLES: Record<string, { color: string; label: string }> = {
  high: { color: "text-sage", label: "High" },
  medium: { color: "text-warning", label: "Medium" },
  low: { color: "text-text-muted", label: "Low" },
};

export function AiAssessmentCard({
  leadId,
  assessment,
  assessedAt,
}: {
  leadId: string;
  assessment: AiAssessment | null;
  assessedAt: string | null;
}) {
  const router = useRouter();
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRescore() {
    setScoring(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads/${leadId}/score`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Scoring failed");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setScoring(false);
    }
  }

  const plan = assessment
    ? PLAN_STYLES[assessment.recommended_plan] ?? PLAN_STYLES.free
    : null;
  const confidence = assessment
    ? CONFIDENCE_STYLES[assessment.confidence] ?? CONFIDENCE_STYLES.low
    : null;

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
          AI plan recommendation
        </h2>
        <button
          onClick={handleRescore}
          disabled={scoring}
          className="text-xs text-kestrel hover:text-kestrel-hover transition-colors disabled:opacity-50"
        >
          {scoring ? "Scoring..." : assessment ? "Re-score" : "Score now"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-error mb-3">{error}</p>
      )}

      {!assessment ? (
        <p className="text-sm text-text-muted">
          No AI assessment yet. Click &ldquo;Score now&rdquo; to generate one.
        </p>
      ) : (
        <div className="space-y-4">
          {/* Plan badge + confidence */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${plan!.bg} ${plan!.text}`}
            >
              {plan!.label}
            </span>
            <span className={`text-xs ${confidence!.color}`}>
              {confidence!.label} confidence
            </span>
          </div>

          {/* Reasoning */}
          <p className="text-sm text-ink leading-relaxed">
            {assessment.reasoning}
          </p>

          {/* Key signals */}
          {assessment.key_signals.length > 0 && (
            <div>
              <p className="text-xs text-text-muted mb-1.5">Key signals</p>
              <ul className="space-y-1">
                {assessment.key_signals.map((signal, i) => (
                  <li
                    key={i}
                    className="text-xs text-text-secondary flex items-start gap-1.5"
                  >
                    <span className="text-sage mt-0.5 shrink-0">&#8226;</span>
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Talking points */}
          {assessment.talking_points.length > 0 && (
            <div>
              <p className="text-xs text-text-muted mb-1.5">Talking points</p>
              <ul className="space-y-1">
                {assessment.talking_points.map((point, i) => (
                  <li
                    key={i}
                    className="text-xs text-text-secondary flex items-start gap-1.5"
                  >
                    <span className="text-kestrel mt-0.5 shrink-0">&#8250;</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Enrichment data */}
          {(assessment.enrichment.website_found ||
            assessment.enrichment.companies_house_found) && (
            <div className="border-t border-border-subtle pt-3">
              <p className="text-xs text-text-muted mb-1.5">Enrichment</p>
              <div className="space-y-1">
                {assessment.enrichment.website_found &&
                  assessment.enrichment.website_summary && (
                    <p className="text-xs text-text-secondary">
                      <span className="text-text-muted">Website:</span>{" "}
                      {assessment.enrichment.website_summary}
                    </p>
                  )}
                {assessment.enrichment.companies_house_found && (
                  <p className="text-xs text-text-secondary">
                    <span className="text-text-muted">Companies House:</span>{" "}
                    {assessment.enrichment.company_type}
                    {assessment.enrichment.incorporation_date &&
                      `, est. ${assessment.enrichment.incorporation_date}`}
                  </p>
                )}
                {assessment.enrichment.estimated_size && (
                  <p className="text-xs text-text-secondary">
                    <span className="text-text-muted">Estimated size:</span>{" "}
                    {assessment.enrichment.estimated_size.charAt(0).toUpperCase() +
                      assessment.enrichment.estimated_size.slice(1)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Assessed timestamp */}
          {assessedAt && (
            <p className="text-xs text-text-muted pt-1">
              Assessed {formatRelativeDate(assessedAt)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
