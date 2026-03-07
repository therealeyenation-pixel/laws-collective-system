/**
 * Grant Application History Service
 * Phase 54: Track submitted applications, status, and funder responses
 * 
 * Provides comprehensive tracking of grant applications from submission
 * through final decision, including timeline events and analytics.
 */

export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'additional_info_requested'
  | 'approved'
  | 'rejected'
  | 'withdrawn';

export type FunderType = 'federal' | 'foundation' | 'state' | 'corporate' | 'other';

export interface GrantApplication {
  id: string;
  entityId: string;
  entityName: string;
  grantName: string;
  funderName: string;
  funderType: FunderType;
  requestedAmount: number;
  awardedAmount?: number;
  status: ApplicationStatus;
  submissionDate?: string;
  deadlineDate: string;
  decisionDate?: string;
  projectTitle: string;
  projectDescription: string;
  contactPerson: string;
  contactEmail: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  applicationId: string;
  eventType: 'status_change' | 'note_added' | 'document_uploaded' | 'communication' | 'reminder';
  previousStatus?: ApplicationStatus;
  newStatus?: ApplicationStatus;
  description: string;
  createdBy: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface FunderResponse {
  id: string;
  applicationId: string;
  responseDate: string;
  responseType: 'acknowledgment' | 'request_info' | 'site_visit' | 'decision' | 'feedback';
  summary: string;
  details: string;
  actionRequired: boolean;
  actionDeadline?: string;
  createdAt: string;
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  documentType: 'application' | 'budget' | 'narrative' | 'support_letter' | 'financial_statement' | 'other';
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ApplicationAnalytics {
  totalApplications: number;
  byStatus: Record<ApplicationStatus, number>;
  byFunderType: Record<FunderType, number>;
  byEntity: Record<string, number>;
  successRate: number;
  totalRequested: number;
  totalAwarded: number;
  averageResponseDays: number;
  pendingApplications: number;
  recentActivity: TimelineEvent[];
}

// In-memory storage
const applications: Map<string, GrantApplication> = new Map();
const timelineEvents: Map<string, TimelineEvent[]> = new Map();
const funderResponses: Map<string, FunderResponse[]> = new Map();
const documents: Map<string, ApplicationDocument[]> = new Map();

let applicationIdCounter = 1;
let eventIdCounter = 1;
let responseIdCounter = 1;
let documentIdCounter = 1;

// Entity metadata
const ENTITY_NAMES: Record<string, string> = {
  'realeyenation': 'Real-Eye-Nation LLC',
  'laws': 'The The The L.A.W.S. Collective, LLC',
  'luvonpurpose': 'LuvOnPurpose Autonomous Wealth System LLC',
  '508academy': 'LuvOnPurpose Outreach Temple and Academy Society, Inc.',
};

// Initialize with sample data
function initializeSampleData() {
  if (applications.size > 0) return;

  const sampleApplications: Omit<GrantApplication, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      entityId: 'realeyenation',
      entityName: ENTITY_NAMES['realeyenation'],
      grantName: 'NEA Art Works Grant',
      funderName: 'National Endowment for the Arts',
      funderType: 'federal',
      requestedAmount: 100000,
      awardedAmount: 75000,
      status: 'approved',
      submissionDate: '2025-09-15',
      deadlineDate: '2025-09-30',
      decisionDate: '2025-12-15',
      projectTitle: 'Building the House Documentary Series',
      projectDescription: 'A 12-episode documentary series following families building generational wealth',
      contactPerson: 'Media Director',
      contactEmail: 'media@realeyenation.com',
      notes: 'Awarded at 75% of requested amount. Strong proposal feedback.',
    },
    {
      entityId: 'laws',
      entityName: ENTITY_NAMES['laws'],
      grantName: 'Ford Foundation BUILD Grant',
      funderName: 'Ford Foundation',
      funderType: 'foundation',
      requestedAmount: 500000,
      status: 'under_review',
      submissionDate: '2025-11-01',
      deadlineDate: '2025-11-15',
      projectTitle: 'Workforce-to-Ownership Initiative',
      projectDescription: 'Comprehensive program transitioning workers to business ownership',
      contactPerson: 'Program Director',
      contactEmail: 'programs@lawscollective.org',
      notes: 'Site visit scheduled for February 2026.',
    },
    {
      entityId: 'luvonpurpose',
      entityName: ENTITY_NAMES['luvonpurpose'],
      grantName: 'USDA Rural Business Development Grant',
      funderName: 'USDA Rural Development',
      funderType: 'federal',
      requestedAmount: 250000,
      status: 'submitted',
      submissionDate: '2026-01-10',
      deadlineDate: '2026-01-31',
      projectTitle: 'Autonomous Wealth Platform Expansion',
      projectDescription: 'Expanding financial automation platform to rural communities',
      contactPerson: 'Technology Director',
      contactEmail: 'tech@luvonpurpose.com',
      notes: 'Awaiting acknowledgment of receipt.',
    },
    {
      entityId: '508academy',
      entityName: ENTITY_NAMES['508academy'],
      grantName: 'Kellogg Foundation Education Grant',
      funderName: 'W.K. Kellogg Foundation',
      funderType: 'foundation',
      requestedAmount: 350000,
      status: 'additional_info_requested',
      submissionDate: '2025-10-20',
      deadlineDate: '2025-11-01',
      projectTitle: 'Faith-Based Financial Literacy Curriculum',
      projectDescription: 'K-12 curriculum integrating financial education with faith principles',
      contactPerson: 'Academy Director',
      contactEmail: 'academy@luvonpurpose.org',
      notes: 'Requested additional budget justification for staffing costs.',
    },
    {
      entityId: 'realeyenation',
      entityName: ENTITY_NAMES['realeyenation'],
      grantName: 'MacArthur Foundation Media Grant',
      funderName: 'MacArthur Foundation',
      funderType: 'foundation',
      requestedAmount: 200000,
      status: 'rejected',
      submissionDate: '2025-06-01',
      deadlineDate: '2025-06-15',
      decisionDate: '2025-09-01',
      projectTitle: 'Community Voices Podcast Network',
      projectDescription: 'Podcast network amplifying underrepresented community voices',
      contactPerson: 'Media Director',
      contactEmail: 'media@realeyenation.com',
      notes: 'Feedback: Strong concept but outside current funding priorities.',
    },
    {
      entityId: 'laws',
      entityName: ENTITY_NAMES['laws'],
      grantName: 'SBA Community Advantage Loan',
      funderName: 'Small Business Administration',
      funderType: 'federal',
      requestedAmount: 150000,
      awardedAmount: 150000,
      status: 'approved',
      submissionDate: '2025-07-15',
      deadlineDate: '2025-08-01',
      decisionDate: '2025-10-01',
      projectTitle: 'Collective Hub Equipment & Technology',
      projectDescription: 'Equipment and technology for regional collective hubs',
      contactPerson: 'Operations Director',
      contactEmail: 'ops@lawscollective.org',
      notes: 'Full amount approved. Disbursement in progress.',
    },
    {
      entityId: 'luvonpurpose',
      entityName: ENTITY_NAMES['luvonpurpose'],
      grantName: 'Gates Foundation Technology Grant',
      funderName: 'Bill & Melinda Gates Foundation',
      funderType: 'foundation',
      requestedAmount: 1000000,
      status: 'draft',
      deadlineDate: '2026-03-15',
      projectTitle: 'Wealth Automation for Underserved Communities',
      projectDescription: 'Scaling wealth automation technology to 50,000 families',
      contactPerson: 'Executive Director',
      contactEmail: 'exec@luvonpurpose.com',
      notes: 'Draft in progress. Need to finalize budget and impact metrics.',
    },
  ];

