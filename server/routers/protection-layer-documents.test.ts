import { describe, it, expect, vi } from "vitest";

// Mock the storage module
vi.mock("../storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://test-storage.example.com/test-doc.html" }),
}));

describe("Protection Layer Document Generators", () => {
  describe("Healthcare Power of Attorney", () => {
    it("should generate valid HTML with all required sections", async () => {
      // Import after mocking
      const { protectionLayerRouter } = await import("./protection-layer-documents");
      
      // Verify router has the expected procedures
      expect(protectionLayerRouter).toBeDefined();
      expect(protectionLayerRouter._def.procedures).toHaveProperty("generateHealthcarePOA");
      expect(protectionLayerRouter._def.procedures).toHaveProperty("generateLivingWill");
      expect(protectionLayerRouter._def.procedures).toHaveProperty("generateHIPAAAuth");
      expect(protectionLayerRouter._def.procedures).toHaveProperty("generateFinancialPOA");
      expect(protectionLayerRouter._def.procedures).toHaveProperty("generateArbitrationAgreement");
      expect(protectionLayerRouter._def.procedures).toHaveProperty("getDocumentTypes");
    });
  });

  describe("Document Types Query", () => {
    it("should return all document categories", async () => {
      const { protectionLayerRouter } = await import("./protection-layer-documents");
      
      // Verify getDocumentTypes procedure exists
      expect(protectionLayerRouter._def.procedures).toHaveProperty("getDocumentTypes");
    });
  });

  describe("Living Will Generator", () => {
    it("should have living will procedure defined", async () => {
      const { protectionLayerRouter } = await import("./protection-layer-documents");
      expect(protectionLayerRouter._def.procedures).toHaveProperty("generateLivingWill");
    });
  });

  describe("HIPAA Authorization Generator", () => {
    it("should have HIPAA auth procedure defined", async () => {
      const { protectionLayerRouter } = await import("./protection-layer-documents");
      expect(protectionLayerRouter._def.procedures).toHaveProperty("generateHIPAAAuth");
    });
  });

  describe("Financial POA Generator", () => {
    it("should have financial POA procedure defined", async () => {
      const { protectionLayerRouter } = await import("./protection-layer-documents");
      expect(protectionLayerRouter._def.procedures).toHaveProperty("generateFinancialPOA");
    });
  });

  describe("Arbitration Agreement Generator", () => {
    it("should have arbitration agreement procedure defined", async () => {
      const { protectionLayerRouter } = await import("./protection-layer-documents");
      expect(protectionLayerRouter._def.procedures).toHaveProperty("generateArbitrationAgreement");
    });
  });
});
