/**
 * Infrastructure Completion Service
 * Covers remaining categories: Routes/Navigation, Training/Quiz, API/Integration, 
 * Token/Reward, Curriculum/Course, Video/Media, Genesis/Ceremony
 */

// ============================================================================
// ROUTES & NAVIGATION
// ============================================================================

export interface NavigationItem {
  id: string;
  path: string;
  label: string;
  icon?: string;
  parent?: string;
  order: number;
  requiredRole?: 'admin' | 'user' | 'guest';
  badge?: string;
  isActive: boolean;
}

export interface NavigationGroup {
  id: string;
  name: string;
  items: NavigationItem[];
  collapsed: boolean;
}

const navigationRegistry: NavigationItem[] = [];
const navigationGroups: NavigationGroup[] = [];

export function registerRoute(path: string, label: string, options?: Partial<NavigationItem>): NavigationItem {
  const item: NavigationItem = {
    id: `NAV-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    path,
    label,
    order: navigationRegistry.length,
    isActive: true,
    ...options
  };
  navigationRegistry.push(item);
  return item;
}

export function createNavigationGroup(name: string, items: NavigationItem[]): NavigationGroup {
  const group: NavigationGroup = {
    id: `NAVGRP-${Date.now().toString(36)}`,
    name,
    items,
    collapsed: false
  };
  navigationGroups.push(group);
  return group;
}

export function getNavigationTree(): NavigationGroup[] {
  return navigationGroups;
}

export function getBreadcrumbs(path: string): NavigationItem[] {
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs: NavigationItem[] = [];
  let currentPath = '';
  
  for (const part of parts) {
    currentPath += `/${part}`;
    const item = navigationRegistry.find(n => n.path === currentPath);
    if (item) breadcrumbs.push(item);
  }
  
  return breadcrumbs;
}

// ============================================================================
// TRAINING & QUIZ SYSTEM
// ============================================================================

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  lessons: Lesson[];
  quiz?: Quiz;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  completionCriteria: {
    lessonsRequired: number;
    quizPassScore: number;
  };
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'video' | 'text' | 'interactive' | 'document';
  duration: number;
  resources: string[];
  completed: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  timeLimit: number;
  passingScore: number;
  attempts: number;
  maxAttempts: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'matching';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation: string;
}

export interface TrainingProgress {
  moduleId: string;
  userId: string;
  lessonsCompleted: string[];
  quizScores: number[];
  startedAt: number;
  completedAt?: number;
  certificateId?: string;
}

const trainingModules: TrainingModule[] = [];
const trainingProgress: TrainingProgress[] = [];

export function createTrainingModule(
  title: string,
  category: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): TrainingModule {
  const module: TrainingModule = {
    id: `TRN-${Date.now().toString(36).toUpperCase()}`,
    title,
    description: '',
    category,
    lessons: [],
    duration: 0,
    difficulty,
    prerequisites: [],
    completionCriteria: {
      lessonsRequired: 0,
      quizPassScore: 70
    }
  };
  trainingModules.push(module);
  return module;
}

export function addLesson(module: TrainingModule, lesson: Omit<Lesson, 'id' | 'completed'>): Lesson {
  const newLesson: Lesson = {
    ...lesson,
    id: `LSN-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    completed: false
  };
  module.lessons.push(newLesson);
  module.duration += lesson.duration;
  module.completionCriteria.lessonsRequired = module.lessons.length;
  return newLesson;
}

export function createQuiz(module: TrainingModule, title: string, timeLimit: number): Quiz {
  const quiz: Quiz = {
    id: `QUIZ-${Date.now().toString(36)}`,
    title,
    questions: [],
    timeLimit,
    passingScore: 70,
    attempts: 0,
    maxAttempts: 3
  };
  module.quiz = quiz;
  return quiz;
}

