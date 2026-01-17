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
  asc: vi.fn((a) => ({ type: "asc", a })),
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

describe("Procedures Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return empty array when no procedures exist", async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.procedures.list();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it("should return procedures when they exist", async () => {
      const mockProcedures = [
        { id: 1, title: "Test SOP", category: "sop", status: "approved" },
        { id: 2, title: "Test Manual", category: "manual", status: "draft" },
      ];
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockProcedures),
            }),
            orderBy: vi.fn().mockResolvedValue(mockProcedures),
          }),
        }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.procedures.list();
      expect(result).toHaveLength(2);
    });

    it("should accept filter parameters", async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.procedures.list({
        category: "sop",
        department: "HR",
        status: "approved",
        search: "test",
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("create", () => {
    it("should create a new procedure", async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
        }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.procedures.create({
        title: "Test Procedure",
        category: "sop",
        description: "Test description",
        department: "HR",
      });
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("message", "Procedure created successfully");
    });
  });

  describe("update", () => {
    it("should update a procedure", async () => {
      const mockDb = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.procedures.update({
        id: 1,
        title: "Updated Procedure",
        status: "approved",
      });
      expect(result).toHaveProperty("message", "Procedure updated successfully");
    });
  });

  describe("delete", () => {
    it("should delete a procedure", async () => {
      const mockDb = {
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.procedures.delete({ id: 1 });
      expect(result).toHaveProperty("message", "Procedure deleted successfully");
    });
  });

  describe("approve", () => {
    it("should approve a procedure", async () => {
      const mockDb = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.procedures.approve({ id: 1 });
      expect(result).toHaveProperty("message", "Procedure approved successfully");
    });
  });

  describe("getCategories", () => {
    it("should return categories array", async () => {
      const mockCategories = [
        { id: 1, name: "HR", sortOrder: 1 },
        { id: 2, name: "Finance", sortOrder: 2 },
      ];
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockCategories),
          }),
        }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.procedures.getCategories();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });
  });

  describe("createCategory", () => {
    it("should create a new category", async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
        }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.procedures.createCategory({
        name: "Test Category",
        description: "Test description",
      });
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("message", "Category created successfully");
    });
  });

  describe("getStats", () => {
    it("should return default stats when db is null", async () => {
      vi.mocked(getDb).mockResolvedValue(null as any);

      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.procedures.getStats();
      expect(result).toHaveProperty("total", 0);
      expect(result).toHaveProperty("approved", 0);
      expect(result).toHaveProperty("byCategory");
      expect(result).toHaveProperty("byDepartment");
    });
  });

  describe("getPendingAcknowledgments", () => {
    it("should return pending acknowledgments array", async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.procedures.getPendingAcknowledgments();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("acknowledge", () => {
    it("should acknowledge a procedure", async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
        }),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.procedures.acknowledge({
        procedureId: 1,
        version: "1.0",
      });
      expect(result).toHaveProperty("message", "Procedure acknowledged successfully");
    });
  });
});
