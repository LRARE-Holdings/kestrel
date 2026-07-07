"use server";

import { createClient } from "@kestrel/shared/supabase/server";
import type { Database } from "@kestrel/shared/supabase/types";

type DocumentType = Database["public"]["Enums"]["document_type"];

export async function saveDocument(data: {
  document_type: DocumentType;
  title: string;
  configuration: Record<string, unknown>;
  clause_versions?: Record<string, unknown>;
  includes_dispute_clause: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to save documents" };
  }

  const { data: doc, error } = await supabase
    .from("saved_documents")
    .insert({
      user_id: user.id,
      document_type: data.document_type,
      title: data.title,
      configuration: data.configuration,
      clause_versions: data.clause_versions ?? {},
      includes_dispute_clause: data.includes_dispute_clause,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { id: doc.id };
}

export async function getDocuments() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("saved_documents")
    .select("id, title, document_type, includes_dispute_clause, created_at, updated_at")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  return data ?? [];
}

/**
 * Fetch a single saved document (including its full `configuration` blob) for
 * the current user. RLS also scopes to the owner, but we filter by user_id
 * explicitly for clarity. Returns null if not found or not owned.
 */
export async function getDocument(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("saved_documents")
    .select(
      "id, title, document_type, configuration, clause_versions, includes_dispute_clause, created_at, updated_at",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
