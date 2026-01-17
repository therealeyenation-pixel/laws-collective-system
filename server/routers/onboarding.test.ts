import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

// Mock the database
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

// Mock drizzle-orm functions
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a, b) => ({ type: "eq", a, b })),
  desc: vi.fn((a) => ({ type: "desc", a })),
  and: vi.fn((...args) => ({ type: "and", args })),
  sql: vi.fn(),
}));

import { getDb } from "../db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-open-id",
    name: "Test User",
    email: "test@example.com",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    loginMethod: "manus",
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Onboarding Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getChecklists", () => {
    it("should return empty array when database unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.onboarding.getChecklists();
      expect(result).toEqual([]);
    });

    it("should return checklists with item counts", async () => {
      const mockChecklists = [
        { id: 1, name: "Standard Onboarding", description: "Default checklist", isDefault: true, createdAt: new Date(), updatedAt: new Date() },
      ];
      const mockItems = [
        { id: 1, checklistId: 1, title: "Task 1" },
        { id: 2, checklistId: 1, title: "Task 2" },
      ];

      // Create a fresh mock for each call
      let callCount = 0;
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockImplementation(() => {
          callCount++;
          return Promise.resolve(callCount === 1 ? mockChecklists : mockItems);
        }),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.onboarding.getChecklists();
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Standard Onboarding");
    });
  });

  describe("getChecklistById", () => {
    it("should return null when database unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.onboarding.getChecklistById({ id: 1 });
      expect(result).toBeNull();
    });

    it("should return null when checklist not found", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
        orderBy: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.onboarding.getChecklistById({ id: 999 });
      expect(result).toBeNull();
    });
  });

  describe("createChecklist", () => {
    it("should throw error when database unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.onboarding.createChecklist({ name: "Test Checklist" }))
        .rejects.toThrow("Database unavailable");
    });

    it("should create checklist successfully", async () => {
      const mockDb = {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.onboarding.createChecklist({ 
        name: "New Checklist",
        description: "Test description",
        department: "HR",
        positionLevel: "specialist",
        isDefault: false,
      });
      
      expect(result.success).toBe(true);
      expect(result.id).toBe(1);
    });
  });

  describe("addChecklistItem", () => {
    it("should throw error when database unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.onboarding.addChecklistItem({ checklistId: 1, title: "Test Item" }))
        .rejects.toThrow("Database unavailable");
    });

    it("should add item to checklist", async () => {
      const mockDb = {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue([{ insertId: 5 }]),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.onboarding.addChecklistItem({ 
        checklistId: 1,
        title: "New Task",
        description: "Task description",
        category: "training",
        dueWithinDays: 7,
        assignedTo: "manager",
        isRequired: true,
      });
      
      expect(result.success).toBe(true);
      expect(result.id).toBe(5);
    });
  });

  describe("getAllOnboarding", () => {
    it("should return empty array when database unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.onboarding.getAllOnboarding();
      expect(result).toEqual([]);
    });
  });

  describe("getStats", () => {
    it("should return zero stats when database unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.onboarding.getStats();
      expect(result).toEqual({ total: 0, inProgress: 0, completed: 0, onHold: 0 });
    });

    it("should return correct stats", async () => {
      const mockOnboardings = [
        { id: 1, status: "in_progress" },
        { id: 2, status: "in_progress" },
        { id: 3, status: "completed" },
        { id: 4, status: "on_hold" },
      ];

      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockResolvedValue(mockOnboardings),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.onboarding.getStats();
      
      expect(result.total).toBe(4);
      expect(result.inProgress).toBe(2);
      expect(result.completed).toBe(1);
      expect(result.onHold).toBe(1);
    });
  });

  describe("getHiredApplications", () => {
    it("should return empty array when database unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.onboarding.getHiredApplications();
      expect(result).toEqual([]);
    });
  });

  describe("updateTaskProgress", () => {
    it("should throw error when database unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.onboarding.updateTaskProgress({ taskProgressId: 1, status: "completed" }))
        .rejects.toThrow("Database unavailable");
    });
  });

  describe("getOnboardingById", () => {
    it("should return null when database unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.onboarding.getOnboardingById({ id: 1 });
      expect(result).toBeNull();
    });
  });

  describe("getDefaultChecklist", () => {
    it("should return null when database unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.onboarding.getDefaultChecklist({});
      expect(result).toBeNull();
    });
  });
});
