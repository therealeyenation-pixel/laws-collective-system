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
  luvLedgerAccounts,
  scheduledBotTasks
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

  outreach: `You are the Outreach Bot for LuvOnPurpose marketing and community growth. Your role is to:
- Generate compelling social media posts for Twitter/X, Instagram, LinkedIn, and Facebook
- Create email campaign content and newsletter drafts
- Develop promotional materials and announcements
- Craft engagement messages for community building
- Write press releases and media pitches
- Create content calendars and posting schedules
- Generate hashtag strategies and viral content ideas
Be persuasive, authentic, and aligned with the LuvOnPurpose mission of generational wealth and sovereignty.`,

  seo: `You are the SEO Bot for LuvOnPurpose digital optimization. Your role is to:
- Analyze and suggest keywords for website content
- Generate SEO-optimized titles, meta descriptions, and headers
- Create content briefs for high-ranking articles
- Audit existing content for SEO improvements
- Suggest internal linking strategies
- Monitor competitor keywords and strategies
- Generate schema markup recommendations
- Create FAQ content for featured snippets
Be technical, data-driven, and focused on organic search visibility.`,

  engagement: `You are the Engagement Bot for LuvOnPurpose audience analytics. Your role is to:
- Analyze visitor behavior and engagement patterns
- Suggest optimal posting times for different platforms
- Create A/B testing strategies for content
- Generate audience persona insights
- Track and report on key engagement metrics
- Recommend content types based on performance data
- Identify trending topics relevant to the community
- Suggest community engagement activities and events
Be analytical, strategic, and focused on building lasting audience relationships.`,

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
      type: z.enum(["operations", "support", "education", "analytics", "guardian", "finance", "media", "outreach", "seo", "engagement", "custom"]),
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
      {
        name: "Outreach Bot",
        type: "outreach" as const,
        description: "Marketing and community growth assistant. Generate social media posts, email campaigns, and promotional content to expand your reach.",
        avatar: "📢",
        systemPrompt: BOT_SYSTEM_PROMPTS.outreach,
        capabilities: ["social_media_posts", "email_campaigns", "press_releases", "content_calendar", "hashtag_strategy"],
        isPublic: true,
      },
      {
        name: "SEO Bot",
        type: "seo" as const,
        description: "Search engine optimization expert. Improve your website visibility with keyword analysis, meta descriptions, and content optimization.",
        avatar: "🔍",
        systemPrompt: BOT_SYSTEM_PROMPTS.seo,
        capabilities: ["keyword_research", "meta_optimization", "content_audit", "schema_markup", "competitor_analysis"],
        isPublic: true,
      },
      {
        name: "Engagement Bot",
        type: "engagement" as const,
        description: "Audience analytics and engagement strategist. Optimize posting times, track metrics, and build lasting audience relationships.",
        avatar: "📈",
        systemPrompt: BOT_SYSTEM_PROMPTS.engagement,
        capabilities: ["analytics_tracking", "posting_optimization", "ab_testing", "audience_insights", "trend_identification"],
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

  /**
   * Get scheduled tasks for a bot or all bots
   */
  getScheduledTasks: protectedProcedure
    .input(z.object({
      botId: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = input?.botId
        ? and(eq(scheduledBotTasks.createdBy, ctx.user.id), eq(scheduledBotTasks.botId, input.botId))
        : eq(scheduledBotTasks.createdBy, ctx.user.id);

      const tasks = await db.select()
        .from(scheduledBotTasks)
        .where(conditions)
        .orderBy(desc(scheduledBotTasks.createdAt));

      return tasks;
    }),

  /**
   * Create a scheduled task
   */
  createScheduledTask: protectedProcedure
    .input(z.object({
      botId: z.number(),
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      taskType: z.enum([
        "daily_report",
        "weekly_audit",
        "monthly_analysis",
        "content_schedule",
        "engagement_check",
        "seo_audit",
        "token_report",
        "operation_review",
        "custom"
      ]),
      prompt: z.string().min(1),
      schedule: z.string().min(1), // Cron expression
      notifyOnComplete: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Calculate next run time based on schedule
      const now = new Date();
      
      await db.insert(scheduledBotTasks).values({
        botId: input.botId,
        name: input.name,
        description: input.description,
        taskType: input.taskType,
        prompt: input.prompt,
        schedule: input.schedule,
        nextRunAt: now, // Will be updated by scheduler
        createdBy: ctx.user.id,
        notifyOnComplete: input.notifyOnComplete,
      });

      return { success: true };
    }),

  /**
   * Toggle scheduled task active status
   */
  toggleScheduledTask: protectedProcedure
    .input(z.object({
      taskId: z.number(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.update(scheduledBotTasks)
        .set({ isActive: input.isActive })
        .where(and(
          eq(scheduledBotTasks.id, input.taskId),
          eq(scheduledBotTasks.createdBy, ctx.user.id)
        ));

      return { success: true };
    }),

  /**
   * Delete a scheduled task
   */
  deleteScheduledTask: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.delete(scheduledBotTasks)
        .where(and(
          eq(scheduledBotTasks.id, input.taskId),
          eq(scheduledBotTasks.createdBy, ctx.user.id)
        ));

      return { success: true };
    }),

  /**
   * Run a scheduled task manually
   */
  runScheduledTask: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get the task
      const [task] = await db.select()
        .from(scheduledBotTasks)
        .where(and(
          eq(scheduledBotTasks.id, input.taskId),
          eq(scheduledBotTasks.createdBy, ctx.user.id)
        ))
        .limit(1);

      if (!task) throw new Error("Task not found");

      // Get the bot
      const [bot] = await db.select()
        .from(bots)
        .where(eq(bots.id, task.botId))
        .limit(1);

      if (!bot) throw new Error("Bot not found");

      // Get context data based on task type
      let contextData = "";
      
      if (task.taskType === "daily_report" || task.taskType === "operation_review") {
        const ops = await db.select()
          .from(autonomousOperations)
          .orderBy(desc(autonomousOperations.createdAt))
          .limit(10);
        contextData = `Recent Operations: ${JSON.stringify(ops.map(o => ({ type: o.operationType, status: o.status, entity: o.businessEntityId })))}`;
      } else if (task.taskType === "token_report") {
        const tokens = await db.select()
          .from(tokenAccounts)
          .limit(10);
        contextData = `Token Accounts: ${JSON.stringify(tokens.map(t => ({ user: t.userId, balance: t.tokenBalance })))}`;
      } else if (task.taskType === "weekly_audit" || task.taskType === "monthly_analysis") {
        const entities = await db.select()
          .from(businessEntities)
          .limit(10);
        contextData = `Business Entities: ${JSON.stringify(entities.map(e => ({ name: e.name, type: e.entityType })))}`;
      }

      // Run the task using LLM
      const response = await invokeLLM({
        messages: [
          { role: "system", content: bot.systemPrompt },
          { role: "user", content: `${task.prompt}\n\nContext:\n${contextData}\n\nPlease provide a comprehensive response for this ${task.taskType.replace("_", " ")}.` }
        ],
      });

      const result = typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : JSON.stringify(response.choices[0].message.content);

      // Update task with result
      const resultHistory = (task.resultHistory as any[] || []).slice(-9); // Keep last 10
      resultHistory.push({
        runAt: new Date().toISOString(),
        result: result.substring(0, 1000), // Truncate for storage
      });

      await db.update(scheduledBotTasks)
        .set({
          lastRunAt: new Date(),
          resultHistory: resultHistory as any,
        })
        .where(eq(scheduledBotTasks.id, input.taskId));

      // Create notification if enabled
      if (task.notifyOnComplete) {
        await db.insert(notifications).values({
          userId: ctx.user.id,
          type: "info",
          title: `Scheduled Task Complete: ${task.name}`,
          message: result.substring(0, 200) + (result.length > 200 ? "..." : ""),
          actionUrl: "/bots",
        });
      }

      // Log the action
      await db.insert(botActions).values({
        botId: task.botId,
        userId: ctx.user.id,
        actionType: "analyze",
        targetType: "scheduled_task",
        targetId: task.id,
        description: `Ran scheduled task: ${task.name}`,
        result: { output: result.substring(0, 500) } as any,
        status: "completed",
      });

      return { success: true, result };
    }),

  /**
   * Initialize default scheduled tasks for system bots
   */
  initializeDefaultTasks: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Check if tasks already exist
    const existingTasks = await db.select()
      .from(scheduledBotTasks)
      .where(eq(scheduledBotTasks.createdBy, ctx.user.id))
      .limit(1);

    if (existingTasks.length > 0) {
      return { success: true, message: "Tasks already initialized" };
    }

    // Get system bots
    const systemBots = await db.select().from(bots);
    const botMap = new Map(systemBots.map(b => [b.type, b.id]));

    const defaultTasks = [
      {
        botId: botMap.get("operations"),
        name: "Daily Operations Report",
        description: "Generate a daily summary of all autonomous operations",
        taskType: "daily_report" as const,
        prompt: "Generate a comprehensive daily report of all autonomous operations. Include: pending operations, completed operations, any issues or alerts, and recommendations for tomorrow.",
        schedule: "0 9 * * *", // 9 AM daily
      },
      {
        botId: botMap.get("analytics"),
        name: "Weekly Performance Audit",
        description: "Weekly analysis of business performance across all entities",
        taskType: "weekly_audit" as const,
        prompt: "Conduct a weekly audit of business performance. Analyze: entity performance metrics, token circulation, operation success rates, and provide strategic recommendations.",
        schedule: "0 10 * * 1", // 10 AM every Monday
      },
      {
        botId: botMap.get("finance"),
        name: "Token Economy Report",
        description: "Daily token balance and transaction summary",
        taskType: "token_report" as const,
        prompt: "Generate a token economy report. Include: total tokens in circulation, entity balances, recent transactions, and any anomalies in token flow.",
        schedule: "0 8 * * *", // 8 AM daily
      },
      {
        botId: botMap.get("guardian"),
        name: "Monthly Governance Review",
        description: "Monthly compliance and governance analysis",
        taskType: "monthly_analysis" as const,
        prompt: "Conduct a monthly governance review. Check: trust compliance, allocation distributions, sovereignty protections, and flag any policy concerns.",
        schedule: "0 9 1 * *", // 9 AM on 1st of each month
      },
      {
        botId: botMap.get("outreach"),
        name: "Content Calendar Update",
        description: "Generate weekly social media content suggestions",
        taskType: "content_schedule" as const,
        prompt: "Create a content calendar for the upcoming week. Include: 7 social media post ideas, 2 email newsletter topics, and 1 blog post outline. Focus on community engagement and brand awareness.",
        schedule: "0 8 * * 0", // 8 AM every Sunday
      },
      {
        botId: botMap.get("seo"),
        name: "SEO Health Check",
        description: "Weekly SEO audit and recommendations",
        taskType: "seo_audit" as const,
        prompt: "Perform an SEO health check. Analyze: current keyword rankings, content optimization opportunities, meta description improvements, and competitor insights.",
        schedule: "0 7 * * 2", // 7 AM every Tuesday
      },
      {
        botId: botMap.get("engagement"),
        name: "Engagement Metrics Review",
        description: "Daily engagement analysis and optimization tips",
        taskType: "engagement_check" as const,
        prompt: "Review engagement metrics. Analyze: best performing content, optimal posting times, audience growth trends, and provide 3 actionable recommendations to boost engagement.",
        schedule: "0 18 * * *", // 6 PM daily
      },
    ];

    let created = 0;
    for (const task of defaultTasks) {
      if (task.botId) {
        await db.insert(scheduledBotTasks).values({
          botId: task.botId,
          name: task.name,
          description: task.description,
          taskType: task.taskType,
          prompt: task.prompt,
          schedule: task.schedule,
          createdBy: ctx.user.id,
          notifyOnComplete: true,
        });
        created++;
      }
    }

    return { success: true, message: `Created ${created} scheduled tasks` };
  }),
});
