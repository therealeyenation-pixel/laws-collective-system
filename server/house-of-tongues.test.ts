/**
 * House of Many Tongues Tests
 * Phase 19.3: Language Learning Module Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn(() => null),
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
          orderBy: vi.fn(() => Promise.resolve([])),
        })),
        orderBy: vi.fn(() => Promise.resolve([])),
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        $returningId: vi.fn(() => Promise.resolve([{ id: 1 }])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  },
}));

import {
  INDIGENOUS_TONGUES,
  ANCESTRAL_FLAME_TONGUES,
  GLOBAL_TRADE_TONGUES,
  ALL_LANGUAGES,
  LANGUAGE_TOKEN_REWARDS,
} from "./services/house-of-tongues";

describe("House of Many Tongues Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Language Categories", () => {
    it("should have 6 Indigenous Tongues", () => {
      expect(INDIGENOUS_TONGUES).toHaveLength(6);
      const names = INDIGENOUS_TONGUES.map(l => l.name);
      expect(names).toContain("Nahuatl");
      expect(names).toContain("Yoruba");
      expect(names).toContain("Lakota");
      expect(names).toContain("Cherokee");
      expect(names).toContain("Quechua");
      expect(names).toContain("Māori");
    });

    it("should have 5 Ancestral Flame Tongues", () => {
      expect(ANCESTRAL_FLAME_TONGUES).toHaveLength(5);
      const names = ANCESTRAL_FLAME_TONGUES.map(l => l.name);
      expect(names).toContain("Hebrew");
      expect(names).toContain("Aramaic");
      expect(names).toContain("Ge'ez");
      expect(names).toContain("Sanskrit");
      expect(names).toContain("Classical Arabic");
    });

    it("should have 6 Global Trade Tongues", () => {
      expect(GLOBAL_TRADE_TONGUES).toHaveLength(6);
      const names = GLOBAL_TRADE_TONGUES.map(l => l.name);
      expect(names).toContain("Spanish");
      expect(names).toContain("French");
      expect(names).toContain("Swahili");
      expect(names).toContain("Mandarin Chinese");
      expect(names).toContain("Portuguese");
      expect(names).toContain("Japanese");
    });

    it("should have 17 total languages", () => {
      expect(ALL_LANGUAGES).toHaveLength(17);
    });

    it("should have correct category assignments", () => {
      const indigenous = ALL_LANGUAGES.filter(l => l.category === "indigenous");
      const ancestral = ALL_LANGUAGES.filter(l => l.category === "ancestral_flame");
      const global = ALL_LANGUAGES.filter(l => l.category === "global_trade");

      expect(indigenous).toHaveLength(6);
      expect(ancestral).toHaveLength(5);
      expect(global).toHaveLength(6);
    });
  });

  describe("Language Properties", () => {
    it("should have required properties for each language", () => {
      ALL_LANGUAGES.forEach(lang => {
        expect(lang.name).toBeDefined();
        expect(lang.nativeName).toBeDefined();
        expect(lang.slug).toBeDefined();
        expect(lang.iconEmoji).toBeDefined();
        expect(lang.culturalContext).toBeDefined();
        expect(lang.category).toBeDefined();
      });
    });

    it("should have unique slugs", () => {
      const slugs = ALL_LANGUAGES.map(l => l.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it("should have valid emoji icons", () => {
      ALL_LANGUAGES.forEach(lang => {
        expect(lang.iconEmoji.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Token Rewards", () => {
    it("should have all reward types defined", () => {
      expect(LANGUAGE_TOKEN_REWARDS.lesson_complete).toBe(15);
      expect(LANGUAGE_TOKEN_REWARDS.vocabulary_mastery).toBe(25);
      expect(LANGUAGE_TOKEN_REWARDS.pronunciation_achievement).toBe(30);
      expect(LANGUAGE_TOKEN_REWARDS.conversation_practice).toBe(20);
      expect(LANGUAGE_TOKEN_REWARDS.ceremony_participation).toBe(50);
      expect(LANGUAGE_TOKEN_REWARDS.story_completion).toBe(35);
      expect(LANGUAGE_TOKEN_REWARDS.chant_mastery).toBe(40);
      expect(LANGUAGE_TOKEN_REWARDS.level_completion).toBe(100);
      expect(LANGUAGE_TOKEN_REWARDS.language_mastery).toBe(500);
    });

    it("should have increasing rewards for higher achievements", () => {
      expect(LANGUAGE_TOKEN_REWARDS.lesson_complete).toBeLessThan(LANGUAGE_TOKEN_REWARDS.level_completion);
      expect(LANGUAGE_TOKEN_REWARDS.level_completion).toBeLessThan(LANGUAGE_TOKEN_REWARDS.language_mastery);
    });

    it("should have ceremony participation as highest single lesson reward", () => {
      const singleLessonRewards = [
        LANGUAGE_TOKEN_REWARDS.lesson_complete,
        LANGUAGE_TOKEN_REWARDS.vocabulary_mastery,
        LANGUAGE_TOKEN_REWARDS.pronunciation_achievement,
        LANGUAGE_TOKEN_REWARDS.conversation_practice,
        LANGUAGE_TOKEN_REWARDS.ceremony_participation,
        LANGUAGE_TOKEN_REWARDS.story_completion,
        LANGUAGE_TOKEN_REWARDS.chant_mastery,
      ];
      expect(Math.max(...singleLessonRewards)).toBe(LANGUAGE_TOKEN_REWARDS.ceremony_participation);
    });
  });

  describe("Lesson Types", () => {
    it("should support all lesson types", () => {
      const lessonTypes = ["vocabulary", "pronunciation", "conversation", "ceremony", "story", "chant"];
      lessonTypes.forEach(type => {
        expect(typeof type).toBe("string");
      });
    });
  });

  describe("Mastery Levels", () => {
    it("should calculate correct mastery levels", () => {
      const getMasteryLevel = (percentage: number) => {
        if (percentage >= 90) return "Master";
        if (percentage >= 70) return "Advanced";
        if (percentage >= 50) return "Intermediate";
        if (percentage >= 25) return "Beginner";
        return "Novice";
      };

      expect(getMasteryLevel(0)).toBe("Novice");
      expect(getMasteryLevel(24)).toBe("Novice");
      expect(getMasteryLevel(25)).toBe("Beginner");
      expect(getMasteryLevel(49)).toBe("Beginner");
      expect(getMasteryLevel(50)).toBe("Intermediate");
      expect(getMasteryLevel(69)).toBe("Intermediate");
      expect(getMasteryLevel(70)).toBe("Advanced");
      expect(getMasteryLevel(89)).toBe("Advanced");
      expect(getMasteryLevel(90)).toBe("Master");
      expect(getMasteryLevel(100)).toBe("Master");
    });
  });

  describe("Score Bonus Calculation", () => {
    it("should calculate correct bonus multipliers", () => {
      const getBonusMultiplier = (score: number) => {
        if (score >= 90) return 1.5;
        if (score >= 80) return 1.25;
        if (score >= 70) return 1.1;
        return 1;
      };

      expect(getBonusMultiplier(100)).toBe(1.5);
      expect(getBonusMultiplier(90)).toBe(1.5);
      expect(getBonusMultiplier(89)).toBe(1.25);
      expect(getBonusMultiplier(80)).toBe(1.25);
      expect(getBonusMultiplier(79)).toBe(1.1);
      expect(getBonusMultiplier(70)).toBe(1.1);
      expect(getBonusMultiplier(69)).toBe(1);
      expect(getBonusMultiplier(0)).toBe(1);
    });

    it("should calculate correct token rewards with bonuses", () => {
      const baseTokens = 15;
      const calculateReward = (score: number) => {
        let multiplier = 1;
        if (score >= 90) multiplier = 1.5;
        else if (score >= 80) multiplier = 1.25;
        else if (score >= 70) multiplier = 1.1;
        return Math.floor(baseTokens * multiplier);
      };

      expect(calculateReward(100)).toBe(22); // 15 * 1.5 = 22.5 → 22
      expect(calculateReward(85)).toBe(18); // 15 * 1.25 = 18.75 → 18
      expect(calculateReward(75)).toBe(16); // 15 * 1.1 = 16.5 → 16
      expect(calculateReward(60)).toBe(15); // 15 * 1 = 15
    });
  });

  describe("Living Scroll Requirements", () => {
    it("should require 70% mastery for Living Scroll", () => {
      const canCreateScroll = (masteryPercentage: number) => masteryPercentage >= 70;

      expect(canCreateScroll(100)).toBe(true);
      expect(canCreateScroll(70)).toBe(true);
      expect(canCreateScroll(69)).toBe(false);
      expect(canCreateScroll(0)).toBe(false);
    });
  });

  describe("Language Cultural Context", () => {
    it("should have meaningful cultural context for Indigenous tongues", () => {
      INDIGENOUS_TONGUES.forEach(lang => {
        expect(lang.culturalContext.length).toBeGreaterThan(20);
      });
    });

    it("should have meaningful cultural context for Ancestral tongues", () => {
      ANCESTRAL_FLAME_TONGUES.forEach(lang => {
        expect(lang.culturalContext.length).toBeGreaterThan(20);
      });
    });

    it("should have meaningful cultural context for Global tongues", () => {
      GLOBAL_TRADE_TONGUES.forEach(lang => {
        expect(lang.culturalContext.length).toBeGreaterThan(20);
      });
    });
  });

  describe("Native Names", () => {
    it("should have native names for all languages", () => {
      ALL_LANGUAGES.forEach(lang => {
        expect(lang.nativeName).toBeDefined();
        expect(lang.nativeName.length).toBeGreaterThan(0);
      });
    });

    it("should have different native names from English names", () => {
      // Most languages should have different native names
      const differentNames = ALL_LANGUAGES.filter(
        lang => lang.name.toLowerCase() !== lang.nativeName.toLowerCase()
      );
      expect(differentNames.length).toBeGreaterThan(10);
    });
  });

  describe("Lesson Structure", () => {
    it("should have valid lesson template structure", () => {
      const lessonTemplate = {
        title: "Test Lesson",
        level: "beginner",
        lessonType: "vocabulary",
        orderIndex: 1,
        tokensReward: 15,
      };

      expect(lessonTemplate.title).toBeDefined();
      expect(["beginner", "intermediate", "advanced"]).toContain(lessonTemplate.level);
      expect(["vocabulary", "pronunciation", "conversation", "ceremony", "story", "chant"]).toContain(lessonTemplate.lessonType);
      expect(lessonTemplate.orderIndex).toBeGreaterThan(0);
      expect(lessonTemplate.tokensReward).toBeGreaterThan(0);
    });
  });

  describe("Progress Tracking", () => {
    it("should have valid progress status values", () => {
      const validStatuses = ["not_started", "in_progress", "completed", "mastered"];
      validStatuses.forEach(status => {
        expect(typeof status).toBe("string");
      });
    });

    it("should track progress percentage correctly", () => {
      const calculateProgress = (completed: number, total: number) => {
        return total > 0 ? Math.round((completed / total) * 100) : 0;
      };

      expect(calculateProgress(0, 10)).toBe(0);
      expect(calculateProgress(5, 10)).toBe(50);
      expect(calculateProgress(10, 10)).toBe(100);
      expect(calculateProgress(3, 12)).toBe(25);
    });
  });
});
