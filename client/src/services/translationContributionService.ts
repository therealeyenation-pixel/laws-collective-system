// Translation Contribution Service
// Community-driven translation management and contribution system

import { SupportedLanguage } from './i18nService';

export interface TranslationSuggestion {
  id: string;
  key: string;
  namespace: string;
  sourceText: string;
  suggestedText: string;
  language: SupportedLanguage;
  contributorId: string;
  contributorName: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  reviewerId?: string;
  reviewerComment?: string;
  createdAt: Date;
  updatedAt: Date;
  votes: number;
  voterIds: string[];
}

export interface TranslationContributor {
  id: string;
  name: string;
  email?: string;
  languages: SupportedLanguage[];
  contributionCount: number;
  approvedCount: number;
  rejectedCount: number;
  score: number;
  rank: 'beginner' | 'contributor' | 'expert' | 'master';
  joinedAt: Date;
  lastActiveAt: Date;
  badges: ContributorBadge[];
}

export interface ContributorBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface LanguageProgress {
  language: SupportedLanguage;
  totalKeys: number;
  translatedKeys: number;
  approvedKeys: number;
  pendingKeys: number;
  percentage: number;
  lastUpdated: Date;
  topContributors: { id: string; name: string; count: number }[];
}

export interface TranslationKey {
  key: string;
  namespace: string;
  sourceText: string;
  description?: string;
  context?: string;
  maxLength?: number;
  translations: Record<SupportedLanguage, {
    text: string;
    status: 'missing' | 'pending' | 'approved';
    lastUpdated?: Date;
  }>;
}

class TranslationContributionService {
  private readonly SUGGESTIONS_KEY = 'translation_suggestions';
  private readonly CONTRIBUTORS_KEY = 'translation_contributors';
  private readonly PROGRESS_KEY = 'translation_progress';

