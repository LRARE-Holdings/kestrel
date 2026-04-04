import Link from "next/link";
import { NewLeadForm } from "./form";

export default function NewLeadPage() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link
            href="/leads"
            className="text-xs text-text-muted hover:text-kestrel transition-colors"
          >
            Leads
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-xs text-text-secondary">New lead</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-ink">
          Add new lead
        </h1>
      </div>

      {/* Form */}
      <NewLeadForm />
    </div>
  );
}
