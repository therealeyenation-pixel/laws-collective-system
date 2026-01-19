import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(user?: AuthenticatedUser | null): TrpcContext {
  return {
    user: user ?? null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Scholarships Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStats", () => {
    it("should return zero stats when database is not available", async () => {
      vi.mocked(getDb).mockResolvedValue(null);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const stats = await caller.scholarships.getStats();

      expect(stats).toEqual({
        foundingMembers: 0,
        heirBeneficiaries: 0,
        activePrograms: 0,
        totalApplications: 0,
        approvedApplications: 0,
        totalFundBalance: 0,
        totalAwarded: 0,
      });
    });

    it("should return stats from database", async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockResolvedValue([
          { id: 1, status: "active" },
          { id: 2, status: "active" },
        ]),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const stats = await caller.scholarships.getStats();

      expect(stats.foundingMembers).toBe(2);
    });
  });

  describe("getFoundingMembers", () => {
    it("should return empty array when database is not available", async () => {
      vi.mocked(getDb).mockResolvedValue(null);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const members = await caller.scholarships.getFoundingMembers();

      expect(members).toEqual([]);
    });

    it("should return founding members from database", async () => {
      const mockMembers = [
        { id: 1, fullName: "Calea Freeman", foundingRole: "primary_founder" },
        { id: 2, fullName: "Test Manager", foundingRole: "co_founder" },
      ];
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockMembers),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const members = await caller.scholarships.getFoundingMembers();

      expect(members).toEqual(mockMembers);
      expect(members.length).toBe(2);
    });
  });

  describe("getHeirBenefits", () => {
    it("should return empty array when database is not available", async () => {
      vi.mocked(getDb).mockResolvedValue(null);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const benefits = await caller.scholarships.getHeirBenefits();

      expect(benefits).toEqual([]);
    });
  });

  describe("getPrograms", () => {
    it("should return empty array when database is not available", async () => {
      vi.mocked(getDb).mockResolvedValue(null);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const programs = await caller.scholarships.getPrograms();

      expect(programs).toEqual([]);
    });

    it("should return scholarship programs from database", async () => {
      const mockPrograms = [
        { id: 1, name: "Merit Scholarship", scholarshipType: "merit_based", status: "active" },
        { id: 2, name: "Need-Based Grant", scholarshipType: "need_based", status: "draft" },
      ];
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockPrograms),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const programs = await caller.scholarships.getPrograms();

      expect(programs).toEqual(mockPrograms);
    });
  });

  describe("getActivePrograms", () => {
    it("should return empty array when database is not available", async () => {
      vi.mocked(getDb).mockResolvedValue(null);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const programs = await caller.scholarships.getActivePrograms();

      expect(programs).toEqual([]);
    });
  });

  describe("getFunds", () => {
    it("should return empty array when database is not available", async () => {
      vi.mocked(getDb).mockResolvedValue(null);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const funds = await caller.scholarships.getFunds();

      expect(funds).toEqual([]);
    });

    it("should return scholarship funds from database", async () => {
      const mockFunds = [
        { id: 1, name: "General Scholarship Fund", fundType: "general", principalBalance: "10000.00" },
        { id: 2, name: "Memorial Fund", fundType: "memorial", principalBalance: "5000.00" },
      ];
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockFunds),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const funds = await caller.scholarships.getFunds();

      expect(funds).toEqual(mockFunds);
    });
  });

  describe("checkHeirEligibility", () => {
    it("should return not eligible when database is not available", async () => {
      vi.mocked(getDb).mockResolvedValue(null);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.scholarships.checkHeirEligibility({ houseId: "HOUSE-001" });

      expect(result.eligible).toBe(false);
      expect(result.reason).toBe("Database not available");
    });

    it("should return eligible when heir benefit exists", async () => {
      const mockBenefit = {
        id: 1,
        heirHouseId: "HOUSE-001-A",
        benefitType: "full_tuition",
        coveragePercentage: 100,
        status: "eligible",
      };
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockBenefit]),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.scholarships.checkHeirEligibility({ houseId: "HOUSE-001-A" });

      expect(result.eligible).toBe(true);
      expect(result.benefitType).toBe("full_tuition");
      expect(result.coveragePercentage).toBe(100);
    });
  });
});

describe("Specialist Tracks Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStats", () => {
    it("should return zero stats when database is not available", async () => {
      vi.mocked(getDb).mockResolvedValue(null);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const stats = await caller.specialistTracks.getStats();

      expect(stats).toEqual({
        totalTracks: 0,
        activeTracks: 0,
        pendingEligibility: 0,
        graduated: 0,
        acceleratedTracks: 0,
        averageMaturityScore: 0,
        byLevel: {
          specialist_i: 0,
          specialist_ii: 0,
          specialist_iii: 0,
          associate: 0,
        },
      });
    });
  });

  describe("getAllTracks", () => {
    it("should return empty array when database is not available", async () => {
      vi.mocked(getDb).mockResolvedValue(null);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const tracks = await caller.specialistTracks.getAllTracks();

      expect(tracks).toEqual([]);
    });

    it("should return tracks from database", async () => {
      const mockTracks = [
        { id: 1, fullName: "John Doe", currentLevel: "specialist_i", status: "active" },
        { id: 2, fullName: "Jane Smith", currentLevel: "specialist_ii", status: "active" },
      ];
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockTracks),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const tracks = await caller.specialistTracks.getAllTracks();

      expect(tracks).toEqual(mockTracks);
    });
  });

  describe("getTrackById", () => {
    it("should return null when database is not available", async () => {
      vi.mocked(getDb).mockResolvedValue(null);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const track = await caller.specialistTracks.getTrackById({ id: 1 });

      expect(track).toBeNull();
    });

    it("should return track when found", async () => {
      const mockTrack = { id: 1, fullName: "John Doe", currentLevel: "specialist_i" };
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockTrack]),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const track = await caller.specialistTracks.getTrackById({ id: 1 });

      expect(track).toEqual(mockTrack);
    });
  });

  describe("getAssessments", () => {
    it("should return empty array when database is not available", async () => {
      vi.mocked(getDb).mockResolvedValue(null);

      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const assessments = await caller.specialistTracks.getAssessments({ trackId: 1 });

      expect(assessments).toEqual([]);
    });
  });
});
