import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    execute: vi.fn(),
  },
}));

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a, b) => ({ field: a, value: b })),
}));

// Mock schema
vi.mock("../drizzle/schema", () => ({
  users: {
    id: "id",
    memberStatus: "memberStatus",
    formationStep: "formationStep",
    houseActivatedAt: "houseActivatedAt",
    role: "role",
  },
}));

describe("Member Journey Logic", () => {
  const FORMATION_STEPS = [
    { step: 1, label: "Join & Complete Profile", description: "Create your account and tell us about yourself" },
    { step: 2, label: "Academy Orientation", description: "Complete your academy onboarding modules" },
    { step: 3, label: "Business Simulators", description: "Run through business, tax, and grant simulators" },
    { step: 4, label: "Business Plan", description: "Generate and refine your business plan" },
    { step: 5, label: "Business Formation", description: "Legally establish your business entity" },
    { step: 6, label: "Operating Agreements", description: "Draft and sign your operating agreements" },
    { step: 7, label: "House Activation", description: "Your customized management structure goes live" },
  ];

  it("should define 7 formation steps", () => {
    expect(FORMATION_STEPS).toHaveLength(7);
    expect(FORMATION_STEPS[0].label).toBe("Join & Complete Profile");
    expect(FORMATION_STEPS[6].label).toBe("House Activation");
  });

  it("should calculate progress percentage correctly", () => {
    const totalSteps = 7;
    
    // Step 0 = 0%
    expect(Math.round((0 / totalSteps) * 100)).toBe(0);
    
    // Step 3 = ~43%
    expect(Math.round((3 / totalSteps) * 100)).toBe(43);
    
    // Step 7 = 100%
    expect(Math.round((7 / totalSteps) * 100)).toBe(100);
  });

  it("should determine member status based on formation step", () => {
    const getStatus = (step: number, houseActivatedAt: Date | null) => {
      if (houseActivatedAt) return "house_activated";
      if (step >= 5) return "formation_in_progress";
      if (step >= 2) return "academy_active";
      return "onboarding";
    };

    expect(getStatus(0, null)).toBe("onboarding");
    expect(getStatus(1, null)).toBe("onboarding");
    expect(getStatus(2, null)).toBe("academy_active");
    expect(getStatus(3, null)).toBe("academy_active");
    expect(getStatus(5, null)).toBe("formation_in_progress");
    expect(getStatus(7, null)).toBe("formation_in_progress");
    expect(getStatus(7, new Date())).toBe("house_activated");
  });

  it("should identify admin users correctly", () => {
    const isAdmin = (role: string) => ["admin", "owner", "staff"].includes(role);
    
    expect(isAdmin("admin")).toBe(true);
    expect(isAdmin("owner")).toBe(true);
    expect(isAdmin("staff")).toBe(true);
    expect(isAdmin("user")).toBe(false);
  });

  describe("Category Locking Logic", () => {
    const ALWAYS_ACTIVE_CATEGORIES = [
      "L.A.W.S. Academy",
      "My Account",
      "Communication",
      "Theater & IPTV",
      "Broadcast Radio",
      "My Library",
      "Streaming Hub",
      "Emergency & Response",
      "Mobile & Devices",
    ];

    const REQUIRES_HOUSE_ACTIVATION = [
      "Trust",
      "Real-Eye-Nation",
      "The L.A.W.S. Collective",
      "Documents",
      "AI & Automation",
      "Analytics & Insights",
      "Compliance & Export",
      "Grants & Funding",
      "Platform Admin",
    ];

    const isCategoryLocked = (
      categoryLabel: string,
      houseActivated: boolean,
      isAdmin: boolean
    ): boolean => {
      if (isAdmin) return false;
      if (houseActivated) return false;
      if (ALWAYS_ACTIVE_CATEGORIES.includes(categoryLabel)) return false;
      return REQUIRES_HOUSE_ACTIVATION.includes(categoryLabel);
    };

    it("should never lock categories for admin users", () => {
      expect(isCategoryLocked("Trust", false, true)).toBe(false);
      expect(isCategoryLocked("The L.A.W.S. Collective", false, true)).toBe(false);
      expect(isCategoryLocked("Real-Eye-Nation", false, true)).toBe(false);
    });

    it("should never lock always-active categories for regular users", () => {
      expect(isCategoryLocked("L.A.W.S. Academy", false, false)).toBe(false);
      expect(isCategoryLocked("My Account", false, false)).toBe(false);
      expect(isCategoryLocked("Theater & IPTV", false, false)).toBe(false);
      expect(isCategoryLocked("Broadcast Radio", false, false)).toBe(false);
      expect(isCategoryLocked("Emergency & Response", false, false)).toBe(false);
    });

    it("should lock operational categories for regular users without House activation", () => {
      expect(isCategoryLocked("Trust", false, false)).toBe(true);
      expect(isCategoryLocked("Real-Eye-Nation", false, false)).toBe(true);
      expect(isCategoryLocked("The L.A.W.S. Collective", false, false)).toBe(true);
      expect(isCategoryLocked("Documents", false, false)).toBe(true);
      expect(isCategoryLocked("AI & Automation", false, false)).toBe(true);
      expect(isCategoryLocked("Grants & Funding", false, false)).toBe(true);
    });

    it("should unlock all categories after House activation", () => {
      expect(isCategoryLocked("Trust", true, false)).toBe(false);
      expect(isCategoryLocked("Real-Eye-Nation", true, false)).toBe(false);
      expect(isCategoryLocked("The L.A.W.S. Collective", true, false)).toBe(false);
      expect(isCategoryLocked("Documents", true, false)).toBe(false);
    });
  });
});
