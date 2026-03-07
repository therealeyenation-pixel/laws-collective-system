import { describe, it, expect, beforeEach } from 'vitest';
import {
  getGrantDeadlines,
  getGrantDeadlineById,
  getDeadlinesForEntity,
  getUpcomingDeadlines,
  getClosingSoonDeadlines,
  addCustomDeadline,
  updateCustomDeadline,
  deleteCustomDeadline,
  markAsSubmitted,
  generateReminders,
  getReminders,
  getDueReminders,
  markReminderSent,
  addCustomReminder,
  deleteReminder,
  getDeadlineStatistics,
  getDeadlineCalendarEvents,
  searchGrants,
  getGrantsByFundingRange,
  type GrantDeadline,
  type GrantCategory
} from './services/grant-deadlines';

describe('Grant Deadlines Service', () => {
  describe('getGrantDeadlines', () => {
    it('should return all grant deadlines', () => {
      const deadlines = getGrantDeadlines();
      expect(deadlines).toBeInstanceOf(Array);
      expect(deadlines.length).toBeGreaterThanOrEqual(10);
    });

    it('should filter by category', () => {
      const federalDeadlines = getGrantDeadlines({ category: 'federal' });
      federalDeadlines.forEach(d => {
        expect(d.category).toBe('federal');
      });

      const foundationDeadlines = getGrantDeadlines({ category: 'foundation' });
      foundationDeadlines.forEach(d => {
        expect(d.category).toBe('foundation');
      });
    });

    it('should filter by entity type', () => {
      const academyDeadlines = getGrantDeadlines({ entityType: '508_academy' });
      academyDeadlines.forEach(d => {
        expect(d.eligibleEntities).toContain('508_academy');
      });
    });

    it('should return deadlines with valid dates', () => {
      const deadlines = getGrantDeadlines();
      deadlines.forEach(d => {
        expect(d.openDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(d.closeDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
  });

  describe('getGrantDeadlineById', () => {
    it('should return specific deadline by ID', () => {
      const deadline = getGrantDeadlineById('nea_art_works_2026');
      expect(deadline).not.toBeNull();
      expect(deadline?.name).toBe('NEA Art Works Grant FY2026');
      expect(deadline?.funder).toBe('National Endowment for the Arts');
    });

    it('should return null for invalid ID', () => {
      const deadline = getGrantDeadlineById('invalid_id');
      expect(deadline).toBeNull();
    });

    it('should return Ford Foundation grant', () => {
      const deadline = getGrantDeadlineById('ford_building_institutions_2026');
      expect(deadline).not.toBeNull();
      expect(deadline?.maxFunding).toBe(5000000);
    });
  });

  describe('getDeadlinesForEntity', () => {
    it('should return deadlines for Real-Eye-Nation', () => {
      const deadlines = getDeadlinesForEntity('real_eye_nation');
      expect(deadlines.length).toBeGreaterThan(0);
      deadlines.forEach(d => {
        expect(d.eligibleEntities).toContain('real_eye_nation');
      });
    });

    it('should return deadlines for The The L.A.W.S. Collective', () => {
      const deadlines = getDeadlinesForEntity('laws_collective');
      expect(deadlines.length).toBeGreaterThan(0);
      deadlines.forEach(d => {
        expect(d.eligibleEntities).toContain('laws_collective');
      });
    });

    it('should return deadlines for 508 Academy', () => {
      const deadlines = getDeadlinesForEntity('508_academy');
      expect(deadlines.length).toBeGreaterThan(0);
    });

    it('should return deadlines for LuvOnPurpose AWS', () => {
      const deadlines = getDeadlinesForEntity('luvonpurpose_aws');
      expect(deadlines.length).toBeGreaterThan(0);
    });
  });

  describe('getUpcomingDeadlines', () => {
    it('should return deadlines within specified days', () => {
      const upcoming = getUpcomingDeadlines(365);
      expect(upcoming).toBeInstanceOf(Array);
      upcoming.forEach(d => {
        expect(['upcoming', 'open', 'closing_soon']).toContain(d.status);
      });
    });

    it('should default to 90 days', () => {
      const upcoming = getUpcomingDeadlines();
      expect(upcoming).toBeInstanceOf(Array);
    });

    it('should exclude closed and submitted deadlines', () => {
      const upcoming = getUpcomingDeadlines(365);
      upcoming.forEach(d => {
        expect(d.status).not.toBe('closed');
        expect(d.status).not.toBe('submitted');
      });
    });
  });

  describe('getClosingSoonDeadlines', () => {
    it('should return deadlines closing within 14 days', () => {
      const closingSoon = getClosingSoonDeadlines();
      expect(closingSoon).toBeInstanceOf(Array);
      closingSoon.forEach(d => {
        expect(d.status).toBe('closing_soon');
      });
    });
  });

  describe('addCustomDeadline', () => {
    it('should add a custom deadline', () => {
      const newDeadline = addCustomDeadline({
        name: 'Test Custom Grant',
        funder: 'Test Foundation',
        category: 'foundation',
        description: 'A test grant for unit testing',
        eligibleEntities: ['laws_collective'],
        openDate: '2026-06-01',
        closeDate: '2026-08-31',
        maxFunding: 100000,
        requirements: ['Test requirement']
      });

      expect(newDeadline.id).toMatch(/^custom_/);
      expect(newDeadline.name).toBe('Test Custom Grant');
      expect(newDeadline.status).toBe('upcoming');
    });

    it('should include custom deadline in all deadlines', () => {
      const customDeadline = addCustomDeadline({
        name: 'Another Test Grant',
        funder: 'Another Foundation',
        category: 'corporate',
        description: 'Another test',
        eligibleEntities: ['real_eye_nation'],
        openDate: '2026-07-01',
        closeDate: '2026-09-30',
        maxFunding: 50000,
        requirements: []
      });

      const allDeadlines = getGrantDeadlines();
      const found = allDeadlines.find(d => d.id === customDeadline.id);
      expect(found).not.toBeUndefined();
    });
  });

  describe('updateCustomDeadline', () => {
    it('should update a custom deadline', () => {
      const custom = addCustomDeadline({
        name: 'Update Test Grant',
        funder: 'Update Foundation',
        category: 'state',
        description: 'For update testing',
        eligibleEntities: ['508_academy'],
        openDate: '2026-05-01',
        closeDate: '2026-07-31',
        maxFunding: 75000,
        requirements: []
      });

      const updated = updateCustomDeadline(custom.id, {
        name: 'Updated Grant Name',
        maxFunding: 150000
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated Grant Name');
      expect(updated?.maxFunding).toBe(150000);
    });

    it('should return null for non-existent deadline', () => {
      const result = updateCustomDeadline('non_existent_id', { name: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('deleteCustomDeadline', () => {
    it('should delete a custom deadline', () => {
      const custom = addCustomDeadline({
        name: 'Delete Test Grant',
        funder: 'Delete Foundation',
        category: 'custom',
        description: 'For delete testing',
        eligibleEntities: ['luvonpurpose_aws'],
        openDate: '2026-08-01',
        closeDate: '2026-10-31',
        maxFunding: 25000,
        requirements: []
      });

      const result = deleteCustomDeadline(custom.id);
      expect(result).toBe(true);

      const found = getGrantDeadlineById(custom.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent deadline', () => {
      const result = deleteCustomDeadline('non_existent_id');
      expect(result).toBe(false);
    });
  });

  describe('markAsSubmitted', () => {
    it('should mark a deadline as submitted', () => {
      const result = markAsSubmitted('nea_art_works_2026');
      expect(result).not.toBeNull();
      expect(result?.status).toBe('submitted');
    });

    it('should return null for non-existent deadline', () => {
      const result = markAsSubmitted('non_existent_id');
      expect(result).toBeNull();
    });
  });

  describe('generateReminders', () => {
    it('should generate reminders for a deadline', () => {
      const reminders = generateReminders('ford_building_institutions_2026');
      expect(reminders).toBeInstanceOf(Array);
      // Should generate up to 4 reminders (30, 14, 7, 1 day)
      expect(reminders.length).toBeLessThanOrEqual(4);
    });

    it('should include reminder message', () => {
      const reminders = generateReminders('kellogg_thriving_children_2026');
      reminders.forEach(r => {
        expect(r.message).toBeTruthy();
        expect(r.message).toContain('Kellogg');
      });
    });

    it('should return empty array for invalid deadline', () => {
      const reminders = generateReminders('invalid_id');
      expect(reminders).toEqual([]);
    });
  });

  describe('getReminders', () => {
    it('should return all reminders', () => {
      // First generate some reminders
      generateReminders('macarthur_100_and_change_2026');
      
      const reminders = getReminders();
      expect(reminders).toBeInstanceOf(Array);
    });

    it('should filter by sent status', () => {
      const unsentReminders = getReminders({ sent: false });
      unsentReminders.forEach(r => {
        expect(r.sent).toBe(false);
      });
    });

    it('should filter by deadline ID', () => {
      generateReminders('gates_economic_mobility_2026');
      const reminders = getReminders({ deadlineId: 'gates_economic_mobility_2026' });
      reminders.forEach(r => {
        expect(r.grantDeadlineId).toBe('gates_economic_mobility_2026');
      });
    });
  });

  describe('markReminderSent', () => {
    it('should mark a reminder as sent', () => {
      const reminders = generateReminders('walton_k12_education_2026');
      if (reminders.length > 0) {
        const result = markReminderSent(reminders[0].id);
        expect(result).not.toBeNull();
        expect(result?.sent).toBe(true);
        expect(result?.sentAt).toBeDefined();
      }
    });

    it('should return null for invalid reminder', () => {
      const result = markReminderSent('invalid_reminder_id');
      expect(result).toBeNull();
    });
  });

  describe('addCustomReminder', () => {
    it('should add a custom reminder', () => {
      const reminder = addCustomReminder(
        'lumina_postsecondary_2026',
        '2026-05-15',
        'Custom reminder message',
        'test@example.com'
      );

      expect(reminder).not.toBeNull();
      expect(reminder?.reminderType).toBe('custom');
      expect(reminder?.message).toBe('Custom reminder message');
    });

    it('should return null for invalid deadline', () => {
      const reminder = addCustomReminder(
        'invalid_id',
        '2026-05-15',
        'Test message'
      );
      expect(reminder).toBeNull();
    });
  });

  describe('deleteReminder', () => {
    it('should delete a reminder', () => {
      const reminders = generateReminders('usda_rbdg_2026_q1');
      if (reminders.length > 0) {
        const result = deleteReminder(reminders[0].id);
        expect(result).toBe(true);
      }
    });

    it('should return false for invalid reminder', () => {
      const result = deleteReminder('invalid_reminder_id');
      expect(result).toBe(false);
    });
  });

  describe('getDeadlineStatistics', () => {
    it('should return comprehensive statistics', () => {
      const stats = getDeadlineStatistics();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byCategory');
      expect(stats).toHaveProperty('byStatus');
      expect(stats).toHaveProperty('totalFunding');
      expect(stats).toHaveProperty('closingSoon');
      expect(stats).toHaveProperty('upcomingReminders');
    });

    it('should have correct category breakdown', () => {
      const stats = getDeadlineStatistics();
      
      expect(stats.byCategory).toHaveProperty('federal');
      expect(stats.byCategory).toHaveProperty('foundation');
      expect(stats.byCategory).toHaveProperty('state');
      expect(stats.byCategory).toHaveProperty('corporate');
      expect(stats.byCategory).toHaveProperty('custom');
    });

    it('should have correct status breakdown', () => {
      const stats = getDeadlineStatistics();
      
      expect(stats.byStatus).toHaveProperty('upcoming');
      expect(stats.byStatus).toHaveProperty('open');
      expect(stats.byStatus).toHaveProperty('closing_soon');
      expect(stats.byStatus).toHaveProperty('closed');
      expect(stats.byStatus).toHaveProperty('submitted');
    });

    it('should calculate total funding', () => {
      const stats = getDeadlineStatistics();
      expect(stats.totalFunding).toBeGreaterThan(0);
    });
  });

  describe('getDeadlineCalendarEvents', () => {
    it('should return calendar events', () => {
      const events = getDeadlineCalendarEvents();
      expect(events).toBeInstanceOf(Array);
    });

    it('should filter by month and year', () => {
      const events = getDeadlineCalendarEvents(6, 2026);
      events.forEach(e => {
        const date = new Date(e.date);
        expect(date.getMonth() + 1).toBe(6);
        expect(date.getFullYear()).toBe(2026);
      });
    });

    it('should include event type', () => {
      const events = getDeadlineCalendarEvents();
      events.forEach(e => {
        expect(['open', 'close', 'reminder']).toContain(e.type);
      });
    });

    it('should include grant ID reference', () => {
      const events = getDeadlineCalendarEvents();
      events.forEach(e => {
        expect(e.grantId).toBeTruthy();
      });
    });
  });

  describe('searchGrants', () => {
    it('should search by grant name', () => {
      const results = searchGrants('NEA');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(r => {
        expect(
          r.name.toLowerCase().includes('nea') ||
          r.funder.toLowerCase().includes('nea') ||
          r.description.toLowerCase().includes('nea')
        ).toBe(true);
      });
    });

    it('should search by funder name', () => {
      const results = searchGrants('Ford');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search by description', () => {
      const results = searchGrants('education');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const results = searchGrants('xyznonexistent123');
      expect(results).toEqual([]);
    });
  });

  describe('getGrantsByFundingRange', () => {
    it('should filter by funding range', () => {
      const results = getGrantsByFundingRange(100000, 500000);
      results.forEach(r => {
        expect(r.maxFunding).toBeGreaterThanOrEqual(100000);
        expect(r.maxFunding).toBeLessThanOrEqual(500000);
      });
    });

    it('should return high-value grants', () => {
      const results = getGrantsByFundingRange(1000000, 100000000);
      expect(results.length).toBeGreaterThan(0);
      results.forEach(r => {
        expect(r.maxFunding).toBeGreaterThanOrEqual(1000000);
      });
    });

    it('should return empty for out-of-range', () => {
      const results = getGrantsByFundingRange(1, 10);
      expect(results).toEqual([]);
    });
  });

  describe('Grant Data Integrity', () => {
    it('should have required fields for all grants', () => {
      const deadlines = getGrantDeadlines();
      deadlines.forEach(d => {
        expect(d.id).toBeTruthy();
        expect(d.name).toBeTruthy();
        expect(d.funder).toBeTruthy();
        expect(d.category).toBeTruthy();
        expect(d.description).toBeTruthy();
        expect(d.eligibleEntities).toBeInstanceOf(Array);
        expect(d.openDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(d.closeDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(d.maxFunding).toBeGreaterThan(0);
        expect(d.requirements).toBeInstanceOf(Array);
      });
    });

    it('should have valid date ranges', () => {
      const deadlines = getGrantDeadlines();
      deadlines.forEach(d => {
        expect(d.closeDate >= d.openDate).toBe(true);
      });
    });

    it('should have at least one eligible entity', () => {
      const deadlines = getGrantDeadlines();
      deadlines.forEach(d => {
        expect(d.eligibleEntities.length).toBeGreaterThan(0);
      });
    });
  });
});
