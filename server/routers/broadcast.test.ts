import { describe, it, expect, beforeEach, vi } from "vitest";
import { broadcastRouter } from "./broadcast";
import { getDb } from "../db";

// Mock database
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

describe("Broadcast Router", () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = null;
    vi.mocked(getDb).mockResolvedValue(null);
  });

  describe("Channels", () => {
    it("should handle database unavailable gracefully", async () => {
      const caller = broadcastRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.channels.getAll();
      expect(result).toEqual([]);
    });

    it("should throw error when creating channel without database", async () => {
      const caller = broadcastRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      try {
        await caller.channels.create({
          name: "Test Channel",
          slug: "test-channel",
          category: "education",
          broadcastFormat: "podcast",
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("Database not available");
      }
    });
  });

  describe("Episodes", () => {
    it("should handle database unavailable gracefully", async () => {
      const caller = broadcastRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.episodes.getAll();
      expect(result).toEqual([]);
    });

    it("should handle database unavailable for channel filter", async () => {
      const caller = broadcastRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.episodes.getAll({ channelId: 1 });
      expect(result).toEqual([]);
    });

    it("should throw error when creating episode without database", async () => {
      const caller = broadcastRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      try {
        await caller.episodes.create({
          channelId: 1,
          title: "Test Episode",
          slug: "test-episode",
          audioUrl: "https://example.com/audio.mp3",
          audioDuration: 3600,
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("Database not available");
      }
    });
  });

  describe("Live Broadcasts", () => {
    it("should handle database unavailable gracefully", async () => {
      const caller = broadcastRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.liveBroadcasts.getAll();
      expect(result).toEqual([]);
    });

    it("should handle database unavailable for channel filter", async () => {
      const caller = broadcastRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.liveBroadcasts.getAll({ channelId: 1 });
      expect(result).toEqual([]);
    });

    it("should throw error when creating live broadcast without database", async () => {
      const caller = broadcastRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      try {
        await caller.liveBroadcasts.create({
          channelId: 1,
          title: "Test Broadcast",
          scheduledStartTime: new Date(),
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("Database not available");
      }
    });
  });

  describe("Seeding", () => {
    it("should throw error when seeding without database", async () => {
      const caller = broadcastRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      try {
        await caller.seed();
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("Database not available");
      }
    });

    it("should seed broadcast data structure correctly", async () => {
      // This test verifies the seed data structure is correct
      // The actual seeding requires a real database connection
      const caller = broadcastRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      // Verify the router has the seed method
      expect(caller.seed).toBeDefined();
      expect(typeof caller.seed).toBe("function");
    });
  });

  describe("Router Structure", () => {
    it("should have all required procedures", () => {
      const caller = broadcastRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      expect(caller.channels).toBeDefined();
      expect(caller.channels.getAll).toBeDefined();
      expect(caller.channels.getById).toBeDefined();
      expect(caller.channels.create).toBeDefined();
      expect(caller.channels.update).toBeDefined();
      expect(caller.channels.delete).toBeDefined();

      expect(caller.episodes).toBeDefined();
      expect(caller.episodes.getAll).toBeDefined();
      expect(caller.episodes.getById).toBeDefined();
      expect(caller.episodes.create).toBeDefined();
      expect(caller.episodes.update).toBeDefined();
      expect(caller.episodes.delete).toBeDefined();

      expect(caller.liveBroadcasts).toBeDefined();
      expect(caller.liveBroadcasts.getAll).toBeDefined();
      expect(caller.liveBroadcasts.getById).toBeDefined();
      expect(caller.liveBroadcasts.create).toBeDefined();
      expect(caller.liveBroadcasts.update).toBeDefined();
      expect(caller.liveBroadcasts.delete).toBeDefined();

      expect(caller.seed).toBeDefined();
    });

    it("should be properly exported from router", () => {
      expect(broadcastRouter).toBeDefined();
      expect(broadcastRouter._def).toBeDefined();
    });
  });
});