  // Get all translation keys that need translation
  getTranslationKeys(): TranslationKey[] {
    // Base keys from the application
    return [
      // Common namespace
      { key: 'save', namespace: 'common', sourceText: 'Save', description: 'Save button text', translations: this.getKeyTranslations('common.save') },
      { key: 'cancel', namespace: 'common', sourceText: 'Cancel', description: 'Cancel button text', translations: this.getKeyTranslations('common.cancel') },
      { key: 'delete', namespace: 'common', sourceText: 'Delete', description: 'Delete button text', translations: this.getKeyTranslations('common.delete') },
      { key: 'edit', namespace: 'common', sourceText: 'Edit', description: 'Edit button text', translations: this.getKeyTranslations('common.edit') },
      { key: 'create', namespace: 'common', sourceText: 'Create', description: 'Create button text', translations: this.getKeyTranslations('common.create') },
      { key: 'search', namespace: 'common', sourceText: 'Search', description: 'Search placeholder/button', translations: this.getKeyTranslations('common.search') },
      { key: 'filter', namespace: 'common', sourceText: 'Filter', description: 'Filter button text', translations: this.getKeyTranslations('common.filter') },
      { key: 'export', namespace: 'common', sourceText: 'Export', description: 'Export button text', translations: this.getKeyTranslations('common.export') },
      { key: 'import', namespace: 'common', sourceText: 'Import', description: 'Import button text', translations: this.getKeyTranslations('common.import') },
      { key: 'loading', namespace: 'common', sourceText: 'Loading...', description: 'Loading state text', translations: this.getKeyTranslations('common.loading') },
      { key: 'noData', namespace: 'common', sourceText: 'No data available', description: 'Empty state message', translations: this.getKeyTranslations('common.noData') },
      { key: 'confirm', namespace: 'common', sourceText: 'Confirm', description: 'Confirm button text', translations: this.getKeyTranslations('common.confirm') },
      { key: 'back', namespace: 'common', sourceText: 'Back', description: 'Back navigation button', translations: this.getKeyTranslations('common.back') },
      { key: 'next', namespace: 'common', sourceText: 'Next', description: 'Next navigation button', translations: this.getKeyTranslations('common.next') },
      { key: 'submit', namespace: 'common', sourceText: 'Submit', description: 'Submit form button', translations: this.getKeyTranslations('common.submit') },
      { key: 'settings', namespace: 'common', sourceText: 'Settings', description: 'Settings menu item', translations: this.getKeyTranslations('common.settings') },
      { key: 'help', namespace: 'common', sourceText: 'Help', description: 'Help menu item', translations: this.getKeyTranslations('common.help') },
      { key: 'logout', namespace: 'common', sourceText: 'Logout', description: 'Logout button text', translations: this.getKeyTranslations('common.logout') },
      
      // Navigation namespace
      { key: 'home', namespace: 'navigation', sourceText: 'Home', description: 'Home page link', translations: this.getKeyTranslations('navigation.home') },
      { key: 'dashboard', namespace: 'navigation', sourceText: 'Dashboard', description: 'Dashboard page link', translations: this.getKeyTranslations('navigation.dashboard') },
      { key: 'tasks', namespace: 'navigation', sourceText: 'Tasks', description: 'Tasks page link', translations: this.getKeyTranslations('navigation.tasks') },
      { key: 'documents', namespace: 'navigation', sourceText: 'Documents', description: 'Documents page link', translations: this.getKeyTranslations('navigation.documents') },
      { key: 'reports', namespace: 'navigation', sourceText: 'Reports', description: 'Reports page link', translations: this.getKeyTranslations('navigation.reports') },
      { key: 'profile', namespace: 'navigation', sourceText: 'Profile', description: 'Profile page link', translations: this.getKeyTranslations('navigation.profile') },
      { key: 'notifications', namespace: 'navigation', sourceText: 'Notifications', description: 'Notifications page link', translations: this.getKeyTranslations('navigation.notifications') },
      
      // Dashboard namespace
      { key: 'welcome', namespace: 'dashboard', sourceText: 'Welcome back', description: 'Dashboard greeting', translations: this.getKeyTranslations('dashboard.welcome') },
      { key: 'overview', namespace: 'dashboard', sourceText: 'Overview', description: 'Overview section title', translations: this.getKeyTranslations('dashboard.overview') },
      { key: 'recentActivity', namespace: 'dashboard', sourceText: 'Recent Activity', description: 'Activity section title', translations: this.getKeyTranslations('dashboard.recentActivity') },
      { key: 'quickActions', namespace: 'dashboard', sourceText: 'Quick Actions', description: 'Quick actions section', translations: this.getKeyTranslations('dashboard.quickActions') },
      { key: 'statistics', namespace: 'dashboard', sourceText: 'Statistics', description: 'Statistics section', translations: this.getKeyTranslations('dashboard.statistics') },
      { key: 'pendingTasks', namespace: 'dashboard', sourceText: 'Pending Tasks', description: 'Pending tasks count', translations: this.getKeyTranslations('dashboard.pendingTasks') },
      { key: 'completedTasks', namespace: 'dashboard', sourceText: 'Completed Tasks', description: 'Completed tasks count', translations: this.getKeyTranslations('dashboard.completedTasks') },
      { key: 'systemHealth', namespace: 'dashboard', sourceText: 'System Health', description: 'System health status', translations: this.getKeyTranslations('dashboard.systemHealth') },
      
      // Auth namespace
      { key: 'login', namespace: 'auth', sourceText: 'Login', description: 'Login button/page title', translations: this.getKeyTranslations('auth.login') },
      { key: 'register', namespace: 'auth', sourceText: 'Register', description: 'Register button/page title', translations: this.getKeyTranslations('auth.register') },
      { key: 'forgotPassword', namespace: 'auth', sourceText: 'Forgot Password', description: 'Forgot password link', translations: this.getKeyTranslations('auth.forgotPassword') },
      { key: 'email', namespace: 'auth', sourceText: 'Email', description: 'Email field label', translations: this.getKeyTranslations('auth.email') },
      { key: 'password', namespace: 'auth', sourceText: 'Password', description: 'Password field label', translations: this.getKeyTranslations('auth.password') },
      { key: 'rememberMe', namespace: 'auth', sourceText: 'Remember Me', description: 'Remember me checkbox', translations: this.getKeyTranslations('auth.rememberMe') },
      { key: 'twoFactorAuth', namespace: 'auth', sourceText: 'Two-Factor Authentication', description: '2FA title', translations: this.getKeyTranslations('auth.twoFactorAuth') },
      
      // Errors namespace
      { key: 'generic', namespace: 'errors', sourceText: 'An error occurred', description: 'Generic error message', translations: this.getKeyTranslations('errors.generic') },
      { key: 'notFound', namespace: 'errors', sourceText: 'Not found', description: '404 error message', translations: this.getKeyTranslations('errors.notFound') },
      { key: 'unauthorized', namespace: 'errors', sourceText: 'Unauthorized', description: '401 error message', translations: this.getKeyTranslations('errors.unauthorized') },
      { key: 'forbidden', namespace: 'errors', sourceText: 'Access denied', description: '403 error message', translations: this.getKeyTranslations('errors.forbidden') },
      { key: 'serverError', namespace: 'errors', sourceText: 'Server error', description: '500 error message', translations: this.getKeyTranslations('errors.serverError') },
      { key: 'networkError', namespace: 'errors', sourceText: 'Network error', description: 'Network error message', translations: this.getKeyTranslations('errors.networkError') },
      
      // Forms namespace
      { key: 'required', namespace: 'forms', sourceText: 'This field is required', description: 'Required field error', translations: this.getKeyTranslations('forms.required') },
      { key: 'invalidEmail', namespace: 'forms', sourceText: 'Invalid email address', description: 'Invalid email error', translations: this.getKeyTranslations('forms.invalidEmail') },
      { key: 'invalidPhone', namespace: 'forms', sourceText: 'Invalid phone number', description: 'Invalid phone error', translations: this.getKeyTranslations('forms.invalidPhone') },
      { key: 'passwordMismatch', namespace: 'forms', sourceText: 'Passwords do not match', description: 'Password mismatch error', translations: this.getKeyTranslations('forms.passwordMismatch') },
      
      // Notifications namespace
      { key: 'success', namespace: 'notifications', sourceText: 'Success', description: 'Success notification title', translations: this.getKeyTranslations('notifications.success') },
      { key: 'error', namespace: 'notifications', sourceText: 'Error', description: 'Error notification title', translations: this.getKeyTranslations('notifications.error') },
      { key: 'warning', namespace: 'notifications', sourceText: 'Warning', description: 'Warning notification title', translations: this.getKeyTranslations('notifications.warning') },
      { key: 'info', namespace: 'notifications', sourceText: 'Information', description: 'Info notification title', translations: this.getKeyTranslations('notifications.info') },
      { key: 'taskAssigned', namespace: 'notifications', sourceText: 'New task assigned', description: 'Task assignment notification', translations: this.getKeyTranslations('notifications.taskAssigned') },
      { key: 'taskCompleted', namespace: 'notifications', sourceText: 'Task completed', description: 'Task completion notification', translations: this.getKeyTranslations('notifications.taskCompleted') }
    ];
  }

