import type { Metadata } from "next";
import { FilingWizard } from "@/components/app/disputes/filing-wizard";

export const metadata: Metadata = {
  title: "File a dispute — Kestrel",
};

export default function NewDisputePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl text-ink">File a dispute</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Structured resolution starts here. Complete the steps below to file your
        dispute.
      </p>
      <div className="mt-8">
        <FilingWizard />
      </div>
    </div>
  );
}
