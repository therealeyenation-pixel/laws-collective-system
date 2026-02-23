import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const boardGovernanceExtendedRouter = router({
  // ============================================
  // BOARD POSITIONS
  // ============================================
  
  // Create a board position
  createPosition: adminProcedure
    .input(z.object({
      entityId: z.number(),
      title: z.string(),
      description: z.string().optional(),
      responsibilities: z.array(z.string()).optional(),
      votingRights: z.boolean().default(true),
      signatureAuthority: z.boolean().default(false),
      maxSignatureAmount: z.number().optional(),
      isOfficer: z.boolean().default(false),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(sql`
        INSERT INTO board_positions (entityId, title, description, responsibilities, votingRights, signatureAuthority, maxSignatureAmount, isOfficer, sortOrder, createdAt, updatedAt)
        VALUES (${input.entityId}, ${input.title}, ${input.description || null}, ${JSON.stringify(input.responsibilities || [])}, ${input.votingRights}, ${input.signatureAuthority}, ${input.maxSignatureAmount || null}, ${input.isOfficer}, ${input.sortOrder}, NOW(), NOW())
      `);

      return { success: true, message: "Position created" };
    }),

  // Get all positions for an entity
  getPositions: protectedProcedure
    .input(z.object({ entityId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [positions] = await db.execute(sql`
        SELECT bp.*, 
          (SELECT COUNT(*) FROM board_members WHERE positionId = bp.id AND status = 'active') as filledCount
        FROM board_positions bp
        WHERE bp.entityId = ${input.entityId}
        ORDER BY bp.sortOrder, bp.title
      `);

      return positions as unknown as any[];
    }),

  // Initialize default board positions for L.A.W.S. Collective
  initializeDefaultPositions: adminProcedure
    .input(z.object({ entityId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const defaultPositions = [
        {
          title: "President/CEO",
          description: "Chief Executive Officer - Overall vision, strategy, and final authority",
          responsibilities: ["Strategic planning", "Board leadership", "External representation", "Final decision authority"],
          votingRights: true,
          signatureAuthority: true,
          maxSignatureAmount: 500000,
          isOfficer: true,
          sortOrder: 1,
        },
        {
          title: "Secretary/Treasurer",
          description: "Corporate Secretary and Treasurer - Records, compliance, and financial oversight",
          responsibilities: ["Meeting minutes", "Document custody", "Financial reporting", "Banking oversight", "Compliance filings"],
          votingRights: true,
          signatureAuthority: true,
          maxSignatureAmount: 500000,
          isOfficer: true,
          sortOrder: 2,
        },
        {
          title: "Treasurer",
          description: "Financial oversight and budget management",
          responsibilities: ["Financial statements", "Budget management", "Investment oversight", "Audit coordination"],
          votingRights: true,
          signatureAuthority: true,
          maxSignatureAmount: 250000,
          isOfficer: true,
          sortOrder: 3,
        },
        {
          title: "Board Member",
          description: "Voting member of the Board of Managers",
          responsibilities: ["Attend meetings", "Vote on resolutions", "Provide oversight", "Strategic input"],
          votingRights: true,
          signatureAuthority: false,
          maxSignatureAmount: null,
          isOfficer: false,
          sortOrder: 10,
        },
        {
          title: "Advisory Board Member",
          description: "Non-voting advisory role",
          responsibilities: ["Provide expertise", "Strategic advice", "Network connections"],
          votingRights: false,
          signatureAuthority: false,
          maxSignatureAmount: null,
          isOfficer: false,
          sortOrder: 20,
        },
      ];

      for (const pos of defaultPositions) {
        await db.execute(sql`
          INSERT INTO board_positions (entityId, title, description, responsibilities, votingRights, signatureAuthority, maxSignatureAmount, isOfficer, sortOrder, createdAt, updatedAt)
          VALUES (${input.entityId}, ${pos.title}, ${pos.description}, ${JSON.stringify(pos.responsibilities)}, ${pos.votingRights}, ${pos.signatureAuthority}, ${pos.maxSignatureAmount}, ${pos.isOfficer}, ${pos.sortOrder}, NOW(), NOW())
        `);
      }

      return { success: true, message: "Default positions initialized" };
    }),

  // ============================================
  // BOARD MEMBERS
  // ============================================

  // Appoint a board member
  appointMember: adminProcedure
    .input(z.object({
      positionId: z.number(),
      userId: z.number().optional(),
      name: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      termStartDate: z.string().optional(),
      termEndDate: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(sql`
        INSERT INTO board_members (positionId, userId, name, email, phone, status, appointedAt, appointedBy, termStartDate, termEndDate, createdAt, updatedAt)
        VALUES (${input.positionId}, ${input.userId || null}, ${input.name}, ${input.email || null}, ${input.phone || null}, 'active', NOW(), ${ctx.user.id}, ${input.termStartDate ? new Date(input.termStartDate) : null}, ${input.termEndDate ? new Date(input.termEndDate) : null}, NOW(), NOW())
      `);

      return { success: true, message: "Board member appointed" };
    }),

  // Get all board members
  getMembers: protectedProcedure
    .input(z.object({ entityId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = sql`
        SELECT bm.*, bp.title as positionTitle, bp.isOfficer, bp.signatureAuthority
        FROM board_members bm
        JOIN board_positions bp ON bm.positionId = bp.id
        WHERE bm.status = 'active'
      `;

      if (input?.entityId) {
        query = sql`${query} AND bp.entityId = ${input.entityId}`;
      }

      query = sql`${query} ORDER BY bp.sortOrder, bm.name`;

      const [members] = await db.execute(query);
      return members as unknown as any[];
    }),

  // Remove/resign board member
  removeMember: adminProcedure
    .input(z.object({
      memberId: z.number(),
      reason: z.enum(["resigned", "removed"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(sql`
        UPDATE board_members 
        SET status = ${input.reason}, resignedAt = NOW(), updatedAt = NOW()
        WHERE id = ${input.memberId}
      `);

      return { success: true, message: "Board member removed" };
    }),

  // ============================================
  // MEETING CADENCE
  // ============================================

  // Get meeting schedule/cadence
  getMeetingCadence: protectedProcedure
    .query(async () => {
      return {
        quarterly: {
          name: "Quarterly Board Meeting",
          frequency: "Every 3 months",
          duration: "2 hours",
          purpose: "Financial review, strategic decisions, resolution voting",
          suggestedDays: ["First Saturday of Jan, Apr, Jul, Oct"],
          time: "10:00 AM CT",
        },
        monthly: {
          name: "Monthly Check-in",
          frequency: "Monthly (except quarterly months)",
          duration: "1 hour",
          purpose: "Progress updates, issue resolution, coordination",
          suggestedDays: ["First Saturday of each month"],
          time: "10:00 AM CT",
        },
        annual: {
          name: "Annual Strategic Planning",
          frequency: "Annually",
          duration: "4 hours",
          purpose: "Annual review, goal setting, budget approval",
          suggestedDays: ["First Saturday of December"],
          time: "9:00 AM CT",
        },
        emergency: {
          name: "Emergency Session",
          frequency: "As needed",
          duration: "As needed",
          purpose: "Urgent matters requiring immediate board action",
          notice: "24 hours minimum when possible",
        },
      };
    }),

  // ============================================
  // RESOLUTION VOTING
  // ============================================

  // Cast vote on resolution
  castVote: protectedProcedure
    .input(z.object({
      resolutionId: z.number(),
      vote: z.enum(["approve", "reject", "abstain"]),
      comments: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get member ID for this user
      const [member] = await db.execute(sql`
        SELECT id FROM board_members WHERE userId = ${ctx.user.id} AND status = 'active'
      `);

      if (!(member as unknown as any[]).length) {
        throw new Error("You are not an active board member");
      }

      const memberId = (member as unknown as any[])[0].id;

      // Check if already voted
      const [existing] = await db.execute(sql`
        SELECT id FROM board_resolution_votes WHERE resolutionId = ${input.resolutionId} AND memberId = ${memberId}
      `);

      if ((existing as unknown as any[]).length) {
        // Update existing vote
        await db.execute(sql`
          UPDATE board_resolution_votes 
          SET vote = ${input.vote}, comments = ${input.comments || null}, votedAt = NOW()
          WHERE resolutionId = ${input.resolutionId} AND memberId = ${memberId}
        `);
      } else {
        // Insert new vote
        await db.execute(sql`
          INSERT INTO board_resolution_votes (resolutionId, memberId, vote, comments, votedAt)
          VALUES (${input.resolutionId}, ${memberId}, ${input.vote}, ${input.comments || null}, NOW())
        `);
      }

      return { success: true, message: "Vote recorded" };
    }),

  // Get votes for a resolution
  getResolutionVotes: protectedProcedure
    .input(z.object({ resolutionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [votes] = await db.execute(sql`
        SELECT brv.*, bm.name as memberName, bp.title as positionTitle
        FROM board_resolution_votes brv
        JOIN board_members bm ON brv.memberId = bm.id
        JOIN board_positions bp ON bm.positionId = bp.id
        WHERE brv.resolutionId = ${input.resolutionId}
        ORDER BY brv.votedAt
      `);

      return votes as unknown as any[];
    }),

  // ============================================
  // BOARD MEETING ATTENDANCE
  // ============================================

  // Record attendance for a board meeting
  recordAttendance: adminProcedure
    .input(z.object({
      meetingId: z.number(),
      memberId: z.number(),
      status: z.enum(["invited", "confirmed", "attended", "absent", "excused"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [existing] = await db.execute(sql`
        SELECT id FROM board_meeting_attendance WHERE meetingId = ${input.meetingId} AND memberId = ${input.memberId}
      `);

      if ((existing as unknown as any[]).length) {
        await db.execute(sql`
          UPDATE board_meeting_attendance 
          SET status = ${input.status}, notes = ${input.notes || null}, checkedInAt = ${input.status === 'attended' ? sql`NOW()` : sql`NULL`}
          WHERE meetingId = ${input.meetingId} AND memberId = ${input.memberId}
        `);
      } else {
        await db.execute(sql`
          INSERT INTO board_meeting_attendance (meetingId, memberId, status, notes, checkedInAt, createdAt)
          VALUES (${input.meetingId}, ${input.memberId}, ${input.status}, ${input.notes || null}, ${input.status === 'attended' ? sql`NOW()` : sql`NULL`}, NOW())
        `);
      }

      return { success: true, message: "Attendance recorded" };
    }),

  // Get attendance for a meeting
  getMeetingAttendance: protectedProcedure
    .input(z.object({ meetingId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [attendance] = await db.execute(sql`
        SELECT bma.*, bm.name as memberName, bp.title as positionTitle
        FROM board_meeting_attendance bma
        JOIN board_members bm ON bma.memberId = bm.id
        JOIN board_positions bp ON bm.positionId = bp.id
        WHERE bma.meetingId = ${input.meetingId}
        ORDER BY bp.sortOrder, bm.name
      `);

      return attendance as unknown as any[];
    }),

  // Initialize L.A.W.S. Collective board with La Shanna and Amber
  initializeLAWSBoard: adminProcedure
    .input(z.object({ entityId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create President/CEO position and appoint La Shanna
      const [presResult] = await db.execute(sql`
        INSERT INTO board_positions (entityId, title, description, responsibilities, votingRights, signatureAuthority, maxSignatureAmount, isOfficer, sortOrder, createdAt, updatedAt)
        VALUES (${input.entityId}, 'President/CEO', 'Chief Executive Officer - Overall vision, strategy, and final authority', ${JSON.stringify(["Strategic planning", "Board leadership", "External representation", "Final decision authority"])}, true, true, 500000, true, 1, NOW(), NOW())
      `);
      const presPositionId = (presResult as any).insertId;

      await db.execute(sql`
        INSERT INTO board_members (positionId, userId, name, email, status, appointedAt, appointedBy, createdAt, updatedAt)
        VALUES (${presPositionId}, ${ctx.user.id}, 'La Shanna K. Russell', NULL, 'active', NOW(), ${ctx.user.id}, NOW(), NOW())
      `);

      // Create Secretary/Treasurer position and appoint Amber
      const [secResult] = await db.execute(sql`
        INSERT INTO board_positions (entityId, title, description, responsibilities, votingRights, signatureAuthority, maxSignatureAmount, isOfficer, sortOrder, createdAt, updatedAt)
        VALUES (${input.entityId}, 'Secretary/Treasurer', 'Corporate Secretary and Treasurer - Records, compliance, and financial oversight', ${JSON.stringify(["Meeting minutes", "Document custody", "Financial reporting", "Banking oversight", "Compliance filings"])}, true, true, 500000, true, 2, NOW(), NOW())
      `);
      const secPositionId = (secResult as any).insertId;

      await db.execute(sql`
        INSERT INTO board_members (positionId, name, email, status, appointedAt, appointedBy, createdAt, updatedAt)
        VALUES (${secPositionId}, 'Amber S. Hunter', NULL, 'active', NOW(), ${ctx.user.id}, NOW(), NOW())
      `);

      return { success: true, message: "L.A.W.S. Collective board initialized with La Shanna K. Russell as President/CEO and Amber S. Hunter as Secretary/Treasurer" };
    }),
});
