"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@kestrel/shared/supabase/client";

export default function MfaVerifyPage() {
  const router = useRouter();
  const supabase = createClient();

  const [factorId, setFactorId] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadFactor = useCallback(async () => {
    setIsLoading(true);

    const { data, error: listError } = await supabase.auth.mfa.listFactors();

    if (listError) {
      setError(listError.message);
      setIsLoading(false);
      return;
    }

    // Find the verified TOTP factor
    const totpFactor = data.totp.find((f) => f.status === "verified");

    if (!totpFactor) {
      // No verified factor -- redirect to enrollment
      router.replace("/mfa/enroll");
      return;
    }

    setFactorId(totpFactor.id);
    setIsLoading(false);
  }, [supabase.auth.mfa, router]);

  useEffect(() => {
    loadFactor();
  }, [loadFactor]);

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
      setError("Invalid code. Please try again.");
      setCode("");
      setIsVerifying(false);
      return;
    }

    // Session upgraded to aal2
    router.push("/");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/sign-in");
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-bold text-ink">
          Two-factor authentication
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Enter the 6-digit code from your authenticator app to continue.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
            autoFocus
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-center text-lg font-mono tracking-[0.3em] text-ink placeholder:text-text-muted outline-none transition-colors focus:border-kestrel focus:ring-1 focus:ring-kestrel"
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
          {isVerifying ? "Verifying..." : "Verify"}
        </button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={handleSignOut}
          className="text-sm text-text-muted hover:text-ink transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
