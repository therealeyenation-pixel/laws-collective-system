import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { translationSuggestions, translationVotes, translationContributors } from "../../drizzle/schema";
import { eq, and, desc, sql, ne } from "drizzle-orm";

export const translationContributionsRouter = router({
  // Submit a translation suggestion
  submitSuggestion: protectedProcedure
    .input(z.object({
      translationKey: z.string(),
      namespace: z.string(),
      sourceText: z.string(),
      language: z.string(),
      suggestedText: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create suggestion
      const [result] = await db
        .insert(translationSuggestions)
        .values({
          translationKey: input.translationKey,
          namespace: input.namespace,
          sourceText: input.sourceText,
          language: input.language,
          suggestedText: input.suggestedText,
          contributorId: ctx.user.id,
          contributorName: ctx.user.name || 'Anonymous',
          status: 'pending',
          votes: 0,
        });

      // Update contributor stats
      await updateContributorStats(ctx.user.id, ctx.user.name || 'Anonymous', input.language);

      return { success: true, id: result.insertId };
    }),

  // Get suggestions for a language
  getSuggestions: protectedProcedure
    .input(z.object({
      language: z.string(),
      status: z.enum(['pending', 'approved', 'rejected']).optional(),
    }))
    .query(async ({ input }) => {
      let query = db
        .select()
        .from(translationSuggestions)
        .where(eq(translationSuggestions.language, input.language));

      if (input.status) {
        query = db
          .select()
          .from(translationSuggestions)
          .where(
            and(
              eq(translationSuggestions.language, input.language),
              eq(translationSuggestions.status, input.status)
            )
          );
      }

      const suggestions = await query.orderBy(desc(translationSuggestions.createdAt));
      return suggestions;
    }),

  // Vote on a suggestion
  vote: protectedProcedure
    .input(z.object({
      suggestionId: z.number(),
      voteType: z.enum(['up', 'down']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user already voted
      const existing = await db
        .select()
        .from(translationVotes)
        .where(
          and(
            eq(translationVotes.suggestionId, input.suggestionId),
            eq(translationVotes.userId, ctx.user.id)
          )
        );

      if (existing.length > 0) {
        if (existing[0].voteType === input.voteType) {
          // Remove vote
          await db
            .delete(translationVotes)
            .where(eq(translationVotes.id, existing[0].id));
          
          // Update suggestion vote count
          const delta = input.voteType === 'up' ? -1 : 1;
          await db
            .update(translationSuggestions)
            .set({ votes: sql`votes + ${delta}` })
            .where(eq(translationSuggestions.id, input.suggestionId));
        } else {
          // Change vote
          await db
            .update(translationVotes)
            .set({ voteType: input.voteType })
            .where(eq(translationVotes.id, existing[0].id));
          
          // Update suggestion vote count (swing of 2)
          const delta = input.voteType === 'up' ? 2 : -2;
          await db
            .update(translationSuggestions)
            .set({ votes: sql`votes + ${delta}` })
            .where(eq(translationSuggestions.id, input.suggestionId));
        }
      } else {
        // New vote
        await db
          .insert(translationVotes)
          .values({
            suggestionId: input.suggestionId,
            userId: ctx.user.id,
            voteType: input.voteType,
          });
        
        // Update suggestion vote count
        const delta = input.voteType === 'up' ? 1 : -1;
        await db
          .update(translationSuggestions)
          .set({ votes: sql`votes + ${delta}` })
          .where(eq(translationSuggestions.id, input.suggestionId));
      }

      return { success: true };
    }),

  // Review a suggestion (admin only)
  reviewSuggestion: protectedProcedure
    .input(z.object({
      suggestionId: z.number(),
      status: z.enum(['approved', 'rejected']),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get the suggestion
      const [suggestion] = await db
        .select()
        .from(translationSuggestions)
        .where(eq(translationSuggestions.id, input.suggestionId));

      if (!suggestion) {
        throw new Error('Suggestion not found');
      }

      // Update suggestion
      await db
        .update(translationSuggestions)
        .set({
          status: input.status,
          reviewerId: ctx.user.id,
          reviewerComment: input.comment || null,
          reviewedAt: new Date(),
        })
        .where(eq(translationSuggestions.id, input.suggestionId));

      // Update contributor stats
      const [contributor] = await db
        .select()
        .from(translationContributors)
        .where(eq(translationContributors.userId, suggestion.contributorId));

      if (contributor) {
        const updates: any = {};
        if (input.status === 'approved') {
          updates.approvedSuggestions = sql`approvedSuggestions + 1`;
          updates.score = sql`score + 10`;
        } else {
          updates.rejectedSuggestions = sql`rejectedSuggestions + 1`;
        }

        // Update rank based on approved count
        const newApproved = contributor.approvedSuggestions + (input.status === 'approved' ? 1 : 0);
        if (newApproved >= 100) {
          updates.contributorRank = 'master';
        } else if (newApproved >= 50) {
          updates.contributorRank = 'expert';
        } else if (newApproved >= 10) {
          updates.contributorRank = 'contributor';
        }

        await db
          .update(translationContributors)
          .set(updates)
          .where(eq(translationContributors.id, contributor.id));
      }

      return { success: true };
    }),

  // Get leaderboard
  getLeaderboard: protectedProcedure.query(async () => {
    const contributors = await db
      .select()
      .from(translationContributors)
      .orderBy(desc(translationContributors.score))
      .limit(20);
    return contributors;
  }),

  // Get language progress
  getLanguageProgress: protectedProcedure
    .input(z.object({ language: z.string() }))
    .query(async ({ input }) => {
      const approved = await db
        .select({ count: sql<number>`count(*)` })
        .from(translationSuggestions)
        .where(
          and(
            eq(translationSuggestions.language, input.language),
            eq(translationSuggestions.status, 'approved')
          )
        );

      const pending = await db
        .select({ count: sql<number>`count(*)` })
        .from(translationSuggestions)
        .where(
          and(
            eq(translationSuggestions.language, input.language),
            eq(translationSuggestions.status, 'pending')
          )
        );

      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(translationSuggestions)
        .where(eq(translationSuggestions.language, input.language));

      return {
        approved: approved[0]?.count || 0,
        pending: pending[0]?.count || 0,
        total: total[0]?.count || 0,
      };
    }),

  // Get user's contributions
  getMyContributions: protectedProcedure.query(async ({ ctx }) => {
    const suggestions = await db
      .select()
      .from(translationSuggestions)
      .where(eq(translationSuggestions.contributorId, ctx.user.id))
      .orderBy(desc(translationSuggestions.createdAt));
    return suggestions;
  }),

  // Get user's contributor profile
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const [profile] = await db
      .select()
      .from(translationContributors)
      .where(eq(translationContributors.userId, ctx.user.id));
    return profile || null;
  }),
});

// Helper function to update contributor stats
async function updateContributorStats(userId: number, userName: string, language: string) {
  const [existing] = await db
    .select()
    .from(translationContributors)
    .where(eq(translationContributors.userId, userId));

  if (existing) {
    // Update existing
    const languages = (existing.languages as string[]) || [];
    if (!languages.includes(language)) {
      languages.push(language);
    }
    await db
      .update(translationContributors)
      .set({
        totalSuggestions: sql`totalSuggestions + 1`,
        languages: languages,
      })
      .where(eq(translationContributors.id, existing.id));
  } else {
    // Create new
    await db
      .insert(translationContributors)
      .values({
        userId,
        userName,
        totalSuggestions: 1,
        approvedSuggestions: 0,
        rejectedSuggestions: 0,
        totalVotesReceived: 0,
        score: 0,
        contributorRank: 'beginner',
        languages: [language],
      });
  }
}