export function addQuizQuestion(quiz: Quiz, question: Omit<QuizQuestion, 'id'>): QuizQuestion {
  const newQuestion: QuizQuestion = {
    ...question,
    id: `QQ-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`
  };
  quiz.questions.push(newQuestion);
  return newQuestion;
}

export function startTraining(moduleId: string, userId: string): TrainingProgress {
  const progress: TrainingProgress = {
    moduleId,
    userId,
    lessonsCompleted: [],
    quizScores: [],
    startedAt: Date.now()
  };
  trainingProgress.push(progress);
  return progress;
}

export function completeLesson(progress: TrainingProgress, lessonId: string): void {
  if (!progress.lessonsCompleted.includes(lessonId)) {
    progress.lessonsCompleted.push(lessonId);
  }
}

export function submitQuiz(progress: TrainingProgress, answers: Record<string, string>): number {
  const module = trainingModules.find(m => m.id === progress.moduleId);
  if (!module?.quiz) return 0;

  let score = 0;
  let totalPoints = 0;

  for (const question of module.quiz.questions) {
    totalPoints += question.points;
    const answer = answers[question.id];
    if (Array.isArray(question.correctAnswer)) {
      if (question.correctAnswer.includes(answer)) score += question.points;
    } else if (answer === question.correctAnswer) {
      score += question.points;
    }
  }

  const percentage = Math.round((score / totalPoints) * 100);
  progress.quizScores.push(percentage);
  module.quiz.attempts++;

  return percentage;
}

// ============================================================================
// API & INTEGRATION
// ============================================================================

export interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters: APIParameter[];
  responses: APIResponse[];
  rateLimit: number;
  authRequired: boolean;
}

export interface APIParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  example?: string;
}

export interface APIResponse {
  status: number;
  description: string;
  schema?: object;
}

export interface Integration {
  id: string;
  name: string;
  type: 'webhook' | 'oauth' | 'api_key' | 'custom';
  status: 'active' | 'inactive' | 'error';
  config: Record<string, string>;
  lastSync?: number;
  errorCount: number;
  events: IntegrationEvent[];
}

export interface IntegrationEvent {
  id: string;
  type: 'sync' | 'error' | 'webhook' | 'auth';
  message: string;
  timestamp: number;
  data?: object;
}

const apiEndpoints: APIEndpoint[] = [];
const integrations: Integration[] = [];

export function registerAPIEndpoint(endpoint: Omit<APIEndpoint, 'id'>): APIEndpoint {
  const newEndpoint: APIEndpoint = {
    ...endpoint,
    id: `API-${Date.now().toString(36)}`
  };
  apiEndpoints.push(newEndpoint);
  return newEndpoint;
}

export function createIntegration(name: string, type: Integration['type'], config: Record<string, string>): Integration {
  const integration: Integration = {
    id: `INT-${Date.now().toString(36)}`,
    name,
    type,
    status: 'inactive',
    config,
    errorCount: 0,
    events: []
  };
  integrations.push(integration);
  return integration;
}

export function activateIntegration(integration: Integration): void {
  integration.status = 'active';
  integration.lastSync = Date.now();
  integration.events.push({
    id: `EVT-${Date.now().toString(36)}`,
    type: 'sync',
    message: 'Integration activated',
    timestamp: Date.now()
  });
}

export function recordIntegrationEvent(integration: Integration, type: IntegrationEvent['type'], message: string, data?: object): void {
  integration.events.push({
    id: `EVT-${Date.now().toString(36)}`,
    type,
    message,
    timestamp: Date.now(),
    data
  });
  
  if (type === 'error') {
    integration.errorCount++;
    if (integration.errorCount >= 3) {
      integration.status = 'error';
    }
  }
}

// ============================================================================
// TOKEN & REWARD SYSTEM
// ============================================================================

export interface TokenAccount {
  id: string;
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  transactions: TokenTransaction[];
}

