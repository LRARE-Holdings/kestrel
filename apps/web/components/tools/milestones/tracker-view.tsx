"use client";

import { useState } from "react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ── Types ────────────────────────────────────────────────────────────────────

interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  responsible_party: string;
  due_date: string;
  payment_amount: number | null;
  status: string;
  deliverables: string[] | null;
  completed_at: string | null;
  disputed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  access_token: string;
  name: string;
  description: string | null;
  status: string;
  party_a_name: string;
  party_a_email: string;
  party_a_business: string;
  party_b_name: string;
  party_b_email: string;
  party_b_business: string;
  start_date: string;
  expected_end_date: string | null;
  includes_dispute_clause: boolean;
  milestones: Milestone[];
  created_at: string;
  updated_at: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const KESTREL_DISPUTE_CLAUSE =
  "If a milestone is disputed, both parties agree to attempt resolution through Kestrel's online dispute resolution platform (kestrel.law) before commencing formal legal proceedings. This is a voluntary, non-binding process designed to facilitate a fair and efficient resolution.";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

function isOverdue(dueDate: string, status: string): boolean {
  if (status === "completed") return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

type StatusKey = "pending" | "in_progress" | "completed" | "disputed" | "overdue";

const STATUS_CONFIG: Record<
  StatusKey,
  { label: string; variant: BadgeVariant; bgClass: string }
> = {
  pending: {
    label: "Pending",
    variant: "outline",
    bgClass: "border-border-subtle",
  },
  in_progress: {
    label: "In Progress",
    variant: "default",
    bgClass: "border-kestrel/30",
  },
  completed: {
    label: "Completed",
    variant: "sage",
    bgClass: "border-sage/30",
  },
  disputed: {
    label: "Disputed",
    variant: "destructive",
    bgClass: "border-error/30",
  },
  overdue: {
    label: "Overdue",
    variant: "warm",
    bgClass: "border-warning/30",
  },
};

const PROJECT_STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  active: { label: "Active", variant: "default" },
  completed: { label: "Completed", variant: "sage" },
  on_hold: { label: "On Hold", variant: "warm" },
  disputed: { label: "Disputed", variant: "destructive" },
};

function getMilestoneStatus(milestone: Milestone): StatusKey {
  if (milestone.status === "completed") return "completed";
  if (milestone.status === "disputed") return "disputed";
  if (isOverdue(milestone.due_date, milestone.status)) return "overdue";
  if (milestone.status === "in_progress") return "in_progress";
  return "pending";
}

// ── Component ────────────────────────────────────────────────────────────────

