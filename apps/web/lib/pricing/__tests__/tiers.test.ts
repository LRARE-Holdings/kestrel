/**
 * Unit tests for the pure pricing core.
 *
 * Every test pins a single behaviour from PRICING.md §4 or §5. If any test
 * fails after a config change, that's a signal to update PRICING.md and
 * memory/DECISIONS.md alongside the code.
 *
 * Run with:
 *   cd apps/web && npx vitest run lib/pricing
 */

import { describe, expect, it } from "vitest";
import {
  YEAR_1_TIERS,
  GOOD_FAITH_REFUND_DAYS,
  RESPONDENT_PAYMENT_WINDOW_DAYS,
  MIN_SUBSTANTIVE_RESPONSE_WORDS,
} from "@kestrel/shared/pricing/config";
import {
  evaluateGoodFaithRefund,
  quoteFee,
  quoteTierBump,
  quoteWithdrawalRefund,
  resolveTier,
} from "../tiers";
import { formatGBP, formatGBPCompact, formatTierRange } from "../format";

// ---------------------------------------------------------------------------
// resolveTier — boundary cases
// ---------------------------------------------------------------------------

describe("resolveTier", () => {
  it("returns small for null/undefined/zero values", () => {
    expect(resolveTier(null)).toBe("small");
    expect(resolveTier(undefined)).toBe("small");
    expect(resolveTier(0)).toBe("small");
  });

  it("returns small for £999 (just below the small/standard boundary)", () => {
    expect(resolveTier(99_900)).toBe("small");
  });

  it("returns standard exactly on the £1,000 boundary (inclusive lower)", () => {
    expect(resolveTier(100_000)).toBe("standard");
  });

  it("returns standard for £9,999.99", () => {
    expect(resolveTier(999_999)).toBe("standard");
  });

  it("returns larger exactly on the £10,000 boundary", () => {
    expect(resolveTier(1_000_000)).toBe("larger");
  });

  it("returns larger for £24,999.99", () => {
    expect(resolveTier(2_499_999)).toBe("larger");
  });

  it("returns complex exactly on the £25,000 boundary", () => {
    expect(resolveTier(2_500_000)).toBe("complex");
  });

  it("returns complex for very large amounts", () => {
    expect(resolveTier(100_000_000)).toBe("complex"); // £1,000,000
  });

  it("throws on negative values", () => {
    expect(() => resolveTier(-100)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// quoteFee — flat tiers
// ---------------------------------------------------------------------------

describe("quoteFee — flat tiers", () => {
  it("Small tier is £35 per party", () => {
    const q = quoteFee("small", 50_000); // £500
    expect(q.tierId).toBe("small");
    expect(q.perPartyPence).toBe(3_500);
    expect(q.totalPence).toBe(7_000);
  });

  it("Standard tier is £75 per party", () => {
    const q = quoteFee("standard", 500_000); // £5,000
    expect(q.perPartyPence).toBe(7_500);
    expect(q.totalPence).toBe(15_000);
  });

  it("Larger tier is £150 per party", () => {
    const q = quoteFee("larger", 1_500_000); // £15,000
    expect(q.perPartyPence).toBe(15_000);
    expect(q.totalPence).toBe(30_000);
  });
});

// ---------------------------------------------------------------------------
// quoteFee — Complex tier marginal logic
// ---------------------------------------------------------------------------

describe("quoteFee — complex tier", () => {
  it("returns the £250 base when value equals the £25k threshold", () => {
    const q = quoteFee("complex", 2_500_000);
    expect(q.perPartyPence).toBe(25_000); // £250.00
  });

  it("adds 0.5% marginal above £25k", () => {
    // £30,000 dispute = £250 base + 0.5% × £5,000 = £250 + £25 = £275
    const q = quoteFee("complex", 3_000_000);
    expect(q.perPartyPence).toBe(27_500);
    expect(q.totalPence).toBe(55_000);
  });

  it("rounds the marginal to whole pence", () => {
    // £25,001 dispute = £250 base + 0.5% × £1 = £250 + 0.5p → rounds to £250.01 (1p)
    const q = quoteFee("complex", 2_500_100);
    // 0.5% of 100p = 0.5p → Math.round → 1p
    expect(q.perPartyPence).toBe(25_001);
  });

  it("caps the per-party fee at £1,500", () => {
    // £325,000 dispute = £250 + 0.5% × £300,000 = £250 + £1,500 = £1,750 → capped at £1,500
    const q = quoteFee("complex", 32_500_000);
    expect(q.perPartyPence).toBe(150_000); // £1,500.00
    expect(q.totalPence).toBe(300_000); // £3,000.00
  });

  it("caps very large disputes at £1,500", () => {
    const q = quoteFee("complex", 100_000_000); // £1,000,000
    expect(q.perPartyPence).toBe(150_000);
  });

  it("explanation mentions the cap when capped", () => {
    const q = quoteFee("complex", 50_000_000);
    expect(q.explanation.toLowerCase()).toContain("cap");
  });
});

describe("quoteFee — error handling", () => {
  it("throws on unknown tier id", () => {
    // @ts-expect-error testing runtime guard with bad input
    expect(() => quoteFee("nonsense", 1000)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// quoteTierBump
// ---------------------------------------------------------------------------

describe("quoteTierBump", () => {
  it("returns 0 when fromTier equals toTier", () => {
    const q = quoteTierBump({
      fromTier: "standard",
      toTier: "standard",
      fromValuePence: 500_000,
      toValuePence: 500_000,
    });
    expect(q.topUpPence).toBe(0);
  });

  it("returns 0 when bumped downward", () => {
    const q = quoteTierBump({
      fromTier: "larger",
      toTier: "standard",
      fromValuePence: 1_500_000,
      toValuePence: 500_000,
    });
    expect(q.topUpPence).toBe(0);
  });

  it("charges the difference when bumped from small to standard", () => {
    // Originally declared small (≤£1,000), claimant paid £35.
    // Respondent contests value upward to £1,500 → standard tier (£75).
    // Top-up: £75 − £35 = £40.
    const q = quoteTierBump({
      fromTier: "small",
      toTier: "standard",
      fromValuePence: 50_000, // £500 originally
      toValuePence: 150_000, // £1,500 contested
    });
    expect(q.topUpPence).toBe(4_000); // £40.00
  });

  it("charges the difference from standard to complex with marginal", () => {
    // Originally £5k → standard, paid £75. Bumped to £30k → complex.
    // New fee: £250 + 0.5% × £5,000 = £275. Top-up: £275 − £75 = £200.
    const q = quoteTierBump({
      fromTier: "standard",
      toTier: "complex",
      fromValuePence: 500_000,
      toValuePence: 3_000_000,
    });
    expect(q.topUpPence).toBe(20_000); // £200.00
  });
});

// ---------------------------------------------------------------------------
// evaluateGoodFaithRefund
// ---------------------------------------------------------------------------

describe("evaluateGoodFaithRefund", () => {
  it("approves when all four conditions pass", () => {
    const r = evaluateGoodFaithRefund({
      paidWithinDays: 5,
      engagementWords: 200,
      resolvedWithinDays: 7,
      refundAlreadyIssued: false,
    });
    expect(r.eligible).toBe(true);
    expect(r.reasons.paidInTime).toBe(true);
    expect(r.reasons.engagedSubstantively).toBe(true);
    expect(r.reasons.resolvedInTime).toBe(true);
    expect(r.reasons.notAlreadyRefunded).toBe(true);
  });

  it("rejects when respondent paid late", () => {
    const r = evaluateGoodFaithRefund({
      paidWithinDays: RESPONDENT_PAYMENT_WINDOW_DAYS + 1,
      engagementWords: 200,
      resolvedWithinDays: 7,
      refundAlreadyIssued: false,
    });
    expect(r.eligible).toBe(false);
    expect(r.reasons.paidInTime).toBe(false);
  });

  it("rejects when engagement is below the substantive threshold", () => {
    const r = evaluateGoodFaithRefund({
      paidWithinDays: 5,
      engagementWords: MIN_SUBSTANTIVE_RESPONSE_WORDS - 1,
      resolvedWithinDays: 7,
      refundAlreadyIssued: false,
    });
    expect(r.eligible).toBe(false);
    expect(r.reasons.engagedSubstantively).toBe(false);
  });

  it("rejects when resolved outside the refund window", () => {
    const r = evaluateGoodFaithRefund({
      paidWithinDays: 5,
      engagementWords: 200,
      resolvedWithinDays: GOOD_FAITH_REFUND_DAYS + 1,
      refundAlreadyIssued: false,
    });
    expect(r.eligible).toBe(false);
    expect(r.reasons.resolvedInTime).toBe(false);
  });

  it("rejects when a refund has already been issued", () => {
    const r = evaluateGoodFaithRefund({
      paidWithinDays: 5,
      engagementWords: 200,
      resolvedWithinDays: 7,
      refundAlreadyIssued: true,
    });
    expect(r.eligible).toBe(false);
    expect(r.reasons.notAlreadyRefunded).toBe(false);
  });

  it("rejects when respondent has not paid yet (paidWithinDays = null)", () => {
    const r = evaluateGoodFaithRefund({
      paidWithinDays: null,
      engagementWords: 200,
      resolvedWithinDays: 7,
      refundAlreadyIssued: false,
    });
    expect(r.eligible).toBe(false);
    expect(r.reasons.paidInTime).toBe(false);
  });

  it("rejects when respondent has not submitted a response yet", () => {
    const r = evaluateGoodFaithRefund({
      paidWithinDays: 5,
      engagementWords: null,
      resolvedWithinDays: 7,
      refundAlreadyIssued: false,
    });
    expect(r.eligible).toBe(false);
    expect(r.reasons.engagedSubstantively).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// quoteWithdrawalRefund
// ---------------------------------------------------------------------------

describe("quoteWithdrawalRefund", () => {
  it("returns full refund minus £5 retention before respondent notification", () => {
    const r = quoteWithdrawalRefund({
      paidPence: 7_500, // £75 standard tier
      respondentNotified: false,
    });
    expect(r.refundPence).toBe(7_000); // £70
    expect(r.reason).toMatch(/retention/i);
  });

  it("returns 0 after respondent notification", () => {
    const r = quoteWithdrawalRefund({
      paidPence: 7_500,
      respondentNotified: true,
    });
    expect(r.refundPence).toBe(0);
  });

  it("returns 0 when no payment was made", () => {
    const r = quoteWithdrawalRefund({
      paidPence: 0,
      respondentNotified: false,
    });
    expect(r.refundPence).toBe(0);
  });

  it("never returns a negative refund (small payment, big retention)", () => {
    const r = quoteWithdrawalRefund({
      paidPence: 100, // £1
      respondentNotified: false,
    });
    expect(r.refundPence).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// formatters
// ---------------------------------------------------------------------------

describe("formatGBP", () => {
  it("formats whole pence amounts with two decimal places", () => {
    expect(formatGBP(0)).toBe("£0.00");
    expect(formatGBP(3_500)).toBe("£35.00");
    expect(formatGBP(150_000)).toBe("£1,500.00");
    expect(formatGBP(100_000_000)).toBe("£1,000,000.00");
  });
});

describe("formatGBPCompact", () => {
  it("omits decimals on whole pounds", () => {
    expect(formatGBPCompact(3_500)).toBe("£35");
    expect(formatGBPCompact(150_000)).toBe("£1,500");
  });

  it("includes decimals when there is a pence component", () => {
    expect(formatGBPCompact(3_550)).toBe("£35.50");
  });
});

describe("formatTierRange", () => {
  it("formats small as 'Up to £1,000'", () => {
    expect(formatTierRange("small")).toBe("Up to £1,000");
  });

  it("formats standard as a range", () => {
    expect(formatTierRange("standard")).toBe("£1,000–£10,000");
  });

  it("formats larger as a range", () => {
    expect(formatTierRange("larger")).toBe("£10,000–£25,000");
  });

  it("formats complex as an open-ended range", () => {
    expect(formatTierRange("complex")).toBe("£25,000+");
  });
});

// ---------------------------------------------------------------------------
// Sanity check that the YEAR_1_TIERS export hasn't drifted
// ---------------------------------------------------------------------------

describe("YEAR_1_TIERS configuration sanity", () => {
  it("has exactly four tiers in increasing order", () => {
    expect(YEAR_1_TIERS).toHaveLength(4);
    expect(YEAR_1_TIERS.map((t) => t.id)).toEqual([
      "small",
      "standard",
      "larger",
      "complex",
    ]);
  });

  it("tier value ranges are contiguous and non-overlapping", () => {
    for (let i = 1; i < YEAR_1_TIERS.length; i++) {
      expect(YEAR_1_TIERS[i].minValuePence).toBe(
        YEAR_1_TIERS[i - 1].maxValuePence,
      );
    }
  });

  it("the last tier has no upper bound", () => {
    expect(YEAR_1_TIERS[YEAR_1_TIERS.length - 1].maxValuePence).toBeNull();
  });

  it("only the Complex tier has a marginal rate and cap", () => {
    expect(YEAR_1_TIERS[3].marginalRate).toBe(0.005);
    expect(YEAR_1_TIERS[3].perPartyCapPence).toBe(150_000);
    expect(YEAR_1_TIERS[0].marginalRate).toBeUndefined();
    expect(YEAR_1_TIERS[1].marginalRate).toBeUndefined();
    expect(YEAR_1_TIERS[2].marginalRate).toBeUndefined();
  });
});
