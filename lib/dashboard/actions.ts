"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [
    { data: profile },
    { data: recentDocuments },
    { data: disputes },
    { count: documentCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single(),
    supabase
      .from("saved_documents")
      .select("id, title, document_type, created_at, updated_at")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("disputes")
      .select(
        "id, reference_number, subject, status, dispute_type, amount_disputed, currency, responding_party_email, response_deadline, created_at, updated_at"
      )
      .or(
        `initiating_party_id.eq.${user.id},responding_party_id.eq.${user.id}`
      )
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }),
    supabase
      .from("saved_documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("deleted_at", null),
  ]);

  return {
    profile,
    recentDocuments: recentDocuments ?? [],
    disputes: disputes ?? [],
    documentCount: documentCount ?? 0,
  };
}
