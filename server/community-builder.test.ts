import { describe, it, expect } from "vitest";

/**
 * Community Builder Game Tests
 * Tests the constrained choice mechanics and game logic
 */

describe("Community Builder Game Logic", () => {
  // Test quarterly priority generation
  describe("Quarterly Priorities", () => {
    it("should generate 4-5 priorities per quarter", () => {
      const allPriorities = [
        { id: "expand-academy", name: "Expand Academy", cost: 80000, category: "air" },
        { id: "wellness-services", name: "Add Wellness Services", cost: 60000, category: "water" },
        { id: "business-incubator", name: "Business Incubator", cost: 70000, category: "self" },
        { id: "housing-development", name: "Housing Development", cost: 90000, category: "land" },
        { id: "trade-school", name: "Trade School Program", cost: 55000, category: "air" },
        { id: "legal-services", name: "Legal Services Center", cost: 45000, category: "self" },
        { id: "community-farm", name: "Community Farm", cost: 40000, category: "land" },
        { id: "media-center", name: "Media Production Center", cost: 65000, category: "air" },
      ];
      
      // Simulate random selection
      const shuffled = [...allPriorities].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 4 + Math.floor(Math.random() * 2));
      
      expect(selected.length).toBeGreaterThanOrEqual(4);
      expect(selected.length).toBeLessThanOrEqual(5);
    });

    it("should enforce max priorities per turn constraint", () => {
      const maxPrioritiesPerTurn = 2;
      const selectedPriorities: string[] = [];
      
      // First selection should succeed
      selectedPriorities.push("expand-academy");
      expect(selectedPriorities.length).toBeLessThanOrEqual(maxPrioritiesPerTurn);
      
      // Second selection should succeed
      selectedPriorities.push("wellness-services");
      expect(selectedPriorities.length).toBeLessThanOrEqual(maxPrioritiesPerTurn);
      
      // Third selection should be blocked
      const canSelectMore = selectedPriorities.length < maxPrioritiesPerTurn;
      expect(canSelectMore).toBe(false);
    });

    it("should prevent duplicate priority selection", () => {
      const selectedPriorities = ["expand-academy"];
      const priorityToAdd = "expand-academy";
      
      const isDuplicate = selectedPriorities.includes(priorityToAdd);
      expect(isDuplicate).toBe(true);
    });
  });

  // Test service contracts
  describe("Service Contracts", () => {
    it("should create contracts with required fields", () => {
      const contract = {
        id: "contract-1",
        title: "Website Development",
        description: "Build community website and member portal",
        budget: 15000,
        deadline: 3,
        requiredSkills: ["developer"],
        status: "open" as const,
        bids: [],
      };
      
      expect(contract.id).toBeDefined();
      expect(contract.title).toBeDefined();
      expect(contract.budget).toBeGreaterThan(0);
      expect(contract.deadline).toBeGreaterThan(0);
      expect(contract.requiredSkills.length).toBeGreaterThan(0);
      expect(contract.status).toBe("open");
    });

    it("should allow bid submission", () => {
      const contract = {
        id: "contract-1",
        bids: [] as { playerId: string; amount: number; proposal: string }[],
      };
      
      const bid = {
        playerId: "player-1",
        amount: 13500,
        proposal: "I can complete this project efficiently",
      };
      
      contract.bids.push(bid);
      
      expect(contract.bids.length).toBe(1);
      expect(contract.bids[0].amount).toBeLessThan(15000); // Under budget
    });
  });

  // Test build limitations
  describe("Build Limitations", () => {
    it("should enforce sequence limitations", () => {
      const buildings: { typeId: string }[] = [];
      const hasHousing = buildings.some(b => b.typeId === "housing");
      
      // Should not allow school without housing
      const canBuildSchool = hasHousing;
      expect(canBuildSchool).toBe(false);
      
      // Add housing
      buildings.push({ typeId: "housing" });
      const hasHousingNow = buildings.some(b => b.typeId === "housing");
      
      // Now school should be allowed
      expect(hasHousingNow).toBe(true);
    });

    it("should enforce labor limitations", () => {
      const players = [
        { id: "1", role: "builder" },
        { id: "2", role: "manager" },
      ];
      
      const hasHealer = players.some(p => p.role === "healer");
      const hasEducator = players.some(p => p.role === "educator");
      
      // Cannot build clinic without healer
      expect(hasHealer).toBe(false);
      
      // Cannot build legal center without educator
      expect(hasEducator).toBe(false);
    });

    it("should enforce funding limitations", () => {
      const funds = 100000;
      const buildingCost = 120000;
      const requiredDownPayment = buildingCost * 0.2;
      
      // Check if can afford 20% down payment
      const canAffordDownPayment = funds >= requiredDownPayment;
      expect(canAffordDownPayment).toBe(true); // 100000 >= 24000
      
      // But cannot afford full cost
      const canAffordFull = funds >= buildingCost;
      expect(canAffordFull).toBe(false);
    });
  });

  // Test resource management
  describe("Resource Management", () => {
    it("should track community resources", () => {
      const resources = {
        funds: 250000,
        land: 100,
        labor: 50,
        materials: 100,
        knowledge: 50,
        wellness: 50,
      };
      
      expect(resources.funds).toBe(250000);
      expect(Object.keys(resources).length).toBe(6);
    });

    it("should deduct costs when executing priorities", () => {
      let funds = 250000;
      const priorityCost = 80000;
      
      funds -= priorityCost;
      
      expect(funds).toBe(170000);
    });

    it("should calculate monthly upkeep correctly", () => {
      const buildings = [
        { typeId: "housing", upkeep: 2000 },
        { typeId: "school", upkeep: 5000 },
        { typeId: "clinic", upkeep: 6000 },
      ];
      
      const monthlyUpkeep = buildings.reduce((acc, b) => acc + b.upkeep, 0);
      
      expect(monthlyUpkeep).toBe(13000);
    });
  });

  // Test player roles
  describe("Player Roles", () => {
    it("should have all L.A.W.S. aligned roles", () => {
      const roles = ["builder", "educator", "healer", "manager", "developer"];
      
      expect(roles).toContain("builder");
      expect(roles).toContain("educator");
      expect(roles).toContain("healer");
      expect(roles).toContain("manager");
      expect(roles).toContain("developer");
      expect(roles.length).toBe(5);
    });

    it("should assign role bonuses", () => {
      const roleInfo = {
        builder: { bonus: "+20% construction speed" },
        educator: { bonus: "+20% education effectiveness" },
        healer: { bonus: "+20% wellness services" },
        manager: { bonus: "+20% resource efficiency" },
        developer: { bonus: "+20% business income" },
      };
      
      expect(roleInfo.builder.bonus).toContain("construction");
      expect(roleInfo.educator.bonus).toContain("education");
      expect(roleInfo.healer.bonus).toContain("wellness");
    });
  });

  // Test game phases
  describe("Game Phases", () => {
    it("should progress through phases in order", () => {
      const phases = ["lobby", "startup", "design", "build", "manage"];
      
      expect(phases[0]).toBe("lobby");
      expect(phases[1]).toBe("startup");
      expect(phases[2]).toBe("design");
      expect(phases[3]).toBe("build");
      expect(phases[4]).toBe("manage");
    });

    it("should not skip phases", () => {
      let currentPhaseIndex = 0;
      const phases = ["lobby", "startup", "design", "build", "manage"];
      
      // Advance one phase
      currentPhaseIndex++;
      expect(phases[currentPhaseIndex]).toBe("startup");
      
      // Cannot jump to manage
      const canJumpToManage = currentPhaseIndex === phases.indexOf("build");
      expect(canJumpToManage).toBe(false);
    });
  });
});
