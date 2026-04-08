import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 99999): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
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

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
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

describe("systemActivation", () => {
  describe("getProgress", () => {
    it("returns initial progress for a new user", async () => {
      const { ctx } = createAuthContext(88801);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.systemActivation.getProgress();

      expect(result).toHaveProperty("completedCount");
      expect(result).toHaveProperty("totalRequired");
      expect(result).toHaveProperty("simulators");
      expect(result).toHaveProperty("readyForActivation");
      expect(result).toHaveProperty("isActivated");
      expect(result.totalRequired).toBe(6);
      expect(Array.isArray(result.simulators)).toBe(true);
      expect(result.simulators.length).toBe(6);
    });

    it("returns correct simulator types", async () => {
      const { ctx } = createAuthContext(88802);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.systemActivation.getProgress();

      const types = result.simulators.map((s) => s.type);
      expect(types).toContain("business");
      expect(types).toContain("grants");
      expect(types).toContain("proposals");
      expect(types).toContain("contracts");
      expect(types).toContain("real_eye_nation");
      expect(types).toContain("other");
    });
  });

  describe("getProgressPublic", () => {
    it("returns empty progress when no userId provided", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.systemActivation.getProgressPublic();

      expect(result.completedCount).toBe(0);
      expect(result.totalRequired).toBe(6);
      expect(result.readyForActivation).toBe(false);
      expect(result.isActivated).toBe(false);
    });
  });

  describe("recordCompletion", () => {
    it("records a simulator completion successfully", async () => {
      const { ctx } = createAuthContext(88803);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.systemActivation.recordCompletion({
        simulatorType: "business",
        score: 85,
      });

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
      // When it's a new completion (not alreadyCompleted), totalRequired is returned
      if (!result.alreadyCompleted) {
        expect(result.totalRequired).toBe(6);
      }
    });

    it("returns alreadyCompleted for duplicate completion", async () => {
      const { ctx } = createAuthContext(88804);
      const caller = appRouter.createCaller(ctx);

      // First completion
      await caller.systemActivation.recordCompletion({
        simulatorType: "grants",
        score: 90,
      });

      // Second completion of same type
      const result = await caller.systemActivation.recordCompletion({
        simulatorType: "grants",
        score: 95,
      });

      expect(result.success).toBe(true);
      expect(result.alreadyCompleted).toBe(true);
    });
  });

  describe("getBuildStatus", () => {
    it("returns no build for new user", async () => {
      const { ctx } = createAuthContext(88805);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.systemActivation.getBuildStatus();

      expect(result.hasBuild).toBe(false);
      expect(result.build).toBeNull();
      expect(result.linkage).toBeNull();
    });
  });

  describe("activateBuild", () => {
    it("rejects activation when not all simulators completed", async () => {
      const { ctx } = createAuthContext(88806);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.systemActivation.activateBuild({
        businessName: "Test Business",
        businessType: "llc",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Not all workshops completed");
    });
  });

  describe("getAllBuilds", () => {
    it("returns an array of builds", async () => {
      const { ctx } = createAuthContext(88807);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.systemActivation.getAllBuilds();

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
