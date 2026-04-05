/**
 * Brain Employment Automation Router
 * 
 * Phase 31.4: Employment-First Brain Automation Framework
 * 
 * CORE PRINCIPLE: AI enhances human employment, never replaces it.
 * All recommendations prioritize job creation through The L.A.W.S. Collective.
 * 
 * This router implements:
 * 1. Employment opportunity detection (analyzes operations → identifies hiring needs)
 * 2. Job creation recommendation system (suggests positions, skill requirements, compensation)
 * 3. W-2 to Contractor progression guidance (tracks readiness, recommends advancement)
 * 4. Employment tracking and metrics (jobs created, hiring rate, career progression)
 * 5. Employment milestones and celebrations (Luv celebrates achievements)
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";

function generateBlockchainHash(): string {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(Date.now().toString() + Math.random().toString())
    .digest('hex');
}

export const brainEmploymentAutomationRouter = router({
  // ============================================
  // EMPLOYMENT OPPORTUNITY DETECTION
  // ============================================

  /**
   * Analyze business operations and detect where human workers are needed
   * Returns job opportunity recommendations based on:
   * - Current workload and capacity
   * - Department staffing levels
   * - Project pipeline and growth
   * - Skill gaps and training needs
   */
  detectEmploymentOpportunities: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      departmentId: z.number().optional(),
      analysisType: z.enum(['full', 'department', 'growth', 'replacement']).default('full'),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();

      // Get department staffing levels
      const [staffingData] = await db.execute(
        `SELECT 
          sd.id, 
          sd.name as departmentName,
          COUNT(DISTINCT CASE WHEN wp.currentStage IN ('w2_employee', 'senior_employee') THEN wp.userId END) as currentStaff,
          COUNT(DISTINCT CASE WHEN wp.currentStage IN ('contractor', 'certified_contractor') THEN wp.userId END) as contractors,
          sd.targetHeadcount,
          sd.growthRate
        FROM service_departments sd
        LEFT JOIN worker_progressions wp ON sd.id = wp.primaryDepartmentId
        WHERE sd.houseId = ? OR ? IS NULL
        GROUP BY sd.id`,
        [input.houseId, input.departmentId || null]
      );

      // Get active projects and workload
      const [projectData] = await db.execute(
        `SELECT 
          COUNT(*) as activeProjects,
          SUM(CASE WHEN status = 'high_priority' THEN 1 ELSE 0 END) as highPriorityProjects,
          AVG(teamSize) as avgTeamSize
        FROM projects
        WHERE houseId = ? AND status IN ('active', 'in_progress')`,
        [input.houseId]
      );

      // Analyze skill gaps
      const [skillGaps] = await db.execute(
        `SELECT 
          skillName,
          COUNT(*) as demandCount,
          AVG(proficiencyRequired) as avgProficiency
        FROM skill_requirements sr
        JOIN projects p ON sr.projectId = p.id
        WHERE p.houseId = ? AND p.status IN ('active', 'in_progress')
        GROUP BY skillName
        ORDER BY demandCount DESC
        LIMIT 10`,
        [input.houseId]
      );

      // Generate opportunity recommendations
      const opportunities: any[] = [];
      const staffing = staffingData as any[];
      const projects = projectData as any[];

      for (const dept of staffing) {
        const currentStaff = dept.currentStaff || 0;
        const targetStaff = dept.targetHeadcount || currentStaff + 2;
        const staffingGap = targetStaff - currentStaff;

        if (staffingGap > 0) {
          opportunities.push({
            departmentId: dept.id,
            departmentName: dept.departmentName,
            opportunityType: 'growth',
            positionsNeeded: staffingGap,
            priority: staffingGap > 3 ? 'high' : 'medium',
            recommendedStages: ['w2_employee', 'senior_employee'],
            estimatedImpact: `Hiring ${staffingGap} employees will increase department capacity by ${Math.round((staffingGap / currentStaff) * 100)}%`,
          });
        }

        // Check for contractor conversion opportunities
        const contractors = dept.contractors || 0;
        if (contractors > 0) {
          opportunities.push({
            departmentId: dept.id,
            departmentName: dept.departmentName,
            opportunityType: 'contractor_conversion',
            positionsAvailable: contractors,
            priority: 'medium',
            recommendedStages: ['certified_contractor'],
            estimatedImpact: `Convert ${contractors} contractors to business owners through L.A.W.S. pipeline`,
          });
        }
      }

      // Log employment analysis
      await db.execute(
        `INSERT INTO employment_analysis_logs (houseId, analysisType, opportunitiesFound, recommendations, blockchainHash, createdAt)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [input.houseId, input.analysisType, opportunities.length, JSON.stringify(opportunities), generateBlockchainHash()]
      );

      return {
        houseId: input.houseId,
        analysisDate: new Date(),
        totalOpportunitiesFound: opportunities.length,
        opportunities,
        staffingMetrics: {
          totalCurrentStaff: staffing.reduce((sum, d) => sum + (d.currentStaff || 0), 0),
          totalContractors: staffing.reduce((sum, d) => sum + (d.contractors || 0), 0),
          activeProjects: projects[0]?.activeProjects || 0,
          highPriorityProjects: projects[0]?.highPriorityProjects || 0,
        },
        skillGaps: skillGaps as any[],
      };
    }),

  // ============================================
  // JOB CREATION RECOMMENDATION SYSTEM
  // ============================================

  /**
   * Create a job recommendation that requires human approval
   * All hiring decisions must be approved by a human manager
   */
  createJobRecommendation: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      departmentId: z.number(),
      positionTitle: z.string(),
      description: z.string(),
      recommendedStage: z.enum(['w2_employee', 'senior_employee', 'contractor', 'certified_contractor']),
      estimatedCompensation: z.number().optional(),
      skillsRequired: z.array(z.string()).optional(),
      rationale: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // Create job recommendation (always pending human approval)
      const [result] = await db.execute(
        `INSERT INTO job_recommendations (
          houseId, departmentId, positionTitle, description, 
          recommendedStage, estimatedCompensation, skillsRequired,
          rationale, status, createdBySystem, approvalStatus, blockchainHash, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', TRUE, 'awaiting_approval', ?, NOW())`,
        [
          input.houseId,
          input.departmentId,
          input.positionTitle,
          input.description,
          input.recommendedStage,
          input.estimatedCompensation || null,
          JSON.stringify(input.skillsRequired || []),
          input.rationale,
          generateBlockchainHash(),
        ]
      );

      const recommendationId = (result as any).insertId;

      // Log the recommendation
      await db.execute(
        `INSERT INTO employment_decisions_log (
          recommendationId, decisionType, description, blockchainHash, createdAt
        ) VALUES (?, 'recommendation_created', ?, ?, NOW())`,
        [recommendationId, `Job recommendation created for ${input.positionTitle}`, generateBlockchainHash()]
      );

      return {
        recommendationId,
        status: 'pending',
        message: `Job recommendation for ${input.positionTitle} created and awaiting manager approval`,
        approvalStatus: 'awaiting_approval',
      };
    }),

  /**
   * Manager approves or rejects a job recommendation
   * This is where human decision-making is required
   */
  reviewJobRecommendation: protectedProcedure
    .input(z.object({
      recommendationId: z.number(),
      approved: z.boolean(),
      managerNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      const approvalStatus = input.approved ? 'approved' : 'rejected';

      // Update recommendation
      await db.execute(
        `UPDATE job_recommendations 
         SET approvalStatus = ?, approvedBy = ?, approvedAt = NOW(), managerNotes = ?
         WHERE id = ?`,
        [approvalStatus, ctx.user?.id || null, input.managerNotes || null, input.recommendationId]
      );

      // Log the decision
      await db.execute(
        `INSERT INTO employment_decisions_log (
          recommendationId, decisionType, description, decidedBy, blockchainHash, createdAt
        ) VALUES (?, 'recommendation_reviewed', ?, ?, ?, NOW())`,
        [
          input.recommendationId,
          `Manager ${input.approved ? 'approved' : 'rejected'} job recommendation`,
          ctx.user?.id || null,
          generateBlockchainHash(),
        ]
      );

      return {
        recommendationId: input.recommendationId,
        approvalStatus,
        message: input.approved 
          ? 'Job recommendation approved! Ready to post position.'
          : 'Job recommendation rejected.',
      };
    }),

  // ============================================
  // W-2 TO CONTRACTOR PROGRESSION GUIDANCE
  // ============================================

  /**
   * Analyze employee readiness for progression through the pipeline
   * W-2 → Senior Employee → Contractor → Certified Contractor → Business Owner
   */
  analyzeProgressionReadiness: protectedProcedure
    .input(z.object({
      userId: z.number(),
      departmentId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();

      // Get worker progression
      const [progression] = await db.execute(
        `SELECT * FROM worker_progressions WHERE userId = ?`,
        [input.userId]
      );

      if ((progression as any[]).length === 0) {
        return { error: 'Worker progression not found' };
      }

      const worker = (progression as any[])[0];
      const stageOrder = ['w2_employee', 'senior_employee', 'contractor', 'certified_contractor', 'business_owner', 'house_member'];
      const currentIndex = stageOrder.indexOf(worker.currentStage);
      const nextStage = stageOrder[currentIndex + 1];

      if (!nextStage) {
        return {
          userId: input.userId,
          currentStage: worker.currentStage,
          message: 'Already at highest stage',
          readinessScore: 100,
          canProgress: false,
        };
      }

      // Get performance metrics
      const [metrics] = await db.execute(
        `SELECT 
          qualityScore, onTimeDeliveryRate, clientSatisfactionScore,
          projectsCompleted, hoursWorked
        FROM worker_performance_metrics
        WHERE userId = ?`,
        [input.userId]
      );

      const perf = (metrics as any[])[0] || {
        qualityScore: 0,
        onTimeDeliveryRate: 0,
        clientSatisfactionScore: 0,
        projectsCompleted: 0,
        hoursWorked: 0,
      };

      // Calculate readiness
      const monthsInStage = Math.floor((Date.now() - new Date(worker.stageEnteredAt).getTime()) / (30 * 24 * 60 * 60 * 1000));
      const timeRequirement = currentIndex === 0 ? 6 : currentIndex === 1 ? 12 : 6;

      const readinessScore = 
        (Math.min(monthsInStage / timeRequirement, 1) * 25) +
        ((perf.qualityScore / 100) * 25) +
        ((perf.onTimeDeliveryRate / 100) * 25) +
        ((perf.clientSatisfactionScore / 100) * 25);

      const blockers: string[] = [];
      if (monthsInStage < timeRequirement) {
        blockers.push(`Need ${timeRequirement - monthsInStage} more months in current stage`);
      }
      if (perf.qualityScore < 80) {
        blockers.push(`Quality score needs to be at least 80% (currently ${perf.qualityScore}%)`);
      }
      if (perf.onTimeDeliveryRate < 90) {
        blockers.push(`On-time delivery rate needs to be at least 90% (currently ${perf.onTimeDeliveryRate}%)`);
      }
      if (perf.clientSatisfactionScore < 85) {
        blockers.push(`Client satisfaction needs to be at least 85% (currently ${perf.clientSatisfactionScore}%)`);
      }

      return {
        userId: input.userId,
        currentStage: worker.currentStage,
        nextStage,
        readinessScore: Math.round(readinessScore),
        canProgress: readinessScore >= 80 && blockers.length === 0,
        blockers,
        metrics: {
          monthsInStage,
          timeRequirement,
          qualityScore: perf.qualityScore,
          onTimeDeliveryRate: perf.onTimeDeliveryRate,
          clientSatisfactionScore: perf.clientSatisfactionScore,
          projectsCompleted: perf.projectsCompleted,
        },
        recommendation: readinessScore >= 80 
          ? `${worker.currentStage} is ready to advance to ${nextStage}`
          : `${worker.currentStage} needs to improve metrics before advancing`,
      };
    }),

  // ============================================
  // EMPLOYMENT TRACKING & METRICS
  // ============================================

  /**
   * Get comprehensive employment metrics for a house/entity
   * Tracks jobs created, progression rates, career advancement
   */
  getEmploymentMetrics: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      timeframe: z.enum(['month', 'quarter', 'year', 'all']).default('year'),
    }))
    .query(async ({ input }) => {
      const db = await getDb();

      // Get jobs created
      const [jobsCreated] = await db.execute(
        `SELECT 
          COUNT(*) as totalJobs,
          COUNT(CASE WHEN approvalStatus = 'approved' THEN 1 END) as approvedJobs,
          COUNT(CASE WHEN approvalStatus = 'rejected' THEN 1 END) as rejectedJobs,
          AVG(estimatedCompensation) as avgCompensation
        FROM job_recommendations
        WHERE houseId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL 1 YEAR)`,
        [input.houseId]
      );

      // Get progression statistics
      const [progressionStats] = await db.execute(
        `SELECT 
          currentStage,
          COUNT(*) as count,
          AVG(readinessScore) as avgReadiness
        FROM worker_progressions
        WHERE houseId = ?
        GROUP BY currentStage`,
        [input.houseId]
      );

      // Get stage transitions
      const [transitions] = await db.execute(
        `SELECT 
          previousValue as fromStage,
          newValue as toStage,
          COUNT(*) as transitionCount
        FROM progression_events
        WHERE eventType = 'stage_change' AND createdAt >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
        GROUP BY previousValue, newValue`,
        []
      );

      // Get employment impact
      const [impact] = await db.execute(
        `SELECT 
          COUNT(DISTINCT userId) as totalEmployees,
          COUNT(CASE WHEN currentStage IN ('w2_employee', 'senior_employee') THEN 1 END) as w2Employees,
          COUNT(CASE WHEN currentStage IN ('contractor', 'certified_contractor') THEN 1 END) as contractors,
          COUNT(CASE WHEN currentStage = 'business_owner' THEN 1 END) as businessOwners
        FROM worker_progressions
        WHERE houseId = ?`,
        [input.houseId]
      );

      return {
        houseId: input.houseId,
        timeframe: input.timeframe,
        jobsCreated: (jobsCreated as any[])[0],
        progressionByStage: progressionStats as any[],
        stageTransitions: transitions as any[],
        employmentImpact: (impact as any[])[0],
        summary: {
          totalJobsCreated: (jobsCreated as any[])[0]?.totalJobs || 0,
          approvalRate: ((jobsCreated as any[])[0]?.approvedJobs || 0) / ((jobsCreated as any[])[0]?.totalJobs || 1),
          totalEmployees: (impact as any[])[0]?.totalEmployees || 0,
          contractorConversionRate: ((impact as any[])[0]?.contractors || 0) / ((impact as any[])[0]?.totalEmployees || 1),
          businessOwnerRate: ((impact as any[])[0]?.businessOwners || 0) / ((impact as any[])[0]?.totalEmployees || 1),
        },
      };
    }),

  // ============================================
  // EMPLOYMENT MILESTONES & CELEBRATIONS
  // ============================================

  /**
   * Record employment milestones for Luv to celebrate
   * Luv uses these to communicate achievements and inspire others
   */
  recordEmploymentMilestone: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      milestoneType: z.enum(['job_created', 'employee_hired', 'promotion', 'contractor_conversion', 'business_owner_created', 'team_milestone']),
      description: z.string(),
      relatedUserId: z.number().optional(),
      impact: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      const [result] = await db.execute(
        `INSERT INTO employment_milestones (
          houseId, milestoneType, description, relatedUserId, impact, blockchainHash, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          input.houseId,
          input.milestoneType,
          input.description,
          input.relatedUserId || null,
          input.impact || null,
          generateBlockchainHash(),
        ]
      );

      return {
        milestoneId: (result as any).insertId,
        message: `Employment milestone recorded: ${input.description}`,
        luv_message: `🎉 Celebrating: ${input.description}`,
      };
    }),

  /**
   * Get recent employment milestones for Luv to share
   */
  getRecentMilestones: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const db = await getDb();

      const [milestones] = await db.execute(
        `SELECT * FROM employment_milestones
         WHERE houseId = ?
         ORDER BY createdAt DESC
         LIMIT ?`,
        [input.houseId, input.limit]
      );

      return {
        houseId: input.houseId,
        recentMilestones: milestones as any[],
        count: (milestones as any[]).length,
      };
    }),
});
