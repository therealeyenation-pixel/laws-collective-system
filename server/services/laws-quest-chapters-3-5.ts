/**
 * L.A.W.S. Quest Chapters 3-5 and Game-to-Real Bridge
 * Phase 52: Complete remaining quest chapters and bridge to real tools
 */

export interface QuestScenario {
  id: string;
  title: string;
  description: string;
  choices: Array<{ id: string; text: string; outcome: string; points: number; realWorldAction?: string }>;
}

export interface ChapterContent {
  chapterId: number;
  title: string;
  description: string;
  scenarios: QuestScenario[];
  completionReward: { tokens: number; badge: string };
}

export interface PlayerDecision {
  scenarioId: string;
  choiceId: string;
  timestamp: Date;
  chapter: number;
}

export interface RealWorldRecommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  description: string;
  relatedTool?: string;
}

export function getChapter3Content(): ChapterContent {
  return {
    chapterId: 3,
    title: 'The Protection Layer',
    description: 'Learn to protect your assets and family through proper legal structures',
    scenarios: [
      {
        id: 'ch3-asset-protection',
        title: 'Asset Protection Strategy',
        description: 'Your family has accumulated $500,000 in assets. How do you protect them?',
        choices: [
          { id: 'trust-protection', text: 'Create an irrevocable trust', outcome: 'Strong protection from creditors', points: 100, realWorldAction: 'Create Living Trust' },
          { id: 'llc-protection', text: 'Form an LLC for business assets', outcome: 'Separates personal and business liability', points: 80, realWorldAction: 'Form LLC' },
          { id: 'insurance-only', text: 'Rely on insurance alone', outcome: 'Basic protection but vulnerable', points: 40 },
          { id: 'no-action', text: 'Keep everything in personal name', outcome: 'Maximum exposure to creditors', points: 10 }
        ]
      },
      {
        id: 'ch3-llc-operating',
        title: 'LLC Operating Agreement Decisions',
        description: 'You are forming an LLC. What provisions should you include?',
        choices: [
          { id: 'comprehensive', text: 'Comprehensive agreement with succession planning', outcome: 'Full protection and clear succession', points: 100, realWorldAction: 'Generate LLC Operating Agreement' },
          { id: 'standard', text: 'Standard template agreement', outcome: 'Basic protection', points: 60 },
          { id: 'minimal', text: 'Minimal agreement to save money', outcome: 'Gaps in protection', points: 30 },
          { id: 'verbal', text: 'Verbal agreement with partners', outcome: 'No legal protection', points: 0 }
        ]
      },
      {
        id: 'ch3-insurance',
        title: 'Insurance and Liability Education',
        description: 'What insurance coverage should your family maintain?',
        choices: [
          { id: 'umbrella', text: 'Umbrella policy + specific coverage', outcome: 'Comprehensive protection', points: 100 },
          { id: 'standard-coverage', text: 'Standard home/auto/health', outcome: 'Basic coverage', points: 60 },
          { id: 'minimum', text: 'Minimum required coverage', outcome: 'Significant exposure', points: 30 },
          { id: 'self-insure', text: 'Self-insure (no coverage)', outcome: 'Maximum risk', points: 0 }
        ]
      },
      {
        id: 'ch3-stress-lawsuit',
        title: 'Protection Stress Test: Lawsuit',
        description: 'Someone sues your family for $1 million. How protected are you?',
        choices: [
          { id: 'fully-protected', text: 'Assets in trust, LLC, umbrella insurance', outcome: 'Personal assets protected', points: 100 },
          { id: 'partially-protected', text: 'Some assets protected', outcome: 'Partial loss possible', points: 50 },
          { id: 'minimal-protection', text: 'Only insurance coverage', outcome: 'May exceed limits', points: 30 },
          { id: 'no-protection', text: 'All assets in personal name', outcome: 'Everything at risk', points: 0 }
        ]
      }
    ],
    completionReward: { tokens: 500, badge: 'Protection Master' }
  };
}

