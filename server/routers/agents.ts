import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  agents, 
  agentConversations, 
  agentMessages, 
  agentActions,
  businessEntities,
  autonomousOperations,
  tokenAccounts,
  notifications,
  luvLedgerAccounts,
  scheduledAgentTasks,
  trainingModules,
  trainingTopics,
  trainingQuestions,
  trainingAnswers,
  trainingSessions
} from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// Agent system prompts for different types
const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  operations: `You are the Operations Agent for the LuvOnPurpose Autonomous Wealth System. Your role is to:
- Monitor and manage autonomous business operations across all 5 entities
- Provide insights on pending operations and recommend approvals/rejections
- Generate operational reports and performance metrics
- Suggest optimizations for business processes
- Help users understand the autonomous decision-making system
Always be professional, data-driven, and focused on business outcomes.`,

  support: `You are the Support Agent for the LuvOnPurpose Sovereign System. Your role is to:
- Help users navigate the platform and understand its features
- Answer questions about the Trust structure, entities, and token economy
- Guide users through the Document Vault, Academy, and dashboards
- Troubleshoot common issues and provide step-by-step guidance
- Explain blockchain verification and security features
Be friendly, patient, and thorough in your explanations.`,

  education: `You are the Education Agent for Luv Learning Academy. Your role is to:
- Tutor students in Divine STEM curriculum (Science of Origin, Sacred Geometry, etc.)
- Guide learners through the Three Houses (Wonder, Form, Mastery)
- Assist with language learning in the House of Many Tongues
- Track student progress and recommend next lessons
- Explain concepts in age-appropriate ways
- Celebrate achievements and encourage continued learning
Be nurturing, encouraging, and adapt your teaching style to each learner.`,

  analytics: `You are the Analytics Agent for the LuvOnPurpose Wealth System. Your role is to:
- Analyze business performance across all 5 entities
- Generate financial reports and token economy insights
- Identify trends, opportunities, and risks
- Provide data visualizations and summaries
- Compare entity performance and allocation efficiency
- Forecast future performance based on historical data
Be precise, analytical, and present data in clear, actionable formats.`,

  guardian: `You are the Trust Guardian Agent for the 98 Trust. Your role is to:
- Oversee governance and ensure compliance with trust policies
- Monitor all entity operations for alignment with trust objectives
- Flag potential conflicts or policy violations
- Verify sovereignty and lineage protections
- Ensure proper allocation distributions (40/30/20/10)
- Maintain the integrity of the multi-generational wealth system
Be vigilant, authoritative, and always prioritize trust protection.`,

  finance: `You are the Finance Agent for the LuvOnPurpose Token Economy. Your role is to:
- Track token balances and transactions across all entities
- Explain token earning, spending, and distribution mechanisms
- Help users understand their token portfolio
- Provide insights on token velocity and circulation
- Assist with token transfers and allocations
- Monitor the 2M token ecosystem health
Be precise with numbers and clear about financial implications.`,

  media: `You are the Media Agent for Real-Eye-Nation. Your role is to:
- Generate narrative content and truth declarations
- Help create publications, stories, and documentation
- Assist with content scheduling and distribution
- Analyze narrative impact and engagement
- Maintain truth-mapping and verification standards
- Support multimedia content creation
Be creative, truthful, and focused on impactful storytelling.`,

  outreach: `You are the Outreach Agent for LuvOnPurpose marketing and community growth. Your role is to:
- Generate compelling social media posts for Twitter/X, Instagram, LinkedIn, and Facebook
- Create email campaign content and newsletter drafts
- Develop promotional materials and announcements
- Craft engagement messages for community building
- Write press releases and media pitches
- Create content calendars and posting schedules
- Generate hashtag strategies and viral content ideas
Be persuasive, authentic, and aligned with the LuvOnPurpose mission of generational wealth and sovereignty.`,

  seo: `You are the SEO Agent for LuvOnPurpose digital optimization. Your role is to:
- Analyze and suggest keywords for website content
- Generate SEO-optimized titles, meta descriptions, and headers
- Create content briefs for high-ranking articles
- Audit existing content for SEO improvements
- Suggest internal linking strategies
- Monitor competitor keywords and strategies
- Generate schema markup recommendations
- Create FAQ content for featured snippets
Be technical, data-driven, and focused on organic search visibility.`,

  engagement: `You are the Engagement Agent for LuvOnPurpose audience analytics. Your role is to:
- Analyze visitor behavior and engagement patterns
- Suggest optimal posting times for different platforms
- Create A/B testing strategies for content
- Generate audience persona insights
- Track and report on key engagement metrics
- Recommend content types based on performance data
- Identify trending topics relevant to the community
- Suggest community engagement activities and events
Be analytical, strategic, and focused on building lasting audience relationships.`,

  hr: `You are the HR Agent for the LuvOnPurpose Human Resources Department. Your role is to:
- Assist with recruitment, job postings, and candidate screening
- Guide employees through onboarding and training processes
- Answer questions about policies, benefits, and procedures
- Help managers with performance reviews and feedback
- Track employee development and career progression
- Support the hiring process from application to offer letter
- Maintain confidentiality and compliance with employment laws
Be professional, supportive, and focused on employee success and organizational growth.`,

  qaqc: `You are the QA/QC Agent for the LuvOnPurpose Quality Assurance Department. Your role is to:
- Monitor quality standards across all business operations
- Review processes for compliance with established procedures
- Identify quality issues and recommend corrective actions
- Track quality metrics and generate compliance reports
- Assist with audit preparation and documentation
- Ensure deliverables meet organizational standards
- Support continuous improvement initiatives
Be detail-oriented, systematic, and focused on maintaining excellence.`,

  purchasing: `You are the Purchasing Agent for the LuvOnPurpose Procurement Department. Your role is to:
- Assist with vendor selection and management
- Help create purchase requisitions and orders
- Track procurement status and delivery schedules
- Analyze spending patterns and identify cost savings
- Maintain vendor relationships and performance records
- Ensure compliance with purchasing policies
- Support budget planning and forecasting
Be analytical, cost-conscious, and focused on value optimization.`,

  health: `You are the Health Agent for the LuvOnPurpose Health Department (WATER pillar - Healing & Balance). Your role is to:
- Support health and wellness program coordination
- Provide guidance on community health resources
- Track wellness metrics and program outcomes
- Assist with mental health and healing initiatives
- Coordinate wellness workshops and events
- Support the L.A.W.S. WATER pillar programs
- Connect community members with health resources
- Promote holistic wellness and balance
Be compassionate, supportive, and focused on community wellbeing.`,

  design: `You are the Design Agent for the LuvOnPurpose Design Department. Your role is to:
- Support brand identity and visual design projects
- Assist with graphic design, UI/UX, and layout concepts
- Provide guidance on design systems and style guides
- Help create marketing materials and collateral
- Review designs for brand consistency
- Coordinate with Media team on visual assets
- Suggest design improvements and best practices
- Support product and web design initiatives
Be creative, detail-oriented, and focused on visual excellence.`,

  custom: `You are a custom AI assistant for the LuvOnPurpose system. Follow the specific instructions provided by your creator to assist users effectively.`,
};