export interface TokenTransaction {
  id: string;
  type: 'earn' | 'spend' | 'transfer' | 'bonus' | 'penalty';
  amount: number;
  description: string;
  source: string;
  timestamp: number;
  metadata?: object;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'digital' | 'physical' | 'experience' | 'privilege';
  available: boolean;
  stock?: number;
  redemptions: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  criteria: string;
  unlockedBy: string[];
}

const tokenAccounts: TokenAccount[] = [];
const rewards: Reward[] = [];
const achievements: Achievement[] = [];

export function createTokenAccount(userId: string): TokenAccount {
  const account: TokenAccount = {
    id: `TKNA-${Date.now().toString(36)}`,
    userId,
    balance: 0,
    lifetimeEarned: 0,
    lifetimeSpent: 0,
    transactions: []
  };
  tokenAccounts.push(account);
  return account;
}

export function earnTokens(account: TokenAccount, amount: number, source: string, description: string): TokenTransaction {
  const transaction: TokenTransaction = {
    id: `TXN-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    type: 'earn',
    amount,
    description,
    source,
    timestamp: Date.now()
  };
  account.balance += amount;
  account.lifetimeEarned += amount;
  account.transactions.push(transaction);
  return transaction;
}

export function spendTokens(account: TokenAccount, amount: number, description: string): TokenTransaction | null {
  if (account.balance < amount) return null;
  
  const transaction: TokenTransaction = {
    id: `TXN-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    type: 'spend',
    amount: -amount,
    description,
    source: 'redemption',
    timestamp: Date.now()
  };
  account.balance -= amount;
  account.lifetimeSpent += amount;
  account.transactions.push(transaction);
  return transaction;
}

export function createReward(name: string, cost: number, category: Reward['category']): Reward {
  const reward: Reward = {
    id: `RWD-${Date.now().toString(36)}`,
    name,
    description: '',
    cost,
    category,
    available: true,
    redemptions: 0
  };
  rewards.push(reward);
  return reward;
}

export function redeemReward(account: TokenAccount, rewardId: string): boolean {
  const reward = rewards.find(r => r.id === rewardId);
  if (!reward || !reward.available) return false;
  if (reward.stock !== undefined && reward.stock <= 0) return false;
  
  const transaction = spendTokens(account, reward.cost, `Redeemed: ${reward.name}`);
  if (!transaction) return false;
  
  reward.redemptions++;
  if (reward.stock !== undefined) reward.stock--;
  return true;
}

export function createAchievement(name: string, category: string, points: number, rarity: Achievement['rarity']): Achievement {
  const achievement: Achievement = {
    id: `ACH-${Date.now().toString(36)}`,
    name,
    description: '',
    category,
    points,
    rarity,
    criteria: '',
    unlockedBy: []
  };
  achievements.push(achievement);
  return achievement;
}

export function unlockAchievement(userId: string, achievementId: string): boolean {
  const achievement = achievements.find(a => a.id === achievementId);
  if (!achievement || achievement.unlockedBy.includes(userId)) return false;
  
  achievement.unlockedBy.push(userId);
  
  // Award tokens
  const account = tokenAccounts.find(a => a.userId === userId);
  if (account) {
    earnTokens(account, achievement.points, 'achievement', `Unlocked: ${achievement.name}`);
  }
  
  return true;
}

// ============================================================================
// CURRICULUM & COURSE SYSTEM
// ============================================================================

export interface Curriculum {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  courses: Course[];
  totalDuration: number;
  certification?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
  instructor?: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  enrollments: number;
  rating: number;
  reviews: CourseReview[];
}

export interface CourseModule {
  id: string;
  title: string;
  content: string;
  order: number;
  type: 'lecture' | 'exercise' | 'project' | 'assessment';
  duration: number;
}

export interface CourseReview {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  timestamp: number;
}

const curricula: Curriculum[] = [];

export function createCurriculum(name: string, targetAudience: string): Curriculum {
  const curriculum: Curriculum = {
    id: `CUR-${Date.now().toString(36)}`,
    name,
    description: '',
    targetAudience,
    courses: [],
    totalDuration: 0
  };
  curricula.push(curriculum);
  return curriculum;
}

