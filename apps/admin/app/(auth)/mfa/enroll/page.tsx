"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@kestrel/shared/supabase/client";

export default function MfaEnrollPage() {
  const router = useRouter();
  const supabase = createClient();

  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const enrollTotp = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });

    if (enrollError) {
      setError(enrollError.message);
      setIsLoading(false);
      return;
    }

    if (data) {
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    }

    setIsLoading(false);
  }, [supabase.auth.mfa]);

  useEffect(() => {
    enrollTotp();
  }, [enrollTotp]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsVerifying(true);

    // Challenge the factor
    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });

    if (challengeError) {
      setError(challengeError.message);
      setIsVerifying(false);
      return;
    }

    // Verify with the TOTP code
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });

    if (verifyError) {
      setError(verifyError.message);
      setCode("");
      setIsVerifying(false);
      return;
    }

    // MFA enrolled and verified -- session is now aal2
    router.push("/");
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-text-secondary">Setting up two-factor authentication...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-bold text-ink">
          Set up two-factor authentication
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Scan the QR code with your authenticator app, then enter the 6-digit
          code to verify.
        </p>
      </div>

      {/* QR Code */}
      {qrCode && (
        <div className="flex justify-center">
          <div className="rounded-lg border border-border-subtle bg-white p-3">
            {/* The qr_code from Supabase is an SVG data URI */}
            <img
              src={qrCode}
              alt="Scan this QR code with your authenticator app"
              width={200}
              height={200}
              className="block"
            />
          </div>
        </div>
      )}

      {/* Manual entry secret */}
      {secret && (
        <div className="space-y-1.5">
          <p className="text-xs text-text-muted text-center">
            Or enter this key manually:
          </p>
          <div className="bg-stone/50 rounded-lg px-3.5 py-2 text-center">
            <code className="text-xs font-mono text-ink tracking-wider break-all select-all">
              {secret}
            </code>
          </div>
        </div>
      )}

      {/* Verification form */}
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="totp-code" className="block text-sm font-medium text-ink">
            Verification code
          </label>
          <input
            id="totp-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
            autoFocus={!!qrCode}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-center text-lg font-mono tracking-[0.3em] text-ink placeholder:text-text-muted outline-none transition-colors focus:border-kestrel focus:ring-1 focus:ring-kestrel"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-error/5 border border-error/20 px-3.5 py-2.5 text-sm text-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isVerifying || code.length !== 6}
          className="w-full rounded-lg bg-kestrel px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-kestrel-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? "Verifying..." : "Verify and continue"}
        </button>
      </form>
    </div>
  );
}
