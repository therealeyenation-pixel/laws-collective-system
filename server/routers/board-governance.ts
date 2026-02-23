import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";

// Helper to get database
async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database unavailable",
    });
  }
  return db;
}

export const boardGovernanceRouter = router({
  // ============================================================================
  // BOARD MEMBERS
  // ============================================================================

  // Get all board members
  getBoardMembers: protectedProcedure.query(async () => {
    const db = await requireDb();
    
    const [members] = await (db as any).execute(`
      SELECT bm.*, e.firstName, e.lastName, e.email, e.position as employeePosition
      FROM board_members bm
      LEFT JOIN employees e ON bm.employeeId = e.id
      WHERE bm.status = 'active'
      ORDER BY bm.ownershipPercentage DESC
    `);
    
    return members as any[];
  }),

  // Add board member
  addBoardMember: protectedProcedure
    .input(z.object({
      employeeId: z.number().optional(),
      contractorId: z.number().optional(),
      name: z.string(),
      email: z.string().email(),
      position: z.enum(["chair", "vice_chair", "secretary", "treasurer", "member"]),
      ownershipPercentage: z.number().min(0).max(100),
      votingRights: z.boolean().default(true),
      termStart: z.string(),
      termEnd: z.string().optional(),
      isFoundingMember: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      await (db as any).execute(
        `INSERT INTO board_members 
        (employeeId, contractorId, name, email, position, ownershipPercentage, votingRights, termStart, termEnd, isFoundingMember, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          input.employeeId || null,
          input.contractorId || null,
          input.name,
          input.email,
          input.position,
          input.ownershipPercentage,
          input.votingRights,
          input.termStart,
          input.termEnd || null,
          input.isFoundingMember,
        ]
      );

      return { success: true };
    }),

  // Update board member
  updateBoardMember: protectedProcedure
    .input(z.object({
      id: z.number(),
      position: z.enum(["chair", "vice_chair", "secretary", "treasurer", "member"]).optional(),
      ownershipPercentage: z.number().min(0).max(100).optional(),
      votingRights: z.boolean().optional(),
      termEnd: z.string().optional(),
      status: z.enum(["active", "inactive", "emeritus"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      const updates: string[] = [];
      const values: any[] = [];
      
      if (input.position !== undefined) {
        updates.push("position = ?");
        values.push(input.position);
      }
      if (input.ownershipPercentage !== undefined) {
        updates.push("ownershipPercentage = ?");
        values.push(input.ownershipPercentage);
      }
      if (input.votingRights !== undefined) {
        updates.push("votingRights = ?");
        values.push(input.votingRights);
      }
      if (input.termEnd !== undefined) {
        updates.push("termEnd = ?");
        values.push(input.termEnd);
      }
      if (input.status !== undefined) {
        updates.push("status = ?");
        values.push(input.status);
      }
      
      if (updates.length === 0) {
        return { success: true };
      }
      
      values.push(input.id);
      
      await (db as any).execute(
        `UPDATE board_members SET ${updates.join(", ")} WHERE id = ?`,
        values
      );

      return { success: true };
    }),

  // Get ownership summary
  getOwnershipSummary: protectedProcedure.query(async () => {
    const db = await requireDb();
    
    const [members] = await (db as any).execute(`
      SELECT name, ownershipPercentage, position, isFoundingMember
      FROM board_members
      WHERE status = 'active'
      ORDER BY ownershipPercentage DESC
    `);
    
    const totalOwnership = (members as any[]).reduce((sum, m) => sum + (m.ownershipPercentage || 0), 0);
    
    return {
      members: members as any[],
      totalAllocated: totalOwnership,
      unallocated: 100 - totalOwnership,
    };
  }),

  // ============================================================================
  // BOARD MEETINGS
  // ============================================================================

  // Get board meetings
  getBoardMeetings: protectedProcedure
    .input(z.object({
      status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = await requireDb();
      
      let query = `
        SELECT * FROM board_meetings
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (input?.status) {
        query += " AND status = ?";
        params.push(input.status);
      }
      
      query += " ORDER BY scheduledDate DESC LIMIT ?";
      params.push(input?.limit || 20);
      
      const [meetings] = await (db as any).execute(query, params);
      
      return meetings as any[];
    }),

  // Schedule board meeting
  scheduleMeeting: protectedProcedure
    .input(z.object({
      title: z.string(),
      meetingType: z.enum(["regular", "special", "annual", "emergency"]),
      scheduledDate: z.string(),
      location: z.string().optional(),
      virtualLink: z.string().optional(),
      agenda: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await requireDb();
      
      const [result] = await (db as any).execute(
        `INSERT INTO board_meetings 
        (title, meetingType, scheduledDate, location, virtualLink, agenda, status, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?)`,
        [
          input.title,
          input.meetingType,
          input.scheduledDate,
          input.location || null,
          input.virtualLink || null,
          input.agenda || null,
          ctx.user.id,
        ]
      );

      return { success: true, meetingId: result.insertId };
    }),

  // Update meeting
  updateMeeting: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
      minutes: z.string().optional(),
      attendees: z.string().optional(),
      actualStartTime: z.string().optional(),
      actualEndTime: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      const updates: string[] = [];
      const values: any[] = [];
      
      if (input.status !== undefined) {
        updates.push("status = ?");
        values.push(input.status);
      }
      if (input.minutes !== undefined) {
        updates.push("minutes = ?");
        values.push(input.minutes);
      }
      if (input.attendees !== undefined) {
        updates.push("attendees = ?");
        values.push(input.attendees);
      }
      if (input.actualStartTime !== undefined) {
        updates.push("actualStartTime = ?");
        values.push(input.actualStartTime);
      }
      if (input.actualEndTime !== undefined) {
        updates.push("actualEndTime = ?");
        values.push(input.actualEndTime);
      }
      
      if (updates.length === 0) {
        return { success: true };
      }
      
      values.push(input.id);
      
      await (db as any).execute(
        `UPDATE board_meetings SET ${updates.join(", ")} WHERE id = ?`,
        values
      );

      return { success: true };
    }),

  // ============================================================================
  // BOARD RESOLUTIONS
  // ============================================================================

  // Get resolutions
  getResolutions: protectedProcedure
    .input(z.object({
      meetingId: z.number().optional(),
      status: z.enum(["draft", "proposed", "voting", "passed", "failed", "tabled"]).optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = await requireDb();
      
      let query = `
        SELECT r.*, m.title as meetingTitle
        FROM board_resolutions r
        LEFT JOIN board_meetings m ON r.meetingId = m.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (input?.meetingId) {
        query += " AND r.meetingId = ?";
        params.push(input.meetingId);
      }
      
      if (input?.status) {
        query += " AND r.status = ?";
        params.push(input.status);
      }
      
      query += " ORDER BY r.createdAt DESC LIMIT ?";
      params.push(input?.limit || 50);
      
      const [resolutions] = await (db as any).execute(query, params);
      
      return resolutions as any[];
    }),

  // Create resolution
  createResolution: protectedProcedure
    .input(z.object({
      meetingId: z.number().optional(),
      resolutionNumber: z.string(),
      title: z.string(),
      description: z.string(),
      category: z.enum(["financial", "operational", "governance", "personnel", "strategic", "other"]),
      requiresQuorum: z.boolean().default(true),
      requiredVotePercentage: z.number().default(51),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await requireDb();
      
      const [result] = await (db as any).execute(
        `INSERT INTO board_resolutions 
        (meetingId, resolutionNumber, title, description, category, status, requiresQuorum, requiredVotePercentage, proposedBy)
        VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?)`,
        [
          input.meetingId || null,
          input.resolutionNumber,
          input.title,
          input.description,
          input.category,
          input.requiresQuorum,
          input.requiredVotePercentage,
          ctx.user.id,
        ]
      );

      return { success: true, resolutionId: result.insertId };
    }),

  // Record vote on resolution
  recordVote: protectedProcedure
    .input(z.object({
      resolutionId: z.number(),
      boardMemberId: z.number(),
      vote: z.enum(["for", "against", "abstain"]),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      // Check if already voted
      const [existing] = await (db as any).execute(
        "SELECT id FROM resolution_votes WHERE resolutionId = ? AND boardMemberId = ?",
        [input.resolutionId, input.boardMemberId]
      );
      
      if ((existing as any[]).length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Board member has already voted on this resolution",
        });
      }
      
      await (db as any).execute(
        `INSERT INTO resolution_votes (resolutionId, boardMemberId, vote, comment, votedAt)
        VALUES (?, ?, ?, ?, NOW())`,
        [input.resolutionId, input.boardMemberId, input.vote, input.comment || null]
      );

      // Update vote counts
      const [votes] = await (db as any).execute(
        `SELECT vote, COUNT(*) as count FROM resolution_votes WHERE resolutionId = ? GROUP BY vote`,
        [input.resolutionId]
      );
      
      const voteCounts = (votes as any[]).reduce((acc, v) => {
        acc[v.vote] = v.count;
        return acc;
      }, { for: 0, against: 0, abstain: 0 });
      
      await (db as any).execute(
        `UPDATE board_resolutions SET votesFor = ?, votesAgainst = ?, votesAbstain = ? WHERE id = ?`,
        [voteCounts.for, voteCounts.against, voteCounts.abstain, input.resolutionId]
      );

      return { success: true, voteCounts };
    }),

  // Finalize resolution
  finalizeResolution: protectedProcedure
    .input(z.object({
      resolutionId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      // Get resolution and vote counts
      const [resolutions] = await (db as any).execute(
        "SELECT * FROM board_resolutions WHERE id = ?",
        [input.resolutionId]
      );
      
      const resolution = (resolutions as any[])[0];
      if (!resolution) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resolution not found",
        });
      }
      
      const totalVotes = resolution.votesFor + resolution.votesAgainst;
      const forPercentage = totalVotes > 0 ? (resolution.votesFor / totalVotes) * 100 : 0;
      
      const passed = forPercentage >= resolution.requiredVotePercentage;
      
      await (db as any).execute(
        `UPDATE board_resolutions SET status = ?, votingClosedAt = NOW() WHERE id = ?`,
        [passed ? "passed" : "failed", input.resolutionId]
      );

      return { success: true, passed, forPercentage };
    }),

  // ============================================================================
  // MEMBER DISTRIBUTIONS
  // ============================================================================

  // Get distributions
  getDistributions: protectedProcedure
    .input(z.object({
      boardMemberId: z.number().optional(),
      year: z.number().optional(),
      status: z.enum(["pending", "approved", "paid", "cancelled"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await requireDb();
      
      let query = `
        SELECT d.*, bm.name as memberName
        FROM member_distributions d
        LEFT JOIN board_members bm ON d.boardMemberId = bm.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (input?.boardMemberId) {
        query += " AND d.boardMemberId = ?";
        params.push(input.boardMemberId);
      }
      
      if (input?.year) {
        query += " AND d.fiscalYear = ?";
        params.push(input.year);
      }
      
      if (input?.status) {
        query += " AND d.status = ?";
        params.push(input.status);
      }
      
      query += " ORDER BY d.createdAt DESC";
      
      const [distributions] = await (db as any).execute(query, params);
      
      return distributions as any[];
    }),

  // Create distribution
  createDistribution: protectedProcedure
    .input(z.object({
      boardMemberId: z.number(),
      distributionType: z.enum(["quarterly", "annual", "special", "k1"]),
      fiscalYear: z.number(),
      fiscalQuarter: z.number().optional(),
      grossAmount: z.number(),
      taxWithholding: z.number().default(0),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await requireDb();
      
      const netAmount = input.grossAmount - input.taxWithholding;
      
      await (db as any).execute(
        `INSERT INTO member_distributions 
        (boardMemberId, distributionType, fiscalYear, fiscalQuarter, grossAmount, taxWithholding, netAmount, status, description, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
        [
          input.boardMemberId,
          input.distributionType,
          input.fiscalYear,
          input.fiscalQuarter || null,
          input.grossAmount,
          input.taxWithholding,
          netAmount,
          input.description || null,
          ctx.user.id,
        ]
      );

      return { success: true };
    }),

  // Update distribution status
  updateDistributionStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "approved", "paid", "cancelled"]),
      paidAt: z.string().optional(),
      paymentReference: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await requireDb();
      
      const updates = ["status = ?"];
      const values: any[] = [input.status];
      
      if (input.status === "approved") {
        updates.push("approvedBy = ?");
        values.push(ctx.user.id);
        updates.push("approvedAt = NOW()");
      }
      
      if (input.status === "paid" && input.paidAt) {
        updates.push("paidAt = ?");
        values.push(input.paidAt);
      }
      
      if (input.paymentReference) {
        updates.push("paymentReference = ?");
        values.push(input.paymentReference);
      }
      
      values.push(input.id);
      
      await (db as any).execute(
        `UPDATE member_distributions SET ${updates.join(", ")} WHERE id = ?`,
        values
      );

      return { success: true };
    }),

  // Get distribution summary by member
  getDistributionSummary: protectedProcedure
    .input(z.object({
      fiscalYear: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await requireDb();
      
      const [summary] = await (db as any).execute(`
        SELECT 
          bm.id,
          bm.name,
          bm.ownershipPercentage,
          COALESCE(SUM(d.grossAmount), 0) as totalGross,
          COALESCE(SUM(d.netAmount), 0) as totalNet,
          COALESCE(SUM(d.taxWithholding), 0) as totalTax,
          COUNT(d.id) as distributionCount
        FROM board_members bm
        LEFT JOIN member_distributions d ON bm.id = d.boardMemberId AND d.fiscalYear = ? AND d.status = 'paid'
        WHERE bm.status = 'active'
        GROUP BY bm.id, bm.name, bm.ownershipPercentage
        ORDER BY bm.ownershipPercentage DESC
      `, [input.fiscalYear]);
      
      return summary as any[];
    }),

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  // Get governance dashboard
  getGovernanceDashboard: protectedProcedure.query(async () => {
    const db = await requireDb();
    
    // Board member stats
    const [memberStats] = await (db as any).execute(`
      SELECT 
        COUNT(*) as totalMembers,
        SUM(CASE WHEN isFoundingMember = TRUE THEN 1 ELSE 0 END) as foundingMembers,
        SUM(ownershipPercentage) as totalOwnership
      FROM board_members
      WHERE status = 'active'
    `);
    
    // Upcoming meetings
    const [upcomingMeetings] = await (db as any).execute(`
      SELECT COUNT(*) as count
      FROM board_meetings
      WHERE status = 'scheduled' AND scheduledDate >= NOW()
    `);
    
    // Pending resolutions
    const [pendingResolutions] = await (db as any).execute(`
      SELECT COUNT(*) as count
      FROM board_resolutions
      WHERE status IN ('draft', 'proposed', 'voting')
    `);
    
    // Pending distributions
    const [pendingDistributions] = await (db as any).execute(`
      SELECT COUNT(*) as count, COALESCE(SUM(netAmount), 0) as totalAmount
      FROM member_distributions
      WHERE status = 'pending'
    `);
    
    // Recent resolutions
    const [recentResolutions] = await (db as any).execute(`
      SELECT id, resolutionNumber, title, status, votesFor, votesAgainst
      FROM board_resolutions
      ORDER BY createdAt DESC
      LIMIT 5
    `);

    return {
      members: {
        total: (memberStats as any[])[0]?.totalMembers || 0,
        founding: (memberStats as any[])[0]?.foundingMembers || 0,
        ownershipAllocated: (memberStats as any[])[0]?.totalOwnership || 0,
      },
      meetings: {
        upcoming: (upcomingMeetings as any[])[0]?.count || 0,
      },
      resolutions: {
        pending: (pendingResolutions as any[])[0]?.count || 0,
        recent: recentResolutions as any[],
      },
      distributions: {
        pending: (pendingDistributions as any[])[0]?.count || 0,
        pendingAmount: (pendingDistributions as any[])[0]?.totalAmount || 0,
      },
    };
  }),
});

export type BoardGovernanceRouter = typeof boardGovernanceRouter;
