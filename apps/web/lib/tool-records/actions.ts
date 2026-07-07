"use server";

import { createClient } from "@kestrel/shared/supabase/server";

/**
 * Records created through the free tools (handshakes, notices, milestone
 * projects) are surfaced here for a signed-in creator so they can find them
 * again without the share link.
 *
 * Access relies on the `created_by` column + creator RLS policy added by
 * migration `20260707120000_add_created_by_to_tool_tables.sql`. Until that
 * migration is applied the queries either error (missing column) or return no
 * rows (RLS) — both are handled by returning an empty list, so the UI degrades
 * to "nothing to show" rather than crashing.
 */

export interface HandshakeRecord {
  id: string;
  title: string;
  status: string;
  counterpartyName: string;
  counterpartyBusiness: string;
  shareUrl: string;
  createdAt: string;
  includesDisputeClause: boolean;
}

export interface NoticeRecord {
  id: string;
  subject: string;
  noticeType: string;
  status: string;
  recipientName: string;
  recipientBusiness: string;
  shareUrl: string;
  createdAt: string;
  includesDisputeClause: boolean;
}

export interface ProjectRecord {
  id: string;
  name: string;
  status: string;
  counterpartyName: string;
  counterpartyBusiness: string;
  shareUrl: string;
  createdAt: string;
  includesDisputeClause: boolean;
}

export interface UserToolRecords {
  handshakes: HandshakeRecord[];
  notices: NoticeRecord[];
  projects: ProjectRecord[];
}

const EMPTY: UserToolRecords = { handshakes: [], notices: [], projects: [] };

export async function getUserToolRecords(): Promise<UserToolRecords> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return EMPTY;

  const [handshakes, notices, projects] = await Promise.all([
    queryHandshakes(supabase, user.id),
    queryNotices(supabase, user.id),
    queryProjects(supabase, user.id),
  ]);

  return { handshakes, notices, projects };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function queryHandshakes(supabase: any, userId: string): Promise<HandshakeRecord[]> {
  try {
    const { data, error } = await supabase
      .from("handshakes")
      .select(
        "id, title, status, party_b_name, party_b_business, access_token, created_at, includes_dispute_clause",
      )
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      counterpartyName: row.party_b_name ?? "",
      counterpartyBusiness: row.party_b_business ?? "",
      shareUrl: `/tools/handshake/${row.access_token}`,
      createdAt: row.created_at,
      includesDisputeClause: !!row.includes_dispute_clause,
    }));
  } catch {
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function queryNotices(supabase: any, userId: string): Promise<NoticeRecord[]> {
  try {
    const { data, error } = await supabase
      .from("notices")
      .select(
        "id, subject, notice_type, status, recipient_name, recipient_business, access_token, created_at, includes_dispute_clause",
      )
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map((row) => ({
      id: row.id,
      subject: row.subject,
      noticeType: row.notice_type,
      status: row.status,
      recipientName: row.recipient_name ?? "",
      recipientBusiness: row.recipient_business ?? "",
      shareUrl: `/tools/notice-log/${row.access_token}`,
      createdAt: row.created_at,
      includesDisputeClause: !!row.includes_dispute_clause,
    }));
  } catch {
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function queryProjects(supabase: any, userId: string): Promise<ProjectRecord[]> {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, name, status, party_b_name, party_b_business, access_token, created_at, includes_dispute_clause",
      )
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      counterpartyName: row.party_b_name ?? "",
      counterpartyBusiness: row.party_b_business ?? "",
      shareUrl: `/tools/milestones/${row.access_token}`,
      createdAt: row.created_at,
      includesDisputeClause: !!row.includes_dispute_clause,
    }));
  } catch {
    return [];
  }
}
