import { describe, it, expect, vi, beforeEach } from "vitest";
import { ACHIEVEMENT_DEFINITIONS } from "./routers/achievements";

describe("Achievements System", () => {
  describe("Achievement Definitions", () => {
    it("should have valid achievement definitions", () => {
      expect(ACHIEVEMENT_DEFINITIONS).toBeDefined();
      expect(Array.isArray(ACHIEVEMENT_DEFINITIONS)).toBe(true);
      expect(ACHIEVEMENT_DEFINITIONS.length).toBeGreaterThan(0);
    });

    it("should have all required fields for each achievement", () => {
      ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
        expect(achievement.id).toBeDefined();
        expect(typeof achievement.id).toBe("string");
        expect(achievement.name).toBeDefined();
        expect(typeof achievement.name).toBe("string");
        expect(achievement.description).toBeDefined();
        expect(typeof achievement.description).toBe("string");
        expect(achievement.gameType).toBeDefined();
        expect(["financial-literacy", "business-tycoon", "all"]).toContain(achievement.gameType);
        expect(achievement.achievementType).toBeDefined();
        expect(["milestone", "streak", "skill", "tournament", "special"]).toContain(achievement.achievementType);
        expect(achievement.requirement).toBeDefined();
        expect(achievement.requirement.type).toBeDefined();
        expect(achievement.requirement.value).toBeDefined();
        expect(typeof achievement.tokenReward).toBe("number");
        expect(achievement.tokenReward).toBeGreaterThan(0);
        expect(achievement.badgeIcon).toBeDefined();
      });
    });

    it("should have unique achievement IDs", () => {
      const ids = ACHIEVEMENT_DEFINITIONS.map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have achievements for financial-literacy game", () => {
      const financialAchievements = ACHIEVEMENT_DEFINITIONS.filter(
        (a) => a.gameType === "financial-literacy"
      );
      expect(financialAchievements.length).toBeGreaterThan(0);
    });

    it("should have achievements for business-tycoon game", () => {
      const businessAchievements = ACHIEVEMENT_DEFINITIONS.filter(
        (a) => a.gameType === "business-tycoon"
      );
      expect(businessAchievements.length).toBeGreaterThan(0);
    });

    it("should have cross-game achievements", () => {
      const crossGameAchievements = ACHIEVEMENT_DEFINITIONS.filter(
        (a) => a.gameType === "all"
      );
      expect(crossGameAchievements.length).toBeGreaterThan(0);
    });
  });

  describe("Achievement Requirements", () => {
    it("should have valid requirement types", () => {
      const validTypes = [
        "games_completed",
        "perfect_game",
        "streak",
        "hard_completion",
        "score",
        "cash",
        "reputation",
        "employees",
        "assets",
        "high_risk_decisions",
        "low_risk_only",
        "games_played",
        "total_tokens",
        "leaderboard_rank",
      ];

      ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
        expect(validTypes).toContain(achievement.requirement.type);
      });
    });

    it("should have positive requirement values", () => {
      ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
        expect(achievement.requirement.value).toBeGreaterThan(0);
      });
    });
  });

  describe("Token Rewards", () => {
    it("should have reasonable token rewards", () => {
      ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
        expect(achievement.tokenReward).toBeGreaterThanOrEqual(10);
        expect(achievement.tokenReward).toBeLessThanOrEqual(100);
      });
    });

    it("should have higher rewards for harder achievements", () => {
      // Leaderboard first should have highest reward
      const leaderboardFirst = ACHIEVEMENT_DEFINITIONS.find(
        (a) => a.id === "leaderboard_first"
      );
      expect(leaderboardFirst?.tokenReward).toBe(100);

      // First quiz should have lowest reward
      const firstQuiz = ACHIEVEMENT_DEFINITIONS.find(
        (a) => a.id === "first_quiz"
      );
      expect(firstQuiz?.tokenReward).toBe(10);
    });
  });

  describe("Badge Icons", () => {
    it("should have valid badge icons", () => {
      const validIcons = [
        "star",
        "trophy",
        "award",
        "flame",
        "zap",
        "shield",
        "trending-up",
        "crown",
        "briefcase",
        "building",
        "dollar-sign",
        "users",
        "package",
        "target",
        "shield-check",
        "compass",
        "coins",
        "gem",
        "medal",
      ];

      ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
        expect(validIcons).toContain(achievement.badgeIcon);
      });
    });
  });
});
