import { describe, it, expect, vi } from "vitest";
import { achievementsRouter, ACHIEVEMENT_DEFINITIONS, TIER_LEVELS, DEFAULT_TIER_REQUIREMENTS, DEFAULT_TIER_REWARDS, TIER_COLORS } from "./routers/achievements";

describe("Blockchain & NFT System", () => {
  describe("Achievement Definitions", () => {
    it("should have achievement definitions", () => {
      expect(ACHIEVEMENT_DEFINITIONS).toBeDefined();
      expect(Array.isArray(ACHIEVEMENT_DEFINITIONS)).toBe(true);
      expect(ACHIEVEMENT_DEFINITIONS.length).toBeGreaterThan(0);
    });

    it("should have valid achievement structure", () => {
      ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
        expect(achievement.id).toBeDefined();
        expect(achievement.name).toBeDefined();
        expect(achievement.description).toBeDefined();
        expect(achievement.gameType).toBeDefined();
        expect(achievement.achievementType).toBeDefined();
        expect(achievement.requirement).toBeDefined();
        expect(achievement.tokenReward).toBeGreaterThan(0);
        expect(achievement.badgeIcon).toBeDefined();
      });
    });
  });

  describe("Tier System", () => {
    it("should have four tier levels", () => {
      expect(TIER_LEVELS).toEqual(["bronze", "silver", "gold", "platinum"]);
    });

    it("should have tier requirements", () => {
      expect(DEFAULT_TIER_REQUIREMENTS.bronze).toBe(1);
      expect(DEFAULT_TIER_REQUIREMENTS.silver).toBe(3);
      expect(DEFAULT_TIER_REQUIREMENTS.gold).toBe(5);
      expect(DEFAULT_TIER_REQUIREMENTS.platinum).toBe(10);
    });

    it("should have tier rewards", () => {
      expect(DEFAULT_TIER_REWARDS.bronze).toBe(10);
      expect(DEFAULT_TIER_REWARDS.silver).toBe(25);
      expect(DEFAULT_TIER_REWARDS.gold).toBe(50);
      expect(DEFAULT_TIER_REWARDS.platinum).toBe(100);
    });

    it("should have tier colors", () => {
      expect(TIER_COLORS.bronze).toBeDefined();
      expect(TIER_COLORS.silver).toBeDefined();
      expect(TIER_COLORS.gold).toBeDefined();
      expect(TIER_COLORS.platinum).toBeDefined();
    });
  });

  describe("Achievements Router", () => {
    it("should have getAll procedure", () => {
      expect(achievementsRouter.getAll).toBeDefined();
    });

    it("should have getByGameType procedure", () => {
      expect(achievementsRouter.getByGameType).toBeDefined();
    });

    it("should have getPlayerAchievements procedure", () => {
      expect(achievementsRouter.getPlayerAchievements).toBeDefined();
    });

    it("should have getPlayerProgress procedure", () => {
      expect(achievementsRouter.getPlayerProgress).toBeDefined();
    });

    it("should have checkAndUnlock procedure", () => {
      expect(achievementsRouter.checkAndUnlock).toBeDefined();
    });

    it("should have upgradeTier procedure", () => {
      expect(achievementsRouter.upgradeTier).toBeDefined();
    });

    it("should have generateShareLink procedure", () => {
      expect(achievementsRouter.generateShareLink).toBeDefined();
    });

    it("should have getSharedAchievement procedure", () => {
      expect(achievementsRouter.getSharedAchievement).toBeDefined();
    });

    it("should have getTierStats procedure", () => {
      expect(achievementsRouter.getTierStats).toBeDefined();
    });
  });

  describe("Blockchain Procedures", () => {
    it("should have recordToBlockchain procedure", () => {
      expect(achievementsRouter.recordToBlockchain).toBeDefined();
    });

    it("should have verifyBlockchainRecord procedure", () => {
      expect(achievementsRouter.verifyBlockchainRecord).toBeDefined();
    });

    it("should have getPlayerBlockchainRecords procedure", () => {
      expect(achievementsRouter.getPlayerBlockchainRecords).toBeDefined();
    });

    it("should have getBlockchainStats procedure", () => {
      expect(achievementsRouter.getBlockchainStats).toBeDefined();
    });
  });

  describe("NFT Procedures", () => {
    it("should have mintPlatinumNft procedure", () => {
      expect(achievementsRouter.mintPlatinumNft).toBeDefined();
    });

    it("should have getPlayerNfts procedure", () => {
      expect(achievementsRouter.getPlayerNfts).toBeDefined();
    });

    it("should have getNftByTokenId procedure", () => {
      expect(achievementsRouter.getNftByTokenId).toBeDefined();
    });

    it("should have queueChampionNft procedure", () => {
      expect(achievementsRouter.queueChampionNft).toBeDefined();
    });

    it("should have getNftGallery procedure", () => {
      expect(achievementsRouter.getNftGallery).toBeDefined();
    });
  });

  describe("Achievement Types", () => {
    it("should have milestone achievements", () => {
      const milestones = ACHIEVEMENT_DEFINITIONS.filter(a => a.achievementType === "milestone");
      expect(milestones.length).toBeGreaterThan(0);
    });

    it("should have streak achievements", () => {
      const streaks = ACHIEVEMENT_DEFINITIONS.filter(a => a.achievementType === "streak");
      expect(streaks.length).toBeGreaterThan(0);
    });

    it("should have skill achievements", () => {
      const skills = ACHIEVEMENT_DEFINITIONS.filter(a => a.achievementType === "skill");
      expect(skills.length).toBeGreaterThan(0);
    });

    it("should have tournament achievements", () => {
      const tournaments = ACHIEVEMENT_DEFINITIONS.filter(a => a.achievementType === "tournament");
      expect(tournaments.length).toBeGreaterThan(0);
    });

    it("should have special achievements", () => {
      const specials = ACHIEVEMENT_DEFINITIONS.filter(a => a.achievementType === "special");
      expect(specials.length).toBeGreaterThan(0);
    });
  });

  describe("Game Type Coverage", () => {
    it("should have financial-literacy achievements", () => {
      const flAchievements = ACHIEVEMENT_DEFINITIONS.filter(a => a.gameType === "financial-literacy");
      expect(flAchievements.length).toBeGreaterThan(0);
    });

    it("should have business-tycoon achievements", () => {
      const btAchievements = ACHIEVEMENT_DEFINITIONS.filter(a => a.gameType === "business-tycoon");
      expect(btAchievements.length).toBeGreaterThan(0);
    });

    it("should have cross-game achievements", () => {
      const allAchievements = ACHIEVEMENT_DEFINITIONS.filter(a => a.gameType === "all");
      expect(allAchievements.length).toBeGreaterThan(0);
    });
  });
});
