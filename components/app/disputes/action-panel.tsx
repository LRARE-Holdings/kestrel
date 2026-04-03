"use client";

import { Button } from "@/components/ui/button";
import {
  IconMessageSquare,
  IconUpload,
  IconSend,
  IconAlertTriangle,
  IconX,
} from "@/components/ui/icons";
import type { DisputeWithParties, UserRole } from "@/lib/disputes/types";

interface ActionPanelProps {
  dispute: DisputeWithParties;
  userRole: UserRole;
  onAction: (action: string) => void;
}

export function ActionPanel({
  dispute,
  userRole,
  onAction,
}: ActionPanelProps) {
  const status = dispute.status;
  const activeStatuses = ["filed", "awaiting_response", "in_progress"];
  const isActive = activeStatuses.includes(status);

  const actions: {
    key: string;
    label: string;
    icon: typeof IconMessageSquare;
    variant: "primary" | "secondary" | "ghost" | "destructive";
    show: boolean;
  }[] = [
    {
      key: "respond",
      label: "Respond",
      icon: IconSend,
      variant: "primary",
      show:
        userRole === "responding" &&
        (status === "filed" || status === "awaiting_response"),
    },
    {
      key: "reply",
      label: "Reply",
      icon: IconMessageSquare,
      variant: "secondary",
      show: status === "in_progress",
    },
    {
      key: "upload_evidence",
      label: "Upload evidence",
      icon: IconUpload,
      variant: "secondary",
      show: isActive,
    },
    {
      key: "propose_settlement",
      label: "Propose settlement",
      icon: IconSend,
      variant: "secondary",
      show: status === "in_progress",
    },
    {
      key: "escalate",
      label: "Escalate",
      icon: IconAlertTriangle,
      variant: "ghost",
      show: status === "in_progress",
    },
    {
      key: "withdraw",
      label: "Withdraw dispute",
      icon: IconX,
      variant: "ghost",
      show: userRole === "initiating" && isActive,
    },
  ];

  const visibleActions = actions.filter((a) => a.show);

  if (visibleActions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {visibleActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.key}
            type="button"
            variant={
              action.key === "withdraw"
                ? "ghost"
                : action.variant
            }
            size="sm"
            onClick={() => onAction(action.key)}
            className={`gap-1.5 ${
              action.key === "withdraw"
                ? "text-error hover:bg-error/5 hover:text-error"
                : ""
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
