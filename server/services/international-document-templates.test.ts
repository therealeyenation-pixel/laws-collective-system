/**
 * International Document Templates Service Tests
 * Phase 51.2: Tests for international document templates
 */

import { describe, it, expect } from "vitest";
import * as docTemplates from "./international-document-templates";

describe("International Document Templates Service", () => {
  describe("Template Retrieval", () => {
    it("should return all templates", () => {
      const templates = docTemplates.getAllTemplates();
      expect(templates.length).toBeGreaterThan(30);
    });

    it("should get templates by category", () => {
      const formationTemplates = docTemplates.getTemplatesByCategory("formation");
      expect(formationTemplates.length).toBeGreaterThan(0);
      expect(formationTemplates.every(t => t.category === "formation")).toBe(true);

      const taxTemplates = docTemplates.getTemplatesByCategory("tax");
      expect(taxTemplates.length).toBeGreaterThan(0);
      expect(taxTemplates.every(t => t.category === "tax")).toBe(true);
    });

    it("should get templates by jurisdiction", () => {
      const ukTemplates = docTemplates.getTemplatesByJurisdiction("GB");
      expect(ukTemplates.length).toBeGreaterThan(0);
      // Should include UK-specific and universal templates
      expect(ukTemplates.some(t => t.jurisdictions.includes("GB"))).toBe(true);
      expect(ukTemplates.some(t => t.jurisdictions.includes("*"))).toBe(true);
    });

    it("should get template by ID", () => {
      const template = docTemplates.getTemplateById("intl_form_001");
      expect(template).not.toBeNull();
      expect(template?.name).toBe("UK Company Formation (IN01)");
    });

    it("should return null for unknown template ID", () => {
      const template = docTemplates.getTemplateById("unknown_id");
      expect(template).toBeNull();
    });
  });

  describe("Template Search", () => {
    it("should search templates by name", () => {
      const results = docTemplates.searchTemplates("UK");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(t => t.name.includes("UK"))).toBe(true);
    });

    it("should search templates by description", () => {
      const results = docTemplates.searchTemplates("FATCA");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should search templates by category", () => {
      const results = docTemplates.searchTemplates("formation");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should return empty array for no matches", () => {
      const results = docTemplates.searchTemplates("xyznonexistent");
      expect(results).toHaveLength(0);
    });
  });

  describe("Formation Templates", () => {
    it("should get UK formation templates", () => {
      const templates = docTemplates.getFormationTemplates("GB");
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.some(t => t.name.includes("IN01"))).toBe(true);
    });

    it("should get German formation templates", () => {
      const templates = docTemplates.getFormationTemplates("DE");
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.some(t => t.name.includes("GmbH"))).toBe(true);
    });

    it("should get Singapore formation templates", () => {
      const templates = docTemplates.getFormationTemplates("SG");
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.some(t => t.name.includes("Singapore"))).toBe(true);
    });

    it("should get offshore formation templates", () => {
      const bviTemplates = docTemplates.getFormationTemplates("VG");
      expect(bviTemplates.some(t => t.name.includes("BVI"))).toBe(true);

      const caymanTemplates = docTemplates.getFormationTemplates("KY");
      expect(caymanTemplates.some(t => t.name.includes("Cayman"))).toBe(true);
    });
  });

  describe("Compliance Templates", () => {
    it("should get UK compliance templates", () => {
      const templates = docTemplates.getComplianceTemplates("GB");
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.some(t => t.name.includes("Confirmation Statement"))).toBe(true);
    });

    it("should get economic substance templates", () => {
      const bviTemplates = docTemplates.getComplianceTemplates("VG");
      expect(bviTemplates.some(t => t.name.includes("Economic Substance"))).toBe(true);

      const caymanTemplates = docTemplates.getComplianceTemplates("KY");
      expect(caymanTemplates.some(t => t.name.includes("Economic Substance"))).toBe(true);
    });
  });

  describe("Tax Templates", () => {
    it("should get W-8 forms", () => {
      const templates = docTemplates.getTaxTemplates("US");
      expect(templates.some(t => t.name.includes("W-8BEN-E"))).toBe(true);
      expect(templates.some(t => t.name.includes("W-8BEN"))).toBe(true);
    });

    it("should get FATCA self-certification", () => {
      const templates = docTemplates.getTaxTemplates("GB");
      expect(templates.some(t => t.name.includes("FATCA"))).toBe(true);
    });

    it("should get CRS self-certification", () => {
      const templates = docTemplates.getTaxTemplates("SG");
      expect(templates.some(t => t.name.includes("CRS"))).toBe(true);
    });

    it("should get jurisdiction-specific tax returns", () => {
      const ukTemplates = docTemplates.getTaxTemplates("GB");
      expect(ukTemplates.some(t => t.name.includes("CT600"))).toBe(true);

      const sgTemplates = docTemplates.getTaxTemplates("SG");
      expect(sgTemplates.some(t => t.name.includes("Form C-S"))).toBe(true);
    });
  });

  describe("Transfer Pricing Templates", () => {
    it("should get all transfer pricing templates", () => {
      const templates = docTemplates.getTransferPricingTemplates();
      expect(templates.length).toBeGreaterThan(0);
    });

    it("should include BEPS documentation", () => {
      const templates = docTemplates.getTransferPricingTemplates();
      expect(templates.some(t => t.name.includes("Master File"))).toBe(true);
      expect(templates.some(t => t.name.includes("Local File"))).toBe(true);
      expect(templates.some(t => t.name.includes("Country-by-Country"))).toBe(true);
    });

    it("should include intercompany agreement templates", () => {
      const templates = docTemplates.getTransferPricingTemplates();
      expect(templates.some(t => t.name.includes("Services"))).toBe(true);
      expect(templates.some(t => t.name.includes("IP License"))).toBe(true);
      expect(templates.some(t => t.name.includes("Loan"))).toBe(true);
    });
  });

  describe("Beneficial Ownership Templates", () => {
    it("should get UK PSC register template", () => {
      const templates = docTemplates.getBeneficialOwnershipTemplates("GB");
      expect(templates.some(t => t.name.includes("PSC"))).toBe(true);
    });

    it("should get offshore BO templates", () => {
      const bviTemplates = docTemplates.getBeneficialOwnershipTemplates("VG");
      expect(bviTemplates.some(t => t.name.includes("Beneficial Ownership"))).toBe(true);

      const caymanTemplates = docTemplates.getBeneficialOwnershipTemplates("KY");
      expect(caymanTemplates.some(t => t.name.includes("Beneficial Ownership"))).toBe(true);
    });

    it("should get EU UBO template", () => {
      const deTemplates = docTemplates.getBeneficialOwnershipTemplates("DE");
      expect(deTemplates.some(t => t.name.includes("UBO"))).toBe(true);
    });

    it("should get FinCEN BOI template", () => {
      const usTemplates = docTemplates.getBeneficialOwnershipTemplates("US");
      expect(usTemplates.some(t => t.name.includes("FinCEN"))).toBe(true);
    });
  });

  describe("Banking Templates", () => {
    it("should get all banking templates", () => {
      const templates = docTemplates.getBankingTemplates();
      expect(templates.length).toBeGreaterThan(0);
    });

    it("should include account opening template", () => {
      const templates = docTemplates.getBankingTemplates();
      expect(templates.some(t => t.name.includes("Bank Account Opening"))).toBe(true);
    });

    it("should include board resolution template", () => {
      const templates = docTemplates.getBankingTemplates();
      expect(templates.some(t => t.name.includes("Board Resolution"))).toBe(true);
    });

    it("should include certificate of incumbency", () => {
      const templates = docTemplates.getBankingTemplates();
      expect(templates.some(t => t.name.includes("Certificate of Incumbency"))).toBe(true);
    });
  });

  describe("Document Generation", () => {
    it("should generate document with valid data", () => {
      const result = docTemplates.generateDocumentFromTemplate("intl_bank_002", {
        companyName: "Test Company Ltd",
        meetingDate: "2024-01-15",
        bankName: "HSBC",
        accountType: "Business Current Account",
        authorizedSignatories: ["John Smith", "Jane Doe"],
        signingAuthority: "Any two directors"
      });

      expect(result.success).toBe(true);
      expect(result.documentId).toBeDefined();
      expect(result.document?.status).toBe("complete");
    });

    it("should fail with missing required fields", () => {
      const result = docTemplates.generateDocumentFromTemplate("intl_bank_002", {
        companyName: "Test Company Ltd"
        // Missing other required fields
      });

      expect(result.success).toBe(false);
      expect(result.missingFields?.length).toBeGreaterThan(0);
    });

    it("should fail for unknown template", () => {
      const result = docTemplates.generateDocumentFromTemplate("unknown_template", {});
      expect(result.success).toBe(false);
    });
  });

  describe("Document Validation", () => {
    it("should validate complete document data", () => {
      const validation = docTemplates.validateDocumentData("intl_bank_002", {
        companyName: "Test Company Ltd",
        meetingDate: "2024-01-15",
        bankName: "HSBC",
        accountType: "Business Current Account",
        authorizedSignatories: ["John Smith"],
        signingAuthority: "Any director"
      });

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect missing required fields", () => {
      const validation = docTemplates.validateDocumentData("intl_bank_002", {
        companyName: "Test Company Ltd"
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(e => e.includes("Missing required field"))).toBe(true);
    });

    it("should warn about unknown fields", () => {
      const validation = docTemplates.validateDocumentData("intl_bank_002", {
        companyName: "Test Company Ltd",
        meetingDate: "2024-01-15",
        bankName: "HSBC",
        accountType: "Business Current Account",
        authorizedSignatories: ["John Smith"],
        signingAuthority: "Any director",
        unknownField: "some value"
      });

      expect(validation.warnings.some(w => w.includes("Unknown field"))).toBe(true);
    });

    it("should fail for unknown template", () => {
      const validation = docTemplates.validateDocumentData("unknown_template", {});
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Template not found");
    });
  });

  describe("Template Statistics", () => {
    it("should return template statistics", () => {
      const stats = docTemplates.getTemplateStatistics();
      
      expect(stats.totalTemplates).toBeGreaterThan(30);
      expect(Object.keys(stats.byCategory).length).toBeGreaterThan(0);
      expect(Object.keys(stats.byJurisdiction).length).toBeGreaterThan(0);
    });

    it("should have all categories represented", () => {
      const stats = docTemplates.getTemplateStatistics();
      
      expect(stats.byCategory["formation"]).toBeGreaterThan(0);
      expect(stats.byCategory["compliance"]).toBeGreaterThan(0);
      expect(stats.byCategory["tax"]).toBeGreaterThan(0);
      expect(stats.byCategory["transfer_pricing"]).toBeGreaterThan(0);
      expect(stats.byCategory["beneficial_ownership"]).toBeGreaterThan(0);
      expect(stats.byCategory["banking"]).toBeGreaterThan(0);
    });
  });

  describe("Template Structure", () => {
    it("should have valid template structure", () => {
      const templates = docTemplates.getAllTemplates();
      
      for (const template of templates) {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.category).toBeDefined();
        expect(template.jurisdictions.length).toBeGreaterThan(0);
        expect(template.description).toBeDefined();
        expect(template.requiredFields.length).toBeGreaterThan(0);
        expect(["pdf", "word", "both"]).toContain(template.outputFormat);
      }
    });

    it("should have unique template IDs", () => {
      const templates = docTemplates.getAllTemplates();
      const ids = templates.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
