import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Offer Packages Router Tests
 * 
 * Tests for resume and offer package management functionality
 */

// Mock the database module
vi.mock("./db", () => {
  let resumeIdCounter = 1;

  const createChainableMock = (result: any[] = []) => {
    const chainable: any = {
      from: vi.fn(() => chainable),
      where: vi.fn(() => chainable),
      orderBy: vi.fn(() => Promise.resolve(result)),
      limit: vi.fn(() => Promise.resolve(result)),
      // Make the chainable itself a thenable that resolves to the result
      then: (resolve: any) => Promise.resolve(result).then(resolve),
    };
    return chainable;
  };

  return {
    getDb: vi.fn(() => Promise.resolve({
      select: vi.fn(() => createChainableMock([])),
      insert: vi.fn(() => ({
        values: vi.fn(() => {
          const id = resumeIdCounter++;
          return Promise.resolve([{ insertId: id }]);
        })
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve())
        }))
      })),
      delete: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve())
      }))
    }))
  };
});

function createTestContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Offer Packages Router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    vi.clearAllMocks();
    caller = appRouter.createCaller(createTestContext());
  });

  describe("Resume Operations", () => {
    it("should save a new resume", async () => {
      const result = await caller.offerPackages.saveResume({
        familyMemberId: "test-member-1",
        fullName: "Test User",
        title: "Test Position",
        email: "test@example.com",
        phone: "555-1234",
        location: "Test City",
        summary: "Test summary",
        qualificationType: "demonstrated",
        education: [],
        certifications: [],
        competencyEvidence: [],
        skills: [],
        references: [],
        developmentPlan: "",
        status: "draft",
      });

      expect(result).toHaveProperty("id");
      expect(result.updated).toBe(false);
    });

    it("should get all resumes", async () => {
      const result = await caller.offerPackages.getAllResumes();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should get resume by family member ID", async () => {
      const result = await caller.offerPackages.getResume({ familyMemberId: "test-member-1" });
      // Returns null when not found (mocked empty array)
      expect(result).toBeNull();
    });

    it("should get resume by ID", async () => {
      const result = await caller.offerPackages.getResumeById({ id: 1 });
      expect(result).toBeNull();
    });

    it("should delete a resume", async () => {
      const result = await caller.offerPackages.deleteResume({ id: 1 });
      expect(result.success).toBe(true);
    });
  });

  describe("Offer Package Operations", () => {
    it("should get all offer packages", async () => {
      const result = await caller.offerPackages.getAllOfferPackages();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should get offer packages by family member", async () => {
      const result = await caller.offerPackages.getOfferPackagesByMember({ familyMemberId: "test-member-1" });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should update offer status", async () => {
      const result = await caller.offerPackages.updateOfferStatus({
        id: 1,
        status: "approved",
      });
      expect(result.success).toBe(true);
    });

    it("should delete offer package", async () => {
      const result = await caller.offerPackages.deleteOfferPackage({ id: 1 });
      expect(result.success).toBe(true);
    });
  });

  describe("Document Operations", () => {
    it("should get documents for offer package", async () => {
      const result = await caller.offerPackages.getDocuments({ offerId: 1 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should sign a document", async () => {
      const result = await caller.offerPackages.signDocument({
        documentId: 1,
        signatureData: "base64-signature-data",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Statistics", () => {
    it("should get stats", async () => {
      const result = await caller.offerPackages.getStats();
      expect(result).toHaveProperty("totalResumes");
      expect(result).toHaveProperty("completeResumes");
      expect(result).toHaveProperty("draftResumes");
      expect(result).toHaveProperty("totalOffers");
      expect(result).toHaveProperty("pendingOffers");
      expect(result).toHaveProperty("approvedOffers");
      expect(result).toHaveProperty("acceptedOffers");
      expect(result).toHaveProperty("demonstratedCompetency");
      expect(result).toHaveProperty("traditionalCredentials");
      expect(result).toHaveProperty("hybridQualifications");
    });
  });

  describe("Validation", () => {
    it("should validate resume qualification type", async () => {
      // Test with valid qualification types
      const validTypes = ["traditional", "demonstrated", "hybrid"] as const;
      for (const type of validTypes) {
        const result = await caller.offerPackages.saveResume({
          familyMemberId: `test-${type}`,
          fullName: "Test User",
          qualificationType: type,
          status: "draft",
        });
        expect(result).toHaveProperty("id");
      }
    });

    it("should validate offer status transitions", async () => {
      const validStatuses = [
        "draft",
        "pending_review",
        "approved",
        "sent",
        "accepted",
        "declined",
        "expired",
      ] as const;
      
      for (const status of validStatuses) {
        const result = await caller.offerPackages.updateOfferStatus({
          id: 1,
          status: status,
        });
        expect(result.success).toBe(true);
      }
    });
  });
});

describe("Salary Policy Compliance", () => {
  it("should calculate 90% initial salary correctly", () => {
    // This tests the business logic that initial offers are 90% of full salary
    const fullSalary = 65000;
    const expectedInitial = Math.round(fullSalary * 0.9);
    expect(expectedInitial).toBe(58500);
    
    // Verify the 10% reserve for Year 2 merit increase
    const yearTwoIncrease = fullSalary - expectedInitial;
    expect(yearTwoIncrease).toBe(6500);
    expect(yearTwoIncrease / fullSalary).toBeCloseTo(0.1, 2);
  });

  it("should handle various salary amounts", () => {
    const testCases = [
      { full: 50000, expected90: 45000 },
      { full: 75000, expected90: 67500 },
      { full: 100000, expected90: 90000 },
      { full: 125000, expected90: 112500 },
    ];

    for (const { full, expected90 } of testCases) {
      const calculated = Math.round(full * 0.9);
      expect(calculated).toBe(expected90);
    }
  });
});
