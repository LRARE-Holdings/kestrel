"use client";

import { useState } from "react";
import Link from "next/link";
import { updatePassword } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UpdatePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

    const result = await updatePassword(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-kestrel/8">
          <svg
            className="h-7 w-7 text-kestrel"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-xl font-bold text-ink">
          Password updated
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Your password has been changed successfully. You can now sign in with
          your new password.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 inline-block text-sm font-medium text-kestrel transition-colors hover:text-kestrel-hover"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-ink">Set a new password</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Choose a strong password for your account.
        </p>
      </div>

      <form action={handleSubmit} className="mt-7 space-y-4">
        <Input
          name="password"
          type="password"
          label="New password"
          placeholder="At least 8 characters"
          required
          minLength={8}
          autoFocus
          autoComplete="new-password"
        />

        <Input
          name="confirm_password"
          type="password"
          label="Confirm new password"
          placeholder="Repeat your password"
          required
          minLength={8}
          autoComplete="new-password"
          error={error ?? undefined}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Updating password..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}
