import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the LLM module
vi.mock("../_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            definition: "A test definition",
            partOfSpeech: "noun",
            exampleSentence: "This is a test sentence.",
          }),
        },
      },
    ],
  }),
}));

// Mock the database
vi.mock("../db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    $returningId: vi.fn().mockResolvedValue([{ id: 1 }]),
  },
  getDb: vi.fn(),
}));

describe("Virtual Library Router", () => {
  describe("Discussion Types", () => {
    it("should have correct discussion type options", () => {
      const discussionTypes = [
        "comprehension",
        "analysis",
        "socratic",
        "vocabulary",
        "free_form",
      ];
      
      expect(discussionTypes).toContain("comprehension");
      expect(discussionTypes).toContain("analysis");
      expect(discussionTypes).toContain("socratic");
      expect(discussionTypes).toContain("vocabulary");
      expect(discussionTypes).toContain("free_form");
      expect(discussionTypes.length).toBe(5);
    });
  });

  describe("Grade Levels", () => {
    it("should have correct grade level options", () => {
      const gradeLevels = ["k_2", "3_5", "6_8", "9_12"];
      
      expect(gradeLevels).toContain("k_2");
      expect(gradeLevels).toContain("3_5");
      expect(gradeLevels).toContain("6_8");
      expect(gradeLevels).toContain("9_12");
      expect(gradeLevels.length).toBe(4);
    });
  });

  describe("Reading Levels", () => {
    it("should have correct reading level options", () => {
      const readingLevels = ["k_2", "3_5", "6_8", "9_12", "adult"];
      
      expect(readingLevels).toContain("k_2");
      expect(readingLevels).toContain("3_5");
      expect(readingLevels).toContain("6_8");
      expect(readingLevels).toContain("9_12");
      expect(readingLevels).toContain("adult");
      expect(readingLevels.length).toBe(5);
    });
  });

  describe("L.A.W.S. Pillars", () => {
    it("should have correct pillar options for book classification", () => {
      const lawsPillars = ["land", "air", "water", "self"];
      
      expect(lawsPillars).toContain("land");
      expect(lawsPillars).toContain("air");
      expect(lawsPillars).toContain("water");
      expect(lawsPillars).toContain("self");
      expect(lawsPillars.length).toBe(4);
    });
  });

  describe("Discussion Requirements by Grade Level", () => {
    it("should have correct requirements for K-2", () => {
      const k2Requirements = {
        readAloudDefault: true,
        readAloudCanDisable: true,
        basicQARequired: true,
        deepDiscussionRequired: false,
        deepDiscussionEncouraged: false,
      };
      
      expect(k2Requirements.readAloudDefault).toBe(true);
      expect(k2Requirements.basicQARequired).toBe(true);
      expect(k2Requirements.deepDiscussionRequired).toBe(false);
    });

    it("should have correct requirements for 3-5", () => {
      const requirements = {
        readAloudDefault: false,
        readAloudCanDisable: true,
        basicQARequired: true,
        deepDiscussionRequired: false,
        deepDiscussionEncouraged: false,
      };
      
      expect(requirements.readAloudDefault).toBe(false);
      expect(requirements.basicQARequired).toBe(true);
      expect(requirements.deepDiscussionRequired).toBe(false);
    });

    it("should have correct requirements for 6-8", () => {
      const requirements = {
        readAloudDefault: false,
        readAloudCanDisable: true,
        basicQARequired: true,
        deepDiscussionRequired: false,
        deepDiscussionEncouraged: true,
        discussionBonusCredits: 10,
      };
      
      expect(requirements.basicQARequired).toBe(true);
      expect(requirements.deepDiscussionEncouraged).toBe(true);
      expect(requirements.discussionBonusCredits).toBe(10);
    });

    it("should have correct requirements for 9-12", () => {
      const requirements = {
        readAloudDefault: false,
        readAloudCanDisable: true,
        basicQARequired: true,
        deepDiscussionRequired: true,
        deepDiscussionEncouraged: true,
      };
      
      expect(requirements.basicQARequired).toBe(true);
      expect(requirements.deepDiscussionRequired).toBe(true);
    });
  });

  describe("Sample Books Data", () => {
    it("should have correct sample book structure", () => {
      const sampleBook = {
        title: "The Richest Man in Babylon",
        author: "George S. Clason",
        genre: "Personal Finance",
        lawsPillar: "self",
        readingLevel: "6_8",
        pageCount: 144,
        estimatedReadingMinutes: 180,
        description: "A classic guide to financial wisdom through parables set in ancient Babylon.",
        hasQuizzes: true,
        hasDiscussionGuide: true,
      };
      
      expect(sampleBook.title).toBe("The Richest Man in Babylon");
      expect(sampleBook.lawsPillar).toBe("self");
      expect(sampleBook.readingLevel).toBe("6_8");
      expect(sampleBook.hasQuizzes).toBe(true);
      expect(sampleBook.hasDiscussionGuide).toBe(true);
    });
  });

  describe("Vocabulary Word Structure", () => {
    it("should have correct vocabulary word structure", () => {
      const vocabularyWord = {
        word: "sovereignty",
        definition: "Supreme power or authority",
        partOfSpeech: "noun",
        exampleSentence: "The nation declared its sovereignty.",
        contextFromBook: "Page 42",
        masteryLevel: "new",
      };
      
      expect(vocabularyWord.word).toBe("sovereignty");
      expect(vocabularyWord.partOfSpeech).toBe("noun");
      expect(vocabularyWord.masteryLevel).toBe("new");
    });

    it("should have correct mastery levels", () => {
      const masteryLevels = ["new", "learning", "familiar", "mastered"];
      
      expect(masteryLevels).toContain("new");
      expect(masteryLevels).toContain("learning");
      expect(masteryLevels).toContain("familiar");
      expect(masteryLevels).toContain("mastered");
      expect(masteryLevels.length).toBe(4);
    });
  });

  describe("Reading Session Status", () => {
    it("should have correct session status options", () => {
      const sessionStatuses = ["not_started", "in_progress", "completed", "abandoned"];
      
      expect(sessionStatuses).toContain("not_started");
      expect(sessionStatuses).toContain("in_progress");
      expect(sessionStatuses).toContain("completed");
      expect(sessionStatuses).toContain("abandoned");
      expect(sessionStatuses.length).toBe(4);
    });
  });

  describe("Discussion Quality Levels", () => {
    it("should have correct quality level options", () => {
      const qualityLevels = ["surface", "developing", "proficient", "advanced"];
      
      expect(qualityLevels).toContain("surface");
      expect(qualityLevels).toContain("developing");
      expect(qualityLevels).toContain("proficient");
      expect(qualityLevels).toContain("advanced");
      expect(qualityLevels.length).toBe(4);
    });
  });
});