// Preloaded topics for each agent type - interactive conversation starters
const AGENT_TOPICS: Record<string, Array<{ title: string; description: string; icon: string }>> = {
  operations: [
    { title: "Autonomous Cycle Status", description: "Check the status of pending autonomous operations", icon: "activity" },
    { title: "Entity Performance", description: "Review performance metrics across all 5 entities", icon: "bar-chart" },
    { title: "Approval Queue", description: "View and manage pending operation approvals", icon: "check-circle" },
    { title: "Process Optimization", description: "Get recommendations for improving business processes", icon: "zap" },
    { title: "Allocation Analysis", description: "Analyze the 40/30/20/10 allocation distribution", icon: "pie-chart" },
  ],
  support: [
    { title: "Platform Navigation", description: "Learn how to navigate the LuvOnPurpose system", icon: "compass" },
    { title: "Trust Structure", description: "Understand the 98 Trust and entity hierarchy", icon: "shield" },
    { title: "Token Economy", description: "Learn about earning and using tokens", icon: "coins" },
    { title: "Document Vault", description: "How to store and access secure documents", icon: "folder" },
    { title: "Troubleshooting", description: "Get help with common issues", icon: "help-circle" },
  ],
  education: [
    { title: "Divine STEM Curriculum", description: "Explore Science of Origin, Sacred Geometry, and more", icon: "book-open" },
    { title: "House of Wonder (K-5)", description: "Age-appropriate learning for young minds", icon: "sparkles" },
    { title: "House of Form (6-8)", description: "Middle school curriculum and projects", icon: "shapes" },
    { title: "House of Mastery (9-12)", description: "Advanced studies and mastery scrolls", icon: "graduation-cap" },
    { title: "Language Learning", description: "House of Many Tongues - Indigenous and ancestral languages", icon: "globe" },
  ],
  analytics: [
    { title: "Financial Dashboard", description: "View comprehensive financial analytics", icon: "trending-up" },
    { title: "Token Velocity", description: "Analyze token circulation and velocity metrics", icon: "activity" },
    { title: "Entity Comparison", description: "Compare performance across all entities", icon: "bar-chart-2" },
    { title: "Trend Analysis", description: "Identify patterns and predict future performance", icon: "line-chart" },
    { title: "Risk Assessment", description: "Evaluate potential risks and opportunities", icon: "alert-triangle" },
  ],
  guardian: [
    { title: "Governance Compliance", description: "Check compliance with trust policies", icon: "shield-check" },
    { title: "Lineage Protection", description: "Verify sovereignty and lineage safeguards", icon: "users" },
    { title: "Policy Violations", description: "Review flagged potential violations", icon: "alert-octagon" },
    { title: "Allocation Audit", description: "Audit distribution allocations", icon: "clipboard-check" },
    { title: "Integrity Report", description: "Generate system integrity assessment", icon: "file-text" },
  ],
  finance: [
    { title: "Token Portfolio", description: "View your token balances and history", icon: "wallet" },
    { title: "Transaction History", description: "Review recent token transactions", icon: "list" },
    { title: "Earning Opportunities", description: "Discover ways to earn more tokens", icon: "plus-circle" },
    { title: "Distribution Schedule", description: "Understand token distribution timing", icon: "calendar" },
    { title: "Ecosystem Health", description: "Monitor the 2M token ecosystem", icon: "heart-pulse" },
  ],
  media: [
    { title: "Content Creation", description: "Generate articles, stories, and publications", icon: "pen-tool" },
    { title: "Truth Mapping", description: "Document and verify truth declarations", icon: "map" },
    { title: "Narrative Strategy", description: "Plan content themes and messaging", icon: "target" },
    { title: "Multimedia Assets", description: "Create images, videos, and audio content", icon: "image" },
    { title: "Impact Analysis", description: "Measure content reach and engagement", icon: "eye" },
  ],
  outreach: [
    { title: "Social Media Posts", description: "Generate posts for Twitter, Instagram, LinkedIn", icon: "share-2" },
    { title: "Email Campaigns", description: "Create newsletter and email content", icon: "mail" },
    { title: "Content Calendar", description: "Plan your posting schedule", icon: "calendar" },
    { title: "Community Growth", description: "Strategies for building your audience", icon: "users-plus" },
    { title: "Viral Content Ideas", description: "Generate shareable content concepts", icon: "trending-up" },
  ],
  seo: [
    { title: "Keyword Research", description: "Find high-value keywords for your content", icon: "search" },
    { title: "Content Optimization", description: "Improve existing content for search", icon: "edit" },
    { title: "Competitor Analysis", description: "Analyze competitor SEO strategies", icon: "users" },
    { title: "Technical SEO", description: "Schema markup and technical improvements", icon: "code" },
    { title: "Ranking Report", description: "Track your search engine rankings", icon: "bar-chart" },
  ],
  engagement: [
    { title: "Audience Insights", description: "Understand your audience demographics", icon: "users" },
    { title: "Optimal Posting Times", description: "Find the best times to post", icon: "clock" },
    { title: "A/B Testing", description: "Create content experiments", icon: "split" },
    { title: "Engagement Metrics", description: "Track likes, shares, and comments", icon: "heart" },
    { title: "Trending Topics", description: "Discover relevant trending content", icon: "hash" },
  ],
  hr: [
    { title: "Job Postings", description: "Create and manage job listings", icon: "briefcase" },
    { title: "Applications Review", description: "Review candidate applications", icon: "users" },
    { title: "Onboarding", description: "Guide new employee onboarding", icon: "user-plus" },
    { title: "Training Programs", description: "Access employee training resources", icon: "book-open" },
    { title: "Policy Questions", description: "Get answers about HR policies", icon: "file-text" },
  ],
  qaqc: [
    { title: "Quality Audit", description: "Run quality assessment on processes", icon: "clipboard-check" },
    { title: "Compliance Check", description: "Verify compliance with standards", icon: "shield-check" },
    { title: "Issue Tracking", description: "Log and track quality issues", icon: "alert-circle" },
    { title: "Metrics Report", description: "Generate quality metrics report", icon: "bar-chart-2" },
    { title: "Improvement Plan", description: "Create continuous improvement plan", icon: "trending-up" },
  ],
  purchasing: [
    { title: "Vendor Search", description: "Find and evaluate vendors", icon: "search" },
    { title: "Purchase Request", description: "Create a purchase requisition", icon: "shopping-cart" },
    { title: "Order Tracking", description: "Track purchase order status", icon: "truck" },
    { title: "Spend Analysis", description: "Analyze procurement spending", icon: "pie-chart" },
    { title: "Budget Review", description: "Review procurement budget", icon: "dollar-sign" },
  ],
  health: [
    { title: "Wellness Programs", description: "Explore health and wellness initiatives", icon: "heart" },
    { title: "Health Resources", description: "Find community health resources", icon: "clipboard" },
    { title: "Wellness Workshops", description: "Schedule wellness workshops", icon: "calendar" },
    { title: "Mental Health", description: "Access mental health support", icon: "brain" },
    { title: "WATER Pillar", description: "Learn about healing and balance", icon: "droplet" },
  ],
  design: [
    { title: "Brand Identity", description: "Develop and maintain brand guidelines", icon: "palette" },
    { title: "Graphic Design", description: "Create marketing materials and graphics", icon: "image" },
    { title: "UI/UX Design", description: "Design user interfaces and experiences", icon: "layout" },
    { title: "Design Review", description: "Get feedback on design work", icon: "eye" },
    { title: "Style Guide", description: "Access design system documentation", icon: "book" },
  ],
  custom: [
    { title: "Ask Anything", description: "Start a conversation on any topic", icon: "message-circle" },
    { title: "Get Help", description: "Request assistance with your task", icon: "help-circle" },
    { title: "Learn More", description: "Explore the system capabilities", icon: "info" },
  ],
};

