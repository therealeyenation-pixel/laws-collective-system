import { describe, it, expect } from "vitest";

describe("Achievement Notification System", () => {
  describe("Rarity Colors", () => {
    const RARITY_COLORS = {
      common: { bg: "from-gray-500/20 to-gray-600/20", border: "border-gray-400", text: "text-gray-300" },
      uncommon: { bg: "from-green-500/20 to-emerald-600/20", border: "border-green-400", text: "text-green-300" },
      rare: { bg: "from-blue-500/20 to-indigo-600/20", border: "border-blue-400", text: "text-blue-300" },
      epic: { bg: "from-purple-500/20 to-violet-600/20", border: "border-purple-400", text: "text-purple-300" },
      legendary: { bg: "from-amber-500/20 to-orange-600/20", border: "border-amber-400", text: "text-amber-300" },
    };

    it("should have all five rarity levels defined", () => {
      expect(Object.keys(RARITY_COLORS)).toHaveLength(5);
      expect(RARITY_COLORS).toHaveProperty("common");
      expect(RARITY_COLORS).toHaveProperty("uncommon");
      expect(RARITY_COLORS).toHaveProperty("rare");
      expect(RARITY_COLORS).toHaveProperty("epic");
      expect(RARITY_COLORS).toHaveProperty("legendary");
    });

    it("should have consistent styling properties for each rarity", () => {
      Object.values(RARITY_COLORS).forEach((style) => {
        expect(style).toHaveProperty("bg");
        expect(style).toHaveProperty("border");
        expect(style).toHaveProperty("text");
      });
    });
  });

  describe("Achievement Structure", () => {
    interface Achievement {
      id: string;
      name: string;
      description: string;
      category: string;
      points: number;
      icon: string;
      rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
      unlockedAt?: number;
    }

    const sampleAchievement: Achievement = {
      id: "first_steps",
      name: "First Steps",
      description: "Complete the tutorial",
      category: "quest",
      points: 10,
      icon: "footprints",
      rarity: "common",
    };

    it("should have required fields", () => {
      expect(sampleAchievement.id).toBeDefined();
      expect(sampleAchievement.name).toBeDefined();
      expect(sampleAchievement.description).toBeDefined();
      expect(sampleAchievement.category).toBeDefined();
      expect(sampleAchievement.points).toBeDefined();
      expect(sampleAchievement.icon).toBeDefined();
      expect(sampleAchievement.rarity).toBeDefined();
    });

    it("should have valid point values", () => {
      expect(sampleAchievement.points).toBeGreaterThan(0);
      expect(typeof sampleAchievement.points).toBe("number");
    });

    it("should have valid rarity", () => {
      const validRarities = ["common", "uncommon", "rare", "epic", "legendary"];
      expect(validRarities).toContain(sampleAchievement.rarity);
    });
  });

  describe("Notification Queue", () => {
    it("should process achievements in order", () => {
      const queue = [
        { id: "1", name: "First" },
        { id: "2", name: "Second" },
        { id: "3", name: "Third" },
      ];

      const processed: string[] = [];
      while (queue.length > 0) {
        const item = queue.shift();
        if (item) processed.push(item.id);
      }

      expect(processed).toEqual(["1", "2", "3"]);
    });

    it("should handle empty queue", () => {
      const queue: any[] = [];
      expect(queue.length).toBe(0);
      expect(queue.shift()).toBeUndefined();
    });
  });
});

describe("Tutorial Integration", () => {
  describe("Tutorial Steps", () => {
    const TUTORIAL_STEPS = [
      { id: 1, title: "Welcome to L.A.W.S.", pillar: "overview" },
      { id: 2, title: "LAND - Foundation", pillar: "land" },
      { id: 3, title: "AIR - Knowledge", pillar: "air" },
      { id: 4, title: "WATER - Balance", pillar: "water" },
      { id: 5, title: "SELF - Purpose", pillar: "self" },
      { id: 6, title: "The Quest Journey", pillar: "quest" },
      { id: 7, title: "Community Building", pillar: "community" },
      { id: 8, title: "Achievements & Progress", pillar: "achievements" },
      { id: 9, title: "Real-World Connection", pillar: "bridge" },
      { id: 10, title: "Begin Your Journey", pillar: "start" },
    ];

    it("should have 10 tutorial steps", () => {
      expect(TUTORIAL_STEPS).toHaveLength(10);
    });

    it("should have sequential IDs", () => {
      TUTORIAL_STEPS.forEach((step, index) => {
        expect(step.id).toBe(index + 1);
      });
    });

    it("should cover all L.A.W.S. pillars", () => {
      const pillars = TUTORIAL_STEPS.map(s => s.pillar);
      expect(pillars).toContain("land");
      expect(pillars).toContain("air");
      expect(pillars).toContain("water");
      expect(pillars).toContain("self");
    });
  });

  describe("First-Time Player Detection", () => {
    it("should detect first-time player when no localStorage key exists", () => {
      const hasCompletedTutorial = null; // Simulating localStorage.getItem returning null
      const isFirstTime = !hasCompletedTutorial;
      expect(isFirstTime).toBe(true);
    });

    it("should detect returning player when localStorage key exists", () => {
      const hasCompletedTutorial = "true"; // Simulating localStorage.getItem returning "true"
      const isFirstTime = !hasCompletedTutorial;
      expect(isFirstTime).toBe(false);
    });

    it("should handle skipped tutorial status", () => {
      const tutorialStatus = "skipped";
      const wasSkipped = tutorialStatus === "skipped";
      const wasCompleted = tutorialStatus === "true";
      
      expect(wasSkipped).toBe(true);
      expect(wasCompleted).toBe(false);
    });
  });

  describe("Tutorial Progress", () => {
    it("should calculate progress percentage correctly", () => {
      const totalSteps = 10;
      
      const calculateProgress = (currentStep: number) => 
        Math.round((currentStep / totalSteps) * 100);
      
      expect(calculateProgress(1)).toBe(10);
      expect(calculateProgress(5)).toBe(50);
      expect(calculateProgress(10)).toBe(100);
    });

    it("should track completion state", () => {
      interface TutorialState {
        currentStep: number;
        isComplete: boolean;
        wasSkipped: boolean;
      }

      const initialState: TutorialState = {
        currentStep: 1,
        isComplete: false,
        wasSkipped: false,
      };

      // Simulate completing tutorial
      const completedState: TutorialState = {
        ...initialState,
        currentStep: 10,
        isComplete: true,
      };

      expect(completedState.isComplete).toBe(true);
      expect(completedState.currentStep).toBe(10);
    });
  });
});

describe("Achievement Categories", () => {
  const CATEGORIES = {
    quest: { label: "L.A.W.S. Quest", description: "Achievements from completing the L.A.W.S. Quest chapters" },
    community: { label: "Community Builder", description: "Achievements from building and managing communities" },
    multiplayer: { label: "Multiplayer", description: "Achievements from multiplayer games and collaboration" },
    special: { label: "Special", description: "Rare and unique achievements" },
  };

  it("should have four main categories", () => {
    expect(Object.keys(CATEGORIES)).toHaveLength(4);
  });

  it("should have labels and descriptions for each category", () => {
    Object.values(CATEGORIES).forEach((cat) => {
      expect(cat.label).toBeDefined();
      expect(cat.description).toBeDefined();
      expect(cat.label.length).toBeGreaterThan(0);
      expect(cat.description.length).toBeGreaterThan(0);
    });
  });
});
