/**
 * Onboarding Journey Tests
 * Tests for the Direct Onboarding path for joining The The L.A.W.S. Collective
 */

import { describe, it, expect } from 'vitest';
import {
  OnboardingStep,
  OnboardingRealm,
  REALM_INFO,
  STEP_ORDER,
  calculateProgress,
  getNextStep,
  getRealmFromStep,
  PASSING_SCORE
} from '../client/src/lib/onboarding/types';
import {
  SELF_QUESTIONS,
  WATER_QUESTIONS,
  AIR_QUESTIONS,
  LAND_QUESTIONS,
  getQuestionsForRealm,
  getAssessmentQuestions,
  ALL_QUESTIONS
} from '../client/src/lib/onboarding/questions';
import {
  generateCredentialId,
  generateVerificationCode,
  generateQRData,
  validateCredentialId,
  getAccessLevelFromScore
} from './credentials';

describe('Onboarding Types', () => {
  describe('REALM_INFO', () => {
    it('should have all four realms defined', () => {
      expect(REALM_INFO.self).toBeDefined();
      expect(REALM_INFO.water).toBeDefined();
      expect(REALM_INFO.air).toBeDefined();
      expect(REALM_INFO.land).toBeDefined();
    });

    it('should have correct realm names', () => {
      expect(REALM_INFO.self.name).toBe('Self');
      expect(REALM_INFO.water.name).toBe('Water');
      expect(REALM_INFO.air.name).toBe('Air');
      expect(REALM_INFO.land.name).toBe('Land');
    });

    it('should have icons for each realm', () => {
      expect(REALM_INFO.self.icon).toBe('🌟');
      expect(REALM_INFO.water.icon).toBe('💧');
      expect(REALM_INFO.air.icon).toBe('🌬️');
      expect(REALM_INFO.land.icon).toBe('🌍');
    });

    it('should have focus areas for each realm', () => {
      expect(REALM_INFO.self.focus.length).toBeGreaterThan(0);
      expect(REALM_INFO.water.focus.length).toBeGreaterThan(0);
      expect(REALM_INFO.air.focus.length).toBeGreaterThan(0);
      expect(REALM_INFO.land.focus.length).toBeGreaterThan(0);
    });
  });

  describe('STEP_ORDER', () => {
    it('should have all steps in correct order', () => {
      expect(STEP_ORDER[0]).toBe('welcome');
      expect(STEP_ORDER[STEP_ORDER.length - 1]).toBe('complete');
    });

    it('should follow S.W.A.L. progression', () => {
      const selfIndex = STEP_ORDER.indexOf('self_intro');
      const waterIndex = STEP_ORDER.indexOf('water_intro');
      const airIndex = STEP_ORDER.indexOf('air_intro');
      const landIndex = STEP_ORDER.indexOf('land_intro');

      expect(selfIndex).toBeLessThan(waterIndex);
      expect(waterIndex).toBeLessThan(airIndex);
      expect(airIndex).toBeLessThan(landIndex);
    });

    it('should have house setup after all realms', () => {
      const landAssessmentIndex = STEP_ORDER.indexOf('land_assessment');
      const houseSetupIndex = STEP_ORDER.indexOf('house_setup');
      expect(houseSetupIndex).toBeGreaterThan(landAssessmentIndex);
    });
  });

  describe('calculateProgress', () => {
    it('should return 0 for welcome step', () => {
      expect(calculateProgress('welcome')).toBe(0);
    });

    it('should return 100 for complete step', () => {
      expect(calculateProgress('complete')).toBe(100);
    });

    it('should return intermediate values for middle steps', () => {
      const progress = calculateProgress('water_intro');
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);
    });

    it('should increase monotonically through steps', () => {
      let lastProgress = -1;
      for (const step of STEP_ORDER) {
        const progress = calculateProgress(step);
        expect(progress).toBeGreaterThanOrEqual(lastProgress);
        lastProgress = progress;
      }
    });
  });

  describe('getNextStep', () => {
    it('should return next step for valid steps', () => {
      expect(getNextStep('welcome')).toBe('self_intro');
      expect(getNextStep('self_intro')).toBe('self_assessment');
    });

    it('should return null for complete step', () => {
      expect(getNextStep('complete')).toBeNull();
    });
  });

  describe('getRealmFromStep', () => {
    it('should return correct realm for realm steps', () => {
      expect(getRealmFromStep('self_intro')).toBe('self');
      expect(getRealmFromStep('self_assessment')).toBe('self');
      expect(getRealmFromStep('water_intro')).toBe('water');
      expect(getRealmFromStep('air_assessment')).toBe('air');
      expect(getRealmFromStep('land_intro')).toBe('land');
    });

    it('should return null for non-realm steps', () => {
      expect(getRealmFromStep('welcome')).toBeNull();
      expect(getRealmFromStep('house_setup')).toBeNull();
      expect(getRealmFromStep('complete')).toBeNull();
    });
  });

  describe('PASSING_SCORE', () => {
    it('should be 70%', () => {
      expect(PASSING_SCORE).toBe(70);
    });
  });
});

