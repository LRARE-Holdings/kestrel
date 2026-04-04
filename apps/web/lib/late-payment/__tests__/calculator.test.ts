import { describe, it, expect } from "vitest";
import {
  calculateDaysOverdue,
  getCompensationAmount,
  calculateStatutoryInterest,
  STATUTORY_RATE,
} from "../calculator";

describe("calculateDaysOverdue", () => {
  it("returns 0 when calcDate is before dueDate", () => {
    const due = new Date(2026, 3, 10); // April 10
    const calc = new Date(2026, 3, 5); // April 5
    expect(calculateDaysOverdue(due, calc)).toBe(0);
  });

  it("returns 0 when calcDate equals dueDate", () => {
    const due = new Date(2026, 3, 10);
    const calc = new Date(2026, 3, 10);
    expect(calculateDaysOverdue(due, calc)).toBe(0);
  });

  it("returns correct days when overdue", () => {
    const due = new Date(2026, 0, 1); // Jan 1
    const calc = new Date(2026, 0, 31); // Jan 31
    expect(calculateDaysOverdue(due, calc)).toBe(30);
  });

  it("handles month boundaries", () => {
    const due = new Date(2026, 0, 31); // Jan 31
    const calc = new Date(2026, 1, 28); // Feb 28
    expect(calculateDaysOverdue(due, calc)).toBe(28);
  });

  it("handles year boundaries", () => {
    const due = new Date(2025, 11, 31); // Dec 31 2025
    const calc = new Date(2026, 0, 1); // Jan 1 2026
    expect(calculateDaysOverdue(due, calc)).toBe(1);
  });
});

describe("getCompensationAmount", () => {
  it("returns 40 for debts under 1000", () => {
    expect(getCompensationAmount(0.01)).toBe(40);
    expect(getCompensationAmount(500)).toBe(40);
    expect(getCompensationAmount(999.99)).toBe(40);
  });

  it("returns 70 for debts 1000 to 9999.99", () => {
    expect(getCompensationAmount(1000)).toBe(70);
    expect(getCompensationAmount(5000)).toBe(70);
    expect(getCompensationAmount(9999.99)).toBe(70);
  });

  it("returns 100 for debts 10000 and above", () => {
    expect(getCompensationAmount(10000)).toBe(100);
    expect(getCompensationAmount(100000)).toBe(100);
  });
});

describe("calculateStatutoryInterest", () => {
  const baseRate = 3.75;

  it("returns correct annual rate", () => {
    const result = calculateStatutoryInterest(1000, new Date(), new Date(), baseRate);
    expect(result.annualRate).toBe(baseRate + STATUTORY_RATE);
    expect(result.annualRate).toBe(11.75);
  });

  it("returns correct daily rate", () => {
    const result = calculateStatutoryInterest(1000, new Date(), new Date(), baseRate);
    // 1000 * 11.75% / 365 = 0.3219... rounds to 0.32
    expect(result.dailyRate).toBe(0.32);
  });

  it("calculates interest for known period", () => {
    const due = new Date(2026, 0, 1); // Jan 1
    const calc = new Date(2026, 1, 1); // Feb 1 = 31 days
    const result = calculateStatutoryInterest(10000, due, calc, baseRate);

    expect(result.daysOverdue).toBe(31);
    expect(result.annualRate).toBe(11.75);
    // daily = 10000 * 0.1175 / 365 = 3.2191... rounds to 3.22
    expect(result.dailyRate).toBe(3.22);
    // interest = 3.22 * 31 = 99.82
    expect(result.interestAccrued).toBe(99.82);
    // compensation for 10000+ = 100
    expect(result.compensationAmount).toBe(100);
    // total = 10000 + 99.82 + 100 = 10199.82
    expect(result.totalOwed).toBe(10199.82);
  });

  it("returns zero interest when not overdue", () => {
    const due = new Date(2026, 3, 10);
    const calc = new Date(2026, 3, 5); // before due
    const result = calculateStatutoryInterest(5000, due, calc, baseRate);

    expect(result.daysOverdue).toBe(0);
    expect(result.interestAccrued).toBe(0);
    // Still includes compensation
    expect(result.compensationAmount).toBe(70);
    expect(result.totalOwed).toBe(5070);
  });

  it("statutory rate constant is 8", () => {
    expect(STATUTORY_RATE).toBe(8);
  });
});
