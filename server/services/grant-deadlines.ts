/**
 * Grant Deadline Tracking Service
 * 
 * Manages grant application deadlines for federal and foundation grants,
 * generates automated reminders, and integrates with the compliance calendar.
 */

export type GrantCategory = 'federal' | 'foundation' | 'state' | 'corporate' | 'custom';
export type GrantStatus = 'upcoming' | 'open' | 'closing_soon' | 'closed' | 'submitted';
export type ReminderType = '30_day' | '14_day' | '7_day' | '1_day' | 'custom';

export interface GrantDeadline {
  id: string;
  name: string;
  funder: string;
  category: GrantCategory;
  description: string;
  eligibleEntities: string[];
  openDate: string;        // ISO date string
  closeDate: string;       // ISO date string
  maxFunding: number;
  applicationUrl?: string;
  contactEmail?: string;
  requirements: string[];
  status: GrantStatus;
  notes?: string;
}

export interface GrantReminder {
  id: string;
  grantDeadlineId: string;
  grantName: string;
  reminderType: ReminderType;
  reminderDate: string;    // ISO date string
  sent: boolean;
  sentAt?: number;
  entityId?: string;
  recipientEmail?: string;
  message: string;
}

export interface DeadlineFilter {
  category?: GrantCategory;
  status?: GrantStatus;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
  funder?: string;
}

// Federal grant deadlines database
const federalGrants: GrantDeadline[] = [
  {
    id: 'nea_art_works_2026',
    name: 'NEA Art Works Grant FY2026',
    funder: 'National Endowment for the Arts',
    category: 'federal',
    description: 'Supports artistically excellent projects that celebrate creativity and cultural heritage',
    eligibleEntities: ['real_eye_nation', '508_academy'],
    openDate: '2026-01-15',
    closeDate: '2026-02-13',
    maxFunding: 100000,
    applicationUrl: 'https://www.arts.gov/grants/art-works',
    contactEmail: 'artworks@arts.gov',
    requirements: ['501(c)(3) or 508(c)(1)(a) status', 'Three-year operating history', 'Work samples'],
    status: 'open',
    notes: 'Projects must begin between January 1 and December 31, 2027'
  },
  {
    id: 'usda_rbdg_2026_q1',
    name: 'USDA Rural Business Development Grant Q1 2026',
    funder: 'USDA Rural Development',
    category: 'federal',
    description: 'Supports rural small business development and job creation',
    eligibleEntities: ['laws_collective', 'luvonpurpose_aws'],
    openDate: '2026-01-01',
    closeDate: '2026-03-31',
    maxFunding: 500000,
    applicationUrl: 'https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants',
    requirements: ['Rural area service', 'Job creation plan', 'Environmental review'],
    status: 'open'
  },
  {
    id: 'sba_community_advantage_2026',
    name: 'SBA Community Advantage Loan Program 2026',
    funder: 'Small Business Administration',
    category: 'federal',
    description: 'Provides capital to small businesses in underserved markets',
    eligibleEntities: ['laws_collective', 'luvonpurpose_aws', 'real_eye_nation'],
    openDate: '2026-01-01',
    closeDate: '2026-12-31',
    maxFunding: 250000,
    applicationUrl: 'https://www.sba.gov/funding-programs/loans',
    requirements: ['Business plan', 'Financial projections', 'Collateral documentation'],
    status: 'open',
    notes: 'Rolling applications through approved lenders'
  },
  {
    id: 'ed_charter_schools_2026',
    name: 'Charter Schools Program Grant 2026',
    funder: 'U.S. Department of Education',
    category: 'federal',
    description: 'Supports the planning, program design, and initial implementation of charter schools',
    eligibleEntities: ['508_academy'],
    openDate: '2026-03-01',
    closeDate: '2026-04-30',
    maxFunding: 1500000,
    applicationUrl: 'https://oese.ed.gov/offices/office-of-discretionary-grants-support-services/charter-school-programs/',
    requirements: ['Charter authorization', 'Education plan', 'Governance structure'],
    status: 'upcoming'
  },
  {
    id: 'imls_museums_2026',
    name: 'IMLS Museums for America Grant 2026',
    funder: 'Institute of Museum and Library Services',
    category: 'federal',
    description: 'Supports museums in providing high-quality experiences and educational programs',
    eligibleEntities: ['508_academy', 'real_eye_nation'],
    openDate: '2026-09-01',
    closeDate: '2026-11-15',
    maxFunding: 250000,
    applicationUrl: 'https://www.imls.gov/grants/available/museums-america',
    requirements: ['Museum status', 'Public programming', 'Educational mission'],
    status: 'upcoming'
  }
];

