"use server";

import { createClient } from "@kestrel/shared/supabase/server";
import { getAdminUser } from "@/lib/auth/actions";
import {
  createLeadSchema,
  updateLeadSchema,
  createInteractionSchema,
} from "./schemas";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createLead(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    company: formData.get("company") as string,
    phone: formData.get("phone") as string,
    source: formData.get("source") as string,
    notes: formData.get("notes") as string,
    stage: formData.get("stage") as string,
    next_action_date: formData.get("next_action_date") as string,
  };

  const parsed = createLeadSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return { error: firstError?.message ?? "Validation failed" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .insert({
      name: parsed.data.name,
      email: parsed.data.email || null,
      company: parsed.data.company || null,
      phone: parsed.data.phone || null,
      source: parsed.data.source || null,
      notes: parsed.data.notes || null,
      stage: parsed.data.stage,
      next_action_date: parsed.data.next_action_date || null,
      created_by: admin.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  redirect(`/leads/${data.id}`);
}

export async function updateLead(
  leadId: string,
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && value !== "") {
      raw[key] = value;
    }
  }

  const parsed = updateLeadSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return { error: firstError?.message ?? "Validation failed" };
  }

  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.email !== undefined)
    updateData.email = parsed.data.email || null;
  if (parsed.data.company !== undefined)
    updateData.company = parsed.data.company || null;
  if (parsed.data.phone !== undefined)
    updateData.phone = parsed.data.phone || null;
  if (parsed.data.source !== undefined)
    updateData.source = parsed.data.source || null;
  if (parsed.data.notes !== undefined)
    updateData.notes = parsed.data.notes || null;
  if (parsed.data.stage !== undefined) updateData.stage = parsed.data.stage;
  if (parsed.data.next_action_date !== undefined)
    updateData.next_action_date = parsed.data.next_action_date || null;

  const { error } = await supabase
    .from("leads")
    .update(updateData)
    .eq("id", leadId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/leads/${leadId}`);
  return { success: true };
}

export async function updateLeadStage(
  leadId: string,
  stage: string,
): Promise<{ error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ stage })
    .eq("id", leadId);

  if (error) return { error: error.message };

  revalidatePath("/leads");
  return {};
}

export async function archiveLead(
  leadId: string,
): Promise<{ error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status: "archived" })
    .eq("id", leadId);

  if (error) return { error: error.message };

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  return {};
}

export async function addInteraction(
  leadId: string,
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const raw = {
    type: formData.get("type") as string,
    content: formData.get("content") as string,
  };

  const parsed = createInteractionSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return { error: firstError?.message ?? "Validation failed" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("lead_interactions").insert({
    lead_id: leadId,
    type: parsed.data.type,
    content: parsed.data.content,
    created_by: admin.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/leads/${leadId}`);
  return { success: true };
}
