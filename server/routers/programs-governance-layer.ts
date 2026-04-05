/**
 * Programs & Governance Layer Router
 * Training & Curriculum, Outreach & Engagement, Board Oversight, Policy Management, Strategic Planning
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import {
  calculateCourseProgress,
  createCourseData,
  createEnrollmentData,
  createCampaignData,
  createEventData,
  createCommunityMemberData,
  calculateEngagementRate,
  getEventAvailability,
  getProgramsLayerSummary
} from "../services/programs-layer";
import {
  checkQuorum,
  calculateVotingResult,
  createBoardMemberData,
  createBoardMeetingData,
  createResolutionData,
  isPolicyDueForReview,
  generatePolicyNumber,
  createPolicyData,
  calculateGoalProgress,
  createStrategicGoalData,
  createInitiativeData,
  getGovernanceLayerSummary
} from "../services/governance-layer";

export const programsGovernanceLayerRouter = router({
  // Get summaries
  getProgramsSummary: protectedProcedure.query(async () => {
    return getProgramsLayerSummary();
  }),

  getGovernanceSummary: protectedProcedure.query(async () => {
    return getGovernanceLayerSummary();
  }),

  // === TRAINING & CURRICULUM ===

  createCourse: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string(),
      category: z.enum(["technical", "soft_skills", "compliance", "leadership", "onboarding"]),
      level: z.enum(["beginner", "intermediate", "advanced"]),
      duration: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const courseData = createCourseData(
        input.title,
        input.description,
        input.category,
        input.level,
        input.duration,
        ctx.user.id
      );

      const result = await db.execute({
        sql: `INSERT INTO lms_courses (title, description, category, level, duration, status, created_by, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        args: [courseData.title, courseData.description, courseData.category, courseData.level, courseData.duration, courseData.status, courseData.createdBy]
      });

      return { success: true, courseId: result.insertId };
    }),

  getCourses: protectedProcedure.query(async () => {
    const results = await db.execute({
      sql: `SELECT * FROM lms_courses ORDER BY created_at DESC`
    });
    return results.rows;
  }),

  enrollInCourse: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const enrollmentData = createEnrollmentData(ctx.user.id, input.courseId);

      const result = await db.execute({
        sql: `INSERT INTO lms_enrollments (user_id, course_id, status, progress, enrolled_at)
              VALUES (?, ?, ?, ?, NOW())`,
        args: [enrollmentData.userId, enrollmentData.courseId, enrollmentData.status, enrollmentData.progress]
      });

      return { success: true, enrollmentId: result.insertId };
    }),

  updateProgress: protectedProcedure
    .input(z.object({
      enrollmentId: z.number(),
      completedModules: z.number(),
      totalModules: z.number()
    }))
    .mutation(async ({ input }) => {
      const progress = calculateCourseProgress(input.completedModules, input.totalModules);

      await db.execute({
        sql: `UPDATE lms_enrollments SET progress = ?, status = ? WHERE id = ?`,
        args: [progress, progress >= 100 ? "completed" : "in_progress", input.enrollmentId]
      });

      return { success: true, progress };
    }),

  // === OUTREACH & ENGAGEMENT ===

  createCampaign: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      type: z.enum(["email", "social", "event", "newsletter", "webinar"]),
      targetAudience: z.string(),
      startDate: z.string(),
      budget: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const campaignData = createCampaignData(
        input.name,
        input.type,
        input.targetAudience,
        new Date(input.startDate),
        input.budget
      );

      const result = await db.execute({
        sql: `INSERT INTO outreach_campaigns (name, type, status, target_audience, start_date, budget, reach, engagement, conversions)
              VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0)`,
        args: [campaignData.name, campaignData.type, campaignData.status, campaignData.targetAudience, input.startDate, campaignData.budget || null]
      });

      return { success: true, campaignId: result.insertId };
    }),

  getCampaigns: protectedProcedure.query(async () => {
    const results = await db.execute({
      sql: `SELECT * FROM outreach_campaigns ORDER BY start_date DESC`
    });

    return results.rows.map((row: any) => ({
      ...row,
      engagementRate: calculateEngagementRate(row.engagement, row.reach)
    }));
  }),

  createEvent: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      type: z.enum(["workshop", "webinar", "conference", "meetup", "training"]),
      description: z.string(),
      date: z.string(),
      duration: z.number(),
      location: z.string(),
      isVirtual: z.boolean(),
      capacity: z.number()
    }))
    .mutation(async ({ input }) => {
      const eventData = createEventData(
        input.name,
        input.type,
        input.description,
        new Date(input.date),
        input.duration,
        input.location,
        input.isVirtual,
        input.capacity
      );

      const result = await db.execute({
        sql: `INSERT INTO outreach_events (name, type, description, date, duration, location, is_virtual, capacity, registrations, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'upcoming')`,
        args: [eventData.name, eventData.type, eventData.description, input.date, eventData.duration, eventData.location, eventData.isVirtual, eventData.capacity]
      });

      return { success: true, eventId: result.insertId };
    }),

  getEvents: protectedProcedure.query(async () => {
    const results = await db.execute({
      sql: `SELECT * FROM outreach_events ORDER BY date`
    });

    return results.rows.map((row: any) => ({
      ...row,
      availability: getEventAvailability({
        id: row.id,
        name: row.name,
        type: row.type,
        description: row.description,
        date: new Date(row.date),
        duration: row.duration,
        location: row.location,
        isVirtual: row.is_virtual,
        capacity: row.capacity,
        registrations: row.registrations,
        status: row.status
      })
    }));
  }),

  addCommunityMember: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string(),
      interests: z.array(z.string())
    }))
    .mutation(async ({ input }) => {
      const memberData = createCommunityMemberData(input.email, input.name, input.interests);

      const result = await db.execute({
        sql: `INSERT INTO community_members (email, name, joined_at, engagement_score, interests, status)
              VALUES (?, ?, NOW(), 0, ?, 'active')`,
        args: [memberData.email, memberData.name, JSON.stringify(memberData.interests)]
      });

      return { success: true, memberId: result.insertId };
    }),

  // === BOARD OVERSIGHT ===

  addBoardMember: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      title: z.string(),
      role: z.enum(["chair", "vice_chair", "secretary", "treasurer", "member"]),
      termStart: z.string(),
      termEnd: z.string()
    }))
    .mutation(async ({ input }) => {
      const memberData = createBoardMemberData(
        input.name,
        input.title,
        input.role,
        new Date(input.termStart),
        new Date(input.termEnd)
      );

      const result = await db.execute({
        sql: `INSERT INTO board_members (name, title, role, committee, term_start, term_end, status, voting_rights)
              VALUES (?, ?, ?, '[]', ?, ?, ?, ?)`,
        args: [memberData.name, memberData.title, memberData.role, input.termStart, input.termEnd, memberData.status, memberData.votingRights]
      });

      return { success: true, memberId: result.insertId };
    }),

  getBoardMembers: protectedProcedure.query(async () => {
    const results = await db.execute({
      sql: `SELECT * FROM board_members ORDER BY role, name`
    });
    return results.rows;
  }),

  scheduleMeeting: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      type: z.enum(["regular", "special", "annual", "emergency"]),
      date: z.string(),
      location: z.string(),
      isVirtual: z.boolean()
    }))
    .mutation(async ({ input }) => {
      const meetingData = createBoardMeetingData(
        input.title,
        input.type,
        new Date(input.date),
        input.location,
        input.isVirtual
      );

      const result = await db.execute({
        sql: `INSERT INTO board_meetings (title, type, date, location, is_virtual, agenda, attendees, quorum_met, status)
              VALUES (?, ?, ?, ?, ?, '[]', '[]', false, 'scheduled')`,
        args: [meetingData.title, meetingData.type, input.date, meetingData.location, meetingData.isVirtual]
      });

      return { success: true, meetingId: result.insertId };
    }),

  recordVote: protectedProcedure
    .input(z.object({
      meetingId: z.number(),
      motion: z.string(),
      yesVotes: z.number(),
      noVotes: z.number(),
      abstentions: z.number()
    }))
    .mutation(async ({ input }) => {
      const result = calculateVotingResult(input.yesVotes, input.noVotes, input.abstentions);

      await db.execute({
        sql: `INSERT INTO board_votes (meeting_id, motion, yes_votes, no_votes, abstentions, passed, recorded_at)
              VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        args: [input.meetingId, input.motion, input.yesVotes, input.noVotes, input.abstentions, result.passed]
      });

      return { success: true, passed: result.passed };
    }),

  createResolution: protectedProcedure
    .input(z.object({
      number: z.string(),
      title: z.string().min(1),
      description: z.string(),
      category: z.enum(["financial", "operational", "strategic", "governance", "personnel"])
    }))
    .mutation(async ({ ctx, input }) => {
      const resolutionData = createResolutionData(
        input.number,
        input.title,
        input.description,
        input.category,
        ctx.user.id
      );

      const result = await db.execute({
        sql: `INSERT INTO board_resolutions (number, title, description, category, proposed_by, proposed_at, status)
              VALUES (?, ?, ?, ?, ?, NOW(), 'proposed')`,
        args: [resolutionData.number, resolutionData.title, resolutionData.description, resolutionData.category, resolutionData.proposedBy]
      });

      return { success: true, resolutionId: result.insertId };
    }),

  // === POLICY MANAGEMENT ===

  createPolicy: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      category: z.enum(["hr", "finance", "operations", "compliance", "governance", "it", "safety"]),
      description: z.string(),
      content: z.string()
    }))
    .mutation(async ({ input }) => {
      // Get next sequence number
      const countResult = await db.execute({
        sql: `SELECT COUNT(*) as count FROM policies WHERE category = ?`,
        args: [input.category]
      });
      const sequence = ((countResult.rows[0] as any)?.count || 0) + 1;
      const policyNumber = generatePolicyNumber(input.category, sequence);

      const policyData = createPolicyData(
        policyNumber,
        input.title,
        input.category,
        input.description,
        input.content
      );

      const result = await db.execute({
        sql: `INSERT INTO policies (number, title, category, description, content, version, effective_date, review_date, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          policyData.number, policyData.title, policyData.category, policyData.description,
          policyData.content, policyData.version, policyData.effectiveDate.toISOString().split('T')[0],
          policyData.reviewDate.toISOString().split('T')[0], policyData.status
        ]
      });

      return { success: true, policyId: result.insertId, policyNumber };
    }),

  getPolicies: protectedProcedure.query(async () => {
    const results = await db.execute({
      sql: `SELECT * FROM policies ORDER BY category, number`
    });

    return results.rows.map((row: any) => ({
      ...row,
      isDueForReview: isPolicyDueForReview({
        id: row.id,
        number: row.number,
        title: row.title,
        category: row.category,
        description: row.description,
        content: row.content,
        version: row.version,
        effectiveDate: new Date(row.effective_date),
        reviewDate: new Date(row.review_date),
        status: row.status
      })
    }));
  }),

  // === STRATEGIC PLANNING ===

  createStrategicGoal: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string(),
      category: z.enum(["growth", "financial", "operational", "innovation", "social_impact"]),
      timeframe: z.enum(["short_term", "medium_term", "long_term"]),
      targetDate: z.string(),
      priority: z.enum(["low", "medium", "high", "critical"])
    }))
    .mutation(async ({ ctx, input }) => {
      const goalData = createStrategicGoalData(
        input.title,
        input.description,
        input.category,
        input.timeframe,
        new Date(input.targetDate),
        ctx.user.id,
        input.priority
      );

      const result = await db.execute({
        sql: `INSERT INTO strategic_goals (title, description, category, timeframe, target_date, metrics, status, owner, priority)
              VALUES (?, ?, ?, ?, ?, '[]', 'not_started', ?, ?)`,
        args: [goalData.title, goalData.description, goalData.category, goalData.timeframe, input.targetDate, goalData.owner, goalData.priority]
      });

      return { success: true, goalId: result.insertId };
    }),

  getStrategicGoals: protectedProcedure.query(async () => {
    const results = await db.execute({
      sql: `SELECT * FROM strategic_goals ORDER BY priority DESC, target_date`
    });

    return results.rows.map((row: any) => {
      const metrics = JSON.parse(row.metrics || "[]");
      return {
        ...row,
        progress: calculateGoalProgress(metrics)
      };
    });
  }),

  createInitiative: protectedProcedure
    .input(z.object({
      goalId: z.number(),
      title: z.string().min(1),
      description: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      budget: z.number().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const initiativeData = createInitiativeData(
        input.goalId,
        input.title,
        input.description,
        new Date(input.startDate),
        new Date(input.endDate),
        ctx.user.id,
        input.budget
      );

      const result = await db.execute({
        sql: `INSERT INTO strategic_initiatives (goal_id, title, description, start_date, end_date, budget, status, progress, owner)
              VALUES (?, ?, ?, ?, ?, ?, 'planned', 0, ?)`,
        args: [initiativeData.goalId, initiativeData.title, initiativeData.description, input.startDate, input.endDate, initiativeData.budget || null, initiativeData.owner]
      });

      return { success: true, initiativeId: result.insertId };
    }),

  // Combined dashboard
  getGovernanceDashboard: protectedProcedure.query(async () => {
    const boardMembers = await db.execute({ sql: `SELECT COUNT(*) as count FROM board_members WHERE status = 'active'` });
    const upcomingMeetings = await db.execute({ sql: `SELECT COUNT(*) as count FROM board_meetings WHERE date > NOW() AND status = 'scheduled'` });
    const pendingResolutions = await db.execute({ sql: `SELECT COUNT(*) as count FROM board_resolutions WHERE status = 'proposed'` });
    const policiesForReview = await db.execute({ sql: `SELECT COUNT(*) as count FROM policies WHERE review_date <= DATE_ADD(NOW(), INTERVAL 30 DAY) AND status = 'approved'` });
    const activeGoals = await db.execute({ sql: `SELECT COUNT(*) as count FROM strategic_goals WHERE status IN ('not_started', 'in_progress')` });

    return {
      boardMembers: (boardMembers.rows[0] as any)?.count || 0,
      upcomingMeetings: (upcomingMeetings.rows[0] as any)?.count || 0,
      pendingResolutions: (pendingResolutions.rows[0] as any)?.count || 0,
      policiesForReview: (policiesForReview.rows[0] as any)?.count || 0,
      activeGoals: (activeGoals.rows[0] as any)?.count || 0
    };
  })
});
