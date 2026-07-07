import { describe, it, expect } from "vitest";
import { renderSavedDocument, type SavedDocumentRow } from "../render";

const party = {
  name: "Jane Smith",
  businessName: "Smith Ltd",
  address: "123 High St, Newcastle, NE1 1AA",
  email: "jane@smith.co.uk",
};

function row(overrides: Partial<SavedDocumentRow>): SavedDocumentRow {
  return {
    id: "doc-1",
    document_type: "contract",
    title: "Freelancer Service Agreement",
    configuration: {},
    clause_versions: {},
    includes_dispute_clause: true,
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("renderSavedDocument", () => {
  it("re-renders a contract by recovering its type from the saved title", () => {
    const result = renderSavedDocument(
      row({
        document_type: "contract",
        title: "Freelancer Service Agreement",
        configuration: {
          partyA: party,
          partyB: { ...party, name: "John Doe", businessName: "Doe Ltd", email: "john@doe.co.uk" },
          effectiveDate: "2026-04-01",
          serviceDescription: "Web development services for the client site",
          deliverables: ["Website"],
          paymentType: "fixed",
          paymentAmount: 5000,
          paymentTermsDays: 30,
          ipOwnership: "client",
          confidentiality: true,
          confidentialityDurationMonths: 24,
          terminationNoticeDays: 14,
          includeKestrelClause: true,
        },
      }),
      4,
    );

    expect(result.kind).toBe("contract");
    expect(result.editHref).toBe("/tools/contracts/freelancer");
    expect(result.contractDoc).toBeDefined();
    expect(result.plainText).toContain("FREELANCER SERVICE AGREEMENT");
  });

  it("re-renders terms and infers the business type from the configuration", () => {
    const result = renderSavedDocument(
      row({
        document_type: "terms_and_conditions",
        title: "Terms & Conditions — Smith Ltd",
        configuration: {
          business: {
            businessName: "Smith Ltd",
            registeredAddress: "123 High St, Newcastle, NE1 1AA",
            businessStructure: "limited_company",
            contactEmail: "jane@smith.co.uk",
          },
          productType: "physical",
          deliveryScope: "uk_only",
          returnsPolicy: "statutory",
          pricesIncludeVat: true,
          ageRestrictions: false,
          includeDisputeClause: true,
        },
      }),
      4,
    );

    expect(result.kind).toBe("terms");
    expect(result.editHref).toBe("/tools/terms/ecommerce");
    expect(result.termsDoc).toBeDefined();
  });

  it("re-renders a late-payment letter deterministically", () => {
    const result = renderSavedDocument(
      row({
        document_type: "late_payment_letter",
        title: "Friendly Reminder — Doe Ltd",
        configuration: {
          creditor: party,
          debtor: { ...party, name: "John Doe", businessName: "Doe Ltd", email: "john@doe.co.uk" },
          invoiceNumber: "INV-001",
          invoiceDate: "2026-05-01",
          amountOwed: 1200,
          paymentTermsDays: 30,
          letterStage: 1,
          includeKestrelClause: true,
        },
      }),
      4,
    );

    expect(result.kind).toBe("letter");
    expect(result.editHref).toBe("/tools/late-payment/letters");
    expect(result.letterDoc).toBeDefined();
    expect(result.subtitle).toContain("Stage 1");
  });

  it("degrades to 'unavailable' for an unknown document type", () => {
    const result = renderSavedDocument(
      row({ document_type: "handshake", title: "Some handshake" }),
      4,
    );
    expect(result.kind).toBe("unavailable");
    expect(result.reason).toBeTruthy();
  });

  it("degrades gracefully when a contract's configuration is legacy/invalid", () => {
    const result = renderSavedDocument(
      row({
        document_type: "contract",
        title: "Freelancer Service Agreement",
        configuration: { partyA: party }, // missing required fields
      }),
      4,
    );
    expect(result.kind).toBe("unavailable");
    expect(result.editHref).toBe("/tools/contracts/freelancer");
  });
});
