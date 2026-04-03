"use client";

import { useEffect, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

interface RealtimeProviderProps {
  disputeId: string;
  onNewSubmission: () => void;
  onNewEvidence: () => void;
  onDisputeUpdate: () => void;
  children: ReactNode;
}

export function RealtimeProvider({
  disputeId,
  onNewSubmission,
  onNewEvidence,
  onDisputeUpdate,
  children,
}: RealtimeProviderProps) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`dispute-${disputeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dispute_submissions",
          filter: `dispute_id=eq.${disputeId}`,
        },
        () => {
          onNewSubmission();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "evidence_files",
          filter: `dispute_id=eq.${disputeId}`,
        },
        () => {
          onNewEvidence();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "disputes",
          filter: `id=eq.${disputeId}`,
        },
        () => {
          onDisputeUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [disputeId, onNewSubmission, onNewEvidence, onDisputeUpdate]);

  return <>{children}</>;
}
