import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  bots, 
  botConversations, 
  botMessages, 
  botActions,
  businessEntities,
  autonomousOperations,
  tokenAccounts,
  notifications,
  luvLedgerAccounts
} from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// Bot system prompts for different types
const BOT_SYSTEM_PROMPTS: Record<string, string> = {
  operations: `You are the Operations Bot for the LuvOnPurpose Autonomous Wealth System. Your role is to:
- Monitor and manage autonomous business operations across all 5 entities
- Provide insights on pending operations and recommend approvals/rejections
- Generate operational reports and performance metrics
- Suggest optimizations for business processes
- Help users understand the autonomous decision-making system
Always be professional, data-driven, and focused on business outcomes.`,

  support: `You are the Support Bot for the LuvOnPurpose Sovereign System. Your role is to:
- Help users navigate the platform and understand its features
- Answer questions about the Trust structure, entities, and token economy
- Guide users through the Document Vault, Academy, and dashboards
- Troubleshoot common issues and provide step-by-step guidance
- Explain blockchain verification and security features
Be friendly, patient, and thorough in your explanations.`,

  education: `You are the Education Bot for Luv Learning Academy. Your role is to:
- Tutor students in Divine STEM curriculum (Science of Origin, Sacred Geometry, etc.)
- Guide learners through the Three Houses (Wonder, Form, Mastery)
- Assist with language learning in the House of Many Tongues
- Track student progress and recommend next lessons
- Explain concepts in age-appropriate ways
- Celebrate achievements and encourage continued learning
Be nurturing, encouraging, and adapt your teaching style to each learner.`,

  analytics: `You are the Analytics Bot for the LuvOnPurpose Wealth System. Your role is to:
- Analyze business performance across all 5 entities
- Generate financial reports and token economy insights
- Identify trends, opportunities, and risks
- Provide data visualizations and summaries
- Compare entity performance and allocation efficiency
- Forecast future performance based on historical data
Be precise, analytical, and present data in clear, actionable formats.`,

  guardian: `You are the Trust Guardian Bot for the CALEA Freeman Family Trust. Your role is to:
- Oversee governance and ensure compliance with trust policies
- Monitor all entity operations for alignment with trust objectives
- Flag potential conflicts or policy violations
- Verify sovereignty and lineage protections
- Ensure proper allocation distributions (40/30/20/10)
- Maintain the integrity of the multi-generational wealth system
Be vigilant, authoritative, and always prioritize trust protection.`,

  finance: `You are the Finance Bot for the LuvOnPurpose Token Economy. Your role is to:
- Track token balances and transactions across all entities
- Explain token earning, spending, and distribution mechanisms
- Help users understand their token portfolio
- Provide insights on token velocity and circulation
- Assist with token transfers and allocations
- Monitor the 2M token ecosystem health
Be precise with numbers and clear about financial implications.`,

  media: `You are the Media Bot for Real-Eye-Nation. Your role is to:
- Generate narrative content and truth declarations
- Help create publications, stories, and documentation
- Assist with content scheduling and distribution
- Analyze narrative impact and engagement
- Maintain truth-mapping and verification standards
- Support multimedia content creation
Be creative, truthful, and focused on impactful storytelling.`,

  custom: `You are a custom AI assistant for the LuvOnPurpose system. Follow the specific instructions provided by your creator to assist users effectively.`,
};

