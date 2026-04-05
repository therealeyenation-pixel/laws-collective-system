/**
 * Token Registry Tests
 * Tests for Mirror Tokens, Spark Tokens, succession protocol, and amendments
 */

import { describe, it, expect } from "vitest";
import {
  TOKEN_TYPES,
  MIRROR_TOKEN_LOCK_WEEKS,
  MIRROR_TOKEN_LOCK_MS,
  SUCCESSION_INTERIM_DAYS,
  SUCCESSION_CONFIRMATIONS_REQUIRED,
  AMENDMENT_MAJORITY_PERCENT,
  isMirrorTokenLocked,
  calculateMirrorTokenLockEnd,
  getRemainingLockWeeks,
  createMirrorTokenData,
  createSparkOfKnowingData,
  createHouseActivationData,
  calculateInterimEndDate,
  hasEnoughConfirmations,
  isSuccessionRejected,
  createSuccessionRecordData,
  addSuccessionConfirmation,
  calculateAmendmentResults,
  createAmendmentData,
  addAmendmentVote,
  finalizeAmendment,
  getTokenRegistrySummary
} from "./services/token-registry";

describe("Token Registry Service", () => {
  describe("Constants", () => {
    it("should have correct token types", () => {
      expect(TOKEN_TYPES.MIRROR).toBe("mirror");
      expect(TOKEN_TYPES.SPARK_OF_KNOWING).toBe("spark_of_knowing");
      expect(TOKEN_TYPES.HOUSE_ACTIVATION).toBe("house_activation");
      expect(TOKEN_TYPES.GIFT).toBe("gift");
      expect(TOKEN_TYPES.CROWN).toBe("crown");
    });

    it("should have 39-week lock period for Mirror Tokens", () => {
      expect(MIRROR_TOKEN_LOCK_WEEKS).toBe(39);
      expect(MIRROR_TOKEN_LOCK_MS).toBe(39 * 7 * 24 * 60 * 60 * 1000);
    });

    it("should have 40-day interim for succession", () => {
      expect(SUCCESSION_INTERIM_DAYS).toBe(40);
    });

    it("should require 3 confirmations for succession", () => {
      expect(SUCCESSION_CONFIRMATIONS_REQUIRED).toBe(3);
    });

    it("should require 60% majority for amendments", () => {
      expect(AMENDMENT_MAJORITY_PERCENT).toBe(60);
    });
  });

  describe("Mirror Token Functions", () => {
    it("should correctly identify locked tokens", () => {
      const futureDate = new Date(Date.now() + 1000000);
      const pastDate = new Date(Date.now() - 1000000);
      
      expect(isMirrorTokenLocked(futureDate)).toBe(true);
      expect(isMirrorTokenLocked(pastDate)).toBe(false);
    });

    it("should calculate lock end date correctly", () => {
      const now = new Date();
      const lockEnd = calculateMirrorTokenLockEnd(now);
      const expectedEnd = new Date(now.getTime() + MIRROR_TOKEN_LOCK_MS);
      
      expect(lockEnd.getTime()).toBe(expectedEnd.getTime());
    });

    it("should calculate remaining lock weeks", () => {
      const now = new Date();
      const lockEnd = new Date(now.getTime() + (10 * 7 * 24 * 60 * 60 * 1000)); // 10 weeks
      
      expect(getRemainingLockWeeks(lockEnd)).toBe(10);
    });

    it("should return 0 for expired locks", () => {
      const pastDate = new Date(Date.now() - 1000000);
      expect(getRemainingLockWeeks(pastDate)).toBe(0);
    });

    it("should create Mirror Token data correctly", () => {
      const tokenData = createMirrorTokenData(1, 2, 100, 3);
      
      expect(tokenData.houseId).toBe(1);
      expect(tokenData.holderId).toBe(2);
      expect(tokenData.amount).toBe(100);
      expect(tokenData.transferredFrom).toBe(3);
      expect(tokenData.isLocked).toBe(true);
      expect(tokenData.lockedUntil).toBeInstanceOf(Date);
    });
  });

  describe("Spark Token Functions", () => {
    it("should create Spark of Knowing data", () => {
      const data = createSparkOfKnowingData(1, 2, "Achievement unlocked");
      
      expect(data.type).toBe("spark_of_knowing");
      expect(data.recipientId).toBe(1);
      expect(data.grantedBy).toBe(2);
      expect(data.reason).toBe("Achievement unlocked");
      expect(data.isActive).toBe(true);
    });

    it("should create House Activation data", () => {
      const data = createHouseActivationData(1, 5, 2, "House ready");
      
      expect(data.type).toBe("house_activation");
      expect(data.recipientId).toBe(1);
      expect(data.houseId).toBe(5);
      expect(data.grantedBy).toBe(2);
      expect(data.isActive).toBe(false); // Requires activation
    });
  });

  describe("Succession Protocol Functions", () => {
    it("should calculate interim end date correctly", () => {
      const now = new Date();
      const endDate = calculateInterimEndDate(now);
      const expected = new Date(now);
      expected.setDate(expected.getDate() + SUCCESSION_INTERIM_DAYS);
      
      expect(endDate.getDate()).toBe(expected.getDate());
    });

    it("should check confirmations correctly", () => {
      const confirmations = [
        { confirmerId: 1, confirmerName: "A", confirmerRole: "admin", confirmedAt: new Date(), vote: "approve" as const },
        { confirmerId: 2, confirmerName: "B", confirmerRole: "admin", confirmedAt: new Date(), vote: "approve" as const },
        { confirmerId: 3, confirmerName: "C", confirmerRole: "admin", confirmedAt: new Date(), vote: "approve" as const }
      ];
      
      expect(hasEnoughConfirmations(confirmations)).toBe(true);
    });

    it("should detect insufficient confirmations", () => {
      const confirmations = [
        { confirmerId: 1, confirmerName: "A", confirmerRole: "admin", confirmedAt: new Date(), vote: "approve" as const },
        { confirmerId: 2, confirmerName: "B", confirmerRole: "admin", confirmedAt: new Date(), vote: "approve" as const }
      ];
      
      expect(hasEnoughConfirmations(confirmations)).toBe(false);
    });

    it("should detect rejection", () => {
      const confirmations = [
        { confirmerId: 1, confirmerName: "A", confirmerRole: "admin", confirmedAt: new Date(), vote: "reject" as const },
        { confirmerId: 2, confirmerName: "B", confirmerRole: "admin", confirmedAt: new Date(), vote: "reject" as const },
        { confirmerId: 3, confirmerName: "C", confirmerRole: "admin", confirmedAt: new Date(), vote: "reject" as const }
      ];
      
      expect(isSuccessionRejected(confirmations)).toBe(true);
    });

    it("should create succession record data", () => {
      const data = createSuccessionRecordData(1, 2, 3);
      
      expect(data.houseId).toBe(1);
      expect(data.previousHolderId).toBe(2);
      expect(data.newHolderId).toBe(3);
      expect(data.status).toBe("pending");
      expect(data.confirmations).toEqual([]);
    });

    it("should add confirmation and update status", () => {
      const record = createSuccessionRecordData(1, 2, 3) as any;
      record.id = 1;
      
      let updated = addSuccessionConfirmation(record, 10, "Admin1", "admin", "approve");
      expect(updated.confirmations.length).toBe(1);
      expect(updated.status).toBe("pending");
      
      updated = addSuccessionConfirmation(updated, 11, "Admin2", "admin", "approve");
      updated = addSuccessionConfirmation(updated, 12, "Admin3", "admin", "approve");
      
      expect(updated.status).toBe("confirmed");
    });
  });

  describe("Amendment Functions", () => {
    it("should calculate amendment results correctly", () => {
      const votes = [
        { voterId: 1, voterName: "A", vote: "approve" as const, votedAt: new Date() },
        { voterId: 2, voterName: "B", vote: "approve" as const, votedAt: new Date() },
        { voterId: 3, voterName: "C", vote: "approve" as const, votedAt: new Date() },
        { voterId: 4, voterName: "D", vote: "reject" as const, votedAt: new Date() },
        { voterId: 5, voterName: "E", vote: "abstain" as const, votedAt: new Date() }
      ];
      
      const results = calculateAmendmentResults(votes);
      
      expect(results.approveCount).toBe(3);
      expect(results.rejectCount).toBe(1);
      expect(results.abstainCount).toBe(1);
      expect(results.totalVotes).toBe(4); // Abstains don't count
      expect(results.approvePercent).toBe(75);
      expect(results.passed).toBe(true);
    });

    it("should detect failed amendments", () => {
      const votes = [
        { voterId: 1, voterName: "A", vote: "approve" as const, votedAt: new Date() },
        { voterId: 2, voterName: "B", vote: "reject" as const, votedAt: new Date() },
        { voterId: 3, voterName: "C", vote: "reject" as const, votedAt: new Date() }
      ];
      
      const results = calculateAmendmentResults(votes);
      
      expect(results.approvePercent).toBe(33);
      expect(results.passed).toBe(false);
    });

    it("should create amendment data", () => {
      const data = createAmendmentData("Test Amendment", "Description", 1, 14);
      
      expect(data.title).toBe("Test Amendment");
      expect(data.description).toBe("Description");
      expect(data.proposedBy).toBe(1);
      expect(data.status).toBe("voting");
      expect(data.requiredMajority).toBe(60);
      expect(data.votes).toEqual([]);
    });

    it("should add votes to amendment", () => {
      const amendment = createAmendmentData("Test", "Desc", 1) as any;
      amendment.id = 1;
      
      const updated = addAmendmentVote(amendment, 2, "Voter", "approve", "Good idea");
      
      expect(updated.votes.length).toBe(1);
      expect(updated.votes[0].vote).toBe("approve");
    });

    it("should prevent duplicate votes", () => {
      const amendment = createAmendmentData("Test", "Desc", 1) as any;
      amendment.id = 1;
      
      const updated = addAmendmentVote(amendment, 2, "Voter", "approve");
      
      expect(() => addAmendmentVote(updated, 2, "Voter", "reject")).toThrow("Already voted");
    });

    it("should finalize amendment correctly", () => {
      const amendment = createAmendmentData("Test", "Desc", 1, 0) as any;
      amendment.id = 1;
      amendment.votingEndsAt = new Date(Date.now() - 1000); // Past
      amendment.votes = [
        { voterId: 1, voterName: "A", vote: "approve", votedAt: new Date() },
        { voterId: 2, voterName: "B", vote: "approve", votedAt: new Date() },
        { voterId: 3, voterName: "C", vote: "reject", votedAt: new Date() }
      ];
      
      const finalized = finalizeAmendment(amendment);
      
      expect(finalized.status).toBe("passed");
    });

    it("should prevent early finalization", () => {
      const amendment = createAmendmentData("Test", "Desc", 1, 14) as any;
      amendment.id = 1;
      
      expect(() => finalizeAmendment(amendment)).toThrow("Voting period has not ended");
    });
  });

  describe("Registry Summary", () => {
    it("should return correct summary", () => {
      const summary = getTokenRegistrySummary();
      
      expect(summary.tokenTypes).toContain("mirror");
      expect(summary.tokenTypes).toContain("spark_of_knowing");
      expect(summary.mirrorTokenLockWeeks).toBe(39);
      expect(summary.successionInterimDays).toBe(40);
      expect(summary.successionConfirmationsRequired).toBe(3);
      expect(summary.amendmentMajorityPercent).toBe(60);
    });
  });
});
