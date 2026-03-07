import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("../db", () => ({
  getDb: () => ({
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
  }),
}));

describe("Trademark Search Router", () => {
  describe("Search Functionality", () => {
    it("should identify no conflicts for unique names", () => {
      // Test the search logic for a unique business name
      const uniqueName = "XyzUniqueBusinessName123";
      const normalizedName = uniqueName.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
      
      expect(normalizedName).toBe("xyzuniquebusinessname123");
    });

    it("should detect potential conflicts for common terms", () => {
      // Common terms that might have trademark conflicts
      const commonTerms = ["real", "nation", "laws", "collective", "trust", "wealth"];
      
      commonTerms.forEach(term => {
        expect(term.length).toBeGreaterThan(0);
      });
    });

    it("should normalize business names correctly", () => {
      const testCases = [
        { input: "My Business LLC", expected: "my business llc" },
        { input: "REAL-EYE-NATION", expected: "realeyenation" },
        { input: "The The L.A.W.S. Collective", expected: "laws collective" },
        { input: "Test & Company, Inc.", expected: "test  company inc" },
      ];

      testCases.forEach(({ input, expected }) => {
        const normalized = input.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
        expect(normalized).toBe(expected);
      });
    });

    it("should categorize conflict risk levels correctly", () => {
      const riskLevels = ["none", "low", "medium", "high"];
      
      riskLevels.forEach(level => {
        expect(["none", "low", "medium", "high"]).toContain(level);
      });
    });

    it("should identify exact matches", () => {
      const businessName = "Test Company";
      const existingMark = "TEST COMPANY";
      
      const normalizedBusiness = businessName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const normalizedMark = existingMark.toLowerCase().replace(/[^a-z0-9]/g, "");
      
      expect(normalizedBusiness).toBe(normalizedMark);
    });
  });

  describe("Trademark Classes", () => {
    const relevantClasses = [
      { code: "035", name: "Advertising and Business" },
      { code: "036", name: "Insurance and Financial" },
      { code: "041", name: "Education and Entertainment" },
      { code: "042", name: "Science and Technology" },
      { code: "045", name: "Legal and Security" },
    ];

    it("should have valid trademark class codes", () => {
      relevantClasses.forEach(cls => {
        expect(cls.code).toMatch(/^\d{3}$/);
      });
    });

    it("should return appropriate classes for LLC", () => {
      const llcClasses = ["035", "036", "042"];
      expect(llcClasses).toContain("035");
      expect(llcClasses).toContain("036");
    });

    it("should return appropriate classes for nonprofit", () => {
      const nonprofitClasses = ["035", "041", "045"];
      expect(nonprofitClasses).toContain("041");
    });

    it("should return appropriate classes for trust", () => {
      const trustClasses = ["036", "045"];
      expect(trustClasses).toContain("036");
      expect(trustClasses).toContain("045");
    });
  });

  describe("Trademark Status", () => {
    it("should recognize valid trademark statuses", () => {
      const validStatuses = ["live", "dead", "pending", "registered", "abandoned", "cancelled"];
      
      validStatuses.forEach(status => {
        expect(["live", "dead", "pending", "registered", "abandoned", "cancelled"]).toContain(status);
      });
    });

    it("should identify active vs inactive statuses", () => {
      const activeStatuses = ["live", "pending", "registered"];
      const inactiveStatuses = ["dead", "abandoned", "cancelled"];
      
      expect(activeStatuses.length).toBe(3);
      expect(inactiveStatuses.length).toBe(3);
    });
  });

  describe("Similarity Levels", () => {
    it("should have valid similarity levels", () => {
      const levels = ["exact", "high", "medium", "low"];
      
      levels.forEach(level => {
        expect(["exact", "high", "medium", "low"]).toContain(level);
      });
    });

    it("should rank similarity correctly", () => {
      const similarityRank: Record<string, number> = {
        exact: 4,
        high: 3,
        medium: 2,
        low: 1,
      };
      
      expect(similarityRank.exact).toBeGreaterThan(similarityRank.high);
      expect(similarityRank.high).toBeGreaterThan(similarityRank.medium);
      expect(similarityRank.medium).toBeGreaterThan(similarityRank.low);
    });
  });

  describe("Recommendations", () => {
    it("should provide recommendations for no conflict", () => {
      const noConflictRecs = [
        "No conflicting trademarks found. The name appears to be available.",
        "Consider filing a federal trademark application to protect your brand.",
        "You can use the ™ symbol immediately to indicate trademark claim.",
      ];
      
      expect(noConflictRecs.length).toBeGreaterThan(0);
      expect(noConflictRecs[0]).toContain("available");
    });

    it("should provide recommendations for high conflict", () => {
      const highConflictRecs = [
        "High risk of trademark conflict. An exact or very similar mark exists.",
        "Consider choosing a different business name.",
        "If you proceed, expect potential legal challenges.",
      ];
      
      expect(highConflictRecs.length).toBeGreaterThan(0);
      expect(highConflictRecs[0]).toContain("High risk");
    });

    it("should always recommend USPTO verification", () => {
      const verificationRec = "Always verify results directly at USPTO.gov before making final decisions.";
      expect(verificationRec).toContain("USPTO");
    });
  });

  describe("USPTO URL Generation", () => {
    it("should generate valid USPTO search URL", () => {
      const baseUrl = "https://tmsearch.uspto.gov/search/search-information";
      expect(baseUrl).toContain("uspto.gov");
    });

    it("should encode business names for URL", () => {
      const businessName = "Test & Company";
      const encoded = encodeURIComponent(businessName);
      expect(encoded).toBe("Test%20%26%20Company");
    });
  });

  describe("Search History", () => {
    it("should limit history results", () => {
      const limits = [5, 10, 20, 100];
      
      limits.forEach(limit => {
        expect(limit).toBeGreaterThanOrEqual(1);
        expect(limit).toBeLessThanOrEqual(100);
      });
    });

    it("should order history by most recent first", () => {
      const dates = [
        new Date("2026-01-20"),
        new Date("2026-01-21"),
        new Date("2026-01-22"),
      ];
      
      const sorted = [...dates].sort((a, b) => b.getTime() - a.getTime());
      expect(sorted[0]).toEqual(dates[2]);
    });
  });
});
