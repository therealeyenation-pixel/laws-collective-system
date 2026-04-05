/**
 * Offline & External Services
 * Comprehensive implementation of offline capabilities and external company onboarding
 */

// ============================================================================
// OFFLINE INFRASTRUCTURE
// ============================================================================

export interface OfflineConfig {
  enabled: boolean;
  syncInterval: number; // minutes
  maxOfflineDays: number;
  storageQuota: number; // MB
  priorityData: string[];
  encryptionEnabled: boolean;
}

export interface OfflineData {
  id: string;
  type: string;
  data: any;
  syncedAt: number;
  expiresAt: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  size: number;
}

export interface SyncStatus {
  lastSync: number;
  pendingChanges: number;
  syncErrors: SyncError[];
  isOnline: boolean;
  storageUsed: number;
  storageQuota: number;
}

export interface SyncError {
  id: string;
  timestamp: number;
  type: string;
  message: string;
  retryCount: number;
  resolved: boolean;
}

export function createOfflineConfig(options: Partial<OfflineConfig> = {}): OfflineConfig {
  return {
    enabled: true,
    syncInterval: 15,
    maxOfflineDays: 30,
    storageQuota: 500,
    priorityData: ['documents', 'contacts', 'calendar', 'tasks'],
    encryptionEnabled: true,
    ...options
  };
}

export function createOfflineData(
  type: string,
  data: any,
  priority: OfflineData['priority'] = 'medium',
  expirationDays: number = 30
): OfflineData {
  const now = Date.now();
  return {
    id: `OFFLINE-${Date.now().toString(36).toUpperCase()}`,
    type,
    data,
    syncedAt: now,
    expiresAt: now + expirationDays * 24 * 60 * 60 * 1000,
    priority,
    size: JSON.stringify(data).length
  };
}

export function getSyncStatus(
  lastSync: number,
  pendingChanges: number,
  storageUsed: number,
  storageQuota: number
): SyncStatus {
  return {
    lastSync,
    pendingChanges,
    syncErrors: [],
    isOnline: true,
    storageUsed,
    storageQuota
  };
}

// ============================================================================
// OFFLINE DOCUMENT GENERATION
// ============================================================================

export interface OfflineDocument {
  id: string;
  name: string;
  type: string;
  content: string;
  generatedAt: number;
  expiresAt: number;
  checksum: string;
}

export function generateOfflineDocument(
  name: string,
  type: string,
  content: string,
  validDays: number = 30
): OfflineDocument {
  const now = Date.now();
  return {
    id: `OFFDOC-${Date.now().toString(36).toUpperCase()}`,
    name,
    type,
    content,
    generatedAt: now,
    expiresAt: now + validDays * 24 * 60 * 60 * 1000,
    checksum: `CHK-${Math.random().toString(16).slice(2, 10).toUpperCase()}`
  };
}

export function validateOfflineDocument(doc: OfflineDocument): {
  valid: boolean;
  expired: boolean;
  reason?: string;
} {
  const now = Date.now();
  if (now > doc.expiresAt) {
    return { valid: false, expired: true, reason: 'Document has expired' };
  }
  if (!doc.checksum.startsWith('CHK-')) {
    return { valid: false, expired: false, reason: 'Invalid checksum' };
  }
  return { valid: true, expired: false };
}

// ============================================================================
// OFFLINE KNOWLEDGE BASE
// ============================================================================

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  lastUpdated: number;
  offlineAvailable: boolean;
}

export interface KnowledgeBase {
  articles: KnowledgeArticle[];
  categories: string[];
  lastSync: number;
  version: string;
}

export function createKnowledgeBase(): KnowledgeBase {
  return {
    articles: [],
    categories: [],
    lastSync: Date.now(),
    version: '1.0.0'
  };
}

export function addKnowledgeArticle(
  kb: KnowledgeBase,
  title: string,
  category: string,
  content: string,
  tags: string[] = []
): KnowledgeArticle {
  const article: KnowledgeArticle = {
    id: `KB-${Date.now().toString(36).toUpperCase()}`,
    title,
    category,
    content,
    tags,
    lastUpdated: Date.now(),
    offlineAvailable: true
  };
  
  kb.articles.push(article);
  if (!kb.categories.includes(category)) {
    kb.categories.push(category);
  }
  
  return article;
}