// Foundation grant deadlines database
const foundationGrants: GrantDeadline[] = [
  {
    id: 'ford_building_institutions_2026',
    name: 'Ford Foundation Building Institutions and Networks',
    funder: 'Ford Foundation',
    category: 'foundation',
    description: 'Supports organizations working to reduce inequality and injustice',
    eligibleEntities: ['laws_collective', '508_academy', 'luvonpurpose_aws'],
    openDate: '2026-01-01',
    closeDate: '2026-06-30',
    maxFunding: 5000000,
    applicationUrl: 'https://www.fordfoundation.org/work/our-grants/',
    contactEmail: 'office-secretary@fordfoundation.org',
    requirements: ['Letter of Inquiry first', '501(c)(3) or equivalent', 'Audited financials'],
    status: 'open',
    notes: 'By invitation after Letter of Inquiry approval'
  },
  {
    id: 'kellogg_thriving_children_2026',
    name: 'W.K. Kellogg Foundation Thriving Children',
    funder: 'W.K. Kellogg Foundation',
    category: 'foundation',
    description: 'Supports thriving children, working families, and equitable communities',
    eligibleEntities: ['508_academy', 'laws_collective'],
    openDate: '2026-01-01',
    closeDate: '2026-12-31',
    maxFunding: 3000000,
    applicationUrl: 'https://www.wkkf.org/grantseekers',
    requirements: ['Online application', 'Logic model', 'Evaluation plan'],
    status: 'open',
    notes: 'Rolling applications accepted'
  },
  {
    id: 'macarthur_100_and_change_2026',
    name: 'MacArthur Foundation 100&Change',
    funder: 'MacArthur Foundation',
    category: 'foundation',
    description: 'Single $100 million grant to fund a solution to a critical problem',
    eligibleEntities: ['luvonpurpose_aws', 'laws_collective', '508_academy'],
    openDate: '2026-06-01',
    closeDate: '2026-08-31',
    maxFunding: 100000000,
    applicationUrl: 'https://www.macfound.org/programs/100change/',
    requirements: ['Concept paper', 'Evidence of impact', 'Scalability plan'],
    status: 'upcoming',
    notes: 'Highly competitive - requires bold, transformative solution'
  },
  {
    id: 'gates_economic_mobility_2026',
    name: 'Gates Foundation Economic Mobility & Opportunity',
    funder: 'Bill & Melinda Gates Foundation',
    category: 'foundation',
    description: 'Supports pathways to economic mobility for low-income Americans',
    eligibleEntities: ['laws_collective', 'luvonpurpose_aws'],
    openDate: '2026-02-01',
    closeDate: '2026-04-15',
    maxFunding: 2000000,
    applicationUrl: 'https://www.gatesfoundation.org/about/how-we-work/grants',
    requirements: ['Letter of Inquiry', 'Theory of change', 'Measurable outcomes'],
    status: 'upcoming'
  },
  {
    id: 'walton_k12_education_2026',
    name: 'Walton Family Foundation K-12 Education',
    funder: 'Walton Family Foundation',
    category: 'foundation',
    description: 'Supports high-quality educational options for underserved students',
    eligibleEntities: ['508_academy'],
    openDate: '2026-01-15',
    closeDate: '2026-03-15',
    maxFunding: 1000000,
    applicationUrl: 'https://www.waltonfamilyfoundation.org/grants',
    requirements: ['School choice focus', 'Student outcomes data', 'Sustainability plan'],
    status: 'open'
  },
  {
    id: 'lumina_postsecondary_2026',
    name: 'Lumina Foundation Postsecondary Success',
    funder: 'Lumina Foundation',
    category: 'foundation',
    description: 'Supports increasing postsecondary credential attainment',
    eligibleEntities: ['508_academy', 'laws_collective'],
    openDate: '2026-04-01',
    closeDate: '2026-05-31',
    maxFunding: 500000,
    applicationUrl: 'https://www.luminafoundation.org/our-work/grants/',
    requirements: ['Credential focus', 'Equity lens', 'Data-driven approach'],
    status: 'upcoming'
  }
];

