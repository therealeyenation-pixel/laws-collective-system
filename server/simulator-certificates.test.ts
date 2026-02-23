/**
 * Simulator Certificates Tests
 */

import { describe, it, expect } from "vitest";
import {
  getSimulatorOrder,
  getSimulatorByKey,
  getSimulatorById,
  checkPrerequisites,
  generateCertificateData,
  generateBlockchainRecordData,
  calculateSimulatorProgress,
  getCertificateTemplate,
  getCertificateDisplayInfo,
  SIMULATOR_ORDER
} from "./services/simulator-certificates";

describe("Simulator Certificates Service", () => {
  describe("Simulator Order", () => {
    it("should have exactly 9 simulators", () => {
      const simulators = getSimulatorOrder();
      expect(simulators).toHaveLength(9);
    });

    it("should have simulators in correct order", () => {
      const simulators = getSimulatorOrder();
      expect(simulators[0].key).toBe("business");
      expect(simulators[1].key).toBe("business-plan");
      expect(simulators[2].key).toBe("grant");
      expect(simulators[3].key).toBe("financial");
      expect(simulators[4].key).toBe("trust");
      expect(simulators[5].key).toBe("contracts");
      expect(simulators[6].key).toBe("blockchain");
      expect(simulators[7].key).toBe("operations");
      expect(simulators[8].key).toBe("insurance");
    });

    it("should have unique IDs for each simulator", () => {
      const simulators = getSimulatorOrder();
      const ids = simulators.map(s => s.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds.length).toBe(ids.length);
    });

    it("should have token rewards for each simulator", () => {
      const simulators = getSimulatorOrder();
      simulators.forEach(s => {
        expect(s.tokensReward).toBeGreaterThan(0);
      });
    });

    it("should have certificate types for each simulator", () => {
      const simulators = getSimulatorOrder();
      simulators.forEach(s => {
        expect(s.certificateType).toBeDefined();
        expect(s.certificateType.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Simulator Lookup", () => {
    it("should get simulator by key", () => {
      const simulator = getSimulatorByKey("business");
      expect(simulator).toBeDefined();
      expect(simulator?.title).toBe("Business Foundations");
    });

    it("should return undefined for invalid key", () => {
      const simulator = getSimulatorByKey("invalid");
      expect(simulator).toBeUndefined();
    });

    it("should get simulator by ID", () => {
      const simulator = getSimulatorById(1);
      expect(simulator).toBeDefined();
      expect(simulator?.key).toBe("business");
    });

    it("should return undefined for invalid ID", () => {
      const simulator = getSimulatorById(999);
      expect(simulator).toBeUndefined();
    });
  });

  describe("Prerequisites", () => {
    it("should allow access to business simulator with no prerequisites", () => {
      const result = checkPrerequisites("business", []);
      expect(result.canAccess).toBe(true);
      expect(result.missingPrerequisites).toHaveLength(0);
    });

    it("should require business for business-plan", () => {
      const result = checkPrerequisites("business-plan", []);
      expect(result.canAccess).toBe(false);
      expect(result.missingPrerequisites).toContain("business");
    });

    it("should allow business-plan after completing business", () => {
      const result = checkPrerequisites("business-plan", ["business"]);
      expect(result.canAccess).toBe(true);
    });

    it("should require business-plan for grant", () => {
      const result = checkPrerequisites("grant", ["business"]);
      expect(result.canAccess).toBe(false);
      expect(result.missingPrerequisites).toContain("business-plan");
    });

    it("should require multiple prerequisites for insurance", () => {
      const result = checkPrerequisites("insurance", []);
      expect(result.canAccess).toBe(false);
      expect(result.missingPrerequisites).toContain("business");
      expect(result.missingPrerequisites).toContain("financial");
    });

    it("should allow insurance after completing business and financial", () => {
      const result = checkPrerequisites("insurance", ["business", "financial"]);
      expect(result.canAccess).toBe(true);
    });
  });

  describe("Certificate Generation", () => {
    it("should generate certificate data", () => {
      const certData = generateCertificateData(1, "Test User", "business");
      expect(certData).toBeDefined();
      expect(certData?.userId).toBe(1);
      expect(certData?.simulatorKey).toBe("business");
      expect(certData?.certificateType).toBe("business_foundations");
      expect(certData?.title).toContain("Business Foundations");
    });

    it("should return null for invalid simulator", () => {
      const certData = generateCertificateData(1, "Test User", "invalid");
      expect(certData).toBeNull();
    });

    it("should include user name in description", () => {
      const certData = generateCertificateData(1, "John Doe", "business");
      expect(certData?.description).toContain("John Doe");
    });
  });

  describe("Blockchain Record", () => {
    it("should generate blockchain record data", () => {
      const record = generateBlockchainRecordData({
        userId: 1,
        certificateType: "business_foundations",
        title: "Test Certificate",
        issuedAt: new Date()
      });
      expect(record.hash).toBeDefined();
      expect(record.hash.startsWith("0x")).toBe(true);
      expect(record.data).toContain("CERTIFICATE_ISSUANCE");
    });

    it("should include certificate type in data", () => {
      const record = generateBlockchainRecordData({
        userId: 1,
        certificateType: "business_foundations",
        title: "Test Certificate",
        issuedAt: new Date()
      });
      expect(record.data).toContain("business_foundations");
    });
  });

  describe("Progress Calculation", () => {
    it("should calculate 0% progress with no completions", () => {
      const progress = calculateSimulatorProgress([]);
      expect(progress.completedCount).toBe(0);
      expect(progress.progressPercent).toBe(0);
      expect(progress.isComplete).toBe(false);
    });

    it("should calculate correct progress with some completions", () => {
      const progress = calculateSimulatorProgress(["business", "business-plan"]);
      expect(progress.completedCount).toBe(2);
      expect(progress.progressPercent).toBe(22); // 2/9 = 22%
    });

    it("should calculate 100% when all complete", () => {
      const allKeys = SIMULATOR_ORDER.map(s => s.key);
      const progress = calculateSimulatorProgress(allKeys);
      expect(progress.completedCount).toBe(9);
      expect(progress.progressPercent).toBe(100);
      expect(progress.isComplete).toBe(true);
    });

    it("should suggest next available simulator", () => {
      const progress = calculateSimulatorProgress(["business"]);
      expect(progress.nextSimulator).toBeDefined();
      // Next available could be business-plan, financial, contracts, or operations
      expect(["business-plan", "financial", "contracts", "operations"]).toContain(
        progress.nextSimulator?.key
      );
    });

    it("should calculate total tokens earned", () => {
      const progress = calculateSimulatorProgress(["business"]);
      expect(progress.totalTokensEarned).toBe(500); // business = 500 tokens
    });

    it("should mark simulators as completed or accessible", () => {
      const progress = calculateSimulatorProgress(["business"]);
      const businessSim = progress.simulators.find(s => s.key === "business");
      const businessPlanSim = progress.simulators.find(s => s.key === "business-plan");
      const trustSim = progress.simulators.find(s => s.key === "trust");

      expect(businessSim?.completed).toBe(true);
      expect(businessPlanSim?.canAccess).toBe(true);
      expect(trustSim?.canAccess).toBe(false); // requires financial
    });
  });

  describe("Certificate Display", () => {
    it("should get display info for valid certificate type", () => {
      const info = getCertificateDisplayInfo("business_foundations");
      expect(info).toBeDefined();
      expect(info?.title).toBe("Business Foundations");
      expect(info?.color).toBeDefined();
      expect(info?.badgeLevel).toBe("Foundation");
    });

    it("should return null for invalid certificate type", () => {
      const info = getCertificateDisplayInfo("invalid_type");
      expect(info).toBeNull();
    });

    it("should have different badge levels", () => {
      const foundation = getCertificateDisplayInfo("business_foundations");
      const advanced = getCertificateDisplayInfo("trust_estate");
      expect(foundation?.badgeLevel).toBe("Foundation");
      expect(advanced?.badgeLevel).toBe("Advanced");
    });
  });

  describe("Certificate Template", () => {
    it("should generate HTML template", () => {
      const html = getCertificateTemplate(
        "John Doe",
        "Business Foundations Certificate",
        "Business Foundations",
        new Date("2025-01-25"),
        "0x123abc"
      );
      expect(html).toContain("John Doe");
      expect(html).toContain("Business Foundations");
      expect(html).toContain("0x123abc");
      expect(html).toContain("Certificate of Completion");
    });

    it("should work without blockchain hash", () => {
      const html = getCertificateTemplate(
        "Jane Doe",
        "Test Certificate",
        "Test Simulator",
        new Date()
      );
      expect(html).toContain("Jane Doe");
      expect(html).not.toContain("Blockchain Verified");
    });

    it("should format date correctly", () => {
      const testDate = new Date("2025-01-25T12:00:00Z");
      const html = getCertificateTemplate(
        "Test User",
        "Test Certificate",
        "Test",
        testDate
      );
      // Check that the date is formatted and included
      expect(html).toContain("Issued on");
      expect(html).toContain("2025");
    });
  });

  describe("Token Rewards", () => {
    it("should have correct token values", () => {
      const simulators = getSimulatorOrder();
      const business = simulators.find(s => s.key === "business");
      const trust = simulators.find(s => s.key === "trust");
      const blockchain = simulators.find(s => s.key === "blockchain");

      expect(business?.tokensReward).toBe(500);
      expect(trust?.tokensReward).toBe(1000);
      expect(blockchain?.tokensReward).toBe(1000);
    });

    it("should calculate total possible tokens", () => {
      const progress = calculateSimulatorProgress([]);
      expect(progress.totalTokensPossible).toBe(6750); // Sum of all rewards
    });
  });
});