export function searchKnowledgeBase(
  kb: KnowledgeBase,
  query: string,
  category?: string
): KnowledgeArticle[] {
  const lowerQuery = query.toLowerCase();
  return kb.articles.filter(article => {
    const matchesQuery = 
      article.title.toLowerCase().includes(lowerQuery) ||
      article.content.toLowerCase().includes(lowerQuery) ||
      article.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
    const matchesCategory = !category || article.category === category;
    return matchesQuery && matchesCategory;
  });
}

// ============================================================================
// PHYSICAL BACKUP & PORTABILITY
// ============================================================================

export interface BackupConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number; // days
  encryption: boolean;
  compression: boolean;
  destinations: BackupDestination[];
}

export interface BackupDestination {
  id: string;
  type: 'local' | 'cloud' | 'usb' | 'network';
  path: string;
  enabled: boolean;
  lastBackup?: number;
}

export interface Backup {
  id: string;
  timestamp: number;
  size: number;
  checksum: string;
  destination: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  items: BackupItem[];
}

export interface BackupItem {
  type: string;
  count: number;
  size: number;
}

export function createBackupConfig(options: Partial<BackupConfig> = {}): BackupConfig {
  return {
    frequency: 'weekly',
    retention: 90,
    encryption: true,
    compression: true,
    destinations: [],
    ...options
  };
}

export function createBackup(destination: string): Backup {
  return {
    id: `BACKUP-${Date.now().toString(36).toUpperCase()}`,
    timestamp: Date.now(),
    size: 0,
    checksum: '',
    destination,
    status: 'pending',
    items: []
  };
}

export function addBackupItem(
  backup: Backup,
  type: string,
  count: number,
  size: number
): void {
  backup.items.push({ type, count, size });
  backup.size += size;
}

export function completeBackup(backup: Backup): void {
  backup.status = 'completed';
  backup.checksum = `BKP-${Math.random().toString(16).slice(2, 18).toUpperCase()}`;
}

// ============================================================================
// EXTERNAL COMPANY ONBOARDING
// ============================================================================

export type OnboardingStatus = 
  | 'pending'
  | 'in_progress'
  | 'documents_submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'suspended';

export interface ExternalCompany {
  id: string;
  name: string;
  type: 'vendor' | 'partner' | 'contractor' | 'consultant' | 'supplier';
  status: OnboardingStatus;
  contactInfo: CompanyContact;
  documents: CompanyDocument[];
  services: CompanyService[];
  onboardingProgress: OnboardingProgress;
  createdAt: number;
  updatedAt: number;
  approvedAt?: number;
}

export interface CompanyContact {
  primaryContact: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
}

export interface CompanyDocument {
  id: string;
  name: string;
  type: 'w9' | 'insurance' | 'license' | 'contract' | 'nda' | 'other';
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired';
  submittedAt?: number;
  expiresAt?: number;
  url?: string;
}

export interface CompanyService {
  id: string;
  name: string;
  category: string;
  description: string;
  rate?: number;
  rateType?: 'hourly' | 'fixed' | 'monthly' | 'project';
  status: 'active' | 'inactive' | 'pending';
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  pendingSteps: string[];
}

export const onboardingSteps = [
  'company_info',
  'contact_info',
  'service_selection',
  'document_upload',
  'compliance_review',
  'contract_signing',
  'account_setup',
  'activation'
];

