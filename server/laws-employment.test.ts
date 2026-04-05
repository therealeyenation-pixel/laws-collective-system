import { describe, it, expect } from 'vitest';
import { getDb } from './db';
import { sql } from 'drizzle-orm';

describe('L.A.W.S. Employment Portal', () => {
  // Test database tables exist
  describe('Database Schema', () => {
    it('should have laws_positions table', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_name = 'laws_positions'
      `);
      expect((result[0] as any[])[0].count).toBeGreaterThan(0);
    });

    it('should have position_funding table', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_name = 'position_funding'
      `);
      expect((result[0] as any[])[0].count).toBeGreaterThan(0);
    });

    it('should have laws_applications table', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_name = 'laws_applications'
      `);
      expect((result[0] as any[])[0].count).toBeGreaterThan(0);
    });

    it('should have progression_pathways table', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_name = 'progression_pathways'
      `);
      expect((result[0] as any[])[0].count).toBeGreaterThan(0);
    });

    it('should have community_impact_metrics table', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_name = 'community_impact_metrics'
      `);
      expect((result[0] as any[])[0].count).toBeGreaterThan(0);
    });
  });

  // Test seeded data
  describe('Seeded Data', () => {
    it('should have progression pathways for all 4 L.A.W.S. pillars', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        SELECT DISTINCT pillar FROM progression_pathways
      `);
      const pillars = (result[0] as any[]).map(r => r.pillar);
      expect(pillars).toContain('LAND');
      expect(pillars).toContain('AIR');
      expect(pillars).toContain('WATER');
      expect(pillars).toContain('SELF');
    });

    it('should have positions for each pillar', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        SELECT pillar, COUNT(*) as count FROM laws_positions GROUP BY pillar
      `);
      expect((result[0] as any[]).length).toBeGreaterThanOrEqual(4);
    });

    it('should have funding records for positions', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        SELECT COUNT(*) as count FROM position_funding
      `);
      expect((result[0] as any[])[0].count).toBeGreaterThan(0);
    });
  });

  // Test position queries
  describe('Position Queries', () => {
    it('should retrieve open positions', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        SELECT * FROM laws_positions WHERE status = 'open'
      `);
      expect((result[0] as any[]).length).toBeGreaterThan(0);
    });

    it('should filter positions by pillar', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        SELECT * FROM laws_positions WHERE pillar = 'LAND'
      `);
      const positions = result[0] as any[];
      positions.forEach(p => {
        expect(p.pillar).toBe('LAND');
      });
    });

    it('should join positions with funding information', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        SELECT p.*, pf.funding_type, pf.budget_amount
        FROM laws_positions p
        LEFT JOIN position_funding pf ON p.id = pf.position_id
        WHERE pf.funding_type IS NOT NULL
      `);
      expect((result[0] as any[]).length).toBeGreaterThan(0);
    });
  });

  // Test progression pathways
  describe('Progression Pathways', () => {
    it('should have 4 stages in each pathway', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        SELECT * FROM progression_pathways LIMIT 1
      `);
      const pathway = (result[0] as any[])[0];
      expect(pathway.stage_1_title).toBeTruthy();
      expect(pathway.stage_2_title).toBeTruthy();
      expect(pathway.stage_3_title).toBeTruthy();
      expect(pathway.stage_4_title).toBeTruthy();
    });

    it('should have estimated timeline for each pathway', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        SELECT * FROM progression_pathways
      `);
      (result[0] as any[]).forEach(pathway => {
        expect(pathway.estimated_timeline_months).toBeGreaterThan(0);
      });
    });
  });

  // Test funding types
  describe('Position Funding', () => {
    it('should have grant-funded positions', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        SELECT COUNT(*) as count FROM position_funding WHERE funding_type = 'grant_funded'
      `);
      expect((result[0] as any[])[0].count).toBeGreaterThan(0);
    });

    it('should have revenue-funded positions', async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const result = await db.execute(sql`
        SELECT COUNT(*) as count FROM position_funding WHERE funding_type = 'revenue_funded'
      `);
      expect((result[0] as any[])[0].count).toBeGreaterThan(0);
    });
  });
});
