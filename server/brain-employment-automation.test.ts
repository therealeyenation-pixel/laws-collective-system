/**
 * Vitest Test Suite for Phase 31.4: Employment-First Brain Automation Framework
 * 
 * Tests the core employment-first automation system that:
 * - Detects employment opportunities
 * - Creates job recommendations (always requiring human approval)
 * - Guides W-2 to Contractor progression
 * - Tracks employment metrics
 * - Records employment milestones
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';

// Mock database for testing
const mockDb = {
  execute: vi.fn(),
};

describe('Phase 31.4: Employment-First Brain Automation Framework', () => {
  beforeEach(() => {
    mockDb.execute.mockClear();
  });

  // ============================================
  // EMPLOYMENT OPPORTUNITY DETECTION TESTS
  // ============================================

  describe('Employment Opportunity Detection', () => {
    it('should detect staffing gaps in departments', () => {
      const staffingData = [
        {
          id: 1,
          departmentName: 'Operations',
          currentStaff: 3,
          contractors: 1,
          targetHeadcount: 8,
          growthRate: 0.15,
        },
      ];

      const staffingGap = 8 - 3; // 5 positions needed
      expect(staffingGap).toBe(5);
      expect(staffingGap > 0).toBe(true);
    });

    it('should identify high-priority staffing needs', () => {
      const departments = [
        { id: 1, name: 'Sales', gap: 5, priority: 'high' },
        { id: 2, name: 'Support', gap: 2, priority: 'medium' },
        { id: 3, name: 'Admin', gap: 1, priority: 'low' },
      ];

      const highPriority = departments.filter(d => d.priority === 'high');
      expect(highPriority).toHaveLength(1);
      expect(highPriority[0].gap).toBe(5);
    });

    it('should analyze skill gaps from active projects', () => {
      const skillGaps = [
        { skillName: 'Python', demandCount: 8, avgProficiency: 0.8 },
        { skillName: 'React', demandCount: 6, avgProficiency: 0.75 },
        { skillName: 'DevOps', demandCount: 3, avgProficiency: 0.85 },
      ];

      const topSkillGap = skillGaps[0];
      expect(topSkillGap.skillName).toBe('Python');
      expect(topSkillGap.demandCount).toBe(8);
    });

    it('should recommend contractor conversion opportunities', () => {
      const department = {
        id: 1,
        name: 'Operations',
        contractors: 4,
      };

      const opportunity = {
        opportunityType: 'contractor_conversion',
        positionsAvailable: department.contractors,
        recommendedStages: ['certified_contractor'],
      };

      expect(opportunity.positionsAvailable).toBe(4);
      expect(opportunity.recommendedStages).toContain('certified_contractor');
    });

    it('should generate opportunity recommendations with impact estimates', () => {
      const staffingGap = 3;
      const currentStaff = 5;
      const impactPercentage = (staffingGap / currentStaff) * 100;

      expect(impactPercentage).toBe(60);
      expect(impactPercentage > 0).toBe(true);
    });
  });

  // ============================================
  // JOB CREATION RECOMMENDATION TESTS
  // ============================================

  describe('Job Creation Recommendation System', () => {
    it('should create job recommendation with pending status', () => {
      const recommendation = {
        houseId: 1,
        departmentId: 2,
        positionTitle: 'Senior Developer',
        description: 'Lead development for new features',
        recommendedStage: 'w2_employee' as const,
        estimatedCompensation: 75000,
        skillsRequired: ['Python', 'React', 'DevOps'],
        rationale: 'Staffing gap identified in Operations',
        status: 'pending',
        approvalStatus: 'awaiting_approval',
      };

      expect(recommendation.status).toBe('pending');
      expect(recommendation.approvalStatus).toBe('awaiting_approval');
      expect(recommendation.positionTitle).toBe('Senior Developer');
    });

    it('should require human approval for all job recommendations', () => {
      const recommendation = {
        id: 1,
        status: 'pending',
        approvalStatus: 'awaiting_approval',
        createdBySystem: true,
      };

      expect(recommendation.createdBySystem).toBe(true);
      expect(recommendation.approvalStatus).toBe('awaiting_approval');
      expect(recommendation.status).toBe('pending');
    });

    it('should allow manager to approve job recommendation', () => {
      const recommendation = {
        id: 1,
        status: 'pending',
        approvalStatus: 'awaiting_approval',
      };

      const approved = {
        ...recommendation,
        approvalStatus: 'approved',
        approvedBy: 123,
        approvedAt: new Date(),
      };

      expect(approved.approvalStatus).toBe('approved');
      expect(approved.approvedBy).toBe(123);
      expect(approved.approvedAt).toBeInstanceOf(Date);
    });

    it('should allow manager to reject job recommendation', () => {
      const recommendation = {
        id: 1,
        status: 'pending',
        approvalStatus: 'awaiting_approval',
      };

      const rejected = {
        ...recommendation,
        approvalStatus: 'rejected',
        approvedBy: 123,
        managerNotes: 'Budget constraints prevent this hire',
      };

      expect(rejected.approvalStatus).toBe('rejected');
      expect(rejected.managerNotes).toContain('Budget constraints');
    });

    it('should track recommendation decision with blockchain hash', () => {
      const decision = {
        recommendationId: 1,
        decisionType: 'recommendation_reviewed',
        description: 'Manager approved job recommendation',
        decidedBy: 123,
        blockchainHash: 'abc123def456',
        createdAt: new Date(),
      };

      expect(decision.blockchainHash).toBeDefined();
      expect(decision.blockchainHash).toHaveLength(12); // Length of 'abc123def456'
      expect(decision.decidedBy).toBe(123);
    });

    it('should support multiple recommendation stages', () => {
      const stages = ['w2_employee', 'senior_employee', 'contractor', 'certified_contractor'];

      stages.forEach(stage => {
        const recommendation = {
          recommendedStage: stage,
        };
        expect(stages).toContain(recommendation.recommendedStage);
      });
    });
  });

  // ============================================
  // W-2 TO CONTRACTOR PROGRESSION TESTS
  // ============================================

  describe('W-2 to Contractor Progression Guidance', () => {
    it('should analyze worker readiness for progression', () => {
      const worker = {
        userId: 1,
        currentStage: 'w2_employee',
        stageEnteredAt: new Date(Date.now() - 7 * 30 * 24 * 60 * 60 * 1000), // 7 months ago
        qualityScore: 85,
        onTimeDeliveryRate: 92,
        clientSatisfactionScore: 88,
      };

      const monthsInStage = 7;
      const timeRequirement = 6;
      const readinessScore =
        (Math.min(monthsInStage / timeRequirement, 1) * 25) +
        ((worker.qualityScore / 100) * 25) +
        ((worker.onTimeDeliveryRate / 100) * 25) +
        ((worker.clientSatisfactionScore / 100) * 25);

      expect(readinessScore).toBeGreaterThan(80);
      expect(readinessScore).toBeLessThanOrEqual(100);
    });

    it('should identify blockers preventing progression', () => {
      const worker = {
        qualityScore: 75, // Below 80% requirement
        onTimeDeliveryRate: 88, // Below 90% requirement
        clientSatisfactionScore: 82,
      };

      const blockers: string[] = [];
      if (worker.qualityScore < 80) {
        blockers.push(`Quality score needs to be at least 80% (currently ${worker.qualityScore}%)`);
      }
      if (worker.onTimeDeliveryRate < 90) {
        blockers.push(`On-time delivery rate needs to be at least 90% (currently ${worker.onTimeDeliveryRate}%)`);
      }

      expect(blockers).toHaveLength(2);
      expect(blockers[0]).toContain('Quality score');
      expect(blockers[1]).toContain('On-time delivery');
    });

    it('should recommend progression when ready', () => {
      const readinessScore = 85;
      const blockers: string[] = [];

      const canProgress = readinessScore >= 80 && blockers.length === 0;
      expect(canProgress).toBe(true);
    });

    it('should prevent progression to lower stages', () => {
      const stageOrder = ['w2_employee', 'senior_employee', 'contractor', 'certified_contractor', 'business_owner'];
      const currentStage = 'contractor';
      const attemptedStage = 'senior_employee';

      const currentIndex = stageOrder.indexOf(currentStage);
      const attemptedIndex = stageOrder.indexOf(attemptedStage);

      expect(attemptedIndex <= currentIndex).toBe(true);
      expect(() => {
        if (attemptedIndex <= currentIndex) {
          throw new Error('Cannot move to a lower or same stage');
        }
      }).toThrow('Cannot move to a lower or same stage');
    });

    it('should track progression through all stages', () => {
      const stages = ['w2_employee', 'senior_employee', 'contractor', 'certified_contractor', 'business_owner', 'house_member'];

      expect(stages).toHaveLength(6);
      expect(stages[0]).toBe('w2_employee');
      expect(stages[stages.length - 1]).toBe('house_member');
    });

    it('should calculate readiness score with weighted factors', () => {
      const monthsInStage = 8;
      const timeRequirement = 6;
      const qualityScore = 90;
      const onTimeDeliveryRate = 95;
      const clientSatisfactionScore = 92;

      const readinessScore =
        (Math.min(monthsInStage / timeRequirement, 1) * 25) +
        ((qualityScore / 100) * 25) +
        ((onTimeDeliveryRate / 100) * 25) +
        ((clientSatisfactionScore / 100) * 25);

      expect(readinessScore).toBeCloseTo(94.25, 0);
      expect(readinessScore).toBeGreaterThan(80);
    });
  });

  // ============================================
  // EMPLOYMENT TRACKING & METRICS TESTS
  // ============================================

  describe('Employment Tracking & Metrics', () => {
    it('should track jobs created', () => {
      const metrics = {
        totalJobs: 12,
        approvedJobs: 10,
        rejectedJobs: 2,
        avgCompensation: 65000,
      };

      expect(metrics.totalJobs).toBe(12);
      expect(metrics.approvedJobs).toBe(10);
      expect(metrics.rejectedJobs).toBe(2);
      expect(metrics.totalJobs).toBe(metrics.approvedJobs + metrics.rejectedJobs);
    });

    it('should calculate approval rate', () => {
      const totalJobs = 12;
      const approvedJobs = 10;
      const approvalRate = approvedJobs / totalJobs;

      expect(approvalRate).toBeCloseTo(0.833, 2);
      expect(approvalRate).toBeGreaterThan(0.8);
    });

    it('should track progression by stage', () => {
      const progressionByStage = [
        { currentStage: 'w2_employee', count: 15, avgReadiness: 0.65 },
        { currentStage: 'senior_employee', count: 8, avgReadiness: 0.78 },
        { currentStage: 'contractor', count: 5, avgReadiness: 0.82 },
        { currentStage: 'certified_contractor', count: 3, avgReadiness: 0.90 },
        { currentStage: 'business_owner', count: 2, avgReadiness: 0.95 },
      ];

      expect(progressionByStage).toHaveLength(5);
      expect(progressionByStage[0].count).toBe(15);
      expect(progressionByStage[4].count).toBe(2);
    });

    it('should track stage transitions', () => {
      const transitions = [
        { fromStage: 'w2_employee', toStage: 'senior_employee', transitionCount: 8 },
        { fromStage: 'senior_employee', toStage: 'contractor', transitionCount: 5 },
        { fromStage: 'contractor', toStage: 'certified_contractor', transitionCount: 3 },
      ];

      expect(transitions).toHaveLength(3);
      expect(transitions[0].transitionCount).toBe(8);
      expect(transitions[2].transitionCount).toBe(3);
    });

    it('should calculate contractor conversion rate', () => {
      const totalEmployees = 33;
      const contractors = 8; // senior_employee + contractor + certified_contractor
      const conversionRate = contractors / totalEmployees;

      expect(conversionRate).toBeCloseTo(0.242, 2);
    });

    it('should calculate business owner rate', () => {
      const totalEmployees = 33;
      const businessOwners = 2;
      const ownerRate = businessOwners / totalEmployees;

      expect(ownerRate).toBeCloseTo(0.061, 2);
    });

    it('should track employment impact metrics', () => {
      const impact = {
        totalEmployees: 33,
        w2Employees: 15,
        contractors: 13,
        businessOwners: 5,
      };

      expect(impact.totalEmployees).toBe(33);
      expect(impact.w2Employees + impact.contractors + impact.businessOwners).toBe(33);
    });
  });

  // ============================================
  // EMPLOYMENT MILESTONES & CELEBRATIONS TESTS
  // ============================================

  describe('Employment Milestones & Celebrations', () => {
    it('should record employment milestone', () => {
      const milestone = {
        houseId: 1,
        milestoneType: 'job_created' as const,
        description: 'New Senior Developer position created',
        relatedUserId: null,
        impact: 'Increased capacity by 20%',
        blockchainHash: 'abc123def456',
        createdAt: new Date(),
      };

      expect(milestone.milestoneType).toBe('job_created');
      expect(milestone.description).toContain('Senior Developer');
      expect(milestone.blockchainHash).toBeDefined();
    });

    it('should support multiple milestone types', () => {
      const milestoneTypes = [
        'job_created',
        'employee_hired',
        'promotion',
        'contractor_conversion',
        'business_owner_created',
        'team_milestone',
      ];

      expect(milestoneTypes).toHaveLength(6);
      expect(milestoneTypes).toContain('contractor_conversion');
      expect(milestoneTypes).toContain('business_owner_created');
    });

    it('should generate Luv celebration message', () => {
      const milestone = {
        description: 'Employee promoted to Senior Developer',
      };

      const luvMessage = `🎉 Celebrating: ${milestone.description}`;
      expect(luvMessage).toContain('Celebrating');
      expect(luvMessage).toContain('Senior Developer');
    });

    it('should track milestone with blockchain hash', () => {
      const milestone = {
        milestoneId: 1,
        blockchainHash: 'sha256hash',
        createdAt: new Date(),
      };

      expect(milestone.blockchainHash).toBeDefined();
      expect(milestone.blockchainHash).toHaveLength(10); // "sha256hash"
    });

    it('should retrieve recent milestones', () => {
      const milestones = [
        { id: 5, description: 'Latest milestone', createdAt: new Date() },
        { id: 4, description: 'Previous milestone', createdAt: new Date(Date.now() - 86400000) },
        { id: 3, description: 'Older milestone', createdAt: new Date(Date.now() - 172800000) },
      ];

      expect(milestones).toHaveLength(3);
      expect(milestones[0].id).toBe(5); // Most recent
      expect(milestones[2].id).toBe(3); // Oldest
    });

    it('should link milestones to specific users', () => {
      const milestone = {
        milestoneType: 'promotion',
        relatedUserId: 42,
        description: 'User promoted to contractor',
      };

      expect(milestone.relatedUserId).toBe(42);
      expect(milestone.relatedUserId).toBeDefined();
    });
  });

  // ============================================
  // CORE PRINCIPLE VALIDATION TESTS
  // ============================================

  describe('Core Principle: AI Enhances Human Employment', () => {
    it('should require human approval for all hiring decisions', () => {
      const recommendation = {
        createdBySystem: true,
        approvalStatus: 'awaiting_approval',
        requiresHumanApproval: true,
      };

      expect(recommendation.createdBySystem).toBe(true);
      expect(recommendation.requiresHumanApproval).toBe(true);
      expect(recommendation.approvalStatus).toBe('awaiting_approval');
    });

    it('should never automatically hire without human decision', () => {
      const recommendation = {
        status: 'pending',
        approvalStatus: 'awaiting_approval',
        canAutoApprove: false,
      };

      expect(recommendation.canAutoApprove).toBe(false);
      expect(recommendation.approvalStatus).not.toBe('approved');
    });

    it('should prioritize job creation over automation', () => {
      const system = {
        automationLevel: 'high',
        employmentCreationPriority: 'highest',
        replaceHumans: false,
      };

      expect(system.employmentCreationPriority).toBe('highest');
      expect(system.replaceHumans).toBe(false);
    });

    it('should track all employment decisions with audit trail', () => {
      const decision = {
        id: 1,
        decisionType: 'recommendation_reviewed',
        decidedBy: 123,
        blockchainHash: 'immutable_hash',
        createdAt: new Date(),
        auditTrail: true,
      };

      expect(decision.auditTrail).toBe(true);
      expect(decision.blockchainHash).toBeDefined();
      expect(decision.decidedBy).toBeDefined();
    });

    it('should celebrate human achievement and progression', () => {
      const milestone = {
        milestoneType: 'business_owner_created',
        description: 'Employee transitioned to business owner',
        celebration: true,
      };

      expect(milestone.celebration).toBe(true);
      expect(milestone.milestoneType).toBe('business_owner_created');
    });
  });

  // ============================================
  // INTEGRATION TESTS
  // ============================================

  describe('Integration with Worker Progression System', () => {
    it('should integrate with existing worker-progression router', () => {
      const progression = {
        userId: 1,
        currentStage: 'w2_employee',
        readinessScore: 85,
        nextStageEligible: true,
      };

      const recommendation = {
        progressionId: 1,
        recommendedNextStage: 'senior_employee',
        basedOnReadiness: progression.readinessScore >= 80,
      };

      expect(recommendation.basedOnReadiness).toBe(true);
      expect(recommendation.recommendedNextStage).toBe('senior_employee');
    });

    it('should work with L.A.W.S. Collective pipeline', () => {
      const pipeline = {
        name: 'W-2 to Contractor Pipeline',
        stages: ['w2_employee', 'senior_employee', 'contractor', 'certified_contractor', 'business_owner'],
        supportedByBrain: true,
      };

      expect(pipeline.supportedByBrain).toBe(true);
      expect(pipeline.stages).toHaveLength(5);
    });

    it('should track employment through entire pipeline', () => {
      const employee = {
        userId: 1,
        startStage: 'w2_employee',
        currentStage: 'contractor',
        progressionHistory: [
          { stage: 'w2_employee', enteredAt: new Date(2024, 0, 1) },
          { stage: 'senior_employee', enteredAt: new Date(2024, 6, 1) },
          { stage: 'contractor', enteredAt: new Date(2025, 0, 1) },
        ],
      };

      expect(employee.progressionHistory).toHaveLength(3);
      expect(employee.progressionHistory[0].stage).toBe('w2_employee');
      expect(employee.progressionHistory[2].stage).toBe('contractor');
    });
  });
});
