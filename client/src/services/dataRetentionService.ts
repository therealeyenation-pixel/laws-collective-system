// Data Retention & Archival Policies Service
// Manages automated data lifecycle, archival rules, and compliance-driven retention

export interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  dataType: DataType;
  retentionPeriod: number; // days
  action: RetentionAction;
  conditions: RetentionCondition[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastExecuted?: Date;
  recordsAffected?: number;
}

export type DataType = 
  | 'documents'
  | 'transactions'
  | 'audit_logs'
  | 'notifications'
  | 'tasks'
  | 'messages'
  | 'backups'
  | 'sessions'
  | 'temp_files';

export type RetentionAction = 
  | 'archive'
  | 'delete'
  | 'anonymize'
  | 'compress'
  | 'move_cold_storage';

export interface RetentionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'is_null';
  value: string | number | boolean | null;
}

export interface LegalHold {
  id: string;
  name: string;
  reason: string;
  dataTypes: DataType[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdBy: string;
  affectedRecords: number;
}

export interface ArchivalJob {
  id: string;
  policyId: string;
  policyName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  recordsProcessed: number;
  recordsArchived: number;
  recordsFailed: number;
  errorMessage?: string;
}

export interface RetentionStats {
  totalPolicies: number;
  activePolicies: number;
  totalLegalHolds: number;
  activeLegalHolds: number;
  recordsArchived: number;
  recordsDeleted: number;
  storageReclaimed: number; // bytes
  lastJobRun?: Date;
}

class DataRetentionService {
  private readonly POLICIES_KEY = 'retention_policies';
  private readonly HOLDS_KEY = 'legal_holds';
  private readonly JOBS_KEY = 'archival_jobs';
  private readonly STATS_KEY = 'retention_stats';

  // Policy Management
  createPolicy(policy: Omit<RetentionPolicy, 'id' | 'createdAt' | 'updatedAt'>): RetentionPolicy {
    const policies = this.getPolicies();
    const newPolicy: RetentionPolicy = {
      ...policy,
      id: `pol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    policies.push(newPolicy);
    this.savePolicies(policies);
    return newPolicy;
  }

  getPolicies(): RetentionPolicy[] {
    const stored = localStorage.getItem(this.POLICIES_KEY);
    if (stored) {
      return JSON.parse(stored).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        lastExecuted: p.lastExecuted ? new Date(p.lastExecuted) : undefined
      }));
    }
    return this.getDefaultPolicies();
  }

  updatePolicy(id: string, updates: Partial<RetentionPolicy>): RetentionPolicy | null {
    const policies = this.getPolicies();
    const index = policies.findIndex(p => p.id === id);
    if (index === -1) return null;

    policies[index] = {
      ...policies[index],
      ...updates,
      updatedAt: new Date()
    };
    this.savePolicies(policies);
    return policies[index];
  }

  deletePolicy(id: string): boolean {
    const policies = this.getPolicies();
    const filtered = policies.filter(p => p.id !== id);
    if (filtered.length === policies.length) return false;
    this.savePolicies(filtered);
    return true;
  }

  togglePolicy(id: string): RetentionPolicy | null {
    const policies = this.getPolicies();
    const policy = policies.find(p => p.id === id);
    if (!policy) return null;
    return this.updatePolicy(id, { isActive: !policy.isActive });
  }

  // Legal Holds
  createLegalHold(hold: Omit<LegalHold, 'id' | 'affectedRecords'>): LegalHold {
    const holds = this.getLegalHolds();
    const newHold: LegalHold = {
      ...hold,
      id: `hold_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      affectedRecords: Math.floor(Math.random() * 1000) + 100 // Simulated
    };
    holds.push(newHold);
    this.saveLegalHolds(holds);
    return newHold;
  }

  getLegalHolds(): LegalHold[] {
    const stored = localStorage.getItem(this.HOLDS_KEY);
    if (stored) {
      return JSON.parse(stored).map((h: any) => ({
        ...h,
        startDate: new Date(h.startDate),
        endDate: h.endDate ? new Date(h.endDate) : undefined
      }));
    }
    return [];
  }

  releaseLegalHold(id: string): boolean {
    const holds = this.getLegalHolds();
    const hold = holds.find(h => h.id === id);
    if (!hold) return false;
    hold.isActive = false;
    hold.endDate = new Date();
    this.saveLegalHolds(holds);
    return true;
  }

  // Archival Jobs
  executePolicy(policyId: string): ArchivalJob {
    const policy = this.getPolicies().find(p => p.id === policyId);
    if (!policy) throw new Error('Policy not found');

    const job: ArchivalJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      policyId,
      policyName: policy.name,
      status: 'running',
      startedAt: new Date(),
      recordsProcessed: 0,
      recordsArchived: 0,
      recordsFailed: 0
    };

    const jobs = this.getArchivalJobs();
    jobs.unshift(job);
    this.saveArchivalJobs(jobs);

    // Simulate job execution
    setTimeout(() => {
      const updatedJobs = this.getArchivalJobs();
      const jobIndex = updatedJobs.findIndex(j => j.id === job.id);
      if (jobIndex !== -1) {
        updatedJobs[jobIndex] = {
          ...updatedJobs[jobIndex],
          status: 'completed',
          completedAt: new Date(),
          recordsProcessed: Math.floor(Math.random() * 500) + 50,
          recordsArchived: Math.floor(Math.random() * 400) + 40,
          recordsFailed: Math.floor(Math.random() * 10)
        };
        this.saveArchivalJobs(updatedJobs);

        // Update policy last executed
        this.updatePolicy(policyId, {
          lastExecuted: new Date(),
          recordsAffected: updatedJobs[jobIndex].recordsArchived
        });

        // Update stats
        this.updateStats(updatedJobs[jobIndex]);
      }
    }, 2000);