export function addCourse(curriculum: Curriculum, title: string, level: Course['level']): Course {
  const course: Course = {
    id: `CRS-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    title,
    description: '',
    modules: [],
    duration: 0,
    level,
    enrollments: 0,
    rating: 0,
    reviews: []
  };
  curriculum.courses.push(course);
  return course;
}

export function addCourseModule(course: Course, title: string, type: CourseModule['type'], duration: number): CourseModule {
  const module: CourseModule = {
    id: `MOD-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    title,
    content: '',
    order: course.modules.length + 1,
    type,
    duration
  };
  course.modules.push(module);
  course.duration += duration;
  return module;
}

export function enrollInCourse(course: Course): void {
  course.enrollments++;
}

export function reviewCourse(course: Course, userId: string, rating: number, comment: string): CourseReview {
  const review: CourseReview = {
    id: `REV-${Date.now().toString(36)}`,
    userId,
    rating,
    comment,
    timestamp: Date.now()
  };
  course.reviews.push(review);
  
  // Update average rating
  const totalRating = course.reviews.reduce((sum, r) => sum + r.rating, 0);
  course.rating = Math.round((totalRating / course.reviews.length) * 10) / 10;
  
  return review;
}

// ============================================================================
// VIDEO & MEDIA SYSTEM
// ============================================================================

export interface MediaAsset {
  id: string;
  type: 'video' | 'audio' | 'image' | 'document';
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  size: number;
  format: string;
  tags: string[];
  views: number;
  createdAt: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  items: MediaAsset[];
  isPublic: boolean;
  createdBy: string;
}

export interface MediaProgress {
  assetId: string;
  userId: string;
  progress: number; // percentage
  lastPosition: number; // seconds
  completed: boolean;
  watchedAt: number;
}

const mediaAssets: MediaAsset[] = [];
const playlists: Playlist[] = [];
const mediaProgress: MediaProgress[] = [];

export function uploadMedia(
  type: MediaAsset['type'],
  title: string,
  url: string,
  size: number,
  format: string
): MediaAsset {
  const asset: MediaAsset = {
    id: `MDA-${Date.now().toString(36)}`,
    type,
    title,
    description: '',
    url,
    size,
    format,
    tags: [],
    views: 0,
    createdAt: Date.now()
  };
  mediaAssets.push(asset);
  return asset;
}

export function createPlaylist(name: string, createdBy: string, isPublic: boolean = false): Playlist {
  const playlist: Playlist = {
    id: `PL-${Date.now().toString(36)}`,
    name,
    description: '',
    items: [],
    isPublic,
    createdBy
  };
  playlists.push(playlist);
  return playlist;
}

export function addToPlaylist(playlist: Playlist, asset: MediaAsset): void {
  if (!playlist.items.find(i => i.id === asset.id)) {
    playlist.items.push(asset);
  }
}

export function trackMediaProgress(assetId: string, userId: string, position: number, duration: number): MediaProgress {
  let progress = mediaProgress.find(p => p.assetId === assetId && p.userId === userId);
  
  if (!progress) {
    progress = {
      assetId,
      userId,
      progress: 0,
      lastPosition: 0,
      completed: false,
      watchedAt: Date.now()
    };
    mediaProgress.push(progress);
  }
  
  progress.lastPosition = position;
  progress.progress = Math.round((position / duration) * 100);
  progress.completed = progress.progress >= 90;
  progress.watchedAt = Date.now();
  
  // Increment views if first time
  const asset = mediaAssets.find(a => a.id === assetId);
  if (asset && progress.progress === 0) {
    asset.views++;
  }
  
  return progress;
}

// ============================================================================
// GENESIS & CEREMONY SYSTEM
// ============================================================================

