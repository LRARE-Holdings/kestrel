"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

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
