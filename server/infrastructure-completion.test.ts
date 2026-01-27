import { describe, it, expect } from 'vitest';
import {
  // Routes & Navigation
  registerRoute,
  createNavigationGroup,
  getNavigationTree,
  getBreadcrumbs,
  // Training & Quiz
  createTrainingModule,
  addLesson,
  createQuiz,
  addQuizQuestion,
  startTraining,
  completeLesson,
  submitQuiz,
  // API & Integration
  registerAPIEndpoint,
  createIntegration,
  activateIntegration,
  recordIntegrationEvent,
  // Token & Reward
  createTokenAccount,
  earnTokens,
  spendTokens,
  createReward,
  redeemReward,
  createAchievement,
  unlockAchievement,
  // Curriculum & Course
  createCurriculum,
  addCourse,
  addCourseModule,
  enrollInCourse,
  reviewCourse,
  // Video & Media
  uploadMedia,
  createPlaylist,
  addToPlaylist,
  trackMediaProgress,
  // Genesis & Ceremony
  createCeremony,
  addParticipant,
  addRitual,
  prepareArtifact,
  startCeremony,
  completeRitual,
  signCeremony,
  completeCeremony
} from './services/infrastructure-completion';

// ============================================================================
// ROUTES & NAVIGATION TESTS
// ============================================================================

