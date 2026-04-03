import type { Metadata } from "next";
import { IconScale } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Disputes — Kestrel",
};

export default function DisputesPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Disputes</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Structured resolution for business disagreements.
      </p>

      <div className="mt-16 flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-kestrel/8">
          <IconScale className="h-8 w-8 text-kestrel" />
        </div>
        <h2 className="mt-6 font-display text-xl text-ink">
          Dispute resolution is coming soon
        </h2>
        <p className="mt-2 max-w-md text-sm text-text-secondary">
          When a disagreement arises, Kestrel will guide both parties through a
          structured process — documented timelines, evidence uploads, and clear
          escalation paths. No solicitors needed at first contact.
        </p>
      </div>
    </div>
  );
}
