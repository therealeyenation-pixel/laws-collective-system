import { describe, it, expect } from 'vitest';
import {
  createBusinessPlan,
  addBusinessPlanSection,
  addMilestone,
  createOperationsTracker,
  addDepartment,
  addWorkflow,
  addWorkflowStep,
  trackMetric,
  reportIncident,
  createFamilyBusiness,
  addFamilyMember,
  addFamilyPosition,
  addFamilyTradition,
  createCommunityHub,
  addCommunityMember,
  createCommunityEvent,
  addCommunityResource,
  createAchievement,
  updateLeaderboard,
  createDocumentBundle,
  addBundleDocument,
  calculateBundleCompletion,
  createServiceIntegration,
  activateIntegration,
  recordIntegrationError
} from './services/business-operations';

describe('Business Plan Management', () => {
  it('should create a business plan', () => {
    const plan = createBusinessPlan('ENT-001', 'Growth Strategy 2026');
    expect(plan.id).toMatch(/^BPLAN-/);
    expect(plan.name).toBe('Growth Strategy 2026');
    expect(plan.status).toBe('draft');
  });

  it('should add sections to business plan', () => {
    const plan = createBusinessPlan('ENT-001', 'Test Plan');
    const section = addBusinessPlanSection(plan, 'executive_summary', 'Executive Summary', 'Our vision...');
    expect(section.type).toBe('executive_summary');
    expect(plan.sections).toHaveLength(1);
  });

  it('should add milestones', () => {
    const plan = createBusinessPlan('ENT-001', 'Test');
    const milestone = addMilestone(plan, 'Launch MVP', 'Release minimum viable product', Date.now() + 90 * 24 * 60 * 60 * 1000);
    expect(milestone.status).toBe('pending');
    expect(plan.milestones).toHaveLength(1);
  });
});

describe('Operations Tracking', () => {
  it('should create operations tracker', () => {
    const tracker = createOperationsTracker('ENT-001');
    expect(tracker.id).toMatch(/^OPS-/);
    expect(tracker.departments).toHaveLength(0);
  });

  it('should add departments', () => {
    const tracker = createOperationsTracker('ENT-001');
    const dept = addDepartment(tracker, 'Engineering', 'John Doe', 500000);
    expect(dept.name).toBe('Engineering');
    expect(tracker.departments).toHaveLength(1);
  });

  it('should add workflows with steps', () => {
    const tracker = createOperationsTracker('ENT-001');
    const dept = addDepartment(tracker, 'HR', 'Jane', 100000);
    const workflow = addWorkflow(tracker, 'Onboarding', dept.id, 'as_needed');
    const step = addWorkflowStep(workflow, 'Document Collection', 'Collect required docs', 'HR Team', 2);
    expect(workflow.steps).toHaveLength(1);
    expect(step.order).toBe(1);
  });

  it('should track metrics', () => {
    const tracker = createOperationsTracker('ENT-001');
    const metric = trackMetric(tracker, 'Revenue', 'Financial', 150000, 100000, 'USD');
    expect(metric.trend).toBe('up');
  });

  it('should report incidents', () => {
    const tracker = createOperationsTracker('ENT-001');
    const incident = reportIncident(tracker, 'Server Outage', 'Main server down', 'high');
    expect(incident.status).toBe('open');
    expect(incident.severity).toBe('high');
  });
});

describe('Family Business Management', () => {
  it('should create family business', () => {
    const business = createFamilyBusiness('Smith Family Enterprises', Date.now() - 50 * 365 * 24 * 60 * 60 * 1000);
    expect(business.id).toMatch(/^FAMBIZ-/);
    expect(business.generation).toBe(1);
  });

  it('should add family members', () => {
    const business = createFamilyBusiness('Test Family', Date.now());
    const member = addFamilyMember(business, 'John Smith', 'Founder', 1, 60);
    expect(member.ownership).toBe(60);
    expect(business.members).toHaveLength(1);
  });

  it('should add positions', () => {
    const business = createFamilyBusiness('Test', Date.now());
    const position = addFamilyPosition(business, 'CEO', 'Executive', ['Strategic planning', 'Leadership'], 250000);
    expect(position.title).toBe('CEO');
    expect(business.positions).toHaveLength(1);
  });

  it('should add traditions', () => {
    const business = createFamilyBusiness('Test', Date.now());
    const tradition = addFamilyTradition(business, 'Annual Retreat', 'Family business retreat', 'Yearly');
    expect(tradition.frequency).toBe('Yearly');
  });
});

