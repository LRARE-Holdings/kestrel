"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EMAILS } from "@kestrel/shared/constants";

interface VerificationResult {
  valid: boolean;
  recipientEmail?: string;
  emailType?: string;
  subject?: string;
  sentAt?: string;
  alreadyVerified?: boolean;
  error?: string;
}

const EMAIL_TYPE_LABELS: Record<string, string> = {
  dispute_filed_confirmation: "Dispute filing confirmation",
  dispute_filed: "Dispute notification",
  deadline_reminder: "Deadline reminder",
  submission_received: "Submission received",
  evidence_uploaded: "Evidence uploaded",
  proposal_received: "Proposal received",
  proposal_response: "Proposal response",
  status_changed: "Status update",
  dispute_resolved: "Dispute resolved",
};

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ valid: false, error: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:py-24">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
          Verify an email
        </h1>
        <p className="mt-3 text-base text-text-secondary leading-relaxed">
          Enter the verification code from a Kestrel email to confirm it was
          genuinely sent by us. The code appears in the footer of every email
          we send.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-4">
        <Input
          label="Verification code"
          placeholder="KV-XXXX-XXXX"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setResult(null);
          }}
          className="font-mono text-center text-lg tracking-widest"
          maxLength={12}
          autoComplete="off"
          spellCheck={false}
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading || code.trim().length < 4}
        >
          {loading ? "Checking..." : "Verify"}
        </Button>
      </form>

      {/* Result */}
      {result && (
        <div className="mt-8">
          {result.valid ? (
            <div className="rounded-xl border border-sage/40 bg-sage/10 p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-white text-sm font-bold">
                  &#10003;
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-ink">
                    This is a genuine Kestrel email
                  </p>
                  {result.alreadyVerified && (
                    <p className="text-sm text-text-muted">
                      This code has been verified before. If you did not verify
                      it previously, someone else may have your email. Please
                      contact us.
                    </p>
                  )}
                  <dl className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Sent to</dt>
                      <dd className="font-mono text-ink">{result.recipientEmail}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Type</dt>
                      <dd className="text-ink">
                        {EMAIL_TYPE_LABELS[result.emailType ?? ""] ?? result.emailType}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Subject</dt>
                      <dd className="text-ink max-w-[240px] truncate text-right">
                        {result.subject}
                      </dd>
                    </div>
                    {result.sentAt && (
                      <div className="flex justify-between">
                        <dt className="text-text-muted">Sent</dt>
                        <dd className="text-ink">
                          {new Date(result.sentAt).toLocaleDateString("en-GB", {
                            weekday: "short",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-error/30 bg-error/5 p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-error text-white text-sm font-bold">
                  &#10005;
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-ink">
                    Code not recognised
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {result.error ||
                      `This code does not match any email sent by Kestrel. If you believe the email is fraudulent, do not click any links in it and forward it to ${EMAILS.security}.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="mt-10 text-center text-xs text-text-muted leading-relaxed">
        Kestrel will never ask for your password, bank details, or payment
        information by email. If something feels wrong, trust your instincts
        and contact us directly.
      </p>
    </div>
  );
}
