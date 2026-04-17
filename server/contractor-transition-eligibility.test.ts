import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

const mockUser = {
  id: 1,
  openId: "test-admin",
  email: "admin@lawscollective.org",
  name: "Test Admin",
  loginMethod: "manus" as const,
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const createCaller = () => {
  return appRouter.createCaller({ user: mockUser });
};

describe("contractorTransition.getEligibilityTimeline", () => {
  it("returns timeline array and summary stats", async () => {
    const caller = createCaller();
    const result = await caller.contractorTransition.getEligibilityTimeline();
    expect(result).toHaveProperty("timeline");
    expect(result).toHaveProperty("summary");
    expect(Array.isArray(result.timeline)).toBe(true);
    expect(result.summary).toHaveProperty("totalEmployees");
    expect(result.summary).toHaveProperty("foundingMembers");
    expect(result.summary).toHaveProperty("coordinators");
    expect(typeof result.summary.totalEmployees).toBe("number");
  });

  it("timeline entries have required fields when data exists", async () => {
    const caller = createCaller();
    const result = await caller.contractorTransition.getEligibilityTimeline();
    if (result.timeline.length > 0) {
      const entry = result.timeline[0];
      expect(entry).toHaveProperty("employeeId");
      expect(entry).toHaveProperty("name");
      expect(entry).toHaveProperty("transitionType");
      expect(entry).toHaveProperty("daysUntilEligible");
      expect(["founding_member", "coordinator", "standard"]).toContain(entry.transitionType);
    }
  });
});

describe("contractorTransition.getFoundingMemberTransitions", () => {
  it("returns founding members array and summary", async () => {
    const caller = createCaller();
    const result = await caller.contractorTransition.getFoundingMemberTransitions();
    expect(result).toHaveProperty("foundingMembers");
    expect(result).toHaveProperty("summary");
    expect(Array.isArray(result.foundingMembers)).toBe(true);
    expect(result.summary).toHaveProperty("total");
    expect(result.summary).toHaveProperty("boardSeatsAssigned");
  });

  it("founding member entries have required fields when data exists", async () => {
    const caller = createCaller();
    const result = await caller.contractorTransition.getFoundingMemberTransitions();
    if (result.foundingMembers.length > 0) {
      const member = result.foundingMembers[0];
      expect(member).toHaveProperty("name");
      expect(member).toHaveProperty("foundingRole");
      expect(member).toHaveProperty("boardSeatAssigned");
      expect(typeof member.boardSeatAssigned).toBe("boolean");
    }
  });
});
