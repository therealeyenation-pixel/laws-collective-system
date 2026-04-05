import { describe, it, expect } from 'vitest';
import {
  createGrantApplication,
  updateGrantStatus,
  addBudgetItem,
  addMilestone,
  completeMilestone,
  addDocument,
  markDocumentUploaded,
  addContact,
  setupReportingSchedule,
  getTemplate,
  prefillTemplate,
  calculateBudgetTotal,
  getBudgetByCategory,
  checkReadiness,
  generateGrantSummary
} from './grant-workflow-improvements';

describe('Grant Workflow Improvements Service', () => {
  describe('createGrantApplication', () => {
    it('should create grant with identified status', () => {
      const grant = createGrantApplication(
        'Community Development Grant',
        'State Foundation',
        'state',
        50000,
        new Date('2025-06-01'),
        'A project to improve community resources'
      );

      expect(grant.grantId).toContain('grant-');
      expect(grant.name).toBe('Community Development Grant');
      expect(grant.status).toBe('identified');
      expect(grant.statusHistory).toHaveLength(1);
    });
  });

  describe('updateGrantStatus', () => {
    it('should update status and record history', () => {
      let grant = createGrantApplication('Test Grant', 'Funder', 'foundation', 10000, new Date(), 'Description');
      grant = updateGrantStatus(grant, 'researching', 'user-001', 'Started research phase');

      expect(grant.status).toBe('researching');
      expect(grant.statusHistory).toHaveLength(2);
      expect(grant.statusHistory[1].reason).toBe('Started research phase');
    });

    it('should set submittedAt when submitted', () => {
      let grant = createGrantApplication('Test Grant', 'Funder', 'foundation', 10000, new Date(), 'Description');
      grant = updateGrantStatus(grant, 'submitted', 'user-001');

      expect(grant.submittedAt).toBeDefined();
    });

    it('should set awardedAt when awarded', () => {
      let grant = createGrantApplication('Test Grant', 'Funder', 'foundation', 10000, new Date(), 'Description');
      grant = updateGrantStatus(grant, 'awarded', 'user-001');

      expect(grant.awardedAt).toBeDefined();
    });
  });

  describe('Budget Management', () => {
    it('should add budget item', () => {
      let grant = createGrantApplication('Test Grant', 'Funder', 'federal', 100000, new Date(), 'Description');
      grant = addBudgetItem(grant, 'personnel', 'Project Manager', 50000, 'Full-time PM needed');

      expect(grant.budgetItems).toHaveLength(1);
      expect(grant.budgetItems[0].category).toBe('personnel');
      expect(grant.budgetItems[0].amount).toBe(50000);
    });

    it('should calculate budget total', () => {
      let grant = createGrantApplication('Test Grant', 'Funder', 'federal', 100000, new Date(), 'Description');
      grant = addBudgetItem(grant, 'personnel', 'PM', 50000, 'Justification');
      grant = addBudgetItem(grant, 'equipment', 'Computers', 10000, 'Justification');
      grant = addBudgetItem(grant, 'supplies', 'Office supplies', 5000, 'Justification');

      expect(calculateBudgetTotal(grant)).toBe(65000);
    });

    it('should get budget by category', () => {
      let grant = createGrantApplication('Test Grant', 'Funder', 'federal', 100000, new Date(), 'Description');
      grant = addBudgetItem(grant, 'personnel', 'PM', 50000, 'Justification');
      grant = addBudgetItem(grant, 'personnel', 'Assistant', 30000, 'Justification');
      grant = addBudgetItem(grant, 'equipment', 'Computers', 10000, 'Justification');

      const byCategory = getBudgetByCategory(grant);
      expect(byCategory.personnel).toBe(80000);
      expect(byCategory.equipment).toBe(10000);
    });
  });

  describe('Milestones', () => {
    it('should add milestone', () => {
      let grant = createGrantApplication('Test Grant', 'Funder', 'foundation', 10000, new Date(), 'Description');
      grant = addMilestone(grant, 'Phase 1 Complete', 'Initial phase', new Date('2025-03-01'), ['Report', 'Data']);

      expect(grant.milestones).toHaveLength(1);
      expect(grant.milestones[0].status).toBe('pending');
      expect(grant.milestones[0].deliverables).toContain('Report');
    });

    it('should complete milestone', () => {
      let grant = createGrantApplication('Test Grant', 'Funder', 'foundation', 10000, new Date(), 'Description');
      grant = addMilestone(grant, 'Phase 1', 'Initial', new Date(), []);
      const milestoneId = grant.milestones[0].milestoneId;
      grant = completeMilestone(grant, milestoneId);

      expect(grant.milestones[0].status).toBe('completed');
      expect(grant.milestones[0].completedAt).toBeDefined();
    });
  });

  describe('Documents', () => {
    it('should add document', () => {
      let grant = createGrantApplication('Test Grant', 'Funder', 'federal', 10000, new Date(), 'Description');
      grant = addDocument(grant, '501c3 Letter', 'support_letter', true);

      expect(grant.documents).toHaveLength(1);
      expect(grant.documents[0].required).toBe(true);
      expect(grant.documents[0].uploaded).toBe(false);
    });

    it('should mark document uploaded', () => {
      let grant = createGrantApplication('Test Grant', 'Funder', 'federal', 10000, new Date(), 'Description');
      grant = addDocument(grant, '501c3 Letter', 'support_letter', true);
      const docId = grant.documents[0].documentId;
      grant = markDocumentUploaded(grant, docId);

      expect(grant.documents[0].uploaded).toBe(true);
      expect(grant.documents[0].uploadedAt).toBeDefined();
    });
  });

  describe('Contacts', () => {
    it('should add contact', () => {
      let grant = createGrantApplication('Test Grant', 'Funder', 'foundation', 10000, new Date(), 'Description');
      grant = addContact(grant, 'John Freeman', 'Project Lead', 'john@example.com', true, '555-1234');

      expect(grant.contacts).toHaveLength(1);
      expect(grant.contacts[0].isPrimary).toBe(true);
    });
  });

  describe('Reporting Schedule', () => {
    it('should setup reporting schedule', () => {
      let grant = createGrantApplication('Test Grant', 'Funder', 'federal', 10000, new Date(), 'Description');
      grant = setupReportingSchedule(grant, [
        { type: 'progress', dueDate: new Date('2025-06-01') },
        { type: 'financial', dueDate: new Date('2025-09-01') },
        { type: 'final', dueDate: new Date('2025-12-01') }
      ]);

      expect(grant.reportingSchedule).toHaveLength(3);
      expect(grant.reportingSchedule[0].type).toBe('progress');
      expect(grant.reportingSchedule[2].type).toBe('final');
    });
  });

  describe('Templates', () => {
    it('should get federal template', () => {
      const template = getTemplate('federal');
      expect(template.name).toBe('Federal Grant Application');
      expect(template.sections.length).toBeGreaterThan(5);
      expect(template.requiredDocuments).toContain('501c3 Letter');
    });

    it('should get foundation template', () => {
      const template = getTemplate('foundation');
      expect(template.name).toBe('Foundation Grant Application');
      expect(template.sections.length).toBe(4);
    });

    it('should prefill template with grant data', () => {
      const grant = createGrantApplication(
        'Test Grant',
        'Funder',
        'federal',
        10000,
        new Date(),
        'This is a detailed project description for the grant application.'
      );
      const template = getTemplate('federal');
      const prefilled = prefillTemplate(template, grant);

      const summarySection = prefilled.find(s => s.title === 'Project Summary/Abstract');
      expect(summarySection?.content).toBe(grant.projectDescription);
    });
  });

  describe('checkReadiness', () => {
    it('should identify missing items', () => {
      const grant = createGrantApplication('Test Grant', 'Funder', 'federal', 10000, new Date(), 'Short');
      const readiness = checkReadiness(grant);

      expect(readiness.ready).toBe(false);
      expect(readiness.missingItems).toContain('Budget items');
      expect(readiness.missingItems).toContain('Primary contact');
      expect(readiness.missingItems).toContain('Project description');
    });

    it('should show ready when all items complete', () => {
      let grant = createGrantApplication(
        'Test Grant',
        'Funder',
        'community',
        10000,
        new Date(),
        'This is a detailed project description that is long enough to pass validation.'
      );
      grant = addBudgetItem(grant, 'supplies', 'Materials', 5000, 'Needed');
      grant = addContact(grant, 'John', 'Lead', 'john@example.com', true);

      const readiness = checkReadiness(grant);
      expect(readiness.ready).toBe(true);
      expect(readiness.completionPercentage).toBe(100);
    });
  });

  describe('generateGrantSummary', () => {
    it('should generate formatted summary', () => {
      let grant = createGrantApplication(
        'Community Development Grant',
        'State Foundation',
        'state',
        50000,
        new Date('2025-06-01'),
        'A comprehensive project to improve community resources and services.'
      );
      grant = addBudgetItem(grant, 'personnel', 'Coordinator', 30000, 'Full-time');
      grant = addMilestone(grant, 'Phase 1', 'Initial setup', new Date('2025-03-01'), ['Report']);
      grant = addContact(grant, 'Jane Doe', 'Director', 'jane@example.com', true);

      const summary = generateGrantSummary(grant);

      expect(summary).toContain('GRANT APPLICATION SUMMARY');
      expect(summary).toContain('Community Development Grant');
      expect(summary).toContain('State Foundation');
      expect(summary).toContain('$50,000');
      expect(summary).toContain('personnel: $30,000');
      expect(summary).toContain('Phase 1');
    });
  });
});
