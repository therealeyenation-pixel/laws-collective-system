/**
 * Need Statements Router
 * Phase 48: Need Statement Enhancement
 * Provides API access to professional need statements for grant applications
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import {
  getNeedStatement,
  getAllNeedStatements,
  getNeedStatementSummary,
  type NeedStatement,
} from "../services/need-statements";

export const needStatementsRouter = router({
  /**
   * Get need statement for a specific entity
   */
  getByEntity: protectedProcedure
    .input(z.object({
      entityId: z.string(),
    }))
    .query(({ input }) => {
      const statement = getNeedStatement(input.entityId);
      return {
        success: statement !== null,
        statement,
        message: statement ? 'Need statement found' : 'No need statement available for this entity',
      };
    }),

  /**
   * Get all need statements
   */
  getAll: protectedProcedure
    .query(() => {
      const statements = getAllNeedStatements();
      return {
        success: true,
        statements,
        count: statements.length,
      };
    }),

  /**
   * Get need statement summary for dashboard
   */
  getSummary: protectedProcedure
    .query(() => {
      const summary = getNeedStatementSummary();
      return {
        success: true,
        summary,
      };
    }),

  /**
   * Get need statement for grant application auto-fill
   * Maps entity names to entity IDs for the Grant Simulator
   */
  getForGrantApplication: protectedProcedure
    .input(z.object({
      entityName: z.string(),
    }))
    .query(({ input }) => {
      // Map entity names to IDs
      const entityNameToId: Record<string, string> = {
        'Real-Eye-Nation LLC': 'realeyenation',
        'Real-Eye-Nation': 'realeyenation',
        'realeyenation': 'realeyenation',
        'The The The L.A.W.S. Collective, LLC': 'laws',
        'The The The L.A.W.S. Collective LLC': 'laws',
        'The The L.A.W.S. Collective': 'laws',
        'LAWS Collective': 'laws',
        'laws': 'laws',
        'LuvOnPurpose Autonomous Wealth System LLC': 'luvonpurpose',
        'LuvOnPurpose AWS': 'luvonpurpose',
        'luvonpurpose': 'luvonpurpose',
        'LuvOnPurpose Outreach Temple and Academy Society, Inc.': '508academy',
        '508-LuvOnPurpose Academy': '508academy',
        '508 Academy': '508academy',
        '508academy': '508academy',
      };

      const entityId = entityNameToId[input.entityName] || input.entityName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const statement = getNeedStatement(entityId);

      if (!statement) {
        return {
          success: false,
          statement: null,
          message: `No need statement available for "${input.entityName}". This entity may be a trust (trusts are not eligible for grants) or the entity name was not recognized.`,
        };
      }

      return {
        success: true,
        statement,
        message: 'Need statement ready for grant application',
      };
    }),

  /**
   * Get word count statistics for all statements
   */
  getWordCountStats: protectedProcedure
    .query(() => {
      const statements = getAllNeedStatements();
      const wordCounts = statements.map(s => s.wordCount);
      const total = wordCounts.reduce((sum, count) => sum + count, 0);
      
      return {
        success: true,
        stats: {
          totalStatements: statements.length,
          totalWords: total,
          averageWords: Math.round(total / statements.length),
          minWords: Math.min(...wordCounts),
          maxWords: Math.max(...wordCounts),
          byEntity: statements.map(s => ({
            entityId: s.entityId,
            entityName: s.entityName,
            wordCount: s.wordCount,
            meetsMinimum: s.wordCount >= 400,
          })),
        },
      };
    }),
});
