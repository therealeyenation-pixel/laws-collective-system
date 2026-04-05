import { describe, it, expect } from 'vitest';
import { getStandardModules, recordModuleCompletion, calculateUserCompliance, getTeamComplianceReport, getRecertificationReminders } from './simulator-completion';

describe('Simulator Completion Service', () => {
  describe('getStandardModules', () => {
    it('should return standard training modules', () => {
      const modules = getStandardModules();
      expect(modules.length).toBeGreaterThan(0);
      expect(modules[0]).toHaveProperty('id');
      expect(modules[0]).toHaveProperty('passingScore');
    });
  });

  describe('recordModuleCompletion', () => {
    it('should record passing completion', () => {
      const completion = recordModuleCompletion('safety-101', 'user-1', 90);
      expect(completion.passed).toBe(true);
      expect(completion.certificateId).toBeDefined();
    });

    it('should record failing completion', () => {
      const completion = recordModuleCompletion('safety-101', 'user-1', 50);
      expect(completion.passed).toBe(false);
      expect(completion.certificateId).toBeUndefined();
    });
  });

  describe('calculateUserCompliance', () => {
    it('should return compliant status when all modules completed', () => {
      const completions = [
        recordModuleCompletion('safety-101', 'user-1', 90),
        recordModuleCompletion('harassment-prev', 'user-1', 100),
        recordModuleCompletion('data-security', 'user-1', 90)
      ];
      const status = calculateUserCompliance('user-1', 'all', completions);
      expect(status.compliant).toBe(true);
      expect(status.pendingModules.length).toBe(0);
    });

    it('should return non-compliant when modules pending', () => {
      const status = calculateUserCompliance('user-1', 'all', []);
      expect(status.compliant).toBe(false);
      expect(status.pendingModules.length).toBeGreaterThan(0);
    });
  });

  describe('getTeamComplianceReport', () => {
    it('should calculate team compliance rate', () => {
      const team = [{ userId: 'user-1', role: 'all' }, { userId: 'user-2', role: 'all' }];
      const report = getTeamComplianceReport(team, []);
      expect(report.totalMembers).toBe(2);
      expect(report.complianceRate).toBe(0);
    });
  });

  describe('getRecertificationReminders', () => {
    it('should return completions expiring soon', () => {
      const completion = recordModuleCompletion('safety-101', 'user-1', 90);
      completion.expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      const reminders = getRecertificationReminders([completion], 30);
      expect(reminders.length).toBe(1);
    });
  });
});
