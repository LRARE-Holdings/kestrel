import { describe, it, expect } from "vitest";
import { buildSarExport, sarExportFilename } from "../export";

const baseInput = {
  generatedAt: "2026-07-07T09:30:00.000Z",
  user: { id: "user-123", email: "alex@example.co.uk" },
  profile: { id: "user-123", display_name: "Alex" },
  savedDocuments: [{ id: "d1" }, { id: "d2" }],
  disputes: [{ id: "disp-1" }],
  disputeSubmissions: [],
  evidenceFiles: [{ id: "e1" }],
  notifications: [],
  handshakes: [{ id: "h1" }],
  notices: [],
  milestoneProjects: [],
  omissions: [],
};

describe("buildSarExport", () => {
  it("assembles a stable SAR structure with subject metadata", () => {
    const result = buildSarExport(baseInput);

    expect(result.export.service).toBe("Kestrel");
    expect(result.export.kind).toBe("subject_access_request");
    expect(result.export.generatedAt).toBe("2026-07-07T09:30:00.000Z");
    expect(result.export.subject).toEqual({
      userId: "user-123",
      email: "alex@example.co.uk",
    });
    expect(result.profile).toEqual({ id: "user-123", display_name: "Alex" });
  });

  it("computes counts per section", () => {
    const result = buildSarExport(baseInput);
    expect(result.export.counts.savedDocuments).toBe(2);
    expect(result.export.counts.disputes).toBe(1);
    expect(result.export.counts.evidenceFiles).toBe(1);
    expect(result.export.counts.handshakes).toBe(1);
    expect(result.export.counts.notifications).toBe(0);
  });

  it("surfaces omissions so gaps are explicit", () => {
    const result = buildSarExport({
      ...baseInput,
      omissions: ["notices: could not be read"],
    });
    expect(result.export.omissions).toContain("notices: could not be read");
  });

  it("tolerates missing arrays without throwing", () => {
    const result = buildSarExport({
      ...baseInput,
      // @ts-expect-error deliberately passing undefined to check resilience
      savedDocuments: undefined,
      // @ts-expect-error deliberately passing undefined to check resilience
      notifications: undefined,
    });
    expect(result.savedDocuments).toEqual([]);
    expect(result.export.counts.savedDocuments).toBe(0);
  });

  it("preserves a null profile", () => {
    const result = buildSarExport({ ...baseInput, profile: null });
    expect(result.profile).toBeNull();
  });
});

describe("sarExportFilename", () => {
  it("derives a dated filename from the ISO timestamp", () => {
    expect(sarExportFilename("2026-07-07T09:30:00.000Z")).toBe(
      "kestrel-data-export-2026-07-07.json",
    );
  });

  it("falls back gracefully for an empty timestamp", () => {
    expect(sarExportFilename("")).toBe("kestrel-data-export-export.json");
  });
});
