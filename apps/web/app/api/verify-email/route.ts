import { NextResponse } from "next/server";
import { verifyEmailCode } from "@/lib/email/verification";
import { verifyRateLimit, applyRateLimit } from "@/lib/security/rate-limit";

/**
 * POST /api/verify-email
 *
 * Public endpoint — no auth required. Accepts a verification code
 * and returns whether it matches a genuine Kestrel email.
 */
export async function POST(request: Request) {
  try {
    const rateLimitError = await applyRateLimit(request, verifyRateLimit());
    if (rateLimitError) return rateLimitError;

    const body = await request.json();
    const code = typeof body.code === "string" ? body.code.trim() : "";

    if (!code || code.length < 4) {
      return NextResponse.json(
        { valid: false, error: "Please enter a verification code." },
        { status: 400 },
      );
    }

    const result = await verifyEmailCode(code);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { valid: false, error: "Invalid request." },
      { status: 400 },
    );
  }
}
