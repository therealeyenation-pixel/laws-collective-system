import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn(() => ({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => Promise.resolve([])),
        })),
        orderBy: vi.fn(() => Promise.resolve([])),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve({ insertId: 1 })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve({ affectedRows: 1 })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve({ affectedRows: 1 })),
    })),
  })),
}));

describe("Creative Enterprise Router", () => {
  const mockUser = {
    id: 1,
    openId: "test-open-id",
    name: "Test User",
    role: "admin" as const,
    email: "test@example.com",
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createCaller = () => {
    return appRouter.createCaller({
      user: mockUser,
    });
  };

  describe("creativeEnterprise.getStats", () => {
    it("should return stats object with expected fields", async () => {
      const caller = createCaller();
      const stats = await caller.creativeEnterprise.getStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats.totalArtists).toBe("number");
      expect(typeof stats.totalProductions).toBe("number");
      expect(typeof stats.totalRevenue).toBe("number");
    });
  });

  describe("creativeEnterprise.getAllArtists", () => {
    it("should return an array of artists", async () => {
      const caller = createCaller();
      const artists = await caller.creativeEnterprise.getAllArtists();
      
      expect(Array.isArray(artists)).toBe(true);
    });
  });

  describe("creativeEnterprise.getAllProductions", () => {
    it("should return an array of productions", async () => {
      const caller = createCaller();
      const productions = await caller.creativeEnterprise.getAllProductions();
      
      expect(Array.isArray(productions)).toBe(true);
    });
  });

  describe("creativeEnterprise.getAllBookings", () => {
    it("should return an array of bookings", async () => {
      const caller = createCaller();
      const bookings = await caller.creativeEnterprise.getAllBookings();
      
      expect(Array.isArray(bookings)).toBe(true);
    });
  });

  describe("creativeEnterprise.getUpcomingBookings", () => {
    it("should return an array of upcoming bookings", async () => {
      const caller = createCaller();
      const bookings = await caller.creativeEnterprise.getUpcomingBookings();
      
      expect(Array.isArray(bookings)).toBe(true);
    });
  });
});

describe("Design Department Router", () => {
  const mockUser = {
    id: 1,
    openId: "test-open-id",
    name: "Test User",
    role: "admin" as const,
    email: "test@example.com",
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createCaller = () => {
    return appRouter.createCaller({
      user: mockUser,
    });
  };

  describe("designDepartment.getStats", () => {
    it("should return stats object with expected fields", async () => {
      const caller = createCaller();
      const stats = await caller.designDepartment.getStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats.totalProjects).toBe("number");
      expect(typeof stats.activeProjects).toBe("number");
      expect(typeof stats.totalAssets).toBe("number");
      expect(typeof stats.designers).toBe("number");
      expect(typeof stats.totalBilled).toBe("number");
    });
  });

  describe("designDepartment.getAllProjects", () => {
    it("should return an array of projects", async () => {
      const caller = createCaller();
      const projects = await caller.designDepartment.getAllProjects();
      
      expect(Array.isArray(projects)).toBe(true);
    });
  });

  describe("designDepartment.getActiveProjects", () => {
    it("should return an array of active projects", async () => {
      const caller = createCaller();
      const projects = await caller.designDepartment.getActiveProjects();
      
      expect(Array.isArray(projects)).toBe(true);
    });
  });

  describe("designDepartment.getAllAssets", () => {
    it("should return an array of assets", async () => {
      const caller = createCaller();
      const assets = await caller.designDepartment.getAllAssets();
      
      expect(Array.isArray(assets)).toBe(true);
    });
  });

  describe("designDepartment.getProjectsByType", () => {
    it("should return an array of projects by type", async () => {
      const caller = createCaller();
      const projects = await caller.designDepartment.getProjectsByType({ projectType: "brand_identity" });
      
      expect(Array.isArray(projects)).toBe(true);
    });
  });
});
