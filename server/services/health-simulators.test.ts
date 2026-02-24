import { describe, it, expect } from 'vitest';
import {
  getSimulator,
  getAllSimulators,
  startSession,
  recordScenarioResult,
  completeSession,
  generateSessionReport
} from './health-simulators';

describe('Health Department Simulators', () => {
  describe('getSimulator', () => {
    it('should return emotional intelligence simulator', () => {
      const sim = getSimulator('emotional_intelligence');
      
      expect(sim.name).toBe('Emotional Intelligence Simulator');
      expect(sim.scenarios.length).toBeGreaterThan(0);
      expect(sim.skillsTargeted).toContain('Empathy');
    });

    it('should return stress management simulator', () => {
      const sim = getSimulator('stress_management');
      
      expect(sim.name).toBe('Stress Management Simulator');
      expect(sim.waterRealmConnection).toContain('water');
    });

    it('should return relationship wellness simulator', () => {
      const sim = getSimulator('relationship_wellness');
      
      expect(sim.skillsTargeted).toContain('Boundary setting');
    });

    it('should return work-life balance simulator', () => {
      const sim = getSimulator('work_life_balance');
      
      expect(sim.skillsTargeted).toContain('Saying no');
    });

    it('should return community health simulator', () => {
      const sim = getSimulator('community_health');
      
      expect(sim.skillsTargeted).toContain('Network building');
    });
  });

  describe('getAllSimulators', () => {
    it('should return all 5 simulators', () => {
      const sims = getAllSimulators();
      
      expect(sims).toHaveLength(5);
    });
  });

  describe('startSession', () => {
    it('should create new session with initial values', () => {
      const session = startSession('sim-ei', 'user-001');
      
      expect(session.sessionId).toContain('session-');
      expect(session.simulatorId).toBe('sim-ei');
      expect(session.userId).toBe('user-001');
      expect(session.totalScore).toBe(0);
      expect(session.scenarioResults).toHaveLength(0);
    });
  });

  describe('recordScenarioResult', () => {
    it('should add scenario result and update score', () => {
      let session = startSession('sim-ei', 'user-001');
      
      session = recordScenarioResult(session, 'ei-1', 'ei-1b', 90, 45);
      
      expect(session.scenarioResults).toHaveLength(1);
      expect(session.totalScore).toBe(90);
      expect(session.maxScore).toBe(100);
    });

    it('should accumulate multiple results', () => {
      let session = startSession('sim-ei', 'user-001');
      
      session = recordScenarioResult(session, 'ei-1', 'ei-1b', 90, 45);
      session = recordScenarioResult(session, 'ei-2', 'ei-2b', 95, 30);
      
      expect(session.scenarioResults).toHaveLength(2);
      expect(session.totalScore).toBe(185);
      expect(session.maxScore).toBe(200);
    });
  });

  describe('completeSession', () => {
    it('should generate insights for high score', () => {
      let session = startSession('sim-ei', 'user-001');
      session = recordScenarioResult(session, 'ei-1', 'ei-1b', 90, 45);
      
      session = completeSession(session);
      
      expect(session.completedAt).toBeDefined();
      expect(session.insights).toContain('Excellent emotional wellness skills demonstrated!');
    });

    it('should generate insights for medium score', () => {
      let session = startSession('sim-ei', 'user-001');
      session = recordScenarioResult(session, 'ei-1', 'ei-1d', 80, 45);
      session = recordScenarioResult(session, 'ei-2', 'ei-2a', 40, 30);
      
      session = completeSession(session);
      
      // 120/200 = 60% which is medium range
      expect(session.insights.some(i => i.includes('room for growth'))).toBe(true);
    });

    it('should generate insights for low score', () => {
      let session = startSession('sim-ei', 'user-001');
      session = recordScenarioResult(session, 'ei-1', 'ei-1a', 20, 45);
      session = recordScenarioResult(session, 'ei-2', 'ei-2d', 25, 30);
      
      session = completeSession(session);
      
      expect(session.insights.some(i => i.includes('learning opportunity'))).toBe(true);
    });
  });

  describe('generateSessionReport', () => {
    it('should generate formatted report', () => {
      let session = startSession('sim-ei', 'user-001');
      session = recordScenarioResult(session, 'ei-1', 'ei-1b', 90, 45);
      session = completeSession(session);
      
      const report = generateSessionReport(session);
      
      expect(report).toContain('HEALTH SIMULATOR SESSION REPORT');
      expect(report).toContain('sim-ei');
      expect(report).toContain('90 / 100');
      expect(report).toContain('WATER REALM CONNECTION');
    });
  });
});
