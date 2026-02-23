import { describe, it, expect } from 'vitest';
import {
  createMetricCard,
  calculateMetricChange,
  createEntityDashboard,
  createHouseDashboard,
  createFinancialDashboard,
  createComplianceDashboard,
  createHRDashboard,
  createProjectDashboard,
  createAnalyticsDashboard,
  createNotificationCenter,
  addNotification,
  markNotificationRead,
  defaultQuickActions,
  createSearchConfig,
  buildDashboard
} from './services/dashboard-completion';

import {
  createDocument,
  updateDocument,
  createSignatureRequest,
  signDocument,
  verifySignature,
  createBundle,
  addDocumentToBundle,
  addSignerToBundle,
  calculateBundleProgress,
  bundleTemplates,
  createBundleFromTemplate,
  generateDocumentPDF,
  generateBundlePDF
} from './services/document-completion';

// ============================================================================
// DASHBOARD COMPLETION TESTS
// ============================================================================

describe('Dashboard Completion Service', () => {
  describe('Metric Cards', () => {
    it('should create a metric card with default values', () => {
      const card = createMetricCard('Revenue', 50000, 'currency');
      
      expect(card.id).toMatch(/^METRIC-/);
      expect(card.title).toBe('Revenue');
      expect(card.value).toBe(50000);
      expect(card.format).toBe('currency');
      expect(card.icon).toBe('chart');
      expect(card.color).toBe('blue');
    });

    it('should create a metric card with custom options', () => {
      const card = createMetricCard('Users', 1500, 'number', {
        icon: 'users',
        color: 'green',
        previousValue: 1200
      });
      
      expect(card.icon).toBe('users');
      expect(card.color).toBe('green');
      expect(card.previousValue).toBe(1200);
    });

    it('should calculate metric change correctly', () => {
      const result = calculateMetricChange(150, 100);
      
      expect(result.change).toBe(50);
      expect(result.changeType).toBe('increase');
      expect(result.percentChange).toBe(50);
    });

    it('should handle decrease in metric change', () => {
      const result = calculateMetricChange(80, 100);
      
      expect(result.change).toBe(-20);
      expect(result.changeType).toBe('decrease');
      expect(result.percentChange).toBe(-20);
    });

    it('should handle neutral metric change', () => {
      const result = calculateMetricChange(100, 100);
      
      expect(result.change).toBe(0);
      expect(result.changeType).toBe('neutral');
      expect(result.percentChange).toBe(0);
    });
  });

  describe('Entity Dashboard', () => {
    it('should create an entity dashboard with default metrics', () => {
      const dashboard = createEntityDashboard('ENT-001', 'Test Entity', 'nonprofit');
      
      expect(dashboard.entityId).toBe('ENT-001');
      expect(dashboard.entityName).toBe('Test Entity');
      expect(dashboard.entityType).toBe('nonprofit');
      expect(dashboard.metrics).toHaveLength(4);
      expect(dashboard.recentActivity).toHaveLength(0);
      expect(dashboard.complianceStatus.overall).toBe('compliant');
    });

    it('should have correct metric types', () => {
      const dashboard = createEntityDashboard('ENT-001', 'Test', 'llc');
      
      expect(dashboard.metrics[0].title).toBe('Total Assets');
      expect(dashboard.metrics[1].title).toBe('Compliance Score');
      expect(dashboard.metrics[2].title).toBe('Active Projects');
      expect(dashboard.metrics[3].title).toBe('Team Members');
    });
  });

  describe('House Dashboard', () => {
    it('should create a house dashboard', () => {
      const dashboard = createHouseDashboard('HOUSE-001', 'Genesis House', 'primary', 1);
      
      expect(dashboard.houseId).toBe('HOUSE-001');
      expect(dashboard.houseName).toBe('Genesis House');
      expect(dashboard.generation).toBe(1);
      expect(dashboard.metrics).toHaveLength(4);
      expect(dashboard.governance.votingRights).toBe(true);
    });
  });

  describe('Financial Dashboard', () => {
    it('should create a financial dashboard', () => {
      const start = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const end = Date.now();
      const dashboard = createFinancialDashboard(start, end);
      
      expect(dashboard.period.start).toBe(start);
      expect(dashboard.period.end).toBe(end);
      expect(dashboard.revenue.total).toBe(0);
      expect(dashboard.cashFlow.runway).toBe(12);
    });
  });

  describe('Compliance Dashboard', () => {
    it('should create a compliance dashboard', () => {
      const dashboard = createComplianceDashboard();
      
      expect(dashboard.overallScore).toBe(100);
      expect(dashboard.status).toBe('compliant');
      expect(dashboard.riskAssessment.overallRisk).toBe('low');
    });
  });

  describe('HR Dashboard', () => {
    it('should create an HR dashboard with all metrics', () => {
      const dashboard = createHRDashboard();
      
      expect(dashboard.headcount.total).toBe(0);
      expect(dashboard.recruitment.openPositions).toBe(0);
      expect(dashboard.performance.averageRating).toBe(0);
      expect(dashboard.training.coursesAvailable).toBe(0);
      expect(dashboard.engagement.engagementScore).toBe(0);
    });
  });

  describe('Project Dashboard', () => {
    it('should create a project dashboard', () => {
      const dashboard = createProjectDashboard('PROJ-001', 'Test Project');
      
      expect(dashboard.projectId).toBe('PROJ-001');
      expect(dashboard.projectName).toBe('Test Project');
      expect(dashboard.status).toBe('planning');
      expect(dashboard.progress).toBe(0);
      expect(dashboard.timeline.onSchedule).toBe(true);
      expect(dashboard.budget.onBudget).toBe(true);
    });
  });

  describe('Analytics Dashboard', () => {
    it('should create an analytics dashboard', () => {
      const start = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const end = Date.now();
      const dashboard = createAnalyticsDashboard(start, end);
      
      expect(dashboard.period.start).toBe(start);
      expect(dashboard.kpis).toHaveLength(0);
      expect(dashboard.charts).toHaveLength(0);
      expect(dashboard.insights).toHaveLength(0);
    });
  });

  describe('Notification Center', () => {
    it('should create a notification center', () => {
      const center = createNotificationCenter();
      
      expect(center.unreadCount).toBe(0);
      expect(center.notifications).toHaveLength(0);
      expect(center.preferences.email).toBe(true);
    });

    it('should add notifications', () => {
      const center = createNotificationCenter();
      const notification = addNotification(center, 'info', 'Test', 'Test message', 'general');
      
      expect(notification.id).toMatch(/^NOTIF-/);
      expect(notification.type).toBe('info');
      expect(notification.read).toBe(false);
      expect(center.unreadCount).toBe(1);
      expect(center.notifications).toHaveLength(1);
    });

    it('should mark notifications as read', () => {
      const center = createNotificationCenter();
      const notification = addNotification(center, 'warning', 'Alert', 'Alert message', 'alerts');
      
      const result = markNotificationRead(center, notification.id);
      
      expect(result).toBe(true);
      expect(center.unreadCount).toBe(0);
      expect(notification.read).toBe(true);
    });

    it('should not decrement below zero', () => {
      const center = createNotificationCenter();
      const notification = addNotification(center, 'info', 'Test', 'Test', 'test');
      
      markNotificationRead(center, notification.id);
      markNotificationRead(center, notification.id);
      
      expect(center.unreadCount).toBe(0);
    });
  });

  describe('Quick Actions', () => {
    it('should have default quick actions', () => {
      expect(defaultQuickActions.length).toBeGreaterThan(0);
      expect(defaultQuickActions[0].id).toBe('qa-1');
      expect(defaultQuickActions[0].label).toBe('Create Entity');
    });
  });

  describe('Search Config', () => {
    it('should create a search config', () => {
      const config = createSearchConfig('Search documents...', ['name', 'content', 'tags']);
      
      expect(config.placeholder).toBe('Search documents...');
      expect(config.searchableFields).toContain('name');
      expect(config.filters).toHaveLength(0);
    });
  });

  describe('Dashboard Builder', () => {
    it('should build a dashboard with widgets', () => {
      const dashboard = buildDashboard('My Dashboard', 'Test dashboard', [
        { type: 'metric_card', title: 'Revenue' },
        { type: 'chart', title: 'Sales Trend' }
      ]);
      
      expect(dashboard.id).toMatch(/^DASH-/);
      expect(dashboard.name).toBe('My Dashboard');
      expect(dashboard.widgets).toHaveLength(2);
      expect(dashboard.layout).toBe('grid');
    });
  });
});

