"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createHandshakeSchema,
  type CreateHandshakeInput,
} from "@/lib/handshake/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";

export function HandshakeCreatorForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateHandshakeInput>({
    resolver: zodResolver(createHandshakeSchema),
    defaultValues: {
      title: "",
      description: "",
      partyA: { name: "", email: "", businessName: "" },
      partyB: { name: "", email: "", businessName: "" },
      terms: [
        { description: "", responsibleParty: "both", deadline: "", amount: undefined },
      ],
      includeDisputeClause: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "terms",
  });

  const includeDisputeClause = watch("includeDisputeClause");

  async function onSubmit(data: CreateHandshakeInput) {
    setSubmitting(true);
    setSubmitError(null);

    try {
      // Clean up terms before sending
      const cleanedTerms = data.terms.map((term) => ({
        ...term,
        deadline: term.deadline || undefined,
        amount:
          term.amount !== undefined && !Number.isNaN(term.amount)
            ? term.amount
            : undefined,
      }));

      const res = await fetch("/api/handshake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, terms: cleanedTerms }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to create handshake");
      }

      const { accessToken } = await res.json();
      router.push(`/tools/handshake/success?token=${accessToken}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      {/* What was agreed */}
      <Card>
        <CardHeader>
          <CardTitle>What was agreed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Website redesign project agreement"
            error={errors.title?.message}
            {...register("title")}
          />
          <Textarea
            label="Description (optional)"
            placeholder="Brief summary of the agreement context"
            rows={3}
            error={errors.description?.message}
            {...register("description")}
          />
        </CardContent>
      </Card>

      {/* Key Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Key Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-4 rounded-[var(--radius-md)] border border-border-subtle p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">
                  Term {index + 1}
                </span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-xs text-text-muted hover:text-error transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <Input
                label="Description"
                placeholder="e.g. Deliver homepage wireframes"
                error={errors.terms?.[index]?.description?.message}
                {...register(`terms.${index}.description`)}
              />

              <Select
                label="Responsible party"
                error={errors.terms?.[index]?.responsibleParty?.message}
                {...register(`terms.${index}.responsibleParty`)}
              >
                <option value="party_a">Party A</option>
                <option value="party_b">Party B</option>
                <option value="both">Both</option>
              </Select>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Deadline (optional)"
                  type="date"
                  error={errors.terms?.[index]?.deadline?.message}
                  {...register(`terms.${index}.deadline`)}
                />
                <Input
                  label="Amount, GBP (optional)"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 2500.00"
                  error={errors.terms?.[index]?.amount?.message}
                  {...register(`terms.${index}.amount`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
            </div>
          ))}

          {errors.terms?.root?.message && (
            <p className="text-xs text-error">{errors.terms.root.message}</p>
          )}
          {typeof errors.terms?.message === "string" && (
            <p className="text-xs text-error">{errors.terms.message}</p>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              append({
                description: "",
                responsibleParty: "both",
                deadline: "",
                amount: undefined,
              })
            }
          >
            + Add term
          </Button>
        </CardContent>
      </Card>

      {/* Party A (Your details) */}
      <Card>
        <CardHeader>
          <CardTitle>Your Details (Party A)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g. Jane Smith"
            error={errors.partyA?.name?.message}
            {...register("partyA.name")}
          />
          <Input
            label="Email"
            type="email"
            placeholder="jane@smithconsulting.co.uk"
            error={errors.partyA?.email?.message}
            {...register("partyA.email")}
          />
          <Input
            label="Business name"
            placeholder="e.g. Smith Consulting Ltd"
            error={errors.partyA?.businessName?.message}
            {...register("partyA.businessName")}
          />
        </CardContent>
      </Card>

      {/* Party B */}
      <Card>
        <CardHeader>
          <CardTitle>Other Party (Party B)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g. John Doe"
            error={errors.partyB?.name?.message}
            {...register("partyB.name")}
          />
          <Input
            label="Email"
            type="email"
            placeholder="john@doeindustries.co.uk"
            error={errors.partyB?.email?.message}
            {...register("partyB.email")}
          />
          <Input
            label="Business name"
            placeholder="e.g. Doe Industries Ltd"
            error={errors.partyB?.businessName?.message}
            {...register("partyB.businessName")}
          />
        </CardContent>
      </Card>

      {/* Kestrel dispute clause toggle */}
      <Card>
        <CardContent className="flex items-start justify-between gap-4 pt-6">
          <div>
            <p className="text-sm font-medium text-ink">
              Include Kestrel dispute resolution clause
            </p>
            <p className="mt-1 text-xs text-text-muted leading-relaxed">
              If a disagreement arises about this agreement, both parties agree
              to attempt resolution through Kestrel before taking formal action.
              Recommended. One-click removable.
            </p>
          </div>
          <Toggle
            checked={includeDisputeClause}
            onChange={(e) =>
              setValue("includeDisputeClause", e.target.checked)
            }
          />
        </CardContent>
      </Card>

      {/* Submit */}
      {submitError && (
        <div className="rounded-[var(--radius-md)] border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {submitError}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        disabled={submitting}
      >
        {submitting ? "Creating..." : "Create Handshake"}
      </Button>

      {/* Disclaimer */}
      <p className="text-xs leading-relaxed text-text-muted">
        This tool creates a record of agreement between two parties. It is not a
        legally binding contract. For formal agreements, seek independent legal
        advice. Kestrel operates under the laws of England and Wales.
      </p>
    </form>
  );
}
