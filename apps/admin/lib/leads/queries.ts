import { createClient } from "@kestrel/shared/supabase/server";
import type { LeadStage } from "./schemas";

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  source: string | null;
  notes: string | null;
  stage: string;
  status: string;
  next_action_date: string | null;
  score: number | null;
  last_scored_at: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface LeadInteraction {
  id: string;
  lead_id: string;
  type: string;
  content: string;
  created_by: string;
  created_at: string;
}

export async function listLeads({
  search,
  stage,
  status,
  page = 1,
  pageSize = 20,
}: {
  search?: string;
  stage?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (stage) query = query.eq("stage", stage);
  if (status) query = query.eq("status", status);
  else query = query.eq("status", "active"); // Default to active

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`,
    );
  }

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, count, error } = await query;

  return {
    data: (data ?? []) as Lead[],
    total: count ?? 0,
    error,
  };
}

export async function getLeadsByStage(): Promise<
  Record<LeadStage, Lead[]>
> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("leads")
    .select("*")
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  const leads = (data ?? []) as Lead[];

  const grouped: Record<string, Lead[]> = {
    lead: [],
    contacted: [],
    qualified: [],
    proposal: [],
    won: [],
    lost: [],
  };

  for (const lead of leads) {
    const stage = lead.stage as LeadStage;
    if (grouped[stage]) {
      grouped[stage].push(lead);
    } else {
      grouped.lead.push(lead);
    }
  }

  return grouped as Record<LeadStage, Lead[]>;
}

export async function getLeadDetail(leadId: string) {
  const supabase = await createClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();

  const { data: interactions } = await supabase
    .from("lead_interactions")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  return {
    lead: lead as Lead | null,
    interactions: (interactions ?? []) as LeadInteraction[],
    error: leadError,
  };
}

export async function getOverdueFollowUps() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("status", "active")
    .lte("next_action_date", today)
    .order("next_action_date", { ascending: true });

  return {
    data: (data ?? []) as Lead[],
    error,
  };
}
