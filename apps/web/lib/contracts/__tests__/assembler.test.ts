import { describe, it, expect } from "vitest";
import { assembleContract, renderDocumentToText } from "../assembler";

const baseParty = {
  name: "Jane Smith",
  businessName: "Smith Ltd",
  address: "123 High St, Newcastle, NE1 1AA",
  email: "jane@smith.co.uk",
};

describe("assembleContract", () => {
  it("assembles a freelancer contract with correct title", () => {
    const result = assembleContract("freelancer", {
      partyA: baseParty,
      partyB: { ...baseParty, name: "John Doe", businessName: "Doe Ltd", email: "john@doe.co.uk" },
      effectiveDate: "2026-04-01",
      serviceDescription: "Web development services for client website",
      deliverables: ["Website", "Documentation"],
      paymentType: "fixed",
      paymentAmount: 5000,
      paymentTermsDays: 30,
      ipOwnership: "client",
      confidentiality: true,
      confidentialityDurationMonths: 24,
      terminationNoticeDays: 14,
      includeKestrelClause: true,
    });

    expect(result.title).toBe("Freelancer Service Agreement");
    expect(result.parties.a.businessName).toBe("Smith Ltd");
    expect(result.parties.b.businessName).toBe("Doe Ltd");
    expect(result.includesDisputeClause).toBe(true);
    expect(result.sections.length).toBeGreaterThan(0);
    expect(result.date).toBe("1 April 2026");
  });

  it("excludes dispute clause when toggled off", () => {
    const withClause = assembleContract("nda", {
      partyA: baseParty,
      partyB: baseParty,
      effectiveDate: "2026-04-01",
      confidentialInfoDescription: "All trade secrets and proprietary business information",
      obligations: "Keep all information confidential and secure",
      durationMonths: 24,
      exceptions: "",
      includeKestrelClause: true,
    });

    const withoutClause = assembleContract("nda", {
      partyA: baseParty,
      partyB: baseParty,
      effectiveDate: "2026-04-01",
      confidentialInfoDescription: "All trade secrets and proprietary business information",
      obligations: "Keep all information confidential and secure",
      durationMonths: 24,
      exceptions: "",
      includeKestrelClause: false,
    });

    expect(withClause.includesDisputeClause).toBe(true);
    expect(withoutClause.includesDisputeClause).toBe(false);
    // Should have one fewer section without the dispute clause
    expect(withClause.sections.length).toBe(withoutClause.sections.length + 1);
  });

  it("numbers sections sequentially starting at 1", () => {
    const result = assembleContract("nda", {
      partyA: baseParty,
      partyB: baseParty,
      effectiveDate: "2026-04-01",
      confidentialInfoDescription: "All trade secrets and proprietary business information",
      obligations: "Keep all information confidential and secure",
      durationMonths: 12,
      exceptions: "",
      includeKestrelClause: false,
    });

    result.sections.forEach((section, index) => {
      expect(section.number).toBe(`${index + 1}`);
    });
  });
});

describe("renderDocumentToText", () => {
  it("includes title in uppercase", () => {
    const doc = assembleContract("nda", {
      partyA: baseParty,
      partyB: baseParty,
      effectiveDate: "2026-04-01",
      confidentialInfoDescription: "All trade secrets and proprietary business information",
      obligations: "Keep all information confidential and secure",
      durationMonths: 12,
      exceptions: "",
      includeKestrelClause: false,
    });

    const text = renderDocumentToText(doc);
    expect(text).toContain("NON-DISCLOSURE AGREEMENT (MUTUAL)");
    expect(text).toContain("Smith Ltd");
  });

  it("includes Kestrel disclaimer", () => {
    const doc = assembleContract("nda", {
      partyA: baseParty,
      partyB: baseParty,
      effectiveDate: "2026-04-01",
      confidentialInfoDescription: "All trade secrets and proprietary business information",
      obligations: "Keep all information confidential and secure",
      durationMonths: 12,
      exceptions: "",
      includeKestrelClause: false,
    });

    const text = renderDocumentToText(doc);
    expect(text).toContain("Kestrel");
    expect(text).toContain("reviewed by a qualified legal professional");
  });
});
