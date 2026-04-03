"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconScale, IconPlus, IconX } from "@/components/ui/icons";
import { DisputeCard } from "@/components/app/disputes/dispute-card";
import {
  DisputeListFilters,
  type DisputeFilters,
} from "@/components/app/disputes/dispute-list-filters";
import type { Dispute } from "@/lib/disputes/types";

interface DisputeListProps {
  disputes: Dispute[];
  currentUserId: string;
}

export function DisputeList({ disputes, currentUserId }: DisputeListProps) {
  const [filters, setFilters] = useState<DisputeFilters>({
    status: "all",
    type: "all",
    sort: "newest",
  });

  const handleFilterChange = useCallback((next: DisputeFilters) => {
    setFilters(next);
  }, []);

  const filteredDisputes = useMemo(() => {
    let result = [...disputes];

    // Filter by status
    if (filters.status !== "all") {
      result = result.filter((d) => d.status === filters.status);
    }

    // Filter by type
    if (filters.type !== "all") {
      result = result.filter((d) => d.dispute_type === filters.type);
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sort) {
        case "newest":
          return (
            new Date(b.updated_at ?? b.created_at ?? 0).getTime() -
            new Date(a.updated_at ?? a.created_at ?? 0).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at ?? 0).getTime() -
            new Date(b.created_at ?? 0).getTime()
          );
        case "deadline": {
          const deadA = a.response_deadline
            ? new Date(a.response_deadline).getTime()
            : Infinity;
          const deadB = b.response_deadline
            ? new Date(b.response_deadline).getTime()
            : Infinity;
          return deadA - deadB;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [disputes, filters]);

  const hasActiveFilters =
    filters.status !== "all" || filters.type !== "all";

  // Empty state: no disputes at all
  if (disputes.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-ink">Disputes</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Structured resolution for business disagreements.
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-kestrel/8">
            <IconScale className="h-8 w-8 text-kestrel" />
          </div>
          <h2 className="mt-6 font-display text-xl text-ink">
            No disputes yet
          </h2>
          <p className="mt-2 max-w-md text-sm text-text-secondary">
            When a disagreement arises, Kestrel will guide both parties through
            a structured process — documented timelines, evidence uploads, and
            clear escalation paths.
          </p>
          <Link href="/disputes/new" className="mt-6">
            <Button className="gap-2">
              <IconPlus className="h-4 w-4" />
              File a dispute
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Disputes</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Structured resolution for business disagreements.
          </p>
        </div>
        <Link href="/disputes/new">
          <Button className="gap-2">
            <IconPlus className="h-4 w-4" />
            File a dispute
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-6">
        <DisputeListFilters onFilterChange={handleFilterChange} />
      </div>

      {/* List */}
      {filteredDisputes.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {filteredDisputes.map((dispute) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : (
        // Empty state when filters match nothing
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone">
            <IconScale className="h-6 w-6 text-text-muted" />
          </div>
          <h2 className="mt-4 font-display text-lg text-ink">
            No disputes match your filters
          </h2>
          <p className="mt-1 max-w-sm text-sm text-text-muted">
            Try adjusting the status or type filters to find what you are looking
            for.
          </p>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                handleFilterChange({
                  status: "all",
                  type: "all",
                  sort: "newest",
                })
              }
              className="mt-4 gap-1.5 text-text-muted"
            >
              <IconX className="h-3.5 w-3.5" />
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