export function getChapter4Content(): ChapterContent {
  return {
    chapterId: 4,
    title: 'Income Streams',
    description: 'Build multiple income streams and progress from employee to owner',
    scenarios: [
      {
        id: 'ch4-business-dev',
        title: 'Business Development',
        description: 'You want to start a business. What approach do you take?',
        choices: [
          { id: 'validated-idea', text: 'Validate idea, create business plan, secure funding', outcome: 'Structured approach', points: 100, realWorldAction: 'Business Plan Generator' },
          { id: 'side-hustle', text: 'Start as side hustle while employed', outcome: 'Lower risk', points: 80 },
          { id: 'jump-in', text: 'Quit job and go all-in', outcome: 'High risk', points: 40 },
          { id: 'wait-perfect', text: 'Wait for perfect conditions', outcome: 'May never start', points: 20 }
        ]
      },
      {
        id: 'ch4-w2-progression',
        title: 'W-2 to Contractor to Owner',
        description: 'You are a W-2 employee. How do you progress toward ownership?',
        choices: [
          { id: 'strategic', text: 'Build skills, network, transition to contractor, then owner', outcome: 'Methodical path', points: 100, realWorldAction: 'Worker Progression Tracker' },
          { id: 'contractor-first', text: 'Become contractor, build client base', outcome: 'Good income', points: 80 },
          { id: 'stay-employed', text: 'Stay employed, invest in other businesses', outcome: 'Passive ownership', points: 60 },
          { id: 'no-plan', text: 'No plan for progression', outcome: 'Remain dependent', points: 20 }
        ]
      },
      {
        id: 'ch4-passive-income',
        title: 'Passive Income Building',
        description: 'How do you build passive income streams?',
        choices: [
          { id: 'diversified', text: 'Real estate + dividends + royalties + business', outcome: 'Multiple streams', points: 100 },
          { id: 'real-estate', text: 'Focus on rental properties', outcome: 'Good cash flow', points: 80 },
          { id: 'investments', text: 'Dividend stocks and bonds', outcome: 'Truly passive', points: 70 },
          { id: 'single-source', text: 'One passive income source', outcome: 'Concentrated risk', points: 40 }
        ]
      },
      {
        id: 'ch4-business-entity',
        title: 'Business Entity Selection',
        description: 'Your business is growing. What entity structure do you choose?',
        choices: [
          { id: 's-corp', text: 'S-Corp for tax efficiency', outcome: 'Tax savings', points: 90, realWorldAction: 'Entity Formation' },
          { id: 'llc', text: 'LLC for flexibility', outcome: 'Simple and flexible', points: 80, realWorldAction: 'Form LLC' },
          { id: 'sole-prop', text: 'Stay as sole proprietor', outcome: 'No protection', points: 40 },
          { id: 'c-corp', text: 'C-Corp for growth potential', outcome: 'Investment ready', points: 70 }
        ]
      }
    ],
    completionReward: { tokens: 500, badge: 'Income Builder' }
  };
}

export function getChapter5Content(): ChapterContent {
  return {
    chapterId: 5,
    title: 'Generational Transfer',
    description: 'Plan for generational wealth transfer and 100-year legacy',
    scenarios: [
      {
        id: 'ch5-estate-planning',
        title: 'Estate Planning Gameplay',
        description: 'You have $2 million in assets. How do you plan your estate?',
        choices: [
          { id: 'comprehensive', text: 'Living trust + pour-over will + powers of attorney', outcome: 'Complete plan', points: 100, realWorldAction: 'Estate Planning Documents' },
          { id: 'trust-only', text: 'Living trust only', outcome: 'Good but incomplete', points: 70 },
          { id: 'will-only', text: 'Simple will', outcome: 'Goes through probate', points: 50 },
          { id: 'no-plan', text: 'No estate plan', outcome: 'State decides', points: 10 }
        ]
      },
      {
        id: 'ch5-trust-succession',
        title: 'Trust Succession Mechanics',
        description: 'Who should be your successor trustee?',
        choices: [
          { id: 'trained-family', text: 'Trained family member with professional backup', outcome: 'Family control with support', points: 100 },
          { id: 'professional', text: 'Professional trustee', outcome: 'Expertise but fees', points: 70 },
          { id: 'family-only', text: 'Family member without training', outcome: 'May struggle', points: 50 },
          { id: 'no-successor', text: 'No successor named', outcome: 'Court appoints', points: 10 }
        ]
      },
      {
        id: 'ch5-teaching-next-gen',
        title: 'Teaching Next Generation',
        description: 'How do you prepare the next generation for wealth stewardship?',
        choices: [
          { id: 'comprehensive-education', text: 'Financial education + mentorship + gradual responsibility', outcome: 'Well-prepared heirs', points: 100, realWorldAction: 'Academy Enrollment' },
          { id: 'formal-education', text: 'Send to financial education programs', outcome: 'Good foundation', points: 70 },
          { id: 'learn-by-doing', text: 'Let them learn by doing', outcome: 'May make mistakes', points: 50 },
          { id: 'no-preparation', text: 'No preparation', outcome: 'High risk', points: 20 }
        ]
      },
      {
        id: 'ch5-100-year-legacy',
        title: '100-Year Legacy Planning',
        description: 'How do you structure wealth for 100+ year preservation?',
        choices: [
          { id: 'dynasty-trust', text: 'Dynasty trust with family governance', outcome: 'Multi-generational protection', points: 100, realWorldAction: 'Dynasty Trust Setup' },
          { id: 'family-foundation', text: 'Family foundation for philanthropy', outcome: 'Legacy through giving', points: 80 },
          { id: 'business-succession', text: 'Family business with succession plan', outcome: 'Wealth through enterprise', points: 70 },
          { id: 'distribute-equally', text: 'Distribute equally to each generation', outcome: 'Wealth dilutes', points: 40 }
        ]
      }
    ],
    completionReward: { tokens: 750, badge: 'Legacy Architect' }
  };
}

