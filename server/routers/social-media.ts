import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  socialMediaIntegrations,
  socialMediaPosts,
  notifications,
  agents
} from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

export const socialMediaRouter = router({
  /**
   * Get all social media integrations for the user
   */
  getIntegrations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const integrations = await db.select()
      .from(socialMediaIntegrations)
      .where(eq(socialMediaIntegrations.userId, ctx.user.id))
      .orderBy(desc(socialMediaIntegrations.createdAt));

    return integrations;
  }),

  /**
   * Add a new social media integration
   * Note: In production, this would use OAuth flow. For now, we store API credentials.
   */
  addIntegration: protectedProcedure
    .input(z.object({
      platform: z.enum(["twitter", "facebook", "instagram", "linkedin", "tiktok"]),
      accountName: z.string().min(1),
      accessToken: z.string().optional(),
      refreshToken: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.insert(socialMediaIntegrations).values({
        userId: ctx.user.id,
        platform: input.platform,
        accountName: input.accountName,
        accessToken: input.accessToken,
        refreshToken: input.refreshToken,
      });

      // Create notification
      await db.insert(notifications).values({
        userId: ctx.user.id,
        type: "success",
        title: "Social Media Connected",
        message: `Successfully connected ${input.platform} account: ${input.accountName}`,
        actionUrl: "/social-media",
      });

      return { success: true };
    }),

  /**
   * Remove a social media integration
   */
  removeIntegration: protectedProcedure
    .input(z.object({ integrationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.delete(socialMediaIntegrations)
        .where(and(
          eq(socialMediaIntegrations.id, input.integrationId),
          eq(socialMediaIntegrations.userId, ctx.user.id)
        ));

      return { success: true };
    }),

  /**
   * Get all posts for the user
   */
  getPosts: protectedProcedure
    .input(z.object({
      status: z.enum(["draft", "scheduled", "published", "failed"]).optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      let conditions = eq(socialMediaPosts.userId, ctx.user.id);
      if (input?.status) {
        conditions = and(conditions, eq(socialMediaPosts.status, input.status))!;
      }

      const posts = await db.select()
        .from(socialMediaPosts)
        .where(conditions)
        .orderBy(desc(socialMediaPosts.createdAt))
        .limit(input?.limit || 50);

      return posts;
    }),

  /**
   * Create a new post (draft or scheduled)
   */
  createPost: protectedProcedure
    .input(z.object({
      integrationId: z.number(),
      content: z.string().min(1),
      mediaUrls: z.array(z.string()).optional(),
      hashtags: z.array(z.string()).optional(),
      scheduledFor: z.date().optional(),
      status: z.enum(["draft", "scheduled"]).default("draft"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.insert(socialMediaPosts).values({
        userId: ctx.user.id,
        integrationId: input.integrationId,
        content: input.content,
        mediaUrls: input.mediaUrls as any,
        hashtags: input.hashtags as any,
        scheduledFor: input.scheduledFor,
        status: input.status,
      });

      return { success: true };
    }),

  /**
   * Update a post
   */
  updatePost: protectedProcedure
    .input(z.object({
      postId: z.number(),
      content: z.string().optional(),
      mediaUrls: z.array(z.string()).optional(),
      hashtags: z.array(z.string()).optional(),
      scheduledFor: z.date().optional(),
      status: z.enum(["draft", "scheduled"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const updateData: any = {};
      if (input.content) updateData.content = input.content;
      if (input.mediaUrls) updateData.mediaUrls = input.mediaUrls;
      if (input.hashtags) updateData.hashtags = input.hashtags;
      if (input.scheduledFor) updateData.scheduledFor = input.scheduledFor;
      if (input.status) updateData.status = input.status;

      await db.update(socialMediaPosts)
        .set(updateData)
        .where(and(
          eq(socialMediaPosts.id, input.postId),
          eq(socialMediaPosts.userId, ctx.user.id)
        ));

      return { success: true };
    }),

  /**
   * Delete a post
   */
  deletePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.delete(socialMediaPosts)
        .where(and(
          eq(socialMediaPosts.id, input.postId),
          eq(socialMediaPosts.userId, ctx.user.id)
        ));

      return { success: true };
    }),

  /**
   * Generate post content using Outreach Bot
   */
  generateContent: protectedProcedure
    .input(z.object({
      platform: z.enum(["twitter", "facebook", "instagram", "linkedin", "tiktok"]),
      topic: z.string().min(1),
      tone: z.enum(["professional", "casual", "inspirational", "educational", "promotional"]).default("professional"),
      includeHashtags: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get Outreach Agent
      const [outreachAgent] = await db.select()
        .from(agents)
        .where(eq(agents.type, "outreach"))
        .limit(1);

      const platformLimits: Record<string, number> = {
        twitter: 280,
        facebook: 500,
        instagram: 2200,
        linkedin: 700,
        tiktok: 150,
      };

      const prompt = `Generate a ${input.tone} social media post for ${input.platform} about: ${input.topic}

Requirements:
- Maximum ${platformLimits[input.platform]} characters
- ${input.includeHashtags ? "Include 3-5 relevant hashtags" : "No hashtags"}
- Engaging and shareable
- Include a call-to-action if appropriate
- Optimized for ${input.platform}'s algorithm

Brand context: LuvOnPurpose is a multi-generational wealth building system focused on community restoration, education, and sovereign financial independence.

Return the post content only, no explanations.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: outreachAgent?.systemPrompt || "You are a social media marketing expert." },
          { role: "user", content: prompt }
        ],
      });

      const content = typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : JSON.stringify(response.choices[0].message.content);

      // Extract hashtags if present
      const hashtagRegex = /#\w+/g;
      const hashtags = content.match(hashtagRegex) || [];

      return {
        content: content.trim(),
        hashtags,
        platform: input.platform,
        characterCount: content.length,
        limit: platformLimits[input.platform],
      };
    }),

  /**
   * Generate a content calendar for the week
   */
  generateContentCalendar: protectedProcedure
    .input(z.object({
      platforms: z.array(z.enum(["twitter", "facebook", "instagram", "linkedin", "tiktok"])),
      themes: z.array(z.string()).optional(),
      postsPerDay: z.number().min(1).max(5).default(2),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [outreachAgent] = await db.select()
        .from(agents)
        .where(eq(agents.type, "outreach"))
        .limit(1);

      const prompt = `Create a 7-day social media content calendar for LuvOnPurpose.

Platforms: ${input.platforms.join(", ")}
Posts per day: ${input.postsPerDay}
${input.themes?.length ? `Focus themes: ${input.themes.join(", ")}` : ""}

Brand context: LuvOnPurpose is a multi-generational wealth building system with these pillars:
- The L.A.W.S. Collective (Land, Air, Water, Self)
- Academy for education and skill building
- Autonomous wealth generation
- Community restoration and sovereignty

For each day, provide:
1. Day name
2. Theme for the day
3. Post ideas for each platform with suggested content and best posting time

Format as JSON array with structure:
[{
  "day": "Monday",
  "theme": "Motivation Monday",
  "posts": [{
    "platform": "twitter",
    "content": "post content here",
    "time": "9:00 AM",
    "hashtags": ["#tag1", "#tag2"]
  }]
}]`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: outreachAgent?.systemPrompt || "You are a social media marketing expert." },
          { role: "user", content: prompt }
        ],
      });

      const content = typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : JSON.stringify(response.choices[0].message.content);

      // Try to parse as JSON
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return { calendar: JSON.parse(jsonMatch[0]), raw: content };
        }
      } catch (e) {
        // Return raw if parsing fails
      }

      return { calendar: null, raw: content };
    }),

  /**
   * Create video marketing campaign for distribution across platforms
   */
  createVideoCampaign: protectedProcedure
    .input(z.object({
      videoUrl: z.string(),
      title: z.string(),
      description: z.string(),
      platforms: z.array(z.enum(["twitter", "facebook", "instagram", "linkedin", "tiktok"])),
      scheduleDays: z.number().min(1).max(30).default(7),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get user's integrations for selected platforms
      const integrations = await db.select()
        .from(socialMediaIntegrations)
        .where(eq(socialMediaIntegrations.userId, ctx.user.id));

      const platformIntegrations = integrations.filter(i => 
        input.platforms.includes(i.platform as any)
      );

      if (platformIntegrations.length === 0) {
        throw new Error("No connected accounts for selected platforms. Please connect your social media accounts first.");
      }

      // Generate platform-specific captions using AI
      const [outreachAgent] = await db.select()
        .from(agents)
        .where(eq(agents.type, "outreach"))
        .limit(1);

      const campaignPosts = [];

      for (const integration of platformIntegrations) {
        // Generate optimized caption for each platform
        const captionPrompt = `Create an engaging caption for a promotional video about The L.A.W.S. Collective on ${integration.platform}.

Video Title: ${input.title}
Video Description: ${input.description}

The L.A.W.S. Collective helps families build multi-generational wealth through:
- Land reconnection and stability
- Air (education and knowledge)
- Water (healing and balance)
- Self (purpose and skills)

Requirements:
- Optimized for ${integration.platform}'s algorithm
- Include 3-5 relevant hashtags
- Include a call-to-action
- Engaging and shareable
- Under 280 characters for Twitter, 500 for Facebook, 2200 for Instagram

Return only the caption text.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: outreachAgent?.systemPrompt || "You are a social media marketing expert specializing in video content." },
            { role: "user", content: captionPrompt }
          ],
        });

        const caption = typeof response.choices[0].message.content === "string"
          ? response.choices[0].message.content.trim()
          : JSON.stringify(response.choices[0].message.content);

        // Extract hashtags
        const hashtagRegex = /#\w+/g;
        const hashtags = caption.match(hashtagRegex) || [];

        // Schedule posts across the campaign period
        const postsPerPlatform = Math.ceil(input.scheduleDays / 3); // Post every 3 days per platform
        
        for (let i = 0; i < postsPerPlatform; i++) {
          const scheduledDate = new Date();
          scheduledDate.setDate(scheduledDate.getDate() + (i * 3));
          scheduledDate.setHours(9 + (i % 3) * 4, 0, 0, 0); // Vary posting times: 9am, 1pm, 5pm

          await db.insert(socialMediaPosts).values({
            userId: ctx.user.id,
            integrationId: integration.id,
            content: caption,
            mediaUrls: [input.videoUrl] as any,
            hashtags: hashtags as any,
            scheduledFor: scheduledDate,
            status: "scheduled",
          });

          campaignPosts.push({
            platform: integration.platform,
            accountName: integration.accountName,
            scheduledFor: scheduledDate,
            caption: caption.substring(0, 100) + "...",
          });
        }
      }

      // Create notification
      await db.insert(notifications).values({
        userId: ctx.user.id,
        type: "success",
        title: "Video Campaign Created",
        message: `Created ${campaignPosts.length} scheduled posts across ${platformIntegrations.length} platforms`,
        actionUrl: "/social-media",
      });

      return {
        success: true,
        totalPosts: campaignPosts.length,
        platforms: platformIntegrations.map(i => i.platform),
        posts: campaignPosts,
      };
    }),

  /**
   * Simulate publishing a post (in production, this would call actual APIs)
   */
  publishPost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get the post
      const [post] = await db.select()
        .from(socialMediaPosts)
        .where(and(
          eq(socialMediaPosts.id, input.postId),
          eq(socialMediaPosts.userId, ctx.user.id)
        ))
        .limit(1);

      if (!post) throw new Error("Post not found");

      // Get the integration
      const [integration] = await db.select()
        .from(socialMediaIntegrations)
        .where(eq(socialMediaIntegrations.id, post.integrationId))
        .limit(1);

      if (!integration) throw new Error("Social media account not found");

      // In production, this would call the actual platform API
      // For now, we simulate success
      const simulatedPostId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db.update(socialMediaPosts)
        .set({
          status: "published",
          publishedAt: new Date(),
          platformPostId: simulatedPostId,
        })
        .where(eq(socialMediaPosts.id, input.postId));

      // Update integration last post time
      await db.update(socialMediaIntegrations)
        .set({ lastPostAt: new Date() })
        .where(eq(socialMediaIntegrations.id, integration.id));

      // Create notification
      await db.insert(notifications).values({
        userId: ctx.user.id,
        type: "success",
        title: "Post Published",
        message: `Successfully published to ${integration.platform}: ${integration.accountName}`,
        actionUrl: "/social-media",
      });

      return { 
        success: true, 
        platformPostId: simulatedPostId,
        message: `Post published to ${integration.platform}. Note: This is a simulation. Connect actual API keys for real publishing.`
      };
    }),
});
