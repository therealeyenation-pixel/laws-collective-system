// Data Backup/Restore Service
// Provides scheduled and manual backup functionality with encryption and restore capabilities

export interface BackupConfig {
  id: string;
  name: string;
  type: 'full' | 'incremental';
  schedule: 'manual' | 'daily' | 'weekly' | 'monthly';
  scheduledTime?: string; // HH:mm format
  scheduledDay?: number; // 0-6 for weekly, 1-31 for monthly
  encryption: boolean;
  compression: boolean;
  retentionDays: number;
  includedModules: string[];
  lastRun?: number;
  nextRun?: number;
  isActive: boolean;
}

export interface BackupRecord {
  id: string;
  configId: string;
  configName: string;
  type: 'full' | 'incremental';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'verified';
  startedAt: number;
  completedAt?: number;
  size: number; // bytes
  recordCount: number;
  modules: string[];
  encrypted: boolean;
  compressed: boolean;
  checksum: string;
  storageLocation: string;
  errorMessage?: string;
  verifiedAt?: number;
}

export interface RestorePoint {
  backupId: string;
  backupName: string;
  createdAt: number;
  size: number;
  recordCount: number;
  modules: string[];
  canRestore: boolean;
  restoreWarnings?: string[];
}

export interface RestoreJob {
  id: string;
  backupId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  startedAt: number;
  completedAt?: number;
  modulesRestored: string[];
  recordsRestored: number;
  errorMessage?: string;
  rollbackAvailable: boolean;
}

export interface BackupStats {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  totalStorageUsed: number; // bytes
  lastBackupAt?: number;
  nextScheduledBackup?: number;
  averageBackupSize: number;
  averageBackupDuration: number; // ms
}

// Available modules for backup
export const BACKUP_MODULES = [
  { id: 'users', name: 'Users & Accounts', icon: 'Users' },
  { id: 'entities', name: 'Business Entities', icon: 'Building2' },
  { id: 'transactions', name: 'Financial Transactions', icon: 'DollarSign' },
  { id: 'documents', name: 'Documents & Files', icon: 'FileText' },
  { id: 'employees', name: 'HR & Employees', icon: 'Briefcase' },
  { id: 'grants', name: 'Grants & Funding', icon: 'Gift' },
  { id: 'training', name: 'Training & Courses', icon: 'GraduationCap' },
  { id: 'tasks', name: 'Tasks & Projects', icon: 'ClipboardList' },
  { id: 'tokens', name: 'Token Economy', icon: 'Coins' },
  { id: 'audit', name: 'Audit Logs', icon: 'Shield' },
  { id: 'settings', name: 'System Settings', icon: 'Settings' },
  { id: 'integrations', name: 'Integration Configs', icon: 'Plug' },
];

class BackupRestoreService {
  private configs: BackupConfig[] = [];
  private backups: BackupRecord[] = [];
  private restoreJobs: RestoreJob[] = [];

  constructor() {
    this.initializeDefaultConfigs();
    this.loadMockBackups();
  }

  private initializeDefaultConfigs(): void {
    this.configs = [
      {
        id: 'config_daily_full',
        name: 'Daily Full Backup',
        type: 'full',
        schedule: 'daily',
        scheduledTime: '02:00',
        encryption: true,
        compression: true,
        retentionDays: 30,
        includedModules: BACKUP_MODULES.map(m => m.id),
        lastRun: Date.now() - 86400000,
        nextRun: Date.now() + 21600000,
        isActive: true,
      },
      {
        id: 'config_weekly_archive',
        name: 'Weekly Archive',
        type: 'full',
        schedule: 'weekly',
        scheduledTime: '03:00',
        scheduledDay: 0, // Sunday
        encryption: true,
        compression: true,
        retentionDays: 90,
        includedModules: BACKUP_MODULES.map(m => m.id),
        lastRun: Date.now() - 604800000,
        nextRun: Date.now() + 259200000,
        isActive: true,
      },
      {
        id: 'config_incremental',
        name: 'Hourly Incremental',
        type: 'incremental',
        schedule: 'daily',
        scheduledTime: '00:00',
        encryption: false,
        compression: true,
        retentionDays: 7,
        includedModules: ['transactions', 'documents', 'tasks'],
        lastRun: Date.now() - 3600000,
        nextRun: Date.now() + 3600000,
        isActive: false,
      },
    ];
  }