export function createExternalCompany(
  name: string,
  type: ExternalCompany['type'],
  contactInfo: CompanyContact
): ExternalCompany {
  return {
    id: `EXT-${Date.now().toString(36).toUpperCase()}`,
    name,
    type,
    status: 'pending',
    contactInfo,
    documents: [],
    services: [],
    onboardingProgress: {
      currentStep: 1,
      totalSteps: onboardingSteps.length,
      completedSteps: [],
      pendingSteps: [...onboardingSteps]
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

export function addCompanyDocument(
  company: ExternalCompany,
  name: string,
  type: CompanyDocument['type']
): CompanyDocument {
  const doc: CompanyDocument = {
    id: `CDOC-${Date.now().toString(36)}`,
    name,
    type,
    status: 'pending'
  };
  
  company.documents.push(doc);
  company.updatedAt = Date.now();
  
  return doc;
}

export function submitCompanyDocument(
  company: ExternalCompany,
  documentId: string,
  url: string,
  expiresAt?: number
): boolean {
  const doc = company.documents.find(d => d.id === documentId);
  if (!doc) return false;
  
  doc.status = 'submitted';
  doc.submittedAt = Date.now();
  doc.url = url;
  doc.expiresAt = expiresAt;
  company.updatedAt = Date.now();
  
  return true;
}

export function addCompanyService(
  company: ExternalCompany,
  name: string,
  category: string,
  description: string,
  rate?: number,
  rateType?: CompanyService['rateType']
): CompanyService {
  const service: CompanyService = {
    id: `SVC-${Date.now().toString(36)}`,
    name,
    category,
    description,
    rate,
    rateType,
    status: 'pending'
  };
  
  company.services.push(service);
  company.updatedAt = Date.now();
  
  return service;
}

export function advanceOnboarding(company: ExternalCompany): boolean {
  const progress = company.onboardingProgress;
  
  if (progress.currentStep >= progress.totalSteps) {
    return false;
  }
  
  const completedStep = progress.pendingSteps.shift();
  if (completedStep) {
    progress.completedSteps.push(completedStep);
  }
  progress.currentStep++;
  company.updatedAt = Date.now();
  
  // Update status based on progress
  if (progress.currentStep === 4) {
    company.status = 'documents_submitted';
  } else if (progress.currentStep === 5) {
    company.status = 'under_review';
  } else if (progress.currentStep >= progress.totalSteps) {
    company.status = 'active';
    company.approvedAt = Date.now();
  } else {
    company.status = 'in_progress';
  }
  
  return true;
}

export function approveCompany(company: ExternalCompany): boolean {
  if (company.status === 'under_review') {
    company.status = 'approved';
    company.approvedAt = Date.now();
    company.updatedAt = Date.now();
    return true;
  }
  return false;
}

export function calculateOnboardingProgress(company: ExternalCompany): number {
  const progress = company.onboardingProgress;
  return Math.round((progress.completedSteps.length / progress.totalSteps) * 100);
}

// ============================================================================
// SERVICE CATALOG
// ============================================================================

export interface ServiceCatalog {
  categories: ServiceCategory[];
  services: CatalogService[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface CatalogService {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  requirements: string[];
  estimatedDuration: string;
  pricing: string;
}

export function createServiceCatalog(): ServiceCatalog {
  return {
    categories: [
      { id: 'legal', name: 'Legal Services', description: 'Legal and compliance services', icon: 'scale' },
      { id: 'financial', name: 'Financial Services', description: 'Accounting and financial services', icon: 'dollar' },
      { id: 'tech', name: 'Technology Services', description: 'IT and technology services', icon: 'code' },
      { id: 'consulting', name: 'Consulting Services', description: 'Business consulting services', icon: 'briefcase' },
      { id: 'marketing', name: 'Marketing Services', description: 'Marketing and communications', icon: 'megaphone' }
    ],
    services: []
  };
}

export function addCatalogService(
  catalog: ServiceCatalog,
  categoryId: string,
  name: string,
  description: string,
  requirements: string[],
  estimatedDuration: string,
  pricing: string
): CatalogService {
  const service: CatalogService = {
    id: `CATSVC-${Date.now().toString(36)}`,
    categoryId,
    name,
    description,
    requirements,
    estimatedDuration,
    pricing
  };
  
  catalog.services.push(service);
  return service;
}

// ============================================================================
// TRAINING & QUIZ SYSTEM
// ============================================================================

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number; // minutes
  content: TrainingContent[];
  quiz?: Quiz;
  certificate?: CertificateTemplate;
  completionCriteria: CompletionCriteria;
}

export interface TrainingContent {
  id: string;
  type: 'video' | 'text' | 'interactive' | 'document' | 'quiz';
  title: string;
  content: string;
  duration: number;
  required: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // minutes
  attempts: number;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'matching';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  template: string;
  validityPeriod?: number; // days
}

export interface CompletionCriteria {
  minContentViewed: number; // percentage
  quizRequired: boolean;
  minQuizScore?: number;
}

export interface TrainingProgress {
  moduleId: string;
  userId: string;
  startedAt: number;
  completedAt?: number;
  contentProgress: { contentId: string; completed: boolean; completedAt?: number }[];
  quizAttempts: QuizAttempt[];
  certificateIssued: boolean;
  certificateId?: string;
}

export interface QuizAttempt {
  id: string;
  startedAt: number;
  completedAt?: number;
  score: number;
  passed: boolean;
  answers: { questionId: string; answer: string | string[]; correct: boolean }[];
}

export function createTrainingModule(
  title: string,
  description: string,
  category: string,
  duration: number
): TrainingModule {
  return {
    id: `TRAIN-${Date.now().toString(36).toUpperCase()}`,
    title,
    description,
    category,
    duration,
    content: [],
    completionCriteria: {
      minContentViewed: 80,
      quizRequired: false
    }
  };
}

export function addTrainingContent(
  module: TrainingModule,
  type: TrainingContent['type'],
  title: string,
  content: string,
  duration: number,
  required: boolean = true
): TrainingContent {
  const trainingContent: TrainingContent = {
    id: `TCONT-${Date.now().toString(36)}`,
    type,
    title,
    content,
    duration,
    required
  };
  
  module.content.push(trainingContent);
  return trainingContent;
}

export function createQuiz(
  title: string,
  passingScore: number,
  timeLimit?: number,
  attempts: number = 3
): Quiz {
  return {
    id: `QUIZ-${Date.now().toString(36).toUpperCase()}`,
    title,
    questions: [],
    passingScore,
    timeLimit,
    attempts
  };
}

export function addQuizQuestion(
  quiz: Quiz,
  type: QuizQuestion['type'],
  question: string,
  correctAnswer: string | string[],
  points: number,
  options?: string[],
  explanation?: string
): QuizQuestion {
  const q: QuizQuestion = {
    id: `Q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    question,
    correctAnswer,
    points,
    options,
    explanation
  };
  
  quiz.questions.push(q);
  return q;
}

export function calculateQuizScore(quiz: Quiz, answers: { questionId: string; answer: string | string[] }[]): {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  results: { questionId: string; correct: boolean; points: number }[];
} {
  let score = 0;
  const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  const results: { questionId: string; correct: boolean; points: number }[] = [];
  
  for (const answer of answers) {
    const question = quiz.questions.find(q => q.id === answer.questionId);
    if (!question) continue;
    
    const isCorrect = Array.isArray(question.correctAnswer)
      ? JSON.stringify(answer.answer) === JSON.stringify(question.correctAnswer)
      : answer.answer === question.correctAnswer;
    
    if (isCorrect) {
      score += question.points;
    }
    
    results.push({
      questionId: answer.questionId,
      correct: isCorrect,
      points: isCorrect ? question.points : 0
    });
  }
  
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  
  return {
    score,
    maxScore,
    percentage,
    passed: percentage >= quiz.passingScore,
    results
  };
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const offlineExternalService = {
  // Offline
  createOfflineConfig,
  createOfflineData,
  getSyncStatus,
  generateOfflineDocument,
  validateOfflineDocument,
  createKnowledgeBase,
  addKnowledgeArticle,
  searchKnowledgeBase,
  createBackupConfig,
  createBackup,
  addBackupItem,
  completeBackup,
  // External
  createExternalCompany,
  addCompanyDocument,
  submitCompanyDocument,
  addCompanyService,
  advanceOnboarding,
  approveCompany,
  calculateOnboardingProgress,
  createServiceCatalog,
  addCatalogService,
  // Training
  createTrainingModule,
  addTrainingContent,
  createQuiz,
  addQuizQuestion,
  calculateQuizScore,
  onboardingSteps
};

export default offlineExternalService;
