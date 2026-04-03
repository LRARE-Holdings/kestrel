"use client";

import { useState, useEffect } from "react";
import { saveDocument } from "@/lib/documents/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type DocumentType = Database["public"]["Enums"]["document_type"];

interface SaveDocumentButtonProps {
  documentType: DocumentType;
  title: string;
  configuration: Record<string, unknown>;
  clauseVersions?: Record<string, unknown>;
  includesDisputeClause: boolean;
}

export function SaveDocumentButton({
  documentType,
  title,
  configuration,
  clauseVersions,
  includesDisputeClause,
}: SaveDocumentButtonProps) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthed(!!user);
    });
  }, []);

  if (!isAuthed) return null;

  async function handleSave() {
    setSaving(true);
    setError(null);

    const result = await saveDocument({
      document_type: documentType,
      title,
      configuration,
      clause_versions: clauseVersions,
      includes_dispute_clause: includesDisputeClause,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
    }
    setSaving(false);
  }

  if (saved) {
    return (
      <Button variant="secondary" size="sm" disabled>
        Saved to dashboard
      </Button>
    );
  }

  return (
    <div>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save to dashboard"}
      </Button>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