  private getKeyTranslations(fullKey: string): Record<SupportedLanguage, { text: string; status: 'missing' | 'pending' | 'approved'; lastUpdated?: Date }> {
    const suggestions = this.getSuggestions();
    const [namespace, key] = fullKey.split('.');
    
    const languages: SupportedLanguage[] = ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi'];
    const result: Record<string, { text: string; status: 'missing' | 'pending' | 'approved'; lastUpdated?: Date }> = {};
    
    languages.forEach(lang => {
      const suggestion = suggestions.find(s => 
        s.key === key && 
        s.namespace === namespace && 
        s.language === lang &&
        s.status === 'approved'
      );
      
      const pendingSuggestion = suggestions.find(s =>
        s.key === key &&
        s.namespace === namespace &&
        s.language === lang &&
        s.status === 'pending'
      );
      
      if (suggestion) {
        result[lang] = {
          text: suggestion.suggestedText,
          status: 'approved',
          lastUpdated: suggestion.updatedAt
        };
      } else if (pendingSuggestion) {
        result[lang] = {
          text: pendingSuggestion.suggestedText,
          status: 'pending',
          lastUpdated: pendingSuggestion.updatedAt
        };
      } else if (lang === 'en') {
        result[lang] = { text: '', status: 'approved' }; // English is source
      } else {
        result[lang] = { text: '', status: 'missing' };
      }
    });
    
    return result as Record<SupportedLanguage, { text: string; status: 'missing' | 'pending' | 'approved'; lastUpdated?: Date }>;
  }

