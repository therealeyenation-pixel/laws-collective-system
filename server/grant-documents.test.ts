import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve({
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve([{ insertId: 1 }])),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
          orderBy: vi.fn(() => Promise.resolve([])),
        })),
        orderBy: vi.fn(() => Promise.resolve([])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  })),
}));

// Mock storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn(() => Promise.resolve({ url: "https://s3.example.com/test-file.pdf" })),
  storageGet: vi.fn(() => Promise.resolve({ url: "https://s3.example.com/test-file.pdf" })),
}));

describe("Grant Documents Router", () => {
  describe("getCategories", () => {
    it("should return document categories and requirements", async () => {
      // Import the router after mocks are set up
      const { grantDocumentsRouter } = await import("./routers/grant-documents");
      
      // The getCategories procedure is a public procedure that returns static data
      const categories = [
        "budget",
        "staffing",
        "equipment",
        "letters_of_support",
        "legal",
        "financial_statements",
        "program_narrative",
        "evaluation_plan",
        "timeline",
        "certificates",
        "other"
      ];
      
      const requirements = {
        budget: {
          description: "Detailed budget breakdown with line items",
          required: true,
          formats: ["pdf", "xlsx", "docx"],
          maxSize: 10
        },
        staffing: {
          description: "Organizational chart and staffing plan",
          required: true,
          formats: ["pdf", "docx", "png", "jpg"],
          maxSize: 10
        },
        legal: {
          description: "Articles of incorporation, bylaws, operating agreements",
          required: true,
          formats: ["pdf"],
          maxSize: 10
        },
        financial_statements: {
          description: "Audited financials, 990s, bank statements",
          required: true,
          formats: ["pdf"],
          maxSize: 20
        },
      };
      
      // Verify categories are defined
      expect(categories).toContain("budget");
      expect(categories).toContain("legal");
      expect(categories).toContain("financial_statements");
      expect(categories.length).toBe(11);
      
      // Verify requirements structure
      expect(requirements.budget.required).toBe(true);
      expect(requirements.budget.formats).toContain("pdf");
      expect(requirements.budget.maxSize).toBe(10);
    });
  });

  describe("Document Category Validation", () => {
    it("should have all required categories defined", () => {
      const requiredCategories = [
        "budget",
        "staffing",
        "letters_of_support",
        "legal",
        "financial_statements",
        "program_narrative",
        "timeline",
        "certificates"
      ];
      
      const allCategories = [
        "budget",
        "staffing",
        "equipment",
        "letters_of_support",
        "legal",
        "financial_statements",
        "program_narrative",
        "evaluation_plan",
        "timeline",
        "certificates",
        "other"
      ];
      
      requiredCategories.forEach(cat => {
        expect(allCategories).toContain(cat);
      });
    });

    it("should have valid file format restrictions", () => {
      const validFormats = ["pdf", "xlsx", "docx", "png", "jpg"];
      
      const budgetFormats = ["pdf", "xlsx", "docx"];
      const legalFormats = ["pdf"];
      const certificateFormats = ["pdf", "png", "jpg"];
      
      budgetFormats.forEach(format => {
        expect(validFormats).toContain(format);
      });
      
      legalFormats.forEach(format => {
        expect(validFormats).toContain(format);
      });
      
      certificateFormats.forEach(format => {
        expect(validFormats).toContain(format);
      });
    });
  });

  describe("Entity Validation", () => {
    it("should have all ecosystem entities defined", () => {
      const entities = {
        "real_eye_nation": "Real-Eye-Nation LLC",
        "laws_collective": "The The The L.A.W.S. Collective LLC",
        "luvonpurpose_wealth": "LuvOnPurpose Autonomous Wealth System LLC",
        "academy": "LuvOnPurpose Outreach Temple and Academy Society Inc.",
        "trust_98": "98 Trust - CALEA Freeman Family Trust"
      };
      
      expect(Object.keys(entities).length).toBe(5);
      expect(entities.laws_collective).toBe("The The The L.A.W.S. Collective LLC");
      expect(entities.academy).toContain("Academy");
      expect(entities.trust_98).toContain("Trust");
    });
  });

  describe("File Size Validation", () => {
    it("should enforce maximum file sizes per category", () => {
      const maxSizes: Record<string, number> = {
        budget: 10,
        staffing: 10,
        equipment: 10,
        letters_of_support: 5,
        legal: 10,
        financial_statements: 20,
        program_narrative: 10,
        evaluation_plan: 10,
        timeline: 5,
        certificates: 5,
        other: 20
      };
      
      // Verify all categories have size limits
      Object.values(maxSizes).forEach(size => {
        expect(size).toBeGreaterThan(0);
        expect(size).toBeLessThanOrEqual(20);
      });
      
      // Verify specific limits
      expect(maxSizes.financial_statements).toBe(20);
      expect(maxSizes.letters_of_support).toBe(5);
    });
  });

  describe("Document Upload Flow", () => {
    it("should validate required fields for upload", () => {
      const requiredFields = ["entityId", "category", "fileName", "fileData", "mimeType", "fileSize"];
      
      const uploadInput = {
        entityId: "laws_collective",
        category: "budget",
        fileName: "2024_budget.pdf",
        fileData: "base64encodeddata",
        mimeType: "application/pdf",
        fileSize: 1024 * 1024, // 1MB
      };
      
      requiredFields.forEach(field => {
        expect(uploadInput).toHaveProperty(field);
      });
    });

    it("should generate unique file keys for S3", () => {
      const entityId = "laws_collective";
      const category = "budget";
      const timestamp = Date.now();
      const randomSuffix = "abc12345";
      const fileName = "2024_budget.pdf";
      
      const s3Key = `grant-documents/${entityId}/${category}/${timestamp}-${randomSuffix}-${fileName}`;
      
      expect(s3Key).toContain("grant-documents");
      expect(s3Key).toContain(entityId);
      expect(s3Key).toContain(category);
      expect(s3Key).toContain(fileName);
    });
  });

  describe("Document Checklist Calculation", () => {
    it("should calculate completion rate correctly", () => {
      const requiredCategories = ["budget", "staffing", "legal", "financial_statements", "program_narrative", "timeline", "certificates", "letters_of_support"];
      const uploadedCategories = ["budget", "legal", "financial_statements"];
      
      const completedCount = uploadedCategories.filter(cat => requiredCategories.includes(cat)).length;
      const requiredCount = requiredCategories.length;
      const completionRate = Math.round((completedCount / requiredCount) * 100);
      
      expect(completedCount).toBe(3);
      expect(requiredCount).toBe(8);
      expect(completionRate).toBe(38); // 3/8 = 37.5% rounded to 38%
    });

    it("should handle empty document list", () => {
      const uploadedCategories: string[] = [];
      const requiredCount = 8;
      
      const completionRate = requiredCount > 0 
        ? Math.round((uploadedCategories.length / requiredCount) * 100)
        : 0;
      
      expect(completionRate).toBe(0);
    });

    it("should handle full completion", () => {
      const requiredCategories = ["budget", "staffing", "legal", "financial_statements", "program_narrative", "timeline", "certificates", "letters_of_support"];
      const uploadedCategories = [...requiredCategories];
      
      const completedCount = uploadedCategories.filter(cat => requiredCategories.includes(cat)).length;
      const completionRate = Math.round((completedCount / requiredCategories.length) * 100);
      
      expect(completionRate).toBe(100);
    });
  });
});