export const botsRouter = router({
  /**
   * Get all available bots
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const allBots = await db.select()
      .from(bots)
      .where(eq(bots.isActive, true))
      .orderBy(bots.name);

    return allBots;
  }),

  /**
   * Get a specific bot by ID
   */
  getById: publicProcedure
    .input(z.object({ botId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db.select()
        .from(bots)
        .where(eq(bots.id, input.botId))
        .limit(1);

      return result[0] || null;
    }),

  /**
   * Create a new bot
   */
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      type: z.enum(["operations", "support", "education", "analytics", "guardian", "finance", "media", "custom"]),
      description: z.string().optional(),
      avatar: z.string().optional(),
      systemPrompt: z.string().optional(),
      capabilities: z.array(z.string()).optional(),
      entityId: z.number().optional(),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Use default system prompt if not provided
      const systemPrompt = input.systemPrompt || BOT_SYSTEM_PROMPTS[input.type] || BOT_SYSTEM_PROMPTS.custom;

      await db.insert(bots).values({
        name: input.name,
        type: input.type,
        description: input.description,
        avatar: input.avatar,
        systemPrompt: systemPrompt,
        capabilities: input.capabilities as any,
        entityId: input.entityId,
        isPublic: input.isPublic,
        createdBy: ctx.user.id,
      });

      return { success: true };
    }),

  /**
   * Start a new conversation with a bot
   */
  startConversation: protectedProcedure
    .input(z.object({
      botId: z.number(),
      title: z.string().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const result = await db.insert(botConversations).values({
        botId: input.botId,
        userId: ctx.user.id,
        title: input.title || "New Conversation",
        metadata: input.metadata as any,
      });

      return { 
        success: true, 
        conversationId: result[0].insertId 
      };
    }),

  /**
   * Get user's conversations with a bot
   */
  getConversations: protectedProcedure
    .input(z.object({
      botId: z.number().optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = input.botId
        ? and(eq(botConversations.userId, ctx.user.id), eq(botConversations.botId, input.botId))
        : eq(botConversations.userId, ctx.user.id);

      const conversations = await db.select()
        .from(botConversations)
        .where(conditions)
        .orderBy(desc(botConversations.updatedAt))
        .limit(input.limit);

      return conversations;
    }),

  /**
   * Get messages in a conversation
   */
  getMessages: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      // Verify user owns this conversation
      const conv = await db.select()
        .from(botConversations)
        .where(and(
          eq(botConversations.id, input.conversationId),
          eq(botConversations.userId, ctx.user.id)
        ))
        .limit(1);

      if (!conv.length) return [];

      const messages = await db.select()
        .from(botMessages)
        .where(eq(botMessages.conversationId, input.conversationId))
        .orderBy(botMessages.createdAt)
        .limit(input.limit);

      return messages;
    }),

  /**
   * Send a message to a bot and get a response
   */
  chat: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      message: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get conversation and bot
      const conv = await db.select()
        .from(botConversations)
        .where(and(
          eq(botConversations.id, input.conversationId),
          eq(botConversations.userId, ctx.user.id)
        ))
        .limit(1);

      if (!conv.length) throw new Error("Conversation not found");

      const bot = await db.select()
        .from(bots)
        .where(eq(bots.id, conv[0].botId))
        .limit(1);

      if (!bot.length) throw new Error("Bot not found");

      // Save user message
      await db.insert(botMessages).values({
        conversationId: input.conversationId,
        role: "user",
        content: input.message,
      });

      // Get conversation history for context
      const history = await db.select()
        .from(botMessages)
        .where(eq(botMessages.conversationId, input.conversationId))
        .orderBy(botMessages.createdAt)
        .limit(20);

      // Build context based on bot type
      let contextInfo = "";
      
      if (bot[0].type === "operations" || bot[0].type === "guardian") {
        // Get recent operations for context
        const ops = await db.select()
          .from(autonomousOperations)
          .orderBy(desc(autonomousOperations.createdAt))
          .limit(5);
        contextInfo = `\n\nRecent Operations:\n${ops.map(o => `- ${o.operationType}: ${o.reasoning} (${o.status})`).join("\n")}`;
      }

      if (bot[0].type === "finance" || bot[0].type === "analytics") {
        // Get token info for context
        const tokens = await db.select()
          .from(tokenAccounts)
          .limit(10);
        contextInfo = `\n\nToken Accounts:\n${tokens.map(t => `- User ${t.userId}: ${t.tokenBalance} tokens (earned: ${t.totalEarned}, spent: ${t.totalSpent})`).join("\n")}`;
      }

      if (bot[0].type === "operations" || bot[0].type === "analytics" || bot[0].type === "guardian") {
        // Get entity info
        const entities = await db.select()
          .from(businessEntities)
          .limit(10);
        contextInfo += `\n\nBusiness Entities:\n${entities.map(e => `- ${e.name} (${e.entityType}): ${e.status}`).join("\n")}`;
      }

      // Build messages for LLM
      const llmMessages = [
        { role: "system" as const, content: bot[0].systemPrompt + contextInfo },
        ...history.map(m => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ];

      // Get response from LLM
      const response = await invokeLLM({
        messages: llmMessages,
      });

      const messageContent = response.choices[0]?.message?.content;
      const assistantMessage = typeof messageContent === "string" 
        ? messageContent 
        : "I apologize, but I couldn't generate a response. Please try again.";

      // Save assistant message
      await db.insert(botMessages).values({
        conversationId: input.conversationId,
        role: "assistant",
        content: assistantMessage,
      });

      // Update conversation timestamp
      await db.update(botConversations)
        .set({ updatedAt: new Date() })
        .where(eq(botConversations.id, input.conversationId));

      // Log bot action
      await db.insert(botActions).values({
        botId: bot[0].id,
        conversationId: input.conversationId,
        userId: ctx.user.id,
        actionType: "query",
        description: `Responded to user query: "${input.message.substring(0, 100)}..."`,
        status: "completed",
      });

      return {
        success: true,
        message: assistantMessage,
      };
    }),

  /**
   * Initialize default system bots
   */
  initializeSystemBots: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Check if bots already exist
    const existingBots = await db.select().from(bots).limit(1);
    if (existingBots.length > 0) {
      return { success: true, message: "Bots already initialized" };
    }

    // Create default system bots
    const defaultBots = [
      {
        name: "Operations Bot",
        type: "operations" as const,
        description: "Manages autonomous business operations across all entities. Monitors pending operations, provides insights, and helps optimize business processes.",
        avatar: "🤖",
        systemPrompt: BOT_SYSTEM_PROMPTS.operations,
        capabilities: ["view_operations", "analyze_performance", "recommend_actions", "generate_reports"],
        isPublic: true,
      },
      {
        name: "Support Bot",
        type: "support" as const,
        description: "Your friendly guide to the LuvOnPurpose platform. Get help navigating features, understanding the system, and troubleshooting issues.",
        avatar: "💬",
        systemPrompt: BOT_SYSTEM_PROMPTS.support,
        capabilities: ["answer_questions", "provide_guidance", "explain_features", "troubleshoot"],
        isPublic: true,
      },
      {
        name: "Academy Tutor",
        type: "education" as const,
        description: "Personal tutor for Luv Learning Academy. Get help with Divine STEM subjects, language learning, and track your educational journey.",
        avatar: "📚",
        systemPrompt: BOT_SYSTEM_PROMPTS.education,
        capabilities: ["tutor_subjects", "track_progress", "recommend_lessons", "explain_concepts"],
        isPublic: true,
      },
      {
        name: "Analytics Bot",
        type: "analytics" as const,
        description: "Business intelligence assistant. Analyze performance, generate reports, identify trends, and get data-driven insights.",
        avatar: "📊",
        systemPrompt: BOT_SYSTEM_PROMPTS.analytics,
        capabilities: ["analyze_data", "generate_reports", "identify_trends", "forecast_performance"],
        isPublic: true,
      },
      {
        name: "Trust Guardian",
        type: "guardian" as const,
        description: "Governance oversight for the CALEA Freeman Family Trust. Monitors compliance, protects sovereignty, and ensures proper allocations.",
        avatar: "🛡️",
        systemPrompt: BOT_SYSTEM_PROMPTS.guardian,
        capabilities: ["monitor_governance", "verify_compliance", "protect_sovereignty", "audit_operations"],
        isPublic: true,
      },
      {
        name: "Finance Bot",
        type: "finance" as const,
        description: "Token economy expert. Track balances, understand transactions, manage allocations, and get financial insights.",
        avatar: "💰",
        systemPrompt: BOT_SYSTEM_PROMPTS.finance,
        capabilities: ["track_tokens", "explain_transactions", "manage_allocations", "financial_insights"],
        isPublic: true,
      },
      {
        name: "Media Bot",
        type: "media" as const,
        description: "Content creation assistant for Real-Eye-Nation. Generate narratives, create publications, and manage truth documentation.",
        avatar: "🎬",
        systemPrompt: BOT_SYSTEM_PROMPTS.media,
        capabilities: ["generate_content", "create_narratives", "schedule_publications", "truth_mapping"],
        isPublic: true,
      },
    ];

    for (const botData of defaultBots) {
      await db.insert(bots).values({
        ...botData,
        capabilities: botData.capabilities as any,
        createdBy: ctx.user.id,
      });
    }

    // Create notification
    await db.insert(notifications).values({
      userId: ctx.user.id,
      type: "success",
      title: "AI Bots Initialized",
      message: `Successfully created ${defaultBots.length} AI assistants: Operations, Support, Academy Tutor, Analytics, Trust Guardian, Finance, and Media bots.`,
      actionUrl: "/bots",
      isPriority: true,
    });

    return { 
      success: true, 
      message: `Created ${defaultBots.length} system bots`,
      bots: defaultBots.map(b => b.name),
    };
  }),

  /**
   * Get bot action history
   */
  getActions: protectedProcedure
    .input(z.object({
      botId: z.number().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = input.botId
        ? and(eq(botActions.userId, ctx.user.id), eq(botActions.botId, input.botId))
        : eq(botActions.userId, ctx.user.id);

      const actions = await db.select()
        .from(botActions)
        .where(conditions)
        .orderBy(desc(botActions.createdAt))
        .limit(input.limit);

      return actions;
    }),

  /**
   * Delete a conversation
   */
  deleteConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verify ownership
      const conv = await db.select()
        .from(botConversations)
        .where(and(
          eq(botConversations.id, input.conversationId),
          eq(botConversations.userId, ctx.user.id)
        ))
        .limit(1);

      if (!conv.length) throw new Error("Conversation not found");

      // Delete messages first
      await db.delete(botMessages)
        .where(eq(botMessages.conversationId, input.conversationId));

      // Delete conversation
      await db.delete(botConversations)
        .where(eq(botConversations.id, input.conversationId));

      return { success: true };
    }),
});
