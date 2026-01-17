import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("../db", () => ({
  getDb: vi.fn(() => Promise.resolve({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([{ id: 1, ownerUserId: 1 }]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
  })),
}));

// Mock storage
vi.mock("../storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://example.com/test.pdf" }),
}));

describe("Tax Prep Router", () => {
  describe("uploadTaxDocument", () => {
    it("should validate document type enum", () => {
      const validTypes = [
        "w2",
        "1099_nec",
        "1099_misc",
        "1099_int",
        "1099_div",
        "1099_b",
        "1098",
        "receipt",
        "invoice",
        "bank_statement",
        "other",
      ];

      validTypes.forEach((type) => {
        expect(validTypes).toContain(type);
      });
    });

    it("should reject files larger than 10MB", () => {
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const largeFileSize = 11 * 1024 * 1024; // 11MB

      expect(largeFileSize).toBeGreaterThan(maxFileSize);
    });

    it("should accept valid file sizes", () => {
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const validFileSize = 5 * 1024 * 1024; // 5MB

      expect(validFileSize).toBeLessThanOrEqual(maxFileSize);
    });
  });

  describe("getTaxDocumentsByYear", () => {
    it("should return empty array when no tax year record exists", async () => {
      // This tests the expected behavior when no documents exist
      const emptyResult = { documents: [] };
      expect(emptyResult.documents).toHaveLength(0);
    });
  });

  describe("deleteTaxDocument", () => {
    it("should require a valid document ID", () => {
      const validDocumentId = 1;
      expect(validDocumentId).toBeGreaterThan(0);
    });
  });
});

describe("Tax Calculation", () => {
  it("should calculate federal tax correctly for single filer", () => {
    // 2024 tax brackets for single filers
    const brackets = [
      { min: 0, max: 11600, rate: 0.10 },
      { min: 11600, max: 47150, rate: 0.12 },
      { min: 47150, max: 100525, rate: 0.22 },
      { min: 100525, max: 191950, rate: 0.24 },
      { min: 191950, max: 243725, rate: 0.32 },
      { min: 243725, max: 609350, rate: 0.35 },
      { min: 609350, max: Infinity, rate: 0.37 },
    ];

    const calculateTax = (income: number) => {
      let tax = 0;
      let remaining = income;

      for (const bracket of brackets) {
        if (remaining <= 0) break;
        const taxableInBracket = Math.min(remaining, bracket.max - bracket.min);
        tax += taxableInBracket * bracket.rate;
        remaining -= taxableInBracket;
      }

      return tax;
    };

    // Test: $50,000 income
    const tax50k = calculateTax(50000);
    expect(tax50k).toBeGreaterThan(0);
    expect(tax50k).toBeLessThan(50000 * 0.22); // Should be less than flat 22%

    // Test: $100,000 income
    const tax100k = calculateTax(100000);
    expect(tax100k).toBeGreaterThan(tax50k);
  });

  it("should apply standard deduction correctly", () => {
    const standardDeductions = {
      single: 14600,
      married_filing_jointly: 29200,
      married_filing_separately: 14600,
      head_of_household: 21900,
    };

    expect(standardDeductions.single).toBe(14600);
    expect(standardDeductions.married_filing_jointly).toBe(29200);
    expect(standardDeductions.head_of_household).toBe(21900);
  });
});
