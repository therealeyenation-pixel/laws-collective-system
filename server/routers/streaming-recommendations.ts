import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";

export const streamingRecommendationsRouter = router({
  // Get AI-powered recommendations based on user history
  getPersonalizedRecommendations: protectedProcedure
    .input(z.object({ 
      listeningHistory: z.array(z.object({ type: z.string(), title: z.string(), genre: z.string() })),
      contentType: z.enum(["tracks", "channels", "stations"]),
      limit: z.number().default(5)
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Build context from listening history
        const historyContext = input.listeningHistory
          .slice(0, 10)
          .map(item => `${item.type}: ${item.title} (${item.genre})`)
          .join("\n");

        const prompt = `Based on this user's listening history:
${historyContext}

Recommend ${input.limit} ${input.contentType} that they would enjoy. Consider their genre preferences and listening patterns.
Return ONLY a JSON array with objects containing: { title: string, reason: string, genre: string }`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a music and media recommendation expert. Provide personalized recommendations based on user listening history." },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "recommendations",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        reason: { type: "string" },
                        genre: { type: "string" }
                      },
                      required: ["title", "reason", "genre"]
                    }
                  }
                },
                required: ["recommendations"]
              }
            }
          }
        });

        const content = response.choices[0].message.content;
        if (!content) return { recommendations: [] };

        const parsed = JSON.parse(content);
        return { recommendations: parsed.recommendations || [] };
      } catch (error) {
        console.error("Error generating recommendations:", error);
        return { recommendations: [] };
      }
    }),

  // Get similar content based on a specific item
  getSimilarContent: publicProcedure
    .input(z.object({
      contentType: z.enum(["track", "channel", "station"]),
      title: z.string(),
      genre: z.string(),
      limit: z.number().default(5)
    }))
    .mutation(async ({ input }) => {
      try {
        const prompt = `Find ${input.limit} ${input.contentType}s similar to "${input.title}" (genre: ${input.genre}).
Return ONLY a JSON array with objects containing: { title: string, reason: string, genre: string }`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a music and media recommendation expert. Provide similar content recommendations." },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "similar_content",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  similar: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        reason: { type: "string" },
                        genre: { type: "string" }
                      },
                      required: ["title", "reason", "genre"]
                    }
                  }
                },
                required: ["similar"]
              }
            }
          }
        });

        const content = response.choices[0].message.content;
        if (!content) return { similar: [] };

        const parsed = JSON.parse(content);
        return { similar: parsed.similar || [] };
      } catch (error) {
        console.error("Error finding similar content:", error);
        return { similar: [] };
      }
    }),

  // Get mood-based recommendations
  getMoodBasedRecommendations: publicProcedure
    .input(z.object({
      mood: z.string(),
      contentType: z.enum(["tracks", "channels", "stations"]),
      limit: z.number().default(5)
    }))
    .mutation(async ({ input }) => {
      try {
        const prompt = `Recommend ${input.limit} ${input.contentType} for someone feeling "${input.mood}".
Consider the emotional tone and energy level appropriate for this mood.
Return ONLY a JSON array with objects containing: { title: string, reason: string, genre: string, energyLevel: string }`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a music and media recommendation expert. Provide mood-based recommendations that match emotional states." },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "mood_recommendations",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        reason: { type: "string" },
                        genre: { type: "string" },
                        energyLevel: { type: "string" }
                      },
                      required: ["title", "reason", "genre", "energyLevel"]
                    }
                  }
                },
                required: ["recommendations"]
              }
            }
          }
        });

        const content = response.choices[0].message.content;
        if (!content) return { recommendations: [] };

        const parsed = JSON.parse(content);
        return { recommendations: parsed.recommendations || [] };
      } catch (error) {
        console.error("Error generating mood recommendations:", error);
        return { recommendations: [] };
      }
    })
});
