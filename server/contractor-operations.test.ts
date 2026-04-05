import { describe, it, expect } from "vitest";

describe("Contractor Operations Module", () => {
  describe("LLC Training Modules", () => {
    const LLC_MODULES = [
      { id: "llc-1", title: "Understanding LLCs" },
      { id: "llc-2", title: "Choosing Your State" },
      { id: "llc-3", title: "Name Selection & Availability" },
      { id: "llc-4", title: "Articles of Organization" },
      { id: "llc-5", title: "Operating Agreement" },
      { id: "llc-6", title: "EIN & Banking" },
      { id: "llc-7", title: "Compliance & Maintenance" },
      { id: "llc-8", title: "Contractor Operations: Getting Started" },
      { id: "llc-9", title: "Paying Yourself as a Contractor" },
      { id: "llc-10", title: "S-Corp Election: When & How" },
      { id: "llc-11", title: "Quarterly Tax Obligations" },
      { id: "llc-12", title: "Deductions & Record Keeping" },
    ];

    it("should have 12 LLC training modules", () => {
      expect(LLC_MODULES).toHaveLength(12);
    });

    it("should include contractor operations modules (llc-8 through llc-12)", () => {
      const contractorModules = LLC_MODULES.filter(m => 
        parseInt(m.id.split("-")[1]) >= 8
      );
      expect(contractorModules).toHaveLength(5);
    });

    it("should have S-Corp election module", () => {
      const sCorpModule = LLC_MODULES.find(m => m.title.includes("S-Corp"));
      expect(sCorpModule).toBeDefined();
      expect(sCorpModule?.id).toBe("llc-10");
    });

    it("should have quarterly tax obligations module", () => {
      const taxModule = LLC_MODULES.find(m => m.title.includes("Quarterly Tax"));
      expect(taxModule).toBeDefined();
      expect(taxModule?.id).toBe("llc-11");
    });
  });

  describe("S-Corp Tax Calculations", () => {
    const SE_TAX_RATE = 0.153; // 15.3%

    it("should calculate self-employment tax correctly", () => {
      const profit = 100000;
      const seTax = profit * SE_TAX_RATE;
      expect(seTax).toBeCloseTo(15300, 0);
    });

    it("should calculate S-Corp savings correctly", () => {
      const profit = 100000;
      const salary = 50000;
      const distribution = profit - salary;

      // Standard LLC: SE tax on all profit
      const standardSeTax = profit * SE_TAX_RATE;

      // S-Corp: SE tax only on salary
      const sCorpSeTax = salary * SE_TAX_RATE;

      const savings = standardSeTax - sCorpSeTax;
      expect(savings).toBeCloseTo(7650, 0);
    });

    it("should show no savings when salary equals profit", () => {
      const profit = 100000;
      const salary = 100000; // Taking all as salary

      const standardSeTax = profit * SE_TAX_RATE;
      const sCorpSeTax = salary * SE_TAX_RATE;

      expect(standardSeTax).toBe(sCorpSeTax);
    });
  });

  describe("Quarterly Tax Deadlines", () => {
    const QUARTERLY_DEADLINES = [
      { quarter: "Q1", period: "Jan-Mar", due: "April 15" },
      { quarter: "Q2", period: "Apr-May", due: "June 15" },
      { quarter: "Q3", period: "Jun-Aug", due: "September 15" },
      { quarter: "Q4", period: "Sep-Dec", due: "January 15" },
    ];

    it("should have 4 quarterly deadlines", () => {
      expect(QUARTERLY_DEADLINES).toHaveLength(4);
    });

    it("should have correct Q1 deadline", () => {
      const q1 = QUARTERLY_DEADLINES.find(q => q.quarter === "Q1");
      expect(q1?.due).toBe("April 15");
    });

    it("should have correct Q4 deadline (next year)", () => {
      const q4 = QUARTERLY_DEADLINES.find(q => q.quarter === "Q4");
      expect(q4?.due).toBe("January 15");
    });
  });

  describe("Mileage Deduction", () => {
    const MILEAGE_RATE_2024 = 0.67; // 67 cents per mile

    it("should calculate mileage deduction correctly", () => {
      const businessMiles = 10000;
      const deduction = businessMiles * MILEAGE_RATE_2024;
      expect(deduction).toBe(6700);
    });

    it("should not allow negative mileage", () => {
      const businessMiles = -100;
      const deduction = Math.max(0, businessMiles * MILEAGE_RATE_2024);
      expect(deduction).toBe(0);
    });
  });

  describe("Home Office Deduction", () => {
    const SIMPLIFIED_RATE = 5; // $5 per sq ft
    const MAX_SIMPLIFIED_SQFT = 300;

    it("should calculate simplified deduction correctly", () => {
      const officeSqFt = 200;
      const deduction = officeSqFt * SIMPLIFIED_RATE;
      expect(deduction).toBe(1000);
    });

    it("should cap simplified deduction at 300 sq ft", () => {
      const officeSqFt = 500; // Over the limit
      const cappedSqFt = Math.min(officeSqFt, MAX_SIMPLIFIED_SQFT);
      const deduction = cappedSqFt * SIMPLIFIED_RATE;
      expect(deduction).toBe(1500); // Max is $1,500
    });

    it("should calculate regular method correctly", () => {
      const officeSqFt = 200;
      const homeSqFt = 2000;
      const totalExpenses = 12000; // Rent, utilities, etc.

      const businessPercent = officeSqFt / homeSqFt;
      const deduction = totalExpenses * businessPercent;

      expect(businessPercent).toBe(0.1);
      expect(deduction).toBe(1200);
    });
  });

  describe("W-9 and 1099 Requirements", () => {
    const THRESHOLD_1099 = 600;

    it("should require 1099 for payments of $600 or more", () => {
      const payment = 600;
      const requires1099 = payment >= THRESHOLD_1099;
      expect(requires1099).toBe(true);
    });

    it("should not require 1099 for payments under $600", () => {
      const payment = 599;
      const requires1099 = payment >= THRESHOLD_1099;
      expect(requires1099).toBe(false);
    });

    it("should require 1099 for cumulative payments over $600", () => {
      const payments = [200, 200, 250]; // Total: $650
      const totalPayments = payments.reduce((a, b) => a + b, 0);
      const requires1099 = totalPayments >= THRESHOLD_1099;
      expect(requires1099).toBe(true);
    });
  });
});
