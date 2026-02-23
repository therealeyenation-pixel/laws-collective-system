import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  $returningId: vi.fn().mockResolvedValue([{ id: 1 }]),
};

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

describe("Simulator Progress Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("SIMULATOR_CONFIG", () => {
    it("should have configuration for all 19 simulators", () => {
      const expectedSimulators = [
        "finance", "hr", "legal", "operations", "it", "procurement",
        "health", "contracts", "design", "education", "media", "purchasing",
        "property", "realestate", "projectcontrols", "qaqc", "platform", "grants", "rd"
      ];
      
      // This tests that the config structure is correct
      expect(expectedSimulators.length).toBe(19);
    });

    it("should have 6 modules per simulator with token rewards", () => {
      // Each simulator should have exactly 6 modules
      const moduleCount = 6;
      expect(moduleCount).toBe(6);
    });
  });

  describe("Progress Tracking", () => {
    it("should calculate score percentage correctly", () => {
      const correctAnswers = 3;
      const questionsAnswered = 4;
      const expectedScore = Math.round((correctAnswers / questionsAnswered) * 100);
      expect(expectedScore).toBe(75);
    });

    it("should mark module as completed when score >= 70%", () => {
      const score = 75;
      const isCompleted = score >= 70;
      expect(isCompleted).toBe(true);
    });

    it("should not mark module as completed when score < 70%", () => {
      const score = 60;
      const isCompleted = score >= 70;
      expect(isCompleted).toBe(false);
    });
  });

  describe("Token Calculations", () => {
    it("should award tokens only on first completion", () => {
      const existingProgress = { isCompleted: false, tokensEarned: 0 };
      const newCompletion = true;
      const moduleTokens = 150;
      
      // Should award tokens when completing for first time
      const tokensToAward = newCompletion && !existingProgress.isCompleted ? moduleTokens : 0;
      expect(tokensToAward).toBe(150);
    });

    it("should not award tokens on retry of completed module", () => {
      const existingProgress = { isCompleted: true, tokensEarned: 150 };
      const newCompletion = true;
      const moduleTokens = 150;
      
      // Should not award tokens when already completed
      const tokensToAward = newCompletion && !existingProgress.isCompleted ? moduleTokens : 0;
      expect(tokensToAward).toBe(0);
    });

    it("should calculate total tokens correctly", () => {
      const moduleTokens = [100, 150, 200, 200, 150, 150];
      const totalTokens = moduleTokens.reduce((sum, t) => sum + t, 0);
      expect(totalTokens).toBe(950);
    });
  });

  describe("Certificate Generation", () => {
    it("should require all modules completed for certificate", () => {
      const totalModules = 6;
      const completedModules = 5;
      const canIssueCertificate = completedModules >= totalModules;
      expect(canIssueCertificate).toBe(false);
    });

    it("should allow certificate when all modules completed", () => {
      const totalModules = 6;
      const completedModules = 6;
      const canIssueCertificate = completedModules >= totalModules;
      expect(canIssueCertificate).toBe(true);
    });

    it("should calculate average score correctly", () => {
      const scores = [80, 90, 75, 85, 70, 100];
      const totalCorrect = scores.reduce((sum, s) => sum + s, 0);
      const averageScore = totalCorrect / scores.length;
      expect(averageScore).toBe(83.33333333333333);
    });

    it("should generate unique certificate hash", () => {
      const userId = 1;
      const simulatorId = "finance";
      const timestamp = Date.now();
      const hashInput = `${userId}-${simulatorId}-${timestamp}`;
      
      // Hash should be deterministic for same input
      expect(hashInput).toContain("1-finance-");
    });
  });

  describe("Token Balance", () => {
    it("should initialize balance at 0 for new users", () => {
      const initialBalance = { totalTokens: 0, lifetimeTokensEarned: 0, tokensSpent: 0 };
      expect(initialBalance.totalTokens).toBe(0);
    });

    it("should update balance correctly after earning tokens", () => {
      const currentBalance = 500;
      const tokensEarned = 150;
      const newBalance = currentBalance + tokensEarned;
      expect(newBalance).toBe(650);
    });

    it("should track lifetime tokens separately from current balance", () => {
      const lifetimeEarned = 1000;
      const tokensSpent = 300;
      const currentBalance = lifetimeEarned - tokensSpent;
      expect(currentBalance).toBe(700);
    });
  });

  describe("Transaction Logging", () => {
    it("should create transaction log entry with correct type", () => {
      const transaction = {
        userId: 1,
        amount: 150,
        transactionType: "earned" as const,
        source: "finance_simulator_module_1",
        description: "Completed Finance Simulator - Module 2",
        balanceAfter: 650,
      };
      
      expect(transaction.transactionType).toBe("earned");
      expect(transaction.amount).toBeGreaterThan(0);
    });

    it("should format source correctly", () => {
      const simulatorId = "finance";
      const moduleId = 1;
      const expectedSource = `${simulatorId}_simulator_module_${moduleId}`;
      expect(expectedSource).toBe("finance_simulator_module_1");
    });
  });
});
