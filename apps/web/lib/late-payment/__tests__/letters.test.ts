import { describe, it, expect } from "vitest";
import { generateLetter } from "../letters";
import type { LetterInput } from "../schemas";

const baseInput: LetterInput = {
  creditor: {
    name: "Jane Smith",
    businessName: "Smith Consulting Ltd",
    address: "123 High St, Newcastle, NE1 1AA",
    email: "jane@smith.co.uk",
  },
  debtor: {
    name: "John Doe",
    businessName: "Doe Industries Ltd",
    address: "456 Market St, London, EC1A 1BB",
    email: "john@doe.co.uk",
  },
  invoiceNumber: "INV-2026-001",
  invoiceDate: "2026-01-01",
  amountOwed: 5000,
  paymentTermsDays: 30,
  includeKestrelClause: true,
  letterStage: 1,
};

describe("generateLetter", () => {
  it("generates stage 1 friendly reminder", () => {
    const result = generateLetter({ ...baseInput, letterStage: 1 }, { baseRate: 3.75 });
    expect(result.stage).toBe(1);
    expect(result.stageName).toBe("Friendly Reminder");
    expect(result.subject).toContain("INV-2026-001");
    expect(result.body).toContain("remind you");
    expect(result.body).toContain("Smith Consulting Ltd");
  });

  it("generates stage 2 firm reminder", () => {
    const result = generateLetter({ ...baseInput, letterStage: 2 }, { baseRate: 3.75 });
    expect(result.stage).toBe(2);
    expect(result.stageName).toBe("Firm Reminder");
    expect(result.body).toContain("urgent");
  });

  it("generates stage 3 letter before action with interest", () => {
    const result = generateLetter({ ...baseInput, letterStage: 3 }, { baseRate: 3.75 });
    expect(result.stage).toBe(3);
    expect(result.body).toContain("LETTER BEFORE ACTION");
    expect(result.body).toContain("Late Payment of Commercial Debts");
    expect(result.body).toContain("11.75%"); // 3.75 + 8
  });

  it("generates stage 4 notice of intent", () => {
    const result = generateLetter({ ...baseInput, letterStage: 4 }, { baseRate: 3.75 });
    expect(result.stage).toBe(4);
    expect(result.body).toContain("NOTICE OF INTENT");
    expect(result.body).toContain("County Court");
  });

  it("includes Kestrel clause when enabled", () => {
    const withClause = generateLetter(
      { ...baseInput, includeKestrelClause: true },
      { baseRate: 3.75 },
    );
    const withoutClause = generateLetter(
      { ...baseInput, includeKestrelClause: false },
      { baseRate: 3.75 },
    );

    expect(withClause.body).toContain("Kestrel");
    expect(withoutClause.body).not.toContain("Kestrel");
  });

  it("includes previous correspondence dates when provided", () => {
    const result = generateLetter(
      {
        ...baseInput,
        letterStage: 2,
        previousCorrespondenceDates: ["2026-02-01", "2026-02-15"],
      },
      { baseRate: 3.75 },
    );

    expect(result.body).toContain("previous correspondence");
    expect(result.body).toContain("1 February 2026");
    expect(result.body).toContain("15 February 2026");
  });

  it("formats currency correctly as GBP", () => {
    const result = generateLetter(
      { ...baseInput, amountOwed: 1234.56 },
      { baseRate: 3.75 },
    );

    expect(result.body).toContain("1,234.56");
  });
});
