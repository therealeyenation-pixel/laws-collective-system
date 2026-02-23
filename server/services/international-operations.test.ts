/**
 * International Operations Service Tests
 * Phase 51: Tests for international entity management and compliance
 */

import { describe, it, expect } from "vitest";
import * as intlOps from "./international-operations";

describe("International Operations Service", () => {
  describe("Jurisdiction Management", () => {
    it("should return all jurisdictions", () => {
      const jurisdictions = intlOps.getJurisdictions();
      expect(jurisdictions.length).toBeGreaterThan(0);
      expect(jurisdictions.some(j => j.code === "GB")).toBe(true);
      expect(jurisdictions.some(j => j.code === "US")).toBe(false); // US not in list
    });

    it("should get jurisdiction by code", () => {
      const uk = intlOps.getJurisdiction("GB");
      expect(uk).not.toBeNull();
      expect(uk?.name).toBe("United Kingdom");
      expect(uk?.corporateTaxRate).toBe(25);
      expect(uk?.currency).toBe("GBP");
    });

    it("should return null for unknown jurisdiction", () => {
      const unknown = intlOps.getJurisdiction("XX");
      expect(unknown).toBeNull();
    });

    it("should get jurisdictions by region", () => {
      const european = intlOps.getJurisdictionsByRegion("europe");
      expect(european.length).toBeGreaterThan(0);
      expect(european.every(j => j.region === "europe")).toBe(true);
      
      const caribbean = intlOps.getJurisdictionsByRegion("caribbean");
      expect(caribbean.length).toBeGreaterThan(0);
      expect(caribbean.some(j => j.code === "KY")).toBe(true);
    });

    it("should get tax-favorable jurisdictions", () => {
      const favorable = intlOps.getTaxFavorableJurisdictions();
      expect(favorable.length).toBeGreaterThan(0);
      expect(favorable.every(j => j.corporateTaxRate < 15)).toBe(true);
      expect(favorable.some(j => j.code === "IE")).toBe(true); // Ireland 12.5%
    });
  });

  describe("Tax Treaty Management", () => {
    it("should get tax treaty between two countries", () => {
      const treaty = intlOps.getTaxTreaty("US", "GB");
      expect(treaty).not.toBeNull();
      expect(treaty?.dividendRate).toBe(15);
      expect(treaty?.interestRate).toBe(0);
      expect(treaty?.royaltyRate).toBe(0);
    });

    it("should find treaty regardless of country order", () => {
      const treaty1 = intlOps.getTaxTreaty("US", "GB");
      const treaty2 = intlOps.getTaxTreaty("GB", "US");
      expect(treaty1).toEqual(treaty2);
    });

    it("should return null for non-existent treaty", () => {
      const treaty = intlOps.getTaxTreaty("US", "KY"); // No treaty with Cayman
      expect(treaty).toBeNull();
    });

    it("should get all treaties for a country", () => {
      const usTreaties = intlOps.getTaxTreatiesForCountry("US");
      expect(usTreaties.length).toBeGreaterThan(0);
      expect(usTreaties.every(t => t.country1 === "US" || t.country2 === "US")).toBe(true);
    });
  });

  describe("Withholding Rate Calculation", () => {
    it("should calculate treaty rate for dividends", () => {
      const rate = intlOps.calculateWithholdingRate("US", "GB", "dividend");
      expect(rate).toBe(15); // Treaty rate
    });

    it("should calculate treaty rate for interest", () => {
      const rate = intlOps.calculateWithholdingRate("US", "GB", "interest");
      expect(rate).toBe(0); // Treaty rate
    });

    it("should calculate treaty rate for royalties", () => {
      const rate = intlOps.calculateWithholdingRate("US", "DE", "royalty");
      expect(rate).toBe(0); // Treaty rate
    });

    it("should fall back to domestic rate without treaty", () => {
      const rate = intlOps.calculateWithholdingRate("GB", "KY", "dividend");
      expect(rate).toBe(20); // UK domestic rate
    });
  });

  describe("International Entity Creation", () => {
    it("should create UK Ltd entity", () => {
      const entity = intlOps.createInternationalEntity(
        "Test UK Ltd",
        "uk_ltd",
        "GB",
        {
          registeredAddress: {
            street: "123 Test Street",
            city: "London",
            postalCode: "EC1A 1BB",
            country: "United Kingdom"
          },
          directors: [{
            name: "John Smith",
            nationality: "GB",
            residency: "GB",
            appointmentDate: "2024-01-01"
          }]
        }
      );

      expect(entity.id).toMatch(/^intl_/);
      expect(entity.name).toBe("Test UK Ltd");
      expect(entity.entityType).toBe("uk_ltd");
      expect(entity.jurisdiction).toBe("United Kingdom");
      expect(entity.status).toBe("pending");
      expect(entity.directors.length).toBe(1);
      expect(entity.annualFilingDates.length).toBeGreaterThan(0);
    });

    it("should create Singapore Pte Ltd entity", () => {
      const entity = intlOps.createInternationalEntity(
        "Test SG Pte Ltd",
        "singapore_pte",
        "SG",
        {}
      );

      expect(entity.jurisdiction).toBe("Singapore");
      expect(entity.jurisdictionCode).toBe("SG");
      expect(entity.reportingObligations).toContain("acra_annual_return");
    });

    it("should throw error for unknown jurisdiction", () => {
      expect(() => {
        intlOps.createInternationalEntity("Test", "uk_ltd", "XX", {});
      }).toThrow("Unknown jurisdiction: XX");
    });

    it("should set tax residency to jurisdiction by default", () => {
      const entity = intlOps.createInternationalEntity(
        "Test Entity",
        "hong_kong_ltd",
        "HK",
        {}
      );

      expect(entity.taxResidency).toContain("HK");
    });
  });

  describe("Compliance Requirements", () => {
    it("should get compliance requirements for entity", () => {
      const entity = intlOps.createInternationalEntity(
        "Test UK Ltd",
        "uk_ltd",
        "GB",
        {}
      );

      const requirements = intlOps.getComplianceRequirements(entity, false);
      expect(requirements.length).toBeGreaterThan(0);
      expect(requirements.some(r => r.requirementType === "annual_return")).toBe(true);
    });

    it("should add FATCA requirements when US person involved", () => {
      const entity = intlOps.createInternationalEntity(
        "Test UK Ltd",
        "uk_ltd",
        "GB",
        {}
      );

      const requirements = intlOps.getComplianceRequirements(entity, true);
      expect(requirements.some(r => r.requirementType === "fatca")).toBe(true);
    });

    it("should add CRS requirements for participating jurisdictions", () => {
      const entity = intlOps.createInternationalEntity(
        "Test SG Pte",
        "singapore_pte",
        "SG",
        {}
      );

      const requirements = intlOps.getComplianceRequirements(entity, false);
      expect(requirements.some(r => r.requirementType === "crs")).toBe(true);
    });

    it("should add beneficial ownership for non-public registries", () => {
      const entity = intlOps.createInternationalEntity(
        "Test BVI",
        "offshore_bvi",
        "VG",
        {}
      );

      const requirements = intlOps.getComplianceRequirements(entity, false);
      expect(requirements.some(r => r.requirementType === "beneficial_ownership")).toBe(true);
    });
  });

  describe("FATCA Report Management", () => {
    it("should create FATCA report", () => {
      const report = intlOps.createFATCAReport(
        "entity_123",
        "Test Entity",
        "GIIN123456",
        2024
      );

      expect(report.id).toMatch(/^fatca_/);
      expect(report.reportingYear).toBe(2024);
      expect(report.giin).toBe("GIIN123456");
      expect(report.status).toBe("draft");
      expect(report.accountHolders).toHaveLength(0);
    });

    it("should add account holder to FATCA report", () => {
      const report = intlOps.createFATCAReport(
        "entity_123",
        "Test Entity",
        "GIIN123456",
        2024
      );

      const updated = intlOps.addFATCAAccountHolder(report, {
        name: "John Doe",
        tin: "123-45-6789",
        address: "123 Main St, USA",
        accountNumber: "ACC001",
        accountBalance: 50000,
        currency: "USD",
        grossDividends: 1000
      });

      expect(updated.accountHolders.length).toBe(1);
      expect(updated.accountHolders[0].name).toBe("John Doe");
    });
  });

  describe("CRS Report Management", () => {
    it("should create CRS report", () => {
      const report = intlOps.createCRSReport(
        "entity_456",
        "SG",
        ["US", "GB", "DE"],
        2024
      );

      expect(report.id).toMatch(/^crs_/);
      expect(report.reportingJurisdiction).toBe("SG");
      expect(report.receivingJurisdictions).toContain("US");
      expect(report.status).toBe("draft");
    });

    it("should add reportable account to CRS report", () => {
      const report = intlOps.createCRSReport(
        "entity_456",
        "SG",
        ["US"],
        2024
      );

      const updated = intlOps.addCRSReportableAccount(report, {
        accountHolderName: "Jane Smith",
        accountHolderType: "individual",
        tin: "987654321",
        tinJurisdiction: "US",
        address: "456 Oak Ave, USA",
        accountNumber: "ACC002",
        accountBalance: 75000,
        currency: "USD",
        paymentAmounts: {
          dividends: 2000,
          interest: 500
        }
      });

      expect(updated.reportableAccounts.length).toBe(1);
      expect(updated.reportableAccounts[0].accountHolderName).toBe("Jane Smith");
    });
  });

  describe("FBAR Report Management", () => {
    it("should create FBAR report", () => {
      const report = intlOps.createFBARReport(
        "John Taxpayer",
        "123-45-6789",
        "123 Main St, USA",
        2024
      );

      expect(report.id).toMatch(/^fbar_/);
      expect(report.filerName).toBe("John Taxpayer");
      expect(report.filingDeadline).toBe("2025-04-15");
      expect(report.aggregateMaxValue).toBe(0);
    });

    it("should add foreign account and calculate aggregate", () => {
      let report = intlOps.createFBARReport(
        "John Taxpayer",
        "123-45-6789",
        "123 Main St, USA",
        2024
      );

      report = intlOps.addFBARForeignAccount(report, {
        financialInstitution: "Swiss Bank",
        institutionAddress: "Zurich, Switzerland",
        accountNumber: "CH123456",
        accountType: "bank",
        currency: "CHF",
        maxValueDuringYear: 50000,
        maxValueUSD: 55000
      });

      report = intlOps.addFBARForeignAccount(report, {
        financialInstitution: "UK Bank",
        institutionAddress: "London, UK",
        accountNumber: "GB789012",
        accountType: "bank",
        currency: "GBP",
        maxValueDuringYear: 30000,
        maxValueUSD: 38000
      });

      expect(report.foreignAccounts.length).toBe(2);
      expect(report.aggregateMaxValue).toBe(93000);
    });

    it("should determine FBAR filing requirement", () => {
      expect(intlOps.isFBARRequired(5000)).toBe(false);
      expect(intlOps.isFBARRequired(10000)).toBe(false);
      expect(intlOps.isFBARRequired(10001)).toBe(true);
      expect(intlOps.isFBARRequired(100000)).toBe(true);
    });
  });

  describe("Compliance Calendar", () => {
    it("should generate compliance calendar for entity", () => {
      const entity = intlOps.createInternationalEntity(
        "Test UK Ltd",
        "uk_ltd",
        "GB",
        {}
      );

      const calendar = intlOps.generateComplianceCalendar(entity, 2025);
      expect(calendar.length).toBeGreaterThan(0);
      
      // Should include FATCA deadline
      expect(calendar.some(c => c.filingType === "FATCA Report")).toBe(true);
      
      // Should include CRS deadline
      expect(calendar.some(c => c.filingType === "CRS Report")).toBe(true);
      
      // Should include FBAR deadline
      expect(calendar.some(c => c.filingType === "FBAR")).toBe(true);
      
      // Should be sorted by date
      for (let i = 1; i < calendar.length; i++) {
        expect(calendar[i].date >= calendar[i-1].date).toBe(true);
      }
    });
  });

  describe("Entity Compliance Validation", () => {
    it("should validate compliant entity", () => {
      const entity = intlOps.createInternationalEntity(
        "Test UK Ltd",
        "uk_ltd",
        "GB",
        {
          registeredAddress: {
            street: "123 Test Street",
            city: "London",
            postalCode: "EC1A 1BB",
            country: "United Kingdom"
          },
          directors: [{
            name: "John Smith",
            nationality: "GB",
            residency: "GB",
            appointmentDate: "2024-01-01"
          }]
        }
      );

      const validation = intlOps.validateEntityCompliance(entity);
      expect(validation.issues.length).toBe(0);
      expect(validation.isCompliant).toBe(true);
    });

    it("should detect missing local director in Ireland", () => {
      const entity = intlOps.createInternationalEntity(
        "Test IE Ltd",
        "ireland_ltd",
        "IE",
        {
          registeredAddress: {
            street: "123 Test Street",
            city: "Dublin",
            postalCode: "D01 1AA",
            country: "Ireland"
          },
          directors: [{
            name: "John Smith",
            nationality: "US",
            residency: "US",
            appointmentDate: "2024-01-01"
          }]
        }
      );

      const validation = intlOps.validateEntityCompliance(entity);
      expect(validation.isCompliant).toBe(false);
      expect(validation.issues.some(i => i.includes("local director"))).toBe(true);
    });

    it("should detect incomplete registered address", () => {
      const entity = intlOps.createInternationalEntity(
        "Test Entity",
        "uk_ltd",
        "GB",
        {
          registeredAddress: {
            street: "",
            city: "",
            postalCode: "",
            country: "United Kingdom"
          }
        }
      );

      const validation = intlOps.validateEntityCompliance(entity);
      expect(validation.issues.some(i => i.includes("address"))).toBe(true);
    });
  });

  describe("Formation Requirements", () => {
    it("should get UK Ltd formation requirements", () => {
      const requirements = intlOps.getFormationRequirements("uk_ltd", "GB");
      
      expect(requirements.documents.length).toBeGreaterThan(0);
      expect(requirements.documents).toContain("IN01 Application form");
      expect(requirements.estimatedTimeline).toBe("24-48 hours");
      expect(requirements.minimumCapital?.amount).toBe(1);
      expect(requirements.minimumCapital?.currency).toBe("GBP");
    });

    it("should get German GmbH formation requirements", () => {
      const requirements = intlOps.getFormationRequirements("eu_gmbh", "DE");
      
      expect(requirements.documents).toContain("Notarized formation deed");
      expect(requirements.minimumCapital?.amount).toBe(25000);
      expect(requirements.minimumCapital?.currency).toBe("EUR");
      expect(requirements.estimatedTimeline).toBe("2-4 weeks");
    });

    it("should get Singapore Pte Ltd formation requirements", () => {
      const requirements = intlOps.getFormationRequirements("singapore_pte", "SG");
      
      expect(requirements.localRequirements).toContain("Local director required");
      expect(requirements.localRequirements).toContain("Local company secretary required");
      expect(requirements.estimatedTimeline).toBe("1-2 business days");
    });

    it("should throw error for unknown jurisdiction", () => {
      expect(() => {
        intlOps.getFormationRequirements("uk_ltd", "XX");
      }).toThrow("Unknown jurisdiction: XX");
    });
  });

  describe("Jurisdiction Details", () => {
    it("should have correct UK details", () => {
      const uk = intlOps.getJurisdiction("GB");
      expect(uk?.vatRate).toBe(20);
      expect(uk?.localDirectorRequired).toBe(false);
      expect(uk?.publicRegistry).toBe(true);
      expect(uk?.exchangeOfInfoAgreements).toContain("FATCA");
    });

    it("should have correct Cayman Islands details", () => {
      const cayman = intlOps.getJurisdiction("KY");
      expect(cayman?.corporateTaxRate).toBe(0);
      expect(cayman?.publicRegistry).toBe(false);
      expect(cayman?.reportingRequirements).toContain("economic_substance");
    });

    it("should have correct Switzerland details", () => {
      const ch = intlOps.getJurisdiction("CH");
      expect(ch?.corporateTaxRate).toBe(14.9);
      expect(ch?.minimumCapital?.amount).toBe(100000);
      expect(ch?.localDirectorRequired).toBe(true);
    });
  });
});