export function TrackerView({
  project: initialProject,
}: {
  project: Project;
}) {
  const [project, setProject] = useState(initialProject);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const completedCount = project.milestones.filter(
    (m) => m.status === "completed",
  ).length;
  const totalCount = project.milestones.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const totalPayment = project.milestones.reduce(
    (sum, m) => sum + (m.payment_amount ?? 0),
    0,
  );
  const completedPayment = project.milestones
    .filter((m) => m.status === "completed")
    .reduce((sum, m) => sum + (m.payment_amount ?? 0), 0);

  const projectStatusInfo =
    PROJECT_STATUS_BADGE[project.status] ?? PROJECT_STATUS_BADGE.active;

  async function updateMilestoneStatus(
    milestoneId: string,
    status: string,
  ) {
    setUpdatingId(milestoneId);

    try {
      const response = await fetch(
        `/api/milestones/${project.access_token}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ milestoneId, status }),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update milestone");
      }

      // Update local state
      setProject((prev) => ({
        ...prev,
        milestones: prev.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          return {
            ...m,
            status,
            completed_at:
              status === "completed" ? new Date().toISOString() : null,
            disputed_at:
              status === "disputed" ? new Date().toISOString() : null,
          };
        }),
      }));
    } catch (err) {
      console.error("Milestone update failed:", err);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Project header */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl text-ink sm:text-3xl">
                {project.name}
              </h1>
              <Badge variant={projectStatusInfo.variant}>
                {projectStatusInfo.label}
              </Badge>
            </div>
            {project.description && (
              <p className="mt-2 text-sm text-text-secondary">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Parties and dates */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[var(--radius-md)] bg-white border border-border-subtle p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Party A
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              {project.party_a_name}
            </p>
            <p className="text-xs text-text-secondary">
              {project.party_a_business}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-white border border-border-subtle p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Party B
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              {project.party_b_name}
            </p>
            <p className="text-xs text-text-secondary">
              {project.party_b_business}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-white border border-border-subtle p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Start Date
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              {formatDate(project.start_date)}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-white border border-border-subtle p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Expected End
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              {project.expected_end_date
                ? formatDate(project.expected_end_date)
                : "Not set"}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-ink">
              Progress: {completedCount} of {totalCount} milestones completed
            </p>
            <p className="text-sm font-medium text-kestrel">
              {progressPercent}%
            </p>
          </div>
          <div className="h-2.5 w-full rounded-full bg-stone">
            <div
              className="h-2.5 rounded-full bg-kestrel transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {totalPayment > 0 && (
            <p className="mt-2 text-xs text-text-muted">
              {formatCurrency(completedPayment)} of{" "}
              {formatCurrency(totalPayment)} released
            </p>
          )}
        </CardContent>
      </Card>

      {/* Milestones */}
      <div className="space-y-4">
        <h2 className="font-display text-xl text-ink">Milestones</h2>

        {project.milestones.map((milestone) => {
          const displayStatus = getMilestoneStatus(milestone);
          const config = STATUS_CONFIG[displayStatus];
          const updating = updatingId === milestone.id;

          return (
            <Card
              key={milestone.id}
              className={`transition-colors ${config.bgClass}`}
            >
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-ink">
                        {milestone.title}
                      </h3>
                      <Badge variant={config.variant}>{config.label}</Badge>
                      {displayStatus === "overdue" && (
                        <Badge variant="warm">Overdue</Badge>
                      )}
                    </div>
                    {milestone.description && (
                      <p className="mt-1 text-sm text-text-secondary">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Metadata row */}
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <div>
                    <span className="text-text-muted">Responsible:</span>{" "}
                    <span className="font-medium text-ink">
                      {milestone.responsible_party === "party_a"
                        ? project.party_a_name
                        : project.party_b_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Due:</span>{" "}
                    <span
                      className={`font-medium ${
                        displayStatus === "overdue"
                          ? "text-warning"
                          : "text-ink"
                      }`}
                    >
                      {formatDate(milestone.due_date)}
                    </span>
                  </div>
                  {milestone.payment_amount != null && (
                    <div>
                      <span className="text-text-muted">Payment:</span>{" "}
                      <span className="font-medium text-ink">
                        {formatCurrency(milestone.payment_amount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Deliverables */}
                {milestone.deliverables &&
                  Array.isArray(milestone.deliverables) &&
                  milestone.deliverables.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-1">
                        Deliverables
                      </p>
                      <ul className="space-y-0.5">
                        {milestone.deliverables.map((d, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm text-text-secondary"
                          >
                            <svg
                              className={`h-3.5 w-3.5 flex-shrink-0 ${
                                milestone.status === "completed"
                                  ? "text-sage"
                                  : "text-border"
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Completed/disputed timestamps */}
                {milestone.completed_at && (
                  <p className="mt-2 text-xs text-sage">
                    Completed on {formatDate(milestone.completed_at)}
                  </p>
                )}
                {milestone.disputed_at && (
                  <p className="mt-2 text-xs text-error">
                    Disputed on {formatDate(milestone.disputed_at)}
                  </p>
                )}

                {/* Action buttons */}
                {milestone.status !== "completed" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {milestone.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateMilestoneStatus(
                            milestone.id,
                            "in_progress",
                          )
                        }
                        disabled={updating}
                      >
                        {updating ? "Updating..." : "Mark In Progress"}
                      </Button>
                    )}
                    {(milestone.status === "pending" ||
                      milestone.status === "in_progress") && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          updateMilestoneStatus(
                            milestone.id,
                            "completed",
                          )
                        }
                        disabled={updating}
                      >
                        {updating ? "Updating..." : "Mark Complete"}
                      </Button>
                    )}
                    {milestone.status !== "disputed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-error hover:bg-error/5"
                        onClick={() =>
                          updateMilestoneStatus(
                            milestone.id,
                            "disputed",
                          )
                        }
                        disabled={updating}
                      >
                        {updating ? "Updating..." : "Raise Dispute"}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kestrel dispute clause */}
      {project.includes_dispute_clause && (
        <Card className="border-kestrel/20">
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-kestrel">
              Dispute Resolution Clause
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {KESTREL_DISPUTE_CLAUSE}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <p className="text-xs text-text-muted">
        This milestone tracker was created using Kestrel (kestrel.law). It is a
        shared record of project milestones and does not constitute a binding
        agreement unless incorporated into a contract. This tool does not
        provide legal advice.
      </p>
    </div>
  );
}
