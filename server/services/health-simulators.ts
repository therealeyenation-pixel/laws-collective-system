/**
 * Health Department Simulators Service
 * Phase 148: Water Realm wellness simulators
 */

export type SimulatorType = 'emotional_intelligence' | 'stress_management' | 'relationship_wellness' | 'work_life_balance' | 'community_health';

export interface HealthSimulator {
  simulatorId: string;
  type: SimulatorType;
  name: string;
  description: string;
  waterRealmConnection: string;
  scenarios: Scenario[];
  skillsTargeted: string[];
  duration: string;
}

export interface Scenario {
  scenarioId: string;
  title: string;
  situation: string;
  choices: Choice[];
  learningObjective: string;
}

export interface Choice {
  choiceId: string;
  text: string;
  outcome: string;
  healthScore: number;
  feedback: string;
}

export interface SimulatorSession {
  sessionId: string;
  simulatorId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  scenarioResults: ScenarioResult[];
  totalScore: number;
  maxScore: number;
  insights: string[];
}

export interface ScenarioResult {
  scenarioId: string;
  choiceId: string;
  score: number;
  timeSpent: number;
}

const SIMULATORS: Record<SimulatorType, HealthSimulator> = {
  emotional_intelligence: {
    simulatorId: 'sim-ei',
    type: 'emotional_intelligence',
    name: 'Emotional Intelligence Simulator',
    description: 'Recognize and manage emotions in yourself and others',
    waterRealmConnection: 'Water represents emotional flow and balance. This simulator helps you navigate emotional currents.',
    skillsTargeted: ['Self-awareness', 'Self-regulation', 'Empathy', 'Social skills', 'Motivation'],
    duration: '20-30 minutes',
    scenarios: [
      {
        scenarioId: 'ei-1',
        title: 'The Unexpected Criticism',
        situation: 'Your supervisor criticizes your work in front of colleagues. You feel embarrassed and defensive.',
        learningObjective: 'Practice emotional regulation under pressure',
        choices: [
          { choiceId: 'ei-1a', text: 'Defend yourself immediately and explain why they are wrong', outcome: 'The situation escalates and becomes more tense', healthScore: 20, feedback: 'Reacting defensively often escalates conflict. Consider pausing before responding.' },
          { choiceId: 'ei-1b', text: 'Take a deep breath, acknowledge the feedback, and ask to discuss privately', outcome: 'The supervisor agrees to a private conversation', healthScore: 90, feedback: 'Excellent! Pausing and redirecting shows emotional maturity and professionalism.' },
          { choiceId: 'ei-1c', text: 'Stay silent but visibly upset, then complain to coworkers later', outcome: 'You feel resentful and the issue remains unresolved', healthScore: 30, feedback: 'Suppressing emotions and venting elsewhere does not address the root issue.' },
          { choiceId: 'ei-1d', text: 'Ask clarifying questions to understand the specific concerns', outcome: 'You gain useful feedback and show openness to growth', healthScore: 80, feedback: 'Great approach! Seeking to understand shows emotional intelligence.' }
        ]
      },
      {
        scenarioId: 'ei-2',
        title: 'The Overwhelmed Friend',
        situation: 'A close friend calls you crying about multiple life stressors. They seem overwhelmed.',
        learningObjective: 'Practice empathy and supportive listening',
        choices: [
          { choiceId: 'ei-2a', text: 'Immediately offer solutions to fix their problems', outcome: 'Your friend feels unheard and more frustrated', healthScore: 40, feedback: 'Sometimes people need to be heard before they want solutions.' },
          { choiceId: 'ei-2b', text: 'Listen actively, validate their feelings, and ask how you can help', outcome: 'Your friend feels supported and calms down', healthScore: 95, feedback: 'Perfect! Active listening and validation are powerful emotional support tools.' },
          { choiceId: 'ei-2c', text: 'Share your own similar experiences to show you understand', outcome: 'The conversation shifts to you, leaving your friend still upset', healthScore: 35, feedback: 'While relating can help, be careful not to redirect focus away from their needs.' },
          { choiceId: 'ei-2d', text: 'Tell them to calm down and that things will work out', outcome: 'Your friend feels dismissed', healthScore: 25, feedback: 'Minimizing emotions can feel invalidating even when well-intentioned.' }
        ]
      }
    ]
  },
  stress_management: {
    simulatorId: 'sim-sm',
    type: 'stress_management',
    name: 'Stress Management Simulator',
    description: 'Learn healthy coping strategies for life stressors',
    waterRealmConnection: 'Like water finding its level, learn to flow around obstacles rather than crash against them.',
    skillsTargeted: ['Stress recognition', 'Coping strategies', 'Boundary setting', 'Time management', 'Self-care'],
    duration: '25-35 minutes',
    scenarios: [
      {
        scenarioId: 'sm-1',
        title: 'The Deadline Crunch',
        situation: 'You have three major deadlines this week and feel overwhelmed. Sleep has been poor.',
        learningObjective: 'Practice prioritization and self-care under pressure',
        choices: [
          { choiceId: 'sm-1a', text: 'Work through the night to get everything done', outcome: 'You finish but are exhausted and make errors', healthScore: 25, feedback: 'Sacrificing sleep often reduces quality and increases long-term stress.' },
          { choiceId: 'sm-1b', text: 'Prioritize tasks, communicate with stakeholders about realistic timelines', outcome: 'You negotiate extensions and deliver quality work', healthScore: 90, feedback: 'Excellent! Communication and prioritization are key stress management skills.' },
          { choiceId: 'sm-1c', text: 'Procrastinate by scrolling social media to avoid the stress', outcome: 'Deadlines loom larger and stress increases', healthScore: 15, feedback: 'Avoidance typically increases stress rather than reducing it.' },
          { choiceId: 'sm-1d', text: 'Take short breaks, maintain sleep schedule, and focus on one task at a time', outcome: 'You stay calm and productive', healthScore: 85, feedback: 'Great! Maintaining healthy habits during stress is crucial for performance.' }
        ]
      }
    ]
  },
  relationship_wellness: {
    simulatorId: 'sim-rw',
    type: 'relationship_wellness',
    name: 'Relationship Wellness Simulator',
    description: 'Practice healthy boundaries and communication',
    waterRealmConnection: 'Relationships flow best with clear channels. Learn to navigate interpersonal currents.',
    skillsTargeted: ['Boundary setting', 'Conflict resolution', 'Communication', 'Trust building', 'Forgiveness'],
    duration: '20-30 minutes',
    scenarios: [
      {
        scenarioId: 'rw-1',
        title: 'The Boundary Violation',
        situation: 'A family member repeatedly borrows money without paying it back and asks again.',
        learningObjective: 'Practice setting healthy boundaries with loved ones',
        choices: [
          { choiceId: 'rw-1a', text: 'Lend the money again to avoid conflict', outcome: 'The pattern continues and resentment builds', healthScore: 20, feedback: 'Avoiding boundaries often leads to deeper relationship problems.' },
          { choiceId: 'rw-1b', text: 'Firmly but kindly explain you cannot lend more until previous loans are repaid', outcome: 'They are initially upset but the boundary is set', healthScore: 90, feedback: 'Excellent! Clear, kind boundaries protect both parties in a relationship.' },
          { choiceId: 'rw-1c', text: 'Angrily refuse and bring up all past grievances', outcome: 'A major argument erupts', healthScore: 25, feedback: 'Boundaries work best when set calmly without attacking the other person.' },
          { choiceId: 'rw-1d', text: 'Make an excuse about not having money right now', outcome: 'They ask again next week', healthScore: 35, feedback: 'Indirect responses often delay rather than resolve boundary issues.' }
        ]
      }
    ]
  },
  work_life_balance: {
    simulatorId: 'sim-wlb',
    type: 'work_life_balance',
    name: 'Work-Life Balance Simulator',
    description: 'Make sustainable lifestyle choices',
    waterRealmConnection: 'Balance is the natural state of water. Learn to distribute your energy wisely.',
    skillsTargeted: ['Time allocation', 'Priority setting', 'Rest and recovery', 'Saying no', 'Integration'],
    duration: '15-25 minutes',
    scenarios: [
      {
        scenarioId: 'wlb-1',
        title: 'The Weekend Work Request',
        situation: 'Your boss asks you to work this weekend. You had plans with your family.',
        learningObjective: 'Practice work-life boundary negotiation',
        choices: [
          { choiceId: 'wlb-1a', text: 'Cancel family plans and work the weekend', outcome: 'Family is disappointed, you feel resentful', healthScore: 30, feedback: 'Consistently prioritizing work over family can damage relationships.' },
          { choiceId: 'wlb-1b', text: 'Explain you have commitments and offer alternative solutions', outcome: 'Boss appreciates the communication and you find a compromise', healthScore: 90, feedback: 'Great! Offering alternatives shows commitment while maintaining boundaries.' },
          { choiceId: 'wlb-1c', text: 'Refuse without explanation', outcome: 'Boss is frustrated by the lack of communication', healthScore: 40, feedback: 'Clear communication helps maintain professional relationships.' },
          { choiceId: 'wlb-1d', text: 'Say yes but complain about it to coworkers', outcome: 'You work resentfully and feel burned out', healthScore: 25, feedback: 'Passive agreement often leads to burnout and resentment.' }
        ]
      }
    ]
  },
  community_health: {
    simulatorId: 'sim-ch',
    type: 'community_health',
    name: 'Community Health Simulator',
    description: 'Build support networks and community connections',
    waterRealmConnection: 'Water connects all things. Learn to build and maintain your support network.',
    skillsTargeted: ['Network building', 'Giving support', 'Receiving support', 'Community engagement', 'Reciprocity'],
    duration: '20-30 minutes',
    scenarios: [
      {
        scenarioId: 'ch-1',
        title: 'The New Neighbor',
        situation: 'A new family moves in next door. They seem to keep to themselves.',
        learningObjective: 'Practice community connection building',
        choices: [
          { choiceId: 'ch-1a', text: 'Wait for them to introduce themselves', outcome: 'Months pass with no connection', healthScore: 30, feedback: 'Taking initiative often creates stronger community bonds.' },
          { choiceId: 'ch-1b', text: 'Introduce yourself and offer a small welcome gesture', outcome: 'A friendly relationship begins', healthScore: 90, feedback: 'Excellent! Small gestures can build lasting community connections.' },
          { choiceId: 'ch-1c', text: 'Assume they want privacy and avoid them', outcome: 'Opportunity for connection is missed', healthScore: 25, feedback: 'Assumptions can prevent meaningful connections.' },
          { choiceId: 'ch-1d', text: 'Invite them to a community event', outcome: 'They appreciate being included', healthScore: 85, feedback: 'Great! Including newcomers strengthens community bonds.' }
        ]
      }
    ]
  }
};

