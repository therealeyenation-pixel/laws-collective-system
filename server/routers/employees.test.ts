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
  like: vi.fn((a, b) => ({ type: "like", a, b })),
  or: vi.fn((...args) => ({ type: "or", args })),
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

describe("Employees Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return empty array when database is unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.employees.getAll({});
      expect(result).toEqual([]);
    });

    it("should return employees with entity names", async () => {
      const mockEmployees = [
        {
          employee: {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            entityId: 1,
            department: "Engineering",
            jobTitle: "Developer",
            positionLevel: "specialist",
            employmentType: "full_time",
            workLocation: "remote",
            startDate: new Date(),
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          entity: {
            id: 1,
            name: "Test Entity",
          },
        },
      ];

      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockEmployees),
        where: vi.fn().mockResolvedValue(mockEmployees),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.employees.getAll({});
      expect(result.length).toBe(1);
      expect(result[0].entityName).toBe("Test Entity");
    });
  });

  describe("getById", () => {
    it("should return null when database is unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.employees.getById({ id: 1 });
      expect(result).toBeNull();
    });

    it("should return null when employee not found", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.employees.getById({ id: 999 });
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should throw error when database is unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.employees.create({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          entityId: 1,
          department: "Engineering",
          jobTitle: "Developer",
          positionLevel: "specialist",
          startDate: new Date(),
        })
      ).rejects.toThrow("Database unavailable");
    });

    it("should create employee successfully", async () => {
      const mockDb = {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.employees.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        entityId: 1,
        department: "Engineering",
        jobTitle: "Developer",
        positionLevel: "specialist",
        startDate: new Date(),
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe(1);
      expect(result.message).toContain("John Doe");
    });
  });

  describe("update", () => {
    it("should throw error when database is unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.employees.update({
          id: 1,
          firstName: "Jane",
        })
      ).rejects.toThrow("Database unavailable");
    });

    it("should update employee successfully", async () => {
      const mockDb = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ affectedRows: 1 }]),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.employees.update({
        id: 1,
        firstName: "Jane",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Employee updated successfully");
    });
  });

  describe("delete", () => {
    it("should throw error when database is unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.employees.delete({ id: 1 })).rejects.toThrow("Database unavailable");
    });

    it("should delete employee successfully", async () => {
      const mockDb = {
        delete: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ affectedRows: 1 }]),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.employees.delete({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Employee deleted successfully");
    });
  });

  describe("getDepartments", () => {
    it("should return empty array when database is unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.employees.getDepartments();
      expect(result).toEqual([]);
    });

    it("should return unique departments", async () => {
      const mockDb = {
        selectDistinct: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          { department: "Engineering" },
          { department: "HR" },
        ]),
      };

      vi.mocked(getDb).mockResolvedValue(mockDb as any);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.employees.getDepartments();
      expect(result).toEqual(["Engineering", "HR"]);
    });
  });

  describe("getStats", () => {
    it("should return default stats when database is unavailable", async () => {
      vi.mocked(getDb).mockResolvedValue(null);
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.employees.getStats();
      expect(result).toEqual({ total: 0, active: 0, byDepartment: [], byEntity: [] });
    });
  });
});
