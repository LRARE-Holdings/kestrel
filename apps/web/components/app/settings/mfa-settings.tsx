"use client";

import { useState, useCallback } from "react";
import { createClient } from "@kestrel/shared/supabase/client";
import { Button } from "@/components/ui/button";

export function MfaSettings() {
  const supabase = createClient();

  const [step, setStep] = useState<"idle" | "enrolling" | "enrolled">("idle");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [hasMfa, setHasMfa] = useState<boolean | null>(null);
  const [existingFactorId, setExistingFactorId] = useState<string>("");

  // Check current MFA status on mount
  const checkMfa = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const verifiedFactor = data?.totp.find((f) => f.status === "verified");
    if (verifiedFactor) {
      setHasMfa(true);
      setExistingFactorId(verifiedFactor.id);
    } else {
      setHasMfa(false);
    }
  }, [supabase.auth.mfa]);

  // Run check on mount
  useState(() => {
    checkMfa();
  });

  async function handleStartEnroll() {
    setError("");
    setStep("enrolling");

    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });

    if (enrollError) {
      setError(enrollError.message);
      setStep("idle");
      return;
    }

    if (data) {
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    }
  }

  async function handleVerifyEnrollment(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsVerifying(true);

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });

    if (challengeError) {
      setError(challengeError.message);
      setIsVerifying(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });

    if (verifyError) {
      setError("Invalid code. Please try again.");
      setCode("");
      setIsVerifying(false);
      return;
    }

    setStep("enrolled");
    setHasMfa(true);
    setExistingFactorId(factorId);
    setIsVerifying(false);
    setQrCode("");
    setSecret("");
    setCode("");
  }

  async function handleDisableMfa() {
    setError("");
    setIsDisabling(true);

    const { error: unenrollError } = await supabase.auth.mfa.unenroll({
      factorId: existingFactorId,
    });

    if (unenrollError) {
      setError(unenrollError.message);
      setIsDisabling(false);
      return;
    }

    setHasMfa(false);
    setExistingFactorId("");
    setStep("idle");
    setIsDisabling(false);
  }

  function handleCancel() {
    // If we started enrollment but didn't verify, unenroll the pending factor
    if (factorId && step === "enrolling") {
      supabase.auth.mfa.unenroll({ factorId }).catch(() => {});
    }
    setStep("idle");
    setQrCode("");
    setSecret("");
    setFactorId("");
    setCode("");
    setError("");
  }

  if (hasMfa === null) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-6">
        <p className="text-sm text-text-secondary">Loading security settings...</p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-6">
      <h2 className="text-lg font-semibold text-ink">
        Two-factor authentication
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Add an extra layer of security to your account using an authenticator
        app.
      </p>

      {/* Already enrolled — show status and disable option */}
      {hasMfa && step !== "enrolling" && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2.5 rounded-lg bg-kestrel/5 border border-kestrel/15 px-4 py-3">
            <svg
              className="h-5 w-5 text-kestrel flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <p className="text-sm font-medium text-kestrel">
              Two-factor authentication is enabled
            </p>
          </div>

          {step === "enrolled" && (
            <div className="rounded-lg bg-kestrel/5 border border-kestrel/15 px-4 py-3">
              <p className="text-sm text-kestrel">
                MFA has been successfully set up. You will be asked for a code
                when you sign in.
              </p>
            </div>
          )}

          <Button
            variant="secondary"
            onClick={handleDisableMfa}
            disabled={isDisabling}
            className="text-error hover:text-error"
          >
            {isDisabling ? "Disabling..." : "Disable two-factor authentication"}
          </Button>

          {error && (
            <p className="text-sm text-error">{error}</p>
          )}
        </div>
      )}

      {/* Not enrolled — show enable button */}
      {!hasMfa && step === "idle" && (
        <div className="mt-5">
          <Button onClick={handleStartEnroll}>
            Set up two-factor authentication
          </Button>
        </div>
      )}

      {/* Enrollment in progress — show QR code and verification */}
      {step === "enrolling" && (
        <div className="mt-5 space-y-5">
          <div className="rounded-lg border border-border-subtle bg-cream/50 p-5 space-y-4">
            <p className="text-sm font-medium text-ink">
              Step 1: Scan this QR code with your authenticator app
            </p>
            <p className="text-xs text-text-muted">
              Use an app like Google Authenticator, Authy, or 1Password.
            </p>

            {qrCode && (
              <div className="flex justify-center">
                <div className="rounded-lg border border-border-subtle bg-surface p-3">
                  <img
                    src={qrCode}
                    alt="Scan this QR code with your authenticator app"
                    width={180}
                    height={180}
                    className="block"
                  />
                </div>
              </div>
            )}

            {secret && (
              <div className="space-y-1">
                <p className="text-xs text-text-muted text-center">
                  Or enter this key manually:
                </p>
                <div className="bg-stone/50 rounded-lg px-3 py-2 text-center">
                  <code className="text-xs font-mono text-ink tracking-wider break-all select-all">
                    {secret}
                  </code>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border-subtle bg-cream/50 p-5">
            <p className="text-sm font-medium text-ink mb-3">
              Step 2: Enter the 6-digit code to verify
            </p>
            <form onSubmit={handleVerifyEnrollment} className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoComplete="one-time-code"
                autoFocus={!!qrCode}
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full max-w-[200px] rounded-lg border border-border bg-surface px-3.5 py-2.5 text-center text-lg font-mono tracking-[0.3em] text-ink placeholder:text-text-muted outline-none transition-colors focus:border-kestrel focus:ring-1 focus:ring-kestrel"
              />

              {error && (
                <p className="text-sm text-error">{error}</p>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isVerifying || code.length !== 6}
                >
                  {isVerifying ? "Verifying..." : "Verify and enable"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
