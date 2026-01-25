import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { db, getDb } from "../db";
import {
  libraryBooks,
  readingSessions,
  bookDiscussions,
  comprehensionQuizzes,
  quizAttempts,
  vocabularyWords,
  readingCertificates,
  bookAnnotations,
  readingDiscussionRequirements,
} from "../../drizzle/schema";
import { eq, and, desc, sql, like, or } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

export const virtualLibraryRouter = router({
  // Get all books with optional filtering
  getBooks: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        readingLevel: z.enum(["k_2", "3_5", "6_8", "9_12", "adult"]).optional(),
        lawsPillar: z.enum(["land", "air", "water", "self"]).optional(),
        genre: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const filters = input || {};
      let query = db.select().from(libraryBooks).where(eq(libraryBooks.isActive, true));
      
      // Apply filters using raw SQL for now
      const books = await db
        .select()
        .from(libraryBooks)
        .where(eq(libraryBooks.isActive, true))
        .orderBy(desc(libraryBooks.isFeatured), desc(libraryBooks.createdAt))
        .limit(filters.limit || 20)
        .offset(filters.offset || 0);
      
      return books;
    }),

  // Get a single book by ID
  getBook: publicProcedure
    .input(z.object({ bookId: z.number() }))
    .query(async ({ input }) => {
      const [book] = await db
        .select()
        .from(libraryBooks)
        .where(eq(libraryBooks.id, input.bookId));
      return book || null;
    }),

  // Get user's reading sessions
  getReadingSessions: protectedProcedure
    .input(
      z.object({
        status: z.enum(["not_started", "in_progress", "completed", "abandoned"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const sessions = await db
        .select({
          session: readingSessions,
          book: libraryBooks,
        })
        .from(readingSessions)
        .innerJoin(libraryBooks, eq(readingSessions.bookId, libraryBooks.id))
        .where(eq(readingSessions.userId, ctx.user.id))
        .orderBy(desc(readingSessions.lastReadAt));
      
      return sessions;
    }),

  // Start or continue reading a book
  startReading: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        studentProfileId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if session already exists
      const [existing] = await db
        .select()
        .from(readingSessions)
        .where(
          and(
            eq(readingSessions.userId, ctx.user.id),
            eq(readingSessions.bookId, input.bookId)
          )
        );
      
      if (existing) {
        // Update last read time
        await db
          .update(readingSessions)
          .set({
            lastReadAt: new Date(),
            sessionsCount: sql`${readingSessions.sessionsCount} + 1`,
          })
          .where(eq(readingSessions.id, existing.id));
        return existing;
      }
      
      // Create new session
      const [newSession] = await db
        .insert(readingSessions)
        .values({
          userId: ctx.user.id,
          bookId: input.bookId,
          studentProfileId: input.studentProfileId,
          status: "in_progress",
          lastReadAt: new Date(),
          sessionsCount: 1,
        })
        .$returningId();
      
      return { id: newSession.id, ...input };
    }),

  // Update reading progress
  updateProgress: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        currentPage: z.number(),
        currentChapter: z.number().optional(),
        readingMinutes: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [session] = await db
        .select()
        .from(readingSessions)
        .innerJoin(libraryBooks, eq(readingSessions.bookId, libraryBooks.id))
        .where(
          and(
            eq(readingSessions.id, input.sessionId),
            eq(readingSessions.userId, ctx.user.id)
          )
        );
      
      if (!session) {
        throw new Error("Reading session not found");
      }
      
      const book = session.library_books;
      const percentComplete = book.pageCount
        ? ((input.currentPage / book.pageCount) * 100).toFixed(2)
        : "0";
      
      const isCompleted = book.pageCount && input.currentPage >= book.pageCount;
      
      await db
        .update(readingSessions)
        .set({
          currentPage: input.currentPage,
          currentChapter: input.currentChapter,
          percentComplete: percentComplete,
          totalReadingMinutes: sql`${readingSessions.totalReadingMinutes} + ${input.readingMinutes || 0}`,
          lastReadAt: new Date(),
          status: isCompleted ? "completed" : "in_progress",
          completedAt: isCompleted ? new Date() : undefined,
        })
        .where(eq(readingSessions.id, input.sessionId));
      
      return { success: true, completed: isCompleted };
    }),

  // AI Reading Companion - Have a discussion about the book
  discussWithAI: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        sessionId: z.number().optional(),
        discussionId: z.number().optional(),
        message: z.string(),
        chapterNumber: z.number().optional(),
        pageNumber: z.number().optional(),
        discussionType: z.enum(["comprehension", "analysis", "socratic", "vocabulary", "free_form"]).default("free_form"),
        gradeLevel: z.enum(["k_2", "3_5", "6_8", "9_12"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get book details
      const [book] = await db
        .select()
        .from(libraryBooks)
        .where(eq(libraryBooks.id, input.bookId));
      
      if (!book) {
        throw new Error("Book not found");
      }
      
      // Get or create discussion
      let discussion: any;
      let messages: Array<{ role: string; content: string; timestamp: string }> = [];
      
      if (input.discussionId) {
        const [existing] = await db
          .select()
          .from(bookDiscussions)
          .where(eq(bookDiscussions.id, input.discussionId));
        
        if (existing) {
          discussion = existing;
          messages = (existing.messages as any) || [];
        }
      }
      
      // Add user message
      messages.push({
        role: "user",
        content: input.message,
        timestamp: new Date().toISOString(),
      });
      
      // Build AI prompt based on discussion type and grade level
      const systemPrompts: Record<string, string> = {
        comprehension: `You are a reading companion helping a student understand "${book.title}" by ${book.author}. Focus on basic comprehension: who, what, where, when, why. Use simple language appropriate for the student's level. Ask follow-up questions to check understanding.`,
        analysis: `You are a literary analysis guide for "${book.title}" by ${book.author}. Help the student explore themes, character development, symbolism, and narrative techniques. Encourage deeper thinking with probing questions.`,
        socratic: `You are a Socratic tutor discussing "${book.title}" by ${book.author}. Instead of giving answers, ask thought-provoking questions that lead the student to discover insights on their own. Challenge assumptions and encourage critical thinking.`,
        vocabulary: `You are a vocabulary tutor helping a student learn new words from "${book.title}" by ${book.author}. When the student asks about a word, provide: definition, pronunciation guide, part of speech, example sentence, and how it's used in the book's context.`,
        free_form: `You are a friendly reading companion discussing "${book.title}" by ${book.author}. Engage naturally with the student's questions and observations. Encourage deeper exploration while keeping the conversation enjoyable.`,
      };
      
      const gradeLevelInstructions: Record<string, string> = {
        k_2: "The student is in grades K-2 (ages 5-8). Use very simple vocabulary, short sentences, and lots of encouragement. Be warm and supportive.",
        "3_5": "The student is in grades 3-5 (ages 8-11). Use age-appropriate vocabulary and explain concepts clearly. Encourage curiosity.",
        "6_8": "The student is in grades 6-8 (ages 11-14). You can use more complex vocabulary and introduce literary concepts. Challenge them appropriately.",
        "9_12": "The student is in grades 9-12 (ages 14-18). Engage at a sophisticated level. Discuss literary analysis, historical context, and complex themes.",
      };
      
      const systemPrompt = `${systemPrompts[input.discussionType]}
      
${input.gradeLevel ? gradeLevelInstructions[input.gradeLevel] : ""}

${input.chapterNumber ? `The student is currently on Chapter ${input.chapterNumber}.` : ""}
${input.pageNumber ? `The student is on page ${input.pageNumber}.` : ""}

Keep responses concise but meaningful. Always end with a question or prompt to continue the discussion.`;

      // Call LLM
      const llmMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];
      
      const response = await invokeLLM({ messages: llmMessages });
      const aiResponse = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";
      
      // Add AI response to messages
      messages.push({
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      });
      
      // Save or update discussion
      if (discussion) {
        await db
          .update(bookDiscussions)
          .set({
            messages: messages,
            messageCount: messages.length,
          })
          .where(eq(bookDiscussions.id, discussion.id));
      } else {
        const [newDiscussion] = await db
          .insert(bookDiscussions)
          .values({
            userId: ctx.user.id,
            bookId: input.bookId,
            readingSessionId: input.sessionId,
            chapterNumber: input.chapterNumber,
            pageNumber: input.pageNumber,
            discussionType: input.discussionType,
            messages: messages,
            messageCount: messages.length,
          })
          .$returningId();
        
        discussion = { id: newDiscussion.id };
      }
      
      return {
        discussionId: discussion.id,
        response: aiResponse,
        messages: messages,
      };
    }),

  // Get discussion requirements by grade level
  getDiscussionRequirements: publicProcedure
    .input(z.object({ gradeLevel: z.enum(["k_2", "3_5", "6_8", "9_12"]) }))
    .query(async ({ input }) => {
      const [requirements] = await db
        .select()
        .from(readingDiscussionRequirements)
        .where(eq(readingDiscussionRequirements.gradeLevel, input.gradeLevel));
      
      // Return defaults if not configured
      if (!requirements) {
        const defaults: Record<string, any> = {
          k_2: {
            readAloudDefault: true,
            readAloudCanDisable: true,
            basicQARequired: true,
            deepDiscussionRequired: false,
            deepDiscussionEncouraged: false,
          },
          "3_5": {
            readAloudDefault: false,
            readAloudCanDisable: true,
            basicQARequired: true,
            deepDiscussionRequired: false,
            deepDiscussionEncouraged: false,
          },
          "6_8": {
            readAloudDefault: false,
            readAloudCanDisable: true,
            basicQARequired: true,
            deepDiscussionRequired: false,
            deepDiscussionEncouraged: true,
            discussionBonusCredits: 10,
          },
          "9_12": {
            readAloudDefault: false,
            readAloudCanDisable: true,
            basicQARequired: true,
            deepDiscussionRequired: true,
            deepDiscussionEncouraged: true,
          },
        };
        return defaults[input.gradeLevel];
      }
      
      return requirements;
    }),

  // Add vocabulary word
  addVocabularyWord: protectedProcedure
    .input(
      z.object({
        word: z.string(),
        bookId: z.number().optional(),
        contextFromBook: z.string().optional(),
        studentProfileId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use AI to get definition
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a vocabulary assistant. Provide a clear, concise definition suitable for students.",
          },
          {
            role: "user",
            content: `Define the word "${input.word}" and provide: 1) A simple definition, 2) Part of speech, 3) An example sentence. Format as JSON: {"definition": "...", "partOfSpeech": "...", "exampleSentence": "..."}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "vocabulary_definition",
            strict: true,
            schema: {
              type: "object",
              properties: {
                definition: { type: "string" },
                partOfSpeech: { type: "string" },
                exampleSentence: { type: "string" },
              },
              required: ["definition", "partOfSpeech", "exampleSentence"],
              additionalProperties: false,
            },
          },
        },
      });
      
      const wordData = JSON.parse(response.choices[0]?.message?.content || "{}");
      
      const [newWord] = await db
        .insert(vocabularyWords)
        .values({
          userId: ctx.user.id,
          bookId: input.bookId,
          studentProfileId: input.studentProfileId,
          word: input.word,
          definition: wordData.definition,
          partOfSpeech: wordData.partOfSpeech,
          exampleSentence: wordData.exampleSentence,
          contextFromBook: input.contextFromBook,
          masteryLevel: "new",
        })
        .$returningId();
      
      return { id: newWord.id, ...wordData };
    }),

  // Get user's vocabulary words
  getVocabularyWords: protectedProcedure
    .input(
      z.object({
        bookId: z.number().optional(),
        masteryLevel: z.enum(["new", "learning", "familiar", "mastered"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const words = await db
        .select()
        .from(vocabularyWords)
        .where(eq(vocabularyWords.userId, ctx.user.id))
        .orderBy(desc(vocabularyWords.createdAt));
      
      return words;
    }),

  // Get reading statistics
  getReadingStats: protectedProcedure.query(async ({ ctx }) => {
    const sessions = await db
      .select()
      .from(readingSessions)
      .where(eq(readingSessions.userId, ctx.user.id));
    
    const completedBooks = sessions.filter((s) => s.status === "completed").length;
    const totalReadingMinutes = sessions.reduce((sum, s) => sum + (s.totalReadingMinutes || 0), 0);
    const booksInProgress = sessions.filter((s) => s.status === "in_progress").length;
    
    const vocabularyCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(vocabularyWords)
      .where(eq(vocabularyWords.userId, ctx.user.id));
    
    const discussionCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookDiscussions)
      .where(eq(bookDiscussions.userId, ctx.user.id));
    
    return {
      completedBooks,
      booksInProgress,
      totalReadingMinutes,
      totalReadingHours: Math.round(totalReadingMinutes / 60),
      vocabularyWordsLearned: vocabularyCount[0]?.count || 0,
      discussionsHeld: discussionCount[0]?.count || 0,
    };
  }),

  // Seed sample books (for development)
  seedSampleBooks: protectedProcedure.mutation(async ({ ctx }) => {
    const sampleBooks = [
      {
        title: "The Richest Man in Babylon",
        author: "George S. Clason",
        genre: "Personal Finance",
        lawsPillar: "self" as const,
        readingLevel: "6_8" as const,
        pageCount: 144,
        estimatedReadingMinutes: 180,
        description: "A classic guide to financial wisdom through parables set in ancient Babylon. Learn the fundamentals of saving, investing, and building wealth.",
        hasQuizzes: true,
        hasDiscussionGuide: true,
      },
      {
        title: "Think and Grow Rich",
        author: "Napoleon Hill",
        genre: "Personal Development",
        lawsPillar: "self" as const,
        readingLevel: "9_12" as const,
        pageCount: 238,
        estimatedReadingMinutes: 300,
        description: "The timeless classic on achieving success through the power of thought, desire, and persistence.",
        hasQuizzes: true,
        hasDiscussionGuide: true,
      },
      {
        title: "The Giving Tree",
        author: "Shel Silverstein",
        genre: "Children's Literature",
        lawsPillar: "water" as const,
        readingLevel: "k_2" as const,
        pageCount: 64,
        estimatedReadingMinutes: 15,
        description: "A touching story about the relationship between a boy and a tree, exploring themes of love, sacrifice, and the cycle of life.",
        hasAudioVersion: true,
        hasQuizzes: true,
      },
      {
        title: "The Constitution of the United States",
        author: "Founding Fathers",
        genre: "Civics",
        lawsPillar: "air" as const,
        readingLevel: "9_12" as const,
        pageCount: 28,
        estimatedReadingMinutes: 60,
        description: "The foundational document of American government. Understanding your rights and the structure of governance.",
        hasDiscussionGuide: true,
      },
      {
        title: "Silent Spring",
        author: "Rachel Carson",
        genre: "Environmental Science",
        lawsPillar: "land" as const,
        readingLevel: "9_12" as const,
        pageCount: 368,
        estimatedReadingMinutes: 480,
        description: "The groundbreaking book that launched the environmental movement, examining the effects of pesticides on the natural world.",
        hasQuizzes: true,
        hasDiscussionGuide: true,
      },
    ];
    
    for (const book of sampleBooks) {
      await db.insert(libraryBooks).values(book);
    }
    
    return { success: true, booksAdded: sampleBooks.length };
  }),
});
