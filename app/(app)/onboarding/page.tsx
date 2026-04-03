"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Logo } from "@/components/ui/logo";

const businessTypes = [
  { value: "", label: "Select type..." },
  { value: "sole_trader", label: "Sole trader" },
  { value: "limited_company", label: "Limited company" },
  { value: "partnership", label: "Partnership" },
  { value: "llp", label: "LLP" },
  { value: "charity", label: "Charity" },
  { value: "other", label: "Other" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await updateProfile(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-cream px-4 pt-16 sm:pt-24">
      <Logo size="lg" />

      <div className="mt-12 w-full max-w-md">
        <h1 className="text-center font-display text-2xl text-ink">
          Welcome to Kestrel
        </h1>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Tell us a bit about you and your business.
        </p>

        <form action={handleSubmit} className="mt-8 space-y-5">
          <Input
            name="display_name"
            label="Your name"
            placeholder="Alex Smith"
            required
            autoFocus
          />

          <Input
            name="business_name"
            label="Business name"
            placeholder="Smith & Co Ltd"
          />

          <Select name="business_type" label="Business type">
            {businessTypes.map((bt) => (
              <option key={bt.value} value={bt.value}>
                {bt.label}
              </option>
            ))}
          </Select>

          {error && (
            <p className="text-sm text-error">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Setting up..." : "Continue to dashboard"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-text-muted">
          You can update this information anytime in settings.
        </p>
      </div>
    </div>
  );
}