// ============================================================================
// DOCUMENT COMPLETION TESTS
// ============================================================================

describe('Document Completion Service', () => {
  describe('Document Management', () => {
    it('should create a document', () => {
      const doc = createDocument('Test Agreement', 'agreement', 'This is the content');
      
      expect(doc.id).toMatch(/^DOC-/);
      expect(doc.name).toBe('Test Agreement');
      expect(doc.type).toBe('agreement');
      expect(doc.status).toBe('draft');
      expect(doc.version).toBe(1);
      expect(doc.history).toHaveLength(1);
    });

    it('should create a document with metadata', () => {
      const doc = createDocument('Policy Doc', 'policy', 'Content', {
        entityId: 'ENT-001',
        tags: ['important', 'compliance'],
        confidentiality: 'confidential'
      });
      
      expect(doc.metadata.entityId).toBe('ENT-001');
      expect(doc.metadata.tags).toContain('important');
      expect(doc.metadata.confidentiality).toBe('confidential');
    });

    it('should update a document and increment version', () => {
      const doc = createDocument('Test', 'legal', 'Original content');
      const updated = updateDocument(doc, { content: 'Updated content' }, 'user-1', 'John Doe');
      
      expect(updated.version).toBe(2);
      expect(updated.content).toBe('Updated content');
      expect(updated.history).toHaveLength(2);
      expect(updated.history[1].action).toBe('updated');
    });
  });

  describe('Electronic Signatures', () => {
    it('should create a signature request', () => {
      const request = createSignatureRequest(
        'DOC-001',
        'user-1',
        'John Doe',
        [
          { name: 'Jane Smith', email: 'jane@example.com', role: 'Approver', order: 1 }
        ],
        'Please sign this document'
      );
      
      expect(request.id).toMatch(/^SIGREQ-/);
      expect(request.documentId).toBe('DOC-001');
      expect(request.signers).toHaveLength(1);
      expect(request.signers[0].status).toBe('pending');
    });

    it('should sign a document', () => {
      const doc = createDocument('Contract', 'contract', 'Contract terms');
      const signature = signDocument(
        doc,
        'user-1',
        'John Doe',
        'john@example.com',
        'Signatory',
        'base64signaturedata',
        'drawn',
        '192.168.1.1',
        'Mozilla/5.0'
      );
      
      expect(signature.id).toMatch(/^SIG-/);
      expect(signature.signerName).toBe('John Doe');
      expect(signature.verified).toBe(true);
      expect(signature.blockchainHash).toMatch(/^ESIG-/);
      expect(doc.signatures).toHaveLength(1);
      expect(doc.history.length).toBeGreaterThan(1);
    });

    it('should verify a signature', () => {
      const doc = createDocument('Test', 'legal', 'Content');
      const signature = signDocument(
        doc, 'user-1', 'Test User', 'test@example.com', 'Signer',
        'data', 'typed', '127.0.0.1', 'Test Agent'
      );
      
      const verification = verifySignature(signature);
      
      expect(verification.valid).toBe(true);
      expect(verification.details).toContain('email');
    });
  });

  describe('Document Bundles', () => {
    it('should create a bundle', () => {
      const bundle = createBundle('Formation Bundle', 'entity_formation', 'LLC formation docs', 'user-1');
      
      expect(bundle.id).toMatch(/^BUNDLE-/);
      expect(bundle.name).toBe('Formation Bundle');
      expect(bundle.type).toBe('entity_formation');
      expect(bundle.status).toBe('draft');
      expect(bundle.progress).toBe(0);
    });

    it('should add documents to a bundle', () => {
      const bundle = createBundle('Test Bundle', 'custom', 'Test', 'user-1');
      const bundleDoc = addDocumentToBundle(bundle, 'DOC-001', 'Articles', true);
      
      expect(bundleDoc.id).toMatch(/^BDOC-/);
      expect(bundleDoc.documentId).toBe('DOC-001');
      expect(bundleDoc.required).toBe(true);
      expect(bundle.documents).toHaveLength(1);
    });

    it('should add signers to a bundle', () => {
      const bundle = createBundle('Test Bundle', 'custom', 'Test', 'user-1');
      const signer = addSignerToBundle(bundle, 'John Doe', 'john@example.com', 'Signatory', ['DOC-001']);
      
      expect(signer.id).toMatch(/^BSIGNER-/);
      expect(signer.name).toBe('John Doe');
      expect(signer.status).toBe('pending');
      expect(bundle.signers).toHaveLength(1);
    });

    it('should calculate bundle progress', () => {
      const bundle = createBundle('Test', 'custom', 'Test', 'user-1');
      addDocumentToBundle(bundle, 'DOC-001', 'Doc 1', true);
      addDocumentToBundle(bundle, 'DOC-002', 'Doc 2', true);
      
      bundle.documents[0].status = 'fully_signed';
      
      const progress = calculateBundleProgress(bundle);
      expect(progress).toBe(50);
    });

    it('should return 0 progress for empty bundle', () => {
      const bundle = createBundle('Empty', 'custom', 'Empty bundle', 'user-1');
      expect(calculateBundleProgress(bundle)).toBe(0);
    });
  });

  describe('Bundle Templates', () => {
    it('should have predefined templates', () => {
      expect(bundleTemplates.length).toBeGreaterThan(0);
      expect(bundleTemplates.find(t => t.id === 'nonprofit-formation')).toBeDefined();
      expect(bundleTemplates.find(t => t.id === 'employee-onboarding')).toBeDefined();
    });

    it('should create bundle from template', () => {
      const bundle = createBundleFromTemplate('nonprofit-formation', 'user-1');
      
      expect(bundle).not.toBeNull();
      expect(bundle!.type).toBe('entity_formation');
      expect(bundle!.documents.length).toBeGreaterThan(0);
      expect(bundle!.metadata.templateId).toBe('nonprofit-formation');
    });

    it('should return null for invalid template', () => {
      const bundle = createBundleFromTemplate('invalid-template', 'user-1');
      expect(bundle).toBeNull();
    });

    it('should allow custom name for bundle from template', () => {
      const bundle = createBundleFromTemplate('llc-formation', 'user-1', 'My LLC Bundle');
      
      expect(bundle!.name).toBe('My LLC Bundle');
    });
  });

  describe('PDF Generation', () => {
    it('should generate document PDF', () => {
      const doc = createDocument('Test Agreement', 'agreement', 'Agreement content here');
      const pdf = generateDocumentPDF(doc);
      
      expect(pdf).toContain('TEST AGREEMENT');
      expect(pdf).toContain('Agreement content here');
      expect(pdf).toContain(doc.id);
    });

    it('should include signatures in PDF', () => {
      const doc = createDocument('Contract', 'contract', 'Contract terms');
      signDocument(doc, 'user-1', 'John Doe', 'john@example.com', 'Signatory', 'data', 'drawn', '127.0.0.1', 'Agent');
      
      const pdf = generateDocumentPDF(doc);
      
      expect(pdf).toContain('SIGNATURES');
      expect(pdf).toContain('John Doe');
      expect(pdf).toContain('Signatory');
    });

    it('should generate bundle PDF', () => {
      const bundle = createBundle('Test Bundle', 'entity_formation', 'Test description', 'user-1');
      addDocumentToBundle(bundle, 'DOC-001', 'Articles', true);
      addSignerToBundle(bundle, 'John Doe', 'john@example.com', 'Incorporator', ['DOC-001']);
      
      const pdf = generateBundlePDF(bundle);
      
      expect(pdf).toContain('DOCUMENT BUNDLE');
      expect(pdf).toContain('TEST BUNDLE');
      expect(pdf).toContain('Articles');
      expect(pdf).toContain('John Doe');
    });
  });
});
