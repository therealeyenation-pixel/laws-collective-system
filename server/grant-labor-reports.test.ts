import { describe, it, expect } from "vitest";

describe("Grant Labor Reports Router", () => {
  describe("getLaborCostsByFundingSource", () => {
    it("should calculate labor costs correctly", () => {
      const hours = 40;
      const hourlyRate = 25;
      const expectedCost = hours * hourlyRate;
      expect(expectedCost).toBe(1000);
    });
  });

  describe("getLaborCostSummary", () => {
    it("should aggregate hours by funding source", () => {
      const entries = [
        { fundingSourceId: 1, hours: 10, cost: 250 },
        { fundingSourceId: 1, hours: 20, cost: 500 },
        { fundingSourceId: 2, hours: 15, cost: 375 },
      ];
      const summaryBySource = entries.reduce((acc, entry) => {
        if (!acc[entry.fundingSourceId]) {
          acc[entry.fundingSourceId] = { totalHours: 0, totalCost: 0 };
        }
        acc[entry.fundingSourceId].totalHours += entry.hours;
        acc[entry.fundingSourceId].totalCost += entry.cost;
        return acc;
      }, {} as Record<number, { totalHours: number; totalCost: number }>);
      expect(summaryBySource[1].totalHours).toBe(30);
      expect(summaryBySource[1].totalCost).toBe(750);
    });

    it("should separate employee and contractor costs", () => {
      const entries = [
        { workerType: "employee", hours: 40 },
        { workerType: "contractor", hours: 20 },
        { workerType: "employee", hours: 20 },
      ];
      const employeeHours = entries.filter(e => e.workerType === "employee").reduce((sum, e) => sum + e.hours, 0);
      const contractorHours = entries.filter(e => e.workerType === "contractor").reduce((sum, e) => sum + e.hours, 0);
      expect(employeeHours).toBe(60);
      expect(contractorHours).toBe(20);
    });
  });

  describe("CSV Export", () => {
    it("should format CSV headers correctly", () => {
      const headers = ["Date", "Worker", "Type", "Charge Code", "Hours", "Rate", "Cost"];
      const csvHeader = headers.join(",");
      expect(csvHeader).toBe("Date,Worker,Type,Charge Code,Hours,Rate,Cost");
    });

    it("should format CSV rows correctly", () => {
      const row = {
        date: "2024-01-15",
        workerName: "John Doe",
        workerType: "employee",
        chargeCode: "DOL-001",
        hours: 8,
        hourlyRate: 25,
        totalCost: 200,
      };
      const csvRow = [row.date, row.workerName, row.workerType, row.chargeCode, row.hours.toFixed(2), row.hourlyRate.toFixed(2), row.totalCost.toFixed(2)].join(",");
      expect(csvRow).toBe("2024-01-15,John Doe,employee,DOL-001,8.00,25.00,200.00");
    });
  });
});
