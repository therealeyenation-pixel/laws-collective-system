import { describe, it, expect } from "vitest";

// Test procurement catalog data structures and calculations
describe("Procurement Catalog", () => {
  // Equipment package costs
  const equipmentPackages = {
    basic_remote: 1500,
    standard_remote: 2500,
    manager_remote: 3500,
    executive_remote: 5000,
    design_package: 4500,
    media_package: 4000,
    finance_package: 3000,
  };

  // Benefits annual costs
  const benefitsPackages = {
    standard: 7200,
    enhanced: 14280,
    executive: 34920,
  };

  // Startup costs
  const startupCosts = {
    onboarding: 500,
    background_check: 150,
    it_setup: 100,
    office_supplies: 200,
    business_cards: 50,
  };

  describe("Equipment Packages", () => {
    it("should have correct costs for each package", () => {
      expect(equipmentPackages.basic_remote).toBe(1500);
      expect(equipmentPackages.standard_remote).toBe(2500);
      expect(equipmentPackages.manager_remote).toBe(3500);
      expect(equipmentPackages.executive_remote).toBe(5000);
      expect(equipmentPackages.design_package).toBe(4500);
      expect(equipmentPackages.media_package).toBe(4000);
      expect(equipmentPackages.finance_package).toBe(3000);
    });

    it("should have manager package more expensive than coordinator", () => {
      expect(equipmentPackages.manager_remote).toBeGreaterThan(equipmentPackages.standard_remote);
    });

    it("should have executive package as most expensive", () => {
      const maxCost = Math.max(...Object.values(equipmentPackages));
      expect(equipmentPackages.executive_remote).toBe(maxCost);
    });
  });

  describe("Benefits Packages", () => {
    it("should have correct annual costs", () => {
      expect(benefitsPackages.standard).toBe(7200);
      expect(benefitsPackages.enhanced).toBe(14280);
      expect(benefitsPackages.executive).toBe(34920);
    });

    it("should have enhanced benefits more than standard", () => {
      expect(benefitsPackages.enhanced).toBeGreaterThan(benefitsPackages.standard);
    });

    it("should have executive benefits most expensive", () => {
      expect(benefitsPackages.executive).toBeGreaterThan(benefitsPackages.enhanced);
    });
  });

  describe("Startup Costs", () => {
    it("should calculate total startup cost correctly", () => {
      const total = Object.values(startupCosts).reduce((sum, cost) => sum + cost, 0);
      expect(total).toBe(1000);
    });
  });

  describe("Total Package Cost Calculation", () => {
    it("should calculate Year 1 cost for a manager correctly", () => {
      const salary = 108000;
      const equipment = equipmentPackages.manager_remote;
      const benefits = benefitsPackages.enhanced;
      const startup = Object.values(startupCosts).reduce((sum, cost) => sum + cost, 0);
      
      const year1Total = salary + equipment + benefits + startup;
      expect(year1Total).toBe(108000 + 3500 + 14280 + 1000);
      expect(year1Total).toBe(126780);
    });

    it("should calculate Year 1 cost for a coordinator correctly", () => {
      const salary = 79200;
      const equipment = equipmentPackages.standard_remote;
      const benefits = benefitsPackages.standard;
      const startup = Object.values(startupCosts).reduce((sum, cost) => sum + cost, 0);
      
      const year1Total = salary + equipment + benefits + startup;
      expect(year1Total).toBe(79200 + 2500 + 7200 + 1000);
      expect(year1Total).toBe(89900);
    });

    it("should calculate ongoing annual cost (no equipment/startup)", () => {
      const salary = 108000;
      const benefits = benefitsPackages.enhanced;
      
      const ongoingAnnual = salary + benefits;
      expect(ongoingAnnual).toBe(122280);
    });
  });

  describe("Budget Summary Calculation", () => {
    it("should calculate total budget for 12 candidates", () => {
      // Based on user's actual template data
      const candidates = [
        { salary: 102000, equipment: 3500, tier: "manager" },
        { salary: 102000, equipment: 4500, tier: "manager" },
        { salary: 102000, equipment: 3000, tier: "manager" },
        { salary: 102000, equipment: 3500, tier: "manager" },
        { salary: 102000, equipment: 4000, tier: "manager" },
        { salary: 109500, equipment: 3500, tier: "manager" },
        { salary: 106000, equipment: 3500, tier: "manager" },
        { salary: 106000, equipment: 3500, tier: "manager" },
        { salary: 109500, equipment: 3500, tier: "manager" },
        { salary: 108000, equipment: 3500, tier: "manager" },
        { salary: 108000, equipment: 3500, tier: "manager" },
        { salary: 108000, equipment: 3500, tier: "manager" },
      ];

      const totalSalary = candidates.reduce((sum, c) => sum + c.salary, 0);
      const totalEquipment = candidates.reduce((sum, c) => sum + c.equipment, 0);
      
      expect(totalSalary).toBe(1265000);
      expect(totalEquipment).toBe(43000);
    });

    it("should calculate benefits at 30% of salary", () => {
      const totalSalary = 1265000;
      const benefitsRate = 0.30;
      const totalBenefits = Math.floor(totalSalary * benefitsRate);
      
      expect(totalBenefits).toBe(379500);
    });
  });
});
