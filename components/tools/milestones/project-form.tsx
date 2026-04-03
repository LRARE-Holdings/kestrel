"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/lib/milestones/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";

export function ProjectForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      partyA: { name: "", email: "", businessName: "" },
      partyB: { name: "", email: "", businessName: "" },
      startDate: "",
      expectedEndDate: "",
      milestones: [
        {
          title: "",
          description: "",
          responsibleParty: "party_a",
          dueDate: "",
          paymentAmount: undefined,
          deliverables: [],
        },
      ],
      includeDisputeClause: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones",
  });

  const includeDisputeClause = watch("includeDisputeClause");

  async function onSubmit(data: CreateProjectInput) {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create project");
      }

      const { accessToken } = await response.json();
      router.push(`/tools/milestones/${accessToken}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong",
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Project details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Project name"
            placeholder="e.g. Website Redesign"
            error={errors.name?.message}
            {...register("name")}
          />
          <Textarea
            label="Description (optional)"
            placeholder="Brief description of the project scope"
            error={errors.description?.message}
            {...register("description")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Start date"
              type="date"
              error={errors.startDate?.message}
              {...register("startDate")}
            />
            <Input
              label="Expected end date (optional)"
              type="date"
              error={errors.expectedEndDate?.message}
              {...register("expectedEndDate")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Party A */}
      <Card>
        <CardHeader>
          <CardTitle>Party A (Your Details)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Your name"
            placeholder="e.g. Jane Smith"
            error={errors.partyA?.name?.message}
            {...register("partyA.name")}
          />
          <Input
            label="Business name"
            placeholder="e.g. Smith Consulting Ltd"
            error={errors.partyA?.businessName?.message}
            {...register("partyA.businessName")}
          />
          <Input
            label="Email address"
            type="email"
            placeholder="jane@smithconsulting.co.uk"
            error={errors.partyA?.email?.message}
            {...register("partyA.email")}
          />
        </CardContent>
      </Card>

      {/* Party B */}
      <Card>
        <CardHeader>
          <CardTitle>Party B</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Contact name"
            placeholder="e.g. John Doe"
            error={errors.partyB?.name?.message}
            {...register("partyB.name")}
          />
          <Input
            label="Business name"
            placeholder="e.g. Doe Industries Ltd"
            error={errors.partyB?.businessName?.message}
            {...register("partyB.businessName")}
          />
          <Input
            label="Email address"
            type="email"
            placeholder="john@doeindustries.co.uk"
            error={errors.partyB?.email?.message}
            {...register("partyB.email")}
          />
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Milestones</CardTitle>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                append({
                  title: "",
                  description: "",
                  responsibleParty: "party_a",
                  dueDate: "",
                  paymentAmount: undefined,
                  deliverables: [],
                })
              }
            >
              Add milestone
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {errors.milestones?.root && (
            <p className="text-sm text-error">
              {errors.milestones.root.message}
            </p>
          )}

          {fields.map((field, index) => (
            <MilestoneFieldset
              key={field.id}
              index={index}
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              onRemove={fields.length > 1 ? () => remove(index) : undefined}
            />
          ))}
        </CardContent>
      </Card>

      {/* Kestrel clause toggle */}
      <Card>
        <CardContent className="flex items-start justify-between gap-4 pt-6">
          <div>
            <p className="text-sm font-medium text-ink">
              Include Kestrel dispute resolution clause
            </p>
            <p className="mt-1 text-xs text-text-muted leading-relaxed">
              If a milestone is disputed, both parties agree to attempt
              resolution through Kestrel before formal proceedings. Recommended
              and can be removed with one click.
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

      {submitError && (
        <div className="rounded-[var(--radius-md)] border border-error/20 bg-error/5 px-4 py-3">
          <p className="text-sm text-error">{submitError}</p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        disabled={submitting}
      >
        {submitting ? "Creating project..." : "Create project"}
      </Button>
    </form>
  );
}

// ── Milestone Fieldset ───────────────────────────────────────────────────────

interface MilestoneFieldsetProps {
  index: number;
  register: ReturnType<typeof useForm<CreateProjectInput>>["register"];
  errors: ReturnType<typeof useForm<CreateProjectInput>>["formState"]["errors"];
  watch: ReturnType<typeof useForm<CreateProjectInput>>["watch"];
  setValue: ReturnType<typeof useForm<CreateProjectInput>>["setValue"];
  onRemove?: () => void;
}

function MilestoneFieldset({
  index,
  register,
  errors,
  watch,
  setValue,
  onRemove,
}: MilestoneFieldsetProps) {
  const [deliverableInput, setDeliverableInput] = useState("");
  const deliverables = watch(`milestones.${index}.deliverables`) ?? [];
  const milestoneErrors = errors.milestones?.[index];

  function addDeliverable() {
    const trimmed = deliverableInput.trim();
    if (!trimmed) return;

    // Support comma-separated input
    const items = trimmed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setValue(`milestones.${index}.deliverables`, [
      ...deliverables,
      ...items,
    ]);
    setDeliverableInput("");
  }

  function removeDeliverable(i: number) {
    setValue(
      `milestones.${index}.deliverables`,
      deliverables.filter((_, idx) => idx !== i),
    );
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-border-subtle p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">
          Milestone {index + 1}
        </p>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-text-muted hover:text-error transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <Input
        label="Title"
        placeholder="e.g. Design mockups delivered"
        error={milestoneErrors?.title?.message}
        {...register(`milestones.${index}.title`)}
      />

      <Textarea
        label="Description (optional)"
        placeholder="What needs to be delivered or completed"
        error={milestoneErrors?.description?.message}
        {...register(`milestones.${index}.description`)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Responsible party"
          error={milestoneErrors?.responsibleParty?.message}
          {...register(`milestones.${index}.responsibleParty`)}
        >
          <option value="party_a">Party A</option>
          <option value="party_b">Party B</option>
        </Select>

        <Input
          label="Due date"
          type="date"
          error={milestoneErrors?.dueDate?.message}
          {...register(`milestones.${index}.dueDate`)}
        />
      </div>

      <Input
        label="Payment amount (GBP, optional)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="e.g. 2500.00"
        error={milestoneErrors?.paymentAmount?.message}
        {...register(`milestones.${index}.paymentAmount`, {
          setValueAs: (v: string) => {
            if (v === "" || v === undefined || v === null) return undefined;
            const num = parseFloat(v);
            return isNaN(num) ? undefined : num;
          },
        })}
      />

      {/* Deliverables */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">
          Deliverables (optional)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={deliverableInput}
            onChange={(e) => setDeliverableInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDeliverable();
              }
            }}
            placeholder="Type and press Enter, or use commas to add multiple"
            className="flex-1 rounded-[var(--radius-md)] border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel"
          />
          <Button type="button" variant="secondary" size="sm" onClick={addDeliverable}>
            Add
          </Button>
        </div>
        {deliverables.length > 0 && (
          <ul className="mt-2 space-y-1">
            {deliverables.map((d, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-[var(--radius-sm)] bg-stone/50 px-3 py-1.5 text-sm text-ink"
              >
                <span>{d}</span>
                <button
                  type="button"
                  onClick={() => removeDeliverable(i)}
                  className="ml-2 text-text-muted hover:text-error transition-colors"
                  aria-label={`Remove ${d}`}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
