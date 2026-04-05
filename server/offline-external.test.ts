import { describe, it, expect } from 'vitest';
import {
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
  createExternalCompany,
  addCompanyDocument,
  submitCompanyDocument,
  addCompanyService,
  advanceOnboarding,
  approveCompany,
  calculateOnboardingProgress,
  createServiceCatalog,
  addCatalogService,
  createTrainingModule,
  addTrainingContent,
  createQuiz,
  addQuizQuestion,
  calculateQuizScore,
  onboardingSteps
} from './services/offline-external';

// ============================================================================
// OFFLINE INFRASTRUCTURE TESTS
// ============================================================================

describe('Offline Infrastructure', () => {
  describe('Offline Config', () => {
    it('should create default offline config', () => {
      const config = createOfflineConfig();
      
      expect(config.enabled).toBe(true);
      expect(config.syncInterval).toBe(15);
      expect(config.maxOfflineDays).toBe(30);
      expect(config.encryptionEnabled).toBe(true);
    });

    it('should create custom offline config', () => {
      const config = createOfflineConfig({
        syncInterval: 30,
        storageQuota: 1000
      });
      
      expect(config.syncInterval).toBe(30);
      expect(config.storageQuota).toBe(1000);
    });
  });

  describe('Offline Data', () => {
    it('should create offline data', () => {
      const data = createOfflineData('documents', { id: 'doc-1', name: 'Test' }, 'high');
      
      expect(data.id).toMatch(/^OFFLINE-/);
      expect(data.type).toBe('documents');
      expect(data.priority).toBe('high');
      expect(data.expiresAt).toBeGreaterThan(data.syncedAt);
    });

    it('should calculate size correctly', () => {
      const testData = { key: 'value', nested: { data: 'test' } };
      const data = createOfflineData('test', testData);
      
      expect(data.size).toBe(JSON.stringify(testData).length);
    });
  });

  describe('Sync Status', () => {
    it('should get sync status', () => {
      const status = getSyncStatus(Date.now(), 5, 100, 500);
      
      expect(status.pendingChanges).toBe(5);
      expect(status.storageUsed).toBe(100);
      expect(status.storageQuota).toBe(500);
      expect(status.isOnline).toBe(true);
    });
  });
});

// ============================================================================
// OFFLINE DOCUMENT TESTS
// ============================================================================

describe('Offline Documents', () => {
  it('should generate offline document', () => {
    const doc = generateOfflineDocument('Test Doc', 'legal', 'Content here');
    
    expect(doc.id).toMatch(/^OFFDOC-/);
    expect(doc.name).toBe('Test Doc');
    expect(doc.checksum).toMatch(/^CHK-/);
  });

  it('should validate valid document', () => {
    const doc = generateOfflineDocument('Test', 'report', 'Content');
    const result = validateOfflineDocument(doc);
    
    expect(result.valid).toBe(true);
    expect(result.expired).toBe(false);
  });

  it('should detect expired document', () => {
    const doc = generateOfflineDocument('Test', 'report', 'Content', -1);
    const result = validateOfflineDocument(doc);
    
    expect(result.valid).toBe(false);
    expect(result.expired).toBe(true);
  });
});

// ============================================================================
// KNOWLEDGE BASE TESTS
// ============================================================================

describe('Knowledge Base', () => {
  it('should create knowledge base', () => {
    const kb = createKnowledgeBase();
    
    expect(kb.articles).toHaveLength(0);
    expect(kb.categories).toHaveLength(0);
    expect(kb.version).toBe('1.0.0');
  });

  it('should add articles', () => {
    const kb = createKnowledgeBase();
    const article = addKnowledgeArticle(kb, 'How to File', 'compliance', 'Filing instructions...', ['tax', 'filing']);
    
    expect(article.id).toMatch(/^KB-/);
    expect(kb.articles).toHaveLength(1);
    expect(kb.categories).toContain('compliance');
  });

  it('should search articles by title', () => {
    const kb = createKnowledgeBase();
    addKnowledgeArticle(kb, 'Tax Filing Guide', 'tax', 'How to file taxes');
    addKnowledgeArticle(kb, 'HR Policies', 'hr', 'HR policy information');
    
    const results = searchKnowledgeBase(kb, 'tax');
    
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Tax Filing Guide');
  });

  it('should search articles by category', () => {
    const kb = createKnowledgeBase();
    addKnowledgeArticle(kb, 'Article 1', 'legal', 'Legal content');
    addKnowledgeArticle(kb, 'Article 2', 'finance', 'Finance content');
    
    const results = searchKnowledgeBase(kb, 'content', 'legal');
    
    expect(results).toHaveLength(1);
    expect(results[0].category).toBe('legal');
  });
});