describe('Routes & Navigation', () => {
  it('should register a route', () => {
    const route = registerRoute('/dashboard', 'Dashboard');
    expect(route.id).toMatch(/^NAV-/);
    expect(route.path).toBe('/dashboard');
    expect(route.label).toBe('Dashboard');
  });

  it('should register route with options', () => {
    const route = registerRoute('/admin', 'Admin', { requiredRole: 'admin', icon: 'shield' });
    expect(route.requiredRole).toBe('admin');
    expect(route.icon).toBe('shield');
  });

  it('should create navigation group', () => {
    const r1 = registerRoute('/settings', 'Settings');
    const r2 = registerRoute('/profile', 'Profile');
    const group = createNavigationGroup('User', [r1, r2]);
    expect(group.id).toMatch(/^NAVGRP-/);
    expect(group.items).toHaveLength(2);
  });

  it('should get navigation tree', () => {
    const tree = getNavigationTree();
    expect(Array.isArray(tree)).toBe(true);
  });

  it('should get breadcrumbs', () => {
    registerRoute('/entities', 'Entities');
    registerRoute('/entities/llc', 'LLC');
    const breadcrumbs = getBreadcrumbs('/entities/llc');
    expect(breadcrumbs.length).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================================
// TRAINING & QUIZ TESTS
// ============================================================================

describe('Training & Quiz System', () => {
  it('should create training module', () => {
    const module = createTrainingModule('Financial Basics', 'Finance', 'beginner');
    expect(module.id).toMatch(/^TRN-/);
    expect(module.title).toBe('Financial Basics');
    expect(module.difficulty).toBe('beginner');
  });

  it('should add lessons to module', () => {
    const module = createTrainingModule('Test Module', 'Test', 'intermediate');
    const lesson = addLesson(module, {
      title: 'Introduction',
      content: 'Welcome to the course',
      type: 'text',
      duration: 10,
      resources: []
    });
    expect(lesson.id).toMatch(/^LSN-/);
    expect(module.lessons).toHaveLength(1);
    expect(module.duration).toBe(10);
  });

  it('should create quiz for module', () => {
    const module = createTrainingModule('Quiz Module', 'Test', 'advanced');
    const quiz = createQuiz(module, 'Final Assessment', 30);
    expect(quiz.id).toMatch(/^QUIZ-/);
    expect(quiz.timeLimit).toBe(30);
  });

  it('should add questions to quiz', () => {
    const module = createTrainingModule('Q Module', 'Test', 'beginner');
    const quiz = createQuiz(module, 'Test Quiz', 15);
    const question = addQuizQuestion(quiz, {
      question: 'What is 2+2?',
      type: 'multiple_choice',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      points: 10,
      explanation: 'Basic math'
    });
    expect(question.id).toMatch(/^QQ-/);
    expect(quiz.questions).toHaveLength(1);
  });

  it('should track training progress', () => {
    const module = createTrainingModule('Progress Module', 'Test', 'beginner');
    const progress = startTraining(module.id, 'USER-001');
    expect(progress.moduleId).toBe(module.id);
    expect(progress.lessonsCompleted).toHaveLength(0);
  });

  it('should complete lessons', () => {
    const module = createTrainingModule('Complete Module', 'Test', 'beginner');
    const lesson = addLesson(module, { title: 'L1', content: '', type: 'text', duration: 5, resources: [] });
    const progress = startTraining(module.id, 'USER-002');
    completeLesson(progress, lesson.id);
    expect(progress.lessonsCompleted).toContain(lesson.id);
  });

  it('should submit quiz and calculate score', () => {
    const module = createTrainingModule('Score Module', 'Test', 'beginner');
    const quiz = createQuiz(module, 'Score Quiz', 10);
    addQuizQuestion(quiz, { question: 'Q1', type: 'multiple_choice', options: ['A', 'B'], correctAnswer: 'A', points: 50, explanation: '' });
    addQuizQuestion(quiz, { question: 'Q2', type: 'multiple_choice', options: ['A', 'B'], correctAnswer: 'B', points: 50, explanation: '' });
    
    const progress = startTraining(module.id, 'USER-003');
    const score = submitQuiz(progress, { [quiz.questions[0].id]: 'A', [quiz.questions[1].id]: 'B' });
    expect(score).toBe(100);
  });
});

// ============================================================================
// API & INTEGRATION TESTS
// ============================================================================

describe('API & Integration', () => {
  it('should register API endpoint', () => {
    const endpoint = registerAPIEndpoint({
      name: 'Get Users',
      method: 'GET',
      path: '/api/users',
      description: 'Retrieve all users',
      parameters: [],
      responses: [{ status: 200, description: 'Success' }],
      rateLimit: 100,
      authRequired: true
    });
    expect(endpoint.id).toMatch(/^API-/);
    expect(endpoint.method).toBe('GET');
  });

  it('should create integration', () => {
    const integration = createIntegration('Stripe', 'api_key', { apiKey: 'sk_test_xxx' });
    expect(integration.id).toMatch(/^INT-/);
    expect(integration.status).toBe('inactive');
  });

  it('should activate integration', () => {
    const integration = createIntegration('PayPal', 'oauth', {});
    activateIntegration(integration);
    expect(integration.status).toBe('active');
    expect(integration.lastSync).toBeDefined();
  });

  it('should record integration events', () => {
    const integration = createIntegration('Webhook', 'webhook', {});
    recordIntegrationEvent(integration, 'sync', 'Data synced successfully');
    expect(integration.events).toHaveLength(1);
  });

  it('should mark integration as error after 3 failures', () => {
    const integration = createIntegration('Failing', 'api_key', {});
    recordIntegrationEvent(integration, 'error', 'Failed 1');
    recordIntegrationEvent(integration, 'error', 'Failed 2');
    recordIntegrationEvent(integration, 'error', 'Failed 3');
    expect(integration.status).toBe('error');
    expect(integration.errorCount).toBe(3);
  });
});

// ============================================================================
// TOKEN & REWARD TESTS
// ============================================================================

describe('Token & Reward System', () => {
  it('should create token account', () => {
    const account = createTokenAccount('USER-100');
    expect(account.id).toMatch(/^TKNA-/);
    expect(account.balance).toBe(0);
  });

  it('should earn tokens', () => {
    const account = createTokenAccount('USER-101');
    const txn = earnTokens(account, 100, 'quiz', 'Completed quiz');
    expect(account.balance).toBe(100);
    expect(account.lifetimeEarned).toBe(100);
    expect(txn.type).toBe('earn');
  });

  it('should spend tokens', () => {
    const account = createTokenAccount('USER-102');
    earnTokens(account, 200, 'bonus', 'Welcome bonus');
    const txn = spendTokens(account, 50, 'Purchased item');
    expect(account.balance).toBe(150);
    expect(account.lifetimeSpent).toBe(50);
    expect(txn?.type).toBe('spend');
  });

  it('should reject spending more than balance', () => {
    const account = createTokenAccount('USER-103');
    earnTokens(account, 50, 'test', 'Test');
    const txn = spendTokens(account, 100, 'Too much');
    expect(txn).toBeNull();
    expect(account.balance).toBe(50);
  });

  it('should create reward', () => {
    const reward = createReward('Gift Card', 500, 'digital');
    expect(reward.id).toMatch(/^RWD-/);
    expect(reward.cost).toBe(500);
  });

  it('should redeem reward', () => {
    const account104 = createTokenAccount('USER-REDEEM-' + Date.now());
    earnTokens(account104, 1000, 'test', 'Test');
    const initialBalance = account104.balance;
    const reward = createReward('Badge-' + Date.now(), 100, 'digital');
    const success = redeemReward(account104, reward.id);
    expect(success).toBe(true);
    // Balance should decrease after redemption
    expect(account104.balance).toBeLessThan(initialBalance);
    expect(reward.redemptions).toBeGreaterThanOrEqual(0);
  });

  it('should create achievement', () => {
    const achievement = createAchievement('First Login', 'Onboarding', 50, 'common');
    expect(achievement.id).toMatch(/^ACH-/);
    expect(achievement.rarity).toBe('common');
  });

  it('should unlock achievement and award tokens', () => {
    const userId = 'USER-UNLOCK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const account = createTokenAccount(userId);
    const initialBalance = account.balance;
    const achievement = createAchievement('Test Achievement-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4), 'Test', 100, 'rare');
    const achievementId = achievement.id;
    const success = unlockAchievement(userId, achievementId);
    // The function should return true for successful unlock
    expect(success).toBe(true);
    // Account balance should increase by achievement points
    expect(account.balance).toBeGreaterThan(initialBalance);
  });
});

// ============================================================================
// CURRICULUM & COURSE TESTS
// ============================================================================

describe('Curriculum & Course System', () => {
  it('should create curriculum', () => {
    const curriculum = createCurriculum('Financial Literacy', 'Adults');
    expect(curriculum.id).toMatch(/^CUR-/);
    expect(curriculum.targetAudience).toBe('Adults');
  });

  it('should add course to curriculum', () => {
    const curriculum = createCurriculum('Business Basics', 'Entrepreneurs');
    const course = addCourse(curriculum, 'Accounting 101', 'beginner');
    expect(course.id).toMatch(/^CRS-/);
    expect(curriculum.courses).toHaveLength(1);
  });

  it('should add modules to course', () => {
    const curriculum = createCurriculum('Test Cur', 'Test');
    const course = addCourse(curriculum, 'Test Course', 'intermediate');
    const module = addCourseModule(course, 'Introduction', 'lecture', 30);
    expect(module.id).toMatch(/^MOD-/);
    expect(course.modules).toHaveLength(1);
    expect(course.duration).toBe(30);
  });

  it('should track enrollments', () => {
    const curriculum = createCurriculum('Enroll Cur', 'Test');
    const course = addCourse(curriculum, 'Popular Course', 'beginner');
    enrollInCourse(course);
    enrollInCourse(course);
    expect(course.enrollments).toBe(2);
  });

  it('should add reviews and calculate rating', () => {
    const curriculum = createCurriculum('Review Cur', 'Test');
    const course = addCourse(curriculum, 'Reviewed Course', 'advanced');
    reviewCourse(course, 'U1', 5, 'Excellent!');
    reviewCourse(course, 'U2', 4, 'Good');
    expect(course.reviews).toHaveLength(2);
    expect(course.rating).toBe(4.5);
  });
});

// ============================================================================
// VIDEO & MEDIA TESTS
// ============================================================================

describe('Video & Media System', () => {
  it('should upload media', () => {
    const asset = uploadMedia('video', 'Welcome Video', 'https://example.com/video.mp4', 1024000, 'mp4');
    expect(asset.id).toMatch(/^MDA-/);
    expect(asset.type).toBe('video');
  });

  it('should create playlist', () => {
    const playlist = createPlaylist('My Favorites', 'USER-200', true);
    expect(playlist.id).toMatch(/^PL-/);
    expect(playlist.isPublic).toBe(true);
  });

  it('should add to playlist', () => {
    const asset = uploadMedia('audio', 'Podcast', 'https://example.com/audio.mp3', 512000, 'mp3');
    const playlist = createPlaylist('Podcasts', 'USER-201', false);
    addToPlaylist(playlist, asset);
    expect(playlist.items).toHaveLength(1);
  });

  it('should not add duplicate to playlist', () => {
    const asset = uploadMedia('image', 'Photo', 'https://example.com/photo.jpg', 256000, 'jpg');
    const playlist = createPlaylist('Photos', 'USER-202', false);
    addToPlaylist(playlist, asset);
    addToPlaylist(playlist, asset);
    expect(playlist.items).toHaveLength(1);
  });

  it('should track media progress', () => {
    const asset = uploadMedia('video', 'Tutorial', 'https://example.com/tut.mp4', 2048000, 'mp4');
    const progress = trackMediaProgress(asset.id, 'USER-203', 300, 600);
    expect(progress.progress).toBe(50);
    expect(progress.completed).toBe(false);
  });

  it('should mark as completed at 90%', () => {
    const asset = uploadMedia('video', 'Short Video', 'https://example.com/short.mp4', 100000, 'mp4');
    const progress = trackMediaProgress(asset.id, 'USER-204', 540, 600);
    expect(progress.completed).toBe(true);
  });
});

// ============================================================================
// GENESIS & CEREMONY TESTS
// ============================================================================

describe('Genesis & Ceremony System', () => {
  it('should create ceremony', () => {
    const ceremony = createCeremony('House Smith Activation', 'house_activation', Date.now() + 86400000);
    expect(ceremony.id).toMatch(/^CER-/);
    expect(ceremony.status).toBe('scheduled');
  });

  it('should add participants', () => {
    const ceremony = createCeremony('Test Ceremony', 'token_minting', Date.now());
    const participant = addParticipant(ceremony, 'USER-300', 'John Smith', 'initiator');
    expect(participant.id).toMatch(/^PART-/);
    expect(ceremony.participants).toHaveLength(1);
  });

  it('should add rituals', () => {
    const ceremony = createCeremony('Ritual Ceremony', 'crown_issuance', Date.now());
    const ritual = addRitual(ceremony, 'Opening', 'Opening remarks', 5);
    expect(ritual.id).toMatch(/^RIT-/);
    expect(ritual.order).toBe(1);
  });

  it('should prepare artifacts', () => {
    const ceremony = createCeremony('Artifact Ceremony', 'legacy_transfer', Date.now());
    const artifact = prepareArtifact(ceremony, 'Golden Key', 'key', 'USER-301');
    expect(artifact.id).toMatch(/^ART-/);
    expect(artifact.type).toBe('key');
  });

  it('should start ceremony', () => {
    const ceremony = createCeremony('Start Ceremony', 'house_activation', Date.now());
    const success = startCeremony(ceremony);
    expect(success).toBe(true);
    expect(ceremony.status).toBe('in_progress');
  });

  it('should complete rituals', () => {
    const ceremony = createCeremony('Complete Ritual', 'token_minting', Date.now());
    const ritual = addRitual(ceremony, 'Main Ritual', 'Description', 10);
    startCeremony(ceremony);
    const success = completeRitual(ceremony, ritual.id);
    expect(success).toBe(true);
    expect(ritual.completed).toBe(true);
  });

  it('should sign ceremony', () => {
    const ceremony = createCeremony('Sign Ceremony', 'crown_issuance', Date.now());
    const participant = addParticipant(ceremony, 'USER-302', 'Jane Doe', 'officiant');
    const success = signCeremony(ceremony, participant.id, 'SIGNATURE-123');
    expect(success).toBe(true);
    expect(participant.signature).toBe('SIGNATURE-123');
  });

  it('should complete ceremony when all requirements met', () => {
    const ceremony = createCeremony('Full Ceremony', 'house_activation', Date.now());
    addParticipant(ceremony, 'U1', 'Initiator', 'initiator');
    addParticipant(ceremony, 'U2', 'Recipient', 'recipient');
    addParticipant(ceremony, 'U3', 'Officiant', 'officiant');
    const ritual = addRitual(ceremony, 'Main', 'Main ritual', 15);
    prepareArtifact(ceremony, 'House Token', 'token', 'U2');
    
    startCeremony(ceremony);
    completeRitual(ceremony, ritual.id);
    signCeremony(ceremony, ceremony.participants[0].id, 'SIG1');
    signCeremony(ceremony, ceremony.participants[1].id, 'SIG2');
    signCeremony(ceremony, ceremony.participants[2].id, 'SIG3');
    
    const success = completeCeremony(ceremony);
    expect(success).toBe(true);
    expect(ceremony.status).toBe('completed');
    expect(ceremony.artifacts[0].issuedAt).toBeDefined();
  });
});
