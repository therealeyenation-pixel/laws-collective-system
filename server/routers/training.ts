import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  trainingModules, 
  trainingTopics, 
  trainingQuestions, 
  trainingAnswers,
  trainingSessions,
  trainingResponses
} from "../../drizzle/schema";
import { eq, desc, and, asc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Admin check middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin' && ctx.user.role !== 'owner') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const trainingRouter = router({
  // ============================================
  // MODULE OPERATIONS
  // ============================================
  
  /**
   * Get all training modules (public can see active/public, admin sees all)
   */
  getModules: publicProcedure
    .input(z.object({
      agentType: z.string().optional(),
      simulatorType: z.string().optional(),
      includeInactive: z.boolean().default(false),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      
      let query = db.select().from(trainingModules);
      
      // Non-admin users only see active, public modules
      const isAdmin = ctx.user && (ctx.user.role === 'admin' || ctx.user.role === 'owner');
      if (!isAdmin || !input?.includeInactive) {
        query = query.where(and(
          eq(trainingModules.isActive, true),
          eq(trainingModules.isPublic, true)
        )) as any;
      }
      
      const modules = await query.orderBy(desc(trainingModules.createdAt));
      
      // Filter by agent/simulator type if specified
      let filtered = modules;
      if (input?.agentType) {
        filtered = filtered.filter(m => m.agentType === input.agentType);
      }
      if (input?.simulatorType) {
        filtered = filtered.filter(m => m.simulatorType === input.simulatorType);
      }
      
      return filtered;
    }),

  /**
   * Get a single module with its topics and questions
   */
  getModule: publicProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const [module] = await db.select()
        .from(trainingModules)
        .where(eq(trainingModules.id, input.moduleId));
      
      if (!module) return null;
      
      const topics = await db.select()
        .from(trainingTopics)
        .where(eq(trainingTopics.moduleId, input.moduleId))
        .orderBy(asc(trainingTopics.orderIndex));
      
      // Get questions for each topic
      const topicsWithQuestions = await Promise.all(topics.map(async (topic) => {
        const questions = await db.select()
          .from(trainingQuestions)
          .where(eq(trainingQuestions.topicId, topic.id))
          .orderBy(asc(trainingQuestions.orderIndex));
        
        // Get answers for each question
        const questionsWithAnswers = await Promise.all(questions.map(async (q) => {
          const answers = await db.select()
            .from(trainingAnswers)
            .where(eq(trainingAnswers.questionId, q.id))
            .orderBy(asc(trainingAnswers.orderIndex));
          return { ...q, answers };
        }));
        
        return { ...topic, questions: questionsWithAnswers };
      }));
      
      return { ...module, topics: topicsWithQuestions };
    }),

  /**
   * Create a new training module (admin only)
   */
  createModule: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      agentType: z.string().optional(),
      simulatorType: z.string().optional(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
      estimatedMinutes: z.number().default(30),
      passingScore: z.number().min(0).max(100).default(70),
      isActive: z.boolean().default(true),
      isPublic: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      const result = await db.insert(trainingModules).values({
        ...input,
        createdBy: ctx.user.id,
      });
      
      return { success: true, moduleId: result[0].insertId };
    }),

  /**
   * Update a training module (admin only)
   */
  updateModule: adminProcedure
    .input(z.object({
      moduleId: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      agentType: z.string().optional(),
      simulatorType: z.string().optional(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      estimatedMinutes: z.number().optional(),
      passingScore: z.number().min(0).max(100).optional(),
      isActive: z.boolean().optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      const { moduleId, ...updates } = input;
      await db.update(trainingModules)
        .set(updates)
        .where(eq(trainingModules.id, moduleId));
      
      return { success: true };
    }),

  /**
   * Delete a training module (admin only)
   */
  deleteModule: adminProcedure
    .input(z.object({ moduleId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      // Delete in order: responses -> sessions -> answers -> questions -> topics -> module
      const topics = await db.select().from(trainingTopics)
        .where(eq(trainingTopics.moduleId, input.moduleId));
      
      for (const topic of topics) {
        const questions = await db.select().from(trainingQuestions)
          .where(eq(trainingQuestions.topicId, topic.id));
        
        for (const q of questions) {
          await db.delete(trainingAnswers).where(eq(trainingAnswers.questionId, q.id));
        }
        await db.delete(trainingQuestions).where(eq(trainingQuestions.topicId, topic.id));
      }
      
      await db.delete(trainingTopics).where(eq(trainingTopics.moduleId, input.moduleId));
      await db.delete(trainingSessions).where(eq(trainingSessions.moduleId, input.moduleId));
      await db.delete(trainingModules).where(eq(trainingModules.id, input.moduleId));
      
      return { success: true };
    }),

  // ============================================
  // TOPIC OPERATIONS
  // ============================================

  /**
   * Create a topic within a module (admin only)
   */
  createTopic: adminProcedure
    .input(z.object({
      moduleId: z.number(),
      name: z.string().min(1),
      description: z.string().optional(),
      orderIndex: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      const result = await db.insert(trainingTopics).values(input);
      return { success: true, topicId: result[0].insertId };
    }),

  /**
   * Update a topic (admin only)
   */
  updateTopic: adminProcedure
    .input(z.object({
      topicId: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      orderIndex: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      const { topicId, ...updates } = input;
      await db.update(trainingTopics)
        .set(updates)
        .where(eq(trainingTopics.id, topicId));
      
      return { success: true };
    }),

  /**
   * Delete a topic (admin only)
   */
  deleteTopic: adminProcedure
    .input(z.object({ topicId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      // Delete questions and answers first
      const questions = await db.select().from(trainingQuestions)
        .where(eq(trainingQuestions.topicId, input.topicId));
      
      for (const q of questions) {
        await db.delete(trainingAnswers).where(eq(trainingAnswers.questionId, q.id));
      }
      await db.delete(trainingQuestions).where(eq(trainingQuestions.topicId, input.topicId));
      await db.delete(trainingTopics).where(eq(trainingTopics.id, input.topicId));
      
      return { success: true };
    }),

  // ============================================
  // QUESTION OPERATIONS
  // ============================================

  /**
   * Create a question within a topic (admin only)
   */
  createQuestion: adminProcedure
    .input(z.object({
      topicId: z.number(),
      questionText: z.string().min(1),
      questionType: z.enum(["multiple_choice", "true_false", "open_ended", "fill_blank"]).default("multiple_choice"),
      difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
      points: z.number().default(10),
      orderIndex: z.number().default(0),
      explanation: z.string().optional(),
      hint: z.string().optional(),
      answers: z.array(z.object({
        answerText: z.string().min(1),
        isCorrect: z.boolean().default(false),
        feedback: z.string().optional(),
        orderIndex: z.number().default(0),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      const { answers, ...questionData } = input;
      const result = await db.insert(trainingQuestions).values(questionData);
      const questionId = result[0].insertId;
      
      // Create answers if provided
      if (answers && answers.length > 0) {
        await db.insert(trainingAnswers).values(
          answers.map(a => ({ ...a, questionId }))
        );
      }
      
      return { success: true, questionId };
    }),

  /**
   * Update a question (admin only)
   */
  updateQuestion: adminProcedure
    .input(z.object({
      questionId: z.number(),
      questionText: z.string().min(1).optional(),
      questionType: z.enum(["multiple_choice", "true_false", "open_ended", "fill_blank"]).optional(),
      difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      points: z.number().optional(),
      orderIndex: z.number().optional(),
      explanation: z.string().optional(),
      hint: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      const { questionId, ...updates } = input;
      await db.update(trainingQuestions)
        .set(updates)
        .where(eq(trainingQuestions.id, questionId));
      
      return { success: true };
    }),

  /**
   * Delete a question (admin only)
   */
  deleteQuestion: adminProcedure
    .input(z.object({ questionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      await db.delete(trainingAnswers).where(eq(trainingAnswers.questionId, input.questionId));
      await db.delete(trainingQuestions).where(eq(trainingQuestions.id, input.questionId));
      
      return { success: true };
    }),

  // ============================================
  // ANSWER OPERATIONS
  // ============================================

  /**
   * Create an answer for a question (admin only)
   */
  createAnswer: adminProcedure
    .input(z.object({
      questionId: z.number(),
      answerText: z.string().min(1),
      isCorrect: z.boolean().default(false),
      feedback: z.string().optional(),
      orderIndex: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      const result = await db.insert(trainingAnswers).values(input);
      return { success: true, answerId: result[0].insertId };
    }),

  /**
   * Update an answer (admin only)
   */
  updateAnswer: adminProcedure
    .input(z.object({
      answerId: z.number(),
      answerText: z.string().min(1).optional(),
      isCorrect: z.boolean().optional(),
      feedback: z.string().optional(),
      orderIndex: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      const { answerId, ...updates } = input;
      await db.update(trainingAnswers)
        .set(updates)
        .where(eq(trainingAnswers.id, answerId));
      
      return { success: true };
    }),

  /**
   * Delete an answer (admin only)
   */
  deleteAnswer: adminProcedure
    .input(z.object({ answerId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      await db.delete(trainingAnswers).where(eq(trainingAnswers.id, input.answerId));
      return { success: true };
    }),

  // ============================================
  // SESSION & PROGRESS OPERATIONS
  // ============================================

  /**
   * Start a training session
   */
  startSession: protectedProcedure
    .input(z.object({
      moduleId: z.number(),
      agentConversationId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      // Get total questions for this module
      const topics = await db.select().from(trainingTopics)
        .where(eq(trainingTopics.moduleId, input.moduleId));
      
      let totalQuestions = 0;
      let totalPoints = 0;
      let firstTopicId: number | null = null;
      let firstQuestionId: number | null = null;
      
      for (const topic of topics) {
        const questions = await db.select().from(trainingQuestions)
          .where(eq(trainingQuestions.topicId, topic.id));
        totalQuestions += questions.length;
        totalPoints += questions.reduce((sum, q) => sum + q.points, 0);
        
        if (!firstTopicId && questions.length > 0) {
          firstTopicId = topic.id;
          firstQuestionId = questions[0].id;
        }
      }
      
      const result = await db.insert(trainingSessions).values({
        userId: ctx.user.id,
        moduleId: input.moduleId,
        agentConversationId: input.agentConversationId,
        totalQuestions,
        totalPoints,
        currentTopicId: firstTopicId,
        currentQuestionId: firstQuestionId,
      });
      
      return { 
        success: true, 
        sessionId: result[0].insertId,
        totalQuestions,
        totalPoints,
      };
    }),

  /**
   * Get current session state
   */
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const [session] = await db.select()
        .from(trainingSessions)
        .where(and(
          eq(trainingSessions.id, input.sessionId),
          eq(trainingSessions.userId, ctx.user.id)
        ));
      
      if (!session) return null;
      
      // Get current question with answers
      let currentQuestion = null;
      if (session.currentQuestionId) {
        const [q] = await db.select().from(trainingQuestions)
          .where(eq(trainingQuestions.id, session.currentQuestionId));
        
        if (q) {
          const answers = await db.select({
            id: trainingAnswers.id,
            answerText: trainingAnswers.answerText,
            orderIndex: trainingAnswers.orderIndex,
          }).from(trainingAnswers)
            .where(eq(trainingAnswers.questionId, q.id))
            .orderBy(asc(trainingAnswers.orderIndex));
          
          currentQuestion = { ...q, answers };
        }
      }
      
      return { ...session, currentQuestion };
    }),

  /**
   * Submit an answer for the current question
   */
  submitAnswer: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      questionId: z.number(),
      answerId: z.number().optional(), // For multiple choice
      userAnswer: z.string().optional(), // For open-ended
      timeSpentSeconds: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      // Get session
      const [session] = await db.select()
        .from(trainingSessions)
        .where(and(
          eq(trainingSessions.id, input.sessionId),
          eq(trainingSessions.userId, ctx.user.id)
        ));
      
      if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
      
      // Get question
      const [question] = await db.select().from(trainingQuestions)
        .where(eq(trainingQuestions.id, input.questionId));
      
      if (!question) throw new TRPCError({ code: 'NOT_FOUND', message: 'Question not found' });
      
      // Check if answer is correct
      let isCorrect = false;
      let feedback = "";
      
      if (input.answerId) {
        const [answer] = await db.select().from(trainingAnswers)
          .where(eq(trainingAnswers.id, input.answerId));
        
        if (answer) {
          isCorrect = answer.isCorrect;
          feedback = answer.feedback || (isCorrect ? "Correct!" : "Incorrect.");
        }
      }
      
      const pointsEarned = isCorrect ? question.points : 0;
      
      // Record response
      await db.insert(trainingResponses).values({
        sessionId: input.sessionId,
        questionId: input.questionId,
        answerId: input.answerId,
        userAnswer: input.userAnswer,
        isCorrect,
        pointsEarned,
        timeSpentSeconds: input.timeSpentSeconds,
      });
      
      // Update session progress
      const newAnsweredQuestions = session.answeredQuestions + 1;
      const newCorrectAnswers = session.correctAnswers + (isCorrect ? 1 : 0);
      const newEarnedPoints = session.earnedPoints + pointsEarned;
      const newScore = session.totalPoints > 0 
        ? Math.round((newEarnedPoints / session.totalPoints) * 100)
        : 0;
      
      // Find next question
      const topic = await db.select().from(trainingTopics)
        .where(eq(trainingTopics.id, question.topicId));
      
      const allQuestions = await db.select().from(trainingQuestions)
        .where(eq(trainingQuestions.topicId, question.topicId))
        .orderBy(asc(trainingQuestions.orderIndex));
      
      const currentIndex = allQuestions.findIndex(q => q.id === input.questionId);
      let nextQuestionId: number | null = null;
      let nextTopicId: number | null = session.currentTopicId;
      
      if (currentIndex < allQuestions.length - 1) {
        // More questions in this topic
        nextQuestionId = allQuestions[currentIndex + 1].id;
      } else {
        // Check for next topic
        const allTopics = await db.select().from(trainingTopics)
          .where(eq(trainingTopics.moduleId, session.moduleId))
          .orderBy(asc(trainingTopics.orderIndex));
        
        const topicIndex = allTopics.findIndex(t => t.id === question.topicId);
        
        if (topicIndex < allTopics.length - 1) {
          // Move to next topic
          nextTopicId = allTopics[topicIndex + 1].id;
          const nextTopicQuestions = await db.select().from(trainingQuestions)
            .where(eq(trainingQuestions.topicId, nextTopicId))
            .orderBy(asc(trainingQuestions.orderIndex));
          
          if (nextTopicQuestions.length > 0) {
            nextQuestionId = nextTopicQuestions[0].id;
          }
        }
      }
      
      // Check if session is complete
      const isComplete = newAnsweredQuestions >= session.totalQuestions;
      
      await db.update(trainingSessions)
        .set({
          answeredQuestions: newAnsweredQuestions,
          correctAnswers: newCorrectAnswers,
          earnedPoints: newEarnedPoints,
          score: newScore,
          currentTopicId: nextTopicId,
          currentQuestionId: nextQuestionId,
          status: isComplete ? "completed" : "in_progress",
          completedAt: isComplete ? new Date() : null,
        })
        .where(eq(trainingSessions.id, input.sessionId));
      
      // Get module for passing score
      const [module] = await db.select().from(trainingModules)
        .where(eq(trainingModules.id, session.moduleId));
      
      const passed = isComplete && newScore >= (module?.passingScore || 70);
      
      return {
        isCorrect,
        feedback,
        explanation: question.explanation,
        pointsEarned,
        isComplete,
        passed,
        score: newScore,
        nextQuestionId,
      };
    }),

  /**
   * Get user's training history
   */
  getHistory: protectedProcedure
    .input(z.object({
      moduleId: z.number().optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      
      let conditions = eq(trainingSessions.userId, ctx.user.id);
      if (input.moduleId) {
        conditions = and(conditions, eq(trainingSessions.moduleId, input.moduleId)) as any;
      }
      
      const sessions = await db.select()
        .from(trainingSessions)
        .where(conditions)
        .orderBy(desc(trainingSessions.startedAt))
        .limit(input.limit);
      
      // Get module names
      const sessionsWithModules = await Promise.all(sessions.map(async (s) => {
        const [module] = await db.select({ name: trainingModules.name })
          .from(trainingModules)
          .where(eq(trainingModules.id, s.moduleId));
        return { ...s, moduleName: module?.name || "Unknown" };
      }));
      
      return sessionsWithModules;
    }),
});
