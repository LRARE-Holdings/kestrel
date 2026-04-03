"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { REFERRAL_SOURCES } from "@/lib/constants";

interface StepDiscoveryData {
  referral_source?: string;
  referral_code?: string;
}

interface StepDiscoveryProps {
  defaultValues?: StepDiscoveryData;
  onNext: (data: StepDiscoveryData) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function StepDiscovery({
  defaultValues = {},
  onNext,
  onBack,
  onSkip,
}: StepDiscoveryProps) {
  const [referralSource, setReferralSource] = useState(
    defaultValues.referral_source ?? ""
  );
  const [referralCode, setReferralCode] = useState(
    defaultValues.referral_code ?? ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    onNext({
      referral_source: referralSource || undefined,
      referral_code: referralCode || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">One last thing</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          How did you find us?
        </p>
      </div>

      <div className="space-y-4">
        <Select
          label="How did you hear about Kestrel?"
          value={referralSource}
          onChange={(e) => setReferralSource(e.target.value)}
        >
          {REFERRAL_SOURCES.map((rs) => (
            <option key={rs.value} value={rs.value}>
              {rs.label}
            </option>
          ))}
        </Select>

        {referralSource && (
          <Input
            label="Referral code (optional)"
            placeholder="e.g. KESTREL2026"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <Button type="submit" className="gap-2">
            Complete setup
          </Button>
        </div>
      </div>
    </form>
  );
}