// In-memory storage for custom deadlines and reminders
let customDeadlines: GrantDeadline[] = [];
let reminders: GrantReminder[] = [];

/**
 * Get all grant deadlines with optional filtering
 */
export function getGrantDeadlines(filter?: DeadlineFilter): GrantDeadline[] {
  let allDeadlines = [...federalGrants, ...foundationGrants, ...customDeadlines];
  
  // Update status based on current date
  const today = new Date().toISOString().split('T')[0];
  allDeadlines = allDeadlines.map(deadline => ({
    ...deadline,
    status: calculateStatus(deadline, today)
  }));
  
  if (!filter) return allDeadlines;
  
  if (filter.category) {
    allDeadlines = allDeadlines.filter(d => d.category === filter.category);
  }
  
  if (filter.status) {
    allDeadlines = allDeadlines.filter(d => d.status === filter.status);
  }
  
  if (filter.entityType) {
    allDeadlines = allDeadlines.filter(d => d.eligibleEntities.includes(filter.entityType!));
  }
  
  if (filter.fromDate) {
    allDeadlines = allDeadlines.filter(d => d.closeDate >= filter.fromDate!);
  }
  
  if (filter.toDate) {
    allDeadlines = allDeadlines.filter(d => d.openDate <= filter.toDate!);
  }
  
  if (filter.funder) {
    allDeadlines = allDeadlines.filter(d => 
      d.funder.toLowerCase().includes(filter.funder!.toLowerCase())
    );
  }
  
  return allDeadlines.sort((a, b) => a.closeDate.localeCompare(b.closeDate));
}

/**
 * Calculate grant status based on dates
 */
