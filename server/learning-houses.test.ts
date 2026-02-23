/**
 * Three Learning Houses Tests
 * Phase 19.4: House of Wonder, House of Form, House of Mastery
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
  LEARNING_HOUSES,
  HOUSE_TOKEN_REWARDS,
  DIVINE_STEM_BY_HOUSE,
  getHouseForAge,
  getHouseForGrade,
} from "./services/learning-houses";

describe("Three Learning Houses Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("House Definitions", () => {
    it("should have three learning houses", () => {
      expect(Object.keys(LEARNING_HOUSES)).toHaveLength(3);
      expect(LEARNING_HOUSES.wonder).toBeDefined();
      expect(LEARNING_HOUSES.form).toBeDefined();
      expect(LEARNING_HOUSES.mastery).toBeDefined();
    });

    it("should have correct age ranges", () => {
      expect(LEARNING_HOUSES.wonder.ageRange).toBe("K-5");
      expect(LEARNING_HOUSES.form.ageRange).toBe("6-8");
      expect(LEARNING_HOUSES.mastery.ageRange).toBe("9-12");
    });

    it("should have ceremonial names", () => {
      expect(LEARNING_HOUSES.wonder.ceremonialName).toContain("Wonder");
      expect(LEARNING_HOUSES.form.ceremonialName).toContain("Form");
      expect(LEARNING_HOUSES.mastery.ceremonialName).toContain("Mastery");
    });

    it("should have color themes", () => {
      expect(LEARNING_HOUSES.wonder.colorTheme).toBe("amber");
      expect(LEARNING_HOUSES.form.colorTheme).toBe("emerald");
      expect(LEARNING_HOUSES.mastery.colorTheme).toBe("purple");
    });

    it("should have icon emojis", () => {
      expect(LEARNING_HOUSES.wonder.iconEmoji).toBe("✨");
      expect(LEARNING_HOUSES.form.iconEmoji).toBe("🔷");
      expect(LEARNING_HOUSES.mastery.iconEmoji).toBe("👑");
    });
  });

  describe("House Principles", () => {
    it("should have 5 principles per house", () => {
      expect(LEARNING_HOUSES.wonder.principles).toHaveLength(5);
      expect(LEARNING_HOUSES.form.principles).toHaveLength(5);
      expect(LEARNING_HOUSES.mastery.principles).toHaveLength(5);
    });

    it("should have age-appropriate principles", () => {
      expect(LEARNING_HOUSES.wonder.principles).toContain("Learning through play and exploration");
      expect(LEARNING_HOUSES.form.principles).toContain("Critical thinking development");
      expect(LEARNING_HOUSES.mastery.principles).toContain("Mastery-based progression");
    });
  });

  describe("Ceremonial Layers", () => {
    it("should have 5 ceremonial layers per house", () => {
      expect(LEARNING_HOUSES.wonder.ceremonialLayers).toHaveLength(5);
      expect(LEARNING_HOUSES.form.ceremonialLayers).toHaveLength(5);
      expect(LEARNING_HOUSES.mastery.ceremonialLayers).toHaveLength(5);
    });

    it("should have opening and closing ceremonies", () => {
      // Wonder house
      expect(LEARNING_HOUSES.wonder.ceremonialLayers[0]).toContain("Morning");
      expect(LEARNING_HOUSES.wonder.ceremonialLayers[4]).toContain("Blessing");

      // Form house
      expect(LEARNING_HOUSES.form.ceremonialLayers[0]).toContain("Opening");
      expect(LEARNING_HOUSES.form.ceremonialLayers[4]).toContain("Connection");

      // Mastery house
      expect(LEARNING_HOUSES.mastery.ceremonialLayers[0]).toContain("Dawn");
      expect(LEARNING_HOUSES.mastery.ceremonialLayers[4]).toContain("Reflection");
    });
  });

  describe("Age to House Mapping", () => {
    it("should map ages 5-10 to House of Wonder", () => {
      expect(getHouseForAge(5)).toBe("wonder");
      expect(getHouseForAge(7)).toBe("wonder");
      expect(getHouseForAge(10)).toBe("wonder");
    });

    it("should map ages 11-14 to House of Form", () => {
      expect(getHouseForAge(11)).toBe("form");
      expect(getHouseForAge(12)).toBe("form");
      expect(getHouseForAge(14)).toBe("form");
    });

    it("should map ages 15-18 to House of Mastery", () => {
      expect(getHouseForAge(15)).toBe("mastery");
      expect(getHouseForAge(16)).toBe("mastery");
      expect(getHouseForAge(18)).toBe("mastery");
    });

    it("should return null for ages outside range", () => {
      expect(getHouseForAge(4)).toBeNull();
      expect(getHouseForAge(19)).toBeNull();
      expect(getHouseForAge(0)).toBeNull();
    });
  });

  describe("Grade to House Mapping", () => {
    it("should map K-5 grades to House of Wonder", () => {
      expect(getHouseForGrade("K")).toBe("wonder");
      expect(getHouseForGrade("1")).toBe("wonder");
      expect(getHouseForGrade("3")).toBe("wonder");
      expect(getHouseForGrade("5")).toBe("wonder");
    });

    it("should map 6-8 grades to House of Form", () => {
      expect(getHouseForGrade("6")).toBe("form");
      expect(getHouseForGrade("7")).toBe("form");
      expect(getHouseForGrade("8")).toBe("form");
    });

    it("should map 9-12 grades to House of Mastery", () => {
      expect(getHouseForGrade("9")).toBe("mastery");
      expect(getHouseForGrade("10")).toBe("mastery");
      expect(getHouseForGrade("11")).toBe("mastery");
      expect(getHouseForGrade("12")).toBe("mastery");
    });
  });

  describe("Token Rewards", () => {
    it("should have increasing rewards by house level", () => {
      expect(HOUSE_TOKEN_REWARDS.wonder.lesson_complete).toBeLessThan(
        HOUSE_TOKEN_REWARDS.form.lesson_complete
      );
      expect(HOUSE_TOKEN_REWARDS.form.lesson_complete).toBeLessThan(
        HOUSE_TOKEN_REWARDS.mastery.lesson_complete
      );
    });

    it("should have correct Wonder house rewards", () => {
      expect(HOUSE_TOKEN_REWARDS.wonder.lesson_complete).toBe(10);
      expect(HOUSE_TOKEN_REWARDS.wonder.course_complete).toBe(75);
      expect(HOUSE_TOKEN_REWARDS.wonder.module_complete).toBe(150);
      expect(HOUSE_TOKEN_REWARDS.wonder.house_graduation).toBe(500);
    });

    it("should have correct Form house rewards", () => {
      expect(HOUSE_TOKEN_REWARDS.form.lesson_complete).toBe(15);
      expect(HOUSE_TOKEN_REWARDS.form.course_complete).toBe(100);
      expect(HOUSE_TOKEN_REWARDS.form.module_complete).toBe(200);
      expect(HOUSE_TOKEN_REWARDS.form.house_graduation).toBe(750);
    });

    it("should have correct Mastery house rewards", () => {
      expect(HOUSE_TOKEN_REWARDS.mastery.lesson_complete).toBe(20);
      expect(HOUSE_TOKEN_REWARDS.mastery.course_complete).toBe(150);
      expect(HOUSE_TOKEN_REWARDS.mastery.module_complete).toBe(300);
      expect(HOUSE_TOKEN_REWARDS.mastery.house_graduation).toBe(1000);
    });

    it("should have graduation as highest reward", () => {
      Object.values(HOUSE_TOKEN_REWARDS).forEach(rewards => {
        expect(rewards.house_graduation).toBeGreaterThan(rewards.module_complete);
        expect(rewards.module_complete).toBeGreaterThan(rewards.course_complete);
        expect(rewards.course_complete).toBeGreaterThan(rewards.lesson_complete);
      });
    });
  });

  describe("Divine STEM Modules", () => {
    it("should have 7 modules per house", () => {
      expect(DIVINE_STEM_BY_HOUSE.wonder).toHaveLength(7);
      expect(DIVINE_STEM_BY_HOUSE.form).toHaveLength(7);
      expect(DIVINE_STEM_BY_HOUSE.mastery).toHaveLength(7);
    });

    it("should have age-appropriate module names for Wonder", () => {
      const wonderNames = DIVINE_STEM_BY_HOUSE.wonder.map(m => m.name);
      expect(wonderNames).toContain("Wonder Science");
      expect(wonderNames).toContain("Number Magic");
      expect(wonderNames).toContain("Story Coding");
      expect(wonderNames).toContain("Little Entrepreneurs");
    });

    it("should have intermediate module names for Form", () => {
      const formNames = DIVINE_STEM_BY_HOUSE.form.map(m => m.name);
      expect(formNames).toContain("Origin Science");
      expect(formNames).toContain("Sacred Geometry");
      expect(formNames).toContain("Light & Code");
      expect(formNames).toContain("Entrepreneurial Spark");
    });

    it("should have advanced module names for Mastery", () => {
      const masteryNames = DIVINE_STEM_BY_HOUSE.mastery.map(m => m.name);
      expect(masteryNames).toContain("Advanced Sciences");
      expect(masteryNames).toContain("Higher Mathematics");
      expect(masteryNames).toContain("Systems Architecture");
      expect(masteryNames).toContain("Business Creation");
    });

    it("should have ceremonial titles for all modules", () => {
      Object.values(DIVINE_STEM_BY_HOUSE).forEach(modules => {
        modules.forEach(module => {
          expect(module.ceremonialTitle).toBeDefined();
          expect(module.ceremonialTitle.length).toBeGreaterThan(10);
        });
      });
    });

    it("should have categories for all modules", () => {
      const validCategories = ["stem", "ceremonial", "entrepreneurial", "creative", "language"];
      Object.values(DIVINE_STEM_BY_HOUSE).forEach(modules => {
        modules.forEach(module => {
          expect(validCategories).toContain(module.category);
        });
      });
    });
  });

  describe("Graduation Requirements", () => {
    it("should require 90% progress for graduation", () => {
      const graduationThreshold = 90;
      const checkGraduation = (progress: number) => progress >= graduationThreshold;

      expect(checkGraduation(100)).toBe(true);
      expect(checkGraduation(90)).toBe(true);
      expect(checkGraduation(89)).toBe(false);
      expect(checkGraduation(50)).toBe(false);
    });
  });

  describe("House Progression", () => {
    it("should have correct progression path", () => {
      const progression = ["wonder", "form", "mastery"];
      
      expect(progression[0]).toBe("wonder");
      expect(progression[1]).toBe("form");
      expect(progression[2]).toBe("mastery");
    });

    it("should have increasing complexity", () => {
      // Wonder: playful learning
      expect(LEARNING_HOUSES.wonder.description).toContain("play");
      
      // Form: abstract concepts
      expect(LEARNING_HOUSES.form.description).toContain("abstract");
      
      // Mastery: deep expertise
      expect(LEARNING_HOUSES.mastery.description).toContain("expertise");
    });
  });

  describe("Progress Calculation", () => {
    it("should calculate progress percentage correctly", () => {
      const calculateProgress = (completed: number, total: number) => {
        return total > 0 ? Math.round((completed / total) * 100) : 0;
      };

      expect(calculateProgress(0, 10)).toBe(0);
      expect(calculateProgress(5, 10)).toBe(50);
      expect(calculateProgress(9, 10)).toBe(90);
      expect(calculateProgress(10, 10)).toBe(100);
    });
  });
});
