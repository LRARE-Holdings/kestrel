"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await resetPassword(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-kestrel/8">
          <svg
            className="h-7 w-7 text-kestrel"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-xl font-bold text-ink">
          Check your email
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          If an account exists with that email, we&apos;ve sent a password reset link.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 inline-block text-sm font-medium text-kestrel transition-colors hover:text-kestrel-hover"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-ink">Reset your password</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form action={handleSubmit} className="mt-7 space-y-4">
        <Input
          name="email"
          type="email"
          label="Email address"
          placeholder="you@business.co.uk"
          required
          autoFocus
          autoComplete="email"
          error={error ?? undefined}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending link..." : "Send reset link"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-text-secondary">
        Remember your password?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-kestrel transition-colors hover:text-kestrel-hover"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
