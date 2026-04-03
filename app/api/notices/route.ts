import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { noticeSchema } from "@/lib/notices/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = noticeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const supabase = createServiceClient();

    const { data: notice, error } = await supabase
      .from("notices")
      .insert({
        notice_type: data.noticeType,
        status: "sent",
        sender_name: data.sender.name,
        sender_business: data.sender.businessName,
        sender_address: data.sender.address,
        sender_email: data.sender.email,
        recipient_name: data.recipient.name,
        recipient_business: data.recipient.businessName,
        recipient_address: data.recipient.address,
        recipient_email: data.recipient.email,
        reference: data.reference || null,
        subject: data.subject,
        content: data.content,
        relevant_clause: data.relevantClause || null,
        required_action: data.requiredAction || null,
        response_deadline: data.responseDeadline || null,
        consequences: data.consequences || null,
        includes_dispute_clause: data.includeDisputeClause,
      })
      .select("access_token")
      .single();

    if (error) {
      console.error("Notice insert error:", error);
      return NextResponse.json(
        { error: "Failed to create notice", detail: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ accessToken: notice.access_token });
  } catch (err) {
    console.error("Notice creation error:", err);
    return NextResponse.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 },
    );
  }
}
