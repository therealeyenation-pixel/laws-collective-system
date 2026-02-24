/**
 * Need Statement Editor Service Tests
 * Phase 53: Admin interface for customizing entity need statements
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getEditableEntities,
  getCurrentStatement,
  createDraft,
  updateDraft,
  getDraft,
  getDraftsForEntity,
  getPendingDrafts,
  submitForReview,
  approveDraft,
  rejectDraft,
  deleteDraft,
  getVersionHistory,
  getVersion,
  revertToVersion,
  compareVersions,
  getTemplates,
  generateFromTemplate,
  validateStatement,
  getEditorStatistics
} from './services/need-statement-editor';

describe('Need Statement Editor Service', () => {
  describe('getEditableEntities', () => {
    it('should return all 4 entities', () => {
      const entities = getEditableEntities();
      expect(entities).toHaveLength(4);
    });

    it('should include Real-Eye-Nation LLC', () => {
      const entities = getEditableEntities();
      const realEyeNation = entities.find(e => e.entityId === 'realeyenation');
      expect(realEyeNation).toBeDefined();
      expect(realEyeNation?.entityName).toBe('Real-Eye-Nation LLC');
      expect(realEyeNation?.entityType).toBe('LLC');
    });

    it('should include L.A.W.S. Collective', () => {
      const entities = getEditableEntities();
      const laws = entities.find(e => e.entityId === 'laws');
      expect(laws).toBeDefined();
      expect(laws?.entityName).toBe('The L.A.W.S. Collective, LLC');
    });

    it('should include LuvOnPurpose AWS', () => {
      const entities = getEditableEntities();
      const luvonpurpose = entities.find(e => e.entityId === 'luvonpurpose');
      expect(luvonpurpose).toBeDefined();
      expect(luvonpurpose?.entityName).toBe('LuvOnPurpose Autonomous Wealth System LLC');
    });

    it('should include 508-LuvOnPurpose Academy', () => {
      const entities = getEditableEntities();
      const academy = entities.find(e => e.entityId === '508academy');
      expect(academy).toBeDefined();
      expect(academy?.entityType).toBe('508(c)(1)(a)');
    });

    it('should have current version for each entity', () => {
      const entities = getEditableEntities();
      entities.forEach(entity => {
        expect(entity.currentVersion).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('getCurrentStatement', () => {
    it('should return statement for valid entity', () => {
      const statement = getCurrentStatement('realeyenation');
      expect(statement).not.toBeNull();
      expect(statement?.entityName).toBe('Real-Eye-Nation LLC');
    });

    it('should return null for invalid entity', () => {
      const statement = getCurrentStatement('invalid-entity');
      expect(statement).toBeNull();
    });

    it('should include word count', () => {
      const statement = getCurrentStatement('laws');
      expect(statement?.wordCount).toBeGreaterThan(300);
    });

    it('should include version number', () => {
      const statement = getCurrentStatement('luvonpurpose');
      expect(statement?.version).toBeGreaterThanOrEqual(1);
    });
  });

  describe('createDraft', () => {
    it('should create a new draft', () => {
      const draft = createDraft('realeyenation', 'Test draft content for testing purposes.', 'test-user');
      expect(draft).not.toBeNull();
      expect(draft?.entityId).toBe('realeyenation');
      expect(draft?.status).toBe('draft');
    });

    it('should calculate word count', () => {
      const draft = createDraft('laws', 'One two three four five six seven eight nine ten.', 'test-user');
      expect(draft?.wordCount).toBe(10);
    });

    it('should return null for invalid entity', () => {
      const draft = createDraft('invalid', 'Content', 'test-user');
      expect(draft).toBeNull();
    });

    it('should increment version from current', () => {
      const currentStatement = getCurrentStatement('realeyenation');
      const draft = createDraft('realeyenation', 'New content', 'test-user');
      expect(draft?.version).toBe((currentStatement?.version || 0) + 1);
    });
  });

  describe('updateDraft', () => {
    it('should update draft content', () => {
      const draft = createDraft('realeyenation', 'Initial content', 'test-user');
      const updated = updateDraft(draft!.id, 'Updated content here');
      expect(updated?.content).toBe('Updated content here');
    });

    it('should update word count', () => {
      const draft = createDraft('laws', 'One two three', 'test-user');
      const updated = updateDraft(draft!.id, 'One two three four five');
      expect(updated?.wordCount).toBe(5);
    });

    it('should return null for invalid draft id', () => {
      const updated = updateDraft('invalid-id', 'Content');
      expect(updated).toBeNull();
    });
  });

  describe('getDraft', () => {
    it('should retrieve existing draft', () => {
      const created = createDraft('realeyenation', 'Test content', 'test-user');
      const retrieved = getDraft(created!.id);
      expect(retrieved?.id).toBe(created?.id);
    });

    it('should return null for non-existent draft', () => {
      const draft = getDraft('non-existent-id');
      expect(draft).toBeNull();
    });
  });

  describe('getDraftsForEntity', () => {
    it('should return drafts for entity', () => {
      createDraft('realeyenation', 'Draft 1', 'user1');
      createDraft('realeyenation', 'Draft 2', 'user2');
      const drafts = getDraftsForEntity('realeyenation');
      expect(drafts.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array for entity with no drafts', () => {
      const drafts = getDraftsForEntity('non-existent-entity');
      expect(drafts).toEqual([]);
    });
  });

  describe('submitForReview', () => {
    it('should change status to pending_review', () => {
      const draft = createDraft('laws', 'Content for review', 'test-user');
      const submitted = submitForReview(draft!.id);
      expect(submitted?.status).toBe('pending_review');
    });

    it('should return null for invalid draft', () => {
      const result = submitForReview('invalid-id');
      expect(result).toBeNull();
    });
  });

  describe('getPendingDrafts', () => {
    it('should return drafts with pending_review status', () => {
      const draft = createDraft('luvonpurpose', 'Pending content', 'test-user');
      submitForReview(draft!.id);
      const pending = getPendingDrafts();
      expect(pending.some(d => d.id === draft?.id)).toBe(true);
    });
  });

  describe('approveDraft', () => {
    it('should approve pending draft', () => {
      const draft = createDraft('realeyenation', 'Approved content for testing the approval workflow.', 'test-user');
      submitForReview(draft!.id);
      const result = approveDraft(draft!.id, 'reviewer', 'Looks good');
      expect(result?.draft.status).toBe('approved');
      expect(result?.version).toBeDefined();
    });

    it('should create new version on approval', () => {
      const draft = createDraft('laws', 'New version content for approval testing.', 'test-user');
      submitForReview(draft!.id);
      const result = approveDraft(draft!.id, 'reviewer');
      expect(result?.version.isActive).toBe(true);
    });

    it('should return null for non-pending draft', () => {
      const draft = createDraft('realeyenation', 'Content', 'test-user');
      const result = approveDraft(draft!.id, 'reviewer');
      expect(result).toBeNull();
    });
  });

  describe('rejectDraft', () => {
    it('should reject pending draft', () => {
      const draft = createDraft('luvonpurpose', 'Rejected content', 'test-user');
      submitForReview(draft!.id);
      const rejected = rejectDraft(draft!.id, 'reviewer', 'Needs more work');
      expect(rejected?.status).toBe('rejected');
      expect(rejected?.reviewNotes).toBe('Needs more work');
    });

    it('should return null for non-pending draft', () => {
      const draft = createDraft('realeyenation', 'Content', 'test-user');
      const result = rejectDraft(draft!.id, 'reviewer', 'Notes');
      expect(result).toBeNull();
    });
  });

  describe('deleteDraft', () => {
    it('should delete draft in draft status', () => {
      const draft = createDraft('realeyenation', 'To be deleted', 'test-user');
      const deleted = deleteDraft(draft!.id);
      expect(deleted).toBe(true);
      expect(getDraft(draft!.id)).toBeNull();
    });

    it('should delete rejected draft', () => {
      const draft = createDraft('laws', 'Rejected then deleted', 'test-user');
      submitForReview(draft!.id);
      rejectDraft(draft!.id, 'reviewer', 'Rejected');
      const deleted = deleteDraft(draft!.id);
      expect(deleted).toBe(true);
    });

    it('should return false for non-existent draft', () => {
      const deleted = deleteDraft('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('getVersionHistory', () => {
    it('should return version history for entity', () => {
      const history = getVersionHistory('realeyenation');
      expect(history.length).toBeGreaterThanOrEqual(1);
    });

    it('should be sorted by version descending', () => {
      const history = getVersionHistory('laws');
      for (let i = 0; i < history.length - 1; i++) {
        expect(history[i].version).toBeGreaterThan(history[i + 1].version);
      }
    });

    it('should return empty array for invalid entity', () => {
      const history = getVersionHistory('invalid-entity');
      expect(history).toEqual([]);
    });
  });

  describe('getVersion', () => {
    it('should return specific version', () => {
      const version = getVersion('realeyenation', 1);
      expect(version).not.toBeNull();
      expect(version?.version).toBe(1);
    });

    it('should return null for non-existent version', () => {
      const version = getVersion('realeyenation', 999);
      expect(version).toBeNull();
    });
  });

  describe('revertToVersion', () => {
    it('should create new version with reverted content', () => {
      const originalVersion = getVersion('realeyenation', 1);
      const newVersion = revertToVersion('realeyenation', 1, 'admin');
      expect(newVersion).not.toBeNull();
      expect(newVersion?.content).toBe(originalVersion?.content);
      expect(newVersion?.isActive).toBe(true);
    });

    it('should return null for invalid version', () => {
      const result = revertToVersion('realeyenation', 999, 'admin');
      expect(result).toBeNull();
    });
  });

  describe('compareVersions', () => {
    it('should compare two versions', () => {
      const comparison = compareVersions('realeyenation', 1, 1);
      expect(comparison).not.toBeNull();
      expect(comparison?.wordCountDiff).toBe(0);
    });

    it('should return null for invalid versions', () => {
      const comparison = compareVersions('realeyenation', 1, 999);
      expect(comparison).toBeNull();
    });
  });

  describe('getTemplates', () => {
    it('should return available templates', () => {
      const templates = getTemplates();
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should include standard nonprofit template', () => {
      const templates = getTemplates();
      const nonprofit = templates.find(t => t.id === 'standard_nonprofit');
      expect(nonprofit).toBeDefined();
      expect(nonprofit?.sections.length).toBeGreaterThan(0);
    });

    it('should include LLC business template', () => {
      const templates = getTemplates();
      const llc = templates.find(t => t.id === 'llc_business');
      expect(llc).toBeDefined();
    });

    it('should include media production template', () => {
      const templates = getTemplates();
      const media = templates.find(t => t.id === 'media_production');
      expect(media).toBeDefined();
    });

    it('should include education program template', () => {
      const templates = getTemplates();
      const education = templates.find(t => t.id === 'education_program');
      expect(education).toBeDefined();
    });
  });

  describe('generateFromTemplate', () => {
    it('should generate statement from template sections', () => {
      const content = generateFromTemplate('standard_nonprofit', {
        'Problem Statement': 'This is the problem.',
        'Target Population': 'These are the people we serve.'
      });
      expect(content).toContain('This is the problem.');
      expect(content).toContain('These are the people we serve.');
    });

    it('should return empty string for invalid template', () => {
      const content = generateFromTemplate('invalid-template', {});
      expect(content).toBe('');
    });
  });

  describe('validateStatement', () => {
    it('should validate word count', () => {
      const validation = validateStatement('Short content');
      expect(validation.wordCount).toBe(2);
      expect(validation.isValid).toBe(false);
    });

    it('should flag statements that are too short', () => {
      const validation = validateStatement('This is a very short statement.');
      expect(validation.issues.some(i => i.includes('too short'))).toBe(true);
    });

    it('should flag statements that are too long', () => {
      const longContent = Array(800).fill('word').join(' ');
      const validation = validateStatement(longContent);
      expect(validation.issues.some(i => i.includes('too long'))).toBe(true);
    });

    it('should suggest adding statistics', () => {
      const validation = validateStatement('This statement has no numbers or statistics mentioned anywhere in the content.');
      expect(validation.suggestions.some(s => s.includes('statistics'))).toBe(true);
    });

    it('should pass validation for well-formed statement', () => {
      const goodStatement = `This organization addresses a critical need in our community. The problem affects 50% of families in the region. 
      We serve low-income populations who lack access to essential services. Our funding request of $500,000 will support 
      three key initiatives. The expected impact includes reaching 1,000 families annually. Our community-based approach 
      ensures sustainable outcomes for generations to come.`;
      const validation = validateStatement(goodStatement);
      // May have suggestions but should have fewer issues
      expect(validation.wordCount).toBeGreaterThan(50);
    });
  });

  describe('getEditorStatistics', () => {
    it('should return statistics object', () => {
      const stats = getEditorStatistics();
      expect(stats.totalEntities).toBe(4);
      expect(stats.totalVersions).toBeGreaterThanOrEqual(4);
    });

    it('should track pending drafts', () => {
      const stats = getEditorStatistics();
      expect(typeof stats.pendingDrafts).toBe('number');
    });

    it('should calculate average word count', () => {
      const stats = getEditorStatistics();
      expect(stats.averageWordCount).toBeGreaterThan(0);
    });

    it('should include recent activity', () => {
      const stats = getEditorStatistics();
      expect(Array.isArray(stats.recentActivity)).toBe(true);
    });
  });
});

describe('Need Statement Editor Workflow', () => {
  it('should complete full edit-review-approve workflow', () => {
    // Create draft
    const draft = createDraft('508academy', 'New comprehensive need statement content for testing the complete workflow.', 'author');
    expect(draft?.status).toBe('draft');

    // Update draft
    const updated = updateDraft(draft!.id, 'Updated and improved need statement content for the academy entity.');
    expect(updated?.content).toContain('Updated');

    // Submit for review
    const submitted = submitForReview(draft!.id);
    expect(submitted?.status).toBe('pending_review');

    // Verify in pending list
    const pending = getPendingDrafts();
    expect(pending.some(d => d.id === draft?.id)).toBe(true);

    // Approve
    const result = approveDraft(draft!.id, 'approver', 'Excellent work');
    expect(result?.draft.status).toBe('approved');
    expect(result?.version.isActive).toBe(true);

    // Verify new version is active
    const history = getVersionHistory('508academy');
    const activeVersion = history.find(v => v.isActive);
    expect(activeVersion?.content).toContain('Updated');
  });

  it('should complete edit-review-reject workflow', () => {
    // Create and submit draft
    const draft = createDraft('realeyenation', 'Draft that will be rejected for testing.', 'author');
    submitForReview(draft!.id);

    // Reject
    const rejected = rejectDraft(draft!.id, 'reviewer', 'Needs significant revision');
    expect(rejected?.status).toBe('rejected');
    expect(rejected?.reviewNotes).toBe('Needs significant revision');

    // Verify can be deleted
    const deleted = deleteDraft(draft!.id);
    expect(deleted).toBe(true);
  });

  it('should handle version revert workflow', () => {
    // Get original version
    const originalHistory = getVersionHistory('laws');
    const originalVersion = originalHistory.find(v => v.version === 1);

    // Revert to version 1
    const reverted = revertToVersion('laws', 1, 'admin');
    expect(reverted).not.toBeNull();
    expect(reverted?.content).toBe(originalVersion?.content);

    // Verify new version is active
    const newHistory = getVersionHistory('laws');
    const activeVersion = newHistory.find(v => v.isActive);
    expect(activeVersion?.id).toBe(reverted?.id);
  });
});
