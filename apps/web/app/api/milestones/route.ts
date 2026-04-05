import { NextResponse } from "next/server";
import { createServiceClient } from "@kestrel/shared/supabase/service";
import { createProjectSchema } from "@/lib/milestones/schemas";
import { publicRateLimit, applyRateLimit } from "@/lib/security/rate-limit";
import { validateOrigin } from "@/lib/security/csrf";

export async function POST(request: Request) {
  try {
    const originError = validateOrigin(request);
    if (originError) return originError;

    const rateLimitError = await applyRateLimit(request, publicRateLimit());
    if (rateLimitError) return rateLimitError;

    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const supabase = createServiceClient();

    // Insert the project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name: data.name,
        description: data.description || null,
        party_a_name: data.partyA.name,
        party_a_email: data.partyA.email,
        party_a_business: data.partyA.businessName,
        party_b_name: data.partyB.name,
        party_b_email: data.partyB.email,
        party_b_business: data.partyB.businessName,
        start_date: data.startDate,
        expected_end_date: data.expectedEndDate || null,
        includes_dispute_clause: data.includeDisputeClause,
        status: "active",
      })
      .select("id, access_token")
      .single();

    if (projectError || !project) {
      console.error("Project insert error:", projectError);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 },
      );
    }

    // Insert all milestones
    const milestoneRows = data.milestones.map((m, index) => ({
      project_id: project.id,
      title: m.title,
      description: m.description || null,
      responsible_party: m.responsibleParty,
      due_date: m.dueDate,
      payment_amount: m.paymentAmount ?? null,
      deliverables: m.deliverables ?? null,
      sort_order: index,
      status: "pending" as const,
    }));

    const { error: milestoneError } = await supabase
      .from("milestones")
      .insert(milestoneRows);

    if (milestoneError) {
      console.error("Milestone insert error:", milestoneError);
      // Clean up the project if milestone insert fails
      await supabase.from("projects").delete().eq("id", project.id);
      return NextResponse.json(
        { error: "Failed to create milestones" },
        { status: 500 },
      );
    }

    return NextResponse.json({ accessToken: project.access_token });
  } catch (err) {
    console.error("Project creation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
