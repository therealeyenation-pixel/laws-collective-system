import { describe, it, expect } from 'vitest';
import {
  generateEmploymentPlaybook,
  generateVendorPlaybook,
  generateRealEstatePlaybook,
  getPlaybook,
  getAvailablePlaybooks,
  createPracticeScenario,
  getTactic,
  getAllTactics,
  TACTICS_LIBRARY
} from './services/negotiation-playbooks';

describe('Negotiation Playbooks Service', () => {
  describe('Employment Playbook', () => {
    it('should generate employment playbook', () => {
      const playbook = generateEmploymentPlaybook();
      
      expect(playbook.id).toBe('PB-EMPLOYMENT-001');
      expect(playbook.type).toBe('employment');
      expect(playbook.phases.length).toBeGreaterThan(0);
      expect(playbook.tactics.length).toBeGreaterThan(0);
      expect(playbook.templates.length).toBeGreaterThan(0);
    });

    it('should include preparation phase', () => {
      const playbook = generateEmploymentPlaybook();
      const prepPhase = playbook.phases.find(p => p.phase === 'preparation');
      
      expect(prepPhase).toBeDefined();
      expect(prepPhase?.objectives.length).toBeGreaterThan(0);
      expect(prepPhase?.actions.length).toBeGreaterThan(0);
    });

    it('should include counter-offer template', () => {
      const playbook = generateEmploymentPlaybook();
      const template = playbook.templates.find(t => t.name === 'Counter-Offer Email');
      
      expect(template).toBeDefined();
      expect(template?.type).toBe('email');
      expect(template?.content).toContain('Subject:');
    });

    it('should include red flags', () => {
      const playbook = generateEmploymentPlaybook();
      
      expect(playbook.redFlags.length).toBeGreaterThan(0);
      expect(playbook.redFlags).toContain('Pressure to accept immediately');
    });

    it('should include walkaway points', () => {
      const playbook = generateEmploymentPlaybook();
      
      expect(playbook.walkawayPoints.length).toBeGreaterThan(0);
    });
  });

  describe('Vendor Playbook', () => {
    it('should generate vendor playbook', () => {
      const playbook = generateVendorPlaybook();
      
      expect(playbook.id).toBe('PB-VENDOR-001');
      expect(playbook.type).toBe('vendor');
      expect(playbook.phases.length).toBeGreaterThan(0);
    });

    it('should include RFP template', () => {
      const playbook = generateVendorPlaybook();
      const template = playbook.templates.find(t => t.name === 'RFP Template');
      
      expect(template).toBeDefined();
      expect(template?.content).toContain('REQUEST FOR PROPOSAL');
    });
  });

  describe('Real Estate Playbook', () => {
    it('should generate real estate playbook', () => {
      const playbook = generateRealEstatePlaybook();
      
      expect(playbook.id).toBe('PB-REALESTATE-001');
      expect(playbook.type).toBe('real_estate');
      expect(playbook.phases.length).toBeGreaterThan(0);
    });

    it('should include inspection-related red flags', () => {
      const playbook = generateRealEstatePlaybook();
      
      expect(playbook.redFlags.some(r => r.toLowerCase().includes('inspection'))).toBe(true);
    });
  });

  describe('Playbook Retrieval', () => {
    it('should get playbook by type', () => {
      const employment = getPlaybook('employment');
      const vendor = getPlaybook('vendor');
      const realEstate = getPlaybook('real_estate');
      
      expect(employment.type).toBe('employment');
      expect(vendor.type).toBe('vendor');
      expect(realEstate.type).toBe('real_estate');
    });

    it('should return default for unknown type', () => {
      const playbook = getPlaybook('partnership');
      expect(playbook).toBeDefined();
    });

    it('should list available playbooks', () => {
      const available = getAvailablePlaybooks();
      
      expect(available.length).toBeGreaterThan(0);
      expect(available.some(p => p.type === 'employment')).toBe(true);
      expect(available.some(p => p.type === 'vendor')).toBe(true);
      expect(available.some(p => p.type === 'real_estate')).toBe(true);
    });
  });

  describe('Practice Scenarios', () => {
    it('should create employment scenario', () => {
      const scenario = createPracticeScenario('employment');
      
      expect(scenario.type).toBe('employment');
      expect(scenario.context).toBeDefined();
      expect(scenario.leverage.yours.length).toBeGreaterThan(0);
      expect(scenario.possibleOutcomes.length).toBeGreaterThan(0);
    });

    it('should create vendor scenario', () => {
      const scenario = createPracticeScenario('vendor');
      
      expect(scenario.type).toBe('vendor');
      expect(scenario.stakes).toBeDefined();
    });

    it('should create real estate scenario', () => {
      const scenario = createPracticeScenario('real_estate');
      
      expect(scenario.type).toBe('real_estate');
      expect(scenario.suggestedStrategy).toBeDefined();
    });

    it('should include outcome likelihoods', () => {
      const scenario = createPracticeScenario('employment');
      
      scenario.possibleOutcomes.forEach(outcome => {
        expect(['low', 'medium', 'high']).toContain(outcome.likelihood);
        expect(['poor', 'acceptable', 'good', 'excellent']).toContain(outcome.acceptability);
      });
    });
  });

  describe('Tactics Library', () => {
    it('should have all standard tactics', () => {
      const tactics = getAllTactics();
      
      expect(tactics.length).toBe(8);
      expect(tactics.some(t => t.tactic === 'anchoring')).toBe(true);
      expect(tactics.some(t => t.tactic === 'walkaway')).toBe(true);
      expect(tactics.some(t => t.tactic === 'silence')).toBe(true);
    });

    it('should get specific tactic', () => {
      const anchoring = getTactic('anchoring');
      
      expect(anchoring).toBeDefined();
      expect(anchoring?.description).toBeDefined();
      expect(anchoring?.whenToUse).toBeDefined();
      expect(anchoring?.example).toBeDefined();
    });

    it('should include counter-tactics', () => {
      const anchoring = getTactic('anchoring');
      
      expect(anchoring?.counterTactic).toBeDefined();
    });

    it('should return undefined for unknown tactic', () => {
      const unknown = getTactic('unknown' as any);
      expect(unknown).toBeUndefined();
    });
  });
});
