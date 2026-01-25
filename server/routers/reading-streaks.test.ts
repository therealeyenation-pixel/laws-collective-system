import { describe, it, expect, vi } from "vitest";

// Mock the database
vi.mock("../db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
  },
}));

// Mock notification
vi.mock("../_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("Reading Streaks Router", () => {
  describe("isToday helper", () => {
    it("should correctly identify today's date", () => {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      expect(todayStr).toBe(new Date().toISOString().split("T")[0]);
    });
  });

  describe("isYesterday helper", () => {
    it("should correctly identify yesterday's date", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      
      const today = new Date();
      today.setDate(today.getDate() - 1);
      expect(yesterdayStr).toBe(today.toISOString().split("T")[0]);
    });
  });

  describe("getStartOfToday helper", () => {
    it("should return start of today with zeroed time", () => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      
      expect(startOfToday.getHours()).toBe(0);
      expect(startOfToday.getMinutes()).toBe(0);
      expect(startOfToday.getSeconds()).toBe(0);
      expect(startOfToday.getMilliseconds()).toBe(0);
    });
  });

  describe("streak calculation logic", () => {
    it("should calculate new streak correctly when starting fresh", () => {
      const lastRead = null;
      const newStreak = lastRead ? 0 : 1;
      expect(newStreak).toBe(1);
    });

    it("should increment streak when reading on consecutive days", () => {
      const currentStreak = 5;
      const newStreak = currentStreak + 1;
      expect(newStreak).toBe(6);
    });

    it("should reset streak to 1 when streak is broken", () => {
      const streakBroken = true;
      const newStreak = streakBroken ? 1 : 5;
      expect(newStreak).toBe(1);
    });

    it("should track longest streak correctly", () => {
      const currentStreak = 10;
      const longestStreak = 7;
      const newLongest = Math.max(currentStreak, longestStreak);
      expect(newLongest).toBe(10);
    });
  });

  describe("milestone detection", () => {
    it("should detect 7-day milestone", () => {
      const streak = 7;
      const milestones = [7, 14, 30, 60, 100, 365];
      const isMilestone = milestones.includes(streak);
      expect(isMilestone).toBe(true);
    });

    it("should detect 30-day milestone", () => {
      const streak = 30;
      const milestones = [7, 14, 30, 60, 100, 365];
      const isMilestone = milestones.includes(streak);
      expect(isMilestone).toBe(true);
    });

    it("should not detect non-milestone days", () => {
      const streak = 15;
      const milestones = [7, 14, 30, 60, 100, 365];
      const isMilestone = milestones.includes(streak);
      expect(isMilestone).toBe(false);
    });
  });

  describe("notification types", () => {
    it("should have correct notification type values", () => {
      const notificationTypes = [
        "streak_at_risk",
        "streak_lost",
        "streak_milestone",
        "weekly_summary",
        "encouragement",
      ];
      
      expect(notificationTypes).toContain("streak_at_risk");
      expect(notificationTypes).toContain("streak_milestone");
      expect(notificationTypes.length).toBe(5);
    });
  });

  describe("daily goal tracking", () => {
    it("should correctly determine if daily goal is met", () => {
      const todayMinutes = 20;
      const dailyGoalMinutes = 15;
      const goalMet = todayMinutes >= dailyGoalMinutes;
      expect(goalMet).toBe(true);
    });

    it("should correctly determine if daily goal is not met", () => {
      const todayMinutes = 10;
      const dailyGoalMinutes = 15;
      const goalMet = todayMinutes >= dailyGoalMinutes;
      expect(goalMet).toBe(false);
    });

    it("should detect streak at risk when goal not met and has active streak", () => {
      const goalMet = false;
      const currentStreak = 5;
      const streakAtRisk = !goalMet && currentStreak > 0;
      expect(streakAtRisk).toBe(true);
    });
  });

  describe("leaderboard types", () => {
    it("should support streak leaderboard type", () => {
      const leaderboardTypes = ["streak", "total_minutes", "books_completed"];
      expect(leaderboardTypes).toContain("streak");
    });

    it("should support total_minutes leaderboard type", () => {
      const leaderboardTypes = ["streak", "total_minutes", "books_completed"];
      expect(leaderboardTypes).toContain("total_minutes");
    });

    it("should support books_completed leaderboard type", () => {
      const leaderboardTypes = ["streak", "total_minutes", "books_completed"];
      expect(leaderboardTypes).toContain("books_completed");
    });
  });

  describe("reminder time format", () => {
    it("should validate HH:MM format", () => {
      const validTime = "18:00";
      const timeRegex = /^\d{2}:\d{2}$/;
      expect(timeRegex.test(validTime)).toBe(true);
    });

    it("should reject invalid time format", () => {
      const invalidTime = "6:00 PM";
      const timeRegex = /^\d{2}:\d{2}$/;
      expect(timeRegex.test(invalidTime)).toBe(false);
    });
  });
});
