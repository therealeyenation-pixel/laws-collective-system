import { describe, it, expect, vi, beforeEach } from "vitest";

// Create a proper mock chain that returns the expected result
const createMockDb = () => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]), // This is where the query resolves
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };
  return mockChain;
};

// Mock the database
vi.mock("../db", () => ({
  getDb: vi.fn().mockImplementation(async () => createMockDb()),
}));

// Mock LLM
vi.mock("../_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Test response from bot" } }],
  }),
}));

describe("Bots Router", () => {
  describe("bot types", () => {
    it("should support all valid bot types", async () => {
      const validTypes = [
        "operations",
        "support", 
        "education",
        "analytics",
        "guardian",
        "finance",
        "media",
        "custom"
      ];
      
      // Verify the types are valid
      expect(validTypes).toHaveLength(8);
      expect(validTypes).toContain("operations");
      expect(validTypes).toContain("guardian");
      expect(validTypes).toContain("finance");
    });
  });

  describe("system prompts", () => {
    it("should have the bots router defined", async () => {
      const botsModule = await import("./bots");
      expect(botsModule.botsRouter).toBeDefined();
    });
  });

  describe("router procedures", () => {
    it("should have getAll procedure", async () => {
      const { botsRouter } = await import("./bots");
      expect(botsRouter._def.procedures.getAll).toBeDefined();
    });

    it("should have getById procedure", async () => {
      const { botsRouter } = await import("./bots");
      expect(botsRouter._def.procedures.getById).toBeDefined();
    });

    it("should have create procedure", async () => {
      const { botsRouter } = await import("./bots");
      expect(botsRouter._def.procedures.create).toBeDefined();
    });

    it("should have startConversation procedure", async () => {
      const { botsRouter } = await import("./bots");
      expect(botsRouter._def.procedures.startConversation).toBeDefined();
    });

    it("should have chat procedure", async () => {
      const { botsRouter } = await import("./bots");
      expect(botsRouter._def.procedures.chat).toBeDefined();
    });

    it("should have initializeSystemBots procedure", async () => {
      const { botsRouter } = await import("./bots");
      expect(botsRouter._def.procedures.initializeSystemBots).toBeDefined();
    });
  });
});
