import { describe, it, expect } from 'vitest';
import {
  createPathway,
  startPathway,
  completeRequirement,
  checkPathwayProgress,
  submitForReview,
  reviewPathway,
  addNote,
  getPathwayDescription,
  createEmployeeToContractorPathway,
  createExternalPartnerPathway,
  createBusinessFirstPathway,
  createCommunityMemberPathway,
  generatePathwayReport
} from './house-pathways';

describe('House Pathways Service', () => {
  describe('createPathway', () => {
    it('should create employee to contractor pathway', () => {
      const pathway = createPathway('employee_to_contractor', 'user-001', 'John Freeman');
      expect(pathway.pathwayId).toContain('pathway-');
      expect(pathway.type).toBe('employee_to_contractor');
      expect(pathway.status).toBe('not_started');
      expect(pathway.requirements).toHaveLength(6);
    });

    it('should create external partner pathway', () => {
      const pathway = createPathway('external_partner', 'user-002', 'Jane Smith');
      expect(pathway.type).toBe('external_partner');
      expect(pathway.requirements).toHaveLength(6);
    });

    it('should create business first pathway', () => {
      const pathway = createPathway('business_first', 'user-003', 'Bob Johnson');
      expect(pathway.type).toBe('business_first');
      expect(pathway.requirements).toHaveLength(6);
    });

    it('should create community member pathway', () => {
      const pathway = createPathway('community_member', 'user-004', 'Alice Brown');
      expect(pathway.type).toBe('community_member');
      expect(pathway.requirements).toHaveLength(6);
    });
  });

  describe('startPathway', () => {
    it('should start pathway and set status to in_progress', () => {
      let pathway = createPathway('employee_to_contractor', 'user-001', 'John');
      pathway = startPathway(pathway);
      expect(pathway.status).toBe('in_progress');
      expect(pathway.currentStep).toBe(1);
    });
  });

  describe('completeRequirement', () => {
    it('should mark requirement as completed', () => {
      let pathway = createPathway('employee_to_contractor', 'user-001', 'John');
      pathway = startPathway(pathway);
      const reqId = pathway.requirements[0].requirementId;
      
      pathway = completeRequirement(pathway, reqId, 'Evidence doc', 'admin-001');
      
      expect(pathway.requirements[0].isCompleted).toBe(true);
      expect(pathway.requirements[0].evidence).toBe('Evidence doc');
      expect(pathway.requirements[0].verifiedBy).toBe('admin-001');
    });

    it('should update current step count', () => {
      let pathway = createPathway('employee_to_contractor', 'user-001', 'John');
      pathway = startPathway(pathway);
      
      pathway = completeRequirement(pathway, pathway.requirements[0].requirementId);
      pathway = completeRequirement(pathway, pathway.requirements[1].requirementId);
      
      expect(pathway.currentStep).toBe(2);
    });
  });

  describe('checkPathwayProgress', () => {
    it('should calculate progress correctly', () => {
      let pathway = createPathway('employee_to_contractor', 'user-001', 'John');
      pathway = startPathway(pathway);
      pathway = completeRequirement(pathway, pathway.requirements[0].requirementId);
      pathway = completeRequirement(pathway, pathway.requirements[1].requirementId);
      
      const progress = checkPathwayProgress(pathway);
      expect(progress.completedCount).toBe(2);
      expect(progress.totalCount).toBe(6);
      expect(progress.percentComplete).toBe(33);
      expect(progress.isReadyForReview).toBe(false);
    });

    it('should identify next requirement', () => {
      let pathway = createPathway('employee_to_contractor', 'user-001', 'John');
      pathway = startPathway(pathway);
      pathway = completeRequirement(pathway, pathway.requirements[0].requirementId);
      
      const progress = checkPathwayProgress(pathway);
      expect(progress.nextRequirement?.name).toBe('Performance Review');
    });

    it('should indicate ready for review when all complete', () => {
      let pathway = createPathway('employee_to_contractor', 'user-001', 'John');
      pathway = startPathway(pathway);
      
      pathway.requirements.forEach(req => {
        pathway = completeRequirement(pathway, req.requirementId);
      });
      
      const progress = checkPathwayProgress(pathway);
      expect(progress.isReadyForReview).toBe(true);
      expect(progress.percentComplete).toBe(100);
    });
  });

  describe('submitForReview', () => {
    it('should submit completed pathway for review', () => {
      let pathway = createPathway('employee_to_contractor', 'user-001', 'John');
      pathway = startPathway(pathway);
      pathway.requirements.forEach(req => {
        pathway = completeRequirement(pathway, req.requirementId);
      });
      
      pathway = submitForReview(pathway);
      expect(pathway.status).toBe('pending_review');
    });

    it('should throw error if not all requirements complete', () => {
      let pathway = createPathway('employee_to_contractor', 'user-001', 'John');
      pathway = startPathway(pathway);
      
      expect(() => submitForReview(pathway)).toThrow('All requirements must be completed');
    });
  });

  describe('reviewPathway', () => {
    it('should approve pathway', () => {
      let pathway = createPathway('employee_to_contractor', 'user-001', 'John');
      pathway = startPathway(pathway);
      pathway.requirements.forEach(req => {
        pathway = completeRequirement(pathway, req.requirementId);
      });
      pathway = submitForReview(pathway);
      
      pathway = reviewPathway(pathway, true, 'reviewer-001', 'Excellent candidate');
      
      expect(pathway.status).toBe('approved');
      expect(pathway.reviewedBy).toBe('reviewer-001');
      expect(pathway.completedAt).toBeDefined();
    });

    it('should reject pathway', () => {
      let pathway = createPathway('employee_to_contractor', 'user-001', 'John');
      pathway = startPathway(pathway);
      pathway.requirements.forEach(req => {
        pathway = completeRequirement(pathway, req.requirementId);
      });
      pathway = submitForReview(pathway);
      
      pathway = reviewPathway(pathway, false, 'reviewer-001', 'Needs more experience');
      
      expect(pathway.status).toBe('rejected');
      expect(pathway.completedAt).toBeUndefined();
    });
  });

  describe('addNote', () => {
    it('should add timestamped note', () => {
      let pathway = createPathway('employee_to_contractor', 'user-001', 'John');
      pathway = addNote(pathway, 'Initial consultation completed');
      
      expect(pathway.notes).toHaveLength(1);
      expect(pathway.notes[0]).toContain('Initial consultation completed');
    });
  });

  describe('getPathwayDescription', () => {
    it('should return description for each pathway type', () => {
      const empDesc = getPathwayDescription('employee_to_contractor');
      expect(empDesc.name).toBe('Employee to Contractor Transition');
      expect(empDesc.benefits).toContain('Higher earning potential');

      const extDesc = getPathwayDescription('external_partner');
      expect(extDesc.name).toBe('External Partner Pathway');

      const bizDesc = getPathwayDescription('business_first');
      expect(bizDesc.name).toBe('Business-First Affiliation');

      const commDesc = getPathwayDescription('community_member');
      expect(commDesc.name).toBe('Community Member Pathway');
    });
  });

  describe('Specialized Pathway Creators', () => {
    it('should create employee to contractor pathway with details', () => {
      const pathway = createEmployeeToContractorPathway(
        'user-001',
        'John Freeman',
        'emp-001',
        new Date('2022-01-01'),
        4.5
      );
      
      expect(pathway.employeeId).toBe('emp-001');
      expect(pathway.performanceRating).toBe(4.5);
      expect(pathway.tenureMonths).toBeGreaterThan(0);
    });

    it('should create external partner pathway with details', () => {
      const pathway = createExternalPartnerPathway(
        'user-002',
        'Jane Smith',
        'referrer-001',
        'Partner Corp'
      );
      
      expect(pathway.partnerOrganization).toBe('Partner Corp');
      expect(pathway.referredBy).toBe('referrer-001');
      expect(pathway.backgroundCheckPassed).toBe(false);
    });

    it('should create business first pathway with details', () => {
      const pathway = createBusinessFirstPathway(
        'user-003',
        'Bob Johnson',
        'Bob\'s Business',
        'Consulting',
        5,
        500000,
        10
      );
      
      expect(pathway.businessName).toBe('Bob\'s Business');
      expect(pathway.yearsInOperation).toBe(5);
      expect(pathway.affiliationType).toBe('associate');
    });

    it('should create community member pathway with details', () => {
      const pathway = createCommunityMemberPathway(
        'user-004',
        'Alice Brown',
        'Volunteer Coordinator',
        'sponsor-001'
      );
      
      expect(pathway.communityRole).toBe('Volunteer Coordinator');
      expect(pathway.sponsoredBy).toBe('sponsor-001');
      expect(pathway.eventsAttended).toBe(0);
    });
  });

  describe('generatePathwayReport', () => {
    it('should generate formatted report', () => {
      let pathway = createPathway('employee_to_contractor', 'user-001', 'John Freeman');
      pathway = startPathway(pathway);
      pathway = completeRequirement(pathway, pathway.requirements[0].requirementId);
      pathway = addNote(pathway, 'Good progress');
      
      const report = generatePathwayReport(pathway);
      expect(report).toContain('HOUSE PATHWAY PROGRESS REPORT');
      expect(report).toContain('John Freeman');
      expect(report).toContain('Employee to Contractor Transition');
      expect(report).toContain('1/6 requirements completed');
      expect(report).toContain('Good progress');
    });
  });
});
