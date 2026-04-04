"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithPassword } from "@/lib/auth/actions";
import { createClient } from "@kestrel/shared/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function OAuthButtons() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleOAuth(provider: "google" | "azure") {
    setLoading(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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

function SignInForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get("redirect");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    if (redirectTo) {
      formData.set("redirect", redirectTo);
    }

    const result = await signInWithPassword(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success, signInWithPassword calls redirect() — no client handling needed
  }

  return (
    <div>
      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-ink">Sign in to Kestrel</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Welcome back. Choose how you&apos;d like to sign in.
        </p>
      </div>

      <div className="mt-7">
        <OAuthButtons />
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
          placeholder="Enter your password"
          required
          autoComplete="current-password"
          error={error ?? undefined}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link
          href="/reset-password"
          className="text-sm text-text-muted transition-colors hover:text-kestrel"
        >
          Forgot your password?
        </Link>
      </div>

      <div className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-kestrel transition-colors hover:text-kestrel-hover"
        >
          Sign up
        </Link>
      </div>
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