  // Submit a translation suggestion
  submitSuggestion(
    key: string,
    namespace: string,
    sourceText: string,
    suggestedText: string,
    language: SupportedLanguage,
    contributorId: string,
    contributorName: string
  ): TranslationSuggestion {
    const suggestions = this.getSuggestions();
    
    const suggestion: TranslationSuggestion = {
      id: `sug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      key,
      namespace,
      sourceText,
      suggestedText,
      language,
      contributorId,
      contributorName,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: 0,
      voterIds: []
    };
    
    suggestions.push(suggestion);
    this.saveSuggestions(suggestions);
    
    // Update contributor stats
    this.updateContributorStats(contributorId, contributorName, language);
    
    return suggestion;
  }

  // Get all suggestions
  getSuggestions(): TranslationSuggestion[] {
    const stored = localStorage.getItem(this.SUGGESTIONS_KEY);
    if (!stored) return this.getDefaultSuggestions();
    return JSON.parse(stored).map((s: any) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt)
    }));
  }

  // Get suggestions by language
  getSuggestionsByLanguage(language: SupportedLanguage): TranslationSuggestion[] {
    return this.getSuggestions().filter(s => s.language === language);
  }

  // Get pending suggestions
  getPendingSuggestions(): TranslationSuggestion[] {
    return this.getSuggestions().filter(s => s.status === 'pending');
  }

  // Review a suggestion
  reviewSuggestion(
    suggestionId: string,
    status: 'approved' | 'rejected' | 'needs_review',
    reviewerId: string,
    comment?: string
  ): boolean {
    const suggestions = this.getSuggestions();
    const index = suggestions.findIndex(s => s.id === suggestionId);
    
    if (index === -1) return false;
    
    suggestions[index].status = status;
    suggestions[index].reviewerId = reviewerId;
    suggestions[index].reviewerComment = comment;
    suggestions[index].updatedAt = new Date();
    
    this.saveSuggestions(suggestions);
    
    // Update contributor stats
    const suggestion = suggestions[index];
    this.updateContributorReviewStats(suggestion.contributorId, status);
    
    return true;
  }

  // Vote on a suggestion
  voteSuggestion(suggestionId: string, voterId: string, upvote: boolean): boolean {
    const suggestions = this.getSuggestions();
    const suggestion = suggestions.find(s => s.id === suggestionId);
    
    if (!suggestion) return false;
    
    if (suggestion.voterIds.includes(voterId)) {
      // Remove vote
      suggestion.voterIds = suggestion.voterIds.filter(id => id !== voterId);
      suggestion.votes = upvote ? suggestion.votes - 1 : suggestion.votes + 1;
    } else {
      // Add vote
      suggestion.voterIds.push(voterId);
      suggestion.votes = upvote ? suggestion.votes + 1 : suggestion.votes - 1;
    }
    
    this.saveSuggestions(suggestions);
    return true;
  }

  // Get contributors
  getContributors(): TranslationContributor[] {
    const stored = localStorage.getItem(this.CONTRIBUTORS_KEY);
    if (!stored) return this.getDefaultContributors();
    return JSON.parse(stored).map((c: any) => ({
      ...c,
      joinedAt: new Date(c.joinedAt),
      lastActiveAt: new Date(c.lastActiveAt),
      badges: c.badges.map((b: any) => ({
        ...b,
        earnedAt: new Date(b.earnedAt)
      }))
    }));
  }

  // Get contributor by ID
  getContributor(id: string): TranslationContributor | null {
    return this.getContributors().find(c => c.id === id) || null;
  }

  // Get leaderboard
  getLeaderboard(limit: number = 10): TranslationContributor[] {
    return this.getContributors()
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Get language progress
  getLanguageProgress(): LanguageProgress[] {
    const keys = this.getTranslationKeys();
    const totalKeys = keys.length;
    const suggestions = this.getSuggestions();
    const contributors = this.getContributors();
    
    const languages: SupportedLanguage[] = ['es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi'];
    
    return languages.map(lang => {
      const langSuggestions = suggestions.filter(s => s.language === lang);
      const approvedKeys = langSuggestions.filter(s => s.status === 'approved').length;
      const pendingKeys = langSuggestions.filter(s => s.status === 'pending').length;
      
      // Get top contributors for this language
      const contributorCounts = langSuggestions.reduce((acc, s) => {
        acc[s.contributorId] = (acc[s.contributorId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topContributors = Object.entries(contributorCounts)
        .map(([id, count]) => ({
          id,
          name: contributors.find(c => c.id === id)?.name || 'Unknown',
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      
      return {
        language: lang,
        totalKeys,
        translatedKeys: approvedKeys + pendingKeys,
        approvedKeys,
        pendingKeys,
        percentage: Math.round((approvedKeys / totalKeys) * 100),
        lastUpdated: new Date(),
        topContributors
      };
    });
  }

  // Get statistics
  getStats(): {
    totalSuggestions: number;
    pendingSuggestions: number;
    approvedSuggestions: number;
    totalContributors: number;
    activeContributors: number;
    languagesCovered: number;
    averageApprovalRate: number;
  } {
    const suggestions = this.getSuggestions();
    const contributors = this.getContributors();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeContributors = contributors.filter(c => 
      c.lastActiveAt >= thirtyDaysAgo
    ).length;
    
    const approvedCount = suggestions.filter(s => s.status === 'approved').length;
    const reviewedCount = suggestions.filter(s => 
      s.status === 'approved' || s.status === 'rejected'
    ).length;
    
    return {
      totalSuggestions: suggestions.length,
      pendingSuggestions: suggestions.filter(s => s.status === 'pending').length,
      approvedSuggestions: approvedCount,
      totalContributors: contributors.length,
      activeContributors,
      languagesCovered: 9, // All supported languages except English
      averageApprovalRate: reviewedCount > 0 ? Math.round((approvedCount / reviewedCount) * 100) : 0
    };
  }

  // Private helper methods
  private saveSuggestions(suggestions: TranslationSuggestion[]): void {
    localStorage.setItem(this.SUGGESTIONS_KEY, JSON.stringify(suggestions));
  }

  private updateContributorStats(contributorId: string, contributorName: string, language: SupportedLanguage): void {
    const contributors = this.getContributors();
    let contributor = contributors.find(c => c.id === contributorId);
    
    if (!contributor) {
      contributor = {
        id: contributorId,
        name: contributorName,
        languages: [language],
        contributionCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        score: 0,
        rank: 'beginner',
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        badges: []
      };
      contributors.push(contributor);
    }
    
    contributor.contributionCount++;
    contributor.lastActiveAt = new Date();
    if (!contributor.languages.includes(language)) {
      contributor.languages.push(language);
    }
    
    // Update rank based on contribution count
    if (contributor.approvedCount >= 100) {
      contributor.rank = 'master';
    } else if (contributor.approvedCount >= 50) {
      contributor.rank = 'expert';
    } else if (contributor.approvedCount >= 10) {
      contributor.rank = 'contributor';
    }
    
    localStorage.setItem(this.CONTRIBUTORS_KEY, JSON.stringify(contributors));
  }

  private updateContributorReviewStats(contributorId: string, status: string): void {
    const contributors = this.getContributors();
    const contributor = contributors.find(c => c.id === contributorId);
    
    if (!contributor) return;
    
    if (status === 'approved') {
      contributor.approvedCount++;
      contributor.score += 10;
      
      // Check for badges
      if (contributor.approvedCount === 10 && !contributor.badges.some(b => b.id === 'first_10')) {
        contributor.badges.push({
          id: 'first_10',
          name: 'Rising Star',
          description: '10 approved translations',
          icon: 'star',
          earnedAt: new Date()
        });
      }
      if (contributor.approvedCount === 50 && !contributor.badges.some(b => b.id === 'first_50')) {
        contributor.badges.push({
          id: 'first_50',
          name: 'Translation Expert',
          description: '50 approved translations',
          icon: 'award',
          earnedAt: new Date()
        });
      }
    } else if (status === 'rejected') {
      contributor.rejectedCount++;
      contributor.score = Math.max(0, contributor.score - 2);
    }
    
    // Update rank
    if (contributor.approvedCount >= 100) {
      contributor.rank = 'master';
    } else if (contributor.approvedCount >= 50) {
      contributor.rank = 'expert';
    } else if (contributor.approvedCount >= 10) {
      contributor.rank = 'contributor';
    }
    
    localStorage.setItem(this.CONTRIBUTORS_KEY, JSON.stringify(contributors));
  }

  private getDefaultSuggestions(): TranslationSuggestion[] {
    // Some default approved suggestions for Spanish
    return [
      {
        id: 'sug_default_1',
        key: 'save',
        namespace: 'common',
        sourceText: 'Save',
        suggestedText: 'Guardar',
        language: 'es',
        contributorId: 'system',
        contributorName: 'System',
        status: 'approved',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        votes: 15,
        voterIds: []
      },
      {
        id: 'sug_default_2',
        key: 'cancel',
        namespace: 'common',
        sourceText: 'Cancel',
        suggestedText: 'Cancelar',
        language: 'es',
        contributorId: 'system',
        contributorName: 'System',
        status: 'approved',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        votes: 12,
        voterIds: []
      }
    ];
  }

  private getDefaultContributors(): TranslationContributor[] {
    return [
      {
        id: 'contrib_1',
        name: 'Maria Garcia',
        languages: ['es', 'pt'],
        contributionCount: 87,
        approvedCount: 72,
        rejectedCount: 8,
        score: 720,
        rank: 'expert',
        joinedAt: new Date('2024-01-15'),
        lastActiveAt: new Date(),
        badges: [
          { id: 'first_10', name: 'Rising Star', description: '10 approved translations', icon: 'star', earnedAt: new Date('2024-02-01') },
          { id: 'first_50', name: 'Translation Expert', description: '50 approved translations', icon: 'award', earnedAt: new Date('2024-04-15') }
        ]
      },
      {
        id: 'contrib_2',
        name: 'Hans Mueller',
        languages: ['de'],
        contributionCount: 45,
        approvedCount: 38,
        rejectedCount: 4,
        score: 380,
        rank: 'contributor',
        joinedAt: new Date('2024-02-20'),
        lastActiveAt: new Date(),
        badges: [
          { id: 'first_10', name: 'Rising Star', description: '10 approved translations', icon: 'star', earnedAt: new Date('2024-03-10') }
        ]
      },
      {
        id: 'contrib_3',
        name: 'Yuki Tanaka',
        languages: ['ja'],
        contributionCount: 62,
        approvedCount: 55,
        rejectedCount: 3,
        score: 550,
        rank: 'expert',
        joinedAt: new Date('2024-01-25'),
        lastActiveAt: new Date(),
        badges: [
          { id: 'first_10', name: 'Rising Star', description: '10 approved translations', icon: 'star', earnedAt: new Date('2024-02-15') },
          { id: 'first_50', name: 'Translation Expert', description: '50 approved translations', icon: 'award', earnedAt: new Date('2024-05-01') }
        ]
      }
    ];
  }
}

export const translationContributionService = new TranslationContributionService();
