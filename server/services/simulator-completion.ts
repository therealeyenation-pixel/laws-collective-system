/**
 * Simulator Completion Tracking Service
 * Phase 67: Training module completion and certification
 */

export interface TrainingModule {
  id: string;
  name: string;
  type: 'company-wide' | 'new-employee' | 'department' | 'compliance';
  requiredForRoles: string[];
  expirationMonths: number;
  passingScore: number;
}

export interface ModuleCompletion {
  moduleId: string;
  userId: string;
  completedAt: Date;
  score: number;
  passed: boolean;
  expiresAt: Date;
  certificateId?: string;
}

export interface ComplianceStatus {
  userId: string;
  compliant: boolean;
  completedModules: string[];
  pendingModules: string[];
  expiringSoon: string[];
}

export function getStandardModules(): TrainingModule[] {
  return [
    { id: 'safety-101', name: 'Workplace Safety', type: 'company-wide', requiredForRoles: ['all'], expirationMonths: 12, passingScore: 80 },
    { id: 'harassment-prev', name: 'Harassment Prevention', type: 'compliance', requiredForRoles: ['all'], expirationMonths: 24, passingScore: 100 },
    { id: 'data-security', name: 'Data Security', type: 'company-wide', requiredForRoles: ['all'], expirationMonths: 12, passingScore: 85 },
    { id: 'new-hire-orient', name: 'New Hire Orientation', type: 'new-employee', requiredForRoles: ['new'], expirationMonths: 0, passingScore: 70 },
    { id: 'finance-basics', name: 'Finance Department Basics', type: 'department', requiredForRoles: ['finance'], expirationMonths: 24, passingScore: 80 }
  ];
}

export function recordModuleCompletion(moduleId: string, userId: string, score: number): ModuleCompletion {
  const modules = getStandardModules();
  const module = modules.find(m => m.id === moduleId);
  const passingScore = module?.passingScore || 70;
  const expirationMonths = module?.expirationMonths || 12;
  
  const completedAt = new Date();
  const expiresAt = new Date(completedAt);
  expiresAt.setMonth(expiresAt.getMonth() + expirationMonths);

  return {
    moduleId,
    userId,
    completedAt,
    score,
    passed: score >= passingScore,
    expiresAt,
    certificateId: score >= passingScore ? `cert-${moduleId}-${userId}-${Date.now()}` : undefined
  };
}

export function calculateUserCompliance(userId: string, userRole: string, completions: ModuleCompletion[]): ComplianceStatus {
  const modules = getStandardModules();
  const requiredModules = modules.filter(m => 
    m.requiredForRoles.includes('all') || m.requiredForRoles.includes(userRole)
  );

  const now = new Date();
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const completedModules: string[] = [];
  const pendingModules: string[] = [];
  const expiringSoon: string[] = [];

  for (const module of requiredModules) {
    const completion = completions.find(c => c.moduleId === module.id && c.passed && c.expiresAt > now);
    if (completion) {
      completedModules.push(module.id);
      if (completion.expiresAt <= thirtyDaysFromNow) {
        expiringSoon.push(module.id);
      }
    } else {
      pendingModules.push(module.id);
    }
  }

  return {
    userId,
    compliant: pendingModules.length === 0,
    completedModules,
    pendingModules,
    expiringSoon
  };
}

export function getTeamComplianceReport(teamMembers: Array<{userId: string; role: string}>, allCompletions: ModuleCompletion[]): {
  totalMembers: number;
  compliantMembers: number;
  complianceRate: number;
  membersNeedingAttention: string[];
} {
  let compliantCount = 0;
  const needsAttention: string[] = [];

  for (const member of teamMembers) {
    const memberCompletions = allCompletions.filter(c => c.userId === member.userId);
    const status = calculateUserCompliance(member.userId, member.role, memberCompletions);
    if (status.compliant) {
      compliantCount++;
    } else {
      needsAttention.push(member.userId);
    }
  }

  return {
    totalMembers: teamMembers.length,
    compliantMembers: compliantCount,
    complianceRate: teamMembers.length > 0 ? (compliantCount / teamMembers.length) * 100 : 0,
    membersNeedingAttention: needsAttention
  };
}

export function getRecertificationReminders(completions: ModuleCompletion[], daysAhead: number = 30): ModuleCompletion[] {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + daysAhead);
  
  return completions.filter(c => c.passed && c.expiresAt > now && c.expiresAt <= cutoff);
}
