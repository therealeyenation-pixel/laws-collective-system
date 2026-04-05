import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { businessPlans, secureDocuments } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";

// Schema for extracted business plan data
const extractedDataSchema = z.object({
  entityName: z.string(),
  entityType: z.enum(["llc", "corporation", "trust", "nonprofit_508", "nonprofit_501c3", "collective", "sole_proprietorship"]),
  missionStatement: z.string().optional(),
  visionStatement: z.string().optional(),
  organizationDescription: z.string().optional(),
  yearFounded: z.number().optional(),
  productsServices: z.string().optional(),
  uniqueValueProposition: z.string().optional(),
  targetMarket: z.string().optional(),
  marketSize: z.string().optional(),
  competitiveAdvantage: z.string().optional(),
  teamSize: z.number().optional(),
  teamDescription: z.string().optional(),
  startupCosts: z.string().optional(),
  monthlyOperatingCosts: z.string().optional(),
  projectedRevenueYear1: z.string().optional(),
  projectedRevenueYear2: z.string().optional(),
  projectedRevenueYear3: z.string().optional(),
  fundingNeeded: z.string().optional(),
  fundingPurpose: z.string().optional(),
  socialImpact: z.string().optional(),
  communityBenefit: z.string().optional(),
});

export const businessPlanParserRouter = router({
  // Parse uploaded document and extract business plan data
  parseDocument: protectedProcedure
    .input(z.object({
      documentContent: z.string(), // Text content of the document
      entityName: z.string(), // Which entity this plan is for
      entityType: z.enum(["llc", "corporation", "trust", "nonprofit_508", "nonprofit_501c3", "collective", "sole_proprietorship"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Use LLM to extract structured data from the document
      const extractionPrompt = `You are a business plan parser. Extract the following information from this business plan document and return it as JSON.

Required fields to extract (return null if not found):
- missionStatement: The organization's mission statement
- visionStatement: The organization's vision for the future
- organizationDescription: A description of what the organization does (2-3 paragraphs)
- yearFounded: The year the organization was founded (number)
- productsServices: Description of products or services offered
- uniqueValueProposition: What makes this organization unique
- targetMarket: Who the organization serves
- marketSize: Size of the target market
- competitiveAdvantage: Competitive advantages
- teamSize: Number of team members (number)
- teamDescription: Description of the team
- startupCosts: Initial startup costs (as string with currency)
- monthlyOperatingCosts: Monthly operating expenses (as string with currency)
- projectedRevenueYear1: First year revenue projection (as string with currency)
- projectedRevenueYear2: Second year revenue projection (as string with currency)
- projectedRevenueYear3: Third year revenue projection (as string with currency)
- fundingNeeded: Total funding needed (as string with currency)
- fundingPurpose: What the funding will be used for
- socialImpact: Social impact goals (for nonprofits)
- communityBenefit: Community benefits (for nonprofits)

Document content:
${input.documentContent}

Return ONLY valid JSON with the extracted fields. Use null for any field not found in the document.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a precise document parser. Extract information exactly as written in the document. Return only valid JSON." },
            { role: "user", content: extractionPrompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "business_plan_extraction",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  missionStatement: { type: ["string", "null"] },
                  visionStatement: { type: ["string", "null"] },
                  organizationDescription: { type: ["string", "null"] },
                  yearFounded: { type: ["number", "null"] },
                  productsServices: { type: ["string", "null"] },
                  uniqueValueProposition: { type: ["string", "null"] },
                  targetMarket: { type: ["string", "null"] },
                  marketSize: { type: ["string", "null"] },
                  competitiveAdvantage: { type: ["string", "null"] },
                  teamSize: { type: ["number", "null"] },
                  teamDescription: { type: ["string", "null"] },
                  startupCosts: { type: ["string", "null"] },
                  monthlyOperatingCosts: { type: ["string", "null"] },
                  projectedRevenueYear1: { type: ["string", "null"] },
                  projectedRevenueYear2: { type: ["string", "null"] },
                  projectedRevenueYear3: { type: ["string", "null"] },
                  fundingNeeded: { type: ["string", "null"] },
                  fundingPurpose: { type: ["string", "null"] },
                  socialImpact: { type: ["string", "null"] },
                  communityBenefit: { type: ["string", "null"] },
                },
                required: [
                  "missionStatement", "visionStatement", "organizationDescription",
                  "yearFounded", "productsServices", "uniqueValueProposition",
                  "targetMarket", "marketSize", "competitiveAdvantage",
                  "teamSize", "teamDescription", "startupCosts",
                  "monthlyOperatingCosts", "projectedRevenueYear1", "projectedRevenueYear2",
                  "projectedRevenueYear3", "fundingNeeded", "fundingPurpose",
                  "socialImpact", "communityBenefit"
                ],
                additionalProperties: false,
              },
            },
          },
        });

        const choice = response.choices?.[0];
        if (!choice || !choice.message) {
          throw new Error("No response from AI parser");
        }
        
        const rawContent = choice.message.content;
        if (!rawContent) {
          throw new Error("No content in AI response");
        }
        
        // Handle both string and array content types
        let content: string;
        if (typeof rawContent === "string") {
          content = rawContent;
        } else if (Array.isArray(rawContent)) {
          // Extract text from content array
          const textParts = rawContent
            .filter((part): part is { type: "text"; text: string } => part.type === "text")
            .map(part => part.text);
          content = textParts.join("\n");
        } else {
          content = JSON.stringify(rawContent);
        }
        
        if (!content) {
          throw new Error("Could not extract text content from AI response");
        }

        const extractedData = JSON.parse(content);

        // Save to database
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Check if plan already exists for this entity
        const existing = await db.select()
          .from(businessPlans)
          .where(eq(businessPlans.entityName, input.entityName))
          .limit(1);

        const planData = {
          entityName: input.entityName,
          entityType: input.entityType,
          missionStatement: extractedData.missionStatement,
          visionStatement: extractedData.visionStatement,
          organizationDescription: extractedData.organizationDescription,
          yearFounded: extractedData.yearFounded,
          productsServices: extractedData.productsServices,
          uniqueValueProposition: extractedData.uniqueValueProposition,
          targetMarket: extractedData.targetMarket,
          marketSize: extractedData.marketSize,
          competitiveAdvantage: extractedData.competitiveAdvantage,
          teamSize: extractedData.teamSize,
          teamDescription: extractedData.teamDescription,
          startupCosts: extractedData.startupCosts,
          monthlyOperatingCosts: extractedData.monthlyOperatingCosts,
          projectedRevenueYear1: extractedData.projectedRevenueYear1,
          projectedRevenueYear2: extractedData.projectedRevenueYear2,
          projectedRevenueYear3: extractedData.projectedRevenueYear3,
          fundingNeeded: extractedData.fundingNeeded,
          fundingPurpose: extractedData.fundingPurpose,
          socialImpact: extractedData.socialImpact,
          communityBenefit: extractedData.communityBenefit,
          status: "completed" as const,
          createdByUserId: ctx.user.id,
          completedAt: new Date(),
          updatedAt: new Date(),
        };

        if (existing.length > 0) {
          await db.update(businessPlans)
            .set(planData)
            .where(eq(businessPlans.id, existing[0].id));
          return { 
            success: true, 
            id: existing[0].id, 
            updated: true,
            extractedData 
          };
        } else {
          const result = await db.insert(businessPlans).values({
            ...planData,
            createdAt: new Date(),
          });
          return { 
            success: true, 
            id: Number((result as any).insertId || 0), 
            updated: false,
            extractedData 
          };
        }
      } catch (error) {
        console.error("Error parsing document:", error);
        throw new Error("Failed to parse document: " + (error as Error).message);
      }
    }),

  // Upload file and parse
  uploadAndParse: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileContent: z.string(), // Base64 encoded file content
      contentType: z.string(),
      entityName: z.string(),
      entityType: z.enum(["llc", "corporation", "trust", "nonprofit_508", "nonprofit_501c3", "collective", "sole_proprietorship"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Decode base64 content
      const buffer = Buffer.from(input.fileContent, "base64");
      
      // Upload to S3
      const fileKey = `business-plans/${ctx.user.id}/${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.contentType);

      // For text files, we can parse directly
      // For PDFs, we would need additional processing
      let textContent = "";
      
      if (input.contentType === "text/plain" || input.contentType === "text/markdown") {
        textContent = buffer.toString("utf-8");
      } else if (input.contentType === "application/json") {
        textContent = buffer.toString("utf-8");
      } else {
        // For other file types, we'll store the file and return the URL
        // The user would need to paste the text content manually
        return {
          success: true,
          fileUrl: url,
          message: "File uploaded. Please paste the text content for AI parsing.",
          needsManualInput: true,
        };
      }

      // Save document to vault
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(secureDocuments).values({
        ownerId: ctx.user.id,
        title: `Business Plan - ${input.entityName}`,
        description: `Uploaded business plan document for ${input.entityName}`,
        documentType: "business_plan",
        content: textContent,
        fileUrl: url,
        accessLevel: "owner_only",
        status: "final",
        version: 1,
      });

      // Now parse the content
      // Use the parseDocument logic inline
      const extractionPrompt = `Extract business plan information from this document and return as JSON:

${textContent}

Return JSON with these fields (use null if not found):
missionStatement, visionStatement, organizationDescription, yearFounded, productsServices, uniqueValueProposition, targetMarket, marketSize, competitiveAdvantage, teamSize, teamDescription, startupCosts, monthlyOperatingCosts, projectedRevenueYear1, projectedRevenueYear2, projectedRevenueYear3, fundingNeeded, fundingPurpose, socialImpact, communityBenefit`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a document parser. Return only valid JSON." },
            { role: "user", content: extractionPrompt }
          ],
        });

        const choice2 = response.choices?.[0];
        if (!choice2 || !choice2.message) {
          throw new Error("No response from AI parser");
        }
        
        const rawContent2 = choice2.message.content;
        if (!rawContent2) {
          throw new Error("No content in AI response");
        }
        
        // Handle both string and array content types
        let content2: string;
        if (typeof rawContent2 === "string") {
          content2 = rawContent2;
        } else if (Array.isArray(rawContent2)) {
          const textParts2 = rawContent2
            .filter((part): part is { type: "text"; text: string } => part.type === "text")
            .map(part => part.text);
          content2 = textParts2.join("\n");
        } else {
          content2 = JSON.stringify(rawContent2);
        }
        
        if (!content2) {
          throw new Error("Could not extract text content from AI response");
        }

        // Try to parse JSON from response
        const jsonMatch = content2.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Could not extract JSON from response");
        }

        const extractedData = JSON.parse(jsonMatch[0]);

        // Save to business_plans table
        const existing = await db.select()
          .from(businessPlans)
          .where(eq(businessPlans.entityName, input.entityName))
          .limit(1);

        const planData = {
          entityName: input.entityName,
          entityType: input.entityType,
          ...extractedData,
          status: "completed" as const,
          createdByUserId: ctx.user.id,
          completedAt: new Date(),
          updatedAt: new Date(),
        };

        if (existing.length > 0) {
          await db.update(businessPlans)
            .set(planData)
            .where(eq(businessPlans.id, existing[0].id));
        } else {
          await db.insert(businessPlans).values({
            ...planData,
            createdAt: new Date(),
          });
        }

        return {
          success: true,
          fileUrl: url,
          extractedData,
          message: "Document uploaded and parsed successfully!",
        };
      } catch (parseError) {
        return {
          success: true,
          fileUrl: url,
          message: "File uploaded but parsing failed. You can manually enter the data.",
          needsManualInput: true,
          error: (parseError as Error).message,
        };
      }
    }),

  // Get parsed business plan for an entity
  getParsedPlan: protectedProcedure
    .input(z.object({ entityName: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const plans = await db.select()
        .from(businessPlans)
        .where(eq(businessPlans.entityName, input.entityName))
        .limit(1);

      return plans.length > 0 ? plans[0] : null;
    }),
});