export function getAllChapters(): ChapterContent[] {
  return [getChapter3Content(), getChapter4Content(), getChapter5Content()];
}

export function trackPlayerDecision(playerId: string, scenarioId: string, choiceId: string, chapter: number): PlayerDecision {
  return { scenarioId, choiceId, timestamp: new Date(), chapter };
}

export function generateRealWorldRecommendations(decisions: PlayerDecision[]): RealWorldRecommendation[] {
  const recommendations: RealWorldRecommendation[] = [];
  const chapters = getAllChapters();

  for (const decision of decisions) {
    for (const chapter of chapters) {
      const scenario = chapter.scenarios.find(s => s.id === decision.scenarioId);
      if (scenario) {
        const choice = scenario.choices.find(c => c.id === decision.choiceId);
        if (choice?.realWorldAction) {
          recommendations.push({
            category: chapter.title,
            priority: choice.points >= 80 ? 'high' : choice.points >= 50 ? 'medium' : 'low',
            action: choice.realWorldAction,
            description: choice.outcome,
            relatedTool: getRelatedTool(choice.realWorldAction)
          });
        }
      }
    }
  }

  if (decisions.length > 0) {
    recommendations.push({
      category: 'Getting Started',
      priority: 'high',
      action: 'Schedule Consultation',
      description: 'Discuss implementation of your game choices'
    });
  }

  return recommendations;
}

function getRelatedTool(action: string): string {
  const toolMap: Record<string, string> = {
    'Create Living Trust': '/legal/trust-templates',
    'Form LLC': '/legal/entity-formation',
    'Generate LLC Operating Agreement': '/legal/contracts',
    'Business Plan Generator': '/business/plan-generator',
    'Worker Progression Tracker': '/hr/progression',
    'Entity Formation': '/legal/entity-formation',
    'Estate Planning Documents': '/legal/estate-planning',
    'Academy Enrollment': '/academy',
    'Dynasty Trust Setup': '/legal/dynasty-trust'
  };
  return toolMap[action] || '/dashboard';
}

export function prefillBusinessFormation(decisions: PlayerDecision[]): Record<string, any> {
  const prefilled: Record<string, any> = {
    entityType: 'llc',
    hasOperatingAgreement: false,
    insuranceCoverage: 'standard',
    assetProtection: 'basic',
    successionPlan: false,
    estateDocuments: []
  };

  for (const decision of decisions) {
    if (decision.scenarioId === 'ch4-business-entity') {
      if (decision.choiceId === 's-corp') prefilled.entityType = 's-corp';
      else if (decision.choiceId === 'llc') prefilled.entityType = 'llc';
      else if (decision.choiceId === 'c-corp') prefilled.entityType = 'c-corp';
    }
    if (decision.scenarioId === 'ch3-llc-operating') {
      prefilled.hasOperatingAgreement = decision.choiceId === 'comprehensive' || decision.choiceId === 'standard';
    }
    if (decision.scenarioId === 'ch3-insurance') {
      if (decision.choiceId === 'umbrella') prefilled.insuranceCoverage = 'comprehensive';
    }
    if (decision.scenarioId === 'ch3-asset-protection') {
      if (decision.choiceId === 'trust-protection') prefilled.assetProtection = 'trust';
      else if (decision.choiceId === 'llc-protection') prefilled.assetProtection = 'llc';
    }
    if (decision.scenarioId === 'ch5-estate-planning') {
      if (decision.choiceId === 'comprehensive') {
        prefilled.estateDocuments = ['living-trust', 'pour-over-will', 'power-of-attorney'];
        prefilled.successionPlan = true;
      }
    }
  }

  return prefilled;
}

export function generateDocumentPathway(recommendations: RealWorldRecommendation[]): Array<{ step: number; action: string; tool: string; priority: string }> {
  const pathway: Array<{ step: number; action: string; tool: string; priority: string }> = [];
  let step = 1;

  const sorted = [...recommendations].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  for (const rec of sorted) {
    if (rec.relatedTool) {
      pathway.push({ step: step++, action: rec.action, tool: rec.relatedTool, priority: rec.priority });
    }
  }

  return pathway;
}

export function calculateChapterScore(chapterId: number, decisions: PlayerDecision[]): { score: number; maxScore: number; percentage: number; passed: boolean } {
  const chapters = getAllChapters();
  const chapter = chapters.find(c => c.chapterId === chapterId);
  if (!chapter) return { score: 0, maxScore: 0, percentage: 0, passed: false };

  let score = 0;
  let maxScore = 0;

  for (const scenario of chapter.scenarios) {
    const maxPoints = Math.max(...scenario.choices.map(c => c.points));
    maxScore += maxPoints;

    const decision = decisions.find(d => d.scenarioId === scenario.id);
    if (decision) {
      const choice = scenario.choices.find(c => c.id === decision.choiceId);
      if (choice) score += choice.points;
    }
  }

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return { score, maxScore, percentage, passed: percentage >= 60 };
}
