import { describe, it, expect } from 'vitest';
import {
  getChapter3Content,
  getChapter4Content,
  getChapter5Content,
  getAllChapters,
  trackPlayerDecision,
  generateRealWorldRecommendations,
  prefillBusinessFormation,
  generateDocumentPathway,
  calculateChapterScore,
  PlayerDecision
} from './services/laws-quest-chapters-3-5';

describe('L.A.W.S. Quest Chapters 3-5', () => {
  describe('Chapter 3: The Protection Layer', () => {
    it('should return chapter 3 content with correct structure', () => {
      const chapter = getChapter3Content();
      expect(chapter.chapterId).toBe(3);
      expect(chapter.title).toBe('The Protection Layer');
      expect(chapter.scenarios.length).toBeGreaterThan(0);
      expect(chapter.completionReward.tokens).toBe(500);
      expect(chapter.completionReward.badge).toBe('Protection Master');
    });

    it('should include asset protection scenarios', () => {
      const chapter = getChapter3Content();
      const assetProtection = chapter.scenarios.find(s => s.id === 'ch3-asset-protection');
      expect(assetProtection).toBeDefined();
      expect(assetProtection?.choices.length).toBe(4);
    });

    it('should include LLC operating agreement scenario', () => {
      const chapter = getChapter3Content();
      const llcScenario = chapter.scenarios.find(s => s.id === 'ch3-llc-operating');
      expect(llcScenario).toBeDefined();
      expect(llcScenario?.title).toContain('LLC Operating Agreement');
    });

    it('should include insurance scenario', () => {
      const chapter = getChapter3Content();
      const insurance = chapter.scenarios.find(s => s.id === 'ch3-insurance');
      expect(insurance).toBeDefined();
    });

    it('should include lawsuit stress test', () => {
      const chapter = getChapter3Content();
      const stressTest = chapter.scenarios.find(s => s.id === 'ch3-stress-lawsuit');
      expect(stressTest).toBeDefined();
      expect(stressTest?.title).toContain('Lawsuit');
    });
  });

  describe('Chapter 4: Income Streams', () => {
    it('should return chapter 4 content with correct structure', () => {
      const chapter = getChapter4Content();
      expect(chapter.chapterId).toBe(4);
      expect(chapter.title).toBe('Income Streams');
      expect(chapter.scenarios.length).toBeGreaterThan(0);
      expect(chapter.completionReward.tokens).toBe(500);
      expect(chapter.completionReward.badge).toBe('Income Builder');
    });

    it('should include business development scenario', () => {
      const chapter = getChapter4Content();
      const bizDev = chapter.scenarios.find(s => s.id === 'ch4-business-dev');
      expect(bizDev).toBeDefined();
      expect(bizDev?.choices.length).toBe(4);
    });

    it('should include W-2 to owner progression scenario', () => {
      const chapter = getChapter4Content();
      const progression = chapter.scenarios.find(s => s.id === 'ch4-w2-progression');
      expect(progression).toBeDefined();
      expect(progression?.title).toContain('W-2');
    });

    it('should include passive income scenario', () => {
      const chapter = getChapter4Content();
      const passive = chapter.scenarios.find(s => s.id === 'ch4-passive-income');
      expect(passive).toBeDefined();
    });

    it('should include business entity selection scenario', () => {
      const chapter = getChapter4Content();
      const entity = chapter.scenarios.find(s => s.id === 'ch4-business-entity');
      expect(entity).toBeDefined();
      expect(entity?.choices.some(c => c.id === 's-corp')).toBe(true);
    });
  });

  describe('Chapter 5: Generational Transfer', () => {
    it('should return chapter 5 content with correct structure', () => {
      const chapter = getChapter5Content();
      expect(chapter.chapterId).toBe(5);
      expect(chapter.title).toBe('Generational Transfer');
      expect(chapter.scenarios.length).toBeGreaterThan(0);
      expect(chapter.completionReward.tokens).toBe(750);
      expect(chapter.completionReward.badge).toBe('Legacy Architect');
    });

    it('should include estate planning scenario', () => {
      const chapter = getChapter5Content();
      const estate = chapter.scenarios.find(s => s.id === 'ch5-estate-planning');
      expect(estate).toBeDefined();
      expect(estate?.choices.length).toBe(4);
    });

    it('should include trust succession scenario', () => {
      const chapter = getChapter5Content();
      const succession = chapter.scenarios.find(s => s.id === 'ch5-trust-succession');
      expect(succession).toBeDefined();
    });

    it('should include teaching next generation scenario', () => {
      const chapter = getChapter5Content();
      const teaching = chapter.scenarios.find(s => s.id === 'ch5-teaching-next-gen');
      expect(teaching).toBeDefined();
    });

    it('should include 100-year legacy scenario', () => {
      const chapter = getChapter5Content();
      const legacy = chapter.scenarios.find(s => s.id === 'ch5-100-year-legacy');
      expect(legacy).toBeDefined();
      expect(legacy?.title).toContain('100-Year');
    });
  });

  describe('getAllChapters', () => {
    it('should return all three chapters', () => {
      const chapters = getAllChapters();
      expect(chapters.length).toBe(3);
      expect(chapters[0].chapterId).toBe(3);
      expect(chapters[1].chapterId).toBe(4);
      expect(chapters[2].chapterId).toBe(5);
    });
  });

  describe('trackPlayerDecision', () => {
    it('should create a player decision record', () => {
      const decision = trackPlayerDecision('player-123', 'ch3-asset-protection', 'trust-protection', 3);
      expect(decision.scenarioId).toBe('ch3-asset-protection');
      expect(decision.choiceId).toBe('trust-protection');
      expect(decision.chapter).toBe(3);
      expect(decision.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('generateRealWorldRecommendations', () => {
    it('should generate recommendations from player decisions', () => {
      const decisions: PlayerDecision[] = [
        { scenarioId: 'ch3-asset-protection', choiceId: 'trust-protection', timestamp: new Date(), chapter: 3 },
        { scenarioId: 'ch4-business-entity', choiceId: 's-corp', timestamp: new Date(), chapter: 4 }
      ];
      
      const recommendations = generateRealWorldRecommendations(decisions);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.action === 'Create Living Trust')).toBe(true);
      expect(recommendations.some(r => r.action === 'Entity Formation')).toBe(true);
    });

    it('should include consultation recommendation when decisions exist', () => {
      const decisions: PlayerDecision[] = [
        { scenarioId: 'ch3-asset-protection', choiceId: 'trust-protection', timestamp: new Date(), chapter: 3 }
      ];
      
      const recommendations = generateRealWorldRecommendations(decisions);
      expect(recommendations.some(r => r.action === 'Schedule Consultation')).toBe(true);
    });

    it('should assign correct priorities based on points', () => {
      const decisions: PlayerDecision[] = [
        { scenarioId: 'ch3-asset-protection', choiceId: 'trust-protection', timestamp: new Date(), chapter: 3 }
      ];
      
      const recommendations = generateRealWorldRecommendations(decisions);
      const trustRec = recommendations.find(r => r.action === 'Create Living Trust');
      expect(trustRec?.priority).toBe('high');
    });
  });

  describe('prefillBusinessFormation', () => {
    it('should prefill entity type from decisions', () => {
      const decisions: PlayerDecision[] = [
        { scenarioId: 'ch4-business-entity', choiceId: 's-corp', timestamp: new Date(), chapter: 4 }
      ];
      
      const prefilled = prefillBusinessFormation(decisions);
      expect(prefilled.entityType).toBe('s-corp');
    });

    it('should prefill operating agreement from decisions', () => {
      const decisions: PlayerDecision[] = [
        { scenarioId: 'ch3-llc-operating', choiceId: 'comprehensive', timestamp: new Date(), chapter: 3 }
      ];
      
      const prefilled = prefillBusinessFormation(decisions);
      expect(prefilled.hasOperatingAgreement).toBe(true);
    });

    it('should prefill estate documents from decisions', () => {
      const decisions: PlayerDecision[] = [
        { scenarioId: 'ch5-estate-planning', choiceId: 'comprehensive', timestamp: new Date(), chapter: 5 }
      ];
      
      const prefilled = prefillBusinessFormation(decisions);
      expect(prefilled.estateDocuments).toContain('living-trust');
      expect(prefilled.successionPlan).toBe(true);
    });

    it('should return defaults when no decisions', () => {
      const prefilled = prefillBusinessFormation([]);
      expect(prefilled.entityType).toBe('llc');
      expect(prefilled.hasOperatingAgreement).toBe(false);
    });
  });

  describe('generateDocumentPathway', () => {
    it('should generate ordered pathway from recommendations', () => {
      const recommendations = [
        { category: 'Test', priority: 'low' as const, action: 'Action 3', description: 'Desc', relatedTool: '/tool3' },
        { category: 'Test', priority: 'high' as const, action: 'Action 1', description: 'Desc', relatedTool: '/tool1' },
        { category: 'Test', priority: 'medium' as const, action: 'Action 2', description: 'Desc', relatedTool: '/tool2' }
      ];
      
      const pathway = generateDocumentPathway(recommendations);
      expect(pathway[0].action).toBe('Action 1');
      expect(pathway[0].priority).toBe('high');
      expect(pathway[1].action).toBe('Action 2');
      expect(pathway[2].action).toBe('Action 3');
    });

    it('should only include recommendations with related tools', () => {
      const recommendations = [
        { category: 'Test', priority: 'high' as const, action: 'Action 1', description: 'Desc', relatedTool: '/tool1' },
        { category: 'Test', priority: 'high' as const, action: 'Action 2', description: 'Desc' }
      ];
      
      const pathway = generateDocumentPathway(recommendations);
      expect(pathway.length).toBe(1);
    });
  });

  describe('calculateChapterScore', () => {
    it('should calculate score for chapter 3', () => {
      const decisions: PlayerDecision[] = [
        { scenarioId: 'ch3-asset-protection', choiceId: 'trust-protection', timestamp: new Date(), chapter: 3 },
        { scenarioId: 'ch3-llc-operating', choiceId: 'comprehensive', timestamp: new Date(), chapter: 3 }
      ];
      
      const result = calculateChapterScore(3, decisions);
      expect(result.score).toBe(200);
      expect(result.maxScore).toBeGreaterThan(0);
      expect(result.percentage).toBeGreaterThan(0);
    });

    it('should return passed true when percentage >= 60', () => {
      const decisions: PlayerDecision[] = [
        { scenarioId: 'ch3-asset-protection', choiceId: 'trust-protection', timestamp: new Date(), chapter: 3 },
        { scenarioId: 'ch3-llc-operating', choiceId: 'comprehensive', timestamp: new Date(), chapter: 3 },
        { scenarioId: 'ch3-insurance', choiceId: 'umbrella', timestamp: new Date(), chapter: 3 },
        { scenarioId: 'ch3-stress-lawsuit', choiceId: 'fully-protected', timestamp: new Date(), chapter: 3 }
      ];
      
      const result = calculateChapterScore(3, decisions);
      expect(result.passed).toBe(true);
    });

    it('should return passed false when percentage < 60', () => {
      const decisions: PlayerDecision[] = [
        { scenarioId: 'ch3-asset-protection', choiceId: 'no-action', timestamp: new Date(), chapter: 3 }
      ];
      
      const result = calculateChapterScore(3, decisions);
      expect(result.passed).toBe(false);
    });

    it('should return zeros for invalid chapter', () => {
      const result = calculateChapterScore(99, []);
      expect(result.score).toBe(0);
      expect(result.maxScore).toBe(0);
      expect(result.passed).toBe(false);
    });
  });
});
