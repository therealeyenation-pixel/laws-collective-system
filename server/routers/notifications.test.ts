import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }),
}));

describe("Notifications Router", () => {
  // Increase timeout for all tests in this suite
  vi.setConfig({ testTimeout: 15000 });
  describe("getAll", () => {
    it("should return empty array for unauthenticated users", async () => {
      // Import after mocking
      const { notificationsRouter } = await import("./notifications");
      
      // Create a mock caller without user context
      const caller = notificationsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getAll();
      
      expect(result).toEqual({
        notifications: [],
        total: 0,
        unreadCount: 0,
      });
    });
  });

  describe("getUnreadCount", () => {
    it("should return 0 for unauthenticated users", async () => {
      const { notificationsRouter } = await import("./notifications");
      
      const caller = notificationsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getUnreadCount();
      
      expect(result).toEqual({ count: 0 });
    });
  });

  describe("create", () => {
    it("should create a notification with valid input", async () => {
      const { notificationsRouter } = await import("./notifications");
      
      const caller = notificationsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.create({
        userId: 1,
        type: "info",
        title: "Test Notification",
        message: "This is a test notification message",
      });
      
      expect(result).toEqual({ success: true });
    });

    it("should create a notification with all optional fields", async () => {
      const { notificationsRouter } = await import("./notifications");
      
      const caller = notificationsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.create({
        userId: 1,
        type: "operation",
        title: "Operation Complete",
        message: "Your operation has been completed",
        entityId: 5,
        referenceType: "operation",
        referenceId: 123,
        actionUrl: "/system",
        isPriority: true,
        metadata: { key: "value" },
      });
      
      expect(result).toEqual({ success: true });
    });
  });

  describe("notification types", () => {
    it("should accept all valid notification types", async () => {
      const { notificationsRouter } = await import("./notifications");
      
      const caller = notificationsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const types = ["system", "operation", "token", "academy", "document", "approval", "alert", "success", "info"];
      
      for (const type of types) {
        const result = await caller.create({
          userId: 1,
          type: type as any,
          title: `Test ${type}`,
          message: `Testing ${type} notification`,
        });
        
        expect(result).toEqual({ success: true });
      }
    });
  });
});
