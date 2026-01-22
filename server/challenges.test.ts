import { describe, it, expect, vi, beforeEach } from "vitest";
import { challengesRouter, DAILY_CHALLENGES, WEEKLY_CHALLENGES } from "./routers/challenges";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

describe("Challenges Router", () => {
  describe("DAILY_CHALLENGES", () => {
    it("should have 7 daily challenges (one for each day)", () => {
      expect(DAILY_CHALLENGES.length).toBe(7);
    });

    it("should have unique rotation slots from 0-6", () => {
      const slots = DAILY_CHALLENGES.map(c => c.rotationSlot);
      const uniqueSlots = [...new Set(slots)];
      expect(uniqueSlots.length).toBe(7);
      expect(Math.min(...slots)).toBe(0);
      expect(Math.max(...slots)).toBe(6);
    });

    it("should have valid token rewards", () => {
      DAILY_CHALLENGES.forEach(challenge => {
        expect(challenge.tokenReward).toBeGreaterThan(0);
        expect(challenge.tokenReward).toBeLessThanOrEqual(50);
      });
    });

    it("should have required fields", () => {
      DAILY_CHALLENGES.forEach(challenge => {
        expect(challenge.name).toBeDefined();
        expect(challenge.description).toBeDefined();
        expect(challenge.requirement).toBeDefined();
        expect(challenge.requirement.type).toBeDefined();
        expect(challenge.requirement.value).toBeDefined();
        expect(challenge.badgeIcon).toBeDefined();
      });
    });
  });

  describe("WEEKLY_CHALLENGES", () => {
    it("should have 4 weekly challenges (one for each week of month)", () => {
      expect(WEEKLY_CHALLENGES.length).toBe(4);
    });

    it("should have unique rotation slots from 0-3", () => {
      const slots = WEEKLY_CHALLENGES.map(c => c.rotationSlot);
      const uniqueSlots = [...new Set(slots)];
      expect(uniqueSlots.length).toBe(4);
      expect(Math.min(...slots)).toBe(0);
      expect(Math.max(...slots)).toBe(3);
    });

    it("should have higher token rewards than daily challenges", () => {
      const maxDaily = Math.max(...DAILY_CHALLENGES.map(c => c.tokenReward));
      const minWeekly = Math.min(...WEEKLY_CHALLENGES.map(c => c.tokenReward));
      expect(minWeekly).toBeGreaterThanOrEqual(maxDaily);
    });
  });

  describe("getDailyChallenges", () => {
    it("should return today's challenge based on day of week", async () => {
      const caller = challengesRouter.createCaller({} as any);
      const result = await caller.getDailyChallenges();
      
      expect(result).toBeDefined();
      expect(result.today).toBeDefined();
      expect(result.yesterday).toBeDefined();
      expect(result.tomorrow).toBeDefined();
      expect(result.allDaily).toHaveLength(7);
    });

    it("should mark challenges with challengeType", async () => {
      const caller = challengesRouter.createCaller({} as any);
      const result = await caller.getDailyChallenges();
      
      expect(result.today?.challengeType).toBe("daily");
      result.allDaily.forEach(challenge => {
        expect(challenge.challengeType).toBe("daily");
      });
    });
  });

  describe("getWeeklyChallenges", () => {
    it("should return this week's challenge", async () => {
      const caller = challengesRouter.createCaller({} as any);
      const result = await caller.getWeeklyChallenges();
      
      expect(result).toBeDefined();
      expect(result.thisWeek).toBeDefined();
      expect(result.nextWeek).toBeDefined();
      expect(result.allWeekly).toHaveLength(4);
    });

    it("should mark challenges with challengeType", async () => {
      const caller = challengesRouter.createCaller({} as any);
      const result = await caller.getWeeklyChallenges();
      
      expect(result.thisWeek?.challengeType).toBe("weekly");
      result.allWeekly.forEach(challenge => {
        expect(challenge.challengeType).toBe("weekly");
      });
    });
  });

  describe("Challenge requirements", () => {
    it("should have valid requirement types", () => {
      const validTypes = [
        "score", "total_score", "streak", "max_streak", "cash", 
        "reputation", "correct_answers", "high_risk_decisions", 
        "games_completed", "unique_games"
      ];
      
      [...DAILY_CHALLENGES, ...WEEKLY_CHALLENGES].forEach(challenge => {
        expect(validTypes).toContain(challenge.requirement.type);
      });
    });

    it("should have positive requirement values", () => {
      [...DAILY_CHALLENGES, ...WEEKLY_CHALLENGES].forEach(challenge => {
        expect(challenge.requirement.value).toBeGreaterThan(0);
      });
    });
  });
});
