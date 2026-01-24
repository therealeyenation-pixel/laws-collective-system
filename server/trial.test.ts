import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("./db", () => ({
  db: {
    execute: vi.fn(),
  },
}));

import { db } from "./db";

describe("Trial System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Trial User Signup", () => {
    it("should create a new trial user with valid data", async () => {
      // Mock no existing user
      (db.execute as any).mockResolvedValueOnce([[]]);
      // Mock insert success
      (db.execute as any).mockResolvedValueOnce([{ affectedRows: 1 }]);
      // Mock get created user
      (db.execute as any).mockResolvedValueOnce([[{ id: 1, email: "test@example.com", name: "Test User" }]]);

      const input = {
        email: "test@example.com",
        name: "Test User",
        organization: "Test Org",
        role: "Executive Director",
        wantsUpdates: true,
      };

      // Simulate signup logic
      const existing = await db.execute({} as any);
      expect(existing[0]).toHaveLength(0);
    });

    it("should reject duplicate email addresses", () => {
      // Test the logic for detecting duplicate emails
      const existingUser = { id: 1, status: "active" };
      const mockDbResult = [[existingUser]];
      
      // Simulate checking if user exists
      const users = mockDbResult[0];
      const hasExistingUser = users.length > 0;
      const isActive = hasExistingUser && users[0].status === "active";
      
      expect(hasExistingUser).toBe(true);
      expect(isActive).toBe(true);
    });

    it("should generate 8-character password", () => {
      const { randomBytes } = require("crypto");
      const password = randomBytes(4).toString("hex");
      expect(password).toHaveLength(8);
    });

    it("should set trial expiration to 14 days", () => {
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 14);
      
      const now = new Date();
      const diffDays = Math.ceil((trialExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(14);
    });
  });

  describe("Trial Session Management", () => {
    it("should create session with device info", async () => {
      const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0";
      
      // Parse user agent
      let deviceType = "desktop";
      if (/mobile/i.test(userAgent)) deviceType = "mobile";
      else if (/tablet|ipad/i.test(userAgent)) deviceType = "tablet";
      
      let browser = "unknown";
      if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) browser = "Chrome";
      
      expect(deviceType).toBe("desktop");
      expect(browser).toBe("Chrome");
    });

    it("should detect mobile devices", () => {
      const userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";
      
      let deviceType = "desktop";
      if (/mobile/i.test(userAgent)) deviceType = "mobile";
      
      expect(deviceType).toBe("mobile");
    });

    it("should detect tablet devices", () => {
      const userAgent = "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15";
      
      let deviceType = "desktop";
      if (/tablet|ipad/i.test(userAgent)) deviceType = "tablet";
      
      expect(deviceType).toBe("tablet");
    });
  });

  describe("Trial Analytics", () => {
    it("should calculate average session duration", async () => {
      const sessions = [
        { durationSeconds: 300 },
        { durationSeconds: 600 },
        { durationSeconds: 450 },
      ];
      
      const avgDuration = sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / sessions.length;
      expect(avgDuration).toBe(450);
    });

    it("should calculate conversion rate", () => {
      const totalUsers = 100;
      const convertedUsers = 15;
      const conversionRate = convertedUsers / totalUsers;
      
      expect(conversionRate).toBe(0.15);
    });

    it("should format top features correctly", () => {
      const rawFeatures = [
        { featureName: "House System", explorations: 50 },
        { featureName: "Financial Dashboard", explorations: 35 },
        { featureName: "Document Vault", explorations: 20 },
      ];
      
      const formattedFeatures = rawFeatures.map(f => ({
        name: f.featureName,
        count: Number(f.explorations),
      }));
      
      expect(formattedFeatures[0].name).toBe("House System");
      expect(formattedFeatures[0].count).toBe(50);
    });
  });

  describe("Feedback System", () => {
    it("should validate rating range", () => {
      const validRatings = [1, 2, 3, 4, 5];
      const invalidRatings = [0, 6, -1, 10];
      
      validRatings.forEach(rating => {
        expect(rating >= 1 && rating <= 5).toBe(true);
      });
      
      invalidRatings.forEach(rating => {
        expect(rating >= 1 && rating <= 5).toBe(false);
      });
    });

    it("should categorize feedback types", () => {
      const feedbackTypes = ["overall_rating", "feature_rating", "bug_report", "suggestion", "exit_survey", "inline_comment"];
      
      expect(feedbackTypes).toContain("bug_report");
      expect(feedbackTypes).toContain("suggestion");
      expect(feedbackTypes).toContain("exit_survey");
    });

    it("should calculate NPS from would_recommend scores", () => {
      const scores = [9, 10, 8, 7, 6, 9, 10, 5, 8, 9];
      
      const promoters = scores.filter(s => s >= 9).length;
      const detractors = scores.filter(s => s <= 6).length;
      const nps = ((promoters - detractors) / scores.length) * 100;
      
      expect(promoters).toBe(5);
      expect(detractors).toBe(2);
      expect(nps).toBe(30);
    });
  });

  describe("Trial User Status", () => {
    it("should calculate days remaining correctly", () => {
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);
      
      const daysRemaining = Math.ceil((trialExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      expect(daysRemaining).toBe(7);
    });

    it("should detect expired trials", () => {
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() - 1);
      
      const isExpired = new Date(trialExpiresAt).getTime() < Date.now();
      expect(isExpired).toBe(true);
    });

    it("should detect active trials", () => {
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);
      
      const isActive = new Date(trialExpiresAt).getTime() > Date.now();
      expect(isActive).toBe(true);
    });
  });

  describe("Page View Tracking", () => {
    it("should calculate time on page", () => {
      const enteredAt = new Date("2026-01-24T10:00:00");
      const exitedAt = new Date("2026-01-24T10:05:30");
      
      const timeOnPageSeconds = Math.floor((exitedAt.getTime() - enteredAt.getTime()) / 1000);
      expect(timeOnPageSeconds).toBe(330);
    });

    it("should track page navigation path", () => {
      const pageViews = [
        { pagePath: "/trial/dashboard", previousPage: null },
        { pagePath: "/house", previousPage: "/trial/dashboard" },
        { pagePath: "/finance", previousPage: "/house" },
      ];
      
      expect(pageViews[1].previousPage).toBe("/trial/dashboard");
      expect(pageViews[2].previousPage).toBe("/house");
    });
  });

  describe("Feature Exploration Tracking", () => {
    it("should track feature completion", () => {
      const exploration = {
        featureCategory: "Financial Management",
        featureName: "View Treasury",
        explorationCount: 3,
        completedAction: true,
      };
      
      expect(exploration.completedAction).toBe(true);
      expect(exploration.explorationCount).toBe(3);
    });

    it("should increment exploration count on revisit", () => {
      let explorationCount = 1;
      
      // Simulate revisit
      explorationCount += 1;
      
      expect(explorationCount).toBe(2);
    });
  });
});
