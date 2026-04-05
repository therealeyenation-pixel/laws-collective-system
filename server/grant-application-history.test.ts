import { describe, it, expect, beforeEach } from 'vitest';
import {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  updateStatus,
  getTimeline,
  addTimelineEvent,
  getFunderResponses,
  addFunderResponse,
  getDocuments,
  addDocument,
  getAnalytics,
  getApplicationsByEntity,
  getPendingApplications,
  getUpcomingDeadlines,
  getDashboardSummary,
  searchApplications,
  getEntityNames,
} from './services/grant-application-history';

describe('Grant Application History Service', () => {
  describe('getApplications', () => {
    it('should return all applications', () => {
      const applications = getApplications();
      expect(Array.isArray(applications)).toBe(true);
      expect(applications.length).toBeGreaterThan(0);
    });

    it('should filter by entity', () => {
      const applications = getApplications({ entityId: 'realeyenation' });
      expect(applications.every(app => app.entityId === 'realeyenation')).toBe(true);
    });

    it('should filter by status', () => {
      const applications = getApplications({ status: 'approved' });
      expect(applications.every(app => app.status === 'approved')).toBe(true);
    });

    it('should filter by funder type', () => {
      const applications = getApplications({ funderType: 'federal' });
      expect(applications.every(app => app.funderType === 'federal')).toBe(true);
    });

    it('should return applications sorted by updated date descending', () => {
      const applications = getApplications();
      for (let i = 1; i < applications.length; i++) {
        const prevDate = new Date(applications[i - 1].updatedAt).getTime();
        const currDate = new Date(applications[i].updatedAt).getTime();
        expect(prevDate).toBeGreaterThanOrEqual(currDate);
      }
    });
  });

  describe('getApplication', () => {
    it('should return application by id', () => {
      const applications = getApplications();
      const firstApp = applications[0];
      const retrieved = getApplication(firstApp.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(firstApp.id);
    });

    it('should return null for non-existent id', () => {
      const result = getApplication('non_existent_id');
      expect(result).toBeNull();
    });
  });

  describe('createApplication', () => {
    it('should create a new application', () => {
      const newApp = createApplication({
        entityId: 'laws',
        entityName: 'The L.A.W.S. Collective, LLC',
        grantName: 'Test Grant',
        funderName: 'Test Foundation',
        funderType: 'foundation',
        requestedAmount: 50000,
        status: 'draft',
        deadlineDate: '2026-06-01',
        projectTitle: 'Test Project',
        projectDescription: 'Test description',
        contactPerson: 'Test Contact',
        contactEmail: 'test@example.com',
        notes: 'Test notes',
      });

      expect(newApp.id).toBeDefined();
      expect(newApp.grantName).toBe('Test Grant');
      expect(newApp.status).toBe('draft');
      expect(newApp.createdAt).toBeDefined();
    });

    it('should add creation event to timeline', () => {
      const newApp = createApplication({
        entityId: 'luvonpurpose',
        entityName: 'LuvOnPurpose AWS LLC',
        grantName: 'Timeline Test Grant',
        funderName: 'Timeline Foundation',
        funderType: 'foundation',
        requestedAmount: 25000,
        status: 'draft',
        deadlineDate: '2026-07-01',
        projectTitle: 'Timeline Test',
        projectDescription: 'Testing timeline creation',
        contactPerson: 'Timeline Contact',
        contactEmail: 'timeline@test.com',
        notes: '',
      });

      const timeline = getTimeline(newApp.id);
      expect(timeline.length).toBeGreaterThan(0);
      expect(timeline.some(e => e.eventType === 'status_change')).toBe(true);
    });
  });

  describe('updateApplication', () => {
    it('should update application fields', () => {
      const applications = getApplications();
      const app = applications[0];
      
      const updated = updateApplication(app.id, {
        notes: 'Updated notes for testing',
      });

      expect(updated).not.toBeNull();
      expect(updated?.notes).toContain('Updated notes for testing');
    });

    it('should return null for non-existent application', () => {
      const result = updateApplication('non_existent', { notes: 'test' });
      expect(result).toBeNull();
    });

    it('should add timeline event when status changes', () => {
      const newApp = createApplication({
        entityId: '508academy',
        entityName: 'LuvOnPurpose Academy',
        grantName: 'Status Change Test',
        funderName: 'Test Funder',
        funderType: 'foundation',
        requestedAmount: 10000,
        status: 'draft',
        deadlineDate: '2026-08-01',
        projectTitle: 'Status Test',
        projectDescription: 'Testing status changes',
        contactPerson: 'Status Contact',
        contactEmail: 'status@test.com',
        notes: '',
      });

      updateApplication(newApp.id, { status: 'submitted' });
      const timeline = getTimeline(newApp.id);
      
      expect(timeline.some(e => 
        e.eventType === 'status_change' && e.newStatus === 'submitted'
      )).toBe(true);
    });
  });

  describe('deleteApplication', () => {
    it('should delete draft applications', () => {
      const newApp = createApplication({
        entityId: 'realeyenation',
        entityName: 'Real-Eye-Nation LLC',
        grantName: 'Delete Test Grant',
        funderName: 'Delete Foundation',
        funderType: 'foundation',
        requestedAmount: 5000,
        status: 'draft',
        deadlineDate: '2026-09-01',
        projectTitle: 'Delete Test',
        projectDescription: 'Testing deletion',
        contactPerson: 'Delete Contact',
        contactEmail: 'delete@test.com',
        notes: '',
      });

      const result = deleteApplication(newApp.id);
      expect(result).toBe(true);
      expect(getApplication(newApp.id)).toBeNull();
    });

    it('should not delete non-draft applications', () => {
      const applications = getApplications({ status: 'submitted' });
      if (applications.length > 0) {
        const result = deleteApplication(applications[0].id);
        expect(result).toBe(false);
      }
    });

    it('should return false for non-existent application', () => {
      const result = deleteApplication('non_existent');
      expect(result).toBe(false);
    });
  });

  describe('updateStatus', () => {
    it('should update application status', () => {
      const newApp = createApplication({
        entityId: 'laws',
        entityName: 'The L.A.W.S. Collective, LLC',
        grantName: 'Status Update Test',
        funderName: 'Status Foundation',
        funderType: 'foundation',
        requestedAmount: 15000,
        status: 'draft',
        deadlineDate: '2026-10-01',
        projectTitle: 'Status Update Test',
        projectDescription: 'Testing status updates',
        contactPerson: 'Status Contact',
        contactEmail: 'statusupdate@test.com',
        notes: '',
      });

      const updated = updateStatus(newApp.id, 'submitted', 'Submitted for review');
      expect(updated?.status).toBe('submitted');
      expect(updated?.submissionDate).toBeDefined();
    });

    it('should set decision date when approved', () => {
      const newApp = createApplication({
        entityId: 'luvonpurpose',
        entityName: 'LuvOnPurpose AWS LLC',
        grantName: 'Approval Test',
        funderName: 'Approval Foundation',
        funderType: 'foundation',
        requestedAmount: 20000,
        status: 'under_review',
        submissionDate: '2026-01-01',
        deadlineDate: '2026-01-15',
        projectTitle: 'Approval Test',
        projectDescription: 'Testing approval',
        contactPerson: 'Approval Contact',
        contactEmail: 'approval@test.com',
        notes: '',
      });

      const updated = updateStatus(newApp.id, 'approved', 'Grant approved!');
      expect(updated?.status).toBe('approved');
      expect(updated?.decisionDate).toBeDefined();
    });
  });

  describe('getTimeline', () => {
    it('should return timeline events for application', () => {
      const applications = getApplications();
      const app = applications[0];
      const timeline = getTimeline(app.id);
      
      expect(Array.isArray(timeline)).toBe(true);
    });

    it('should return empty array for non-existent application', () => {
      const timeline = getTimeline('non_existent');
      expect(timeline).toEqual([]);
    });

    it('should return events sorted by date descending', () => {
      const applications = getApplications();
      const app = applications[0];
      const timeline = getTimeline(app.id);
      
      for (let i = 1; i < timeline.length; i++) {
        const prevDate = new Date(timeline[i - 1].createdAt).getTime();
        const currDate = new Date(timeline[i].createdAt).getTime();
        expect(prevDate).toBeGreaterThanOrEqual(currDate);
      }
    });
  });

  describe('addTimelineEvent', () => {
    it('should add event to timeline', () => {
      const applications = getApplications();
      const app = applications[0];
      
      const event = addTimelineEvent(app.id, {
        eventType: 'note_added',
        description: 'Test note added',
        createdBy: 'test_user',
      });

      expect(event).not.toBeNull();
      expect(event?.eventType).toBe('note_added');
      expect(event?.description).toBe('Test note added');
    });

    it('should return null for non-existent application', () => {
      const event = addTimelineEvent('non_existent', {
        eventType: 'note_added',
        description: 'Test',
        createdBy: 'test',
      });
      expect(event).toBeNull();
    });
  });

  describe('getFunderResponses', () => {
    it('should return responses for application', () => {
      const applications = getApplications();
      const app = applications[0];
      const responses = getFunderResponses(app.id);
      
      expect(Array.isArray(responses)).toBe(true);
    });

    it('should return empty array for non-existent application', () => {
      const responses = getFunderResponses('non_existent');
      expect(responses).toEqual([]);
    });
  });

  describe('addFunderResponse', () => {
    it('should add funder response', () => {
      const applications = getApplications();
      const app = applications[0];
      
      const response = addFunderResponse(app.id, {
        responseDate: '2026-02-01',
        responseType: 'acknowledgment',
        summary: 'Application received',
        details: 'Your application has been received and is under review.',
        actionRequired: false,
      });

      expect(response).not.toBeNull();
      expect(response?.responseType).toBe('acknowledgment');
    });

    it('should add timeline event when response added', () => {
      const newApp = createApplication({
        entityId: 'laws',
        entityName: 'The L.A.W.S. Collective, LLC',
        grantName: 'Response Timeline Test',
        funderName: 'Test Foundation',
        funderType: 'foundation',
        requestedAmount: 10000,
        status: 'submitted',
        deadlineDate: '2026-06-01',
        projectTitle: 'Response Timeline Test',
        projectDescription: 'Testing response timeline',
        contactPerson: 'Test Contact',
        contactEmail: 'test@example.com',
        notes: '',
      });
      
      addFunderResponse(newApp.id, {
        responseDate: '2026-02-15',
        responseType: 'request_info',
        summary: 'Additional info needed',
        details: 'Please provide additional budget details.',
        actionRequired: true,
        actionDeadline: '2026-03-01',
      });

      const newTimeline = getTimeline(newApp.id);
      // Should have at least 2 events: creation + communication
      expect(newTimeline.length).toBeGreaterThanOrEqual(2);
      expect(newTimeline.some(e => e.eventType === 'communication')).toBe(true);
    });

    it('should return null for non-existent application', () => {
      const response = addFunderResponse('non_existent', {
        responseDate: '2026-02-01',
        responseType: 'acknowledgment',
        summary: 'Test',
        details: 'Test',
        actionRequired: false,
      });
      expect(response).toBeNull();
    });
  });

  describe('getDocuments', () => {
    it('should return documents for application', () => {
      const applications = getApplications();
      const app = applications[0];
      const documents = getDocuments(app.id);
      
      expect(Array.isArray(documents)).toBe(true);
    });

    it('should return empty array for non-existent application', () => {
      const documents = getDocuments('non_existent');
      expect(documents).toEqual([]);
    });
  });

  describe('addDocument', () => {
    it('should add document to application', () => {
      const applications = getApplications();
      const app = applications[0];
      
      const document = addDocument(app.id, {
        documentType: 'application',
        fileName: 'test_application.pdf',
        fileUrl: 'https://example.com/test.pdf',
        uploadedBy: 'test_user',
      });

      expect(document).not.toBeNull();
      expect(document?.documentType).toBe('application');
      expect(document?.fileName).toBe('test_application.pdf');
    });

    it('should add timeline event when document uploaded', () => {
      const newApp = createApplication({
        entityId: 'luvonpurpose',
        entityName: 'LuvOnPurpose AWS LLC',
        grantName: 'Document Timeline Test',
        funderName: 'Test Foundation',
        funderType: 'foundation',
        requestedAmount: 15000,
        status: 'draft',
        deadlineDate: '2026-07-01',
        projectTitle: 'Document Timeline Test',
        projectDescription: 'Testing document timeline',
        contactPerson: 'Test Contact',
        contactEmail: 'test@example.com',
        notes: '',
      });
      
      addDocument(newApp.id, {
        documentType: 'budget',
        fileName: 'budget.xlsx',
        fileUrl: 'https://example.com/budget.xlsx',
        uploadedBy: 'test_user',
      });

      const newTimeline = getTimeline(newApp.id);
      // Should have at least 2 events: creation + document_uploaded
      expect(newTimeline.length).toBeGreaterThanOrEqual(2);
      expect(newTimeline.some(e => e.eventType === 'document_uploaded')).toBe(true);
    });

    it('should return null for non-existent application', () => {
      const document = addDocument('non_existent', {
        documentType: 'application',
        fileName: 'test.pdf',
        fileUrl: 'https://example.com/test.pdf',
        uploadedBy: 'test',
      });
      expect(document).toBeNull();
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics object', () => {
      const analytics = getAnalytics();
      
      expect(analytics.totalApplications).toBeGreaterThanOrEqual(0);
      expect(analytics.byStatus).toBeDefined();
      expect(analytics.byFunderType).toBeDefined();
      expect(analytics.byEntity).toBeDefined();
      expect(typeof analytics.successRate).toBe('number');
      expect(typeof analytics.totalRequested).toBe('number');
      expect(typeof analytics.totalAwarded).toBe('number');
    });

    it('should include all status types', () => {
      const analytics = getAnalytics();
      const statuses = ['draft', 'submitted', 'under_review', 'additional_info_requested', 'approved', 'rejected', 'withdrawn'];
      
      statuses.forEach(status => {
        expect(analytics.byStatus[status as keyof typeof analytics.byStatus]).toBeDefined();
      });
    });

    it('should include all funder types', () => {
      const analytics = getAnalytics();
      const funderTypes = ['federal', 'foundation', 'state', 'corporate', 'other'];
      
      funderTypes.forEach(type => {
        expect(analytics.byFunderType[type as keyof typeof analytics.byFunderType]).toBeDefined();
      });
    });

    it('should include recent activity', () => {
      const analytics = getAnalytics();
      expect(Array.isArray(analytics.recentActivity)).toBe(true);
    });
  });

  describe('getApplicationsByEntity', () => {
    it('should return applications for specific entity', () => {
      const applications = getApplicationsByEntity('realeyenation');
      expect(applications.every(app => app.entityId === 'realeyenation')).toBe(true);
    });

    it('should return empty array for entity with no applications', () => {
      const applications = getApplicationsByEntity('non_existent_entity');
      expect(applications).toEqual([]);
    });
  });

  describe('getPendingApplications', () => {
    it('should return only pending applications', () => {
      const pending = getPendingApplications();
      const validStatuses = ['submitted', 'under_review', 'additional_info_requested'];
      
      pending.forEach(app => {
        expect(validStatuses).toContain(app.status);
      });
    });

    it('should be sorted by deadline date', () => {
      const pending = getPendingApplications();
      
      for (let i = 1; i < pending.length; i++) {
        const prevDate = new Date(pending[i - 1].deadlineDate).getTime();
        const currDate = new Date(pending[i].deadlineDate).getTime();
        expect(prevDate).toBeLessThanOrEqual(currDate);
      }
    });
  });

  describe('getUpcomingDeadlines', () => {
    it('should return only draft applications', () => {
      const upcoming = getUpcomingDeadlines(365);
      upcoming.forEach(app => {
        expect(app.status).toBe('draft');
      });
    });

    it('should respect days ahead parameter', () => {
      const upcoming = getUpcomingDeadlines(30);
      const now = new Date();
      const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      upcoming.forEach(app => {
        const deadline = new Date(app.deadlineDate);
        expect(deadline.getTime()).toBeLessThanOrEqual(futureDate.getTime());
      });
    });
  });

  describe('getDashboardSummary', () => {
    it('should return complete dashboard data', () => {
      const dashboard = getDashboardSummary();
      
      expect(dashboard.analytics).toBeDefined();
      expect(dashboard.pendingApplications).toBeDefined();
      expect(dashboard.upcomingDeadlines).toBeDefined();
      expect(dashboard.recentDecisions).toBeDefined();
      expect(dashboard.actionRequired).toBeDefined();
    });

    it('should include action required applications', () => {
      const dashboard = getDashboardSummary();
      
      dashboard.actionRequired.forEach(app => {
        expect(app.status).toBe('additional_info_requested');
      });
    });
  });

  describe('searchApplications', () => {
    it('should search by grant name', () => {
      const results = searchApplications('NEA');
      expect(results.some(app => app.grantName.toLowerCase().includes('nea'))).toBe(true);
    });

    it('should search by funder name', () => {
      const results = searchApplications('Foundation');
      expect(results.some(app => app.funderName.toLowerCase().includes('foundation'))).toBe(true);
    });

    it('should search by project title', () => {
      const results = searchApplications('Documentary');
      expect(results.some(app => app.projectTitle.toLowerCase().includes('documentary'))).toBe(true);
    });

    it('should return empty array for no matches', () => {
      const results = searchApplications('xyz123nonexistent');
      expect(results).toEqual([]);
    });

    it('should be case insensitive', () => {
      const upperResults = searchApplications('FORD');
      const lowerResults = searchApplications('ford');
      expect(upperResults.length).toBe(lowerResults.length);
    });
  });

  describe('getEntityNames', () => {
    it('should return entity names mapping', () => {
      const names = getEntityNames();
      
      expect(names['realeyenation']).toBeDefined();
      expect(names['laws']).toBeDefined();
      expect(names['luvonpurpose']).toBeDefined();
      expect(names['508academy']).toBeDefined();
    });

    it('should return correct entity names', () => {
      const names = getEntityNames();
      
      expect(names['realeyenation']).toBe('Real-Eye-Nation LLC');
      expect(names['laws']).toBe('The L.A.W.S. Collective, LLC');
    });
  });
});