function calculateStatus(deadline: GrantDeadline, today: string): GrantStatus {
  if (deadline.status === 'submitted') return 'submitted';
  
  if (today < deadline.openDate) return 'upcoming';
  if (today > deadline.closeDate) return 'closed';
  
  // Check if closing soon (within 14 days)
  const closeDate = new Date(deadline.closeDate);
  const todayDate = new Date(today);
  const daysUntilClose = Math.ceil((closeDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilClose <= 14) return 'closing_soon';
  return 'open';
}

/**
 * Get a specific grant deadline by ID
 */
export function getGrantDeadlineById(id: string): GrantDeadline | null {
  const allDeadlines = [...federalGrants, ...foundationGrants, ...customDeadlines];
  return allDeadlines.find(d => d.id === id) || null;
}

/**
 * Get deadlines for a specific entity
 */
export function getDeadlinesForEntity(entityType: string): GrantDeadline[] {
  return getGrantDeadlines({ entityType });
}

/**
 * Get upcoming deadlines (next 90 days)
 */
export function getUpcomingDeadlines(days: number = 90): GrantDeadline[] {
  const today = new Date();
  const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  
  return getGrantDeadlines({
    fromDate: today.toISOString().split('T')[0],
    toDate: futureDate.toISOString().split('T')[0]
  }).filter(d => d.status !== 'closed' && d.status !== 'submitted');
}

/**
 * Get deadlines closing soon (within 14 days)
 */
export function getClosingSoonDeadlines(): GrantDeadline[] {
  return getGrantDeadlines({ status: 'closing_soon' });
}

/**
 * Add a custom grant deadline
 */
export function addCustomDeadline(deadline: Omit<GrantDeadline, 'id' | 'status'>): GrantDeadline {
  const newDeadline: GrantDeadline = {
    ...deadline,
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'upcoming'
  };
  
  customDeadlines.push(newDeadline);
  return newDeadline;
}

/**
 * Update a custom deadline
 */
export function updateCustomDeadline(id: string, updates: Partial<GrantDeadline>): GrantDeadline | null {
  const index = customDeadlines.findIndex(d => d.id === id);
  if (index === -1) return null;
  
  customDeadlines[index] = { ...customDeadlines[index], ...updates };
  return customDeadlines[index];
}

/**
 * Delete a custom deadline
 */
export function deleteCustomDeadline(id: string): boolean {
  const index = customDeadlines.findIndex(d => d.id === id);
  if (index === -1) return false;
  
  customDeadlines.splice(index, 1);
  return true;
}

/**
 * Mark a deadline as submitted
 */
export function markAsSubmitted(id: string): GrantDeadline | null {
  // Check in all deadline arrays
  let deadline = federalGrants.find(d => d.id === id);
  if (deadline) {
    deadline.status = 'submitted';
    return deadline;
  }
  
  deadline = foundationGrants.find(d => d.id === id);
  if (deadline) {
    deadline.status = 'submitted';
    return deadline;
  }
  
  const customIndex = customDeadlines.findIndex(d => d.id === id);
  if (customIndex !== -1) {
    customDeadlines[customIndex].status = 'submitted';
    return customDeadlines[customIndex];
  }
  
  return null;
}

/**
 * Generate reminders for a deadline
 */
export function generateReminders(deadlineId: string, recipientEmail?: string): GrantReminder[] {
  const deadline = getGrantDeadlineById(deadlineId);
  if (!deadline) return [];
  
  const closeDate = new Date(deadline.closeDate);
  const newReminders: GrantReminder[] = [];
  
  const reminderDays: { type: ReminderType; days: number }[] = [
    { type: '30_day', days: 30 },
    { type: '14_day', days: 14 },
    { type: '7_day', days: 7 },
    { type: '1_day', days: 1 }
  ];
  
  reminderDays.forEach(({ type, days }) => {
    const reminderDate = new Date(closeDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    // Only create reminder if it's in the future
    if (reminderDate > new Date()) {
      const reminder: GrantReminder = {
        id: `reminder_${deadlineId}_${type}_${Date.now()}`,
        grantDeadlineId: deadlineId,
        grantName: deadline.name,
        reminderType: type,
        reminderDate: reminderDate.toISOString().split('T')[0],
        sent: false,
        recipientEmail,
        message: generateReminderMessage(deadline, type, days)
      };
      
      newReminders.push(reminder);
      reminders.push(reminder);
    }
  });
  
  return newReminders;
}

/**
 * Generate reminder message
 */
function generateReminderMessage(deadline: GrantDeadline, type: ReminderType, daysUntil: number): string {
  const urgency = daysUntil <= 7 ? 'URGENT: ' : '';
  return `${urgency}${deadline.name} deadline is in ${daysUntil} day${daysUntil === 1 ? '' : 's'}. ` +
    `Application closes on ${deadline.closeDate}. ` +
    `Maximum funding: $${deadline.maxFunding.toLocaleString()}. ` +
    `Funder: ${deadline.funder}.`;
}

/**
 * Get all reminders
 */
export function getReminders(filter?: { sent?: boolean; deadlineId?: string }): GrantReminder[] {
  let result = [...reminders];
  
  if (filter?.sent !== undefined) {
    result = result.filter(r => r.sent === filter.sent);
  }
  
  if (filter?.deadlineId) {
    result = result.filter(r => r.grantDeadlineId === filter.deadlineId);
  }
  
  return result.sort((a, b) => a.reminderDate.localeCompare(b.reminderDate));
}

/**
 * Get due reminders (reminders that should be sent today or earlier)
 */
export function getDueReminders(): GrantReminder[] {
  const today = new Date().toISOString().split('T')[0];
  return reminders.filter(r => !r.sent && r.reminderDate <= today);
}

/**
 * Mark reminder as sent
 */
export function markReminderSent(reminderId: string): GrantReminder | null {
  const reminder = reminders.find(r => r.id === reminderId);
  if (!reminder) return null;
  
  reminder.sent = true;
  reminder.sentAt = Date.now();
  return reminder;
}

/**
 * Add a custom reminder
 */
export function addCustomReminder(
  deadlineId: string,
  reminderDate: string,
  message: string,
  recipientEmail?: string
): GrantReminder | null {
  const deadline = getGrantDeadlineById(deadlineId);
  if (!deadline) return null;
  
  const reminder: GrantReminder = {
    id: `reminder_custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    grantDeadlineId: deadlineId,
    grantName: deadline.name,
    reminderType: 'custom',
    reminderDate,
    sent: false,
    recipientEmail,
    message
  };
  
  reminders.push(reminder);
  return reminder;
}

/**
 * Delete a reminder
 */
export function deleteReminder(reminderId: string): boolean {
  const index = reminders.findIndex(r => r.id === reminderId);
  if (index === -1) return false;
  
  reminders.splice(index, 1);
  return true;
}

/**
 * Get deadline statistics
 */
export function getDeadlineStatistics(): {
  total: number;
  byCategory: Record<GrantCategory, number>;
  byStatus: Record<GrantStatus, number>;
  totalFunding: number;
  closingSoon: number;
  upcomingReminders: number;
} {
  const allDeadlines = getGrantDeadlines();
  
  const byCategory: Record<GrantCategory, number> = {
    federal: 0,
    foundation: 0,
    state: 0,
    corporate: 0,
    custom: 0
  };
  
  const byStatus: Record<GrantStatus, number> = {
    upcoming: 0,
    open: 0,
    closing_soon: 0,
    closed: 0,
    submitted: 0
  };
  
  let totalFunding = 0;
  
  allDeadlines.forEach(d => {
    byCategory[d.category]++;
    byStatus[d.status]++;
    if (d.status !== 'closed' && d.status !== 'submitted') {
      totalFunding += d.maxFunding;
    }
  });
  
  return {
    total: allDeadlines.length,
    byCategory,
    byStatus,
    totalFunding,
    closingSoon: byStatus.closing_soon,
    upcomingReminders: getReminders({ sent: false }).length
  };
}

/**
 * Get calendar events for deadlines (for integration with Compliance Calendar)
 */
export function getDeadlineCalendarEvents(month?: number, year?: number): {
  id: string;
  title: string;
  date: string;
  type: 'open' | 'close' | 'reminder';
  grantId: string;
  category: GrantCategory;
  status: GrantStatus;
  maxFunding: number;
}[] {
  const events: {
    id: string;
    title: string;
    date: string;
    type: 'open' | 'close' | 'reminder';
    grantId: string;
    category: GrantCategory;
    status: GrantStatus;
    maxFunding: number;
  }[] = [];
  
  const deadlines = getGrantDeadlines();
  
  deadlines.forEach(deadline => {
    // Add open date event
    if (!month || !year || isInMonth(deadline.openDate, month, year)) {
      events.push({
        id: `${deadline.id}_open`,
        title: `${deadline.name} - Opens`,
        date: deadline.openDate,
        type: 'open',
        grantId: deadline.id,
        category: deadline.category,
        status: deadline.status,
        maxFunding: deadline.maxFunding
      });
    }
    
    // Add close date event
    if (!month || !year || isInMonth(deadline.closeDate, month, year)) {
      events.push({
        id: `${deadline.id}_close`,
        title: `${deadline.name} - Deadline`,
        date: deadline.closeDate,
        type: 'close',
        grantId: deadline.id,
        category: deadline.category,
        status: deadline.status,
        maxFunding: deadline.maxFunding
      });
    }
  });
  
  // Add reminder events
  const reminderList = getReminders({ sent: false });
  reminderList.forEach(reminder => {
    const deadline = getGrantDeadlineById(reminder.grantDeadlineId);
    if (deadline && (!month || !year || isInMonth(reminder.reminderDate, month, year))) {
      events.push({
        id: reminder.id,
        title: `Reminder: ${reminder.grantName}`,
        date: reminder.reminderDate,
        type: 'reminder',
        grantId: reminder.grantDeadlineId,
        category: deadline.category,
        status: deadline.status,
        maxFunding: deadline.maxFunding
      });
    }
  });
  
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

function isInMonth(dateStr: string, month: number, year: number): boolean {
  const date = new Date(dateStr);
  return date.getMonth() + 1 === month && date.getFullYear() === year;
}

/**
 * Search grants by keyword
 */
export function searchGrants(query: string): GrantDeadline[] {
  const lowerQuery = query.toLowerCase();
  return getGrantDeadlines().filter(d =>
    d.name.toLowerCase().includes(lowerQuery) ||
    d.funder.toLowerCase().includes(lowerQuery) ||
    d.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get grants by funding range
 */
export function getGrantsByFundingRange(minFunding: number, maxFunding: number): GrantDeadline[] {
  return getGrantDeadlines().filter(d =>
    d.maxFunding >= minFunding && d.maxFunding <= maxFunding
  );
}
