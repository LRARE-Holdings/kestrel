import { describe, it, expect } from "vitest";
import { assembleTerms, termsToMarkdown, termsToHtml } from "../assembler";

const baseBusiness = {
  businessName: "Acme Ltd",
  tradingName: "",
  registeredAddress: "123 High St",
  companyNumber: "12345678",
  businessStructure: "limited_company" as const,
  websiteUrl: "https://acme.co.uk",
  contactEmail: "hello@acme.co.uk",
};

describe("assembleTerms", () => {
  it("assembles ecommerce terms with correct title", () => {
    const result = assembleTerms("ecommerce", {
      business: baseBusiness,
      privacyPolicyUrl: "",
      includeDisputeClause: true,
      productType: "physical",
      deliveryScope: "uk_only",
      returnsPolicy: "statutory",
      extendedReturnsDays: 30,
      pricesIncludeVat: true,
      ageRestrictions: false,
      ageRestrictionDetails: "",
    });

    expect(result.title).toBe("Terms and Conditions");
    expect(result.businessName).toBe("Acme Ltd");
    expect(result.businessType).toBe("ecommerce");
    expect(result.sections.length).toBeGreaterThan(0);
  });

  it("uses trading name when provided", () => {
    const result = assembleTerms("ecommerce", {
      business: { ...baseBusiness, tradingName: "Acme Store" },
      privacyPolicyUrl: "",
      includeDisputeClause: true,
      productType: "physical",
      deliveryScope: "uk_only",
      returnsPolicy: "statutory",
      extendedReturnsDays: 30,
      pricesIncludeVat: true,
      ageRestrictions: false,
      ageRestrictionDetails: "",
    });

    expect(result.businessName).toBe("Acme Store");
  });

  it("assembles SaaS terms", () => {
    const result = assembleTerms("saas", {
      business: baseBusiness,
      privacyPolicyUrl: "https://acme.co.uk/privacy",
      includeDisputeClause: false,
      hasFreeTier: true,
      trialPeriodDays: 14,
      billingCycle: "monthly",
      autoRenewal: true,
      dataHostingLocation: "United Kingdom",
      uptimeCommitment: "99.9",
    });

    expect(result.title).toBe("Terms of Service");
    expect(result.includesDisputeClause).toBe(false);
  });

  it("numbers sections from 1", () => {
    const result = assembleTerms("professional", {
      business: baseBusiness,
      privacyPolicyUrl: "",
      includeDisputeClause: true,
      serviceDescription: "Consulting services for business strategy",
      paymentTermsDays: 30,
      liabilityCapMultiple: 2,
      confidentiality: true,
      ipOwnership: "client",
    });

    expect(result.sections[0].number).toBe("1");
    result.sections.forEach((s, i) => {
      expect(s.number).toBe(String(i + 1));
    });
  });
});

describe("termsToMarkdown", () => {
  it("produces valid markdown with headings", () => {
    const terms = assembleTerms("professional", {
      business: baseBusiness,
      privacyPolicyUrl: "",
      includeDisputeClause: false,
      serviceDescription: "Consulting services for business strategy",
      paymentTermsDays: 30,
      liabilityCapMultiple: 2,
      confidentiality: true,
      ipOwnership: "client",
    });

    const md = termsToMarkdown(terms);
    expect(md).toContain("# ");
    expect(md).toContain("## ");
    expect(md).toContain("Acme Ltd");
  });
});

describe("termsToHtml", () => {
  it("produces valid HTML structure", () => {
    const terms = assembleTerms("professional", {
      business: baseBusiness,
      privacyPolicyUrl: "",
      includeDisputeClause: false,
      serviceDescription: "Consulting services for business strategy",
      paymentTermsDays: 30,
      liabilityCapMultiple: 2,
      confidentiality: true,
      ipOwnership: "client",
    });

    const html = termsToHtml(terms);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<h1>");
    expect(html).toContain("</html>");
  });
});
