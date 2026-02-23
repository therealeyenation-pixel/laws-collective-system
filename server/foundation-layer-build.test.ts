/**
 * Foundation Layer Build Tests
 * Tests for M&E Dashboard, Risk & Contingency, Facilities & Land Registry
 */

import { describe, it, expect } from "vitest";
import {
  calculateMetricStatus,
  calculateTrend,
  createMEMetricData,
  generateMEReportSummary,
  calculateRiskScore,
  getRiskLevel,
  createRiskData,
  prioritizeRisks,
  getRiskMatrix,
  calculateFacilityROI,
  createFacilityData,
  createLandParcelData,
  calculateLandAppreciation,
  getFoundationLayerSummary
} from "./services/foundation-layer-build";

describe("Foundation Layer Build Service", () => {
  describe("M&E Dashboard Functions", () => {
    it("should calculate metric status correctly", () => {
      expect(calculateMetricStatus(95, 100)).toBe("on_track");
      expect(calculateMetricStatus(80, 100)).toBe("at_risk");
      expect(calculateMetricStatus(50, 100)).toBe("off_track");
    });

    it("should calculate trend correctly", () => {
      expect(calculateTrend([100, 110, 120])).toBe("up");
      expect(calculateTrend([100, 90, 80])).toBe("down");
      expect(calculateTrend([100, 101, 99])).toBe("stable");
    });

    it("should return stable for insufficient data", () => {
      expect(calculateTrend([100])).toBe("stable");
      expect(calculateTrend([])).toBe("stable");
    });

    it("should create M&E metric data", () => {
      const metric = createMEMetricData("Test Metric", "output", 100, "count", "monthly");
      
      expect(metric.name).toBe("Test Metric");
      expect(metric.category).toBe("output");
      expect(metric.targetValue).toBe(100);
      expect(metric.currentValue).toBe(0);
      expect(metric.unit).toBe("count");
      expect(metric.frequency).toBe("monthly");
      expect(metric.status).toBe("on_track");
    });

    it("should generate M&E report summary", () => {
      const metrics = [
        { id: 1, name: "M1", category: "output" as const, targetValue: 100, currentValue: 95, unit: "count", frequency: "monthly" as const, lastUpdated: new Date(), trend: "up" as const, status: "on_track" as const },
        { id: 2, name: "M2", category: "outcome" as const, targetValue: 100, currentValue: 75, unit: "count", frequency: "monthly" as const, lastUpdated: new Date(), trend: "stable" as const, status: "at_risk" as const },
        { id: 3, name: "M3", category: "impact" as const, targetValue: 100, currentValue: 50, unit: "count", frequency: "monthly" as const, lastUpdated: new Date(), trend: "down" as const, status: "off_track" as const }
      ];

      const summary = generateMEReportSummary(metrics);
      
      expect(summary.totalMetrics).toBe(3);
      expect(summary.onTrack).toBe(1);
      expect(summary.atRisk).toBe(1);
      expect(summary.offTrack).toBe(1);
      expect(summary.overallHealth).toBe("critical"); // 1/3 = 33% off track > 30% threshold
    });

    it("should detect critical health status", () => {
      const metrics = [
        { id: 1, name: "M1", category: "output" as const, targetValue: 100, currentValue: 50, unit: "count", frequency: "monthly" as const, lastUpdated: new Date(), trend: "down" as const, status: "off_track" as const },
        { id: 2, name: "M2", category: "output" as const, targetValue: 100, currentValue: 50, unit: "count", frequency: "monthly" as const, lastUpdated: new Date(), trend: "down" as const, status: "off_track" as const }
      ];

      const summary = generateMEReportSummary(metrics);
      expect(summary.overallHealth).toBe("critical");
    });
  });

  describe("Risk & Contingency Functions", () => {
    it("should calculate risk score", () => {
      expect(calculateRiskScore(1, 1)).toBe(1);
      expect(calculateRiskScore(3, 3)).toBe(9);
      expect(calculateRiskScore(5, 5)).toBe(25);
    });

    it("should get risk level", () => {
      expect(getRiskLevel(1)).toBe("low");
      expect(getRiskLevel(4)).toBe("low");
      expect(getRiskLevel(5)).toBe("medium");
      expect(getRiskLevel(9)).toBe("medium");
      expect(getRiskLevel(10)).toBe("high");
      expect(getRiskLevel(16)).toBe("high");
      expect(getRiskLevel(17)).toBe("critical");
      expect(getRiskLevel(25)).toBe("critical");
    });

    it("should create risk data", () => {
      const risk = createRiskData("Test Risk", "Description", "operational", 3, 4, 1);
      
      expect(risk.title).toBe("Test Risk");
      expect(risk.description).toBe("Description");
      expect(risk.category).toBe("operational");
      expect(risk.likelihood).toBe(3);
      expect(risk.impact).toBe(4);
      expect(risk.riskScore).toBe(12);
      expect(risk.status).toBe("identified");
      expect(risk.owner).toBe(1);
    });

    it("should prioritize risks by score", () => {
      const risks = [
        { id: 1, title: "Low", riskScore: 4 } as any,
        { id: 2, title: "High", riskScore: 20 } as any,
        { id: 3, title: "Medium", riskScore: 9 } as any
      ];

      const prioritized = prioritizeRisks(risks);
      
      expect(prioritized[0].title).toBe("High");
      expect(prioritized[1].title).toBe("Medium");
      expect(prioritized[2].title).toBe("Low");
    });

    it("should generate risk matrix", () => {
      const matrix = getRiskMatrix();
      
      expect(matrix.length).toBe(25); // 5x5
      expect(matrix.find(m => m.likelihood === 1 && m.impact === 1)?.level).toBe("low");
      expect(matrix.find(m => m.likelihood === 5 && m.impact === 5)?.level).toBe("critical");
    });
  });

  describe("Facilities & Land Registry Functions", () => {
    it("should calculate facility ROI", () => {
      const facility = {
        id: 1,
        name: "Test",
        type: "office" as const,
        address: "123 Main",
        city: "City",
        state: "ST",
        zipCode: "12345",
        country: "USA",
        squareFootage: 1000,
        ownershipType: "owned" as const,
        status: "active" as const,
        acquiredDate: new Date(),
        value: 100000,
        annualCost: 10000
      };

      const roi = calculateFacilityROI(facility, 20000);
      expect(roi).toBe(10); // (20000 - 10000) / 100000 * 100
    });

    it("should return 0 ROI for zero cost", () => {
      const facility = {
        id: 1,
        name: "Test",
        type: "office" as const,
        address: "123 Main",
        city: "City",
        state: "ST",
        zipCode: "12345",
        country: "USA",
        squareFootage: 1000,
        ownershipType: "owned" as const,
        status: "active" as const,
        acquiredDate: new Date(),
        value: 100000,
        annualCost: 0
      };

      expect(calculateFacilityROI(facility, 20000)).toBe(0);
    });

    it("should create facility data", () => {
      const facility = createFacilityData(
        "HQ Office",
        "office",
        "123 Main St",
        "Austin",
        "TX",
        "78701",
        5000,
        "owned",
        500000,
        50000
      );

      expect(facility.name).toBe("HQ Office");
      expect(facility.type).toBe("office");
      expect(facility.city).toBe("Austin");
      expect(facility.state).toBe("TX");
      expect(facility.squareFootage).toBe(5000);
      expect(facility.ownershipType).toBe("owned");
      expect(facility.value).toBe(500000);
      expect(facility.annualCost).toBe(50000);
      expect(facility.status).toBe("active");
      expect(facility.country).toBe("USA");
    });

    it("should create land parcel data", () => {
      const parcel = createLandParcelData(
        "PARCEL-001",
        "North Tract",
        50,
        "Agricultural",
        "Rural Route 1",
        "Travis",
        "TX",
        "fee_simple",
        250000
      );

      expect(parcel.parcelId).toBe("PARCEL-001");
      expect(parcel.name).toBe("North Tract");
      expect(parcel.acreage).toBe(50);
      expect(parcel.zoning).toBe("Agricultural");
      expect(parcel.county).toBe("Travis");
      expect(parcel.ownershipType).toBe("fee_simple");
      expect(parcel.purchasePrice).toBe(250000);
      expect(parcel.currentValue).toBe(250000);
      expect(parcel.taxAssessment).toBe(200000); // 80% of purchase
      expect(parcel.annualTaxes).toBe(3000); // 1.5% of assessment
      expect(parcel.status).toBe("active");
    });

    it("should calculate land appreciation", () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const parcel = {
        id: 1,
        parcelId: "P1",
        name: "Test",
        acreage: 10,
        zoning: "Residential",
        address: "123 Land",
        county: "Travis",
        state: "TX",
        ownershipType: "fee_simple" as const,
        acquiredDate: oneYearAgo,
        purchasePrice: 100000,
        currentValue: 110000,
        taxAssessment: 80000,
        annualTaxes: 1200,
        encumbrances: [],
        status: "active" as const
      };

      const appreciation = calculateLandAppreciation(parcel);
      expect(appreciation).toBeCloseTo(10, 0); // ~10% per year
    });

    it("should return 0 appreciation for new parcels", () => {
      const parcel = {
        id: 1,
        parcelId: "P1",
        name: "Test",
        acreage: 10,
        zoning: "Residential",
        address: "123 Land",
        county: "Travis",
        state: "TX",
        ownershipType: "fee_simple" as const,
        acquiredDate: new Date(),
        purchasePrice: 100000,
        currentValue: 100000,
        taxAssessment: 80000,
        annualTaxes: 1200,
        encumbrances: [],
        status: "active" as const
      };

      expect(calculateLandAppreciation(parcel)).toBe(0);
    });
  });

  describe("Foundation Layer Summary", () => {
    it("should return correct summary", () => {
      const summary = getFoundationLayerSummary();

      expect(summary.modules).toContain("Monitoring & Evaluation");
      expect(summary.modules).toContain("Risk & Contingency");
      expect(summary.modules).toContain("Facilities & Land Registry");
      expect(summary.meCategories).toEqual(["output", "outcome", "impact"]);
      expect(summary.riskCategories).toContain("strategic");
      expect(summary.riskLevels).toEqual(["low", "medium", "high", "critical"]);
      expect(summary.facilityTypes).toContain("office");
      expect(summary.ownershipTypes).toContain("fee_simple");
    });
  });
});
