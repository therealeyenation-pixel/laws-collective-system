import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("./db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  },
}));

describe("Ticker Admin Features", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Ticker Seed Data", () => {
    it("should have department-specific government announcements", async () => {
      const { tickerSeedData } = await import("./services/ticker-seed-data");
      
      expect(tickerSeedData).toBeDefined();
      expect(Array.isArray(tickerSeedData)).toBe(true);
      expect(tickerSeedData.length).toBeGreaterThan(10);
      
      // Check for finance department items
      const financeItems = tickerSeedData.filter(item => item.dashboard === "finance");
      expect(financeItems.length).toBeGreaterThan(0);
      
      // Check for legal department items
      const legalItems = tickerSeedData.filter(item => item.dashboard === "legal");
      expect(legalItems.length).toBeGreaterThan(0);
      
      // Check for HR department items
      const hrItems = tickerSeedData.filter(item => item.dashboard === "hr");
      expect(hrItems.length).toBeGreaterThan(0);
    });

    it("should have required fields for each ticker item", async () => {
      const { tickerSeedData } = await import("./services/ticker-seed-data");
      
      tickerSeedData.forEach((item, index) => {
        expect(item.title, `Item ${index} missing title`).toBeDefined();
        expect(item.url, `Item ${index} missing url`).toBeDefined();
        expect(item.dashboard, `Item ${index} missing dashboard`).toBeDefined();
        expect(item.sourceName, `Item ${index} missing sourceName`).toBeDefined();
      });
    });

    it("should have valid SWOT classifications", async () => {
      const { tickerSeedData } = await import("./services/ticker-seed-data");
      const validSwotTypes = ["strength", "weakness", "opportunity", "threat"];
      
      tickerSeedData.forEach((item, index) => {
        if (item.swotType) {
          expect(
            validSwotTypes.includes(item.swotType),
            `Item ${index} has invalid swotType: ${item.swotType}`
          ).toBe(true);
        }
      });
    });
  });

  describe("Weather Alerts Service", () => {
    it("should export weather alerts router", async () => {
      const { weatherAlertsRouter } = await import("./services/weather-alerts");
      expect(weatherAlertsRouter).toBeDefined();
    });

    it("should have getAlerts procedure", async () => {
      const { weatherAlertsRouter } = await import("./services/weather-alerts");
      expect(weatherAlertsRouter._def.procedures.getAlerts).toBeDefined();
    });

    it("should have getAlertsByState procedure", async () => {
      const { weatherAlertsRouter } = await import("./services/weather-alerts");
      expect(weatherAlertsRouter._def.procedures.getAlertsByState).toBeDefined();
    });

    it("should have getAlertSummary procedure", async () => {
      const { weatherAlertsRouter } = await import("./services/weather-alerts");
      expect(weatherAlertsRouter._def.procedures.getAlertSummary).toBeDefined();
    });
  });

  describe("Ticker Content Categories", () => {
    it("should cover all major departments", async () => {
      const { tickerSeedData } = await import("./services/ticker-seed-data");
      
      const departments = new Set(tickerSeedData.map(item => item.dashboard));
      
      expect(departments.has("finance")).toBe(true);
      expect(departments.has("legal")).toBe(true);
      expect(departments.has("hr")).toBe(true);
      expect(departments.has("governance")).toBe(true);
      expect(departments.has("operations")).toBe(true);
      expect(departments.has("health")).toBe(true);
      expect(departments.has("education")).toBe(true);
      expect(departments.has("business")).toBe(true);
    });

    it("should have government sources", async () => {
      const { tickerSeedData } = await import("./services/ticker-seed-data");
      
      const sources = new Set(tickerSeedData.map(item => item.sourceName));
      
      // Check for key government sources
      expect(sources.has("IRS")).toBe(true);
      expect(sources.has("DOL")).toBe(true);
      expect(sources.has("SEC")).toBe(true);
    });
  });
});
