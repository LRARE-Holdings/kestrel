import { NextResponse } from "next/server";
import { createServiceClient } from "@kestrel/shared/supabase/service";
import { noticeSchema } from "@/lib/notices/schemas";
import { getResend } from "@kestrel/shared/email/client";
import { SITE_URL, EMAILS } from "@kestrel/shared/constants";
import {
  noticeSentToRecipientEmail,
  noticeSentConfirmationEmail,
} from "@/lib/email/templates/notice-sent";

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

    // Send email notifications (fire-and-forget — never block the response)
    const viewUrl = `${SITE_URL}/tools/notices/${notice.access_token}`;
    const fromAddress = `Kestrel <${EMAILS.notifications}>`;

    const formattedDeadline = data.responseDeadline
      ? new Date(data.responseDeadline).toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : undefined;

    // Email to the recipient
    const recipientEmail = noticeSentToRecipientEmail({
      recipientName: data.recipient.name,
      recipientBusiness: data.recipient.businessName,
      senderName: data.sender.name,
      senderBusiness: data.sender.businessName,
      noticeType: data.noticeType,
      subject: data.subject,
      requiredAction: data.requiredAction || undefined,
      responseDeadline: formattedDeadline,
      viewUrl,
    });

    // Confirmation email to the sender
    const senderEmail = noticeSentConfirmationEmail({
      senderName: data.sender.name,
      recipientName: data.recipient.name,
      recipientBusiness: data.recipient.businessName,
      recipientEmail: data.recipient.email,
      noticeType: data.noticeType,
      subject: data.subject,
      viewUrl,
    });

    // Send both in parallel, swallow errors
    Promise.allSettled([
      getResend().emails.send({
        from: fromAddress,
        to: data.recipient.email,
        subject: recipientEmail.subject,
        html: recipientEmail.html,
      }),
      getResend().emails.send({
        from: fromAddress,
        to: data.sender.email,
        subject: senderEmail.subject,
        html: senderEmail.html,
      }),
    ]).catch((err) => {
      console.error("[notices] Email send error:", err);
    });

    return NextResponse.json({ accessToken: notice.access_token });
  } catch (err) {
    console.error("Notice creation error:", err);
    return NextResponse.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 },
    );
  }
}
