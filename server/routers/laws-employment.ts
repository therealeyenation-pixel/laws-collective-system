import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { sql } from "drizzle-orm";

// L.A.W.S. Employment Portal Router
// Manages job opportunities by L.A.W.S. pillar (LAND, AIR, WATER, SELF)
// Tracks grant-funded vs revenue-funded positions
// Links positions to progression pathways (W-2 → Contractor → Business Owner → House Member)

export const lawsEmploymentRouter = router({
  // Get all positions with optional filtering
  getPositions: publicProcedure
    .input(z.object({
      pillar: z.enum(['LAND', 'AIR', 'WATER', 'SELF']).optional(),
      status: z.enum(['open', 'filled', 'on_hold', 'closed']).optional(),
      employmentType: z.enum(['w2_full_time', 'w2_part_time', 'contractor', 'apprentice', 'volunteer']).optional(),
      fundingType: z.enum(['grant_funded', 'revenue_funded', 'mixed', 'donation_funded']).optional(),
    }).optional())
    .query(async ({ input }) => {
      let query = `
        SELECT 
          p.*,
          pf.funding_type,
          pf.grant_id,
          pf.funding_percentage,
          pf.budget_amount,
          pp.name as pathway_name,
          pp.stage_1_title,
          pp.stage_2_title,
          pp.stage_3_title,
          pp.stage_4_title,
          pp.estimated_timeline_months
        FROM laws_positions p
        LEFT JOIN position_funding pf ON p.id = pf.position_id
        LEFT JOIN progression_pathways pp ON p.progression_path_id = pp.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (input?.pillar) {
        query += ` AND p.pillar = ?`;
        params.push(input.pillar);
      }
      if (input?.status) {
        query += ` AND p.status = ?`;
        params.push(input.status);
      }
      if (input?.employmentType) {
        query += ` AND p.employment_type = ?`;
        params.push(input.employmentType);
      }
      if (input?.fundingType) {
        query += ` AND pf.funding_type = ?`;
        params.push(input.fundingType);
      }
      
      query += ` ORDER BY p.created_at DESC`;
      
      const result = await db.execute(sql.raw(query));
      return result[0] as any[];
    }),

  // Get single position by ID
  getPosition: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const result = await db.execute(sql`
        SELECT 
          p.*,
          pf.funding_type,
          pf.grant_id,
          pf.funding_percentage,
          pf.budget_amount,
          pf.funding_start_date,
          pf.funding_end_date,
          pp.name as pathway_name,
          pp.description as pathway_description,
          pp.stage_1_title,
          pp.stage_1_duration_months,
          pp.stage_2_title,
          pp.stage_2_duration_months,
          pp.stage_3_title,
          pp.stage_3_requirements,
          pp.stage_4_title,
          pp.stage_4_requirements,
          pp.skills_required,
          pp.certifications_required,
          pp.estimated_timeline_months
        FROM laws_positions p
        LEFT JOIN position_funding pf ON p.id = pf.position_id
        LEFT JOIN progression_pathways pp ON p.progression_path_id = pp.id
        WHERE p.id = ${input.id}
      `);
      return (result[0] as any[])[0] || null;
    }),

  // Create a new position
  createPosition: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      pillar: z.enum(['LAND', 'AIR', 'WATER', 'SELF']),
      department: z.string().optional(),
      employmentType: z.enum(['w2_full_time', 'w2_part_time', 'contractor', 'apprentice', 'volunteer']),
      salaryMin: z.number().optional(),
      salaryMax: z.number().optional(),
      hourlyRate: z.number().optional(),
      requirements: z.string().optional(),
      qualifications: z.string().optional(),
      progressionPathId: z.number().optional(),
      fundingType: z.enum(['grant_funded', 'revenue_funded', 'mixed', 'donation_funded']).optional(),
      grantId: z.number().optional(),
      budgetAmount: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      // Insert position
      const positionResult = await db.execute(sql`
        INSERT INTO laws_positions (
          title, description, pillar, department, employment_type,
          salary_min, salary_max, hourly_rate, requirements, qualifications,
          progression_path_id, status
        ) VALUES (
          ${input.title},
          ${input.description || null},
          ${input.pillar},
          ${input.department || null},
          ${input.employmentType},
          ${input.salaryMin || null},
          ${input.salaryMax || null},
          ${input.hourlyRate || null},
          ${input.requirements || null},
          ${input.qualifications || null},
          ${input.progressionPathId || null},
          'open'
        )
      `);
      
      const positionId = (positionResult[0] as any).insertId;
      
      // Insert funding if provided
      if (input.fundingType) {
        await db.execute(sql`
          INSERT INTO position_funding (
            position_id, funding_type, grant_id, budget_amount
          ) VALUES (
            ${positionId},
            ${input.fundingType},
            ${input.grantId || null},
            ${input.budgetAmount || null}
          )
        `);
      }
      
      return { id: positionId, success: true };
    }),

  // Update position status
  updatePositionStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['open', 'filled', 'on_hold', 'closed']),
    }))
    .mutation(async ({ input }) => {
      await db.execute(sql`
        UPDATE laws_positions SET status = ${input.status} WHERE id = ${input.id}
      `);
      return { success: true };
    }),

  // Get all progression pathways
  getProgressionPathways: publicProcedure
    .input(z.object({
      pillar: z.enum(['LAND', 'AIR', 'WATER', 'SELF']).optional(),
    }).optional())
    .query(async ({ input }) => {
      if (input?.pillar) {
        const result = await db.execute(sql`
          SELECT * FROM progression_pathways WHERE pillar = ${input.pillar} ORDER BY name
        `);
        return result[0] as any[];
      }
      const result = await db.execute(sql`SELECT * FROM progression_pathways ORDER BY pillar, name`);
      return result[0] as any[];
    }),

  // Create progression pathway
  createProgressionPathway: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      pillar: z.enum(['LAND', 'AIR', 'WATER', 'SELF']),
      stage1Title: z.string(),
      stage1DurationMonths: z.number().default(24),
      stage2Title: z.string(),
      stage2DurationMonths: z.number().default(12),
      stage3Title: z.string(),
      stage3Requirements: z.string().optional(),
      stage4Title: z.string().default('House Member'),
      stage4Requirements: z.string().optional(),
      skillsRequired: z.string().optional(),
      certificationsRequired: z.string().optional(),
      estimatedTimelineMonths: z.number().default(48),
      successMetrics: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await db.execute(sql`
        INSERT INTO progression_pathways (
          name, description, pillar,
          stage_1_title, stage_1_duration_months,
          stage_2_title, stage_2_duration_months,
          stage_3_title, stage_3_requirements,
          stage_4_title, stage_4_requirements,
          skills_required, certifications_required,
          estimated_timeline_months, success_metrics
        ) VALUES (
          ${input.name},
          ${input.description || null},
          ${input.pillar},
          ${input.stage1Title},
          ${input.stage1DurationMonths},
          ${input.stage2Title},
          ${input.stage2DurationMonths},
          ${input.stage3Title},
          ${input.stage3Requirements || null},
          ${input.stage4Title},
          ${input.stage4Requirements || null},
          ${input.skillsRequired || null},
          ${input.certificationsRequired || null},
          ${input.estimatedTimelineMonths},
          ${input.successMetrics || null}
        )
      `);
      return { id: (result[0] as any).insertId, success: true };
    }),

  // Submit application
  submitApplication: publicProcedure
    .input(z.object({
      positionId: z.number(),
      applicantName: z.string(),
      applicantEmail: z.string().email(),
      applicantPhone: z.string().optional(),
      resumeUrl: z.string().optional(),
      coverLetter: z.string().optional(),
      referralSource: z.string().optional(),
      communityConnection: z.string().optional(),
      skills: z.string().optional(),
      experienceYears: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await db.execute(sql`
        INSERT INTO laws_applications (
          position_id, applicant_name, applicant_email, applicant_phone,
          resume_url, cover_letter, referral_source, community_connection,
          skills, experience_years, status
        ) VALUES (
          ${input.positionId},
          ${input.applicantName},
          ${input.applicantEmail},
          ${input.applicantPhone || null},
          ${input.resumeUrl || null},
          ${input.coverLetter || null},
          ${input.referralSource || null},
          ${input.communityConnection || null},
          ${input.skills || null},
          ${input.experienceYears || null},
          'submitted'
        )
      `);
      return { id: (result[0] as any).insertId, success: true };
    }),

  // Get applications for a position
  getApplications: protectedProcedure
    .input(z.object({
      positionId: z.number().optional(),
      status: z.enum(['submitted', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']).optional(),
    }).optional())
    .query(async ({ input }) => {
      let query = `
        SELECT 
          a.*,
          p.title as position_title,
          p.pillar,
          p.department
        FROM laws_applications a
        JOIN laws_positions p ON a.position_id = p.id
        WHERE 1=1
      `;
      
      if (input?.positionId) {
        query += ` AND a.position_id = ${input.positionId}`;
      }
      if (input?.status) {
        query += ` AND a.status = '${input.status}'`;
      }
      
      query += ` ORDER BY a.created_at DESC`;
      
      const result = await db.execute(sql.raw(query));
      return result[0] as any[];
    }),

  // Update application status
  updateApplicationStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['submitted', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.execute(sql`
        UPDATE laws_applications 
        SET status = ${input.status}, notes = ${input.notes || null}
        WHERE id = ${input.id}
      `);
      return { success: true };
    }),

  // Get community impact metrics
  getImpactMetrics: publicProcedure
    .input(z.object({
      pillar: z.enum(['LAND', 'AIR', 'WATER', 'SELF', 'ALL']).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      // Get aggregated metrics
      const positionsResult = await db.execute(sql`
        SELECT 
          pillar,
          COUNT(*) as total_positions,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_positions,
          SUM(CASE WHEN status = 'filled' THEN 1 ELSE 0 END) as filled_positions
        FROM laws_positions
        GROUP BY pillar
      `);
      
      const fundingResult = await db.execute(sql`
        SELECT 
          pf.funding_type,
          COUNT(*) as position_count,
          SUM(pf.budget_amount) as total_budget
        FROM position_funding pf
        GROUP BY pf.funding_type
      `);
      
      const applicationsResult = await db.execute(sql`
        SELECT 
          status,
          COUNT(*) as count
        FROM laws_applications
        GROUP BY status
      `);
      
      // Get latest impact metrics from table
      const metricsResult = await db.execute(sql`
        SELECT * FROM community_impact_metrics 
        ORDER BY metric_date DESC 
        LIMIT 1
      `);
      
      return {
        positionsByPillar: positionsResult[0],
        fundingBreakdown: fundingResult[0],
        applicationStatus: applicationsResult[0],
        latestMetrics: (metricsResult[0] as any[])[0] || null,
      };
    }),

  // Record impact metrics
  recordImpactMetrics: protectedProcedure
    .input(z.object({
      metricDate: z.string(),
      pillar: z.enum(['LAND', 'AIR', 'WATER', 'SELF', 'ALL']),
      jobsCreated: z.number().default(0),
      jobsFilled: z.number().default(0),
      peopleServed: z.number().default(0),
      w2ToContractorTransitions: z.number().default(0),
      contractorToBusinessTransitions: z.number().default(0),
      businessToHouseTransitions: z.number().default(0),
      totalWagesPaid: z.number().default(0),
      grantFundedPositions: z.number().default(0),
      revenueFundedPositions: z.number().default(0),
      communityReinvestmentAmount: z.number().default(0),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await db.execute(sql`
        INSERT INTO community_impact_metrics (
          metric_date, pillar, jobs_created, jobs_filled, people_served,
          w2_to_contractor_transitions, contractor_to_business_transitions,
          business_to_house_transitions, total_wages_paid,
          grant_funded_positions, revenue_funded_positions,
          community_reinvestment_amount, notes
        ) VALUES (
          ${input.metricDate},
          ${input.pillar},
          ${input.jobsCreated},
          ${input.jobsFilled},
          ${input.peopleServed},
          ${input.w2ToContractorTransitions},
          ${input.contractorToBusinessTransitions},
          ${input.businessToHouseTransitions},
          ${input.totalWagesPaid},
          ${input.grantFundedPositions},
          ${input.revenueFundedPositions},
          ${input.communityReinvestmentAmount},
          ${input.notes || null}
        )
      `);
      return { id: (result[0] as any).insertId, success: true };
    }),

  // Get dashboard stats
  getDashboardStats: publicProcedure.query(async () => {
    const [positions] = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'filled' THEN 1 ELSE 0 END) as filled
      FROM laws_positions
    `);
    
    const [applications] = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'hired' THEN 1 ELSE 0 END) as hired
      FROM laws_applications
    `);
    
    const [byPillar] = await db.execute(sql`
      SELECT pillar, COUNT(*) as count
      FROM laws_positions
      WHERE status = 'open'
      GROUP BY pillar
    `);
    
    const [funding] = await db.execute(sql`
      SELECT 
        SUM(CASE WHEN funding_type = 'grant_funded' THEN 1 ELSE 0 END) as grant_funded,
        SUM(CASE WHEN funding_type = 'revenue_funded' THEN 1 ELSE 0 END) as revenue_funded
      FROM position_funding
    `);
    
    return {
      positions: (positions as any[])[0],
      applications: (applications as any[])[0],
      byPillar: byPillar as any[],
      funding: (funding as any[])[0],
    };
  }),
});

export type LawsEmploymentRouter = typeof lawsEmploymentRouter;
