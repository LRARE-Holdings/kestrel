"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  checkSlugAvailability,
  createOrganisation,
} from "@/lib/branding/actions";
import { generateSlug, isValidSlug } from "@/lib/branding/slug";

type SlugState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "taken" }
  | { status: "unverified" }
  | { status: "invalid" };

export function CreateOrganisationForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugState, setSlugState] = useState<SlugState>({ status: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced availability check, driven from the input handlers (never an
  // effect) so we don't trigger cascading renders.
  function scheduleSlugCheck(nextSlug: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!nextSlug) {
      setSlugState({ status: "idle" });
      return;
    }
    if (!isValidSlug(nextSlug)) {
      setSlugState({ status: "invalid" });
      return;
    }
    setSlugState({ status: "checking" });
    debounceRef.current = setTimeout(async () => {
      const result = await checkSlugAvailability(nextSlug);
      if (!result.checked) {
        setSlugState({ status: "unverified" });
      } else {
        setSlugState({ status: result.available ? "available" : "taken" });
      }
    }, 400);
  }

  function handleNameChange(value: string) {
    setName(value);
    // Keep the slug in step with the name until the user edits it directly.
    if (!slugEdited) {
      const next = generateSlug(value);
      setSlug(next);
      scheduleSlugCheck(next);
    }
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    const next = value.toLowerCase();
    setSlug(next);
    scheduleSlugCheck(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your organisation's name.");
      return;
    }
    if (!isValidSlug(slug)) {
      setError("Please choose a valid web address (lowercase, hyphenated).");
      return;
    }

    setSubmitting(true);
    const result = await createOrganisation({ name: name.trim(), slug });
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  const slugHint = (() => {
    switch (slugState.status) {
      case "checking":
        return <span className="text-text-muted">Checking availability…</span>;
      case "available":
        return <span className="text-sage">This web address is available.</span>;
      case "taken":
        return <span className="text-error">That web address is taken.</span>;
      case "invalid":
        return (
          <span className="text-error">
            Use lowercase letters, numbers and hyphens only.
          </span>
        );
      case "unverified":
        return (
          <span className="text-text-muted">
            We couldn&apos;t verify availability — you can still continue.
          </span>
        );
      default:
        return null;
    }
  })();

  return (
    <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-6">
      <h2 className="text-lg font-semibold text-ink">
        Create your organisation
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Set up a branded login page for your firm or business. Your clients will
        see your name, logo and colours when they sign in.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Input
          name="name"
          label="Organisation name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Northumbria Legal LLP"
          required
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="org-slug" className="text-sm font-medium text-ink">
            Web address
          </label>
          <div className="flex items-center gap-1 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 focus-within:border-kestrel focus-within:ring-2 focus-within:ring-kestrel/40">
            <span className="text-sm text-text-muted">/f/</span>
            <input
              id="org-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="your-firm"
              className="flex-1 bg-transparent font-mono text-sm text-ink placeholder:text-text-muted focus:outline-none"
            />
          </div>
          {slugHint && <p className="text-xs">{slugHint}</p>}
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <Button
          type="submit"
          disabled={submitting || slugState.status === "taken" || slugState.status === "invalid"}
        >
          {submitting ? "Creating…" : "Create organisation"}
        </Button>
      </form>
    </div>
  );
}
