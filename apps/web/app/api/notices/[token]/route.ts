import { NextResponse } from "next/server";
import { createServiceClient } from "@kestrel/shared/supabase/service";
import { acknowledgeSchema } from "@/lib/notices/schemas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const supabase = createServiceClient();

    const { data: notice, error } = await supabase
      .from("notices")
      .select("*")
      .eq("access_token", token)
      .single();

    if (error || !notice) {
      return NextResponse.json(
        { error: "Notice not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ notice });
  } catch (err) {
    console.error("Notice fetch error:", err);
    return NextResponse.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const parsed = acknowledgeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Verify the notice exists and is not already acknowledged
    const { data: existing, error: fetchError } = await supabase
      .from("notices")
      .select("id, status")
      .eq("access_token", token)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Notice not found" },
        { status: 404 },
      );
    }

    if (existing.status === "acknowledged") {
      return NextResponse.json(
        { error: "Notice has already been acknowledged" },
        { status: 409 },
      );
    }

    const { error: updateError } = await supabase
      .from("notices")
      .update({
        status: "acknowledged",
        acknowledged_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (updateError) {
      console.error("Notice acknowledge error:", updateError);
      return NextResponse.json(
        { error: "Failed to acknowledge notice", detail: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ acknowledged: true });
  } catch (err) {
    console.error("Notice acknowledge error:", err);
    return NextResponse.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 },
    );
  }
}
