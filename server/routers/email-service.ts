import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  emailTemplates,
  emailSends,
  notifications,
  agents
} from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

export const emailServiceRouter = router({
  /**
   * Get all email templates
   */
  getTemplates: protectedProcedure
    .input(z.object({
      category: z.enum(["notification", "marketing", "transactional", "newsletter"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      let conditions = eq(emailTemplates.userId, ctx.user.id);
      if (input?.category) {
        conditions = and(conditions, eq(emailTemplates.category, input.category))!;
      }

      const templates = await db.select()
        .from(emailTemplates)
        .where(conditions)
        .orderBy(desc(emailTemplates.createdAt));

      return templates;
    }),

  /**
   * Create a new email template
   */
  createTemplate: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      subject: z.string().min(1).max(200),
      htmlContent: z.string().min(1),
      textContent: z.string().optional(),
      category: z.enum(["notification", "marketing", "transactional", "newsletter"]).default("notification"),
      variables: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.insert(emailTemplates).values({
        userId: ctx.user.id,
        name: input.name,
        subject: input.subject,
        htmlContent: input.htmlContent,
        textContent: input.textContent,
        category: input.category,
        variables: input.variables as any,
      });

      return { success: true };
    }),

  /**
   * Update an email template
   */
  updateTemplate: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      name: z.string().min(1).max(100).optional(),
      subject: z.string().min(1).max(200).optional(),
      htmlContent: z.string().min(1).optional(),
      textContent: z.string().optional(),
      category: z.enum(["notification", "marketing", "transactional", "newsletter"]).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.subject) updateData.subject = input.subject;
      if (input.htmlContent) updateData.htmlContent = input.htmlContent;
      if (input.textContent !== undefined) updateData.textContent = input.textContent;
      if (input.category) updateData.category = input.category;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      await db.update(emailTemplates)
        .set(updateData)
        .where(and(
          eq(emailTemplates.id, input.templateId),
          eq(emailTemplates.userId, ctx.user.id)
        ));

      return { success: true };
    }),

  /**
   * Delete an email template
   */
  deleteTemplate: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.delete(emailTemplates)
        .where(and(
          eq(emailTemplates.id, input.templateId),
          eq(emailTemplates.userId, ctx.user.id)
        ));

      return { success: true };
    }),

  /**
   * Get email send history
   */
  getSendHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      status: z.enum(["pending", "sent", "delivered", "opened", "clicked", "bounced", "failed"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      let conditions = eq(emailSends.userId, ctx.user.id);
      if (input?.status) {
        conditions = and(conditions, eq(emailSends.status, input.status))!;
      }

      const sends = await db.select()
        .from(emailSends)
        .where(conditions)
        .orderBy(desc(emailSends.createdAt))
        .limit(input?.limit || 50);

      return sends;
    }),

  /**
   * Send an email (simulated - in production would use SendGrid/Resend)
   */
  sendEmail: protectedProcedure
    .input(z.object({
      templateId: z.number().optional(),
      recipientEmail: z.string().email(),
      recipientName: z.string().optional(),
      subject: z.string().min(1).max(200),
      htmlContent: z.string().optional(),
      variables: z.record(z.string(), z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      let finalSubject = input.subject;
      let finalContent = input.htmlContent || "";

      // If using a template, get it and apply variables
      if (input.templateId) {
        const [template] = await db.select()
          .from(emailTemplates)
          .where(and(
            eq(emailTemplates.id, input.templateId),
            eq(emailTemplates.userId, ctx.user.id)
          ))
          .limit(1);

        if (template) {
          finalSubject = template.subject;
          finalContent = template.htmlContent;

          // Replace variables
          if (input.variables) {
            Object.entries(input.variables).forEach(([key, value]) => {
              finalSubject = finalSubject.replace(new RegExp(`{{${key}}}`, "g"), String(value));
              finalContent = finalContent.replace(new RegExp(`{{${key}}}`, "g"), String(value));
            });
          }
        }
      }

      // In production, this would call SendGrid/Resend API
      const simulatedId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db.insert(emailSends).values({
        userId: ctx.user.id,
        templateId: input.templateId,
        recipientEmail: input.recipientEmail,
        recipientName: input.recipientName,
        subject: finalSubject,
        status: "sent", // Simulated as sent
        externalId: simulatedId,
      });

      return { 
        success: true, 
        emailId: simulatedId,
        message: "Email sent (simulated). Connect SendGrid or Resend API for actual delivery."
      };
    }),

  /**
   * Generate email content using AI
   */
  generateEmailContent: protectedProcedure
    .input(z.object({
      purpose: z.enum(["welcome", "newsletter", "promotion", "announcement", "follow_up", "thank_you"]),
      topic: z.string().min(1),
      tone: z.enum(["professional", "friendly", "formal", "casual"]).default("professional"),
      recipientType: z.enum(["customer", "prospect", "partner", "community"]).default("customer"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const prompt = `Generate a ${input.purpose} email for LuvOnPurpose.

Topic: ${input.topic}
Tone: ${input.tone}
Recipient type: ${input.recipientType}

Brand context: LuvOnPurpose is a multi-generational wealth building system focused on:
- Community restoration and sovereignty
- Education through the Luv Academy
- Autonomous wealth generation
- The L.A.W.S. Collective (Land, Air, Water, Self)

Generate both:
1. Email subject line (compelling, under 60 characters)
2. Email body in HTML format with proper styling

Format your response as:
SUBJECT: [subject line]
---
HTML:
[html content]`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert email marketing copywriter." },
          { role: "user", content: prompt }
        ],
      });

      const content = typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : JSON.stringify(response.choices[0].message.content);

      // Parse subject and HTML
      const subjectMatch = content.match(/SUBJECT:\s*(.+?)(?:\n|---)/);
      const htmlMatch = content.match(/HTML:\s*([\s\S]+)/);

      return {
        subject: subjectMatch ? subjectMatch[1].trim() : "LuvOnPurpose Update",
        htmlContent: htmlMatch ? htmlMatch[1].trim() : content,
        raw: content,
      };
    }),

  /**
   * Initialize default email templates
   */
  initializeDefaultTemplates: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Check if templates already exist
    const existing = await db.select()
      .from(emailTemplates)
      .where(eq(emailTemplates.userId, ctx.user.id))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, message: "Templates already initialized" };
    }

    const defaultTemplates = [
      {
        name: "Welcome Email",
        subject: "Welcome to LuvOnPurpose - Your Journey Begins",
        category: "transactional" as const,
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #2d5a27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to LuvOnPurpose</h1>
      <p>Multi-Generational Wealth Architecture</p>
    </div>
    <div class="content">
      <h2>Hello {{name}},</h2>
      <p>Welcome to the LuvOnPurpose Sovereign System! You've taken the first step toward building multi-generational wealth and community restoration.</p>
      <p>Here's what you can explore:</p>
      <ul>
        <li><strong>Luv Academy</strong> - Educational courses and certifications</li>
        <li><strong>Trust System</strong> - Manage your sovereign entities</li>
        <li><strong>Document Vault</strong> - Secure storage for important documents</li>
        <li><strong>AI Assistants</strong> - Get help from our intelligent agents</li>
      </ul>
      <a href="{{loginUrl}}" class="button">Access Your Dashboard</a>
      <p>If you have any questions, our Support Agent is available 24/7 to assist you.</p>
      <p>Welcome to the family,<br>The LuvOnPurpose Team</p>
    </div>
    <div class="footer">
      <p>LuvOnPurpose Autonomous Wealth System</p>
      <p>Building Generational Wealth Through Community</p>
    </div>
  </div>
</body>
</html>`,
        variables: ["name", "loginUrl"],
      },
      {
        name: "Weekly Newsletter",
        subject: "This Week at LuvOnPurpose - {{weekDate}}",
        category: "newsletter" as const,
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 100%); color: white; padding: 30px; text-align: center; }
    .section { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #2d5a27; }
    .highlight { background: #e8f5e9; padding: 15px; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Weekly Update</h1>
      <p>{{weekDate}}</p>
    </div>
    <div class="section">
      <h2>🌟 This Week's Highlights</h2>
      <p>{{highlights}}</p>
    </div>
    <div class="section">
      <h2>📚 Academy Updates</h2>
      <p>{{academyNews}}</p>
    </div>
    <div class="section">
      <h2>💡 Community Spotlight</h2>
      <p>{{communityNews}}</p>
    </div>
    <div class="highlight">
      <h3>Coming Up Next Week</h3>
      <p>{{upcomingEvents}}</p>
    </div>
  </div>
</body>
</html>`,
        variables: ["weekDate", "highlights", "academyNews", "communityNews", "upcomingEvents"],
      },
      {
        name: "Agent Report Notification",
        subject: "{{agentName}} Report Ready - {{reportType}}",
        category: "notification" as const,
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a1a2e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px; }
    .report-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .button { display: inline-block; background: #2d5a27; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🤖 {{agentName}}</h2>
      <p>{{reportType}} Report</p>
    </div>
    <div class="content">
      <p>Your scheduled report is ready.</p>
      <div class="report-box">
        <h3>Summary</h3>
        <p>{{reportSummary}}</p>
      </div>
      <a href="{{dashboardUrl}}" class="button">View Full Report</a>
    </div>
  </div>
</body>
</html>`,
        variables: ["agentName", "reportType", "reportSummary", "dashboardUrl"],
      },
    ];

    for (const template of defaultTemplates) {
      await db.insert(emailTemplates).values({
        userId: ctx.user.id,
        name: template.name,
        subject: template.subject,
        htmlContent: template.htmlContent,
        category: template.category,
        variables: template.variables as any,
      });
    }

    return { success: true, message: `Created ${defaultTemplates.length} email templates` };
  }),
});
