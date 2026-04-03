"use client";

import { useState, useCallback } from "react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { IconX } from "@/components/ui/icons";
import { STATUS_LABELS, DISPUTE_TYPE_LABELS } from "@/lib/disputes/constants";

export interface DisputeFilters {
  status: string;
  type: string;
  sort: "newest" | "oldest" | "deadline";
}

interface DisputeListFiltersProps {
  onFilterChange: (filters: DisputeFilters) => void;
}

const defaultFilters: DisputeFilters = {
  status: "all",
  type: "all",
  sort: "newest",
};

export function DisputeListFilters({
  onFilterChange,
}: DisputeListFiltersProps) {
  const [filters, setFilters] = useState<DisputeFilters>(defaultFilters);

  const updateFilter = useCallback(
    (key: keyof DisputeFilters, value: string) => {
      const next = { ...filters, [key]: value };
      setFilters(next);
      onFilterChange(next);
    },
    [filters, onFilterChange]
  );

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  }, [onFilterChange]);

  const hasActiveFilters =
    filters.status !== "all" || filters.type !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.status}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="w-auto min-w-[160px]"
      >
        <option value="all">All statuses</option>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        value={filters.type}
        onChange={(e) => updateFilter("type", e.target.value)}
        className="w-auto min-w-[160px]"
      >
        <option value="all">All types</option>
        {Object.entries(DISPUTE_TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        value={filters.sort}
        onChange={(e) =>
          updateFilter("sort", e.target.value as DisputeFilters["sort"])
        }
        className="w-auto min-w-[160px]"
      >
        <option value="newest">Most recent</option>
        <option value="oldest">Oldest first</option>
        <option value="deadline">Deadline soonest</option>
      </Select>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-1.5 text-text-muted"
        >
          <IconX className="h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
