import { describe, it, expect } from 'vitest';
import {
  getStageForAge,
  enrollYoungEntrepreneur,
  completeActivity,
  completeMilestone,
  generateParentDashboard
} from './age-based-entrepreneurship';

describe('Age-Based Entrepreneurship Framework', () => {
  describe('getStageForAge', () => {
    it('should return Money Explorers for ages 5-7', () => {
      const stage = getStageForAge(6);
      expect(stage?.name).toBe('Money Explorers');
      expect(stage?.level).toBe('awareness');
      expect(stage?.tokenTier).toBe('observer');
    });

    it('should return Junior Entrepreneurs for ages 8-10', () => {
      const stage = getStageForAge(9);
      expect(stage?.name).toBe('Junior Entrepreneurs');
      expect(stage?.level).toBe('exploration');
    });

    it('should return Business Builders for ages 11-13', () => {
      const stage = getStageForAge(12);
      expect(stage?.name).toBe('Business Builders');
      expect(stage?.level).toBe('foundation');
    });

    it('should return Young Entrepreneurs for ages 14-16', () => {
      const stage = getStageForAge(15);
      expect(stage?.name).toBe('Young Entrepreneurs');
      expect(stage?.level).toBe('entrepreneurship');
    });

    it('should return Emerging Business Leaders for ages 17-18', () => {
      const stage = getStageForAge(17);
      expect(stage?.name).toBe('Emerging Business Leaders');
      expect(stage?.level).toBe('independence');
    });

    it('should return null for ages outside range', () => {
      expect(getStageForAge(4)).toBeNull();
      expect(getStageForAge(19)).toBeNull();
    });
  });

  describe('enrollYoungEntrepreneur', () => {
    it('should enroll a young entrepreneur with correct stage', () => {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - 10);
      
      const entrepreneur = enrollYoungEntrepreneur('user-001', 'Alex', dob, 'parent-001');
      
      expect(entrepreneur.entrepreneurId).toContain('ye-');
      expect(entrepreneur.name).toBe('Alex');
      expect(entrepreneur.currentAge).toBe(10);
      expect(entrepreneur.currentStage).toBe('exploration');
      expect(entrepreneur.currentTokenTier).toBe('apprentice');
      expect(entrepreneur.tokensEarned).toBe(0);
    });
  });

  describe('completeActivity', () => {
    it('should add activity and tokens', () => {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - 10);
      let entrepreneur = enrollYoungEntrepreneur('user-001', 'Alex', dob, 'parent-001');
      
      entrepreneur = completeActivity(entrepreneur, 'act-1', 25);
      
      expect(entrepreneur.completedActivities).toContain('act-1');
      expect(entrepreneur.tokensEarned).toBe(25);
    });

    it('should cap tokens at max earnings for stage', () => {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - 6);
      let entrepreneur = enrollYoungEntrepreneur('user-001', 'Alex', dob, 'parent-001');
      
      entrepreneur = completeActivity(entrepreneur, 'act-1', 100);
      
      expect(entrepreneur.tokensEarned).toBe(50); // Max for ages 5-7
    });
  });

  describe('completeMilestone', () => {
    it('should add milestone and tokens', () => {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - 12);
      let entrepreneur = enrollYoungEntrepreneur('user-001', 'Alex', dob, 'parent-001');
      
      entrepreneur = completeMilestone(entrepreneur, 'ms-1', 75);
      
      expect(entrepreneur.completedMilestones).toContain('ms-1');
      expect(entrepreneur.tokensEarned).toBe(75);
    });
  });

  describe('generateParentDashboard', () => {
    it('should generate formatted dashboard', () => {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - 15);
      let entrepreneur = enrollYoungEntrepreneur('user-001', 'Jordan', dob, 'parent-001');
      entrepreneur = completeActivity(entrepreneur, 'act-1', 50);
      entrepreneur = completeMilestone(entrepreneur, 'ms-1', 100);
      
      const dashboard = generateParentDashboard(entrepreneur);
      
      expect(dashboard).toContain('PARENT/GUARDIAN DASHBOARD');
      expect(dashboard).toContain('Jordan');
      expect(dashboard).toContain('Young Entrepreneurs');
      expect(dashboard).toContain('OPERATOR');
      expect(dashboard).toContain('150');
    });
  });
});