  private loadMockBackups(): void {
    const now = Date.now();
    this.backups = [
      {
        id: 'backup_1',
        configId: 'config_daily_full',
        configName: 'Daily Full Backup',
        type: 'full',
        status: 'verified',
        startedAt: now - 86400000,
        completedAt: now - 86400000 + 1800000,
        size: 256000000,
        recordCount: 15420,
        modules: BACKUP_MODULES.map(m => m.id),
        encrypted: true,
        compressed: true,
        checksum: 'sha256:a1b2c3d4e5f6...',
        storageLocation: 's3://backups/daily/2026-01-26.bak',
        verifiedAt: now - 86000000,
      },
      {
        id: 'backup_2',
        configId: 'config_daily_full',
        configName: 'Daily Full Backup',
        type: 'full',
        status: 'completed',
        startedAt: now - 172800000,
        completedAt: now - 172800000 + 1750000,
        size: 248000000,
        recordCount: 15200,
        modules: BACKUP_MODULES.map(m => m.id),
        encrypted: true,
        compressed: true,
        checksum: 'sha256:b2c3d4e5f6g7...',
        storageLocation: 's3://backups/daily/2026-01-25.bak',
      },
      {
        id: 'backup_3',
        configId: 'config_weekly_archive',
        configName: 'Weekly Archive',
        type: 'full',
        status: 'verified',
        startedAt: now - 604800000,
        completedAt: now - 604800000 + 2400000,
        size: 512000000,
        recordCount: 14800,
        modules: BACKUP_MODULES.map(m => m.id),
        encrypted: true,
        compressed: true,
        checksum: 'sha256:c3d4e5f6g7h8...',
        storageLocation: 's3://backups/weekly/2026-01-19.bak',
        verifiedAt: now - 600000000,
      },
      {
        id: 'backup_4',
        configId: 'config_daily_full',
        configName: 'Daily Full Backup',
        type: 'full',
        status: 'failed',
        startedAt: now - 259200000,
        completedAt: now - 259200000 + 600000,
        size: 0,
        recordCount: 0,
        modules: [],
        encrypted: false,
        compressed: false,
        checksum: '',
        storageLocation: '',
        errorMessage: 'Storage quota exceeded',
      },
    ];
  }

  // Get all backup configurations
  getConfigs(): BackupConfig[] {
    return [...this.configs];
  }

  // Get a specific config
  getConfig(configId: string): BackupConfig | undefined {
    return this.configs.find(c => c.id === configId);
  }

  // Create or update backup config
  saveConfig(config: Partial<BackupConfig> & { id?: string }): BackupConfig {
    if (config.id) {
      const index = this.configs.findIndex(c => c.id === config.id);
      if (index >= 0) {
        this.configs[index] = { ...this.configs[index], ...config };
        return this.configs[index];
      }
    }
    
    const newConfig: BackupConfig = {
      id: `config_${Date.now()}`,
      name: config.name || 'New Backup',
      type: config.type || 'full',
      schedule: config.schedule || 'manual',
      scheduledTime: config.scheduledTime,
      scheduledDay: config.scheduledDay,
      encryption: config.encryption ?? true,
      compression: config.compression ?? true,
      retentionDays: config.retentionDays || 30,
      includedModules: config.includedModules || BACKUP_MODULES.map(m => m.id),
      isActive: config.isActive ?? true,
    };
    
    this.configs.push(newConfig);
    return newConfig;
  }

  // Delete backup config
  deleteConfig(configId: string): boolean {
    const index = this.configs.findIndex(c => c.id === configId);
    if (index >= 0) {
      this.configs.splice(index, 1);
      return true;
    }
    return false;
  }

  // Toggle config active state
  toggleConfig(configId: string): BackupConfig | undefined {
    const config = this.configs.find(c => c.id === configId);
    if (config) {
      config.isActive = !config.isActive;
      return config;
    }
    return undefined;
  }

  // Get all backups
  getBackups(filters?: { configId?: string; status?: string; type?: string }): BackupRecord[] {
    let result = [...this.backups];
    
    if (filters?.configId) {
      result = result.filter(b => b.configId === filters.configId);
    }
    if (filters?.status) {
      result = result.filter(b => b.status === filters.status);
    }
    if (filters?.type) {
      result = result.filter(b => b.type === filters.type);
    }
    
    return result.sort((a, b) => b.startedAt - a.startedAt);
  }

  // Get a specific backup
  getBackup(backupId: string): BackupRecord | undefined {
    return this.backups.find(b => b.id === backupId);
  }

