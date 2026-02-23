/**
 * Token Registry Router
 * Handles Mirror Tokens, Spark Tokens, succession protocol, and amendments
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import {
  TOKEN_TYPES,
  MIRROR_TOKEN_LOCK_WEEKS,
  SUCCESSION_INTERIM_DAYS,
  SUCCESSION_CONFIRMATIONS_REQUIRED,
  AMENDMENT_MAJORITY_PERCENT,
  createMirrorTokenData,
  createSparkOfKnowingData,
  createHouseActivationData,
  createSuccessionRecordData,
  createAmendmentData,
  calculateMirrorTokenLockEnd,
  getRemainingLockWeeks,
  isMirrorTokenLocked,
  hasEnoughConfirmations,
  calculateAmendmentResults,
  getTokenRegistrySummary
} from "../services/token-registry";

export const tokenRegistryRouter = router({
  // Get registry summary
  getSummary: protectedProcedure.query(async () => {
    return getTokenRegistrySummary();
  }),

  // === MIRROR TOKENS ===

  // Issue Mirror Token
  issueMirrorToken: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      holderId: z.number(),
      amount: z.number().min(1),
      transferredFrom: z.number().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const tokenData = createMirrorTokenData(
        input.houseId,
        input.holderId,
        input.amount,
        input.transferredFrom
      );

      const result = await db.execute({
        sql: `INSERT INTO mirror_tokens (house_id, holder_id, amount, locked_until, is_locked, created_at, transferred_from)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          tokenData.houseId,
          tokenData.holderId,
          tokenData.amount,
          tokenData.lockedUntil.toISOString(),
          tokenData.isLocked ? 1 : 0,
          tokenData.createdAt.toISOString(),
          tokenData.transferredFrom || null
        ]
      });

      // Record to blockchain
      await db.execute({
        sql: `INSERT INTO blockchain_records (block_number, hash, data, record_type, entity_id, created_at)
              VALUES ((SELECT COALESCE(MAX(block_number), 0) + 1 FROM blockchain_records br2),
                      ?, ?, 'mirror_token', ?, NOW())`,
        args: [
          `0x${Buffer.from(JSON.stringify({ type: 'MIRROR_TOKEN_ISSUED', ...tokenData })).toString('hex').slice(0, 64)}`,
          JSON.stringify({ type: 'MIRROR_TOKEN_ISSUED', ...tokenData }),
          input.holderId
        ]
      });

      return {
        success: true,
        tokenId: result.insertId,
        lockedUntil: tokenData.lockedUntil,
        lockWeeks: MIRROR_TOKEN_LOCK_WEEKS
      };
    }),

  // Get Mirror Tokens for house
  getMirrorTokens: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ input }) => {
      const results = await db.execute({
        sql: `SELECT mt.*, u.name as holder_name
              FROM mirror_tokens mt
              LEFT JOIN users u ON mt.holder_id = u.id
              WHERE mt.house_id = ?
              ORDER BY mt.created_at DESC`,
        args: [input.houseId]
      });

      return results.rows.map((row: any) => ({
        id: row.id,
        houseId: row.house_id,
        holderId: row.holder_id,
        holderName: row.holder_name,
        amount: row.amount,
        lockedUntil: new Date(row.locked_until),
        isLocked: isMirrorTokenLocked(new Date(row.locked_until)),
        remainingLockWeeks: getRemainingLockWeeks(new Date(row.locked_until)),
        createdAt: row.created_at,
        transferredFrom: row.transferred_from
      }));
    }),

  // Check Mirror Token lock status
  checkMirrorTokenLock: protectedProcedure
    .input(z.object({ tokenId: z.number() }))
    .query(async ({ input }) => {
      const result = await db.execute({
        sql: `SELECT locked_until FROM mirror_tokens WHERE id = ?`,
        args: [input.tokenId]
      });

      if (result.rows.length === 0) {
        return { exists: false };
      }

      const lockedUntil = new Date((result.rows[0] as any).locked_until);
      return {
        exists: true,
        isLocked: isMirrorTokenLocked(lockedUntil),
        lockedUntil,
        remainingWeeks: getRemainingLockWeeks(lockedUntil)
      };
    }),

  // === SPARK TOKENS ===

  // Issue Spark of Knowing
  issueSparkOfKnowing: protectedProcedure
    .input(z.object({
      recipientId: z.number(),
      reason: z.string().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      const tokenData = createSparkOfKnowingData(
        input.recipientId,
        ctx.user.id,
        input.reason
      );

      const result = await db.execute({
        sql: `INSERT INTO spark_tokens (type, recipient_id, granted_by, reason, created_at, is_active)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          tokenData.type,
          tokenData.recipientId,
          tokenData.grantedBy,
          tokenData.reason,
          tokenData.createdAt.toISOString(),
          tokenData.isActive ? 1 : 0
        ]
      });

      return {
        success: true,
        tokenId: result.insertId,
        type: "spark_of_knowing"
      };
    }),

  // Issue House Activation Token
  issueHouseActivation: protectedProcedure
    .input(z.object({
      recipientId: z.number(),
      houseId: z.number(),
      reason: z.string().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      const tokenData = createHouseActivationData(
        input.recipientId,
        input.houseId,
        ctx.user.id,
        input.reason
      );

      const result = await db.execute({
        sql: `INSERT INTO spark_tokens (type, recipient_id, house_id, granted_by, reason, created_at, is_active)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          tokenData.type,
          tokenData.recipientId,
          tokenData.houseId,
          tokenData.grantedBy,
          tokenData.reason,
          tokenData.createdAt.toISOString(),
          tokenData.isActive ? 1 : 0
        ]
      });

      return {
        success: true,
        tokenId: result.insertId,
        type: "house_activation"
      };
    }),

  // Activate House Activation Token
  activateHouseToken: protectedProcedure
    .input(z.object({ tokenId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.execute({
        sql: `UPDATE spark_tokens SET is_active = 1, activated_at = NOW()
              WHERE id = ? AND recipient_id = ? AND type = 'house_activation' AND is_active = 0`,
        args: [input.tokenId, ctx.user.id]
      });

      if (result.rowsAffected === 0) {
        throw new Error("Token not found or already activated");
      }

      return { success: true, message: "House activation token activated" };
    }),

  // Get user's Spark Tokens
  getSparkTokens: protectedProcedure.query(async ({ ctx }) => {
    const results = await db.execute({
      sql: `SELECT st.*, u.name as granter_name
            FROM spark_tokens st
            LEFT JOIN users u ON st.granted_by = u.id
            WHERE st.recipient_id = ?
            ORDER BY st.created_at DESC`,
      args: [ctx.user.id]
    });

    return results.rows.map((row: any) => ({
      id: row.id,
      type: row.type,
      houseId: row.house_id,
      grantedBy: row.granted_by,
      granterName: row.granter_name,
      reason: row.reason,
      createdAt: row.created_at,
      activatedAt: row.activated_at,
      isActive: row.is_active === 1
    }));
  }),

  // === SUCCESSION PROTOCOL ===

  // Initiate succession
  initiateSuccession: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      newHolderId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const recordData = createSuccessionRecordData(
        input.houseId,
        ctx.user.id,
        input.newHolderId
      );

      const result = await db.execute({
        sql: `INSERT INTO succession_records (house_id, previous_holder_id, new_holder_id, 
              interim_start_date, interim_end_date, status, created_at)
              VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        args: [
          recordData.houseId,
          recordData.previousHolderId,
          recordData.newHolderId,
          recordData.interimStartDate.toISOString(),
          recordData.interimEndDate.toISOString(),
          recordData.status
        ]
      });

      return {
        success: true,
        successionId: result.insertId,
        interimEndDate: recordData.interimEndDate,
        interimDays: SUCCESSION_INTERIM_DAYS,
        confirmationsRequired: SUCCESSION_CONFIRMATIONS_REQUIRED
      };
    }),

  // Add succession confirmation
  confirmSuccession: protectedProcedure
    .input(z.object({
      successionId: z.number(),
      vote: z.enum(["approve", "reject"]),
      reason: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if already confirmed by this user
      const existingCheck = await db.execute({
        sql: `SELECT id FROM succession_confirmations WHERE succession_id = ? AND confirmer_id = ?`,
        args: [input.successionId, ctx.user.id]
      });

      if (existingCheck.rows.length > 0) {
        throw new Error("You have already voted on this succession");
      }

      // Add confirmation
      await db.execute({
        sql: `INSERT INTO succession_confirmations (succession_id, confirmer_id, confirmer_name, vote, reason, confirmed_at)
              VALUES (?, ?, ?, ?, ?, NOW())`,
        args: [input.successionId, ctx.user.id, ctx.user.name, input.vote, input.reason || null]
      });

      // Check total confirmations
      const confirmations = await db.execute({
        sql: `SELECT vote FROM succession_confirmations WHERE succession_id = ?`,
        args: [input.successionId]
      });

      const approvals = confirmations.rows.filter((r: any) => r.vote === "approve").length;
      const rejections = confirmations.rows.filter((r: any) => r.vote === "reject").length;

      let newStatus = "pending";
      if (approvals >= SUCCESSION_CONFIRMATIONS_REQUIRED) {
        newStatus = "confirmed";
      } else if (rejections >= SUCCESSION_CONFIRMATIONS_REQUIRED) {
        newStatus = "rejected";
      }

      if (newStatus !== "pending") {
        await db.execute({
          sql: `UPDATE succession_records SET status = ?, completed_at = NOW() WHERE id = ?`,
          args: [newStatus, input.successionId]
        });
      }

      return {
        success: true,
        currentApprovals: approvals,
        currentRejections: rejections,
        status: newStatus,
        confirmationsRequired: SUCCESSION_CONFIRMATIONS_REQUIRED
      };
    }),

  // Get succession records for house
  getSuccessionRecords: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ input }) => {
      const results = await db.execute({
        sql: `SELECT sr.*, 
              prev.name as previous_holder_name,
              new.name as new_holder_name
              FROM succession_records sr
              LEFT JOIN users prev ON sr.previous_holder_id = prev.id
              LEFT JOIN users new ON sr.new_holder_id = new.id
              WHERE sr.house_id = ?
              ORDER BY sr.created_at DESC`,
        args: [input.houseId]
      });

      const records = [];
      for (const row of results.rows as any[]) {
        const confirmations = await db.execute({
          sql: `SELECT * FROM succession_confirmations WHERE succession_id = ?`,
          args: [row.id]
        });

        records.push({
          id: row.id,
          houseId: row.house_id,
          previousHolderId: row.previous_holder_id,
          previousHolderName: row.previous_holder_name,
          newHolderId: row.new_holder_id,
          newHolderName: row.new_holder_name,
          interimStartDate: row.interim_start_date,
          interimEndDate: row.interim_end_date,
          status: row.status,
          completedAt: row.completed_at,
          confirmations: confirmations.rows.map((c: any) => ({
            confirmerId: c.confirmer_id,
            confirmerName: c.confirmer_name,
            vote: c.vote,
            reason: c.reason,
            confirmedAt: c.confirmed_at
          }))
        });
      }

      return records;
    }),

  // === AMENDMENTS ===

  // Propose amendment
  proposeAmendment: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      votingDurationDays: z.number().min(7).max(30).default(14)
    }))
    .mutation(async ({ ctx, input }) => {
      const amendmentData = createAmendmentData(
        input.title,
        input.description,
        ctx.user.id,
        input.votingDurationDays
      );

      const result = await db.execute({
        sql: `INSERT INTO amendments (title, description, proposed_by, proposed_at, voting_ends_at, status, required_majority)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          amendmentData.title,
          amendmentData.description,
          amendmentData.proposedBy,
          amendmentData.proposedAt.toISOString(),
          amendmentData.votingEndsAt.toISOString(),
          amendmentData.status,
          amendmentData.requiredMajority
        ]
      });

      return {
        success: true,
        amendmentId: result.insertId,
        votingEndsAt: amendmentData.votingEndsAt,
        requiredMajority: AMENDMENT_MAJORITY_PERCENT
      };
    }),

  // Vote on amendment
  voteOnAmendment: protectedProcedure
    .input(z.object({
      amendmentId: z.number(),
      vote: z.enum(["approve", "reject", "abstain"]),
      reason: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if already voted
      const existingVote = await db.execute({
        sql: `SELECT id FROM amendment_votes WHERE amendment_id = ? AND voter_id = ?`,
        args: [input.amendmentId, ctx.user.id]
      });

      if (existingVote.rows.length > 0) {
        throw new Error("You have already voted on this amendment");
      }

      // Check if voting is still open
      const amendment = await db.execute({
        sql: `SELECT voting_ends_at, status FROM amendments WHERE id = ?`,
        args: [input.amendmentId]
      });

      if (amendment.rows.length === 0) {
        throw new Error("Amendment not found");
      }

      const amendmentRow = amendment.rows[0] as any;
      if (amendmentRow.status !== "voting") {
        throw new Error("Voting has ended for this amendment");
      }

      if (new Date() > new Date(amendmentRow.voting_ends_at)) {
        throw new Error("Voting period has expired");
      }

      // Add vote
      await db.execute({
        sql: `INSERT INTO amendment_votes (amendment_id, voter_id, voter_name, vote, reason, voted_at)
              VALUES (?, ?, ?, ?, ?, NOW())`,
        args: [input.amendmentId, ctx.user.id, ctx.user.name, input.vote, input.reason || null]
      });

      return { success: true, message: "Vote recorded" };
    }),

  // Get amendments
  getAmendments: protectedProcedure
    .input(z.object({
      status: z.enum(["voting", "passed", "rejected", "expired", "all"]).default("all")
    }))
    .query(async ({ input }) => {
      let sql = `SELECT a.*, u.name as proposer_name FROM amendments a
                 LEFT JOIN users u ON a.proposed_by = u.id`;
      const args: any[] = [];

      if (input.status !== "all") {
        sql += ` WHERE a.status = ?`;
        args.push(input.status);
      }

      sql += ` ORDER BY a.proposed_at DESC`;

      const results = await db.execute({ sql, args });

      const amendments = [];
      for (const row of results.rows as any[]) {
        const votes = await db.execute({
          sql: `SELECT * FROM amendment_votes WHERE amendment_id = ?`,
          args: [row.id]
        });

        const voteResults = calculateAmendmentResults(votes.rows as any[]);

        amendments.push({
          id: row.id,
          title: row.title,
          description: row.description,
          proposedBy: row.proposed_by,
          proposerName: row.proposer_name,
          proposedAt: row.proposed_at,
          votingEndsAt: row.voting_ends_at,
          status: row.status,
          requiredMajority: row.required_majority,
          votes: votes.rows.map((v: any) => ({
            voterId: v.voter_id,
            voterName: v.voter_name,
            vote: v.vote,
            reason: v.reason,
            votedAt: v.voted_at
          })),
          results: voteResults
        });
      }

      return amendments;
    }),

  // Finalize amendment (admin only)
  finalizeAmendment: protectedProcedure
    .input(z.object({ amendmentId: z.number() }))
    .mutation(async ({ input }) => {
      const amendment = await db.execute({
        sql: `SELECT * FROM amendments WHERE id = ?`,
        args: [input.amendmentId]
      });

      if (amendment.rows.length === 0) {
        throw new Error("Amendment not found");
      }

      const amendmentRow = amendment.rows[0] as any;
      if (new Date() < new Date(amendmentRow.voting_ends_at)) {
        throw new Error("Voting period has not ended");
      }

      const votes = await db.execute({
        sql: `SELECT vote FROM amendment_votes WHERE amendment_id = ?`,
        args: [input.amendmentId]
      });

      const results = calculateAmendmentResults(votes.rows as any[]);
      const newStatus = results.passed ? "passed" : "rejected";

      await db.execute({
        sql: `UPDATE amendments SET status = ? WHERE id = ?`,
        args: [newStatus, input.amendmentId]
      });

      return {
        success: true,
        status: newStatus,
        results
      };
    })
});
