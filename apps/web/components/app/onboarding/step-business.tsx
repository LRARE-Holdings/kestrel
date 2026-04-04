"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@/components/ui/icons";
import { BUSINESS_TYPES, COMPANY_SIZES, INDUSTRIES } from "@kestrel/shared/constants";

interface StepBusinessData {
  business_name?: string;
  business_type?: string;
  company_size?: string;
  industry?: string;
}

interface StepBusinessProps {
  defaultValues?: StepBusinessData;
  onNext: (data: StepBusinessData) => void;
  onBack: () => void;
}

export function StepBusiness({
  defaultValues = {},
  onNext,
  onBack,
}: StepBusinessProps) {
  const [businessName, setBusinessName] = useState(
    defaultValues.business_name ?? ""
  );
  const [businessType, setBusinessType] = useState(
    defaultValues.business_type ?? ""
  );
  const [companySize, setCompanySize] = useState(
    defaultValues.company_size ?? ""
  );
  const [industry, setIndustry] = useState(defaultValues.industry ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    onNext({
      business_name: businessName || undefined,
      business_type: businessType || undefined,
      company_size: companySize || undefined,
      industry: industry || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">
          Tell us about your business
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          This helps us tailor your experience.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Business name"
          placeholder="Smith & Co Ltd"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />

        <Select
          label="Business type"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
        >
          {BUSINESS_TYPES.map((bt) => (
            <option key={bt.value} value={bt.value}>
              {bt.label}
            </option>
          ))}
        </Select>

        <Select
          label="Company size"
          value={companySize}
          onChange={(e) => setCompanySize(e.target.value)}
        >
          {COMPANY_SIZES.map((cs) => (
            <option key={cs.value} value={cs.value}>
              {cs.label}
            </option>
          ))}
        </Select>

        <Select
          label="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        >
          {INDUSTRIES.map((ind) => (
            <option key={ind.value} value={ind.value}>
              {ind.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" className="gap-2">
          Continue
          <IconArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
