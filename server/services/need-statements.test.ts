/**
 * Unit tests for Need Statements Service
 * Phase 48: Need Statement Enhancement
 */

import { describe, it, expect } from 'vitest';
import {
  getNeedStatement,
  getAllNeedStatements,
  getNeedStatementSummary,
  REAL_EYE_NATION_NEED_STATEMENT,
  LAWS_COLLECTIVE_NEED_STATEMENT,
  LUVONPURPOSE_AWS_NEED_STATEMENT,
  LUVONPURPOSE_ACADEMY_NEED_STATEMENT,
} from './need-statements';

describe('Need Statements Service', () => {
  describe('getNeedStatement', () => {
    it('should return need statement for Real-Eye-Nation LLC', () => {
      const statement = getNeedStatement('realeyenation');
      expect(statement).not.toBeNull();
      expect(statement?.entityName).toBe('Real-Eye-Nation LLC');
      expect(statement?.entityType).toBe('LLC');
      expect(statement?.wordCount).toBeGreaterThan(400);
    });

    it('should return need statement for The The L.A.W.S. Collective', () => {
      const statement = getNeedStatement('laws');
      expect(statement).not.toBeNull();
      expect(statement?.entityName).toBe('The The The L.A.W.S. Collective, LLC');
      expect(statement?.entityType).toBe('LLC');
      expect(statement?.wordCount).toBeGreaterThan(400);
    });

    it('should return need statement for LuvOnPurpose AWS', () => {
      const statement = getNeedStatement('luvonpurpose');
      expect(statement).not.toBeNull();
      expect(statement?.entityName).toBe('LuvOnPurpose Autonomous Wealth System LLC');
      expect(statement?.entityType).toBe('LLC');
      expect(statement?.wordCount).toBeGreaterThan(400);
    });

    it('should return need statement for 508 Academy', () => {
      const statement = getNeedStatement('508academy');
      expect(statement).not.toBeNull();
      expect(statement?.entityName).toBe('LuvOnPurpose Outreach Temple and Academy Society, Inc.');
      expect(statement?.entityType).toBe('508(c)(1)(a)');
      expect(statement?.wordCount).toBeGreaterThan(400);
    });

    it('should return null for unknown entity', () => {
      const statement = getNeedStatement('unknown');
      expect(statement).toBeNull();
    });

    it('should return null for trust entity (trusts do not apply for grants)', () => {
      const statement = getNeedStatement('trust');
      expect(statement).toBeNull();
    });
  });

  describe('getAllNeedStatements', () => {
    it('should return all 4 need statements', () => {
      const statements = getAllNeedStatements();
      expect(statements).toHaveLength(4);
    });

    it('should include all entity types', () => {
      const statements = getAllNeedStatements();
      const entityIds = statements.map(s => s.entityId);
      expect(entityIds).toContain('realeyenation');
      expect(entityIds).toContain('laws');
      expect(entityIds).toContain('luvonpurpose');
      expect(entityIds).toContain('508academy');
    });

    it('should have statements with proper word counts', () => {
      const statements = getAllNeedStatements();
      statements.forEach(statement => {
        expect(statement.wordCount).toBeGreaterThan(400);
        expect(statement.wordCount).toBeLessThan(600);
      });
    });
  });

  describe('getNeedStatementSummary', () => {
    it('should return correct summary statistics', () => {
      const summary = getNeedStatementSummary();
      expect(summary.totalEntities).toBe(4);
      expect(summary.completedStatements).toBe(4);
      expect(summary.averageWordCount).toBeGreaterThan(400);
    });

    it('should include all entities in summary', () => {
      const summary = getNeedStatementSummary();
      expect(summary.entities).toHaveLength(4);
      summary.entities.forEach(entity => {
        expect(entity.hasStatement).toBe(true);
        expect(entity.wordCount).toBeGreaterThan(0);
      });
    });
  });

  describe('Statement Content Quality', () => {
    it('Real-Eye-Nation statement should mention media and storytelling', () => {
      expect(REAL_EYE_NATION_NEED_STATEMENT).toContain('media');
      expect(REAL_EYE_NATION_NEED_STATEMENT).toContain('storytelling');
    });

    it('The The L.A.W.S. Collective statement should mention workforce development', () => {
      expect(LAWS_COLLECTIVE_NEED_STATEMENT).toContain('workforce');
      expect(LAWS_COLLECTIVE_NEED_STATEMENT).toContain('employment');
      expect(LAWS_COLLECTIVE_NEED_STATEMENT).toContain('entrepreneurship');
    });

    it('LuvOnPurpose AWS statement should mention wealth building and automation', () => {
      expect(LUVONPURPOSE_AWS_NEED_STATEMENT).toContain('wealth');
      expect(LUVONPURPOSE_AWS_NEED_STATEMENT).toContain('automation');
      expect(LUVONPURPOSE_AWS_NEED_STATEMENT).toContain('generational');
    });

    it('508 Academy statement should mention faith-based education', () => {
      expect(LUVONPURPOSE_ACADEMY_NEED_STATEMENT).toContain('faith');
      expect(LUVONPURPOSE_ACADEMY_NEED_STATEMENT).toContain('education');
      expect(LUVONPURPOSE_ACADEMY_NEED_STATEMENT).toContain('community');
    });

    it('all statements should include funding request language', () => {
      const statements = [
        REAL_EYE_NATION_NEED_STATEMENT,
        LAWS_COLLECTIVE_NEED_STATEMENT,
        LUVONPURPOSE_AWS_NEED_STATEMENT,
        LUVONPURPOSE_ACADEMY_NEED_STATEMENT,
      ];
      statements.forEach(statement => {
        expect(statement.toLowerCase()).toContain('funding');
      });
    });

    it('all statements should include target population', () => {
      const statements = [
        REAL_EYE_NATION_NEED_STATEMENT,
        LAWS_COLLECTIVE_NEED_STATEMENT,
        LUVONPURPOSE_AWS_NEED_STATEMENT,
        LUVONPURPOSE_ACADEMY_NEED_STATEMENT,
      ];
      statements.forEach(statement => {
        expect(statement.toLowerCase()).toContain('target population');
      });
    });

    it('all statements should include impact metrics or proof of concept', () => {
      const statements = [
        REAL_EYE_NATION_NEED_STATEMENT,
        LAWS_COLLECTIVE_NEED_STATEMENT,
        LUVONPURPOSE_AWS_NEED_STATEMENT,
        LUVONPURPOSE_ACADEMY_NEED_STATEMENT,
      ];
      statements.forEach(statement => {
        // Check for percentage signs or numbers indicating metrics
        expect(statement).toMatch(/\d+%|\d+,\d+|\d+ (families|students|members|viewers)/);
      });
    });
  });

  describe('Statement Word Count Validation', () => {
    it('Real-Eye-Nation statement should be approximately 500 words', () => {
      const wordCount = REAL_EYE_NATION_NEED_STATEMENT.split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(450);
      expect(wordCount).toBeLessThanOrEqual(600);
    });

    it('The The L.A.W.S. Collective statement should be approximately 500 words', () => {
      const wordCount = LAWS_COLLECTIVE_NEED_STATEMENT.split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(450);
      expect(wordCount).toBeLessThanOrEqual(600);
    });

    it('LuvOnPurpose AWS statement should be approximately 500 words', () => {
      const wordCount = LUVONPURPOSE_AWS_NEED_STATEMENT.split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(450);
      expect(wordCount).toBeLessThanOrEqual(600);
    });

    it('508 Academy statement should be approximately 500 words', () => {
      const wordCount = LUVONPURPOSE_ACADEMY_NEED_STATEMENT.split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(450);
      expect(wordCount).toBeLessThanOrEqual(600);
    });
  });
});
