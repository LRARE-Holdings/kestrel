import { NextResponse } from "next/server";
import { createServiceClient } from "@kestrel/shared/supabase/service";
import { handshakeResponseSchema } from "@/lib/handshake/schemas";
import { getResend } from "@kestrel/shared/email/client";
import { SITE_URL, EMAILS } from "@kestrel/shared/constants";
import { handshakeResponseEmail } from "@/lib/email/templates/handshake-response";
import { publicRateLimit, applyRateLimit } from "@/lib/security/rate-limit";
import { validateOrigin } from "@/lib/security/csrf";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── GET: Fetch handshake by access token ────────────────────────────────────

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

    const { data: handshake, error } = await supabase
      .from("handshakes")
      .select("*, handshake_terms(*)")
      .eq("access_token", token)
      .single();

    if (error || !handshake) {
      return NextResponse.json(
        { error: "Handshake not found" },
        { status: 404 },
      );
    }

    // Sort terms by sort_order
    if (handshake.handshake_terms) {
      handshake.handshake_terms.sort(
        (a: { sort_order: number }, b: { sort_order: number }) =>
          a.sort_order - b.sort_order,
      );
    }

    // Also fetch the latest response if one exists
    const { data: responses } = await supabase
      .from("handshake_responses")
      .select("*")
      .eq("handshake_id", handshake.id)
      .order("created_at", { ascending: false })
      .limit(1);

    return NextResponse.json({
      ...handshake,
      response: responses && responses.length > 0 ? responses[0] : null,
    });
  } catch (error) {
    console.error("Handshake fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── POST: Submit a response to a handshake ──────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const originError = validateOrigin(request);
    if (originError) return originError;

    const rateLimitError = await applyRateLimit(request, publicRateLimit());
    if (rateLimitError) return rateLimitError;

    const { token } = await params;

    if (!UUID_REGEX.test(token)) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsed = handshakeResponseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { responseType, message, respondentName, respondentEmail } =
      parsed.data;

    const supabase = createServiceClient();

    // Fetch the handshake (include Party A details for the notification email)
    const { data: handshake, error: fetchError } = await supabase
      .from("handshakes")
      .select("id, status, title, party_a_name, party_a_email, party_a_business, party_b_name, party_b_business, access_token")
      .eq("access_token", token)
      .single();

    if (fetchError || !handshake) {
      return NextResponse.json(
        { error: "Handshake not found" },
        { status: 404 },
      );
    }

    if (handshake.status !== "pending") {
      return NextResponse.json(
        { error: "This handshake has already been responded to" },
        { status: 409 },
      );
    }

    // Insert the response
    const { error: responseError } = await supabase
      .from("handshake_responses")
      .insert({
        handshake_id: handshake.id,
        response_type: responseType,
        message: message || null,
        respondent_name: respondentName,
        respondent_email: respondentEmail,
      });

    if (responseError) {
      console.error("Handshake response insert error:", responseError);
      return NextResponse.json(
        { error: "Failed to submit response" },
        { status: 500 },
      );
    }

    // Update the handshake status
    const now = new Date().toISOString();
    const statusMap: Record<string, string> = {
      confirm: "confirmed",
      modify: "modified",
      decline: "declined",
    };

    const updatePayload: Record<string, string> = {
      status: statusMap[responseType],
      updated_at: now,
    };

    if (responseType === "confirm") {
      updatePayload.confirmed_at = now;
    } else if (responseType === "decline") {
      updatePayload.declined_at = now;
    }

    const { data: updated, error: updateError } = await supabase
      .from("handshakes")
      .update(updatePayload)
      .eq("id", handshake.id)
      .select("*, handshake_terms(*)")
      .single();

    if (updateError) {
      console.error("Handshake status update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update handshake status" },
        { status: 500 },
      );
    }

    // Send email notification to Party A (fire-and-forget)
    const viewUrl = `${SITE_URL}/tools/handshake/${handshake.access_token}`;

    const email = handshakeResponseEmail({
      partyAName: handshake.party_a_name,
      partyABusiness: handshake.party_a_business,
      partyBName: respondentName,
      partyBBusiness: handshake.party_b_business,
      title: handshake.title,
      responseType: responseType as "confirm" | "modify" | "decline",
      message: message || undefined,
      viewUrl,
    });

    getResend()
      .emails.send({
        from: `Kestrel <${EMAILS.notifications}>`,
        to: handshake.party_a_email,
        subject: email.subject,
        html: email.html,
      })
      .catch((err) => {
        console.error("[handshake] Failed to send Party A notification:", err);
      });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Handshake response error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
