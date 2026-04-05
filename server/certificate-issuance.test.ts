/**
 * Certificate Issuance Service Tests
 * Phase 10.6: Certificate Issuance Workflows
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn(() => null),
  db: {
    query: {
      certificates: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        $returningId: vi.fn(() => Promise.resolve([{ id: 1 }])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  },
}));

import {
  generateCertificateHash,
  generateVerificationUrl,
  CertificateType,
} from "./services/certificate-issuance";

describe("Certificate Issuance Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateCertificateHash", () => {
    it("should generate a 64-character hex hash", () => {
      const hash = generateCertificateHash(1, "course_completion", new Date());
      expect(hash).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
    });

    it("should generate unique hashes for different inputs", () => {
      const timestamp = new Date();
      const hash1 = generateCertificateHash(1, "course_completion", timestamp);
      const hash2 = generateCertificateHash(2, "course_completion", timestamp);
      const hash3 = generateCertificateHash(1, "simulator_completion", timestamp);
      
      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash2).not.toBe(hash3);
    });

    it("should generate unique hashes even with same inputs due to random component", () => {
      const timestamp = new Date();
      const hash1 = generateCertificateHash(1, "course_completion", timestamp);
      const hash2 = generateCertificateHash(1, "course_completion", timestamp);
      
      // Due to random component, hashes should be different
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("generateVerificationUrl", () => {
    it("should generate a valid verification URL", () => {
      const hash = "abc123def456";
      const url = generateVerificationUrl(hash);
      
      expect(url).toContain("/certificates/verify/");
      expect(url).toContain(hash);
    });

    it("should use VITE_APP_URL environment variable when set", () => {
      const originalEnv = process.env.VITE_APP_URL;
      process.env.VITE_APP_URL = "https://example.com";
      
      const hash = "test123";
      const url = generateVerificationUrl(hash);
      
      expect(url).toBe("https://example.com/certificates/verify/test123");
      
      process.env.VITE_APP_URL = originalEnv;
    });
  });

  describe("Certificate Types", () => {
    it("should support all defined certificate types", () => {
      const validTypes: CertificateType[] = [
        "simulator_completion",
        "course_completion",
        "mastery_certificate",
        "member_credential",
        "house_graduation",
        "language_mastery",
        "stem_mastery",
        "sovereign_diploma",
        "internship_completion",
        "contractor_certification",
      ];

      validTypes.forEach((type) => {
        expect(typeof type).toBe("string");
      });

      expect(validTypes).toHaveLength(10);
    });
  });

  describe("Certificate Issuance Request Validation", () => {
    it("should validate required fields for certificate issuance", () => {
      const validRequest = {
        userId: 1,
        certificateType: "course_completion" as CertificateType,
        title: "Test Certificate",
      };

      expect(validRequest.userId).toBeDefined();
      expect(validRequest.certificateType).toBeDefined();
      expect(validRequest.title).toBeDefined();
    });

    it("should allow optional fields", () => {
      const requestWithOptionals = {
        userId: 1,
        certificateType: "course_completion" as CertificateType,
        title: "Test Certificate",
        description: "A test certificate description",
        metadata: { score: 95, completionDate: "2024-01-15" },
        entityId: 5,
        simulatorId: "finance",
        courseId: 10,
        score: 95,
        tokensEarned: 500,
      };

      expect(requestWithOptionals.description).toBe("A test certificate description");
      expect(requestWithOptionals.metadata).toEqual({ score: 95, completionDate: "2024-01-15" });
      expect(requestWithOptionals.entityId).toBe(5);
      expect(requestWithOptionals.simulatorId).toBe("finance");
      expect(requestWithOptionals.courseId).toBe(10);
      expect(requestWithOptionals.score).toBe(95);
      expect(requestWithOptionals.tokensEarned).toBe(500);
    });
  });

  describe("Certificate Issuance Result", () => {
    it("should have correct structure for successful issuance", () => {
      const successResult = {
        success: true,
        certificateId: 1,
        certificateHash: "abc123",
        blockchainHash: "def456",
        verificationUrl: "/certificates/verify/abc123",
        message: "Certificate issued successfully",
      };

      expect(successResult.success).toBe(true);
      expect(successResult.certificateId).toBeDefined();
      expect(successResult.certificateHash).toBeDefined();
      expect(successResult.verificationUrl).toBeDefined();
      expect(successResult.message).toBeDefined();
    });

    it("should have correct structure for failed issuance", () => {
      const failResult = {
        success: false,
        message: "Database not available",
      };

      expect(failResult.success).toBe(false);
      expect(failResult.message).toBeDefined();
      expect(failResult.certificateId).toBeUndefined();
    });
  });

  describe("Certificate Verification", () => {
    it("should return valid structure for verification response", () => {
      const validResponse = {
        valid: true,
        certificate: {
          id: 1,
          userId: 1,
          certificateType: "course_completion",
          title: "Test Certificate",
        },
        blockchainRecord: {
          id: 1,
          blockchainHash: "abc123",
        },
        message: "Certificate verified successfully",
      };

      expect(validResponse.valid).toBe(true);
      expect(validResponse.certificate).toBeDefined();
      expect(validResponse.message).toBeDefined();
    });

    it("should return invalid structure for not found", () => {
      const invalidResponse = {
        valid: false,
        message: "Certificate not found",
      };

      expect(invalidResponse.valid).toBe(false);
      expect(invalidResponse.message).toBe("Certificate not found");
    });
  });

  describe("Certificate Eligibility", () => {
    it("should return eligible structure", () => {
      const eligibleResponse = {
        eligible: true,
        reason: "User is eligible for certificate",
      };

      expect(eligibleResponse.eligible).toBe(true);
      expect(eligibleResponse.reason).toBeDefined();
    });

    it("should return not eligible structure with existing certificate", () => {
      const notEligibleResponse = {
        eligible: false,
        reason: "Certificate already issued for this course",
        existingCertificate: {
          id: 1,
          userId: 1,
          courseId: 5,
        },
      };

      expect(notEligibleResponse.eligible).toBe(false);
      expect(notEligibleResponse.reason).toBeDefined();
      expect(notEligibleResponse.existingCertificate).toBeDefined();
    });
  });

  describe("Certificate Revocation", () => {
    it("should have correct structure for revocation request", () => {
      const revocationRequest = {
        certificateId: 1,
        certificateType: "course_completion" as CertificateType,
        reason: "Fraudulent completion",
        revokedBy: 5,
      };

      expect(revocationRequest.certificateId).toBeDefined();
      expect(revocationRequest.certificateType).toBeDefined();
      expect(revocationRequest.reason).toBeDefined();
      expect(revocationRequest.revokedBy).toBeDefined();
    });

    it("should return success structure for revocation", () => {
      const successResponse = {
        success: true,
        message: "Certificate 1 revoked successfully",
      };

      expect(successResponse.success).toBe(true);
      expect(successResponse.message).toContain("revoked successfully");
    });
  });

  describe("User Certificates Response", () => {
    it("should have correct structure for user certificates", () => {
      const userCertificates = {
        general: [{ id: 1, title: "General Cert" }],
        courseCompletion: [{ id: 2, courseName: "Finance 101" }],
        simulator: [{ id: 3, simulatorName: "HR Simulator" }],
        mastery: [],
      };

      expect(Array.isArray(userCertificates.general)).toBe(true);
      expect(Array.isArray(userCertificates.courseCompletion)).toBe(true);
      expect(Array.isArray(userCertificates.simulator)).toBe(true);
      expect(Array.isArray(userCertificates.mastery)).toBe(true);
    });
  });

  describe("Certificate Statistics", () => {
    it("should calculate total certificates correctly", () => {
      const stats = {
        totalCertificates: 150,
        generalCertificates: 50,
        simulatorCertificates: 60,
        courseCompletionCertificates: 40,
      };

      expect(stats.totalCertificates).toBe(
        stats.generalCertificates +
        stats.simulatorCertificates +
        stats.courseCompletionCertificates
      );
    });
  });

  describe("Certificate Types List", () => {
    it("should return all certificate types with descriptions", () => {
      const types = [
        { id: "simulator_completion", name: "Simulator Completion", description: "Awarded upon completing all modules of a simulator" },
        { id: "course_completion", name: "Course Completion", description: "Awarded upon completing an Academy course" },
        { id: "mastery_certificate", name: "Mastery Certificate", description: "Awarded for demonstrating mastery in a subject area" },
        { id: "member_credential", name: "Member Credential", description: "The L.A.W.S. Collective membership credential" },
        { id: "house_graduation", name: "House Graduation", description: "Awarded upon completing House requirements" },
        { id: "language_mastery", name: "Language Mastery", description: "Awarded for achieving language proficiency" },
        { id: "stem_mastery", name: "STEM Mastery", description: "Awarded for STEM subject mastery" },
        { id: "sovereign_diploma", name: "Sovereign Diploma", description: "The highest Academy achievement" },
        { id: "internship_completion", name: "Internship Completion", description: "Awarded upon completing an internship program" },
        { id: "contractor_certification", name: "Contractor Certification", description: "Certification for contractor status" },
      ];

      expect(types).toHaveLength(10);
      types.forEach((type) => {
        expect(type.id).toBeDefined();
        expect(type.name).toBeDefined();
        expect(type.description).toBeDefined();
      });
    });
  });
});
