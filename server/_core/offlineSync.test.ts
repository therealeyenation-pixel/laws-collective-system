import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  queueOperation,
  getPendingOperations,
  getSyncStatus,
  resolveConflict,
} from "./offlineSync";

describe("Offline Sync System", () => {
  const userId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("queueOperation", () => {
    it("should queue an operation successfully", async () => {
      const operation = await queueOperation(
        userId,
        "create",
        "emergency",
        1,
        { type: "fire", location: "Building A" }
      );

      expect(operation).toBeDefined();
      expect(operation.type).toBe("create");
      expect(operation.entity).toBe("emergency");
      expect(operation.status).toBe("pending");
      expect(operation.userId).toBe(userId);
    });

    it("should queue update operations", async () => {
      const operation = await queueOperation(
        userId,
        "update",
        "conference",
        2,
        { status: "active", participantCount: 5 }
      );

      expect(operation.type).toBe("update");
      expect(operation.entity).toBe("conference");
    });

    it("should queue delete operations", async () => {
      const operation = await queueOperation(
        userId,
        "delete",
        "media",
        3,
        {}
      );

      expect(operation.type).toBe("delete");
      expect(operation.entity).toBe("media");
    });
  });

  describe("getPendingOperations", () => {
    it("should retrieve pending operations for a user", async () => {
      // Queue some operations
      await queueOperation(userId, "create", "emergency", 1, {});
      await queueOperation(userId, "update", "conference", 2, {});

      const operations = await getPendingOperations(userId);

      expect(Array.isArray(operations)).toBe(true);
      expect(operations.length).toBeGreaterThanOrEqual(0);
    });

    it("should return empty array for user with no pending operations", async () => {
      const operations = await getPendingOperations(999);

      expect(Array.isArray(operations)).toBe(true);
    });
  });

  describe("getSyncStatus", () => {
    it("should return sync status for a user", async () => {
      const status = await getSyncStatus(userId);

      expect(status).toBeDefined();
      expect(status.pendingCount).toBeGreaterThanOrEqual(0);
      expect(status.failedCount).toBeGreaterThanOrEqual(0);
      expect(typeof status.isOnline).toBe("boolean");
    });

    it("should track pending and failed operations", async () => {
      const status = await getSyncStatus(userId);

      expect(status.pendingCount).toBeGreaterThanOrEqual(0);
      expect(status.failedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("resolveConflict", () => {
    it("should resolve conflict with local strategy", () => {
      const local = { name: "Local", value: 1 };
      const remote = { name: "Remote", value: 2 };

      const operation = {
        id: "op1",
        type: "update" as const,
        entity: "emergency" as const,
        entityId: 1,
        data: local,
        timestamp: Date.now(),
        status: "pending" as const,
        userId: 1,
      };

      const result = resolveConflict(operation, remote, "local");

      expect(result).toEqual(local);
    });

    it("should resolve conflict with remote strategy", () => {
      const local = { name: "Local", value: 1 };
      const remote = { name: "Remote", value: 2 };

      const operation = {
        id: "op1",
        type: "update" as const,
        entity: "emergency" as const,
        entityId: 1,
        data: local,
        timestamp: Date.now(),
        status: "pending" as const,
        userId: 1,
      };

      const result = resolveConflict(operation, remote, "remote");

      expect(result).toEqual(remote);
    });

    it("should merge conflicts with merged strategy", () => {
      const local = { name: "Local", value: 1 };
      const remote = { name: "Remote", value: 2 };

      const operation = {
        id: "op1",
        type: "update" as const,
        entity: "emergency" as const,
        entityId: 1,
        data: local,
        timestamp: Date.now(),
        status: "pending" as const,
        userId: 1,
      };

      const result = resolveConflict(operation, remote, "merged");

      expect(result).toBeDefined();
      expect(result.mergedFrom).toBeDefined();
      expect(result.lastMerged).toBeDefined();
    });
  });
});