  sampleApplications.forEach(app => {
    const id = `app_${applicationIdCounter++}`;
    const now = new Date().toISOString();
    applications.set(id, {
      ...app,
      id,
      createdAt: now,
      updatedAt: now,
    });

    // Add initial timeline event
    const events: TimelineEvent[] = [{
      id: `evt_${eventIdCounter++}`,
      applicationId: id,
      eventType: 'status_change',
      newStatus: app.status,
      description: `Application created with status: ${app.status}`,
      createdBy: 'system',
      createdAt: now,
    }];

    if (app.submissionDate) {
      events.push({
        id: `evt_${eventIdCounter++}`,
        applicationId: id,
        eventType: 'status_change',
        previousStatus: 'draft',
        newStatus: 'submitted',
        description: 'Application submitted to funder',
        createdBy: 'system',
        createdAt: app.submissionDate,
      });
    }

    timelineEvents.set(id, events);
  });
}

// Initialize on module load
initializeSampleData();

/**
 * Get all applications with optional filtering
 */
export function getApplications(filters?: {
  entityId?: string;
  status?: ApplicationStatus;
  funderType?: FunderType;
  startDate?: string;
  endDate?: string;
}): GrantApplication[] {
  let results = Array.from(applications.values());

  if (filters?.entityId) {
    results = results.filter(app => app.entityId === filters.entityId);
  }

  if (filters?.status) {
    results = results.filter(app => app.status === filters.status);
  }

  if (filters?.funderType) {
    results = results.filter(app => app.funderType === filters.funderType);
  }

  if (filters?.startDate) {
    results = results.filter(app => 
      app.submissionDate && app.submissionDate >= filters.startDate!
    );
  }

  if (filters?.endDate) {
    results = results.filter(app => 
      app.submissionDate && app.submissionDate <= filters.endDate!
    );
  }

  return results.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * Get a single application by ID
 */
export function getApplication(id: string): GrantApplication | null {
  return applications.get(id) || null;
}

/**
 * Create a new application
 */
export function createApplication(
  data: Omit<GrantApplication, 'id' | 'createdAt' | 'updatedAt'>
): GrantApplication {
  const id = `app_${applicationIdCounter++}`;
  const now = new Date().toISOString();

  const application: GrantApplication = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  applications.set(id, application);

  // Add creation event
  const event: TimelineEvent = {
    id: `evt_${eventIdCounter++}`,
    applicationId: id,
    eventType: 'status_change',
    newStatus: data.status,
    description: `Application created: ${data.grantName}`,
    createdBy: 'user',
    createdAt: now,
  };

  timelineEvents.set(id, [event]);

  return application;
}

/**
 * Update an existing application
 */
export function updateApplication(
  id: string,
  updates: Partial<Omit<GrantApplication, 'id' | 'createdAt'>>
): GrantApplication | null {
  const application = applications.get(id);
  if (!application) return null;

  const previousStatus = application.status;
  const updatedApplication: GrantApplication = {
    ...application,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  applications.set(id, updatedApplication);

  // Add status change event if status changed
  if (updates.status && updates.status !== previousStatus) {
    addTimelineEvent(id, {
      eventType: 'status_change',
      previousStatus,
      newStatus: updates.status,
      description: `Status changed from ${previousStatus} to ${updates.status}`,
      createdBy: 'user',
    });
  }

  return updatedApplication;
}

/**
 * Delete an application
 */
export function deleteApplication(id: string): boolean {
  const application = applications.get(id);
  if (!application) return false;

  // Only allow deletion of draft applications
  if (application.status !== 'draft') {
    return false;
  }

  applications.delete(id);
  timelineEvents.delete(id);
  funderResponses.delete(id);
  documents.delete(id);

  return true;
}

/**
 * Update application status
 */
export function updateStatus(
  id: string,
  newStatus: ApplicationStatus,
  notes?: string
): GrantApplication | null {
  const application = applications.get(id);
  if (!application) return null;

  const previousStatus = application.status;

  // Update status-specific fields
  const updates: Partial<GrantApplication> = {
    status: newStatus,
    notes: notes ? `${application.notes}\n\n${new Date().toLocaleDateString()}: ${notes}` : application.notes,
  };

  if (newStatus === 'submitted' && !application.submissionDate) {
    updates.submissionDate = new Date().toISOString().split('T')[0];
  }

  if (newStatus === 'approved' || newStatus === 'rejected') {
    updates.decisionDate = new Date().toISOString().split('T')[0];
  }

  return updateApplication(id, updates);
}

/**
 * Get timeline events for an application
 */
export function getTimeline(applicationId: string): TimelineEvent[] {
  return (timelineEvents.get(applicationId) || [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Add a timeline event
 */
export function addTimelineEvent(
  applicationId: string,
  data: Omit<TimelineEvent, 'id' | 'applicationId' | 'createdAt'>
): TimelineEvent | null {
  if (!applications.has(applicationId)) return null;

  const event: TimelineEvent = {
    ...data,
    id: `evt_${eventIdCounter++}`,
    applicationId,
    createdAt: new Date().toISOString(),
  };

  const events = timelineEvents.get(applicationId) || [];
  events.push(event);
  timelineEvents.set(applicationId, events);

  return event;
}

/**
 * Get funder responses for an application
 */
export function getFunderResponses(applicationId: string): FunderResponse[] {
  return (funderResponses.get(applicationId) || [])
    .sort((a, b) => new Date(b.responseDate).getTime() - new Date(a.responseDate).getTime());
}

/**
 * Add a funder response
 */
export function addFunderResponse(
  applicationId: string,
  data: Omit<FunderResponse, 'id' | 'applicationId' | 'createdAt'>
): FunderResponse | null {
  if (!applications.has(applicationId)) return null;

  const response: FunderResponse = {
    ...data,
    id: `resp_${responseIdCounter++}`,
    applicationId,
    createdAt: new Date().toISOString(),
  };

  const responses = funderResponses.get(applicationId) || [];
  responses.push(response);
  funderResponses.set(applicationId, responses);

  // Add timeline event
  addTimelineEvent(applicationId, {
    eventType: 'communication',
    description: `Funder response received: ${data.responseType}`,
    createdBy: 'system',
    metadata: { responseId: response.id },
  });

  return response;
}

/**
 * Get documents for an application
 */
export function getDocuments(applicationId: string): ApplicationDocument[] {
  return (documents.get(applicationId) || [])
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

/**
 * Add a document
 */
export function addDocument(
  applicationId: string,
  data: Omit<ApplicationDocument, 'id' | 'applicationId' | 'uploadedAt'>
): ApplicationDocument | null {
  if (!applications.has(applicationId)) return null;

  const document: ApplicationDocument = {
    ...data,
    id: `doc_${documentIdCounter++}`,
    applicationId,
    uploadedAt: new Date().toISOString(),
  };

  const docs = documents.get(applicationId) || [];
  docs.push(document);
  documents.set(applicationId, docs);

  // Add timeline event
  addTimelineEvent(applicationId, {
    eventType: 'document_uploaded',
    description: `Document uploaded: ${data.fileName}`,
    createdBy: data.uploadedBy,
    metadata: { documentId: document.id, documentType: data.documentType },
  });

  return document;
}

/**
 * Get application analytics
 */
export function getAnalytics(): ApplicationAnalytics {
  const allApps = Array.from(applications.values());

  // Count by status
  const byStatus: Record<ApplicationStatus, number> = {
    draft: 0,
    submitted: 0,
    under_review: 0,
    additional_info_requested: 0,
    approved: 0,
    rejected: 0,
    withdrawn: 0,
  };

  // Count by funder type
  const byFunderType: Record<FunderType, number> = {
    federal: 0,
    foundation: 0,
    state: 0,
    corporate: 0,
    other: 0,
  };

  // Count by entity
  const byEntity: Record<string, number> = {};

  let totalRequested = 0;
  let totalAwarded = 0;
  let decidedCount = 0;
  let approvedCount = 0;
  let totalResponseDays = 0;
  let responseCount = 0;

  allApps.forEach(app => {
    byStatus[app.status]++;
    byFunderType[app.funderType]++;
    byEntity[app.entityId] = (byEntity[app.entityId] || 0) + 1;
    totalRequested += app.requestedAmount;

    if (app.awardedAmount) {
      totalAwarded += app.awardedAmount;
    }

    if (app.status === 'approved' || app.status === 'rejected') {
      decidedCount++;
      if (app.status === 'approved') {
        approvedCount++;
      }

      if (app.submissionDate && app.decisionDate) {
        const submitDate = new Date(app.submissionDate);
        const decisionDate = new Date(app.decisionDate);
        const days = Math.round((decisionDate.getTime() - submitDate.getTime()) / (1000 * 60 * 60 * 24));
        totalResponseDays += days;
        responseCount++;
      }
    }
  });

  // Get recent activity
  const allEvents: TimelineEvent[] = [];
  timelineEvents.forEach(events => {
    allEvents.push(...events);
  });
  const recentActivity = allEvents
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return {
    totalApplications: allApps.length,
    byStatus,
    byFunderType,
    byEntity,
    successRate: decidedCount > 0 ? Math.round((approvedCount / decidedCount) * 100) : 0,
    totalRequested,
    totalAwarded,
    averageResponseDays: responseCount > 0 ? Math.round(totalResponseDays / responseCount) : 0,
    pendingApplications: byStatus.submitted + byStatus.under_review + byStatus.additional_info_requested,
    recentActivity,
  };
}

/**
 * Get applications by entity
 */
export function getApplicationsByEntity(entityId: string): GrantApplication[] {
  return getApplications({ entityId });
}

/**
 * Get pending applications (submitted, under_review, additional_info_requested)
 */
export function getPendingApplications(): GrantApplication[] {
  return Array.from(applications.values())
    .filter(app => 
      app.status === 'submitted' || 
      app.status === 'under_review' || 
      app.status === 'additional_info_requested'
    )
    .sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime());
}

/**
 * Get applications with upcoming deadlines
 */
export function getUpcomingDeadlines(daysAhead: number = 30): GrantApplication[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  return Array.from(applications.values())
    .filter(app => {
      if (app.status !== 'draft') return false;
      const deadline = new Date(app.deadlineDate);
      return deadline >= now && deadline <= futureDate;
    })
    .sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime());
}

/**
 * Get dashboard summary
 */
export function getDashboardSummary(): {
  analytics: ApplicationAnalytics;
  pendingApplications: GrantApplication[];
  upcomingDeadlines: GrantApplication[];
  recentDecisions: GrantApplication[];
  actionRequired: GrantApplication[];
} {
  const analytics = getAnalytics();
  const pendingApplications = getPendingApplications();
  const upcomingDeadlines = getUpcomingDeadlines(30);

  // Get recent decisions (approved or rejected in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentDecisions = Array.from(applications.values())
    .filter(app => 
      (app.status === 'approved' || app.status === 'rejected') &&
      app.decisionDate &&
      new Date(app.decisionDate) >= thirtyDaysAgo
    )
    .sort((a, b) => new Date(b.decisionDate!).getTime() - new Date(a.decisionDate!).getTime());

  // Get applications requiring action
  const actionRequired = Array.from(applications.values())
    .filter(app => app.status === 'additional_info_requested');

  return {
    analytics,
    pendingApplications,
    upcomingDeadlines,
    recentDecisions,
    actionRequired,
  };
}

/**
 * Search applications
 */
export function searchApplications(query: string): GrantApplication[] {
  const lowerQuery = query.toLowerCase();
  return Array.from(applications.values())
    .filter(app =>
      app.grantName.toLowerCase().includes(lowerQuery) ||
      app.funderName.toLowerCase().includes(lowerQuery) ||
      app.projectTitle.toLowerCase().includes(lowerQuery) ||
      app.entityName.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Get entity names mapping
 */
export function getEntityNames(): Record<string, string> {
  return { ...ENTITY_NAMES };
}
