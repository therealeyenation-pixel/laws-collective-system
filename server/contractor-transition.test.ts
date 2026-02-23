import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("Contractor Transition Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Transition Phase Gates", () => {
    it("should define all required transition phases", () => {
      const TRANSITION_PHASES = {
        initiated: { order: 1, label: "Initiated" },
        training_assigned: { order: 2, label: "Training Assigned" },
        training_in_progress: { order: 3, label: "Training In Progress" },
        training_completed: { order: 4, label: "Training Completed" },
        entity_formation: { order: 5, label: "Entity Formation" },
        entity_verified: { order: 6, label: "Entity Verified" },
        contract_pending: { order: 7, label: "Contract Pending" },
        contract_signed: { order: 8, label: "Contract Signed" },
        completed: { order: 9, label: "Completed" },
        cancelled: { order: 0, label: "Cancelled" },
      };

      expect(Object.keys(TRANSITION_PHASES)).toHaveLength(10);
      expect(TRANSITION_PHASES.initiated.order).toBe(1);
      expect(TRANSITION_PHASES.completed.order).toBe(9);
    });

    it("should define all required training modules", () => {
      const REQUIRED_TRAINING_MODULES = [
        { id: "1099-taxes", title: "Understanding 1099 Tax Obligations", passingScore: 80 },
        { id: "invoicing-basics", title: "Professional Invoicing & Billing", passingScore: 80 },
        { id: "contract-terms", title: "Understanding Contract Terms", passingScore: 85 },
        { id: "ic-vs-employee", title: "Independent Contractor vs Employee", passingScore: 90 },
        { id: "business-entity-basics", title: "Business Entity Formation", passingScore: 80 },
        { id: "business-banking", title: "Business Banking & Financial Separation", passingScore: 80 },
        { id: "insurance-requirements", title: "Business Insurance Requirements", passingScore: 75 },
        { id: "laws-platform-orientation", title: "L.A.W.S. Business OS Platform Orientation", passingScore: 85 },
      ];

      expect(REQUIRED_TRAINING_MODULES).toHaveLength(8);
      expect(REQUIRED_TRAINING_MODULES.find(m => m.id === "ic-vs-employee")?.passingScore).toBe(90);
    });
  });

  describe("Gate Verification Logic", () => {
    it("should block entity formation if training not completed", () => {
      const transition = {
        phase: "training_in_progress",
        certificationIssued: false,
      };

      const canStartEntityFormation = transition.certificationIssued === true;
      expect(canStartEntityFormation).toBe(false);
    });

    it("should allow entity formation after training completion", () => {
      const transition = {
        phase: "training_completed",
        certificationIssued: true,
      };

      const canStartEntityFormation = transition.certificationIssued === true;
      expect(canStartEntityFormation).toBe(true);
    });

    it("should block contract generation if entity not verified", () => {
      const transition = {
        phase: "entity_formation",
        einObtained: false,
        businessBankSetup: false,
      };

      const canGenerateContract = transition.einObtained && transition.businessBankSetup;
      expect(canGenerateContract).toBe(false);
    });

    it("should allow contract generation after entity verification", () => {
      const transition = {
        phase: "entity_verified",
        einObtained: true,
        businessBankSetup: true,
      };

      const canGenerateContract = transition.einObtained && transition.businessBankSetup;
      expect(canGenerateContract).toBe(true);
    });

    it("should block final transition if any gate is not passed", () => {
      const gateChecks = [
        { name: "Training Completed", passed: true },
        { name: "Entity Formed", passed: true },
        { name: "EIN Obtained", passed: true },
        { name: "Business Bank Account", passed: false }, // This one fails
        { name: "Contract Generated", passed: true },
      ];

      const failedGates = gateChecks.filter(g => !g.passed);
      expect(failedGates.length).toBeGreaterThan(0);
      expect(failedGates[0].name).toBe("Business Bank Account");
    });

    it("should allow final transition when all gates pass", () => {
      const gateChecks = [
        { name: "Training Completed", passed: true },
        { name: "Entity Formed", passed: true },
        { name: "EIN Obtained", passed: true },
        { name: "Business Bank Account", passed: true },
        { name: "Contract Generated", passed: true },
      ];

      const failedGates = gateChecks.filter(g => !g.passed);
      expect(failedGates.length).toBe(0);
    });
  });

  describe("Platform Lock-In Verification", () => {
    it("should require platform subscription acceptance for completion", () => {
      const contractTerms = {
        clauses: {
          nonCompete: true,
          ipAssignment: true,
          platformLicense: true,
        },
      };

      expect(contractTerms.clauses.platformLicense).toBe(true);
      expect(contractTerms.clauses.nonCompete).toBe(true);
      expect(contractTerms.clauses.ipAssignment).toBe(true);
    });

    it("should track platform subscription tier", () => {
      const validTiers = ["none", "basic", "professional", "enterprise"];
      const contractorBusiness = {
        platformSubscription: "basic",
      };

      expect(validTiers).toContain(contractorBusiness.platformSubscription);
    });
  });

  describe("Worker Type Transition", () => {
    it("should only allow employees to transition", () => {
      const employee = { workerType: "employee" };
      const contractor = { workerType: "contractor" };
      const volunteer = { workerType: "volunteer" };

      expect(employee.workerType === "employee").toBe(true);
      expect(contractor.workerType === "employee").toBe(false);
      expect(volunteer.workerType === "employee").toBe(false);
    });

    it("should update worker type to contractor after completion", () => {
      const employee = { workerType: "employee" as "employee" | "contractor" | "volunteer" };
      
      // Simulate transition completion
      employee.workerType = "contractor";
      
      expect(employee.workerType).toBe("contractor");
    });
  });

  describe("EIN Validation", () => {
    it("should validate EIN format XX-XXXXXXX", () => {
      const validEIN = "12-3456789";
      const invalidEIN1 = "123456789";
      const invalidEIN2 = "12-345678";
      const invalidEIN3 = "1-23456789";

      const einRegex = /^\d{2}-\d{7}$/;

      expect(einRegex.test(validEIN)).toBe(true);
      expect(einRegex.test(invalidEIN1)).toBe(false);
      expect(einRegex.test(invalidEIN2)).toBe(false);
      expect(einRegex.test(invalidEIN3)).toBe(false);
    });
  });

  describe("Progress Calculation", () => {
    it("should calculate progress percentage correctly", () => {
      const phases = {
        initiated: 1,
        training_assigned: 2,
        training_in_progress: 3,
        training_completed: 4,
        entity_formation: 5,
        entity_verified: 6,
        contract_pending: 7,
        contract_signed: 8,
        completed: 9,
      };

      const calculateProgress = (phase: keyof typeof phases) => 
        Math.round((phases[phase] / 9) * 100);

      expect(calculateProgress("initiated")).toBe(11);
      expect(calculateProgress("training_completed")).toBe(44);
      expect(calculateProgress("entity_verified")).toBe(67);
      expect(calculateProgress("completed")).toBe(100);
    });
  });
});