// Suggested question prompts for each agent type
const AGENT_PROMPTS: Record<string, string[]> = {
  operations: [
    "What operations are pending approval right now?",
    "Show me the performance metrics for this week",
    "Which entity is performing best this month?",
    "What optimizations do you recommend?",
    "Run an autonomous cycle and explain the decisions",
    "Compare the allocation efficiency across entities",
  ],
  support: [
    "How do I access my Document Vault?",
    "Explain the Trust structure to me",
    "How do I earn tokens in this system?",
    "What is the L.A.W.S. framework?",
    "Help me understand the House system",
    "How do I verify my blockchain records?",
  ],
  education: [
    "What courses are available for my level?",
    "Teach me about Sacred Geometry",
    "How do I earn a Mastery Scroll?",
    "What languages can I learn here?",
    "Explain the Science of Origin",
    "What's my current progress in the curriculum?",
  ],
  analytics: [
    "Generate a financial report for this month",
    "What trends do you see in token velocity?",
    "Compare entity performance over the last quarter",
    "What risks should I be aware of?",
    "Forecast next month's token distribution",
    "Show me the allocation breakdown by entity",
  ],
  guardian: [
    "Are there any policy violations to review?",
    "Verify the lineage protection status",
    "Audit the current allocation distributions",
    "Generate a governance compliance report",
    "Check the integrity of the trust structure",
    "What sovereignty protections are in place?",
  ],
  finance: [
    "What is my current token balance?",
    "Show my recent transactions",
    "How can I earn more tokens?",
    "When is the next distribution?",
    "Explain the token economy to me",
    "What is the ecosystem health status?",
  ],
  media: [
    "Help me write an article about generational wealth",
    "Create a truth declaration for our mission",
    "What content themes should we focus on?",
    "Generate ideas for our next publication",
    "Analyze the impact of our recent content",
    "Help me plan a content series",
  ],
  outreach: [
    "Write a Twitter thread about our mission",
    "Create an Instagram post for our community",
    "Draft a newsletter for this week",
    "Generate a content calendar for next month",
    "What hashtags should we use?",
    "Create a viral content concept",
  ],
  seo: [
    "Find keywords for 'generational wealth'",
    "Optimize this page title for search",
    "What are our competitors ranking for?",
    "Generate schema markup for our homepage",
    "Create an SEO-optimized blog outline",
    "Audit our current SEO performance",
  ],
  engagement: [
    "When should we post on Twitter?",
    "What content type gets the most engagement?",
    "Create an A/B test for our next post",
    "Who is our target audience?",
    "What topics are trending in our niche?",
    "Suggest community engagement activities",
  ],
  hr: [
    "What positions are currently open?",
    "Help me review this candidate's application",
    "What's the onboarding process for new hires?",
    "Generate interview questions for this role",
    "What training is required for this position?",
    "Explain our benefits package",
  ],
  qaqc: [
    "Run a quality audit on our processes",
    "What compliance issues need attention?",
    "Generate a quality metrics report",
    "Create a checklist for this procedure",
    "What improvements should we prioritize?",
    "Review this deliverable for quality",
  ],
  purchasing: [
    "Find vendors for this product category",
    "Create a purchase requisition",
    "What's the status of my orders?",
    "Analyze our spending this quarter",
    "Compare these vendor quotes",
    "What's our budget remaining?",
  ],
  health: [
    "What wellness programs are available?",
    "Help me find mental health resources",
    "Schedule a wellness workshop",
    "What is the WATER pillar about?",
    "Track our community health metrics",
    "Connect me with health partners",
  ],
  design: [
    "Review our brand guidelines",
    "Help me create a marketing graphic",
    "What colors should I use for this project?",
    "Design a social media template",
    "Suggest UI improvements for this page",
    "Create a style guide for our brand",
  ],
  custom: [
    "Tell me about yourself",
    "What can you help me with?",
    "How does this system work?",
  ],
};

