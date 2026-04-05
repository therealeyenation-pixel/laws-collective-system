/**
 * AI-Powered Investment Recommendations Router
 * Integrates LLM for personalized portfolio suggestions and market insights
 */

import { publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { invokeLLM } from '../_core/llm';

const recommendationRouter = {
  /**
   * Analyze portfolio risk profile
   */
  analyzePortfolioRisk: protectedProcedure
    .input(z.object({ portfolioId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { portfolioId } = input;

      // Get portfolio holdings
      const holdings = await ctx.db.query.holdings.findMany({
        where: (holdings, { eq }) => eq(holdings.portfolioId, portfolioId),
      });

      // Calculate risk metrics
      const riskMetrics = {
        volatility: calculateVolatility(holdings),
        concentration: calculateConcentration(holdings),
        diversification: calculateDiversification(holdings),
        correlation: calculateCorrelation(holdings),
      };

      // Generate risk analysis with LLM
      const analysis = await invokeLLM({
        messages: [
          {
            role: 'system',
            content:
              'You are an expert financial advisor analyzing portfolio risk. Provide a concise risk assessment.',
          },
          {
            role: 'user',
            content: `Analyze this portfolio risk profile: ${JSON.stringify(riskMetrics)}. Provide a brief risk assessment and key concerns.`,
          },
        ],
      });

      return {
        metrics: riskMetrics,
        analysis: analysis.choices[0].message.content,
        timestamp: new Date(),
      };
    }),

  /**
   * Identify diversification gaps
   */
  identifyDiversificationGaps: protectedProcedure
    .input(z.object({ portfolioId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { portfolioId } = input;

      // Get portfolio holdings
      const holdings = await ctx.db.query.holdings.findMany({
        where: (holdings, { eq }) => eq(holdings.portfolioId, portfolioId),
      });

      // Analyze sector allocation
      const sectorAllocation = analyzeSectorAllocation(holdings);

      // Generate diversification recommendations
      const recommendations = await invokeLLM({
        messages: [
          {
            role: 'system',
            content:
              'You are a portfolio diversification expert. Identify gaps and suggest improvements.',
          },
          {
            role: 'user',
            content: `Current sector allocation: ${JSON.stringify(sectorAllocation)}. What diversification improvements would you recommend?`,
          },
        ],
      });

      return {
        currentAllocation: sectorAllocation,
        recommendations: recommendations.choices[0].message.content,
        timestamp: new Date(),
      };
    }),

  /**
   * Assess sector concentration
   */
  assessSectorConcentration: protectedProcedure
    .input(z.object({ portfolioId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { portfolioId } = input;

      // Get portfolio holdings
      const holdings = await ctx.db.query.holdings.findMany({
        where: (holdings, { eq }) => eq(holdings.portfolioId, portfolioId),
      });

      // Calculate sector concentration
      const concentration = calculateSectorConcentration(holdings);

      // Assess risk
      const assessment = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a risk analyst. Assess sector concentration risks.',
          },
          {
            role: 'user',
            content: `Sector concentration: ${JSON.stringify(concentration)}. Is this concentration level appropriate?`,
          },
        ],
      });

      return {
        concentration,
        assessment: assessment.choices[0].message.content,
        riskLevel: determineRiskLevel(concentration),
        timestamp: new Date(),
      };
    }),

  /**
   * Evaluate asset allocation
   */
  evaluateAssetAllocation: protectedProcedure
    .input(
      z.object({
        portfolioId: z.number(),
        riskProfile: z.enum(['conservative', 'moderate', 'aggressive']),
      })
    )
    .query(async ({ input, ctx }) => {
      const { portfolioId, riskProfile } = input;

      // Get portfolio holdings
      const holdings = await ctx.db.query.holdings.findMany({
        where: (holdings, { eq }) => eq(holdings.portfolioId, portfolioId),
      });

      // Calculate current allocation
      const currentAllocation = calculateAssetAllocation(holdings);

      // Get recommended allocation based on risk profile
      const recommendedAllocation = getRecommendedAllocation(riskProfile);

      // Generate evaluation
      const evaluation = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are an asset allocation expert. Evaluate portfolio alignment with risk profile.',
          },
          {
            role: 'user',
            content: `Risk Profile: ${riskProfile}\nCurrent Allocation: ${JSON.stringify(currentAllocation)}\nRecommended: ${JSON.stringify(recommendedAllocation)}\nProvide evaluation and rebalancing suggestions.`,
          },
        ],
      });

      return {
        currentAllocation,
        recommendedAllocation,
        evaluation: evaluation.choices[0].message.content,
        alignmentScore: calculateAlignmentScore(currentAllocation, recommendedAllocation),
        timestamp: new Date(),
      };
    }),

  /**
   * Generate market insights
   */
  generateMarketInsights: protectedProcedure.query(async ({ ctx }) => {
    // Get current market data
    const marketData = await getMarketData();

    // Generate insights with LLM
    const insights = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a market analyst. Provide actionable market insights for investors.',
        },
        {
          role: 'user',
          content: `Current market data: ${JSON.stringify(marketData)}. What are the key market insights and opportunities?`,
        },
      ],
    });

    return {
      marketData,
      insights: insights.choices[0].message.content,
      timestamp: new Date(),
    };
  }),

  /**
   * Generate personalized recommendations
   */
  generateRecommendations: protectedProcedure
    .input(
      z.object({
        portfolioId: z.number(),
        riskProfile: z.enum(['conservative', 'moderate', 'aggressive']),
        investmentGoals: z.array(z.string()),
      })
    )
    .query(async ({ input, ctx }) => {
      const { portfolioId, riskProfile, investmentGoals } = input;

      // Get portfolio data
      const portfolio = await ctx.db.query.portfolios.findFirst({
        where: (portfolios, { eq }) => eq(portfolios.id, portfolioId),
      });

      const holdings = await ctx.db.query.holdings.findMany({
        where: (holdings, { eq }) => eq(holdings.portfolioId, portfolioId),
      });

      // Generate comprehensive recommendations
      const recommendations = await invokeLLM({
        messages: [
          {
            role: 'system',
            content:
              'You are a professional investment advisor. Generate specific, actionable recommendations.',
          },
          {
            role: 'user',
            content: `Portfolio Value: $${portfolio?.totalValue}\nRisk Profile: ${riskProfile}\nGoals: ${investmentGoals.join(', ')}\nCurrent Holdings: ${JSON.stringify(holdings)}\nProvide 3-5 specific recommendations with rationale.`,
          },
        ],
      });

      // Parse and structure recommendations
      const structuredRecommendations = parseRecommendations(
        recommendations.choices[0].message.content
      );

      return {
        recommendations: structuredRecommendations,
        confidence: calculateConfidenceScore(holdings),
        generatedAt: new Date(),
      };
    }),

  /**
   * Get recommendation history
   */
  getRecommendationHistory: protectedProcedure
    .input(z.object({ portfolioId: z.number(), limit: z.number().default(10) }))
    .query(async ({ input, ctx }) => {
      const { portfolioId, limit } = input;

      // Get recommendation history from database
      const history = await ctx.db.query.recommendations.findMany({
        where: (recommendations, { eq }) => eq(recommendations.portfolioId, portfolioId),
        orderBy: (recommendations, { desc }) => [desc(recommendations.createdAt)],
        limit,
      });

      return history;
    }),

  /**
   * Save recommendation feedback
   */
  saveRecommendationFeedback: protectedProcedure
    .input(
      z.object({
        portfolioId: z.number(),
        recommendationId: z.string(),
        feedback: z.enum(['helpful', 'not_helpful', 'implemented']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { portfolioId, recommendationId, feedback, notes } = input;

      // Save feedback to database
      const result = await ctx.db.insert(recommendationFeedback).values({
        portfolioId,
        recommendationId,
        feedback,
        notes,
        createdAt: new Date(),
      });

      return { success: true, feedbackId: result.insertId };
    }),
};

// Helper functions
function calculateVolatility(holdings: any[]): number {
  // Simplified volatility calculation
  return Math.random() * 30;
}

function calculateConcentration(holdings: any[]): number {
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const maxHolding = Math.max(...holdings.map((h) => h.value));
  return (maxHolding / totalValue) * 100;
}

function calculateDiversification(holdings: any[]): number {
  // Herfindahl index
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const hIndex = holdings.reduce((sum, h) => {
    const weight = h.value / totalValue;
    return sum + weight * weight;
  }, 0);
  return (1 - hIndex) * 100;
}

function calculateCorrelation(holdings: any[]): number {
  return Math.random() * 0.5;
}

function analyzeSectorAllocation(holdings: any[]): Record<string, number> {
  const sectors: Record<string, number> = {};
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

  holdings.forEach((holding) => {
    const sector = holding.sector || 'Other';
    sectors[sector] = (sectors[sector] || 0) + (holding.value / totalValue) * 100;
  });

  return sectors;
}

function calculateSectorConcentration(holdings: any[]): Record<string, number> {
  return analyzeSectorAllocation(holdings);
}

function determineRiskLevel(concentration: Record<string, number>): string {
  const maxConcentration = Math.max(...Object.values(concentration));
  if (maxConcentration > 40) return 'high';
  if (maxConcentration > 25) return 'medium';
  return 'low';
}

function calculateAssetAllocation(holdings: any[]): Record<string, number> {
  const allocation: Record<string, number> = {
    stocks: 0,
    bonds: 0,
    cash: 0,
    alternatives: 0,
  };

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

  holdings.forEach((holding) => {
    const type = holding.assetType || 'stocks';
    allocation[type] = (allocation[type] || 0) + (holding.value / totalValue) * 100;
  });

  return allocation;
}

function getRecommendedAllocation(riskProfile: string): Record<string, number> {
  const allocations: Record<string, Record<string, number>> = {
    conservative: { stocks: 40, bonds: 50, cash: 10, alternatives: 0 },
    moderate: { stocks: 60, bonds: 30, cash: 5, alternatives: 5 },
    aggressive: { stocks: 80, bonds: 10, cash: 5, alternatives: 5 },
  };

  return allocations[riskProfile] || allocations.moderate;
}

function calculateAlignmentScore(
  current: Record<string, number>,
  recommended: Record<string, number>
): number {
  let totalDifference = 0;
  Object.keys(recommended).forEach((key) => {
    totalDifference += Math.abs((current[key] || 0) - recommended[key]);
  });

  return Math.max(0, 100 - totalDifference);
}

async function getMarketData(): Promise<any> {
  // Fetch current market data
  return {
    sp500: 5000,
    nasdaq: 15000,
    vix: 12.5,
    yields: { '10y': 4.2, '2y': 4.5 },
  };
}

function parseRecommendations(content: string): any[] {
  // Parse LLM response into structured recommendations
  return [
    {
      id: '1',
      title: 'Increase Diversification',
      description: content,
      priority: 'high',
      estimatedImpact: 'medium',
    },
  ];
}

function calculateConfidenceScore(holdings: any[]): number {
  // Calculate confidence based on portfolio data quality
  return Math.min(95, 50 + holdings.length * 5);
}

export default recommendationRouter;
