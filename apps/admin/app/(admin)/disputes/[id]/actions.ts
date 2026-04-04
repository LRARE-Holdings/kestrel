"use server";

import { escalateDispute } from "@/lib/admin/dispute-queries";
import { revalidatePath } from "next/cache";

export async function escalateDisputeAction(disputeId: string) {
  const { error } = await escalateDispute(disputeId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/disputes/${disputeId}`);
  return { error: null };
}