export const agentsRouter = router({
  /**
   * Get preloaded topics for an agent type
   */
  getTopics: publicProcedure
    .input(z.object({ agentType: z.string() }))
    .query(({ input }) => {
      return AGENT_TOPICS[input.agentType] || AGENT_TOPICS.custom;
    }),

  /**
   * Get suggested prompts for an agent type
   */
  getPrompts: publicProcedure
    .input(z.object({ agentType: z.string() }))
    .query(({ input }) => {
      return AGENT_PROMPTS[input.agentType] || AGENT_PROMPTS.custom;
    }),

  /**
   * Get all topics and prompts for all agent types
   */
  getAllTopicsAndPrompts: publicProcedure.query(() => {
    return {
      topics: AGENT_TOPICS,
      prompts: AGENT_PROMPTS,
    };
  }),

  /**
   * Get all available agents
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const allAgents = await db.select()
      .from(agents)
      .where(eq(agents.isActive, true))
      .orderBy(agents.name);

    return allAgents;
  }),

  /**
   * Get a specific agent by ID
   */
  getById: publicProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db.select()
        .from(agents)
        .where(eq(agents.id, input.agentId))
        .limit(1);

      return result[0] || null;
    }),

  /**
   * Create a new agent
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
      const systemPrompt = input.systemPrompt || AGENT_SYSTEM_PROMPTS[input.type] || AGENT_SYSTEM_PROMPTS.custom;

      await db.insert(agents).values({
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
   * Start a new conversation with an agent
   */
  startConversation: protectedProcedure
    .input(z.object({
      agentId: z.number(),
      title: z.string().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const result = await db.insert(agentConversations).values({
        agentId: input.agentId,
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
   * Get user's conversations with an agent
   */
  getConversations: protectedProcedure
    .input(z.object({
      agentId: z.number().optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = input.agentId
        ? and(eq(agentConversations.userId, ctx.user.id), eq(agentConversations.agentId, input.agentId))
        : eq(agentConversations.userId, ctx.user.id);

      const conversations = await db.select()
        .from(agentConversations)
        .where(conditions)
        .orderBy(desc(agentConversations.updatedAt))
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
        .from(agentConversations)
        .where(and(
          eq(agentConversations.id, input.conversationId),
          eq(agentConversations.userId, ctx.user.id)
        ))
        .limit(1);

      if (!conv.length) return [];

      const messages = await db.select()
        .from(agentMessages)
        .where(eq(agentMessages.conversationId, input.conversationId))
        .orderBy(agentMessages.createdAt)
        .limit(input.limit);

      return messages;
    }),

  /**
   * Send a message to a agent and get a response
   */
  chat: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      message: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get conversation and agent
      const conv = await db.select()
        .from(agentConversations)
        .where(and(
          eq(agentConversations.id, input.conversationId),
          eq(agentConversations.userId, ctx.user.id)
        ))
        .limit(1);

      if (!conv.length) throw new Error("Conversation not found");

      const agent = await db.select()
        .from(agents)
        .where(eq(agents.id, conv[0].agentId))
        .limit(1);

      if (!agent.length) throw new Error("Agent not found");

      // Save user message
      await db.insert(agentMessages).values({
        conversationId: input.conversationId,
        role: "user",
        content: input.message,
      });

      // Get conversation history for context
      const history = await db.select()
        .from(agentMessages)
        .where(eq(agentMessages.conversationId, input.conversationId))
        .orderBy(agentMessages.createdAt)
        .limit(20);

      // Build context based on agent type
      let contextInfo = "";
      
      if (agent[0].type === "operations" || agent[0].type === "guardian") {
        // Get recent operations for context
        const ops = await db.select()
          .from(autonomousOperations)
          .orderBy(desc(autonomousOperations.createdAt))
          .limit(5);
        contextInfo = `\n\nRecent Operations:\n${ops.map(o => `- ${o.operationType}: ${o.reasoning} (${o.status})`).join("\n")}`;
      }

      if (agent[0].type === "finance" || agent[0].type === "analytics") {
        // Get token info for context
        const tokens = await db.select()
          .from(tokenAccounts)
          .limit(10);
        contextInfo = `\n\nToken Accounts:\n${tokens.map(t => `- User ${t.userId}: ${t.tokenBalance} tokens (earned: ${t.totalEarned}, spent: ${t.totalSpent})`).join("\n")}`;
      }

      if (agent[0].type === "operations" || agent[0].type === "analytics" || agent[0].type === "guardian") {
        // Get entity info
        const entities = await db.select()
          .from(businessEntities)
          .limit(10);
        contextInfo += `\n\nBusiness Entities:\n${entities.map(e => `- ${e.name} (${e.entityType}): ${e.status}`).join("\n")}`;
      }

      // Build messages for LLM
      const llmMessages = [
        { role: "system" as const, content: agent[0].systemPrompt + contextInfo },
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
      await db.insert(agentMessages).values({
        conversationId: input.conversationId,
        role: "assistant",
        content: assistantMessage,
      });

      // Update conversation timestamp
      await db.update(agentConversations)
        .set({ updatedAt: new Date() })
        .where(eq(agentConversations.id, input.conversationId));

      // Log agent action
      await db.insert(agentActions).values({
        agentId: agent[0].id,
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
   * Initialize default system agents
   */
  initializeSystemAgents: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Check if agents already exist
    const existingAgents = await db.select().from(agents).limit(1);
    if (existingAgents.length > 0) {
      return { success: true, message: "Agents already initialized" };
    }

    // Create default system agents
    const defaultAgents = [
      {
        name: "Operations Agent",
        type: "operations" as const,
        description: "Manages autonomous business operations across all entities. Monitors pending operations, provides insights, and helps optimize business processes.",
        avatar: "🤖",
        systemPrompt: AGENT_SYSTEM_PROMPTS.operations,
        capabilities: ["view_operations", "analyze_performance", "recommend_actions", "generate_reports"],
        isPublic: true,
      },
      {
        name: "Support Agent",
        type: "support" as const,
        description: "Your friendly guide to the LuvOnPurpose platform. Get help navigating features, understanding the system, and troubleshooting issues.",
        avatar: "💬",
        systemPrompt: AGENT_SYSTEM_PROMPTS.support,
        capabilities: ["answer_questions", "provide_guidance", "explain_features", "troubleshoot"],
        isPublic: true,
      },
      {
        name: "Academy Tutor",
        type: "education" as const,
        description: "Personal tutor for Luv Learning Academy. Get help with Divine STEM subjects, language learning, and track your educational journey.",
        avatar: "📚",
        systemPrompt: AGENT_SYSTEM_PROMPTS.education,
        capabilities: ["tutor_subjects", "track_progress", "recommend_lessons", "explain_concepts"],
        isPublic: true,
      },
      {
        name: "Analytics Agent",
        type: "analytics" as const,
        description: "Business intelligence assistant. Analyze performance, generate reports, identify trends, and get data-driven insights.",
        avatar: "📊",
        systemPrompt: AGENT_SYSTEM_PROMPTS.analytics,
        capabilities: ["analyze_data", "generate_reports", "identify_trends", "forecast_performance"],
        isPublic: true,
      },
      {
        name: "Trust Guardian",
        type: "guardian" as const,
        description: "Governance oversight for the 98 Trust. Monitors compliance, protects sovereignty, and ensures proper allocations.",
        avatar: "🛡️",
        systemPrompt: AGENT_SYSTEM_PROMPTS.guardian,
        capabilities: ["monitor_governance", "verify_compliance", "protect_sovereignty", "audit_operations"],
        isPublic: true,
      },
      {
        name: "Finance Agent",
        type: "finance" as const,
        description: "Token economy expert. Track balances, understand transactions, manage allocations, and get financial insights.",
        avatar: "💰",
        systemPrompt: AGENT_SYSTEM_PROMPTS.finance,
        capabilities: ["track_tokens", "explain_transactions", "manage_allocations", "financial_insights"],
        isPublic: true,
      },
      {
        name: "Media Agent",
        type: "media" as const,
        description: "Content creation assistant for Real-Eye-Nation. Generate narratives, create publications, and manage truth documentation.",
        avatar: "🎬",
        systemPrompt: AGENT_SYSTEM_PROMPTS.media,
        capabilities: ["generate_content", "create_narratives", "schedule_publications", "truth_mapping"],
        isPublic: true,
      },
      {
        name: "Outreach Agent",
        type: "outreach" as const,
        description: "Marketing and community growth assistant. Generate social media posts, email campaigns, and promotional content to expand your reach.",
        avatar: "📢",
        systemPrompt: AGENT_SYSTEM_PROMPTS.outreach,
        capabilities: ["social_media_posts", "email_campaigns", "press_releases", "content_calendar", "hashtag_strategy"],
        isPublic: true,
      },
      {
        name: "SEO Agent",
        type: "seo" as const,
        description: "Search engine optimization expert. Improve your website visibility with keyword analysis, meta descriptions, and content optimization.",
        avatar: "🔍",
        systemPrompt: AGENT_SYSTEM_PROMPTS.seo,
        capabilities: ["keyword_research", "meta_optimization", "content_audit", "schema_markup", "competitor_analysis"],
        isPublic: true,
      },
      {
        name: "Engagement Agent",
        type: "engagement" as const,
        description: "Audience analytics and engagement strategist. Optimize posting times, track metrics, and build lasting audience relationships.",
        avatar: "📈",
        systemPrompt: AGENT_SYSTEM_PROMPTS.engagement,
        capabilities: ["analytics_tracking", "posting_optimization", "ab_testing", "audience_insights", "trend_identification"],
        isPublic: true,
      },
      {
        name: "HR Agent",
        type: "hr" as const,
        description: "Human Resources assistant. Manage recruitment, onboarding, training, and employee support across the organization.",
        avatar: "👥",
        systemPrompt: AGENT_SYSTEM_PROMPTS.hr,
        capabilities: ["recruitment", "onboarding", "training", "policy_guidance", "employee_support"],
        isPublic: true,
      },
      {
        name: "QA/QC Agent",
        type: "qaqc" as const,
        description: "Quality Assurance specialist. Monitor quality standards, track compliance, and drive continuous improvement.",
        avatar: "✅",
        systemPrompt: AGENT_SYSTEM_PROMPTS.qaqc,
        capabilities: ["quality_audit", "compliance_check", "issue_tracking", "metrics_reporting", "improvement_planning"],
        isPublic: true,
      },
      {
        name: "Purchasing Agent",
        type: "purchasing" as const,
        description: "Procurement specialist. Manage vendors, track orders, analyze spending, and optimize purchasing decisions.",
        avatar: "🛒",
        systemPrompt: AGENT_SYSTEM_PROMPTS.purchasing,
        capabilities: ["vendor_management", "purchase_orders", "spend_analysis", "budget_tracking", "procurement"],
        isPublic: true,
      },
      {
        name: "Health Agent",
        type: "health" as const,
        description: "Health and Wellness coordinator. Support community health programs, wellness initiatives, and the WATER pillar healing programs.",
        avatar: "💚",
        systemPrompt: AGENT_SYSTEM_PROMPTS.health,
        capabilities: ["wellness_programs", "health_resources", "mental_health", "workshop_coordination", "community_health"],
        isPublic: true,
      },
      {
        name: "Design Agent",
        type: "design" as const,
        description: "Creative design specialist. Support brand identity, graphic design, UI/UX, and visual asset creation for all entities.",
        avatar: "🎨",
        systemPrompt: AGENT_SYSTEM_PROMPTS.design,
        capabilities: ["brand_identity", "graphic_design", "ui_ux", "design_review", "style_guide"],
        isPublic: true,
      },
    ];

    for (const botData of defaultAgents) {
      await db.insert(agents).values({
        ...botData,
        capabilities: botData.capabilities as any,
        createdBy: ctx.user.id,
      });
    }

    // Create notification
    await db.insert(notifications).values({
      userId: ctx.user.id,
      type: "success",
      title: "AI Agents Initialized",
      message: `Successfully created ${defaultAgents.length} AI assistants: Operations, Support, Academy Tutor, Analytics, Trust Guardian, Finance, and Media agents.`,
      actionUrl: "/agents",
      isPriority: true,
    });

    return { 
      success: true, 
      message: `Created ${defaultAgents.length} system agents`,
      agents: defaultAgents.map(b => b.name),
    };
  }),

  /**
   * Get agent action history
   */
  getActions: protectedProcedure
    .input(z.object({
      agentId: z.number().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = input.agentId
        ? and(eq(agentActions.userId, ctx.user.id), eq(agentActions.agentId, input.agentId))
        : eq(agentActions.userId, ctx.user.id);

      const actions = await db.select()
        .from(agentActions)
        .where(conditions)
        .orderBy(desc(agentActions.createdAt))
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
        .from(agentConversations)
        .where(and(
          eq(agentConversations.id, input.conversationId),
          eq(agentConversations.userId, ctx.user.id)
        ))
        .limit(1);

      if (!conv.length) throw new Error("Conversation not found");

      // Delete messages first
      await db.delete(agentMessages)
        .where(eq(agentMessages.conversationId, input.conversationId));

      // Delete conversation
      await db.delete(agentConversations)
        .where(eq(agentConversations.id, input.conversationId));

      return { success: true };
    }),

  /**
   * Get scheduled tasks for a agent or all agents
   */
  getScheduledTasks: protectedProcedure
    .input(z.object({
      agentId: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = input?.agentId
        ? and(eq(scheduledAgentTasks.createdBy, ctx.user.id), eq(scheduledAgentTasks.agentId, input.agentId))
        : eq(scheduledAgentTasks.createdBy, ctx.user.id);

      const tasks = await db.select()
        .from(scheduledAgentTasks)
        .where(conditions)
        .orderBy(desc(scheduledAgentTasks.createdAt));

      return tasks;
    }),

  /**
   * Create a scheduled task
   */
  createScheduledTask: protectedProcedure
    .input(z.object({
      agentId: z.number(),
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
      
      await db.insert(scheduledAgentTasks).values({
        agentId: input.agentId,
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

      await db.update(scheduledAgentTasks)
        .set({ isActive: input.isActive })
        .where(and(
          eq(scheduledAgentTasks.id, input.taskId),
          eq(scheduledAgentTasks.createdBy, ctx.user.id)
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

      await db.delete(scheduledAgentTasks)
        .where(and(
          eq(scheduledAgentTasks.id, input.taskId),
          eq(scheduledAgentTasks.createdBy, ctx.user.id)
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
        .from(scheduledAgentTasks)
        .where(and(
          eq(scheduledAgentTasks.id, input.taskId),
          eq(scheduledAgentTasks.createdBy, ctx.user.id)
        ))
        .limit(1);

      if (!task) throw new Error("Task not found");

      // Get the agent
      const [agentRecord] = await db.select()
        .from(agents)
        .where(eq(agents.id, task.agentId))
        .limit(1);

      if (!agentRecord) throw new Error("Agent not found");

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
          { role: "system", content: agentRecord.systemPrompt },
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

      await db.update(scheduledAgentTasks)
        .set({
          lastRunAt: new Date(),
          resultHistory: resultHistory as any,
        })
        .where(eq(scheduledAgentTasks.id, input.taskId));

      // Create notification if enabled
      if (task.notifyOnComplete) {
        await db.insert(notifications).values({
          userId: ctx.user.id,
          type: "info",
          title: `Scheduled Task Complete: ${task.name}`,
          message: result.substring(0, 200) + (result.length > 200 ? "..." : ""),
          actionUrl: "/agents",
        });
      }

      // Log the action
      await db.insert(agentActions).values({
        agentId: task.agentId,
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
   * Initialize default scheduled tasks for system agents
   */
  initializeDefaultTasks: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Check if tasks already exist
    const existingTasks = await db.select()
      .from(scheduledAgentTasks)
      .where(eq(scheduledAgentTasks.createdBy, ctx.user.id))
      .limit(1);

    if (existingTasks.length > 0) {
      return { success: true, message: "Tasks already initialized" };
    }

    // Get system agents
    const systemAgents = await db.select().from(agents);
    const botMap = new Map(systemAgents.map(b => [b.type, b.id]));

    const defaultTasks = [
      {
        agentId: botMap.get("operations"),
        name: "Daily Operations Report",
        description: "Generate a daily summary of all autonomous operations",
        taskType: "daily_report" as const,
        prompt: "Generate a comprehensive daily report of all autonomous operations. Include: pending operations, completed operations, any issues or alerts, and recommendations for tomorrow.",
        schedule: "0 9 * * *", // 9 AM daily
      },
      {
        agentId: botMap.get("analytics"),
        name: "Weekly Performance Audit",
        description: "Weekly analysis of business performance across all entities",
        taskType: "weekly_audit" as const,
        prompt: "Conduct a weekly audit of business performance. Analyze: entity performance metrics, token circulation, operation success rates, and provide strategic recommendations.",
        schedule: "0 10 * * 1", // 10 AM every Monday
      },
      {
        agentId: botMap.get("finance"),
        name: "Token Economy Report",
        description: "Daily token balance and transaction summary",
        taskType: "token_report" as const,
        prompt: "Generate a token economy report. Include: total tokens in circulation, entity balances, recent transactions, and any anomalies in token flow.",
        schedule: "0 8 * * *", // 8 AM daily
      },
      {
        agentId: botMap.get("guardian"),
        name: "Monthly Governance Review",
        description: "Monthly compliance and governance analysis",
        taskType: "monthly_analysis" as const,
        prompt: "Conduct a monthly governance review. Check: trust compliance, allocation distributions, sovereignty protections, and flag any policy concerns.",
        schedule: "0 9 1 * *", // 9 AM on 1st of each month
      },
      {
        agentId: botMap.get("outreach"),
        name: "Content Calendar Update",
        description: "Generate weekly social media content suggestions",
        taskType: "content_schedule" as const,
        prompt: "Create a content calendar for the upcoming week. Include: 7 social media post ideas, 2 email newsletter topics, and 1 blog post outline. Focus on community engagement and brand awareness.",
        schedule: "0 8 * * 0", // 8 AM every Sunday
      },
      {
        agentId: botMap.get("seo"),
        name: "SEO Health Check",
        description: "Weekly SEO audit and recommendations",
        taskType: "seo_audit" as const,
        prompt: "Perform an SEO health check. Analyze: current keyword rankings, content optimization opportunities, meta description improvements, and competitor insights.",
        schedule: "0 7 * * 2", // 7 AM every Tuesday
      },
      {
        agentId: botMap.get("engagement"),
        name: "Engagement Metrics Review",
        description: "Daily engagement analysis and optimization tips",
        taskType: "engagement_check" as const,
        prompt: "Review engagement metrics. Analyze: best performing content, optimal posting times, audience growth trends, and provide 3 actionable recommendations to boost engagement.",
        schedule: "0 18 * * *", // 6 PM daily
      },
    ];

    let created = 0;
    for (const task of defaultTasks) {
      if (task.agentId) {
        await db.insert(scheduledAgentTasks).values({
          agentId: task.agentId,
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

  // ============================================
  // TRAINING MODE INTEGRATION
  // ============================================

  /**
   * Get training modules available for an agent type
   */
  getTrainingModules: protectedProcedure
    .input(z.object({
      agentType: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const modules = await db.select()
        .from(trainingModules)
        .where(and(
          eq(trainingModules.agentType, input.agentType),
          eq(trainingModules.isActive, true),
          eq(trainingModules.isPublic, true)
        ));

      return modules;
    }),

  /**
   * Start a training session through an agent conversation
   */
  startTrainingSession: protectedProcedure
    .input(z.object({
      agentId: z.number(),
      moduleId: z.number(),
      conversationId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get the module
      const [module] = await db.select()
        .from(trainingModules)
        .where(eq(trainingModules.id, input.moduleId));

      if (!module) throw new Error("Training module not found");

      // Get topics and count questions
      const topics = await db.select()
        .from(trainingTopics)
        .where(eq(trainingTopics.moduleId, input.moduleId));

      let totalQuestions = 0;
      let totalPoints = 0;
      let firstTopicId: number | null = null;
      let firstQuestionId: number | null = null;

      for (const topic of topics) {
        const questions = await db.select()
          .from(trainingQuestions)
          .where(eq(trainingQuestions.topicId, topic.id));
        totalQuestions += questions.length;
        totalPoints += questions.reduce((sum, q) => sum + q.points, 0);

        if (!firstTopicId && questions.length > 0) {
          firstTopicId = topic.id;
          firstQuestionId = questions[0].id;
        }
      }

      // Create or use existing conversation
      let conversationId = input.conversationId;
      if (!conversationId) {
        const convResult = await db.insert(agentConversations).values({
          agentId: input.agentId,
          userId: ctx.user.id,
          title: `Training: ${module.name}`,
          metadata: { trainingMode: true, moduleId: input.moduleId } as any,
        });
        conversationId = convResult[0].insertId;
      }

      // Create training session
      const sessionResult = await db.insert(trainingSessions).values({
        userId: ctx.user.id,
        moduleId: input.moduleId,
        agentConversationId: conversationId,
        totalQuestions,
        totalPoints,
        currentTopicId: firstTopicId,
        currentQuestionId: firstQuestionId,
      });

      // Get first question
      let firstQuestion = null;
      if (firstQuestionId) {
        const [q] = await db.select()
          .from(trainingQuestions)
          .where(eq(trainingQuestions.id, firstQuestionId));
        
        if (q) {
          const answers = await db.select({
            id: trainingAnswers.id,
            answerText: trainingAnswers.answerText,
            orderIndex: trainingAnswers.orderIndex,
          }).from(trainingAnswers)
            .where(eq(trainingAnswers.questionId, q.id));
          
          firstQuestion = { ...q, answers };
        }
      }

      // Add welcome message to conversation
      await db.insert(agentMessages).values({
        conversationId,
        role: "assistant",
        content: `Welcome to the training module: **${module.name}**\n\n${module.description || ""}\n\nThis module has ${totalQuestions} questions. You need ${module.passingScore}% to pass.\n\nLet's begin!\n\n---\n\n**Question 1:**\n${firstQuestion?.questionText || "No questions available."}`,
        metadata: { 
          trainingMode: true, 
          sessionId: sessionResult[0].insertId,
          questionId: firstQuestionId,
        } as any,
      });

      return {
        success: true,
        sessionId: sessionResult[0].insertId,
        conversationId,
        module,
        totalQuestions,
        totalPoints,
        firstQuestion,
      };
    }),

  /**
   * Get current training session state for a conversation
   */
  getTrainingSession: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const [session] = await db.select()
        .from(trainingSessions)
        .where(and(
          eq(trainingSessions.agentConversationId, input.conversationId),
          eq(trainingSessions.userId, ctx.user.id)
        ));

      if (!session) return null;

      // Get module info
      const [module] = await db.select()
        .from(trainingModules)
        .where(eq(trainingModules.id, session.moduleId));

      // Get current question if any
      let currentQuestion = null;
      if (session.currentQuestionId) {
        const [q] = await db.select()
          .from(trainingQuestions)
          .where(eq(trainingQuestions.id, session.currentQuestionId));
        
        if (q) {
          const answers = await db.select({
            id: trainingAnswers.id,
            answerText: trainingAnswers.answerText,
            orderIndex: trainingAnswers.orderIndex,
          }).from(trainingAnswers)
            .where(eq(trainingAnswers.questionId, q.id));
          
          currentQuestion = { ...q, answers };
        }
      }

      return {
        ...session,
        module,
        currentQuestion,
      };
    }),
});
