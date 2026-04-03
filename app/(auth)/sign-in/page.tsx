"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signInWithMagicLink } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SignInForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    if (redirectTo) {
      formData.set("redirect", redirectTo);
    }

    const result = await signInWithMagicLink(formData);

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
          We&apos;ve sent a sign-in link to your email address. Click the link to continue.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 text-sm font-medium text-kestrel hover:text-kestrel-hover transition-colors"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-ink">Sign in to Kestrel</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Enter your email to receive a sign-in link.
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
          error={error ?? undefined}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending link..." : "Continue with email"}
        </Button>
      </form>

      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-subtle" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-text-muted">Passwordless sign-in</span>
        </div>
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-text-muted">
        We&apos;ll email you a secure link. No password needed — ever.
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
