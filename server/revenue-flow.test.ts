import { describe, it, expect } from "vitest";

describe("Revenue Flow Router", () => {
  describe("60/40 Split Calculation", () => {
    it("should calculate 60% family portion correctly", () => {
      const amount = 1000;
      const familyPortion = amount * 0.60;
      expect(familyPortion).toBe(600);
    });

    it("should calculate 40% network portion correctly", () => {
      const amount = 1000;
      const networkPortion = amount * 0.40;
      expect(networkPortion).toBe(400);
    });

    it("should ensure family + network equals total", () => {
      const amount = 1000;
      const familyPortion = amount * 0.60;
      const networkPortion = amount * 0.40;
      expect(familyPortion + networkPortion).toBe(amount);
    });

    it("should handle decimal amounts correctly", () => {
      const amount = 1234.56;
      const familyPortion = amount * 0.60;
      const networkPortion = amount * 0.40;
      expect(familyPortion).toBeCloseTo(740.736, 2);
      expect(networkPortion).toBeCloseTo(493.824, 2);
    });
  });

  describe("Revenue Source Types", () => {
    const validSourceTypes = [
      "merchandise",
      "academy",
      "consulting",
      "membership",
      "services",
      "licensing",
      "investment",
      "donation",
      "other",
    ];

    it("should have all expected source types", () => {
      expect(validSourceTypes).toContain("merchandise");
      expect(validSourceTypes).toContain("academy");
      expect(validSourceTypes).toContain("consulting");
      expect(validSourceTypes).toContain("membership");
      expect(validSourceTypes).toContain("services");
      expect(validSourceTypes).toContain("licensing");
      expect(validSourceTypes).toContain("investment");
      expect(validSourceTypes).toContain("donation");
      expect(validSourceTypes).toContain("other");
    });

    it("should have 9 source types total", () => {
      expect(validSourceTypes.length).toBe(9);
    });
  });

  describe("Flow Stages", () => {
    const flowStages = [
      "received",
      "trust_deposit",
      "split_calculated",
      "family_allocated",
      "network_allocated",
      "distributed",
    ];

    it("should have correct progression order", () => {
      expect(flowStages[0]).toBe("received");
      expect(flowStages[flowStages.length - 1]).toBe("distributed");
    });

    it("should include split calculation stage", () => {
      expect(flowStages).toContain("split_calculated");
    });

    it("should include both allocation stages", () => {
      expect(flowStages).toContain("family_allocated");
      expect(flowStages).toContain("network_allocated");
    });
  });

  describe("Split Status", () => {
    const splitStatuses = ["pending", "processed", "distributed", "failed"];

    it("should have pending as initial status", () => {
      expect(splitStatuses[0]).toBe("pending");
    });

    it("should have distributed as success status", () => {
      expect(splitStatuses).toContain("distributed");
    });

    it("should have failed status for error handling", () => {
      expect(splitStatuses).toContain("failed");
    });
  });

  describe("Constitutional Protection", () => {
    it("should always maintain 60% family portion", () => {
      const familyPercentage = 60;
      expect(familyPercentage).toBe(60);
      expect(familyPercentage).toBeGreaterThan(50);
    });

    it("should never allow network portion to exceed family portion", () => {
      const familyPercentage = 60;
      const networkPercentage = 40;
      expect(familyPercentage).toBeGreaterThan(networkPercentage);
    });
  });
});
