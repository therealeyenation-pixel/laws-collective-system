import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { TRPCError } from "@trpc/server";
import { randomBytes, createHash } from "crypto";
import { sql } from "drizzle-orm";

// Helper to hash passwords
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

// Helper to generate random password
function generatePassword(): string {
  return randomBytes(4).toString("hex"); // 8 character password
}

// Helper to parse user agent
function parseUserAgent(ua: string | undefined): { deviceType: string; browser: string } {
  if (!ua) return { deviceType: "unknown", browser: "unknown" };
  
  let deviceType = "desktop";
  if (/mobile/i.test(ua)) deviceType = "mobile";
  else if (/tablet|ipad/i.test(ua)) deviceType = "tablet";
  
  let browser = "unknown";
  if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/edge/i.test(ua)) browser = "Edge";
  
  return { deviceType, browser };
}

export const trialRouter = router({
  // Sign up for trial
  signup: publicProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(2),
      organization: z.string().optional(),
      role: z.string().optional(),
      wantsUpdates: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      // Check if email already exists
      const existing = await db.execute(
        sql`SELECT id, status FROM trial_users WHERE email = ${input.email}`
      );
      
      if (Array.isArray(existing) && existing.length > 0 && (existing[0] as any[]).length > 0) {
        const user = (existing[0] as any[])[0];
        if (user.status === "active") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An account with this email already exists. Please log in instead.",
          });
        }
        if (user.status === "expired") {
          throw new TRPCError({
            code: "CONFLICT", 
            message: "Your trial has expired. Please contact us for access.",
          });
        }
      }
      
      // Generate password
      const password = generatePassword();
      const passwordHash = hashPassword(password);
      
      // Calculate trial expiration (14 days)
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 14);
      
      // Insert user
      await db.execute(sql`
        INSERT INTO trial_users (email, name, organization, role, passwordHash, status, trialStartedAt, trialExpiresAt, wantsUpdates)
        VALUES (${input.email}, ${input.name}, ${input.organization || null}, ${input.role || null}, ${passwordHash}, 'active', NOW(), ${trialExpiresAt.toISOString().slice(0, 19).replace('T', ' ')}, ${input.wantsUpdates})
      `);
      
      // Get the created user
      const newUser = await db.execute(
        sql`SELECT id, email, name FROM trial_users WHERE email = ${input.email}`
      );
      
      const userId = Array.isArray(newUser) && newUser.length > 0 ? (newUser[0] as any[])[0]?.id : null;
      
      // TODO: Send email with password (for now, return it)
      // In production, this would send via email service
      
      return {
        success: true,
        message: "Trial account created! Check your email for login credentials.",
        // In development, return password directly
        credentials: {
          email: input.email,
          password: password, // Only for development/testing
        },
        userId,
      };
    }),

  // Login for trial users
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const passwordHash = hashPassword(input.password);
      
      const result = await db.execute(sql`
        SELECT id, email, name, status, trialExpiresAt 
        FROM trial_users 
        WHERE email = ${input.email} AND passwordHash = ${passwordHash}
      `);
      
      if (!Array.isArray(result) || result.length === 0 || (result[0] as any[]).length === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }
      
      const user = (result[0] as any[])[0];
      
      if (user.status === "expired") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your trial has expired. Please contact us for continued access.",
        });
      }
      
      // Check if trial expired by date
      if (new Date(user.trialExpiresAt) < new Date()) {
        await db.execute(sql`UPDATE trial_users SET status = 'expired' WHERE id = ${user.id}`);
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your trial has expired. Please contact us for continued access.",
        });
      }
      
      // Update last login
      await db.execute(sql`
        UPDATE trial_users 
        SET lastLoginAt = NOW(), totalSessions = totalSessions + 1 
        WHERE id = ${user.id}
      `);
      
      // Get request info for session tracking
      const userAgent = ctx.req?.headers?.["user-agent"] as string | undefined;
      const ipAddress = ctx.req?.headers?.["x-forwarded-for"] as string || ctx.req?.socket?.remoteAddress || "unknown";
      const { deviceType, browser } = parseUserAgent(userAgent);
      
      // Create session
      const sessionResult = await db.execute(sql`
        INSERT INTO trial_sessions (trialUserId, ipAddress, userAgent, deviceType, browser)
        VALUES (${user.id}, ${ipAddress}, ${userAgent || null}, ${deviceType}, ${browser})
      `);
      
      // Get session ID
      const sessionId = (sessionResult as any).insertId || (sessionResult[0] as any)?.insertId;
      
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isTrialUser: true,
        },
        sessionId,
      };
    }),

  // Get current trial user (for session check)
  me: publicProcedure
    .input(z.object({
      trialUserId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      if (!input.trialUserId) {
        return null;
      }
      
      const result = await db.execute(sql`
        SELECT id, email, name, organization, role, status, trialStartedAt, trialExpiresAt, totalSessions, totalTimeSpentSeconds
        FROM trial_users 
        WHERE id = ${input.trialUserId} AND status = 'active'
      `);
      
      if (!Array.isArray(result) || result.length === 0 || (result[0] as any[]).length === 0) {
        return null;
      }
      
      const user = (result[0] as any[])[0];
      
      // Check expiration
      if (new Date(user.trialExpiresAt) < new Date()) {
        await db.execute(sql`UPDATE trial_users SET status = 'expired' WHERE id = ${user.id}`);
        return null;
      }
      
      return {
        ...user,
        isTrialUser: true,
        daysRemaining: Math.ceil((new Date(user.trialExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      };
    }),

  // Track page view
  trackPageView: publicProcedure
    .input(z.object({
      trialUserId: z.number(),
      sessionId: z.number(),
      pagePath: z.string(),
      pageTitle: z.string().optional(),
      previousPage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Close previous page view if exists
      await db.execute(sql`
        UPDATE trial_page_views 
        SET exitedAt = NOW(), timeOnPageSeconds = TIMESTAMPDIFF(SECOND, enteredAt, NOW())
        WHERE trialUserId = ${input.trialUserId} 
          AND trialSessionId = ${input.sessionId}
          AND exitedAt IS NULL
      `);
      
      // Create new page view
      await db.execute(sql`
        INSERT INTO trial_page_views (trialUserId, trialSessionId, pagePath, pageTitle, previousPage)
        VALUES (${input.trialUserId}, ${input.sessionId}, ${input.pagePath}, ${input.pageTitle || null}, ${input.previousPage || null})
      `);
      
      // Update session page count
      await db.execute(sql`
        UPDATE trial_sessions 
        SET pagesVisited = pagesVisited + 1 
        WHERE id = ${input.sessionId}
      `);
      
      return { success: true };
    }),

  // Track feature exploration
  trackFeature: publicProcedure
    .input(z.object({
      trialUserId: z.number(),
      featureCategory: z.string(),
      featureName: z.string(),
      completed: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      // Upsert feature exploration
      await db.execute(sql`
        INSERT INTO trial_feature_exploration (trialUserId, featureCategory, featureName, completedAction, completedAt)
        VALUES (${input.trialUserId}, ${input.featureCategory}, ${input.featureName}, ${input.completed}, ${input.completed ? sql`NOW()` : sql`NULL`})
        ON DUPLICATE KEY UPDATE 
          lastExploredAt = NOW(),
          explorationCount = explorationCount + 1,
          completedAction = IF(${input.completed}, TRUE, completedAction),
          completedAt = IF(${input.completed} AND completedAt IS NULL, NOW(), completedAt)
      `);
      
      return { success: true };
    }),

  // Submit feedback
  submitFeedback: publicProcedure
    .input(z.object({
      trialUserId: z.number(),
      sessionId: z.number().optional(),
      feedbackType: z.enum(["overall_rating", "feature_rating", "bug_report", "suggestion", "exit_survey", "inline_comment"]),
      rating: z.number().min(1).max(5).optional(),
      featureName: z.string().optional(),
      pagePath: z.string().optional(),
      comment: z.string().optional(),
      wantsResponse: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      await db.execute(sql`
        INSERT INTO trial_feedback (trialUserId, trialSessionId, feedbackType, rating, featureName, pagePath, comment, wantsResponse)
        VALUES (${input.trialUserId}, ${input.sessionId || null}, ${input.feedbackType}, ${input.rating || null}, ${input.featureName || null}, ${input.pagePath || null}, ${input.comment || null}, ${input.wantsResponse})
      `);
      
      return { success: true, message: "Thank you for your feedback!" };
    }),

  // Submit exit survey
  submitExitSurvey: publicProcedure
    .input(z.object({
      trialUserId: z.number(),
      overallRating: z.number().min(1).max(5).optional(),
      wouldRecommend: z.number().min(1).max(10).optional(),
      easeOfUseRating: z.number().min(1).max(5).optional(),
      featureCompletenessRating: z.number().min(1).max(5).optional(),
      designRating: z.number().min(1).max(5).optional(),
      valuePropositionRating: z.number().min(1).max(5).optional(),
      mostUsefulFeature: z.string().optional(),
      missingFeatures: z.string().optional(),
      biggestConcerns: z.string().optional(),
      additionalComments: z.string().optional(),
      interestedInJoining: z.enum(["yes", "no", "maybe"]).optional(),
      preferredFollowUp: z.enum(["email", "call", "demo", "none"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { trialUserId, ...surveyData } = input;
      
      await db.execute(sql`
        INSERT INTO trial_exit_surveys (
          trialUserId, overallRating, wouldRecommend, easeOfUseRating, 
          featureCompletenessRating, designRating, valuePropositionRating,
          mostUsefulFeature, missingFeatures, biggestConcerns, additionalComments,
          interestedInJoining, preferredFollowUp
        ) VALUES (
          ${trialUserId}, ${surveyData.overallRating || null}, ${surveyData.wouldRecommend || null},
          ${surveyData.easeOfUseRating || null}, ${surveyData.featureCompletenessRating || null},
          ${surveyData.designRating || null}, ${surveyData.valuePropositionRating || null},
          ${surveyData.mostUsefulFeature || null}, ${surveyData.missingFeatures || null},
          ${surveyData.biggestConcerns || null}, ${surveyData.additionalComments || null},
          ${surveyData.interestedInJoining || null}, ${surveyData.preferredFollowUp || null}
        )
        ON DUPLICATE KEY UPDATE
          overallRating = VALUES(overallRating),
          wouldRecommend = VALUES(wouldRecommend),
          easeOfUseRating = VALUES(easeOfUseRating),
          featureCompletenessRating = VALUES(featureCompletenessRating),
          designRating = VALUES(designRating),
          valuePropositionRating = VALUES(valuePropositionRating),
          mostUsefulFeature = VALUES(mostUsefulFeature),
          missingFeatures = VALUES(missingFeatures),
          biggestConcerns = VALUES(biggestConcerns),
          additionalComments = VALUES(additionalComments),
          interestedInJoining = VALUES(interestedInJoining),
          preferredFollowUp = VALUES(preferredFollowUp),
          completedAt = NOW()
      `);
      
      return { success: true, message: "Thank you for completing the survey!" };
    }),

  // End session
  endSession: publicProcedure
    .input(z.object({
      sessionId: z.number(),
      trialUserId: z.number(),
    }))
    .mutation(async ({ input }) => {
      // Close any open page views
      await db.execute(sql`
        UPDATE trial_page_views 
        SET exitedAt = NOW(), timeOnPageSeconds = TIMESTAMPDIFF(SECOND, enteredAt, NOW())
        WHERE trialSessionId = ${input.sessionId} AND exitedAt IS NULL
      `);
      
      // End session
      await db.execute(sql`
        UPDATE trial_sessions 
        SET sessionEnd = NOW(), durationSeconds = TIMESTAMPDIFF(SECOND, sessionStart, NOW())
        WHERE id = ${input.sessionId}
      `);
      
      // Update user total time
      const sessionDuration = await db.execute(sql`
        SELECT durationSeconds FROM trial_sessions WHERE id = ${input.sessionId}
      `);
      
      if (Array.isArray(sessionDuration) && sessionDuration.length > 0) {
        const duration = (sessionDuration[0] as any[])[0]?.durationSeconds || 0;
        await db.execute(sql`
          UPDATE trial_users 
          SET totalTimeSpentSeconds = totalTimeSpentSeconds + ${duration}
          WHERE id = ${input.trialUserId}
        `);
      }
      
      return { success: true };
    }),

  // Admin: Get trial analytics
  getAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      // Only admin/owner can view analytics
      if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      
      // Get overview stats
      const totalUsers = await db.execute(sql`SELECT COUNT(*) as count FROM trial_users`);
      const activeUsers = await db.execute(sql`SELECT COUNT(*) as count FROM trial_users WHERE status = 'active'`);
      const totalSessions = await db.execute(sql`SELECT COUNT(*) as count FROM trial_sessions`);
      const totalFeedback = await db.execute(sql`SELECT COUNT(*) as count FROM trial_feedback`);
      
      // Get average ratings
      const avgRatings = await db.execute(sql`
        SELECT 
          AVG(overallRating) as avgOverall,
          AVG(wouldRecommend) as avgNPS,
          AVG(easeOfUseRating) as avgEaseOfUse
        FROM trial_exit_surveys
      `);
      
      // Get top explored features
      const topFeatures = await db.execute(sql`
        SELECT featureCategory, featureName, COUNT(*) as explorations, SUM(completedAction) as completions
        FROM trial_feature_exploration
        GROUP BY featureCategory, featureName
        ORDER BY explorations DESC
        LIMIT 10
      `);
      
      // Get recent signups
      const recentSignups = await db.execute(sql`
        SELECT id, email, name, organization, createdAt, totalSessions, status
        FROM trial_users
        ORDER BY createdAt DESC
        LIMIT 20
      `);
      
      // Get feedback summary
      const feedbackSummary = await db.execute(sql`
        SELECT feedbackType, COUNT(*) as count, AVG(rating) as avgRating
        FROM trial_feedback
        GROUP BY feedbackType
      `);
      
      // Get average session duration
      const avgSession = await db.execute(sql`
        SELECT AVG(durationSeconds) as avgDuration FROM trial_sessions WHERE durationSeconds IS NOT NULL
      `);
      
      // Get recent feedback
      const recentFeedback = await db.execute(sql`
        SELECT f.*, u.name as userName
        FROM trial_feedback f
        LEFT JOIN trial_users u ON f.trialUserId = u.id
        ORDER BY f.createdAt DESC
        LIMIT 5
      `);
      
      // Get feature breakdown
      const featureBreakdown = await db.execute(sql`
        SELECT featureCategory as category, COUNT(*) as totalExplorations, COUNT(DISTINCT trialUserId) as uniqueUsers
        FROM trial_feature_exploration
        GROUP BY featureCategory
        ORDER BY totalExplorations DESC
      `);
      
      // Format top features for dashboard
      const formattedFeatures = ((topFeatures[0] as any[]) || []).map((f: any) => ({
        name: f.featureName || f.featureCategory,
        count: Number(f.explorations) || 0,
      }));
      
      return {
        totalUsers: Number((totalUsers[0] as any[])[0]?.count) || 0,
        activeUsers: Number((activeUsers[0] as any[])[0]?.count) || 0,
        totalSessions: Number((totalSessions[0] as any[])[0]?.count) || 0,
        totalFeedback: Number((totalFeedback[0] as any[])[0]?.count) || 0,
        avgSessionDuration: Number((avgSession[0] as any[])[0]?.avgDuration) || 0,
        avgRating: Number((avgRatings[0] as any[])[0]?.avgOverall) || 0,
        conversionRate: 0, // TODO: Calculate from converted users
        topFeatures: formattedFeatures,
        recentSignups: ((recentSignups[0] as any[]) || []).slice(0, 5),
        recentFeedback: (recentFeedback[0] as any[]) || [],
        featureBreakdown: (featureBreakdown[0] as any[]) || [],
      };
    }),

  // Admin: Get all trial users
  listUsers: protectedProcedure
    .input(z.object({
      status: z.enum(["all", "pending", "active", "expired", "converted"]).default("all"),
      search: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      
      let query = sql`
        SELECT * FROM trial_users
        ${input.status !== "all" ? sql`WHERE status = ${input.status}` : sql``}
        ORDER BY createdAt DESC
        LIMIT ${input.limit} OFFSET ${input.offset}
      `;
      
      const users = await db.execute(query);
      
      return (users[0] as any[]) || [];
    }),

  // Admin: Get feedback for review
  listFeedback: protectedProcedure
    .input(z.object({
      type: z.string().optional(),
      status: z.enum(["all", "pending", "responded", "closed"]).default("all"),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      
      const feedback = await db.execute(sql`
        SELECT f.*, u.email, u.name
        FROM trial_feedback f
        JOIN trial_users u ON f.trialUserId = u.id
        ${input.status !== "all" ? sql`WHERE f.responseStatus = ${input.status}` : sql``}
        ORDER BY f.createdAt DESC
        LIMIT ${input.limit}
      `);
      
      return (feedback[0] as any[]) || [];
    }),
});