export interface GenesisCeremony {
  id: string;
  name: string;
  type: 'house_activation' | 'token_minting' | 'crown_issuance' | 'legacy_transfer';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt: number;
  startedAt?: number;
  completedAt?: number;
  participants: CeremonyParticipant[];
  rituals: Ritual[];
  artifacts: Artifact[];
  witnesses: string[];
}

export interface CeremonyParticipant {
  id: string;
  userId: string;
  name: string;
  role: 'initiator' | 'recipient' | 'witness' | 'officiant';
  signature?: string;
  signedAt?: number;
}

export interface Ritual {
  id: string;
  name: string;
  description: string;
  order: number;
  duration: number;
  completed: boolean;
  completedAt?: number;
}

export interface Artifact {
  id: string;
  name: string;
  type: 'token' | 'scroll' | 'crown' | 'key' | 'seal';
  description: string;
  recipient: string;
  issuedAt?: number;
  metadata: Record<string, string>;
}

const ceremonies: GenesisCeremony[] = [];

export function createCeremony(
  name: string,
  type: GenesisCeremony['type'],
  scheduledAt: number
): GenesisCeremony {
  const ceremony: GenesisCeremony = {
    id: `CER-${Date.now().toString(36)}`,
    name,
    type,
    status: 'scheduled',
    scheduledAt,
    participants: [],
    rituals: [],
    artifacts: [],
    witnesses: []
  };
  ceremonies.push(ceremony);
  return ceremony;
}

export function addParticipant(
  ceremony: GenesisCeremony,
  userId: string,
  name: string,
  role: CeremonyParticipant['role']
): CeremonyParticipant {
  const participant: CeremonyParticipant = {
    id: `PART-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    userId,
    name,
    role
  };
  ceremony.participants.push(participant);
  return participant;
}

export function addRitual(ceremony: GenesisCeremony, name: string, description: string, duration: number): Ritual {
  const ritual: Ritual = {
    id: `RIT-${Date.now().toString(36)}`,
    name,
    description,
    order: ceremony.rituals.length + 1,
    duration,
    completed: false
  };
  ceremony.rituals.push(ritual);
  return ritual;
}

export function prepareArtifact(
  ceremony: GenesisCeremony,
  name: string,
  type: Artifact['type'],
  recipient: string
): Artifact {
  const artifact: Artifact = {
    id: `ART-${Date.now().toString(36)}`,
    name,
    type,
    description: '',
    recipient,
    metadata: {}
  };
  ceremony.artifacts.push(artifact);
  return artifact;
}

export function startCeremony(ceremony: GenesisCeremony): boolean {
  if (ceremony.status !== 'scheduled') return false;
  ceremony.status = 'in_progress';
  ceremony.startedAt = Date.now();
  return true;
}

export function completeRitual(ceremony: GenesisCeremony, ritualId: string): boolean {
  const ritual = ceremony.rituals.find(r => r.id === ritualId);
  if (!ritual || ritual.completed) return false;
  
  ritual.completed = true;
  ritual.completedAt = Date.now();
  return true;
}

export function signCeremony(ceremony: GenesisCeremony, participantId: string, signature: string): boolean {
  const participant = ceremony.participants.find(p => p.id === participantId);
  if (!participant || participant.signature) return false;
  
  participant.signature = signature;
  participant.signedAt = Date.now();
  return true;
}

export function completeCeremony(ceremony: GenesisCeremony): boolean {
  if (ceremony.status !== 'in_progress') return false;
  
  // Check all rituals completed
  if (!ceremony.rituals.every(r => r.completed)) return false;
  
  // Check all participants signed
  const requiredSigners = ceremony.participants.filter(p => 
    p.role === 'initiator' || p.role === 'recipient' || p.role === 'officiant'
  );
  if (!requiredSigners.every(p => p.signature)) return false;
  
  // Issue artifacts
  ceremony.artifacts.forEach(a => {
    a.issuedAt = Date.now();
  });
  
  ceremony.status = 'completed';
  ceremony.completedAt = Date.now();
  return true;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const infrastructureService = {
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
};

export default infrastructureService;
