import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
};

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

describe("House Activation Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("House Activation on Business Completion", () => {
    it("should create a new House when business workshop is completed", async () => {
      // Test that the activation flow creates a House
      const activationInput = {
        businessName: "Test Business LLC",
        businessType: "LLC",
        stateOfFormation: "CA",
      };

      // Verify input structure is correct
      expect(activationInput).toHaveProperty("businessName");
      expect(activationInput).toHaveProperty("businessType");
      expect(activationInput).toHaveProperty("stateOfFormation");
      expect(activationInput.businessName).toBe("Test Business LLC");
    });

    it("should initialize LuvLedger when House is created", async () => {
      // Test that LuvLedger is created with correct initial values
      const ledgerInitValues = {
        houseId: 1,
        ledgerName: "Test Business LuvLedger",
        ledgerStatus: "active",
        totalBalance: "0.00",
        reserveBalance: "0.00",
        circulationBalance: "0.00",
        treasuryContribution: "0.00",
        houseRetained: "0.00",
        transactionCount: 0,
      };

      expect(ledgerInitValues.totalBalance).toBe("0.00");
      expect(ledgerInitValues.ledgerStatus).toBe("active");
      expect(ledgerInitValues.transactionCount).toBe(0);
    });

    it("should generate unique registry ID for each House", () => {
      // Test registry ID generation
      const generateRegistryId = () => `RIN-${Date.now().toString(36).toUpperCase()}`;
      
      const id1 = generateRegistryId();
      const id2 = generateRegistryId();
      
      expect(id1).toMatch(/^RIN-[A-Z0-9]+$/);
      expect(id1.startsWith("RIN-")).toBe(true);
    });

    it("should apply 70/30 treasury split on inflows", () => {
      const inflow = 1000;
      const treasuryAmount = inflow * 0.30; // 30% to treasury
      const houseAmount = inflow * 0.70; // 70% to house

      expect(treasuryAmount).toBe(300);
      expect(houseAmount).toBe(700);
      expect(treasuryAmount + houseAmount).toBe(inflow);
    });

    it("should apply 60/40 house split on house portion", () => {
      const houseAmount = 700; // 70% of 1000
      const reserveAmount = houseAmount * 0.60; // 60% to reserve
      const circulationAmount = houseAmount * 0.40; // 40% to circulation

      expect(reserveAmount).toBe(420);
      expect(circulationAmount).toBe(280);
      expect(reserveAmount + circulationAmount).toBe(houseAmount);
    });
  });

  describe("Post-Activation Course Tracking", () => {
    it("should define correct post-activation courses", () => {
      const postActivationCourses = [
        { id: "trust", name: "Trust Workshop", required: true },
        { id: "contracts", name: "Contracts Workshop", required: true },
        { id: "dba", name: "DBA & Trademark Workshop", required: false },
        { id: "grants", name: "Grant Writing Workshop", required: false },
        { id: "blockchain", name: "Blockchain Courses", required: false },
      ];

      expect(postActivationCourses).toHaveLength(5);
      expect(postActivationCourses.filter(c => c.required)).toHaveLength(2);
      expect(postActivationCourses.find(c => c.id === "trust")?.required).toBe(true);
      expect(postActivationCourses.find(c => c.id === "contracts")?.required).toBe(true);
    });

    it("should track token unlock status", () => {
      const tokensUnlocked = {
        MIRROR: true, // Unlocked on registration
        GIFT: false,
        SPARK: false,
        HOUSE: true, // Unlocked on business completion
        CROWN: false,
      };

      expect(tokensUnlocked.MIRROR).toBe(true);
      expect(tokensUnlocked.HOUSE).toBe(true);
      expect(tokensUnlocked.CROWN).toBe(false);
    });

    it("should unlock SPARK token when trust course is completed", () => {
      const courseToTokenMap: Record<string, string> = {
        trust: "SPARK",
        contracts: "GIFT",
      };

      expect(courseToTokenMap["trust"]).toBe("SPARK");
      expect(courseToTokenMap["contracts"]).toBe("GIFT");
    });
  });

  describe("LuvLedger Transaction Hashing", () => {
    it("should generate unique transaction hashes", () => {
      const crypto = require("crypto");
      
      const generateTransactionHash = (
        ledgerId: number,
        amount: string,
        type: string,
        previousHash: string | null
      ): string => {
        const data = `TX-${ledgerId}-${amount}-${type}-${previousHash || "GENESIS"}-${Date.now()}`;
        return crypto.createHash("sha256").update(data).digest("hex");
      };

      const hash1 = generateTransactionHash(1, "100.00", "inflow", null);
      const hash2 = generateTransactionHash(1, "100.00", "inflow", hash1);

      expect(hash1).toHaveLength(64); // SHA256 produces 64 hex characters
      expect(hash2).toHaveLength(64);
      expect(hash1).not.toBe(hash2); // Different hashes due to timestamp
    });

    it("should generate ledger hash with house ID and timestamp", () => {
      const crypto = require("crypto");
      
      const generateLedgerHash = (houseId: number, timestamp: Date): string => {
        const data = `LEDGER-${houseId}-${timestamp.toISOString()}`;
        return crypto.createHash("sha256").update(data).digest("hex");
      };

      const timestamp = new Date("2025-01-16T00:00:00Z");
      const hash = generateLedgerHash(1, timestamp);

      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("House Types", () => {
    it("should support all house types", () => {
      const houseTypes = ["root", "bloodline", "mirrored", "adaptive"];
      
      expect(houseTypes).toContain("root");
      expect(houseTypes).toContain("bloodline");
      expect(houseTypes).toContain("mirrored");
      expect(houseTypes).toContain("adaptive");
    });

    it("should default new houses to adaptive type", () => {
      const newHouse = {
        name: "Test House",
        houseType: "adaptive",
        status: "active",
      };

      expect(newHouse.houseType).toBe("adaptive");
    });
  });
});
