import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@kestrel/shared/supabase/service";
import { getAdminUser } from "@/lib/auth/actions";

/**
 * POST /api/leads/[id]/score
 *
 * Manually triggers AI plan-fit scoring for a specific lead.
 * Calls the score-lead Edge Function with the lead's current data.
 * Admin-only.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServiceClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // Call the Edge Function with the same payload shape as the database webhook
  const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/score-lead`;
  const response = await fetch(edgeFunctionUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "INSERT",
      table: "leads",
      record: lead,
      schema: "public",
      old_record: null,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json(
      { error: "AI scoring failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
