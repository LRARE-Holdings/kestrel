import { createServiceClient } from "@kestrel/shared/supabase/service";

export interface DisputeListItem {
  id: string;
  reference_number: string;
  dispute_type: string;
  status: string;
  subject: string;
  amount_disputed: number | null;
  currency: string | null;
  response_deadline: string | null;
  created_at: string | null;
  escalated_at: string | null;
  resolved_at: string | null;
  initiating_party: {
    display_name: string;
    email: string;
  } | null;
  responding_party_email: string;
}

export async function listDisputes({
  status,
  type,
  page = 1,
  pageSize = 20,
}: {
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = createServiceClient();

  let query = supabase
    .from("disputes")
    .select(
      `
      id, reference_number, dispute_type, status, subject,
      amount_disputed, currency, response_deadline,
      created_at, escalated_at, resolved_at,
      initiating_party:profiles!disputes_initiating_party_id_fkey(display_name, email),
      responding_party_email
    `,
      { count: "exact" },
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (type) query = query.eq("dispute_type", type);

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, count, error } = await query;

  return { data: (data ?? []) as DisputeListItem[], total: count ?? 0, error };
}

export interface DisputeDetail {
  id: string;
  reference_number: string;
  dispute_type: string;
  status: string;
  subject: string;
  description: string | null;
  amount_disputed: number | null;
  currency: string | null;
  response_deadline: string | null;
  includes_dispute_clause: boolean;
  created_at: string | null;
  updated_at: string | null;
  escalated_at: string | null;
  resolved_at: string | null;
  initiating_party: {
    id: string;
    display_name: string;
    email: string;
    business_name: string | null;
  } | null;
  responding_party_email: string;
  responding_party_id: string | null;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  actor: { display_name: string } | null;
}

export async function getDisputeOverview(disputeId: string) {
  const supabase = createServiceClient();

  // Fetch dispute metadata (NOT submissions or evidence content)
  const { data: dispute } = await supabase
    .from("disputes")
    .select(
      `
      id, reference_number, dispute_type, status, subject, description,
      amount_disputed, currency, response_deadline, includes_dispute_clause,
      created_at, updated_at, escalated_at, resolved_at,
      initiating_party:profiles!disputes_initiating_party_id_fkey(id, display_name, email, business_name),
      responding_party_email, responding_party_id
    `,
    )
    .eq("id", disputeId)
    .single();

  // Fetch responding party profile if they have one
  let respondingParty: {
    id: string;
    display_name: string;
    email: string;
    business_name: string | null;
  } | null = null;

  if (dispute?.responding_party_id) {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, email, business_name")
      .eq("id", dispute.responding_party_id)
      .single();
    respondingParty = data;
  }

  // Count submissions and evidence (counts only, not content)
  const { count: submissionCount } = await supabase
    .from("dispute_submissions")
    .select("*", { count: "exact", head: true })
    .eq("dispute_id", disputeId);

  const { count: evidenceCount } = await supabase
    .from("evidence_files")
    .select("*", { count: "exact", head: true })
    .eq("dispute_id", disputeId);

  // Fetch audit log entries for this dispute
  const { data: auditLog } = await supabase
    .from("audit_log")
    .select(
      "id, action, resource_type, metadata, created_at, actor:profiles!audit_log_actor_id_fkey(display_name)",
    )
    .eq("resource_type", "dispute")
    .eq("resource_id", disputeId)
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    dispute: dispute as DisputeDetail | null,
    respondingParty,
    submissionCount: submissionCount ?? 0,
    evidenceCount: evidenceCount ?? 0,
    auditLog: (auditLog ?? []) as AuditLogEntry[],
  };
}

export async function escalateDispute(disputeId: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("disputes")
    .update({
      status: "escalated",
      escalated_at: new Date().toISOString(),
    })
    .eq("id", disputeId);
  return { error };
}