    return job;
  }

  getArchivalJobs(): ArchivalJob[] {
    const stored = localStorage.getItem(this.JOBS_KEY);
    if (stored) {
      return JSON.parse(stored).map((j: any) => ({
        ...j,
        startedAt: new Date(j.startedAt),
        completedAt: j.completedAt ? new Date(j.completedAt) : undefined
      }));
    }
    return [];
  }

  // Statistics
  getStats(): RetentionStats {
    const stored = localStorage.getItem(this.STATS_KEY);
    if (stored) {
      const stats = JSON.parse(stored);
      return {
        ...stats,
        lastJobRun: stats.lastJobRun ? new Date(stats.lastJobRun) : undefined
      };
    }

    const policies = this.getPolicies();
    const holds = this.getLegalHolds();

    return {
      totalPolicies: policies.length,
      activePolicies: policies.filter(p => p.isActive).length,
      totalLegalHolds: holds.length,
      activeLegalHolds: holds.filter(h => h.isActive).length,
      recordsArchived: 0,
      recordsDeleted: 0,
      storageReclaimed: 0
    };
  }

  // Data Preview
  previewPolicyImpact(policyId: string): {
    estimatedRecords: number;
    estimatedSize: number;
    sampleRecords: { id: string; name: string; age: number }[];
  } {
    // Simulated preview
    const estimatedRecords = Math.floor(Math.random() * 1000) + 100;
    return {
      estimatedRecords,
      estimatedSize: estimatedRecords * 1024 * 5, // ~5KB per record
      sampleRecords: Array.from({ length: 5 }, (_, i) => ({
        id: `rec_${i}`,
        name: `Sample Record ${i + 1}`,
        age: Math.floor(Math.random() * 365) + 30
      }))
    };
  }

  // Compliance Reports
  generateComplianceReport(): {
    generatedAt: Date;
    policies: RetentionPolicy[];
    legalHolds: LegalHold[];
    recentJobs: ArchivalJob[];
    compliance: {
      gdprCompliant: boolean;
      hipaaCompliant: boolean;
      soc2Compliant: boolean;
      issues: string[];
    };
  } {
    const policies = this.getPolicies();
    const holds = this.getLegalHolds();
    const jobs = this.getArchivalJobs().slice(0, 10);

    const issues: string[] = [];
    
    // Check for compliance issues
    if (!policies.some(p => p.dataType === 'audit_logs' && p.isActive)) {
      issues.push('No active retention policy for audit logs');
    }
    if (!policies.some(p => p.retentionPeriod >= 365)) {
      issues.push('Consider longer retention periods for compliance');
    }
    if (holds.filter(h => h.isActive).length === 0) {
      // Not necessarily an issue
    }

    return {
      generatedAt: new Date(),
      policies,
      legalHolds: holds,
      recentJobs: jobs,
      compliance: {
        gdprCompliant: policies.some(p => p.action === 'anonymize' || p.action === 'delete'),
        hipaaCompliant: policies.some(p => p.dataType === 'audit_logs' && p.retentionPeriod >= 2190),
        soc2Compliant: policies.filter(p => p.isActive).length >= 3,
        issues
      }
    };
  }

  // Private helpers
  private savePolicies(policies: RetentionPolicy[]): void {
    localStorage.setItem(this.POLICIES_KEY, JSON.stringify(policies));
  }

  private saveLegalHolds(holds: LegalHold[]): void {
    localStorage.setItem(this.HOLDS_KEY, JSON.stringify(holds));
  }

  private saveArchivalJobs(jobs: ArchivalJob[]): void {
    localStorage.setItem(this.JOBS_KEY, JSON.stringify(jobs.slice(0, 100)));
  }

  private updateStats(job: ArchivalJob): void {
    const stats = this.getStats();
    stats.recordsArchived += job.recordsArchived;
    stats.storageReclaimed += job.recordsArchived * 1024 * 5;
    stats.lastJobRun = job.completedAt;
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  }

  private getDefaultPolicies(): RetentionPolicy[] {
    const defaults: RetentionPolicy[] = [
      {
        id: 'pol_default_1',
        name: 'Audit Log Retention',
        description: 'Retain audit logs for 7 years for compliance',
        dataType: 'audit_logs',
        retentionPeriod: 2555,
        action: 'archive',
        conditions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pol_default_2',
        name: 'Old Notifications Cleanup',
        description: 'Delete read notifications older than 90 days',
        dataType: 'notifications',
        retentionPeriod: 90,
        action: 'delete',
        conditions: [{ field: 'isRead', operator: 'equals', value: true }],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pol_default_3',
        name: 'Session Data Cleanup',
        description: 'Remove expired session data after 30 days',
        dataType: 'sessions',
        retentionPeriod: 30,
        action: 'delete',
        conditions: [{ field: 'status', operator: 'equals', value: 'expired' }],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pol_default_4',
        name: 'Completed Tasks Archive',
        description: 'Archive completed tasks older than 1 year',
        dataType: 'tasks',
        retentionPeriod: 365,
        action: 'archive',
        conditions: [{ field: 'status', operator: 'equals', value: 'completed' }],
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pol_default_5',
        name: 'Backup Rotation',
        description: 'Move backups older than 90 days to cold storage',
        dataType: 'backups',
        retentionPeriod: 90,
        action: 'move_cold_storage',
        conditions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    this.savePolicies(defaults);
    return defaults;
  }
}

export const dataRetentionService = new DataRetentionService();
