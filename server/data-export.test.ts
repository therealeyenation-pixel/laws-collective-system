import { describe, it, expect } from "vitest";
import { dataExportRouter } from "./routers/data-export";

describe("Data Export Router", () => {
  describe("getExportFormats", () => {
    it("should return available export formats", async () => {
      const caller = dataExportRouter.createCaller({});
      const formats = await caller.getExportFormats();

      expect(formats).toBeDefined();
      expect(Array.isArray(formats)).toBe(true);
      expect(formats.length).toBeGreaterThan(0);

      // Check that each format has required fields
      formats.forEach((format) => {
        expect(format).toHaveProperty("id");
        expect(format).toHaveProperty("name");
        expect(format).toHaveProperty("description");
        expect(format).toHaveProperty("fields");
      });
    });

    it("should include QuickBooks Time format", async () => {
      const caller = dataExportRouter.createCaller({});
      const formats = await caller.getExportFormats();

      const qbFormat = formats.find((f) => f.id === "quickbooks_time");
      expect(qbFormat).toBeDefined();
      expect(qbFormat?.name).toBe("QuickBooks Time");
    });

    it("should include Deltek format for DCAA compliance", async () => {
      const caller = dataExportRouter.createCaller({});
      const formats = await caller.getExportFormats();

      const deltekFormat = formats.find((f) => f.id === "deltek");
      expect(deltekFormat).toBeDefined();
      expect(deltekFormat?.name).toBe("Deltek Costpoint");
      expect(deltekFormat?.description).toContain("DCAA");
    });

    it("should include ADP format", async () => {
      const caller = dataExportRouter.createCaller({});
      const formats = await caller.getExportFormats();

      const adpFormat = formats.find((f) => f.id === "adp");
      expect(adpFormat).toBeDefined();
      expect(adpFormat?.name).toBe("ADP Workforce");
    });

    it("should include Gusto format", async () => {
      const caller = dataExportRouter.createCaller({});
      const formats = await caller.getExportFormats();

      const gustoFormat = formats.find((f) => f.id === "gusto");
      expect(gustoFormat).toBeDefined();
      expect(gustoFormat?.name).toBe("Gusto Payroll");
    });

    it("should include generic CSV format", async () => {
      const caller = dataExportRouter.createCaller({});
      const formats = await caller.getExportFormats();

      const genericFormat = formats.find((f) => f.id === "generic_csv");
      expect(genericFormat).toBeDefined();
      expect(genericFormat?.name).toBe("Generic CSV");
    });
  });

  describe("getIntegrationGuides", () => {
    it("should return integration guides", async () => {
      const caller = dataExportRouter.createCaller({});
      const guides = await caller.getIntegrationGuides();

      expect(guides).toBeDefined();
      expect(Array.isArray(guides)).toBe(true);
      expect(guides.length).toBeGreaterThan(0);
    });

    it("should include QuickBooks integration guide", async () => {
      const caller = dataExportRouter.createCaller({});
      const guides = await caller.getIntegrationGuides();

      const qbGuide = guides.find((g) => g.id === "quickbooks");
      expect(qbGuide).toBeDefined();
      expect(qbGuide?.name).toContain("QuickBooks");
      expect(qbGuide?.importInstructions).toBeDefined();
      expect(qbGuide?.dataMapping).toBeDefined();
    });

    it("should include Deltek integration guide with compliance notes", async () => {
      const caller = dataExportRouter.createCaller({});
      const guides = await caller.getIntegrationGuides();

      const deltekGuide = guides.find((g) => g.id === "deltek");
      expect(deltekGuide).toBeDefined();
      expect(deltekGuide?.name).toContain("Deltek");
      expect(deltekGuide?.complianceNotes).toBeDefined();
      expect(deltekGuide?.complianceNotes).toContain("DCAA");
    });

    it("should include Gusto integration guide", async () => {
      const caller = dataExportRouter.createCaller({});
      const guides = await caller.getIntegrationGuides();

      const gustoGuide = guides.find((g) => g.id === "gusto");
      expect(gustoGuide).toBeDefined();
      expect(gustoGuide?.category).toBe("Payroll Processing");
    });

    it("should include ADP integration guide", async () => {
      const caller = dataExportRouter.createCaller({});
      const guides = await caller.getIntegrationGuides();

      const adpGuide = guides.find((g) => g.id === "adp");
      expect(adpGuide).toBeDefined();
      expect(adpGuide?.category).toBe("Enterprise HR & Payroll");
    });

    it("should include Sage Intacct guide for nonprofits", async () => {
      const caller = dataExportRouter.createCaller({});
      const guides = await caller.getIntegrationGuides();

      const sageGuide = guides.find((g) => g.id === "sage");
      expect(sageGuide).toBeDefined();
      expect(sageGuide?.category).toBe("Nonprofit Accounting");
    });

    it("should include BambooHR guide", async () => {
      const caller = dataExportRouter.createCaller({});
      const guides = await caller.getIntegrationGuides();

      const bambooGuide = guides.find((g) => g.id === "bamboohr");
      expect(bambooGuide).toBeDefined();
      expect(bambooGuide?.category).toBe("Human Resources");
    });

    it("should have valid website URLs for all guides", async () => {
      const caller = dataExportRouter.createCaller({});
      const guides = await caller.getIntegrationGuides();

      guides.forEach((guide) => {
        expect(guide.website).toBeDefined();
        expect(guide.website).toMatch(/^https?:\/\//);
      });
    });

    it("should have import instructions for all guides", async () => {
      const caller = dataExportRouter.createCaller({});
      const guides = await caller.getIntegrationGuides();

      guides.forEach((guide) => {
        expect(guide.importInstructions).toBeDefined();
        expect(Array.isArray(guide.importInstructions)).toBe(true);
        expect(guide.importInstructions.length).toBeGreaterThan(0);
      });
    });

    it("should have data mapping for all guides", async () => {
      const caller = dataExportRouter.createCaller({});
      const guides = await caller.getIntegrationGuides();

      guides.forEach((guide) => {
        expect(guide.dataMapping).toBeDefined();
        expect(typeof guide.dataMapping).toBe("object");
        expect(Object.keys(guide.dataMapping).length).toBeGreaterThan(0);
      });
    });
  });
});