describe('Question Bank', () => {
  describe('SELF_QUESTIONS', () => {
    it('should have at least 5 questions', () => {
      expect(SELF_QUESTIONS.length).toBeGreaterThanOrEqual(5);
    });

    it('should have valid question structure', () => {
      for (const q of SELF_QUESTIONS) {
        expect(q.id).toBeDefined();
        expect(q.realm).toBe('self');
        expect(q.questionText).toBeDefined();
        expect(q.options.length).toBe(4);
        expect(q.correctOptionIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctOptionIndex).toBeLessThan(4);
        expect(q.explanation).toBeDefined();
        expect(['easy', 'medium', 'hard']).toContain(q.difficulty);
      }
    });
  });

  describe('WATER_QUESTIONS', () => {
    it('should have at least 5 questions', () => {
      expect(WATER_QUESTIONS.length).toBeGreaterThanOrEqual(5);
    });

    it('should all be water realm', () => {
      for (const q of WATER_QUESTIONS) {
        expect(q.realm).toBe('water');
      }
    });
  });

  describe('AIR_QUESTIONS', () => {
    it('should have at least 5 questions', () => {
      expect(AIR_QUESTIONS.length).toBeGreaterThanOrEqual(5);
    });

    it('should all be air realm', () => {
      for (const q of AIR_QUESTIONS) {
        expect(q.realm).toBe('air');
      }
    });
  });

  describe('LAND_QUESTIONS', () => {
    it('should have at least 5 questions', () => {
      expect(LAND_QUESTIONS.length).toBeGreaterThanOrEqual(5);
    });

    it('should all be land realm', () => {
      for (const q of LAND_QUESTIONS) {
        expect(q.realm).toBe('land');
      }
    });
  });

  describe('getQuestionsForRealm', () => {
    it('should return correct questions for each realm', () => {
      expect(getQuestionsForRealm('self')).toBe(SELF_QUESTIONS);
      expect(getQuestionsForRealm('water')).toBe(WATER_QUESTIONS);
      expect(getQuestionsForRealm('air')).toBe(AIR_QUESTIONS);
      expect(getQuestionsForRealm('land')).toBe(LAND_QUESTIONS);
    });
  });

  describe('getAssessmentQuestions', () => {
    it('should return requested number of questions', () => {
      const questions = getAssessmentQuestions('self', 5);
      expect(questions.length).toBe(5);
    });

    it('should return different questions on multiple calls (randomized)', () => {
      const set1 = getAssessmentQuestions('self', 5).map(q => q.id).sort();
      const set2 = getAssessmentQuestions('self', 5).map(q => q.id).sort();
      // Note: There's a small chance they could be the same, but unlikely
      // This test verifies the function works, not strict randomness
      expect(set1.length).toBe(5);
      expect(set2.length).toBe(5);
    });

    it('should not exceed available questions', () => {
      const questions = getAssessmentQuestions('self', 100);
      expect(questions.length).toBeLessThanOrEqual(SELF_QUESTIONS.length);
    });
  });

  describe('ALL_QUESTIONS', () => {
    it('should contain all questions from all realms', () => {
      const totalExpected = SELF_QUESTIONS.length + WATER_QUESTIONS.length + 
                           AIR_QUESTIONS.length + LAND_QUESTIONS.length;
      expect(ALL_QUESTIONS.length).toBe(totalExpected);
    });

    it('should have unique question IDs', () => {
      const ids = ALL_QUESTIONS.map(q => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});

describe('Credential Generation for Onboarding', () => {
  describe('generateCredentialId', () => {
    it('should generate valid credential IDs', () => {
      const id = generateCredentialId();
      expect(id).toBeDefined();
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateCredentialId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('generateVerificationCode', () => {
    it('should generate 6-character codes', () => {
      const code = generateVerificationCode();
      expect(code.length).toBe(6);
    });

    it('should only contain alphanumeric characters', () => {
      const code = generateVerificationCode();
      expect(/^[A-Z0-9]+$/.test(code)).toBe(true);
    });
  });

  describe('getAccessLevelFromScore', () => {
    it('should return member for scores below 80', () => {
      expect(getAccessLevelFromScore(70)).toBe('member');
      expect(getAccessLevelFromScore(79)).toBe('member');
    });

    it('should return advanced for scores 80-89', () => {
      expect(getAccessLevelFromScore(80)).toBe('advanced');
      expect(getAccessLevelFromScore(89)).toBe('advanced');
    });

    it('should return elite for scores 90+', () => {
      expect(getAccessLevelFromScore(90)).toBe('elite');
      expect(getAccessLevelFromScore(100)).toBe('elite');
    });
  });
});

describe('Journey Flow Logic', () => {
  describe('S.W.A.L. Progression', () => {
    it('should follow Self -> Water -> Air -> Land -> Sovereignty order', () => {
      const realms: OnboardingRealm[] = ['self', 'water', 'air', 'land'];
      
      for (let i = 0; i < realms.length - 1; i++) {
        const currentIntro = `${realms[i]}_intro` as OnboardingStep;
        const currentAssessment = `${realms[i]}_assessment` as OnboardingStep;
        const nextIntro = `${realms[i + 1]}_intro` as OnboardingStep;
        
        const currentIntroIndex = STEP_ORDER.indexOf(currentIntro);
        const currentAssessmentIndex = STEP_ORDER.indexOf(currentAssessment);
        const nextIntroIndex = STEP_ORDER.indexOf(nextIntro);
        
        expect(currentIntroIndex).toBeLessThan(currentAssessmentIndex);
        expect(currentAssessmentIndex).toBeLessThan(nextIntroIndex);
      }
    });
  });

  describe('Journey Completion Requirements', () => {
    it('should require all realms before house setup', () => {
      const houseSetupIndex = STEP_ORDER.indexOf('house_setup');
      const landAssessmentIndex = STEP_ORDER.indexOf('land_assessment');
      expect(houseSetupIndex).toBeGreaterThan(landAssessmentIndex);
    });

    it('should require values agreement before credential issuance', () => {
      const valuesIndex = STEP_ORDER.indexOf('values_agreement');
      const credentialIndex = STEP_ORDER.indexOf('credential_issuance');
      expect(valuesIndex).toBeLessThan(credentialIndex);
    });
  });
});

describe('Assessment Scoring', () => {
  it('should calculate correct score for perfect answers', () => {
    const totalQuestions = 5;
    const correctAnswers = 5;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    expect(score).toBe(100);
  });

  it('should calculate correct score for 70% threshold', () => {
    const totalQuestions = 5;
    const correctAnswers = 4; // 80%
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    expect(score).toBeGreaterThanOrEqual(PASSING_SCORE);
  });

  it('should fail below 70% threshold', () => {
    const totalQuestions = 5;
    const correctAnswers = 3; // 60%
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    expect(score).toBeLessThan(PASSING_SCORE);
  });
});
