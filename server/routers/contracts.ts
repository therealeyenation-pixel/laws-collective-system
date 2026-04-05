import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { storagePut, storageGet } from "../storage";
import { TRPCError } from "@trpc/server";

// Contract analysis schema
const contractAnalysisSchema = z.object({
  summary: z.string(),
  keyTerms: z.array(z.object({
    term: z.string(),
    explanation: z.string(),
    risk: z.enum(["low", "medium", "high"]),
  })),
  obligations: z.array(z.object({
    party: z.string(),
    obligation: z.string(),
    deadline: z.string().optional(),
  })),
  risks: z.array(z.object({
    description: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    mitigation: z.string(),
  })),
  recommendations: z.array(z.string()),
  overallRisk: z.enum(["low", "medium", "high"]),
});

// Negotiation strategy schema
const negotiationStrategySchema = z.object({
  position: z.string(),
  leverage: z.array(z.string()),
  weaknesses: z.array(z.string()),
  talkingPoints: z.array(z.string()),
  counterOffers: z.array(z.object({
    original: z.string(),
    suggested: z.string(),
    rationale: z.string(),
  })),
  walkAwayPoints: z.array(z.string()),
});

export const contractsRouter = router({
  // Analyze a contract
  analyzeContract: protectedProcedure
    .input(z.object({
      contractText: z.string().min(100, "Contract text must be at least 100 characters"),
      contractType: z.string(),
      userRole: z.string().optional(),
      userGoals: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { contractText, contractType, userRole, userGoals } = input;

      const systemPrompt = `You are an expert contract analyst and negotiation strategist. Analyze the following contract and provide a comprehensive analysis.

Contract Type: ${contractType}
User Role: ${userRole || "Not specified"}
User Goals: ${userGoals || "Not specified"}

Provide your analysis in the following JSON format:
{
  "summary": "A 2-3 sentence summary of the contract",
  "keyTerms": [
    {
      "term": "Name of the term/clause with section reference",
      "explanation": "Plain language explanation of what this means",
      "risk": "low|medium|high"
    }
  ],
  "obligations": [
    {
      "party": "Which party has this obligation",
      "obligation": "What they must do",
      "deadline": "When (if applicable)"
    }
  ],
  "risks": [
    {
      "description": "Description of the risk",
      "severity": "low|medium|high",
      "mitigation": "How to address this risk"
    }
  ],
  "recommendations": ["List of specific recommendations"],
  "overallRisk": "low|medium|high"
}

Focus on:
1. Identifying terms that may be unfavorable to the user
2. Explaining complex legal language in plain terms
3. Highlighting potential risks and how to mitigate them
4. Providing actionable recommendations`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Please analyze this contract:\n\n${contractText}` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "contract_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  keyTerms: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        term: { type: "string" },
                        explanation: { type: "string" },
                        risk: { type: "string", enum: ["low", "medium", "high"] },
                      },
                      required: ["term", "explanation", "risk"],
                      additionalProperties: false,
                    },
                  },
                  obligations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        party: { type: "string" },
                        obligation: { type: "string" },
                        deadline: { type: "string" },
                      },
                      required: ["party", "obligation"],
                      additionalProperties: false,
                    },
                  },
                  risks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        description: { type: "string" },
                        severity: { type: "string", enum: ["low", "medium", "high"] },
                        mitigation: { type: "string" },
                      },
                      required: ["description", "severity", "mitigation"],
                      additionalProperties: false,
                    },
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                  },
                  overallRisk: { type: "string", enum: ["low", "medium", "high"] },
                },
                required: ["summary", "keyTerms", "obligations", "risks", "recommendations", "overallRisk"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get analysis from AI",
          });
        }

        const analysis = JSON.parse(content);
        return contractAnalysisSchema.parse(analysis);
      } catch (error) {
        console.error("Contract analysis error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze contract",
        });
      }
    }),

  // Generate negotiation strategy
  generateStrategy: protectedProcedure
    .input(z.object({
      contractText: z.string(),
      analysis: contractAnalysisSchema,
      userRole: z.string().optional(),
      userGoals: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { contractText, analysis, userRole, userGoals } = input;

      const systemPrompt = `You are an expert negotiation strategist. Based on the contract analysis provided, develop a comprehensive negotiation strategy.

User Role: ${userRole || "Not specified"}
User Goals: ${userGoals || "Not specified"}

Contract Analysis Summary: ${analysis.summary}
Overall Risk Level: ${analysis.overallRisk}
Key Risks: ${analysis.risks.map(r => r.description).join(", ")}

Provide your strategy in the following JSON format:
{
  "position": "Assessment of the user's negotiating position",
  "leverage": ["List of leverage points the user has"],
  "weaknesses": ["List of areas where the user may be at a disadvantage"],
  "talkingPoints": ["Key points to raise in negotiations"],
  "counterOffers": [
    {
      "original": "The current term in the contract",
      "suggested": "The suggested counter-offer",
      "rationale": "Why this is a reasonable ask"
    }
  ],
  "walkAwayPoints": ["Conditions under which the user should walk away"]
}`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate a negotiation strategy for this contract:\n\n${contractText}` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "negotiation_strategy",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  position: { type: "string" },
                  leverage: { type: "array", items: { type: "string" } },
                  weaknesses: { type: "array", items: { type: "string" } },
                  talkingPoints: { type: "array", items: { type: "string" } },
                  counterOffers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        original: { type: "string" },
                        suggested: { type: "string" },
                        rationale: { type: "string" },
                      },
                      required: ["original", "suggested", "rationale"],
                      additionalProperties: false,
                    },
                  },
                  walkAwayPoints: { type: "array", items: { type: "string" } },
                },
                required: ["position", "leverage", "weaknesses", "talkingPoints", "counterOffers", "walkAwayPoints"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate strategy",
          });
        }

        const strategy = JSON.parse(content);
        return negotiationStrategySchema.parse(strategy);
      } catch (error) {
        console.error("Strategy generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate negotiation strategy",
        });
      }
    }),

  // Chat about a contract
  chatAboutContract: protectedProcedure
    .input(z.object({
      contractText: z.string(),
      analysis: contractAnalysisSchema.optional(),
      question: z.string(),
      chatHistory: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const { contractText, analysis, question, chatHistory } = input;

      const systemPrompt = `You are an expert contract analyst helping a user understand their contract. You have access to the full contract text and any prior analysis.

${analysis ? `
Contract Summary: ${analysis.summary}
Overall Risk: ${analysis.overallRisk}
Key Terms: ${analysis.keyTerms.map(t => `${t.term}: ${t.explanation}`).join("\n")}
` : ""}

Guidelines:
1. Answer questions clearly and concisely
2. Reference specific sections when relevant
3. Provide actionable advice when appropriate
4. Use plain language, avoiding unnecessary legal jargon
5. If asked about negotiation, provide specific talking points
6. Format responses with markdown for readability`;

      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the contract text for reference:\n\n${contractText.substring(0, 10000)}` },
      ];

      // Add chat history
      if (chatHistory) {
        for (const msg of chatHistory) {
          messages.push({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content,
          });
        }
      }

      // Add current question
      messages.push({ role: "user", content: question });

      try {
        const response = await invokeLLM({ messages });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get response",
          });
        }

        return { response: content };
      } catch (error) {
        console.error("Chat error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process question",
        });
      }
    }),

  // Save contract analysis
  saveAnalysis: protectedProcedure
    .input(z.object({
      contractName: z.string(),
      contractType: z.string(),
      analysis: contractAnalysisSchema,
      strategy: negotiationStrategySchema.optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // In a full implementation, this would save to the database
      // For now, we'll store in S3 as JSON
      const userId = ctx.user.id;
      const timestamp = Date.now();
      const fileKey = `contracts/${userId}/analysis-${timestamp}.json`;

      const data = {
        contractName: input.contractName,
        contractType: input.contractType,
        analysis: input.analysis,
        strategy: input.strategy,
        createdAt: new Date().toISOString(),
        userId,
      };

      try {
        const { url } = await storagePut(
          fileKey,
          JSON.stringify(data, null, 2),
          "application/json"
        );

        return {
          success: true,
          fileKey,
          url,
        };
      } catch (error) {
        console.error("Save analysis error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save analysis",
        });
      }
    }),
});