// ============================================================================
// BACKUP TESTS
// ============================================================================

describe('Backup System', () => {
  it('should create backup config', () => {
    const config = createBackupConfig();
    
    expect(config.frequency).toBe('weekly');
    expect(config.encryption).toBe(true);
    expect(config.compression).toBe(true);
  });

  it('should create backup', () => {
    const backup = createBackup('/backups/local');
    
    expect(backup.id).toMatch(/^BACKUP-/);
    expect(backup.status).toBe('pending');
    expect(backup.size).toBe(0);
  });

  it('should add backup items', () => {
    const backup = createBackup('/backups');
    addBackupItem(backup, 'documents', 100, 5000);
    addBackupItem(backup, 'images', 50, 10000);
    
    expect(backup.items).toHaveLength(2);
    expect(backup.size).toBe(15000);
  });

  it('should complete backup', () => {
    const backup = createBackup('/backups');
    completeBackup(backup);
    
    expect(backup.status).toBe('completed');
    expect(backup.checksum).toMatch(/^BKP-/);
  });
});

// ============================================================================
// EXTERNAL COMPANY TESTS
// ============================================================================

describe('External Company Onboarding', () => {
  const testContact = {
    primaryContact: 'John Doe',
    email: 'john@company.com',
    phone: '555-1234',
    address: '123 Main St'
  };

  it('should create external company', () => {
    const company = createExternalCompany('Acme Corp', 'vendor', testContact);
    
    expect(company.id).toMatch(/^EXT-/);
    expect(company.name).toBe('Acme Corp');
    expect(company.type).toBe('vendor');
    expect(company.status).toBe('pending');
    expect(company.onboardingProgress.currentStep).toBe(1);
  });

  it('should add company documents', () => {
    const company = createExternalCompany('Test Co', 'partner', testContact);
    const doc = addCompanyDocument(company, 'W-9 Form', 'w9');
    
    expect(doc.id).toMatch(/^CDOC-/);
    expect(doc.status).toBe('pending');
    expect(company.documents).toHaveLength(1);
  });

  it('should submit company documents', () => {
    const company = createExternalCompany('Test Co', 'contractor', testContact);
    const doc = addCompanyDocument(company, 'Insurance', 'insurance');
    
    const result = submitCompanyDocument(company, doc.id, 'https://example.com/doc.pdf');
    
    expect(result).toBe(true);
    expect(doc.status).toBe('submitted');
    expect(doc.url).toBe('https://example.com/doc.pdf');
  });

  it('should add company services', () => {
    const company = createExternalCompany('Consulting Inc', 'consultant', testContact);
    const service = addCompanyService(company, 'Strategy Consulting', 'consulting', 'Business strategy', 200, 'hourly');
    
    expect(service.id).toMatch(/^SVC-/);
    expect(service.rate).toBe(200);
    expect(company.services).toHaveLength(1);
  });

  it('should advance onboarding', () => {
    const company = createExternalCompany('Test', 'vendor', testContact);
    
    advanceOnboarding(company);
    
    expect(company.onboardingProgress.currentStep).toBe(2);
    expect(company.status).toBe('in_progress');
    expect(company.onboardingProgress.completedSteps).toHaveLength(1);
  });

  it('should calculate onboarding progress', () => {
    const company = createExternalCompany('Test', 'vendor', testContact);
    
    advanceOnboarding(company);
    advanceOnboarding(company);
    
    const progress = calculateOnboardingProgress(company);
    expect(progress).toBe(25); // 2 of 8 steps
  });

  it('should approve company', () => {
    const company = createExternalCompany('Test', 'vendor', testContact);
    company.status = 'under_review';
    
    const result = approveCompany(company);
    
    expect(result).toBe(true);
    expect(company.status).toBe('approved');
    expect(company.approvedAt).toBeDefined();
  });

  it('should have correct onboarding steps', () => {
    expect(onboardingSteps).toContain('company_info');
    expect(onboardingSteps).toContain('document_upload');
    expect(onboardingSteps).toContain('activation');
    expect(onboardingSteps.length).toBe(8);
  });
});

