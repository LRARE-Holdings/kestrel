"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signUpWithPassword } from "@/lib/auth/actions";
import { createClient } from "@kestrel/shared/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function OAuthButtons({ redirectTo }: { redirectTo?: string | null }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleOAuth(provider: "google" | "azure") {
    setLoading(provider);
    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (redirectTo) {
      callbackUrl.searchParams.set("redirect", redirectTo);
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });
    if (error) {
      setLoading(null);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="secondary"
        className="w-full gap-2"
        disabled={loading !== null}
        onClick={() => handleOAuth("google")}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {loading === "google" ? "Connecting..." : "Google"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="w-full gap-2"
        disabled={loading !== null}
        onClick={() => handleOAuth("azure")}
      >
        <svg className="h-4 w-4" viewBox="0 0 21 21" aria-hidden="true">
          <rect x="1" y="1" width="9" height="9" fill="#f25022" />
          <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
          <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
          <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </svg>
        {loading === "azure" ? "Connecting..." : "Microsoft"}
      </Button>
    </div>
  );
}

function SignUpForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const result = await signUpWithPassword(formData);

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
          We&apos;ve sent a confirmation link to your email address. Click the link to activate your account.
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
        <h1 className="font-display text-xl font-bold text-ink">Create your account</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Get started with Kestrel for free.
        </p>
      </div>

      <div className="mt-7">
        <OAuthButtons redirectTo={redirectTo} />
      </div>

      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-subtle" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-text-muted">or continue with email</span>
        </div>
      </div>

      <form action={handleSubmit} className="mt-6 space-y-4">
        <Input
          name="email"
          type="email"
          label="Email address"
          placeholder="you@business.co.uk"
          required
          autoFocus
          autoComplete="email"
        />

        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="At least 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
        />

        <Input
          name="confirm_password"
          type="password"
          label="Confirm password"
          placeholder="Repeat your password"
          required
          minLength={8}
          autoComplete="new-password"
          error={error ?? undefined}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs leading-relaxed text-text-muted">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="underline transition-colors hover:text-ink">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline transition-colors hover:text-ink">
          Privacy Policy
        </Link>
        .
      </p>

      <div className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href={redirectTo ? `/sign-in?redirect=${encodeURIComponent(redirectTo)}` : "/sign-in"}
          className="font-medium text-kestrel transition-colors hover:text-kestrel-hover"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
