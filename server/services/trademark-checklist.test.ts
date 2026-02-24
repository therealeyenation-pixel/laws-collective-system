import { describe, it, expect } from 'vitest';
import { getTrademarkClasses, getChecklistForEntity, getClassPriority } from './trademark-checklist';

describe('Trademark Checklist Service', () => {
  describe('getTrademarkClasses', () => {
    it('should return trademark classes', () => {
      const classes = getTrademarkClasses();
      expect(classes.length).toBeGreaterThan(0);
      expect(classes[0]).toHaveProperty('classNumber');
    });
  });

  describe('getChecklistForEntity', () => {
    it('should return checklist for 508c1a entity', () => {
      const checklist = getChecklistForEntity('508c1a');
      expect(checklist.entityType).toBe('508c1a');
      expect(checklist.recommendedClasses.length).toBeGreaterThan(0);
      expect(checklist.checklist.length).toBeGreaterThan(0);
    });

    it('should return checklist for llc entity', () => {
      const checklist = getChecklistForEntity('llc');
      expect(checklist.entityType).toBe('llc');
      expect(checklist.totalEstimatedCost).toBeGreaterThan(0);
    });

    it('should include required items', () => {
      const checklist = getChecklistForEntity('media');
      const required = checklist.checklist.filter(i => i.required);
      expect(required.length).toBeGreaterThan(0);
    });
  });

  describe('getClassPriority', () => {
    it('should return priority classes for 508c1a', () => {
      const priority = getClassPriority('508c1a');
      expect(priority).toContain(36);
    });

    it('should return priority classes for llc', () => {
      const priority = getClassPriority('llc');
      expect(priority).toContain(35);
    });
  });
});
