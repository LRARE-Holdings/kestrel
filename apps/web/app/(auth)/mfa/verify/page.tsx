"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@kestrel/shared/supabase/client";
import { Button } from "@/components/ui/button";

export default function MfaVerifyPage() {
  const router = useRouter();

  // Create the Supabase browser client lazily. Building it at module/render
  // time throws when the public env vars are empty (e.g. during static
  // prerender), so we only instantiate it inside client-side handlers.
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  const [factorId, setFactorId] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadFactor() {
      const { data, error: listError } =
        await getSupabase().auth.mfa.listFactors();

      if (!active) return;

      if (listError) {
        setError(listError.message);
        setIsLoading(false);
        return;
      }

      const totpFactor = data.totp.find((f) => f.status === "verified");

      if (!totpFactor) {
        // No MFA enrolled — go to dashboard
        router.replace("/dashboard");
        return;
      }

      setFactorId(totpFactor.id);
      setIsLoading(false);
    }

    loadFactor();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsVerifying(true);

    const { data: challengeData, error: challengeError } =
      await getSupabase().auth.mfa.challenge({ factorId });

    if (challengeError) {
      setError(challengeError.message);
      setIsVerifying(false);
      return;
    }

    const { error: verifyError } = await getSupabase().auth.mfa.verify({
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
    router.push("/dashboard");
  }

  async function handleSignOut() {
    await getSupabase().auth.signOut();
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
      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-ink">
          Two-factor authentication
        </h1>
        <p className="text-sm text-text-secondary mt-1.5">
          Enter the 6-digit code from your authenticator app.
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
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-center text-lg font-mono tracking-[0.3em] text-ink placeholder:text-text-muted outline-none transition-colors focus:border-kestrel focus:ring-1 focus:ring-kestrel"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-error/5 border border-error/20 px-3.5 py-2.5 text-sm text-error">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isVerifying || code.length !== 6}
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </Button>
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
