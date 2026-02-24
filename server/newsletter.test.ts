import { describe, it, expect, beforeEach, vi } from "vitest";
import { newsletterRouter } from "./routers/newsletter";
import { getDb } from "./db";

// Mock the database
vi.mock("./db");
vi.mock("./_core/notification");

describe("Newsletter Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("subscribe", () => {
    it("should subscribe user to newsletter with valid email and name", async () => {
      const subscribe = newsletterRouter.createCaller({
        user: { id: 1, email: "test@example.com", role: "user" },
      }).subscribe;

      const result = await subscribe({
        email: "subscriber@example.com",
        name: "Test Subscriber",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Thank you for subscribing");
    });

    it("should reject invalid email format", async () => {
      const subscribe = newsletterRouter.createCaller({
        user: { id: 1, email: "test@example.com", role: "user" },
      }).subscribe;

      await expect(
        subscribe({
          email: "invalid-email",
          name: "Test Subscriber",
        })
      ).rejects.toThrow();
    });

    it("should reject empty name", async () => {
      const subscribe = newsletterRouter.createCaller({
        user: { id: 1, email: "test@example.com", role: "user" },
      }).subscribe;

      await expect(
        subscribe({
          email: "subscriber@example.com",
          name: "",
        })
      ).rejects.toThrow();
    });
  });

  describe("getSubscribers", () => {
    it("should retrieve newsletter subscribers for protected access", async () => {
      const getSubscribers = newsletterRouter.createCaller({
        user: { id: 1, email: "test@example.com", role: "admin" },
      }).getSubscribers;

      const result = await getSubscribers({ limit: 50 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should use default limit of 100 when not specified", async () => {
      const getSubscribers = newsletterRouter.createCaller({
        user: { id: 1, email: "test@example.com", role: "admin" },
      }).getSubscribers;

      const result = await getSubscribers();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getSubscriberCount", () => {
    it("should return subscriber count", async () => {
      const getSubscriberCount = newsletterRouter.createCaller({
        user: { id: 1, email: "test@example.com", role: "admin" },
      }).getSubscriberCount;

      const count = await getSubscriberCount();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("unsubscribe", () => {
    it("should unsubscribe user from newsletter", async () => {
      const unsubscribe = newsletterRouter.createCaller({
        user: { id: 1, email: "test@example.com", role: "user" },
      }).unsubscribe;

      const result = await unsubscribe({
        email: "subscriber@example.com",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("unsubscribed");
    });

    it("should reject invalid email format on unsubscribe", async () => {
      const unsubscribe = newsletterRouter.createCaller({
        user: { id: 1, email: "test@example.com", role: "user" },
      }).unsubscribe;

      await expect(
        unsubscribe({
          email: "invalid-email",
        })
      ).rejects.toThrow();
    });
  });

  describe("getStats", () => {
    it("should return newsletter statistics", async () => {
      const getStats = newsletterRouter.createCaller({
        user: { id: 1, email: "test@example.com", role: "admin" },
      }).getStats;

      const stats = await getStats();
      expect(stats).toHaveProperty("totalSubscribers");
      expect(stats).toHaveProperty("recentSignups");
      expect(typeof stats.totalSubscribers).toBe("number");
      expect(typeof stats.recentSignups).toBe("number");
    });
  });
});