describe('Community & Achievement System', () => {
  it('should create community hub', () => {
    const hub = createCommunityHub('L.A.W.S. Community');
    expect(hub.id).toMatch(/^COMM-/);
    expect(hub.members).toHaveLength(0);
  });

  it('should add community members', () => {
    const hub = createCommunityHub('Test');
    const member = addCommunityMember(hub, 'USER-001', 'John Doe', 'moderator');
    expect(member.role).toBe('moderator');
    expect(member.points).toBe(0);
  });

  it('should create events', () => {
    const hub = createCommunityHub('Test');
    const event = createCommunityEvent(hub, 'Workshop', 'Financial literacy', 'workshop', Date.now(), 'Online');
    expect(event.status).toBe('upcoming');
  });

  it('should add resources', () => {
    const hub = createCommunityHub('Test');
    const resource = addCommunityResource(hub, 'Budget Template', 'template', '/templates/budget.xlsx', 'Finance');
    expect(resource.downloads).toBe(0);
  });

  it('should create achievements', () => {
    const hub = createCommunityHub('Test');
    const achievement = createAchievement(hub, 'First Steps', 'Complete onboarding', 'Onboarding', 100, 'common');
    expect(achievement.rarity).toBe('common');
  });

  it('should update leaderboard', () => {
    const hub = createCommunityHub('Test');
    const m1 = addCommunityMember(hub, 'U1', 'Alice');
    const m2 = addCommunityMember(hub, 'U2', 'Bob');
    m1.points = 500;
    m2.points = 300;
    updateLeaderboard(hub);
    expect(hub.leaderboard[0].name).toBe('Alice');
    expect(hub.leaderboard[0].rank).toBe(1);
  });
});

describe('Document Bundle System', () => {
  it('should create document bundle', () => {
    const bundle = createDocumentBundle('LLC Formation', 'formation');
    expect(bundle.id).toMatch(/^BUNDLE-/);
    expect(bundle.status).toBe('draft');
  });

  it('should add documents to bundle', () => {
    const bundle = createDocumentBundle('Test', 'test');
    const doc = addBundleDocument(bundle, 'Articles of Organization', 'legal', true);
    expect(doc.required).toBe(true);
    expect(doc.status).toBe('pending');
  });

  it('should calculate bundle completion', () => {
    const bundle = createDocumentBundle('Test', 'test');
    addBundleDocument(bundle, 'Doc1', 'type', true);
    addBundleDocument(bundle, 'Doc2', 'type', true);
    bundle.documents[0].status = 'approved';
    const completion = calculateBundleCompletion(bundle);
    expect(completion).toBe(50);
  });
});

describe('Service Integration', () => {
  it('should create integration', () => {
    const integration = createServiceIntegration('Stripe', 'api', { apiKey: 'test' });
    expect(integration.id).toMatch(/^INT-/);
    expect(integration.status).toBe('inactive');
  });

  it('should activate integration', () => {
    const integration = createServiceIntegration('Test', 'webhook', {});
    activateIntegration(integration);
    expect(integration.status).toBe('active');
    expect(integration.lastSync).toBeDefined();
  });

  it('should track errors', () => {
    const integration = createServiceIntegration('Test', 'api', {});
    recordIntegrationError(integration);
    recordIntegrationError(integration);
    recordIntegrationError(integration);
    expect(integration.status).toBe('error');
    expect(integration.errorCount).toBe(3);
  });
});
