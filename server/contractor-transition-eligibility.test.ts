import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("contractorTransition.getEligibilityTimeline", () => {
  it("returns timeline array and summary stats", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contractorTransition.getEligibilityTimeline();

    // Verify structure
    expect(result).toHaveProperty("timeline");
    expect(result).toHaveProperty("summary");
    expect(Array.isArray(result.timeline)).toBe(true);

    // Verify summary shape
    expect(result.summary).toHaveProperty("totalEmployees");
    expect(result.summary).toHaveProperty("eligibleNow");
    expect(result.summary).toHaveProperty("approachingEligibility");
    expect(result.summary).toHaveProperty("foundingMembers");
    expect(result.summary).toHaveProperty("coordinators");
    expect(result.summary).toHaveProperty("alreadyInTransition");
    expect(result.summary).toHaveProperty("completedTransitions");

    // Verify all summary values are numbers
    expect(typeof result.summary.totalEmployees).toBe("number");
    expect(typeof result.summary.eligibleNow).toBe("number");
    expect(typeof result.summary.approachingEligibility).toBe("number");

    // If there are timeline entries, verify their shape
    if (result.timeline.length > 0) {
      const entry = result.timeline[0];
      expect(entry).toHaveProperty("employeeId");
      expect(entry).toHaveProperty("name");
      expect(entry).toHaveProperty("transitionType");
      expect(entry).toHaveProperty("daysUntilEligible");
      expect(entry).toHaveProperty("isEligible");
      expect(entry).toHaveProperty("isApproaching");
      expect(entry).toHaveProperty("boardMemberEligible");
      expect(entry).toHaveProperty("alreadyTransitioning");
      expect(["founding_member", "coordinator", "standard"]).toContain(entry.transitionType);
    }
  });

  it("returns timeline sorted by daysUntilEligible ascending", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contractorTransition.getEligibilityTimeline();

    // Verify sorting
    for (let i = 1; i < result.timeline.length; i++) {
      expect(result.timeline[i].daysUntilEligible).toBeGreaterThanOrEqual(
        result.timeline[i - 1].daysUntilEligible
      );
    }
  });
});

describe("contractorTransition.getFoundingMemberTransitions", () => {
  it("returns founding members array and summary", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contractorTransition.getFoundingMemberTransitions();

    // Verify structure
    expect(result).toHaveProperty("foundingMembers");
    expect(result).toHaveProperty("summary");
    expect(Array.isArray(result.foundingMembers)).toBe(true);

    // Verify summary shape
    expect(result.summary).toHaveProperty("total");
    expect(result.summary).toHaveProperty("eligibleForTransition");
    expect(result.summary).toHaveProperty("contractorPathStarted");
    expect(result.summary).toHaveProperty("contractorPathComplete");
    expect(result.summary).toHaveProperty("boardSeatsAssigned");
    expect(result.summary).toHaveProperty("profitShareActive");

    // Verify all summary values are numbers
    expect(typeof result.summary.total).toBe("number");
    expect(typeof result.summary.eligibleForTransition).toBe("number");

    // If there are founding members, verify their shape
    if (result.foundingMembers.length > 0) {
      const fm = result.foundingMembers[0];
      expect(fm).toHaveProperty("id");
      expect(fm).toHaveProperty("name");
      expect(fm).toHaveProperty("foundingRole");
      expect(fm).toHaveProperty("isEligible");
      expect(fm).toHaveProperty("contractorPathComplete");
      expect(fm).toHaveProperty("boardSeatAssigned");
      expect(fm).toHaveProperty("profitShareActive");
    }
  });
});
