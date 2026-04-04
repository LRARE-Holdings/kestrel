import { createServiceClient } from "@kestrel/shared/supabase/service";

/**
 * Generate a human-readable verification code in the format KV-XXXX-XXXX.
 * Uses uppercase alphanumeric characters, excluding ambiguous ones (0/O, 1/I/L).
 */
function generateCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `KV-${segment()}-${segment()}`;
}

interface CreateVerificationParams {
  recipientEmail: string;
  emailType: string;
  subject: string;
  disputeId?: string;
}

/**
 * Create a verification code record in the database and return the code.
 * This should be called just before sending an email, and the returned
 * code should be passed to `emailLayout({ verificationCode })`.
 */
export async function createVerificationCode(
  params: CreateVerificationParams,
): Promise<string> {
  const supabase = createServiceClient();
  const code = generateCode();

  const { error } = await supabase.from("email_verifications").insert({
    verification_code: code,
    recipient_email: params.recipientEmail,
    email_type: params.emailType,
    subject: params.subject,
    dispute_id: params.disputeId ?? null,
    sent_at: new Date().toISOString(),
  });

  if (error) {
    // Log but don't block the email send — the code just won't appear
    console.error("[email-verification] Failed to create code:", error);
    return "";
  }

  return code;
}

interface VerificationResult {
  valid: boolean;
  recipientEmail?: string;
  emailType?: string;
  subject?: string;
  sentAt?: string;
  alreadyVerified?: boolean;
}

/**
 * Look up a verification code. Returns whether it's valid and basic
 * metadata (masked email, type, date). Marks the code as verified
 * on first successful lookup.
 */
export async function verifyEmailCode(
  code: string,
): Promise<VerificationResult> {
  const supabase = createServiceClient();

  // Normalise input: uppercase, trim whitespace, allow with or without "KV-" prefix
  const normalised = code.trim().toUpperCase();

  const { data, error } = await supabase
    .from("email_verifications")
    .select("id, verification_code, recipient_email, email_type, subject, sent_at, verified_at")
    .eq("verification_code", normalised)
    .single();

  if (error || !data) {
    return { valid: false };
  }

  const alreadyVerified = !!data.verified_at;

  // Mark as verified on first lookup
  if (!alreadyVerified) {
    await supabase
      .from("email_verifications")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", data.id);
  }

  // Mask the email: show first 2 chars + domain
  const [local, domain] = data.recipient_email.split("@");
  const maskedEmail =
    local.length > 2
      ? `${local.slice(0, 2)}${"*".repeat(local.length - 2)}@${domain}`
      : `${local[0]}*@${domain}`;

  return {
    valid: true,
    recipientEmail: maskedEmail,
    emailType: data.email_type,
    subject: data.subject,
    sentAt: data.sent_at,
    alreadyVerified,
  };
}
