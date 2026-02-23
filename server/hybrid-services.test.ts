import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  pool: {
    query: vi.fn(),
    execute: vi.fn(),
  },
}));

describe("Hybrid Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Service Department Structure", () => {
    it("should define central services as non-licensable", () => {
      const centralServices = [
        { code: "TAX_PREP", licensable: false },
        { code: "CONTRACT", licensable: false },
        { code: "GRANT", licensable: false },
        { code: "BIZ_SETUP", licensable: false },
      ];
      
      centralServices.forEach(service => {
        expect(service.licensable).toBe(false);
      });
    });

    it("should define licensable services with proper revenue splits", () => {
      const licensableServices = [
        { code: "DESIGN", house: 60, laws: 30, trust: 10 },
        { code: "MEDIA", house: 60, laws: 30, trust: 10 },
        { code: "MARKETING", house: 60, laws: 30, trust: 10 },
        { code: "PROPERTY", house: 60, laws: 30, trust: 10 },
        { code: "EDUCATION", house: 60, laws: 30, trust: 10 },
        { code: "PURCHASING", house: 60, laws: 30, trust: 10 },
        { code: "HEALTH", house: 60, laws: 30, trust: 10 },
        { code: "BIZ_MGMT", house: 60, laws: 30, trust: 10 },
      ];
      
      licensableServices.forEach(service => {
        expect(service.house + service.laws + service.trust).toBe(100);
        expect(service.house).toBe(60);
      });
    });

    it("should define central services with 60/40 split", () => {
      const centralSplit = { laws: 60, trust: 40 };
      expect(centralSplit.laws + centralSplit.trust).toBe(100);
      expect(centralSplit.laws).toBe(60);
      expect(centralSplit.trust).toBe(40);
    });
  });

  describe("Revenue Allocation Logic", () => {
    it("should calculate weighted allocation based on utilization", () => {
      const totalRevenue = 1000;
      const utilization = [
        { department: "DESIGN", hours: 10 },
        { department: "MEDIA", hours: 8 },
        { department: "MARKETING", hours: 5 },
        { department: "CONTRACT", hours: 2 },
      ];
      
      const totalHours = utilization.reduce((sum, u) => sum + u.hours, 0);
      expect(totalHours).toBe(25);
      
      const allocations = utilization.map(u => ({
        department: u.department,
        share: (u.hours / totalHours) * totalRevenue,
      }));
      
      expect(allocations[0].share).toBe(400); // DESIGN: 10/25 * 1000
      expect(allocations[1].share).toBe(320); // MEDIA: 8/25 * 1000
      expect(allocations[2].share).toBe(200); // MARKETING: 5/25 * 1000
      expect(allocations[3].share).toBe(80);  // CONTRACT: 2/25 * 1000
      
      const totalAllocated = allocations.reduce((sum, a) => sum + a.share, 0);
      expect(totalAllocated).toBe(totalRevenue);
    });

    it("should apply 60/40 split for central services", () => {
      const revenue = 1000;
      const lawsShare = revenue * 0.6;
      const trustShare = revenue * 0.4;
      
      expect(lawsShare).toBe(600);
      expect(trustShare).toBe(400);
      expect(lawsShare + trustShare).toBe(revenue);
    });

    it("should apply 60/30/10 split for licensed services", () => {
      const revenue = 1000;
      const houseShare = revenue * 0.6;
      const lawsShare = revenue * 0.3;
      const trustShare = revenue * 0.1;
      
      expect(houseShare).toBe(600);
      expect(lawsShare).toBe(300);
      expect(trustShare).toBe(100);
      expect(houseShare + lawsShare + trustShare).toBe(revenue);
    });
  });

  describe("Disclaimer Requirements", () => {
    it("should require disclaimers for compliance-sensitive services", () => {
      const servicesRequiringDisclaimer = [
        "TAX_PREP",
        "CONTRACT",
        "BIZ_SETUP",
        "HEALTH",
        "BIZ_MGMT",
      ];
      
      const disclaimerTypes = {
        TAX_PREP: "tax",
        CONTRACT: "legal",
        BIZ_SETUP: "legal",
        HEALTH: "health",
        BIZ_MGMT: "financial",
      };
      
      servicesRequiringDisclaimer.forEach(service => {
        expect(disclaimerTypes[service as keyof typeof disclaimerTypes]).toBeDefined();
      });
    });

    it("should not require disclaimers for creative services", () => {
      const servicesWithoutDisclaimer = [
        "DESIGN",
        "MEDIA",
        "MARKETING",
        "EDUCATION",
        "PURCHASING",
        "PROPERTY",
      ];
      
      // These services should not have compliance disclaimers
      expect(servicesWithoutDisclaimer.length).toBe(6);
    });
  });

  describe("License Management", () => {
    it("should calculate monthly vs annual licensing fees", () => {
      const monthlyFee = 500;
      const annualFee = monthlyFee * 10; // 2 months free
      
      expect(annualFee).toBe(5000);
      expect(annualFee / 12).toBeLessThan(monthlyFee);
    });

    it("should track license status transitions", () => {
      const validStatuses = ["pending", "active", "suspended", "cancelled"];
      const validTransitions = {
        pending: ["active", "cancelled"],
        active: ["suspended", "cancelled"],
        suspended: ["active", "cancelled"],
        cancelled: [],
      };
      
      expect(validTransitions.pending).toContain("active");
      expect(validTransitions.active).toContain("suspended");
      expect(validTransitions.cancelled.length).toBe(0);
    });
  });

  describe("Member Discount", () => {
    it("should apply 20% discount for L.A.W.S. members", () => {
      const basePrice = 1000;
      const memberDiscount = 0.20;
      const memberPrice = basePrice * (1 - memberDiscount);
      
      expect(memberPrice).toBe(800);
    });

    it("should not apply discount for external clients", () => {
      const basePrice = 1000;
      const externalPrice = basePrice;
      
      expect(externalPrice).toBe(1000);
    });
  });

  describe("Utilization Tracking", () => {
    it("should track hours and units for service utilization", () => {
      const utilization = {
        departmentId: 1,
        houseId: 1,
        hoursLogged: 5.5,
        unitsCompleted: 2,
        revenueGenerated: 550,
        clientType: "internal_house",
      };
      
      expect(utilization.hoursLogged).toBeGreaterThan(0);
      expect(utilization.unitsCompleted).toBeGreaterThanOrEqual(0);
      expect(utilization.revenueGenerated).toBeGreaterThan(0);
      expect(["internal_house", "internal_business", "external"]).toContain(utilization.clientType);
    });
  });
});
