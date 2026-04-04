"use client";

import { useActionState } from "react";
import { signInWithPassword } from "@/lib/auth/actions";

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithPassword, null);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          placeholder="admin@kestrel.law"
          className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-text-muted outline-none transition-colors focus:border-kestrel focus:ring-1 focus:ring-kestrel"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-text-muted outline-none transition-colors focus:border-kestrel focus:ring-1 focus:ring-kestrel"
        />
      </div>

      {state?.error && (
        <div className="rounded-lg bg-error/5 border border-error/20 px-3.5 py-2.5 text-sm text-error">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-kestrel px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-kestrel-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
