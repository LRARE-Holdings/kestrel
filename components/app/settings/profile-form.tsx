"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BUSINESS_TYPES, COMPANY_SIZES, INDUSTRIES } from "@/lib/constants";

interface ProfileFormProps {
  profile: {
    display_name: string;
    business_name: string | null;
    business_type: string | null;
    company_size: string | null;
    industry: string | null;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSaved(false);

    const result = await updateProfile(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
    }
    setLoading(false);
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-white p-6">
      <h2 className="text-lg font-semibold text-ink">Profile</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Your personal and business details.
      </p>

      <form action={handleSubmit} className="mt-6 space-y-5">
        <Input
          name="display_name"
          label="Display name"
          placeholder="Your name"
          defaultValue={profile.display_name}
          required
        />

        <Input
          name="business_name"
          label="Business name"
          placeholder="Your business"
          defaultValue={profile.business_name ?? ""}
        />

        <Select
          name="business_type"
          label="Business type"
          defaultValue={profile.business_type ?? ""}
        >
          {BUSINESS_TYPES.map((bt) => (
            <option key={bt.value} value={bt.value}>
              {bt.label}
            </option>
          ))}
        </Select>

        <Select
          name="company_size"
          label="Company size"
          defaultValue={profile.company_size ?? ""}
        >
          {COMPANY_SIZES.map((cs) => (
            <option key={cs.value} value={cs.value}>
              {cs.label}
            </option>
          ))}
        </Select>

        <Select
          name="industry"
          label="Industry"
          defaultValue={profile.industry ?? ""}
        >
          {INDUSTRIES.map((ind) => (
            <option key={ind.value} value={ind.value}>
              {ind.label}
            </option>
          ))}
        </Select>

        {error && <p className="text-sm text-error">{error}</p>}
        {saved && (
          <p className="text-sm text-sage">Profile updated.</p>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
