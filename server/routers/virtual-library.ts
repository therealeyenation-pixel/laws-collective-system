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

// Helper function to generate sample quiz questions based on book
function generateSampleQuestions(book: any) {
  const pillarQuestions: Record<string, any[]> = {
    land: [
      {
        question: "What is the main theme related to property or land in this book?",
        type: "short_answer",
        correctAnswer: "Varies by book",
        explanation: "This question explores the connection between the story and the LAND pillar - property, roots, and generational assets.",
        pillarConnection: "Understanding how land and property shape family destiny."
      },
      {
        question: "How does the author portray the relationship between people and their environment?",
        type: "short_answer",
        correctAnswer: "Varies by book",
        explanation: "Environmental stewardship is a key aspect of the LAND pillar.",
        pillarConnection: "Recognizing our responsibility to protect natural resources."
      },
      {
        question: "True or False: Understanding your roots and heritage is important for building generational wealth.",
        type: "true_false",
        correctAnswer: "True",
        explanation: "Knowing where you come from helps you understand where you're going.",
        pillarConnection: "The LAND pillar emphasizes the importance of lineage and heritage."
      },
    ],
    air: [
      {
        question: "What key knowledge or lesson does the author want readers to learn?",
        type: "short_answer",
        correctAnswer: "Varies by book",
        explanation: "The AIR pillar focuses on education and knowledge acquisition.",
        pillarConnection: "Education empowers us to make informed decisions."
      },
      {
        question: "How does communication play a role in this story?",
        type: "short_answer",
        correctAnswer: "Varies by book",
        explanation: "Effective communication is essential for sharing knowledge.",
        pillarConnection: "The AIR pillar includes the power of words and communication."
      },
      {
        question: "True or False: Continuous learning is essential for personal growth.",
        type: "true_false",
        correctAnswer: "True",
        explanation: "Lifelong learning keeps us adaptable and informed.",
        pillarConnection: "The AIR pillar emphasizes intellectual growth and education."
      },
    ],
    water: [
      {
        question: "How do characters in this book demonstrate resilience?",
        type: "short_answer",
        correctAnswer: "Varies by book",
        explanation: "The WATER pillar focuses on healing and emotional resilience.",
        pillarConnection: "Learning to flow around obstacles like water."
      },
      {
        question: "What healing or transformation occurs in this story?",
        type: "short_answer",
        correctAnswer: "Varies by book",
        explanation: "Transformation is a key theme in the WATER pillar.",
        pillarConnection: "Water represents the ability to adapt and heal."
      },
      {
        question: "True or False: Emotional balance is important for making good decisions.",
        type: "true_false",
        correctAnswer: "True",
        explanation: "Emotional intelligence helps us navigate life's challenges.",
        pillarConnection: "The WATER pillar emphasizes balance and emotional health."
      },
    ],
    self: [
      {
        question: "What does this book teach about personal responsibility and self-mastery?",
        type: "short_answer",
        correctAnswer: "Varies by book",
        explanation: "The SELF pillar focuses on purpose and personal development.",
        pillarConnection: "Taking ownership of your life and decisions."
      },
      {
        question: "How does the main character develop their skills or identity?",
        type: "short_answer",
        correctAnswer: "Varies by book",
        explanation: "Personal growth is central to the SELF pillar.",
        pillarConnection: "Building competence and character over time."
      },
      {
        question: "True or False: Financial literacy is an important life skill.",
        type: "true_false",
        correctAnswer: "True",
        explanation: "Understanding money helps build wealth and security.",
        pillarConnection: "The SELF pillar includes financial empowerment."
      },
    ],
  };
  
  const pillar = book.lawsPillar || "self";
  const baseQuestions = pillarQuestions[pillar] || pillarQuestions.self;
  
  // Add book-specific questions
  const bookQuestions = [
    {
      question: `Who is the author of "${book.title}"?`,
      type: "multiple_choice",
      options: [book.author, "Unknown Author", "Anonymous", "Various Authors"],
      correctAnswer: book.author,
      explanation: "Knowing the author helps us understand the context and perspective of the work.",
      pillarConnection: "Understanding the source of knowledge."
    },
    {
      question: `What is the primary genre of "${book.title}"?`,
      type: "multiple_choice",
      options: [book.genre, "Mystery", "Science Fiction", "Romance"],
      correctAnswer: book.genre,
      explanation: "Genre helps us understand the style and purpose of the writing.",
      pillarConnection: "Categorizing knowledge for better understanding."
    },
  ];
  
  return [...bookQuestions, ...baseQuestions];
}

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
      // === LAND PILLAR - Property, Roots, Generational Assets ===
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
      {
        title: "Roots: The Saga of an American Family",
        author: "Alex Haley",
        genre: "Historical Fiction",
        lawsPillar: "land" as const,
        readingLevel: "9_12" as const,
        pageCount: 729,
        estimatedReadingMinutes: 900,
        description: "A sweeping family saga tracing seven generations from Africa to America. Understanding lineage, heritage, and the importance of knowing where you come from.",
        hasQuizzes: true,
        hasDiscussionGuide: true,
        isFeatured: true,
      },
      {
        title: "The Good Earth",
        author: "Pearl S. Buck",
        genre: "Literary Fiction",
        lawsPillar: "land" as const,
        readingLevel: "9_12" as const,
        pageCount: 357,
        estimatedReadingMinutes: 450,
        description: "A powerful story about a Chinese farmer's relationship with the land and how property shapes family destiny across generations.",
        hasQuizzes: true,
        hasDiscussionGuide: true,
      },
      {
        title: "The Lorax",
        author: "Dr. Seuss",
        genre: "Children's Literature",
        lawsPillar: "land" as const,
        readingLevel: "k_2" as const,
        pageCount: 72,
        estimatedReadingMinutes: 20,
        description: "A classic tale about environmental stewardship and the importance of protecting natural resources for future generations.",
        hasAudioVersion: true,
        hasQuizzes: true,
      },
      {
        title: "Farming While Black",
        author: "Leah Penniman",
        genre: "Agriculture",
        lawsPillar: "land" as const,
        readingLevel: "adult" as const,
        pageCount: 368,
        estimatedReadingMinutes: 480,
        description: "A practical guide to liberation through farming, connecting African heritage, sustainable agriculture, and food sovereignty.",
        hasDiscussionGuide: true,
      },
      
      // === AIR PILLAR - Education, Knowledge, Communication ===
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
        isFeatured: true,
      },
      {
        title: "The Autobiography of Malcolm X",
        author: "Malcolm X & Alex Haley",
        genre: "Biography",
        lawsPillar: "air" as const,
        readingLevel: "9_12" as const,
        pageCount: 500,
        estimatedReadingMinutes: 600,
        description: "The powerful story of transformation through education and self-knowledge. A testament to the power of learning and growth.",
        hasQuizzes: true,
        hasDiscussionGuide: true,
      },
      {
        title: "How to Read a Book",
        author: "Mortimer J. Adler",
        genre: "Education",
        lawsPillar: "air" as const,
        readingLevel: "9_12" as const,
        pageCount: 426,
        estimatedReadingMinutes: 540,
        description: "The classic guide to intelligent reading. Learn the art of analytical reading and how to extract maximum knowledge from any text.",
        hasQuizzes: true,
        hasDiscussionGuide: true,
      },
      {
        title: "Charlotte's Web",
        author: "E.B. White",
        genre: "Children's Literature",
        lawsPillar: "air" as const,
        readingLevel: "3_5" as const,
        pageCount: 184,
        estimatedReadingMinutes: 180,
        description: "A beloved story about friendship, loyalty, and the power of words. Charlotte uses her writing to change Wilbur's fate.",
        hasAudioVersion: true,
        hasQuizzes: true,
        hasDiscussionGuide: true,
      },
      {
        title: "The Elements of Style",
        author: "William Strunk Jr. & E.B. White",
        genre: "Writing",
        lawsPillar: "air" as const,
        readingLevel: "6_8" as const,
        pageCount: 105,
        estimatedReadingMinutes: 120,
        description: "The essential guide to clear, effective writing. Master the fundamentals of communication.",
        hasQuizzes: true,
      },
      
      // === WATER PILLAR - Healing, Balance, Resilience ===
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
        title: "The Color Purple",
        author: "Alice Walker",
        genre: "Literary Fiction",
        lawsPillar: "water" as const,
        readingLevel: "adult" as const,
        pageCount: 295,
        estimatedReadingMinutes: 360,
        description: "A powerful story of resilience, healing, and finding one's voice. Celie's journey from trauma to triumph.",
        hasQuizzes: true,
        hasDiscussionGuide: true,
        isFeatured: true,
      },
      {
        title: "Man's Search for Meaning",
        author: "Viktor E. Frankl",
        genre: "Psychology",
        lawsPillar: "water" as const,
        readingLevel: "9_12" as const,
        pageCount: 184,
        estimatedReadingMinutes: 240,
        description: "A Holocaust survivor's insights on finding purpose and meaning even in the darkest circumstances. The foundation of logotherapy.",
        hasQuizzes: true,
        hasDiscussionGuide: true,
      },
      {
        title: "The Body Keeps the Score",
        author: "Bessel van der Kolk",
        genre: "Psychology",
        lawsPillar: "water" as const,
        readingLevel: "adult" as const,
        pageCount: 464,
        estimatedReadingMinutes: 600,
        description: "Understanding how trauma affects the body and mind, and pathways to healing. Essential reading for understanding resilience.",
        hasDiscussionGuide: true,
      },
      {
        title: "Oh, the Places You'll Go!",
        author: "Dr. Seuss",
        genre: "Children's Literature",
        lawsPillar: "water" as const,
        readingLevel: "k_2" as const,
        pageCount: 56,
        estimatedReadingMinutes: 15,
        description: "A joyful journey through life's ups and downs. Teaching children about resilience and the adventure of life.",
        hasAudioVersion: true,
        hasQuizzes: true,
      },
      
      // === SELF PILLAR - Purpose, Skills, Identity ===
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
        isFeatured: true,
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
        title: "The 7 Habits of Highly Effective People",
        author: "Stephen R. Covey",
        genre: "Personal Development",
        lawsPillar: "self" as const,
        readingLevel: "9_12" as const,
        pageCount: 381,
        estimatedReadingMinutes: 480,
        description: "A principle-centered approach to personal and professional effectiveness. Build character and competence.",
        hasQuizzes: true,
        hasDiscussionGuide: true,
      },
      {
        title: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki",
        genre: "Personal Finance",
        lawsPillar: "self" as const,
        readingLevel: "6_8" as const,
        pageCount: 336,
        estimatedReadingMinutes: 420,
        description: "What the rich teach their kids about money that the poor and middle class do not. Financial education for building wealth.",
        hasQuizzes: true,
        hasDiscussionGuide: true,
      },
      {
        title: "The Alchemist",
        author: "Paulo Coelho",
        genre: "Fiction",
        lawsPillar: "self" as const,
        readingLevel: "6_8" as const,
        pageCount: 208,
        estimatedReadingMinutes: 240,
        description: "A magical story about following your dreams and discovering your Personal Legend. The journey of self-discovery.",
        hasQuizzes: true,
        hasDiscussionGuide: true,
      },
      {
        title: "The Little Engine That Could",
        author: "Watty Piper",
        genre: "Children's Literature",
        lawsPillar: "self" as const,
        readingLevel: "k_2" as const,
        pageCount: 48,
        estimatedReadingMinutes: 10,
        description: "The classic tale of perseverance and positive thinking. 'I think I can, I think I can!'",
        hasAudioVersion: true,
        hasQuizzes: true,
      },
      {
        title: "As a Man Thinketh",
        author: "James Allen",
        genre: "Philosophy",
        lawsPillar: "self" as const,
        readingLevel: "9_12" as const,
        pageCount: 68,
        estimatedReadingMinutes: 90,
        description: "A powerful essay on the power of thought to shape character and circumstances. The foundation of self-mastery.",
        hasQuizzes: true,
        hasDiscussionGuide: true,
      },
    ];
    
    for (const book of sampleBooks) {
      await db.insert(libraryBooks).values(book);
    }
    
    return { success: true, booksAdded: sampleBooks.length };
  }),

  // === COMPREHENSION QUIZ PROCEDURES ===
  
  // Get quizzes for a book
  getBookQuizzes: publicProcedure
    .input(z.object({ bookId: z.number() }))
    .query(async ({ input }) => {
      const quizzes = await db
        .select()
        .from(comprehensionQuizzes)
        .where(
          and(
            eq(comprehensionQuizzes.bookId, input.bookId),
            eq(comprehensionQuizzes.isActive, true)
          )
        )
        .orderBy(comprehensionQuizzes.chapterNumber);
      return quizzes;
    }),

  // Get a specific quiz
  getQuiz: publicProcedure
    .input(z.object({ quizId: z.number() }))
    .query(async ({ input }) => {
      const [quiz] = await db
        .select()
        .from(comprehensionQuizzes)
        .where(eq(comprehensionQuizzes.id, input.quizId));
      return quiz || null;
    }),

  // Start a quiz attempt
  startQuizAttempt: protectedProcedure
    .input(
      z.object({
        quizId: z.number(),
        bookId: z.number(),
        readingSessionId: z.number().optional(),
        studentProfileId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Count previous attempts
      const previousAttempts = await db
        .select({ count: sql<number>`count(*)` })
        .from(quizAttempts)
        .where(
          and(
            eq(quizAttempts.userId, ctx.user.id),
            eq(quizAttempts.quizId, input.quizId)
          )
        );
      
      const attemptNumber = (previousAttempts[0]?.count || 0) + 1;
      
      const [attempt] = await db
        .insert(quizAttempts)
        .values({
          userId: ctx.user.id,
          quizId: input.quizId,
          bookId: input.bookId,
          readingSessionId: input.readingSessionId,
          studentProfileId: input.studentProfileId,
          attemptNumber,
          startedAt: new Date(),
        })
        .$returningId();
      
      return { attemptId: attempt.id, attemptNumber };
    }),

  // Submit quiz answers
  submitQuizAttempt: protectedProcedure
    .input(
      z.object({
        attemptId: z.number(),
        answers: z.array(
          z.object({
            questionIndex: z.number(),
            answer: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the attempt and quiz
      const [attempt] = await db
        .select()
        .from(quizAttempts)
        .where(
          and(
            eq(quizAttempts.id, input.attemptId),
            eq(quizAttempts.userId, ctx.user.id)
          )
        );
      
      if (!attempt) {
        throw new Error("Quiz attempt not found");
      }
      
      const [quiz] = await db
        .select()
        .from(comprehensionQuizzes)
        .where(eq(comprehensionQuizzes.id, attempt.quizId));
      
      if (!quiz) {
        throw new Error("Quiz not found");
      }
      
      // Grade the quiz
      const questions = quiz.questions as Array<{
        question: string;
        type: string;
        options?: string[];
        correctAnswer: string;
        explanation: string;
      }>;
      
      let correctCount = 0;
      const gradedAnswers = input.answers.map((answer) => {
        const question = questions[answer.questionIndex];
        const isCorrect = question?.correctAnswer === answer.answer;
        if (isCorrect) correctCount++;
        return {
          questionIndex: answer.questionIndex,
          answer: answer.answer,
          isCorrect,
        };
      });
      
      const totalQuestions = questions.length;
      const score = Math.round((correctCount / totalQuestions) * 100);
      const passed = score >= (quiz.passingScore || 70);
      
      const now = new Date();
      const durationSeconds = Math.round(
        (now.getTime() - new Date(attempt.startedAt).getTime()) / 1000
      );
      
      // Generate AI feedback
      let feedback = "";
      let areasToImprove: string[] = [];
      
      if (!passed) {
        const incorrectQuestions = gradedAnswers
          .filter((a) => !a.isCorrect)
          .map((a) => questions[a.questionIndex]?.question)
          .filter(Boolean);
        
        areasToImprove = incorrectQuestions.slice(0, 3);
        feedback = `You scored ${score}%. Review the following areas: ${areasToImprove.join(", ")}`;
      } else {
        feedback = `Congratulations! You passed with a score of ${score}%.`;
      }
      
      // Update the attempt
      await db
        .update(quizAttempts)
        .set({
          answers: gradedAnswers,
          score,
          correctCount,
          totalQuestions,
          passed,
          completedAt: now,
          durationSeconds,
          feedback,
          areasToImprove,
        })
        .where(eq(quizAttempts.id, input.attemptId));
      
      return {
        score,
        correctCount,
        totalQuestions,
        passed,
        feedback,
        gradedAnswers,
        areasToImprove,
      };
    }),

  // Get user's quiz attempts
  getQuizAttempts: protectedProcedure
    .input(
      z.object({
        bookId: z.number().optional(),
        quizId: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      let query = db
        .select({
          attempt: quizAttempts,
          quiz: comprehensionQuizzes,
        })
        .from(quizAttempts)
        .innerJoin(comprehensionQuizzes, eq(quizAttempts.quizId, comprehensionQuizzes.id))
        .where(eq(quizAttempts.userId, ctx.user.id));
      
      const attempts = await query.orderBy(desc(quizAttempts.createdAt));
      return attempts;
    }),

  // Generate quiz for a book using AI
  generateBookQuiz: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        quizType: z.enum(["chapter", "midpoint", "final", "vocabulary"]),
        chapterNumber: z.number().optional(),
        questionCount: z.number().min(5).max(20).default(10),
        difficultyLevel: z.enum(["basic", "intermediate", "advanced"]).default("intermediate"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the book
      const [book] = await db
        .select()
        .from(libraryBooks)
        .where(eq(libraryBooks.id, input.bookId));
      
      if (!book) {
        throw new Error("Book not found");
      }
      
      // Generate quiz questions using AI
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an educational quiz generator for the L.A.W.S. Academy. Generate comprehension questions for books that test understanding, critical thinking, and application of concepts.
            
The book is aligned with the ${book.lawsPillar?.toUpperCase()} pillar:
- LAND: Property, roots, generational assets, environmental stewardship
- AIR: Education, knowledge, communication, intellectual growth
- WATER: Healing, balance, resilience, emotional intelligence
- SELF: Purpose, skills, identity, financial literacy

Generate questions appropriate for the ${input.difficultyLevel} difficulty level and ${book.readingLevel} reading level.`,
          },
          {
            role: "user",
            content: `Generate ${input.questionCount} ${input.quizType} quiz questions for the book "${book.title}" by ${book.author}.

Book description: ${book.description}

${input.chapterNumber ? `This is for Chapter ${input.chapterNumber}.` : "This is a comprehensive quiz for the entire book."}

Return a JSON array of questions with this structure:
[
  {
    "question": "The question text",
    "type": "multiple_choice" | "true_false" | "short_answer",
    "options": ["A", "B", "C", "D"] (for multiple choice only),
    "correctAnswer": "The correct answer",
    "explanation": "Why this is the correct answer",
    "pillarConnection": "How this relates to the ${book.lawsPillar} pillar"
  }
]`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "quiz_questions",
            strict: true,
            schema: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      type: { type: "string", enum: ["multiple_choice", "true_false", "short_answer"] },
                      options: { type: "array", items: { type: "string" } },
                      correctAnswer: { type: "string" },
                      explanation: { type: "string" },
                      pillarConnection: { type: "string" },
                    },
                    required: ["question", "type", "correctAnswer", "explanation"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["questions"],
              additionalProperties: false,
            },
          },
        },
      });
      
      const quizData = JSON.parse(response.choices[0]?.message?.content || "{}");
      const questions = quizData.questions || [];
      
      // Create the quiz
      const title = input.chapterNumber
        ? `Chapter ${input.chapterNumber} Quiz: ${book.title}`
        : `${input.quizType.charAt(0).toUpperCase() + input.quizType.slice(1)} Quiz: ${book.title}`;
      
      const [newQuiz] = await db
        .insert(comprehensionQuizzes)
        .values({
          bookId: input.bookId,
          title,
          chapterNumber: input.chapterNumber,
          quizType: input.quizType,
          questions,
          questionCount: questions.length,
          passingScore: 70,
          difficultyLevel: input.difficultyLevel,
        })
        .$returningId();
      
      return {
        quizId: newQuiz.id,
        title,
        questionCount: questions.length,
      };
    }),

  // Seed sample quizzes for books
  seedSampleQuizzes: protectedProcedure.mutation(async ({ ctx }) => {
    // Get all books
    const books = await db.select().from(libraryBooks).where(eq(libraryBooks.isActive, true));
    
    let quizzesCreated = 0;
    
    for (const book of books) {
      // Check if quiz already exists
      const [existingQuiz] = await db
        .select()
        .from(comprehensionQuizzes)
        .where(eq(comprehensionQuizzes.bookId, book.id));
      
      if (existingQuiz) continue;
      
      // Create a sample quiz based on the book
      const sampleQuestions = generateSampleQuestions(book);
      
      await db.insert(comprehensionQuizzes).values({
        bookId: book.id,
        title: `Comprehension Quiz: ${book.title}`,
        quizType: "final",
        questions: sampleQuestions,
        questionCount: sampleQuestions.length,
        passingScore: 70,
        difficultyLevel: book.readingLevel === "k_2" ? "basic" : book.readingLevel === "adult" ? "advanced" : "intermediate",
      });
      
      quizzesCreated++;
    }
    
    return { success: true, quizzesCreated };
  }),
});
