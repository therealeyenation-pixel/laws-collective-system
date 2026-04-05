import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";

// Helper function to generate blockchain hash
function generateBlockchainHash(): string {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(Date.now().toString() + Math.random().toString())
    .digest('hex');
}

export const workerProgressionRouter = router({
  // ============================================
  // WORKER PROGRESSION MANAGEMENT
  // ============================================
  
  // Create or get worker progression record
  initializeProgression: protectedProcedure
    .input(z.object({
      userId: z.number(),
      workerId: z.number().optional(),
      workerType: z.enum(['w2_employee', 'contractor']),
      primaryDepartmentId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const now = Date.now();
      
      // Check if progression already exists
      const [existing] = await db.execute(
        `SELECT * FROM worker_progressions WHERE userId = ?`,
        [input.userId]
      );
      
      if ((existing as any[]).length > 0) {
        return (existing as any[])[0];
      }
      
      // Create new progression
      const [result] = await db.execute(
        `INSERT INTO worker_progressions (userId, workerId, workerType, primaryDepartmentId, currentStage, stageEnteredAt)
         VALUES (?, ?, ?, ?, 'w2_employee', NOW())`,
        [input.userId, input.workerId || null, input.workerType, input.primaryDepartmentId || null]
      );
      
      const progressionId = (result as any).insertId;
      
      // Log the event
      await db.execute(
        `INSERT INTO progression_events (progressionId, eventType, description, newValue, triggeredBySystem, blockchainHash, createdAt)
         VALUES (?, 'stage_change', 'Worker progression initialized', 'w2_employee', TRUE, ?, NOW())`,
        [progressionId, generateBlockchainHash()]
      );
      
      const [newProgression] = await db.execute(
        `SELECT * FROM worker_progressions WHERE id = ?`,
        [progressionId]
      );
      
      return (newProgression as any[])[0];
    }),

  // Get worker progression by user ID
  getProgression: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [rows] = await db.execute(
        `SELECT wp.*, u.name as userName, u.email as userEmail
         FROM worker_progressions wp
         LEFT JOIN users u ON wp.userId = u.id
         WHERE wp.userId = ?`,
        [input.userId]
      );
      return (rows as any[])[0] || null;
    }),

  // Get all progressions with filters
  getAllProgressions: protectedProcedure
    .input(z.object({
      stage: z.enum(['w2_employee', 'senior_employee', 'contractor', 'certified_contractor', 'business_owner', 'house_member', 'all']).default('all'),
      departmentId: z.number().optional(),
      nextStageEligible: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      let query = `
        SELECT wp.*, u.name as userName, u.email as userEmail,
               sd.name as departmentName
        FROM worker_progressions wp
        LEFT JOIN users u ON wp.userId = u.id
        LEFT JOIN service_departments sd ON wp.primaryDepartmentId = sd.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (input?.stage && input.stage !== 'all') {
        query += ` AND wp.currentStage = ?`;
        params.push(input.stage);
      }
      if (input?.departmentId) {
        query += ` AND wp.primaryDepartmentId = ?`;
        params.push(input.departmentId);
      }
      if (input?.nextStageEligible !== undefined) {
        query += ` AND wp.nextStageEligible = ?`;
        params.push(input.nextStageEligible);
      }
      
      query += ` ORDER BY wp.createdAt DESC`;
      
      const [rows] = await db.execute(query, params);
      return rows as any[];
    }),

  // Update progression stage
  advanceStage: protectedProcedure
    .input(z.object({
      progressionId: z.number(),
      newStage: z.enum(['senior_employee', 'contractor', 'certified_contractor', 'business_owner', 'house_member']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      
      // Get current progression
      const [current] = await db.execute(
        `SELECT * FROM worker_progressions WHERE id = ?`,
        [input.progressionId]
      );
      const progression = (current as any[])[0];
      
      if (!progression) {
        throw new Error('Progression not found');
      }
      
      // Verify stage order
      const stageOrder = ['w2_employee', 'senior_employee', 'contractor', 'certified_contractor', 'business_owner', 'house_member'];
      const currentIndex = stageOrder.indexOf(progression.currentStage);
      const newIndex = stageOrder.indexOf(input.newStage);
      
      if (newIndex <= currentIndex) {
        throw new Error('Cannot move to a lower or same stage');
      }
      
      // Update progression
      await db.execute(
        `UPDATE worker_progressions 
         SET previousStage = currentStage,
             previousStageExitedAt = NOW(),
             currentStage = ?,
             stageEnteredAt = NOW(),
             nextStageEligible = FALSE,
             readinessScore = 0
         WHERE id = ?`,
        [input.newStage, input.progressionId]
      );
      
      // Log the event
      await db.execute(
        `INSERT INTO progression_events (progressionId, eventType, description, previousValue, newValue, triggeredBy, blockchainHash, createdAt)
         VALUES (?, 'stage_change', ?, ?, ?, ?, ?, NOW())`,
        [
          input.progressionId,
          input.notes || `Advanced from ${progression.currentStage} to ${input.newStage}`,
          progression.currentStage,
          input.newStage,
          ctx.user?.id || null,
          generateBlockchainHash()
        ]
      );
      
      return { success: true, newStage: input.newStage };
    }),

  // Update readiness score
  updateReadinessScore: protectedProcedure
    .input(z.object({
      progressionId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      // Get current progression
      const [current] = await db.execute(
        `SELECT * FROM worker_progressions WHERE id = ?`,
        [input.progressionId]
      );
      const progression = (current as any[])[0];
      
      if (!progression) {
        throw new Error('Progression not found');
      }
      
      // Get next stage
      const stageOrder = ['w2_employee', 'senior_employee', 'contractor', 'certified_contractor', 'business_owner', 'house_member'];
      const currentIndex = stageOrder.indexOf(progression.currentStage);
      const nextStage = stageOrder[currentIndex + 1];
      
      if (!nextStage) {
        return { readinessScore: 100, nextStageEligible: false, message: 'Already at highest stage' };
      }
      
      // Get milestones for this transition
      const [milestones] = await db.execute(
        `SELECT * FROM progression_milestones WHERE fromStage = ? AND toStage = ? AND isActive = TRUE`,
        [progression.currentStage, nextStage]
      );
      
      // Calculate readiness based on various factors
      let totalWeight = 0;
      let achievedWeight = 0;
      const blockers: string[] = [];
      
      // Time-based check
      const monthsInStage = Math.floor((Date.now() - new Date(progression.stageEnteredAt).getTime()) / (30 * 24 * 60 * 60 * 1000));
      
      // Quality metrics check
      const qualityScore = Number(progression.qualityScore) || 0;
      const onTimeRate = Number(progression.onTimeDeliveryRate) || 0;
      const clientSatisfaction = Number(progression.clientSatisfactionScore) || 0;
      
      // Simple readiness calculation
      let readinessScore = 0;
      
      // Time factor (25%)
      const timeRequirement = currentIndex === 0 ? 6 : currentIndex === 1 ? 12 : 6;
      const timeFactor = Math.min(monthsInStage / timeRequirement, 1) * 25;
      readinessScore += timeFactor;
      if (monthsInStage < timeRequirement) {
        blockers.push(`Need ${timeRequirement - monthsInStage} more months in current stage`);
      }
      
      // Quality factor (25%)
      const qualityFactor = (qualityScore / 100) * 25;
      readinessScore += qualityFactor;
      if (qualityScore < 80) {
        blockers.push(`Quality score needs to be at least 80% (currently ${qualityScore}%)`);
      }
      
      // On-time delivery factor (25%)
      const deliveryFactor = (onTimeRate / 100) * 25;
      readinessScore += deliveryFactor;
      if (onTimeRate < 90) {
        blockers.push(`On-time delivery rate needs to be at least 90% (currently ${onTimeRate}%)`);
      }
      
      // Client satisfaction factor (25%)
      const satisfactionFactor = (clientSatisfaction / 100) * 25;
      readinessScore += satisfactionFactor;
      if (clientSatisfaction < 85) {
        blockers.push(`Client satisfaction needs to be at least 85% (currently ${clientSatisfaction}%)`);
      }
      
      readinessScore = Math.round(readinessScore);
      const nextStageEligible = readinessScore >= 80 && blockers.length === 0;
      
      // Update progression
      await db.execute(
        `UPDATE worker_progressions 
         SET readinessScore = ?,
             nextStageEligible = ?,
             nextStageBlockers = ?
         WHERE id = ?`,
        [readinessScore, nextStageEligible, JSON.stringify(blockers), input.progressionId]
      );
      
      return { readinessScore, nextStageEligible, blockers, nextStage };
    }),

  // Assign mentor
  assignMentor: protectedProcedure
    .input(z.object({
      progressionId: z.number(),
      mentorId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      
      await db.execute(
        `UPDATE worker_progressions SET mentorId = ?, mentorAssignedAt = NOW() WHERE id = ?`,
        [input.mentorId, input.progressionId]
      );
      
      // Log the event
      await db.execute(
        `INSERT INTO progression_events (progressionId, eventType, description, newValue, triggeredBy, blockchainHash, createdAt)
         VALUES (?, 'mentor_assigned', 'Mentor assigned to worker', ?, ?, ?, NOW())`,
        [input.progressionId, input.mentorId.toString(), ctx.user?.id || null, generateBlockchainHash()]
      );
      
      return { success: true };
    }),

  // Update quality metrics
  updateQualityMetrics: protectedProcedure
    .input(z.object({
      progressionId: z.number(),
      qualityScore: z.number().min(0).max(100).optional(),
      onTimeDeliveryRate: z.number().min(0).max(100).optional(),
      clientSatisfactionScore: z.number().min(0).max(100).optional(),
      revenueGenerated: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const updates: string[] = [];
      const params: any[] = [];
      
      if (input.qualityScore !== undefined) {
        updates.push('qualityScore = ?');
        params.push(input.qualityScore);
      }
      if (input.onTimeDeliveryRate !== undefined) {
        updates.push('onTimeDeliveryRate = ?');
        params.push(input.onTimeDeliveryRate);
      }
      if (input.clientSatisfactionScore !== undefined) {
        updates.push('clientSatisfactionScore = ?');
        params.push(input.clientSatisfactionScore);
      }
      if (input.revenueGenerated !== undefined) {
        updates.push('totalRevenueGenerated = totalRevenueGenerated + ?');
        params.push(input.revenueGenerated);
      }
      
      if (updates.length > 0) {
        params.push(input.progressionId);
        await db.execute(
          `UPDATE worker_progressions SET ${updates.join(', ')} WHERE id = ?`,
          params
        );
      }
      
      return { success: true };
    }),

  // ============================================
  // SKILL CERTIFICATIONS
  // ============================================
  
  // Get all certifications
  getCertifications: publicProcedure
    .input(z.object({
      departmentCode: z.string().optional(),
      level: z.enum(['apprentice', 'journeyman', 'master', 'expert', 'all']).default('all'),
      premiumTier: z.enum(['standard', 'premium', 'elite', 'all']).default('all'),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      let query = `SELECT * FROM skill_certifications WHERE isActive = TRUE`;
      const params: any[] = [];
      
      if (input?.departmentCode) {
        query += ` AND departmentCode = ?`;
        params.push(input.departmentCode);
      }
      if (input?.level && input.level !== 'all') {
        query += ` AND level = ?`;
        params.push(input.level);
      }
      if (input?.premiumTier && input.premiumTier !== 'all') {
        query += ` AND premiumTier = ?`;
        params.push(input.premiumTier);
      }
      
      query += ` ORDER BY displayOrder ASC, level ASC`;
      
      const [rows] = await db.execute(query, params);
      return rows as any[];
    }),

  // Create certification
  createCertification: protectedProcedure
    .input(z.object({
      name: z.string(),
      code: z.string(),
      description: z.string().optional(),
      departmentId: z.number().optional(),
      departmentCode: z.string().optional(),
      level: z.enum(['apprentice', 'journeyman', 'master', 'expert']),
      requiredTrainingHours: z.number().default(0),
      requiredPracticeHours: z.number().default(0),
      validityMonths: z.number().default(24),
      premiumTier: z.enum(['standard', 'premium', 'elite']).default('standard'),
      assessmentFee: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      const [result] = await db.execute(
        `INSERT INTO skill_certifications 
         (name, code, description, departmentId, departmentCode, level, requiredTrainingHours, requiredPracticeHours, validityMonths, premiumTier, assessmentFee)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.name, input.code, input.description || null,
          input.departmentId || null, input.departmentCode || null,
          input.level, input.requiredTrainingHours, input.requiredPracticeHours,
          input.validityMonths, input.premiumTier, input.assessmentFee
        ]
      );
      
      return { success: true, id: (result as any).insertId };
    }),

  // Award certification to worker
  awardCertification: protectedProcedure
    .input(z.object({
      progressionId: z.number(),
      certificationId: z.number(),
      assessmentScore: z.number().optional(),
      assessmentNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      
      // Get certification details
      const [certRows] = await db.execute(
        `SELECT * FROM skill_certifications WHERE id = ?`,
        [input.certificationId]
      );
      const certification = (certRows as any[])[0];
      
      if (!certification) {
        throw new Error('Certification not found');
      }
      
      // Calculate expiration
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + certification.validityMonths);
      
      // Generate certificate number
      const certificateNumber = `CERT-${certification.code}-${Date.now().toString(36).toUpperCase()}`;
      const blockchainHash = generateBlockchainHash();
      
      // Create worker certification record
      const [result] = await db.execute(
        `INSERT INTO worker_certifications 
         (progressionId, certificationId, status, earnedAt, expiresAt, assessmentScore, assessmentDate, assessorId, assessmentNotes, certificateNumber, blockchainHash)
         VALUES (?, ?, 'active', NOW(), ?, ?, NOW(), ?, ?, ?, ?)`,
        [
          input.progressionId, input.certificationId,
          expiresAt, input.assessmentScore || null,
          ctx.user?.id || null, input.assessmentNotes || null,
          certificateNumber, blockchainHash
        ]
      );
      
      // Log the event
      await db.execute(
        `INSERT INTO progression_events (progressionId, eventType, description, newValue, triggeredBy, blockchainHash, createdAt)
         VALUES (?, 'certification_earned', ?, ?, ?, ?, NOW())`,
        [
          input.progressionId,
          `Earned ${certification.name} certification`,
          certification.code,
          ctx.user?.id || null,
          blockchainHash
        ]
      );
      
      return { success: true, certificateNumber, blockchainHash };
    }),

  // Get worker's certifications
  getWorkerCertifications: protectedProcedure
    .input(z.object({ progressionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [rows] = await db.execute(
        `SELECT wc.*, sc.name as certificationName, sc.code as certificationCode, 
                sc.level, sc.premiumTier, sc.badgeUrl, sc.badgeColor
         FROM worker_certifications wc
         JOIN skill_certifications sc ON wc.certificationId = sc.id
         WHERE wc.progressionId = ?
         ORDER BY wc.earnedAt DESC`,
        [input.progressionId]
      );
      return rows as any[];
    }),

  // ============================================
  // EXCELLENCE BADGES
  // ============================================
  
  // Get all badges
  getBadges: publicProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(
      `SELECT * FROM excellence_badges WHERE isActive = TRUE ORDER BY tier DESC, category ASC`
    );
    return rows as any[];
  }),

  // Award badge to worker
  awardBadge: protectedProcedure
    .input(z.object({
      progressionId: z.number(),
      badgeId: z.number(),
      achievementValue: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      
      // Get badge details
      const [badgeRows] = await db.execute(
        `SELECT * FROM excellence_badges WHERE id = ?`,
        [input.badgeId]
      );
      const badge = (badgeRows as any[])[0];
      
      if (!badge) {
        throw new Error('Badge not found');
      }
      
      // Calculate expiration for period-based badges
      let expiresAt = null;
      if (badge.requirementPeriod !== 'one_time') {
        expiresAt = new Date();
        switch (badge.requirementPeriod) {
          case 'monthly':
            expiresAt.setMonth(expiresAt.getMonth() + 1);
            break;
          case 'quarterly':
            expiresAt.setMonth(expiresAt.getMonth() + 3);
            break;
          case 'annual':
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
            break;
        }
      }
      
      const blockchainHash = generateBlockchainHash();
      
      // Create worker badge record
      await db.execute(
        `INSERT INTO worker_badges (progressionId, badgeId, status, earnedAt, expiresAt, achievementValue, blockchainHash)
         VALUES (?, ?, 'active', NOW(), ?, ?, ?)`,
        [input.progressionId, input.badgeId, expiresAt, input.achievementValue || null, blockchainHash]
      );
      
      // Award tokens if applicable
      if (badge.tokenReward > 0) {
        // Token reward logic would go here
      }
      
      // Log the event
      await db.execute(
        `INSERT INTO progression_events (progressionId, eventType, description, newValue, triggeredBy, blockchainHash, createdAt)
         VALUES (?, 'badge_earned', ?, ?, ?, ?, NOW())`,
        [
          input.progressionId,
          `Earned ${badge.name} badge (${badge.tier})`,
          badge.code,
          ctx.user?.id || null,
          blockchainHash
        ]
      );
      
      return { success: true, tokenReward: badge.tokenReward };
    }),

  // Get worker's badges
  getWorkerBadges: protectedProcedure
    .input(z.object({ progressionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [rows] = await db.execute(
        `SELECT wb.*, eb.name as badgeName, eb.code as badgeCode, 
                eb.category, eb.tier, eb.badgeUrl, eb.badgeColor, eb.tokenReward
         FROM worker_badges wb
         JOIN excellence_badges eb ON wb.badgeId = eb.id
         WHERE wb.progressionId = ? AND wb.status = 'active'
         ORDER BY wb.earnedAt DESC`,
        [input.progressionId]
      );
      return rows as any[];
    }),

  // ============================================
  // SKILL TAXONOMY & WORKER SKILLS
  // ============================================
  
  // Get skill taxonomy
  getSkillTaxonomy: publicProcedure
    .input(z.object({
      domain: z.string().optional(),
      parentId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      let query = `SELECT * FROM skill_taxonomy WHERE isActive = TRUE`;
      const params: any[] = [];
      
      if (input?.domain) {
        query += ` AND domain = ?`;
        params.push(input.domain);
      }
      if (input?.parentId !== undefined) {
        query += ` AND parentId = ?`;
        params.push(input.parentId);
      }
      
      query += ` ORDER BY domain ASC, name ASC`;
      
      const [rows] = await db.execute(query, params);
      return rows as any[];
    }),

  // Add skill to worker
  addWorkerSkill: protectedProcedure
    .input(z.object({
      progressionId: z.number(),
      skillId: z.number(),
      selfAssessedLevel: z.enum(['novice', 'beginner', 'intermediate', 'advanced', 'master']).optional(),
      yearsExperience: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      await db.execute(
        `INSERT INTO worker_skills (progressionId, skillId, selfAssessedLevel, yearsExperience)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE selfAssessedLevel = VALUES(selfAssessedLevel), yearsExperience = VALUES(yearsExperience)`,
        [input.progressionId, input.skillId, input.selfAssessedLevel || 'novice', input.yearsExperience || 0]
      );
      
      return { success: true };
    }),

  // Verify worker skill
  verifyWorkerSkill: protectedProcedure
    .input(z.object({
      progressionId: z.number(),
      skillId: z.number(),
      verifiedLevel: z.enum(['novice', 'beginner', 'intermediate', 'advanced', 'master']),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      
      await db.execute(
        `UPDATE worker_skills 
         SET verifiedLevel = ?, verifiedBy = ?, verifiedAt = NOW(), proficiencyLevel = ?
         WHERE progressionId = ? AND skillId = ?`,
        [input.verifiedLevel, ctx.user?.id || null, input.verifiedLevel, input.progressionId, input.skillId]
      );
      
      // Log the event
      await db.execute(
        `INSERT INTO progression_events (progressionId, eventType, description, newValue, triggeredBy, blockchainHash, createdAt)
         VALUES (?, 'skill_verified', 'Skill level verified', ?, ?, ?, NOW())`,
        [input.progressionId, input.verifiedLevel, ctx.user?.id || null, generateBlockchainHash()]
      );
      
      return { success: true };
    }),

  // Get worker's skills
  getWorkerSkills: protectedProcedure
    .input(z.object({ progressionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [rows] = await db.execute(
        `SELECT ws.*, st.name as skillName, st.code as skillCode, st.domain, st.technologyTrend
         FROM worker_skills ws
         JOIN skill_taxonomy st ON ws.skillId = st.id
         WHERE ws.progressionId = ?
         ORDER BY ws.proficiencyLevel DESC, st.name ASC`,
        [input.progressionId]
      );
      return rows as any[];
    }),

  // ============================================
  // LEARNING PATHWAYS
  // ============================================
  
  // Get learning pathways
  getLearningPathways: publicProcedure
    .input(z.object({
      targetStage: z.string().optional(),
      targetDepartment: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      let query = `SELECT * FROM learning_pathways WHERE isActive = TRUE`;
      const params: any[] = [];
      
      if (input?.targetStage) {
        query += ` AND targetStage = ?`;
        params.push(input.targetStage);
      }
      if (input?.targetDepartment) {
        query += ` AND targetDepartment = ?`;
        params.push(input.targetDepartment);
      }
      
      query += ` ORDER BY targetStage ASC, name ASC`;
      
      const [rows] = await db.execute(query, params);
      return rows as any[];
    }),

  // ============================================
  // PROGRESSION EVENTS (AUDIT TRAIL)
  // ============================================
  
  // Get progression events
  getProgressionEvents: protectedProcedure
    .input(z.object({
      progressionId: z.number(),
      eventType: z.string().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      let query = `
        SELECT pe.*, u.name as triggeredByName
        FROM progression_events pe
        LEFT JOIN users u ON pe.triggeredBy = u.id
        WHERE pe.progressionId = ?
      `;
      const params: any[] = [input.progressionId];
      
      if (input.eventType) {
        query += ` AND pe.eventType = ?`;
        params.push(input.eventType);
      }
      
      query += ` ORDER BY pe.createdAt DESC LIMIT ?`;
      params.push(input.limit);
      
      const [rows] = await db.execute(query, params);
      return rows as any[];
    }),

  // ============================================
  // QUALITY STANDARDS
  // ============================================
  
  // Get quality standards
  getQualityStandards: publicProcedure
    .input(z.object({
      departmentCode: z.string().optional(),
      category: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      let query = `SELECT * FROM quality_standards WHERE isActive = TRUE`;
      const params: any[] = [];
      
      if (input?.departmentCode) {
        query += ` AND departmentCode = ?`;
        params.push(input.departmentCode);
      }
      if (input?.category) {
        query += ` AND category = ?`;
        params.push(input.category);
      }
      
      query += ` ORDER BY departmentCode ASC, category ASC`;
      
      const [rows] = await db.execute(query, params);
      return rows as any[];
    }),

  // ============================================
  // DASHBOARD SUMMARY
  // ============================================
  
  // Get progression dashboard summary
  getProgressionDashboard: protectedProcedure.query(async () => {
    const db = await getDb();
    
    // Count by stage
    const [stageCounts] = await db.execute(`
      SELECT currentStage, COUNT(*) as count
      FROM worker_progressions
      GROUP BY currentStage
    `);
    
    // Count eligible for advancement
    const [eligibleCount] = await db.execute(`
      SELECT COUNT(*) as count FROM worker_progressions WHERE nextStageEligible = TRUE
    `);
    
    // Recent certifications
    const [recentCerts] = await db.execute(`
      SELECT wc.*, sc.name as certificationName, wp.userId
      FROM worker_certifications wc
      JOIN skill_certifications sc ON wc.certificationId = sc.id
      JOIN worker_progressions wp ON wc.progressionId = wp.id
      WHERE wc.status = 'active'
      ORDER BY wc.earnedAt DESC
      LIMIT 5
    `);
    
    // Recent badges
    const [recentBadges] = await db.execute(`
      SELECT wb.*, eb.name as badgeName, eb.tier, wp.userId
      FROM worker_badges wb
      JOIN excellence_badges eb ON wb.badgeId = eb.id
      JOIN worker_progressions wp ON wb.progressionId = wp.id
      WHERE wb.status = 'active'
      ORDER BY wb.earnedAt DESC
      LIMIT 5
    `);
    
    return {
      stageCounts: stageCounts as any[],
      eligibleForAdvancement: Number((eligibleCount as any[])[0]?.count || 0),
      recentCertifications: recentCerts as any[],
      recentBadges: recentBadges as any[],
    };
  }),
});
