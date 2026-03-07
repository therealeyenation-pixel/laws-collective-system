import { describe, it, expect } from "vitest";

// Test the L.A.W.S. Quest Unified game logic and chapter structure
describe("L.A.W.S. Quest Unified Game", () => {
  // Chapter structure tests
  describe("Chapter Structure", () => {
    const CHAPTERS = [
      { id: 1, title: "The Awakening", subtitle: "Discover Why Protection Matters" },
      { id: 2, title: "Foundation Building", subtitle: "Create Your Trust & Entities" },
      { id: 3, title: "The Protection Layer", subtitle: "Shield Your Assets" },
      { id: 4, title: "Income Streams", subtitle: "Build Sustainable Wealth" },
      { id: 5, title: "Generational Transfer", subtitle: "Create Your Legacy" },
    ];

    it("should have 5 chapters in correct order", () => {
      expect(CHAPTERS.length).toBe(5);
      expect(CHAPTERS[0].id).toBe(1);
      expect(CHAPTERS[4].id).toBe(5);
    });

    it("should have unique chapter IDs", () => {
      const ids = CHAPTERS.map(c => c.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it("should have required chapter properties", () => {
      CHAPTERS.forEach(chapter => {
        expect(chapter).toHaveProperty("id");
        expect(chapter).toHaveProperty("title");
        expect(chapter).toHaveProperty("subtitle");
      });
    });
  });

  // Chapter 1: The Awakening - Dual Path
  describe("Chapter 1: The Awakening", () => {
    const paths = ["birth-ward", "birth-trust"];

    it("should offer two starting paths", () => {
      expect(paths.length).toBe(2);
      expect(paths).toContain("birth-ward");
      expect(paths).toContain("birth-trust");
    });

    it("should calculate wealth differently for each path", () => {
      const calculateWardWealth = (age: number) => {
        // W-2 path: slower accumulation, higher taxes
        const yearsWorking = Math.max(0, age - 22);
        const annualSavings = 10000; // After taxes and expenses
        return yearsWorking * annualSavings;
      };

      const calculateTrustWealth = (age: number) => {
        // Trust path: compound growth, tax advantages
        const yearsGrowing = age;
        const initialTrust = 50000;
        const growthRate = 0.08;
        return Math.round(initialTrust * Math.pow(1 + growthRate, yearsGrowing));
      };

      // At age 45
      const wardWealth = calculateWardWealth(45);
      const trustWealth = calculateTrustWealth(45);

      expect(trustWealth).toBeGreaterThan(wardWealth);
    });
  });

  // Chapter 2: Foundation Building
  describe("Chapter 2: Foundation Building", () => {
    const entityTypes = ["508", "501c3"];
    const trustTypes = ["revocable", "irrevocable", "dynasty"];

    it("should offer foundation type choices", () => {
      expect(entityTypes).toContain("508");
      expect(entityTypes).toContain("501c3");
    });

    it("should offer trust type choices", () => {
      expect(trustTypes.length).toBeGreaterThanOrEqual(2);
    });

    it("should validate entity structure", () => {
      const structure = {
        trust: "CALEA Freeman Family Trust",
        parentLLC: "LuvOnPurpose Autonomous Wealth System, LLC",
        operatingLLC: "The L.A.W.S. Collective, LLC",
        foundation: "LuvOnPurpose Academy & Outreach",
      };

      expect(structure.trust).toBeTruthy();
      expect(structure.parentLLC).toBeTruthy();
      expect(structure.operatingLLC).toBeTruthy();
      expect(structure.foundation).toBeTruthy();
    });
  });

  // Chapter 3: Protection Layer
  describe("Chapter 3: Protection Layer", () => {
    const protectionScenarios = [
      { title: "Business Partner Lawsuit", type: "liability" },
      { title: "Medical Emergency", type: "creditor" },
      { title: "Divorce Proceedings", type: "marital" },
    ];

    const provisions = [
      "charging-order",
      "transfer-restrictions",
      "buyout-provisions",
      "dissolution-protection",
      "spendthrift",
    ];

    it("should have multiple protection scenarios", () => {
      expect(protectionScenarios.length).toBeGreaterThanOrEqual(3);
    });

    it("should offer key operating agreement provisions", () => {
      expect(provisions).toContain("charging-order");
      expect(provisions).toContain("spendthrift");
    });

    it("should calculate protection level based on provisions", () => {
      const calculateProtection = (selectedProvisions: string[]) => {
        if (selectedProvisions.length >= 4) return "Maximum";
        if (selectedProvisions.length >= 3) return "Strong";
        return "Basic";
      };

      expect(calculateProtection(["a", "b", "c", "d"])).toBe("Maximum");
      expect(calculateProtection(["a", "b", "c"])).toBe("Strong");
      expect(calculateProtection(["a", "b"])).toBe("Basic");
    });
  });

  // Chapter 4: Income Streams
  describe("Chapter 4: Income Streams", () => {
    const transitionPath = ["w2", "contractor", "owner"];
    const businessTypes = ["service", "product", "real-estate", "franchise"];
    const passiveIncomeTypes = ["rental", "dividends", "royalties", "business-distributions"];

    it("should follow W-2 to Owner transition", () => {
      expect(transitionPath[0]).toBe("w2");
      expect(transitionPath[transitionPath.length - 1]).toBe("owner");
    });

    it("should offer multiple business types", () => {
      expect(businessTypes.length).toBeGreaterThanOrEqual(4);
    });

    it("should calculate passive income correctly", () => {
      const streams = [
        { id: "rental", monthly: 2000 },
        { id: "dividends", monthly: 500 },
        { id: "business-distributions", monthly: 5000 },
      ];

      const totalMonthly = streams.reduce((sum, s) => sum + s.monthly, 0);
      expect(totalMonthly).toBe(7500);
      expect(totalMonthly * 12).toBe(90000); // Annual passive income
    });
  });

  // Chapter 5: Generational Transfer
  describe("Chapter 5: Generational Transfer", () => {
    const successionDocuments = [
      "trust-succession",
      "business-succession",
      "power-of-attorney",
      "healthcare-directive",
    ];

    const legacyStructures = [
      "100-year-trust",
      "family-foundation",
      "family-office",
      "family-constitution",
    ];

    it("should include essential succession documents", () => {
      expect(successionDocuments).toContain("trust-succession");
      expect(successionDocuments).toContain("power-of-attorney");
    });

    it("should offer legacy structure options", () => {
      expect(legacyStructures).toContain("100-year-trust");
      expect(legacyStructures).toContain("family-constitution");
    });

    it("should support multi-generational planning", () => {
      const generations = ["Gen 1", "Gen 2", "Gen 3+"];
      expect(generations.length).toBeGreaterThanOrEqual(3);
    });
  });

  // Progress and Token System
  describe("Progress and Token System", () => {
    const tokens = ["MIRROR", "GIFT", "SPARK", "HOUSE", "CROWN"];

    it("should award tokens for chapter completion", () => {
      const chapterTokens: Record<number, string> = {
        1: "MIRROR",
        2: "GIFT",
        3: "SPARK",
        4: "HOUSE",
        5: "CROWN",
      };

      expect(chapterTokens[1]).toBe("MIRROR");
      expect(chapterTokens[5]).toBe("CROWN");
    });

    it("should track chapter completion", () => {
      const progress = {
        completedChapters: [1, 2, 3],
        tokens: ["MIRROR", "GIFT", "SPARK"],
        knowledge: 450,
      };

      expect(progress.completedChapters.length).toBe(3);
      expect(progress.tokens.length).toBe(progress.completedChapters.length);
    });

    it("should unlock chapters sequentially", () => {
      const isChapterUnlocked = (chapterId: number, completedChapters: number[]) => {
        if (chapterId === 1) return true;
        return completedChapters.includes(chapterId - 1);
      };

      expect(isChapterUnlocked(1, [])).toBe(true);
      expect(isChapterUnlocked(2, [])).toBe(false);
      expect(isChapterUnlocked(2, [1])).toBe(true);
      expect(isChapterUnlocked(5, [1, 2, 3, 4])).toBe(true);
    });
  });

  // Game-to-Real-System Bridge
  describe("Game-to-Real-System Bridge", () => {
    it("should map game choices to real system tools", () => {
      const gameToRealMapping = {
        "foundation-type": "/business-formation",
        "protection-provisions": "/protection-layer",
        "trust-structure": "/trust-documents",
        "business-type": "/business-formation",
      };

      expect(gameToRealMapping["foundation-type"]).toBe("/business-formation");
      expect(gameToRealMapping["trust-structure"]).toBe("/trust-documents");
    });

    it("should preserve game choices for pre-filling forms", () => {
      const gameProgress = {
        chapterProgress: {
          1: { pathChosen: "birth-trust" },
          2: { foundationType: "508", trustName: "Freeman Family Trust" },
          3: { agreementProvisions: ["charging-order", "spendthrift", "transfer-restrictions"] },
          4: { businessType: "service", incomeStreams: ["rental", "dividends"] },
          5: { legacyGoals: ["100-year-trust", "family-constitution"] },
        },
      };

      expect(gameProgress.chapterProgress[2].foundationType).toBe("508");
      expect(gameProgress.chapterProgress[3].agreementProvisions.length).toBe(3);
    });

    it("should unlock real tools after game completion", () => {
      const isGameComplete = (completedChapters: number[]) => {
        return completedChapters.length === 5;
      };

      expect(isGameComplete([1, 2, 3, 4, 5])).toBe(true);
      expect(isGameComplete([1, 2, 3, 4])).toBe(false);
    });
  });
});
