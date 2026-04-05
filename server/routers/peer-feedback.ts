import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { peerFeedback, feedbackRequests } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const peerFeedbackRouter = router({
  // Get all feedback for a specific review
  getByReview: protectedProcedure
    .input(z.object({ reviewId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const feedback = await db
        .select()
        .from(peerFeedback)
        .where(eq(peerFeedback.reviewId, input.reviewId))
        .orderBy(desc(peerFeedback.submittedAt));
      return feedback;
    }),

  // Get aggregated anonymous feedback summary for a review
  getAggregatedFeedback: protectedProcedure
    .input(z.object({ reviewId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const feedback = await db
        .select()
        .from(peerFeedback)
        .where(
          and(
            eq(peerFeedback.reviewId, input.reviewId),
            eq(peerFeedback.status, "submitted")
          )
        );

      if (feedback.length === 0) {
        return {
          totalResponses: 0,
          averageRatings: null,
          strengthsThemes: [],
          improvementThemes: [],
        };
      }

      // Calculate average ratings
      const ratings = {
        communication: 0,
        teamwork: 0,
        leadership: 0,
        technical: 0,
        problemSolving: 0,
      };
      let ratingCount = 0;

      feedback.forEach((f) => {
        if (f.communicationRating) {
          ratings.communication += f.communicationRating;
          ratingCount++;
        }
        if (f.teamworkRating) ratings.teamwork += f.teamworkRating;
        if (f.leadershipRating) ratings.leadership += f.leadershipRating;
        if (f.technicalRating) ratings.technical += f.technicalRating;
        if (f.problemSolvingRating) ratings.problemSolving += f.problemSolvingRating;
      });

      const count = feedback.length;
      const averageRatings = {
        communication: Math.round((ratings.communication / count) * 10) / 10,
        teamwork: Math.round((ratings.teamwork / count) * 10) / 10,
        leadership: Math.round((ratings.leadership / count) * 10) / 10,
        technical: Math.round((ratings.technical / count) * 10) / 10,
        problemSolving: Math.round((ratings.problemSolving / count) * 10) / 10,
        overall:
          Math.round(
            ((ratings.communication +
              ratings.teamwork +
              ratings.leadership +
              ratings.technical +
              ratings.problemSolving) /
              (count * 5)) *
              10
          ) / 10,
      };

      // Collect qualitative feedback (anonymized)
      const strengths = feedback
        .filter((f) => f.strengths)
        .map((f) => f.strengths as string);
      const improvements = feedback
        .filter((f) => f.areasForImprovement)
        .map((f) => f.areasForImprovement as string);

      return {
        totalResponses: count,
        averageRatings,
        strengthsThemes: strengths,
        improvementThemes: improvements,
      };
    }),

  // Request feedback from peers
  requestFeedback: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
        employeeName: z.string(),
        reviewers: z.array(
          z.object({
            name: z.string(),
            email: z.string().email(),
            relationship: z.enum([
              "peer",
              "direct_report",
              "manager",
              "cross_functional",
              "external",
            ]),
          })
        ),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Create feedback request record
      const [request] = await db.insert(feedbackRequests).values({
        reviewId: input.reviewId,
        requesterId: ctx.user.id,
        requesterName: ctx.user.name || "Manager",
        employeeName: input.employeeName,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        totalRequested: input.reviewers.length,
      });

      // Create individual peer feedback entries
      for (const reviewer of input.reviewers) {
        await db.insert(peerFeedback).values({
          reviewId: input.reviewId,
          requesterId: ctx.user.id,
          responderName: reviewer.name,
          responderEmail: reviewer.email,
          relationship: reviewer.relationship,
          status: "pending",
          isAnonymous: true,
        });
      }

      return { success: true, requestId: request.insertId };
    }),

  // Submit feedback (can be done anonymously via token)
  submitFeedback: publicProcedure
    .input(
      z.object({
        feedbackId: z.number(),
        communicationRating: z.number().min(1).max(5),
        teamworkRating: z.number().min(1).max(5),
        leadershipRating: z.number().min(1).max(5),
        technicalRating: z.number().min(1).max(5),
        problemSolvingRating: z.number().min(1).max(5),
        strengths: z.string().optional(),
        areasForImprovement: z.string().optional(),
        additionalComments: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      await db
        .update(peerFeedback)
        .set({
          communicationRating: input.communicationRating,
          teamworkRating: input.teamworkRating,
          leadershipRating: input.leadershipRating,
          technicalRating: input.technicalRating,
          problemSolvingRating: input.problemSolvingRating,
          strengths: input.strengths,
          areasForImprovement: input.areasForImprovement,
          additionalComments: input.additionalComments,
          status: "submitted",
          submittedAt: new Date(),
        })
        .where(eq(peerFeedback.id, input.feedbackId));

      // Update the feedback request count
      const [feedback] = await db
        .select()
        .from(peerFeedback)
        .where(eq(peerFeedback.id, input.feedbackId));

      if (feedback) {
        await db
          .update(feedbackRequests)
          .set({
            totalSubmitted: db.raw("totalSubmitted + 1") as any,
          })
          .where(eq(feedbackRequests.reviewId, feedback.reviewId));
      }

      return { success: true };
    }),

  // Get pending feedback requests for current user
  getMyPendingFeedback: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const pending = await db
      .select()
      .from(peerFeedback)
      .where(
        and(
          eq(peerFeedback.responderEmail, ctx.user.email || ""),
          eq(peerFeedback.status, "pending")
        )
      )
      .orderBy(desc(peerFeedback.requestedAt));
    return pending;
  }),

  // Get feedback request status
  getRequestStatus: protectedProcedure
    .input(z.object({ reviewId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [request] = await db
        .select()
        .from(feedbackRequests)
        .where(eq(feedbackRequests.reviewId, input.reviewId));

      if (!request) return null;

      const feedbackList = await db
        .select()
        .from(peerFeedback)
        .where(eq(peerFeedback.reviewId, input.reviewId));

      return {
        ...request,
        feedbackList: feedbackList.map((f) => ({
          id: f.id,
          responderName: f.responderName,
          relationship: f.relationship,
          status: f.status,
          submittedAt: f.submittedAt,
        })),
      };
    }),

  // Decline feedback request
  declineFeedback: publicProcedure
    .input(z.object({ feedbackId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(peerFeedback)
        .set({ status: "declined" })
        .where(eq(peerFeedback.id, input.feedbackId));
      return { success: true };
    }),
});
