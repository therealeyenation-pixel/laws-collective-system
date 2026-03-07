/**
 * Direct Onboarding Journey Types
 * The website path for joining The L.A.W.S. Collective
 */

export type OnboardingRealm = 'self' | 'water' | 'air' | 'land';

export type OnboardingStep =
  | 'welcome'
  | 'self_intro'
  | 'self_assessment'
  | 'water_intro'
  | 'water_assessment'
  | 'air_intro'
  | 'air_assessment'
  | 'land_intro'
  | 'land_assessment'
  | 'house_setup'
  | 'values_agreement'
  | 'credential_issuance'
  | 'complete';

export type JourneyStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';

export interface OnboardingQuestion {
  id: string;
  realm: OnboardingRealm;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AssessmentResult {
  realm: OnboardingRealm;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  responses: QuestionResponse[];
}

export interface QuestionResponse {
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

export interface JourneyProgress {
  currentStep: OnboardingStep;
  progressPercent: number;
  realmsCompleted: {
    self: boolean;
    water: boolean;
    air: boolean;
    land: boolean;
  };
  scores: {
    self: number | null;
    water: number | null;
    air: number | null;
    land: number | null;
  };
}

export interface HouseSetupData {
  houseName: string;
  houseType: 'individual' | 'family' | 'legacy';
  primaryBeneficiaryName?: string;
  primaryBeneficiaryRelation?: string;
}

// Realm information for display
export const REALM_INFO: Record<OnboardingRealm, {
  name: string;
  fullName: string;
  description: string;
  color: string;
  icon: string;
  focus: string[];
}> = {
  self: {
    name: 'Self',
    fullName: 'SELF - Purpose & Skills',
    description: 'Understanding your purpose, developing practical skills, and building financial literacy.',
    color: 'amber',
    icon: '🌟',
    focus: [
      'Personal purpose and vision',
      'Financial literacy fundamentals',
      'Skill development awareness',
      'Goal setting and planning'
    ]
  },
  water: {
    name: 'Water',
    fullName: 'WATER - Healing & Balance',
    description: 'Developing emotional intelligence, healing patterns, and creating balance in life.',
    color: 'blue',
    icon: '💧',
    focus: [
      'Emotional intelligence',
      'Healing generational patterns',
      'Work-life balance',
      'Healthy decision-making'
    ]
  },
  air: {
    name: 'Air',
    fullName: 'AIR - Education & Knowledge',
    description: 'Expanding knowledge, improving communication, and embracing continuous learning.',
    color: 'cyan',
    icon: '🌬️',
    focus: [
      'Continuous learning mindset',
      'Effective communication',
      'Knowledge sharing',
      'Critical thinking'
    ]
  },
  land: {
    name: 'Land',
    fullName: 'LAND - Reconnection & Stability',
    description: 'Building stability, understanding roots, and creating lasting foundations.',
    color: 'green',
    icon: '🌍',
    focus: [
      'Understanding family history',
      'Building stable foundations',
      'Property and asset awareness',
      'Community connection'
    ]
  }
};

// Step progression order
export const STEP_ORDER: OnboardingStep[] = [
  'welcome',
  'self_intro',
  'self_assessment',
  'water_intro',
  'water_assessment',
  'air_intro',
  'air_assessment',
  'land_intro',
  'land_assessment',
  'house_setup',
  'values_agreement',
  'credential_issuance',
  'complete'
];

// Calculate progress percentage based on current step
export function calculateProgress(step: OnboardingStep): number {
  const index = STEP_ORDER.indexOf(step);
  if (index === -1) return 0;
  return Math.round((index / (STEP_ORDER.length - 1)) * 100);
}

// Get next step in the journey
export function getNextStep(currentStep: OnboardingStep): OnboardingStep | null {
  const index = STEP_ORDER.indexOf(currentStep);
  if (index === -1 || index >= STEP_ORDER.length - 1) return null;
  return STEP_ORDER[index + 1];
}

// Get realm from step
export function getRealmFromStep(step: OnboardingStep): OnboardingRealm | null {
  if (step.startsWith('self')) return 'self';
  if (step.startsWith('water')) return 'water';
  if (step.startsWith('air')) return 'air';
  if (step.startsWith('land')) return 'land';
  return null;
}

// Passing threshold
export const PASSING_SCORE = 70;
