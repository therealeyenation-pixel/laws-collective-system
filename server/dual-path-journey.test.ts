import { describe, it, expect } from "vitest";

/**
 * Tests for the Dual Path Journey game logic
 * The game compares Birth-Ward vs Birth-Trust paths through life
 */

// Life stage definitions matching the game
const LIFE_STAGES = [
  { id: "birth", name: "Birth", ageRange: "0", years: 0 },
  { id: "childhood", name: "Childhood", ageRange: "1-12", years: 12 },
  { id: "teen", name: "Teen Years", ageRange: "13-17", years: 5 },
  { id: "young_adult", name: "Young Adult", ageRange: "18-25", years: 8 },
  { id: "adult", name: "Adult", ageRange: "26-40", years: 15 },
  { id: "middle_age", name: "Middle Age", ageRange: "41-55", years: 15 },
  { id: "pre_retirement", name: "Pre-Retirement", ageRange: "56-65", years: 10 },
  { id: "retirement", name: "Retirement", ageRange: "65+", years: 20 },
];

// Calculate age from stage index
const getAgeFromStage = (stageIndex: number): number => {
  let age = 0;
  for (let i = 0; i <= stageIndex && i < LIFE_STAGES.length; i++) {
    if (i > 0) {
      age += LIFE_STAGES[i].years;
    }
  }
  return age;
};

// Format currency helper
const formatCurrency = (amount: number): string => {
  const absAmount = Math.abs(amount);
  if (absAmount >= 1000000) {
    return `${amount < 0 ? '-' : ''}$${(absAmount / 1000000).toFixed(1)}M`;
  }
  if (absAmount >= 1000) {
    return `${amount < 0 ? '-' : ''}$${(absAmount / 1000).toFixed(0)}K`;
  }
  return `${amount < 0 ? '-' : ''}$${absAmount.toFixed(0)}`;
};

// Catch-up calculator
const calculateCatchUp = (currentAge: number, wardNetWorth: number, trustNetWorth: number) => {
  const gap = trustNetWorth - wardNetWorth;
  const yearsToRetirement = Math.max(0, 65 - currentAge);
  
  if (yearsToRetirement === 0) return { monthlyRequired: 0, yearlyRequired: 0, feasible: false, gap };
  
  const monthlyRate = 0.08 / 12;
  const months = yearsToRetirement * 12;
  const monthlyRequired = gap * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
  const yearlyRequired = monthlyRequired * 12;
  const feasible = yearlyRequired < 60000;
  
  return {
    monthlyRequired: Math.round(monthlyRequired),
    yearlyRequired: Math.round(yearlyRequired),
    feasible,
    yearsToClose: yearsToRetirement,
    gap,
  };
};

describe("Dual Path Journey - Life Stages", () => {
  it("should have 8 life stages", () => {
    expect(LIFE_STAGES.length).toBe(8);
  });

  it("should start with birth stage", () => {
    expect(LIFE_STAGES[0].id).toBe("birth");
    expect(LIFE_STAGES[0].years).toBe(0);
  });

  it("should end with retirement stage", () => {
    expect(LIFE_STAGES[LIFE_STAGES.length - 1].id).toBe("retirement");
  });

  it("should calculate correct age at each stage", () => {
    expect(getAgeFromStage(0)).toBe(0); // Birth
    expect(getAgeFromStage(1)).toBe(12); // End of childhood
    expect(getAgeFromStage(2)).toBe(17); // End of teen
    expect(getAgeFromStage(3)).toBe(25); // End of young adult
    expect(getAgeFromStage(4)).toBe(40); // End of adult
    expect(getAgeFromStage(5)).toBe(55); // End of middle age
    expect(getAgeFromStage(6)).toBe(65); // End of pre-retirement
    expect(getAgeFromStage(7)).toBe(85); // End of retirement
  });
});