  // Start a manual backup
  async startBackup(configId: string): Promise<BackupRecord> {
    const config = this.configs.find(c => c.id === configId);
    if (!config) {
      throw new Error('Backup configuration not found');
    }

    const backup: BackupRecord = {
      id: `backup_${Date.now()}`,
      configId: config.id,
      configName: config.name,
      type: config.type,
      status: 'in_progress',
      startedAt: Date.now(),
      size: 0,
      recordCount: 0,
      modules: config.includedModules,
      encrypted: config.encryption,
      compressed: config.compression,
      checksum: '',
      storageLocation: '',
    };

    this.backups.unshift(backup);

    // Simulate backup progress
    setTimeout(() => {
      backup.status = 'completed';
      backup.completedAt = Date.now();
      backup.size = Math.floor(Math.random() * 100000000) + 200000000;
      backup.recordCount = Math.floor(Math.random() * 5000) + 10000;
      backup.checksum = `sha256:${Math.random().toString(36).substring(2, 15)}`;
      backup.storageLocation = `s3://backups/${config.type}/${new Date().toISOString().split('T')[0]}.bak`;
    }, 3000);

    return backup;
  }

  // Verify backup integrity
  async verifyBackup(backupId: string): Promise<{ valid: boolean; message: string }> {
    const backup = this.backups.find(b => b.id === backupId);
    if (!backup) {
      throw new Error('Backup not found');
    }

    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 2000));

    backup.status = 'verified';
    backup.verifiedAt = Date.now();

    return {
      valid: true,
      message: 'Backup integrity verified successfully. Checksum matches.',
    };
  }

  // Delete a backup
  deleteBackup(backupId: string): boolean {
    const index = this.backups.findIndex(b => b.id === backupId);
    if (index >= 0) {
      this.backups.splice(index, 1);
      return true;
    }
    return false;
  }

  // Get restore points
  getRestorePoints(): RestorePoint[] {
    return this.backups
      .filter(b => b.status === 'completed' || b.status === 'verified')
      .map(b => ({
        backupId: b.id,
        backupName: b.configName,
        createdAt: b.completedAt || b.startedAt,
        size: b.size,
        recordCount: b.recordCount,
        modules: b.modules,
        canRestore: true,
        restoreWarnings: b.status !== 'verified' ? ['Backup has not been verified'] : undefined,
      }));
  }

  // Start restore from backup
  async startRestore(backupId: string, modules?: string[]): Promise<RestoreJob> {
    const backup = this.backups.find(b => b.id === backupId);
    if (!backup) {
      throw new Error('Backup not found');
    }

    const job: RestoreJob = {
      id: `restore_${Date.now()}`,
      backupId,
      status: 'in_progress',
      startedAt: Date.now(),
      modulesRestored: modules || backup.modules,
      recordsRestored: 0,
      rollbackAvailable: true,
    };

    this.restoreJobs.unshift(job);

    // Simulate restore progress
    setTimeout(() => {
      job.status = 'completed';
      job.completedAt = Date.now();
      job.recordsRestored = backup.recordCount;
    }, 5000);

    return job;
  }

  // Get restore jobs
  getRestoreJobs(): RestoreJob[] {
    return [...this.restoreJobs].sort((a, b) => b.startedAt - a.startedAt);
  }

  // Rollback a restore
  async rollbackRestore(jobId: string): Promise<boolean> {
    const job = this.restoreJobs.find(j => j.id === jobId);
    if (!job || !job.rollbackAvailable) {
      return false;
    }

    job.status = 'rolled_back';
    job.rollbackAvailable = false;
    return true;
  }

  // Get backup statistics
  getStats(): BackupStats {
    const completed = this.backups.filter(b => b.status === 'completed' || b.status === 'verified');
    const failed = this.backups.filter(b => b.status === 'failed');
    
    const totalSize = completed.reduce((sum, b) => sum + b.size, 0);
    const avgSize = completed.length > 0 ? totalSize / completed.length : 0;
    
    const durations = completed
      .filter(b => b.completedAt)
      .map(b => (b.completedAt! - b.startedAt));
    const avgDuration = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;

    const lastBackup = completed.length > 0 
      ? Math.max(...completed.map(b => b.completedAt || b.startedAt))
      : undefined;

    const activeConfigs = this.configs.filter(c => c.isActive && c.nextRun);
    const nextScheduled = activeConfigs.length > 0
      ? Math.min(...activeConfigs.map(c => c.nextRun!))
      : undefined;

    return {
      totalBackups: this.backups.length,
      successfulBackups: completed.length,
      failedBackups: failed.length,
      totalStorageUsed: totalSize,
      lastBackupAt: lastBackup,
      nextScheduledBackup: nextScheduled,
      averageBackupSize: avgSize,
      averageBackupDuration: avgDuration,
    };
  }

  // Format bytes for display
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  // Format duration for display
  formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }
}

export const backupRestoreService = new BackupRestoreService();
