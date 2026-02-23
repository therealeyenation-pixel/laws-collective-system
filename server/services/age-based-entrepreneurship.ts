/**
 * Age-Based Entrepreneurship Framework Service
 * Phase 129: Progressive business education by age group
 */

export type AgeGroup = '5-7' | '8-10' | '11-13' | '14-16' | '17-18';
export type StageLevel = 'awareness' | 'exploration' | 'foundation' | 'entrepreneurship' | 'independence';
export type TokenTier = 'observer' | 'apprentice' | 'builder' | 'operator' | 'owner';

export interface EntrepreneurshipStage {
  stageId: string;
  level: StageLevel;
  ageGroup: AgeGroup;
  name: string;
  description: string;
  objectives: string[];
  tokenTier: TokenTier;
  maxEarnings: number;
}

export interface YoungEntrepreneur {
  entrepreneurId: string;
  userId: string;
  name: string;
  dateOfBirth: Date;
  currentAge: number;
  currentStage: StageLevel;
  currentTokenTier: TokenTier;
  tokensEarned: number;
  completedMilestones: string[];
  completedActivities: string[];
  parentGuardianId: string;
  enrolledAt: Date;
  lastActivityAt: Date;
}

const STAGES: Record<AgeGroup, EntrepreneurshipStage> = {
  '5-7': {
    stageId: 'stage-awareness',
    level: 'awareness',
    ageGroup: '5-7',
    name: 'Money Explorers',
    description: 'Introduction to basic money concepts through play and stories',
    objectives: ['Understand what money is', 'Learn to count coins', 'Practice saving'],
    tokenTier: 'observer',
    maxEarnings: 50
  },
  '8-10': {
    stageId: 'stage-exploration',
    level: 'exploration',
    ageGroup: '8-10',
    name: 'Junior Entrepreneurs',
    description: 'Hands-on exploration of simple business concepts',
    objectives: ['Understand profit and loss', 'Practice simple budgeting', 'Complete mini business project'],
    tokenTier: 'apprentice',
    maxEarnings: 200
  },
  '11-13': {
    stageId: 'stage-foundation',
    level: 'foundation',
    ageGroup: '11-13',
    name: 'Business Builders',
    description: 'Building foundational business skills',
    objectives: ['Create simple business plan', 'Learn marketing basics', 'Manage small budget'],
    tokenTier: 'builder',
    maxEarnings: 500
  },
  '14-16': {
    stageId: 'stage-entrepreneurship',
    level: 'entrepreneurship',
    ageGroup: '14-16',
    name: 'Young Entrepreneurs',
    description: 'Operating real businesses with increasing independence',
    objectives: ['Run profitable business', 'Build team', 'Learn about taxes'],
    tokenTier: 'operator',
    maxEarnings: 2000
  },
  '17-18': {
    stageId: 'stage-independence',
    level: 'independence',
    ageGroup: '17-18',
    name: 'Emerging Business Leaders',
    description: 'Preparing for adult business ownership and House membership',
    objectives: ['Operate with minimal oversight', 'Build sustainable model', 'Prepare for House membership'],
    tokenTier: 'owner',
    maxEarnings: 10000
  }
};

export function getStageForAge(age: number): EntrepreneurshipStage | null {
  if (age >= 5 && age <= 7) return STAGES['5-7'];
  if (age >= 8 && age <= 10) return STAGES['8-10'];
  if (age >= 11 && age <= 13) return STAGES['11-13'];
  if (age >= 14 && age <= 16) return STAGES['14-16'];
  if (age >= 17 && age <= 18) return STAGES['17-18'];
  return null;
}

export function enrollYoungEntrepreneur(
  userId: string,
  name: string,
  dateOfBirth: Date,
  parentGuardianId: string
): YoungEntrepreneur {
  const today = new Date();
  const age = Math.floor((today.getTime() - dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const stage = getStageForAge(age);

  return {
    entrepreneurId: `ye-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    name,
    dateOfBirth,
    currentAge: age,
    currentStage: stage?.level || 'awareness',
    currentTokenTier: stage?.tokenTier || 'observer',
    tokensEarned: 0,
    completedMilestones: [],
    completedActivities: [],
    parentGuardianId,
    enrolledAt: new Date(),
    lastActivityAt: new Date()
  };
}

export function completeActivity(
  entrepreneur: YoungEntrepreneur,
  activityId: string,
  tokensEarned: number
): YoungEntrepreneur {
  const stage = getStageForAge(entrepreneur.currentAge);
  const maxEarnings = stage?.maxEarnings || 50;
  const newTokens = Math.min(entrepreneur.tokensEarned + tokensEarned, maxEarnings);

  return {
    ...entrepreneur,
    completedActivities: [...entrepreneur.completedActivities, activityId],
    tokensEarned: newTokens,
    lastActivityAt: new Date()
  };
}

export function completeMilestone(
  entrepreneur: YoungEntrepreneur,
  milestoneId: string,
  tokens: number
): YoungEntrepreneur {
  const stage = getStageForAge(entrepreneur.currentAge);
  const maxEarnings = stage?.maxEarnings || 50;
  const newTokens = Math.min(entrepreneur.tokensEarned + tokens, maxEarnings);

  return {
    ...entrepreneur,
    completedMilestones: [...entrepreneur.completedMilestones, milestoneId],
    tokensEarned: newTokens,
    lastActivityAt: new Date()
  };
}

export function generateParentDashboard(entrepreneur: YoungEntrepreneur): string {
  const stage = getStageForAge(entrepreneur.currentAge);

  return `
PARENT/GUARDIAN DASHBOARD
=========================
Entrepreneur: ${entrepreneur.name}
Age: ${entrepreneur.currentAge}
Stage: ${stage?.name || 'Not enrolled'}
Token Tier: ${entrepreneur.currentTokenTier.toUpperCase()}

PROGRESS OVERVIEW
-----------------
Tokens Earned: ${entrepreneur.tokensEarned} / ${stage?.maxEarnings || 0}
Activities Completed: ${entrepreneur.completedActivities.length}
Milestones Achieved: ${entrepreneur.completedMilestones.length}
Last Activity: ${entrepreneur.lastActivityAt.toLocaleDateString()}
`;
}

export const ageBasedEntrepreneurship = {
  STAGES,
  getStageForAge,
  enrollYoungEntrepreneur,
  completeActivity,
  completeMilestone,
  generateParentDashboard
};
