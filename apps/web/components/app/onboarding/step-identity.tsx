"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@/components/ui/icons";

interface StepIdentityProps {
  defaultName?: string;
  onNext: (data: { display_name: string }) => void;
}

export function StepIdentity({ defaultName = "", onNext }: StepIdentityProps) {
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name");
      return;
    }

    setError(null);
    onNext({ display_name: trimmed });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">
          What should we call you?
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          This is how you'll appear on Kestrel.
        </p>
      </div>

      <Input
        label="Your name"
        placeholder="Alex Smith"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (error) setError(null);
        }}
        error={error ?? undefined}
        autoFocus
      />

      <Button type="submit" className="w-full gap-2">
        Continue
        <IconArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