export function getSimulator(type: SimulatorType): HealthSimulator {
  return SIMULATORS[type];
}

export function getAllSimulators(): HealthSimulator[] {
  return Object.values(SIMULATORS);
}

export function startSession(simulatorId: string, userId: string): SimulatorSession {
  return {
    sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    simulatorId,
    userId,
    startedAt: new Date(),
    scenarioResults: [],
    totalScore: 0,
    maxScore: 0,
    insights: []
  };
}

export function recordScenarioResult(
  session: SimulatorSession,
  scenarioId: string,
  choiceId: string,
  score: number,
  timeSpent: number
): SimulatorSession {
  const result: ScenarioResult = { scenarioId, choiceId, score, timeSpent };
  return {
    ...session,
    scenarioResults: [...session.scenarioResults, result],
    totalScore: session.totalScore + score,
    maxScore: session.maxScore + 100
  };
}

export function completeSession(session: SimulatorSession): SimulatorSession {
  const percentage = session.maxScore > 0 ? (session.totalScore / session.maxScore) * 100 : 0;
  const insights: string[] = [];
  
  if (percentage >= 80) {
    insights.push('Excellent emotional wellness skills demonstrated!');
    insights.push('You show strong self-awareness and healthy coping strategies.');
  } else if (percentage >= 60) {
    insights.push('Good foundation in wellness skills with room for growth.');
    insights.push('Consider practicing the scenarios where you scored lower.');
  } else {
    insights.push('This is a learning opportunity - wellness skills can be developed.');
    insights.push('Review the feedback for each scenario and try again.');
  }
  
  return {
    ...session,
    completedAt: new Date(),
    insights
  };
}

export function generateSessionReport(session: SimulatorSession): string {
  const percentage = session.maxScore > 0 ? Math.round((session.totalScore / session.maxScore) * 100) : 0;
  
  return `
HEALTH SIMULATOR SESSION REPORT
===============================
Session ID: ${session.sessionId}
Simulator: ${session.simulatorId}
Date: ${session.startedAt.toLocaleDateString()}

RESULTS
-------
Total Score: ${session.totalScore} / ${session.maxScore}
Percentage: ${percentage}%

SCENARIOS COMPLETED
-------------------
${session.scenarioResults.map((r, i) => `${i + 1}. ${r.scenarioId}: ${r.score}/100 (${r.timeSpent}s)`).join('\n')}

INSIGHTS
--------
${session.insights.join('\n')}

WATER REALM CONNECTION
----------------------
This simulator is part of the Water Realm in the L.A.W.S. framework.
Water represents healing, emotional balance, and wellness.
Continue your journey toward holistic health and balance.
`;
}

export const healthSimulators = {
  SIMULATORS,
  getSimulator,
  getAllSimulators,
  startSession,
  recordScenarioResult,
  completeSession,
  generateSessionReport
};