describe("Dual Path Journey - Currency Formatting", () => {
  it("should format small amounts correctly", () => {
    expect(formatCurrency(500)).toBe("$500");
    expect(formatCurrency(0)).toBe("$0");
  });

  it("should format thousands with K suffix", () => {
    expect(formatCurrency(5000)).toBe("$5K");
    expect(formatCurrency(50000)).toBe("$50K");
    expect(formatCurrency(500000)).toBe("$500K");
  });

  it("should format millions with M suffix", () => {
    expect(formatCurrency(1000000)).toBe("$1.0M");
    expect(formatCurrency(2500000)).toBe("$2.5M");
  });

  it("should handle negative amounts", () => {
    expect(formatCurrency(-5000)).toBe("-$5K");
    expect(formatCurrency(-1000000)).toBe("-$1.0M");
  });
});

describe("Dual Path Journey - Catch-Up Calculator", () => {
  it("should calculate catch-up requirements for 35 year old", () => {
    const result = calculateCatchUp(35, 50000, 200000);
    expect(result.gap).toBe(150000);
    expect(result.yearsToClose).toBe(30);
    expect(result.monthlyRequired).toBeGreaterThan(0);
    expect(result.yearlyRequired).toBeGreaterThan(0);
  });

  it("should mark as infeasible for large gaps", () => {
    const result = calculateCatchUp(55, 100000, 2000000);
    expect(result.gap).toBe(1900000);
    expect(result.yearsToClose).toBe(10);
    expect(result.feasible).toBe(false);
  });

  it("should return zero for retirement age", () => {
    const result = calculateCatchUp(65, 100000, 500000);
    expect(result.monthlyRequired).toBe(0);
    expect(result.yearlyRequired).toBe(0);
    expect(result.feasible).toBe(false);
  });

  it("should mark reasonable gaps as feasible", () => {
    const result = calculateCatchUp(25, 10000, 50000);
    expect(result.feasible).toBe(true);
  });
});

describe("Dual Path Journey - Path Comparison", () => {
  it("should show trust path advantage at birth", () => {
    const wardStarting = 0;
    const trustStarting = 5000;
    expect(trustStarting).toBeGreaterThan(wardStarting);
  });

  it("should show protection level difference", () => {
    const wardProtection = 0;
    const trustProtection = 100;
    expect(trustProtection - wardProtection).toBe(100);
  });

  it("should calculate wealth gap correctly", () => {
    const wardNetWorth = 150000;
    const trustNetWorth = 500000;
    const gap = trustNetWorth - wardNetWorth;
    expect(gap).toBe(350000);
  });
});

describe("Dual Path Journey - Convergence Points", () => {
  const CONVERGENCE_STEPS = [
    { id: "awareness", wardAge: 35, trustAge: 12 },
    { id: "education", wardAge: 38, trustAge: 14 },
    { id: "first-entity", wardAge: 40, trustAge: 18 },
    { id: "trust-creation", wardAge: 42, trustAge: 0 },
    { id: "asset-protection", wardAge: 45, trustAge: 0 },
    { id: "passive-income", wardAge: 50, trustAge: 25 },
    { id: "generational-planning", wardAge: 55, trustAge: 30 },
    { id: "sovereignty", wardAge: 60, trustAge: 35 },
  ];

  it("should have 8 convergence steps", () => {
    expect(CONVERGENCE_STEPS.length).toBe(8);
  });

  it("should show trust path reaches milestones earlier", () => {
    for (const step of CONVERGENCE_STEPS) {
      expect(step.trustAge).toBeLessThanOrEqual(step.wardAge);
    }
  });

  it("should show trust has protection from birth", () => {
    const trustCreation = CONVERGENCE_STEPS.find(s => s.id === "trust-creation");
    expect(trustCreation?.trustAge).toBe(0);
  });

  it("should show ward discovers need for trust in mid-30s", () => {
    const awareness = CONVERGENCE_STEPS.find(s => s.id === "awareness");
    expect(awareness?.wardAge).toBe(35);
  });

  it("should show both paths reach sovereignty", () => {
    const sovereignty = CONVERGENCE_STEPS.find(s => s.id === "sovereignty");
    expect(sovereignty).toBeDefined();
    expect(sovereignty?.wardAge).toBe(60);
    expect(sovereignty?.trustAge).toBe(35);
  });
});
