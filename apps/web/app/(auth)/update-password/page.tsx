"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UpdatePasswordPage() {
  const router = useRouter();
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

    const result = await updatePassword(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/sign-in");
    }
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
