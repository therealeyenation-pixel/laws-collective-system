import { describe, it, expect } from 'vitest';
import {
  getGrantTemplates,
  getTemplatesForEntity,
  getGrantTemplate,
  getEntityInfo,
  generateCoverLetter,
  generateBudgetTable,
  generateBudgetNarrative,
  generateOrganizationalBackground,
  generateGrantApplication,
  exportToMarkdown,
  exportToJSON,
  getApplicationChecklist,
  type GrantApplicationData,
  type BudgetItem
} from './services/grant-export';

describe('Grant Export Service', () => {
  describe('getGrantTemplates', () => {
    it('should return all grant templates', () => {
      const templates = getGrantTemplates();
      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBeGreaterThanOrEqual(7);
      expect(templates.map(t => t.id)).toContain('federal_nea');
      expect(templates.map(t => t.id)).toContain('foundation_ford');
      expect(templates.map(t => t.id)).toContain('generic');
    });

    it('should include required fields in each template', () => {
      const templates = getGrantTemplates();
      templates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('organization');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('sections');
        expect(template).toHaveProperty('maxFunding');
        expect(template).toHaveProperty('eligibleEntities');
        expect(template).toHaveProperty('requiredDocuments');
      });
    });
  });

  describe('getTemplatesForEntity', () => {
    it('should return templates for Real-Eye-Nation', () => {
      const templates = getTemplatesForEntity('real_eye_nation');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(t => {
        expect(t.eligibleEntities).toContain('real_eye_nation');
      });
    });

    it('should return templates for The The L.A.W.S. Collective', () => {
      const templates = getTemplatesForEntity('laws_collective');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(t => {
        expect(t.eligibleEntities).toContain('laws_collective');
      });
    });

    it('should return templates for 508 Academy', () => {
      const templates = getTemplatesForEntity('508_academy');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(t => {
        expect(t.eligibleEntities).toContain('508_academy');
      });
    });

    it('should return templates for LuvOnPurpose AWS', () => {
      const templates = getTemplatesForEntity('luvonpurpose_aws');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(t => {
        expect(t.eligibleEntities).toContain('luvonpurpose_aws');
      });
    });
  });

  describe('getGrantTemplate', () => {
    it('should return specific template by ID', () => {
      const template = getGrantTemplate('federal_nea');
      expect(template).not.toBeNull();
      expect(template?.id).toBe('federal_nea');
      expect(template?.name).toBe('NEA Art Works Grant');
    });

    it('should return null for invalid template ID', () => {
      const template = getGrantTemplate('invalid_template' as any);
      expect(template).toBeNull();
    });

    it('should return Ford Foundation template', () => {
      const template = getGrantTemplate('foundation_ford');
      expect(template).not.toBeNull();
      expect(template?.maxFunding).toBe(5000000);
    });
  });

  describe('getEntityInfo', () => {
    it('should return info for Real-Eye-Nation', () => {
      const info = getEntityInfo('real_eye_nation');
      expect(info).not.toBeNull();
      expect(info?.legalName).toBe('Real-Eye-Nation LLC');
      expect(info?.taxStatus).toBe('LLC (Single-Member)');
    });

    it('should return info for The The L.A.W.S. Collective', () => {
      const info = getEntityInfo('laws_collective');
      expect(info).not.toBeNull();
      expect(info?.legalName).toBe('The The The L.A.W.S. Collective, LLC');
    });

    it('should return info for 508 Academy', () => {
      const info = getEntityInfo('508_academy');
      expect(info).not.toBeNull();
      expect(info?.taxStatus).toBe('508(c)(1)(a) Religious/Educational Organization');
    });

    it('should return info for LuvOnPurpose AWS', () => {
      const info = getEntityInfo('luvonpurpose_aws');
      expect(info).not.toBeNull();
      expect(info?.legalName).toBe('LuvOnPurpose Autonomous Wealth System, LLC');
    });
  });

  describe('generateCoverLetter', () => {
    const sampleData: GrantApplicationData = {
      entityType: 'laws_collective',
      templateType: 'foundation_ford',
      applicantName: 'John Smith',
      applicantTitle: 'Executive Director',
      organizationName: 'The The The L.A.W.S. Collective, LLC',
      organizationAddress: '456 Community Blvd, Birmingham, AL 35203',
      organizationPhone: '(205) 555-0202',
      organizationEmail: 'grants@lawscollective.org',
      einNumber: '88-2345678',
      requestedAmount: 1000000,
      projectTitle: 'Community Entrepreneurship Initiative',
      projectStartDate: '2026-01-01',
      projectEndDate: '2026-12-31',
      budgetItems: []
    };

    it('should generate a cover letter with all required elements', () => {
      const letter = generateCoverLetter(sampleData);
      expect(letter).toContain('Ford Foundation');
      expect(letter).toContain('John Smith');
      expect(letter).toContain('Executive Director');
      expect(letter).toContain('$1,000,000');
      expect(letter).toContain('Community Entrepreneurship Initiative');
    });

    it('should include organization mission', () => {
      const letter = generateCoverLetter(sampleData);
      expect(letter).toContain('multi-generational wealth');
    });
  });

  describe('generateBudgetTable', () => {
    const budgetItems: BudgetItem[] = [
      { category: 'Personnel', description: 'Staff Salaries', amount: 100000, justification: 'Core team' },
      { category: 'Equipment', description: 'Computers', amount: 20000, justification: 'Office equipment' },
      { category: 'Admin', description: 'Overhead', amount: 10000, justification: 'Administrative costs' }
    ];

    it('should generate markdown table with correct format', () => {
      const table = generateBudgetTable(budgetItems);
      expect(table).toContain('| Category |');
      expect(table).toContain('| Personnel |');
      expect(table).toContain('| Equipment |');
      expect(table).toContain('| **TOTAL** |');
    });

    it('should calculate correct percentages', () => {
      const table = generateBudgetTable(budgetItems);
      expect(table).toContain('76.9%'); // 100000/130000
      expect(table).toContain('15.4%'); // 20000/130000
      expect(table).toContain('7.7%');  // 10000/130000
    });

    it('should show correct total', () => {
      const table = generateBudgetTable(budgetItems);
      expect(table).toContain('$130,000');
    });
  });

  describe('generateBudgetNarrative', () => {
    const budgetItems: BudgetItem[] = [
      { category: 'Personnel', description: 'Program Manager', amount: 75000, justification: 'Full-time program oversight' },
      { category: 'Technology', description: 'Software Development', amount: 50000, justification: 'Platform development' }
    ];

    it('should generate narrative with summary', () => {
      const narrative = generateBudgetNarrative(budgetItems);
      expect(narrative).toContain('BUDGET NARRATIVE');
      expect(narrative).toContain('Total Project Budget: $125,000');
    });

    it('should include category breakdown', () => {
      const narrative = generateBudgetNarrative(budgetItems);
      expect(narrative).toContain('Personnel: $75,000');
      expect(narrative).toContain('Technology: $50,000');
    });

    it('should include detailed line items', () => {
      const narrative = generateBudgetNarrative(budgetItems);
      expect(narrative).toContain('Program Manager');
      expect(narrative).toContain('Full-time program oversight');
    });
  });

  describe('generateOrganizationalBackground', () => {
    it('should generate background for Real-Eye-Nation', () => {
      const background = generateOrganizationalBackground('real_eye_nation');
      expect(background).toContain('Real-Eye-Nation LLC');
      expect(background).toContain('LLC (Single-Member)');
      expect(background).toContain('MISSION STATEMENT');
    });

    it('should generate background for 508 Academy', () => {
      const background = generateOrganizationalBackground('508_academy');
      expect(background).toContain('508-LuvOnPurpose Academy');
      expect(background).toContain('508(c)(1)(a)');
    });
  });

  describe('generateGrantApplication', () => {
    const applicationData: GrantApplicationData = {
      entityType: 'luvonpurpose_aws',
      templateType: 'foundation_macarthur',
      applicantName: 'Jane Doe',
      applicantTitle: 'CEO',
      organizationName: 'LuvOnPurpose Autonomous Wealth System, LLC',
      organizationAddress: '789 Innovation Drive, Memphis, TN 38103',
      organizationPhone: '(901) 555-0303',
      organizationEmail: 'grants@luvonpurpose.com',
      einNumber: '88-3456789',
      requestedAmount: 2000000,
      projectTitle: 'Financial Literacy Platform Expansion',
      projectStartDate: '2026-03-01',
      projectEndDate: '2028-02-28',
      projectSummary: 'Expanding our autonomous wealth-building platform to serve 10,000 additional families',
      budgetItems: []
    };

    it('should generate complete application with all sections', () => {
      const application = generateGrantApplication(applicationData);
      expect(application.sections.length).toBeGreaterThanOrEqual(7);
      expect(application.sections.map(s => s.title)).toContain('Cover Letter');
      expect(application.sections.map(s => s.title)).toContain('Executive Summary');
      expect(application.sections.map(s => s.title)).toContain('Statement of Need');
      expect(application.sections.map(s => s.title)).toContain('Budget');
    });

    it('should include metadata', () => {
      const application = generateGrantApplication(applicationData);
      expect(application.metadata.organizationName).toBe('LuvOnPurpose Autonomous Wealth System, LLC');
      expect(application.metadata.projectTitle).toBe('Financial Literacy Platform Expansion');
      expect(application.metadata.requestedAmount).toBe(2000000);
    });

    it('should generate unique ID', () => {
      const app1 = generateGrantApplication(applicationData);
      const app2 = generateGrantApplication(applicationData);
      expect(app1.id).not.toBe(app2.id);
    });

    it('should include timestamp', () => {
      const application = generateGrantApplication(applicationData);
      expect(application.generatedAt).toBeLessThanOrEqual(Date.now());
      expect(application.generatedAt).toBeGreaterThan(Date.now() - 10000);
    });
  });

  describe('exportToMarkdown', () => {
    const applicationData: GrantApplicationData = {
      entityType: '508_academy',
      templateType: 'foundation_kellogg',
      applicantName: 'Test User',
      applicantTitle: 'Director',
      organizationName: '508-LuvOnPurpose Academy',
      organizationAddress: '321 Education Lane, Atlanta, GA 30302',
      organizationPhone: '(404) 555-0404',
      organizationEmail: 'grants@luvonpurposeacademy.org',
      einNumber: '88-4567890',
      requestedAmount: 1500000,
      projectTitle: 'K-12 STEM Education Initiative',
      projectStartDate: '2026-06-01',
      projectEndDate: '2027-05-31',
      budgetItems: []
    };

    it('should export to valid markdown format', () => {
      const application = generateGrantApplication(applicationData);
      const markdown = exportToMarkdown(application);
      expect(markdown).toContain('# Grant Application:');
      expect(markdown).toContain('**Organization:**');
      expect(markdown).toContain('## Cover Letter');
      expect(markdown).toContain('---');
    });

    it('should include all sections', () => {
      const application = generateGrantApplication(applicationData);
      const markdown = exportToMarkdown(application);
      expect(markdown).toContain('## Executive Summary');
      expect(markdown).toContain('## Statement of Need');
      expect(markdown).toContain('## Budget');
    });
  });

  describe('exportToJSON', () => {
    const applicationData: GrantApplicationData = {
      entityType: 'real_eye_nation',
      templateType: 'federal_nea',
      applicantName: 'Media Director',
      applicantTitle: 'Executive Producer',
      organizationName: 'Real-Eye-Nation LLC',
      organizationAddress: '123 Media Way, Atlanta, GA 30301',
      organizationPhone: '(404) 555-0101',
      organizationEmail: 'grants@realeyenation.com',
      einNumber: '88-1234567',
      requestedAmount: 75000,
      projectTitle: 'Documentary Series Production',
      projectStartDate: '2026-04-01',
      projectEndDate: '2027-03-31',
      budgetItems: []
    };

    it('should export to valid JSON', () => {
      const application = generateGrantApplication(applicationData);
      const json = exportToJSON(application);
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('id');
      expect(parsed).toHaveProperty('sections');
      expect(parsed).toHaveProperty('metadata');
    });

    it('should preserve all data in JSON', () => {
      const application = generateGrantApplication(applicationData);
      const json = exportToJSON(application);
      const parsed = JSON.parse(json);
      expect(parsed.entityType).toBe('real_eye_nation');
      expect(parsed.templateType).toBe('federal_nea');
    });
  });

  describe('getApplicationChecklist', () => {
    it('should return checklist for NEA template', () => {
      const checklist = getApplicationChecklist('federal_nea');
      expect(checklist.length).toBeGreaterThan(0);
      expect(checklist.some(item => item.item === 'Cover Letter')).toBe(true);
      expect(checklist.some(item => item.item === 'Budget')).toBe(true);
    });

    it('should include required documents from template', () => {
      const checklist = getApplicationChecklist('federal_nea');
      expect(checklist.some(item => item.item === 'IRS Determination Letter')).toBe(true);
      expect(checklist.some(item => item.item === 'Work Samples')).toBe(true);
    });

    it('should mark items as required', () => {
      const checklist = getApplicationChecklist('foundation_ford');
      const requiredItems = checklist.filter(item => item.required);
      expect(requiredItems.length).toBeGreaterThan(0);
    });

    it('should include descriptions', () => {
      const checklist = getApplicationChecklist('generic');
      checklist.forEach(item => {
        expect(item.description).toBeTruthy();
      });
    });
  });

  describe('Budget Generation by Entity Type', () => {
    it('should generate appropriate budget for media entity', () => {
      const application = generateGrantApplication({
        entityType: 'real_eye_nation',
        templateType: 'federal_nea',
        applicantName: 'Test',
        applicantTitle: 'Director',
        organizationName: 'Real-Eye-Nation LLC',
        organizationAddress: '123 Test St',
        organizationPhone: '555-1234',
        organizationEmail: 'test@test.com',
        einNumber: '12-3456789',
        requestedAmount: 100000,
        projectTitle: 'Test Project',
        projectStartDate: '2026-01-01',
        projectEndDate: '2026-12-31',
        budgetItems: []
      });
      
      const budgetSection = application.sections.find(s => s.title === 'Budget');
      expect(budgetSection?.content).toContain('Production');
    });

    it('should generate appropriate budget for education entity', () => {
      const application = generateGrantApplication({
        entityType: '508_academy',
        templateType: 'foundation_kellogg',
        applicantName: 'Test',
        applicantTitle: 'Director',
        organizationName: '508-LuvOnPurpose Academy',
        organizationAddress: '123 Test St',
        organizationPhone: '555-1234',
        organizationEmail: 'test@test.com',
        einNumber: '12-3456789',
        requestedAmount: 500000,
        projectTitle: 'Education Initiative',
        projectStartDate: '2026-01-01',
        projectEndDate: '2026-12-31',
        budgetItems: []
      });
      
      const budgetSection = application.sections.find(s => s.title === 'Budget');
      expect(budgetSection?.content).toContain('Educational');
    });
  });
});
