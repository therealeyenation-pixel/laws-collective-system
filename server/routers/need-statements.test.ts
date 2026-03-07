/**
 * Need Statements Router Tests
 * Phase 48: Need Statement Enhancement
 */

import { describe, it, expect } from "vitest";
import {
  getNeedStatement,
  getAllNeedStatements,
  getNeedStatementSummary,
} from "../services/need-statements";

describe("Need Statements Router Integration", () => {
  describe("getByEntity", () => {
    it("should return need statement for Real-Eye-Nation", () => {
      const statement = getNeedStatement("realeyenation");
      expect(statement).not.toBeNull();
      expect(statement?.entityName).toBe("Real-Eye-Nation LLC");
      expect(statement?.entityType).toBe("LLC");
      expect(statement?.wordCount).toBeGreaterThan(400);
    });

    it("should return need statement for The L.A.W.S. Collective", () => {
      const statement = getNeedStatement("laws");
      expect(statement).not.toBeNull();
      expect(statement?.entityName).toBe("The L.A.W.S. Collective, LLC");
      expect(statement?.entityType).toBe("LLC");
      expect(statement?.wordCount).toBeGreaterThan(400);
    });

    it("should return need statement for LuvOnPurpose AWS", () => {
      const statement = getNeedStatement("luvonpurpose");
      expect(statement).not.toBeNull();
      expect(statement?.entityName).toBe("LuvOnPurpose Autonomous Wealth System LLC");
      expect(statement?.entityType).toBe("LLC");
      expect(statement?.wordCount).toBeGreaterThan(400);
    });

    it("should return need statement for 508 Academy", () => {
      const statement = getNeedStatement("508academy");
      expect(statement).not.toBeNull();
      expect(statement?.entityName).toBe("LuvOnPurpose Outreach Temple and Academy Society, Inc.");
      expect(statement?.entityType).toBe("508(c)(1)(a)");
      expect(statement?.wordCount).toBeGreaterThan(400);
    });

    it("should return null for unknown entity", () => {
      const statement = getNeedStatement("unknown");
      expect(statement).toBeNull();
    });

    it("should return null for trust entity (trusts not eligible for grants)", () => {
      const statement = getNeedStatement("trust");
      expect(statement).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return all 4 need statements", () => {
      const statements = getAllNeedStatements();
      expect(statements).toHaveLength(4);
    });

    it("should include all entity types", () => {
      const statements = getAllNeedStatements();
      const entityIds = statements.map(s => s.entityId);
      expect(entityIds).toContain("realeyenation");
      expect(entityIds).toContain("laws");
      expect(entityIds).toContain("luvonpurpose");
      expect(entityIds).toContain("508academy");
    });

    it("should have word counts for all statements", () => {
      const statements = getAllNeedStatements();
      statements.forEach(s => {
        expect(s.wordCount).toBeGreaterThan(0);
      });
    });
  });

  describe("getSummary", () => {
    it("should return summary with correct totals", () => {
      const summary = getNeedStatementSummary();
      expect(summary.totalEntities).toBe(4);
      expect(summary.completedStatements).toBe(4);
      expect(summary.averageWordCount).toBeGreaterThan(400);
    });

    it("should include entity details", () => {
      const summary = getNeedStatementSummary();
      expect(summary.entities).toHaveLength(4);
      summary.entities.forEach(e => {
        expect(e.hasStatement).toBe(true);
        expect(e.wordCount).toBeGreaterThan(0);
      });
    });
  });

  describe("The L.A.W.S. Collective Funding Amount", () => {
    it("should include $1M-$3M funding range in statement", () => {
      const statement = getNeedStatement("laws");
      expect(statement?.statement).toContain("$1 million to $3 million");
    });

    it("should include scalable funding breakdown", () => {
      const statement = getNeedStatement("laws");
      expect(statement?.statement).toContain("$500K-$1M");
      expect(statement?.statement).toContain("$1M-$1.5M");
      expect(statement?.statement).toContain("$500K-$750K");
    });

    it("should include regional hub locations", () => {
      const statement = getNeedStatement("laws");
      expect(statement?.statement).toContain("Atlanta");
      expect(statement?.statement).toContain("Birmingham");
      expect(statement?.statement).toContain("Memphis");
    });

    it("should include scaled impact projections", () => {
      const statement = getNeedStatement("laws");
      expect(statement?.statement).toContain("1,000 new entrepreneurs");
      expect(statement?.statement).toContain("3,000 entrepreneurs");
      expect(statement?.statement).toContain("5,000+ entrepreneurs");
    });
  });

  describe("Entity Name Mapping", () => {
    // These tests verify the router's entity name mapping works correctly
    const entityMappings = [
      { input: "realeyenation", expectedId: "realeyenation" },
      { input: "laws", expectedId: "laws" },
      { input: "luvonpurpose", expectedId: "luvonpurpose" },
      { input: "508academy", expectedId: "508academy" },
    ];

    entityMappings.forEach(({ input, expectedId }) => {
      it(`should map "${input}" to correct entity`, () => {
        const statement = getNeedStatement(input);
        expect(statement?.entityId).toBe(expectedId);
      });
    });
  });

  describe("Statement Content Quality", () => {
    it("should have professional problem identification for each entity", () => {
      const statements = getAllNeedStatements();
      statements.forEach(s => {
        // Each statement should contain key professional elements
        expect(s.statement.toLowerCase()).toMatch(/challenge|problem|gap|need/);
      });
    });

    it("should have target population description for each entity", () => {
      const statements = getAllNeedStatements();
      statements.forEach(s => {
        expect(s.statement.toLowerCase()).toMatch(/target|population|serve|community/);
      });
    });

    it("should have funding request for each entity", () => {
      const statements = getAllNeedStatements();
      statements.forEach(s => {
        expect(s.statement.toLowerCase()).toMatch(/funding|grant|support|investment/);
      });
    });

    it("should have proof of concept for each entity", () => {
      const statements = getAllNeedStatements();
      statements.forEach(s => {
        expect(s.statement.toLowerCase()).toMatch(/demonstrated|pilot|served|already/);
      });
    });
  });

  describe("Word Count Validation", () => {
    it("should have minimum 400 words for each statement", () => {
      const statements = getAllNeedStatements();
      statements.forEach(s => {
        expect(s.wordCount).toBeGreaterThanOrEqual(400);
      });
    });

    it("should have maximum 700 words for each statement", () => {
      const statements = getAllNeedStatements();
      statements.forEach(s => {
        expect(s.wordCount).toBeLessThanOrEqual(700);
      });
    });

    it("should have average around 500 words", () => {
      const summary = getNeedStatementSummary();
      expect(summary.averageWordCount).toBeGreaterThanOrEqual(450);
      expect(summary.averageWordCount).toBeLessThanOrEqual(600);
    });
  });
});
