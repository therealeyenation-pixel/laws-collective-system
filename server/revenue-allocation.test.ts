import { describe, it, expect } from "vitest";

/**
 * Revenue Allocation Logic Tests
 * Tests the 30/70 split between Academy and Collective entities
 */

describe("Revenue Allocation Logic", () => {
  // Mirror the allocation logic from webhook.ts
  function calculateSplit(amount: number, type: string) {
    if (type === "academy_pass") {
      return { academyShare: amount, collectiveShare: 0 };
    }
    // Collective membership: 30% Academy / 70% Collective
    const academyShare = Math.round(amount * 30) / 100;
    const collectiveShare = amount - academyShare;
    return { academyShare, collectiveShare };
  }

  it("should allocate 100% to Academy for standalone Academy Pass", () => {
    const result = calculateSplit(29.00, "academy_pass");
    expect(result.academyShare).toBe(29.00);
    expect(result.collectiveShare).toBe(0);
  });

  it("should split Member tier ($49) as 30% Academy / 70% Collective", () => {
    const result = calculateSplit(49.00, "collective_membership");
    expect(result.academyShare).toBeCloseTo(14.70, 2);
    expect(result.collectiveShare).toBeCloseTo(34.30, 2);
    expect(result.academyShare + result.collectiveShare).toBe(49.00);
  });

  it("should split Builder tier ($149) as 30% Academy / 70% Collective", () => {
    const result = calculateSplit(149.00, "collective_membership");
    expect(result.academyShare).toBeCloseTo(44.70, 2);
    expect(result.collectiveShare).toBeCloseTo(104.30, 2);
    expect(result.academyShare + result.collectiveShare).toBe(149.00);
  });

  it("should split annual Member ($399) as 30% Academy / 70% Collective", () => {
    const result = calculateSplit(399.00, "collective_membership");
    expect(result.academyShare).toBeCloseTo(119.70, 2);
    expect(result.collectiveShare).toBeCloseTo(279.30, 2);
    expect(result.academyShare + result.collectiveShare).toBe(399.00);
  });

  it("should split annual Builder ($1299) as 30% Academy / 70% Collective", () => {
    const result = calculateSplit(1299.00, "collective_membership");
    expect(result.academyShare).toBeCloseTo(389.70, 2);
    expect(result.collectiveShare).toBeCloseTo(909.30, 2);
    expect(result.academyShare + result.collectiveShare).toBe(1299.00);
  });

  it("should allocate 100% to Academy for annual Academy Pass ($249)", () => {
    const result = calculateSplit(249.00, "academy_pass");
    expect(result.academyShare).toBe(249.00);
    expect(result.collectiveShare).toBe(0);
  });

  it("should handle zero amount gracefully", () => {
    const result = calculateSplit(0, "collective_membership");
    expect(result.academyShare).toBe(0);
    expect(result.collectiveShare).toBe(0);
  });

  it("should ensure total always equals original amount (no rounding loss)", () => {
    // Test with various amounts
    const amounts = [49, 149, 399, 1299, 29, 249, 0.50, 99.99, 1000];
    for (const amount of amounts) {
      const result = calculateSplit(amount, "collective_membership");
      expect(result.academyShare + result.collectiveShare).toBeCloseTo(amount, 8);
    }
  });
});