// ============================================================================
// SERVICE CATALOG TESTS
// ============================================================================

describe('Service Catalog', () => {
  it('should create service catalog with default categories', () => {
    const catalog = createServiceCatalog();
    
    expect(catalog.categories.length).toBeGreaterThan(0);
    expect(catalog.categories.find(c => c.id === 'legal')).toBeDefined();
    expect(catalog.services).toHaveLength(0);
  });

  it('should add catalog services', () => {
    const catalog = createServiceCatalog();
    const service = addCatalogService(
      catalog,
      'legal',
      'Contract Review',
      'Review and analysis of contracts',
      ['Signed engagement letter'],
      '2-3 business days',
      '$500-$2000'
    );
    
    expect(service.id).toMatch(/^CATSVC-/);
    expect(catalog.services).toHaveLength(1);
  });
});

// ============================================================================
// TRAINING & QUIZ TESTS
// ============================================================================

describe('Training System', () => {
  it('should create training module', () => {
    const module = createTrainingModule('Compliance 101', 'Basic compliance training', 'compliance', 60);
    
    expect(module.id).toMatch(/^TRAIN-/);
    expect(module.title).toBe('Compliance 101');
    expect(module.duration).toBe(60);
    expect(module.completionCriteria.minContentViewed).toBe(80);
  });

  it('should add training content', () => {
    const module = createTrainingModule('Test', 'Test module', 'test', 30);
    const content = addTrainingContent(module, 'video', 'Introduction', 'video-url', 10);
    
    expect(content.id).toMatch(/^TCONT-/);
    expect(module.content).toHaveLength(1);
  });

  it('should create quiz', () => {
    const quiz = createQuiz('Final Exam', 70, 30, 2);
    
    expect(quiz.id).toMatch(/^QUIZ-/);
    expect(quiz.passingScore).toBe(70);
    expect(quiz.timeLimit).toBe(30);
    expect(quiz.attempts).toBe(2);
  });

  it('should add quiz questions', () => {
    const quiz = createQuiz('Test Quiz', 80);
    addQuizQuestion(quiz, 'multiple_choice', 'What is 2+2?', '4', 10, ['3', '4', '5']);
    addQuizQuestion(quiz, 'true_false', 'The sky is blue', 'true', 5);
    
    expect(quiz.questions).toHaveLength(2);
  });

  it('should calculate quiz score correctly', () => {
    const quiz = createQuiz('Test', 70);
    const q1 = addQuizQuestion(quiz, 'multiple_choice', 'Q1', 'A', 10, ['A', 'B', 'C']);
    const q2 = addQuizQuestion(quiz, 'multiple_choice', 'Q2', 'B', 10, ['A', 'B', 'C']);
    
    const result = calculateQuizScore(quiz, [
      { questionId: q1.id, answer: 'A' },
      { questionId: q2.id, answer: 'A' } // Wrong answer
    ]);
    
    expect(result.score).toBe(10);
    expect(result.maxScore).toBe(20);
    expect(result.percentage).toBeLessThan(100);
    expect(result.passed).toBe(false);
  });

  it('should pass quiz with sufficient score', () => {
    const quiz = createQuiz('Test', 70);
    const q1 = addQuizQuestion(quiz, 'true_false', 'Q1', 'true', 10);
    // Add small delay to ensure unique IDs
    const q2 = addQuizQuestion(quiz, 'true_false', 'Q2', 'false', 10);
    
    // Both answers are correct
    const result = calculateQuizScore(quiz, [
      { questionId: q1.id, answer: 'true' },
      { questionId: q2.id, answer: 'false' }
    ]);
    
    // With both correct, should be 100% and pass
    expect(result.score).toBe(result.maxScore);
    expect(result.passed).toBe(true);
  });
});
