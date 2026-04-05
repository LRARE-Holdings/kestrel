import { NextResponse } from "next/server";
import { createServiceClient } from "@kestrel/shared/supabase/service";
import { updateMilestoneSchema } from "@/lib/milestones/schemas";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!UUID_REGEX.test(token)) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    const { data: project, error } = await supabase
      .from("projects")
      .select("*, milestones(*)")
      .eq("access_token", token)
      .single();

    if (error || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      );
    }

    // Sort milestones by sort_order
    if (project.milestones && Array.isArray(project.milestones)) {
      project.milestones.sort(
        (a: { sort_order: number }, b: { sort_order: number }) =>
          a.sort_order - b.sort_order,
      );
    }

    return NextResponse.json({ project });
  } catch (err) {
    console.error("Project fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!UUID_REGEX.test(token)) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 },
      );
    }
    const body = await request.json();
    const parsed = updateMilestoneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { milestoneId, status } = parsed.data;
    const supabase = createServiceClient();

    // Verify the project exists with this access token
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("access_token", token)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      );
    }

    // Verify the milestone belongs to this project
    const { data: milestone, error: milestoneError } = await supabase
      .from("milestones")
      .select("id, project_id")
      .eq("id", milestoneId)
      .eq("project_id", project.id)
      .single();

    if (milestoneError || !milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 },
      );
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = { status };

    if (status === "completed") {
      updatePayload.completed_at = new Date().toISOString();
    } else if (status === "disputed") {
      updatePayload.disputed_at = new Date().toISOString();
    }

    // Clear timestamps if moving back to an earlier status
    if (status === "pending" || status === "in_progress") {
      updatePayload.completed_at = null;
      updatePayload.disputed_at = null;
    }

    const { error: updateError } = await supabase
      .from("milestones")
      .update(updatePayload)
      .eq("id", milestoneId);

    if (updateError) {
      console.error("Milestone update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update milestone" },
        { status: 500 },
      );
    }

    return NextResponse.json({ updated: true, status });
  } catch (err) {
    console.error("Milestone update error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
