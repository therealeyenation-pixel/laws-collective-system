// Backup Scheduler Service - Automated backups for data protection
// Ensures data can be recovered independently

export interface BackupConfig {
  id: string;
  name: string;
  schedule: 'daily' | 'weekly' | 'monthly' | 'manual';
  time?: string; // HH:MM format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  retention: number; // days to keep backups
  includeDatabase: boolean;
  includeFiles: boolean;
  includeSettings: boolean;
  destination: 'local' | 's3' | 'google-drive' | 'dropbox';
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export interface BackupRecord {
  id: string;
  configId: string;
  timestamp: Date;
  status: 'completed' | 'failed' | 'in-progress';
  size: number;
  duration: number; // seconds
  destination: string;
  downloadUrl?: string;
  expiresAt?: Date;
  error?: string;
  contents: {
    database: boolean;
    files: boolean;
    settings: boolean;
  };
}

export interface BackupStats {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  totalSize: number;
  lastBackup?: Date;
  nextScheduled?: Date;
}

class BackupSchedulerService {
  private configs: BackupConfig[] = [];
  private backups: BackupRecord[] = [];

  constructor() {
    // Initialize with default backup config
    this.configs = [
      {
        id: 'default-daily',
        name: 'Daily Full Backup',
        schedule: 'daily',
        time: '02:00',
        retention: 7,
        includeDatabase: true,
        includeFiles: true,
        includeSettings: true,
        destination: 's3',
        enabled: true,
        lastRun: new Date(Date.now() - 86400000),
        nextRun: this.calculateNextRun('daily', '02:00'),
      },
      {
        id: 'weekly-archive',
        name: 'Weekly Archive',
        schedule: 'weekly',
        time: '03:00',
        dayOfWeek: 0, // Sunday
        retention: 30,
        includeDatabase: true,
        includeFiles: true,
        includeSettings: true,
        destination: 's3',
        enabled: true,
        lastRun: new Date(Date.now() - 604800000),
        nextRun: this.calculateNextRun('weekly', '03:00', 0),
      },
    ];

    // Sample backup history
    this.backups = [
      {
        id: 'bkp-001',
        configId: 'default-daily',
        timestamp: new Date(Date.now() - 86400000),
        status: 'completed',
        size: 125 * 1024 * 1024,
        duration: 45,
        destination: 's3://backups/laws-collective/2026-01-26/',
        downloadUrl: '/api/backups/bkp-001/download',
        expiresAt: new Date(Date.now() + 604800000),
        contents: { database: true, files: true, settings: true },
      },
      {
        id: 'bkp-002',
        configId: 'default-daily',
        timestamp: new Date(Date.now() - 172800000),
        status: 'completed',
        size: 123 * 1024 * 1024,
        duration: 42,
        destination: 's3://backups/laws-collective/2026-01-25/',
        downloadUrl: '/api/backups/bkp-002/download',
        expiresAt: new Date(Date.now() + 518400000),
        contents: { database: true, files: true, settings: true },
      },
    ];
  }

  // Get all backup configurations
  getConfigs(): BackupConfig[] {
    return this.configs;
  }

  // Get specific config
  getConfig(id: string): BackupConfig | undefined {
    return this.configs.find(c => c.id === id);
  }

  // Create new backup config
  createConfig(config: Omit<BackupConfig, 'id' | 'lastRun' | 'nextRun'>): BackupConfig {
    const newConfig: BackupConfig = {
      ...config,
      id: `config-${Date.now()}`,
      nextRun: this.calculateNextRun(config.schedule, config.time, config.dayOfWeek, config.dayOfMonth),
    };
    this.configs.push(newConfig);
    return newConfig;
  }

  // Update backup config
  updateConfig(id: string, updates: Partial<BackupConfig>): BackupConfig | null {
    const index = this.configs.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.configs[index] = { ...this.configs[index], ...updates };
    
    // Recalculate next run if schedule changed
    if (updates.schedule || updates.time || updates.dayOfWeek || updates.dayOfMonth) {
      const config = this.configs[index];
      config.nextRun = this.calculateNextRun(config.schedule, config.time, config.dayOfWeek, config.dayOfMonth);
    }

    return this.configs[index];
  }

  // Delete backup config
  deleteConfig(id: string): boolean {
    const index = this.configs.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.configs.splice(index, 1);
    return true;
  }

  // Run backup manually
  async runBackup(configId: string): Promise<BackupRecord> {
    const config = this.getConfig(configId);
    if (!config) throw new Error('Backup configuration not found');

    const backupId = `bkp-${Date.now()}`;
    const record: BackupRecord = {
      id: backupId,
      configId,
      timestamp: new Date(),
      status: 'in-progress',
      size: 0,
      duration: 0,
      destination: `${config.destination}://backups/laws-collective/${new Date().toISOString().split('T')[0]}/`,
      contents: {
        database: config.includeDatabase,
        files: config.includeFiles,
        settings: config.includeSettings,
      },
    };

    this.backups.unshift(record);

    // Simulate backup process
    const startTime = Date.now();
    await this.simulateDelay(3000);

    // Update record with completion
    record.status = 'completed';
    record.duration = Math.floor((Date.now() - startTime) / 1000);
    record.size = Math.floor(Math.random() * 50 + 100) * 1024 * 1024;
    record.downloadUrl = `/api/backups/${backupId}/download`;
    record.expiresAt = new Date(Date.now() + config.retention * 86400000);

    // Update config last run
    config.lastRun = new Date();
    config.nextRun = this.calculateNextRun(config.schedule, config.time, config.dayOfWeek, config.dayOfMonth);

    return record;
  }

  // Get backup history
  getBackups(limit?: number): BackupRecord[] {
    return limit ? this.backups.slice(0, limit) : this.backups;
  }

  // Get backup by ID
  getBackup(id: string): BackupRecord | undefined {
    return this.backups.find(b => b.id === id);
  }

  // Delete backup
  deleteBackup(id: string): boolean {
    const index = this.backups.findIndex(b => b.id === id);
    if (index === -1) return false;
    this.backups.splice(index, 1);
    return true;
  }

  // Restore from backup
  async restoreFromBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    const backup = this.getBackup(backupId);
    if (!backup) throw new Error('Backup not found');

    await this.simulateDelay(5000);

    return {
      success: true,
      message: `Restored from backup ${backupId} successfully`,
    };
  }

  // Get backup statistics
  getStats(): BackupStats {
    const completed = this.backups.filter(b => b.status === 'completed');
    const failed = this.backups.filter(b => b.status === 'failed');
    const totalSize = completed.reduce((sum, b) => sum + b.size, 0);

    const enabledConfigs = this.configs.filter(c => c.enabled);
    const nextScheduled = enabledConfigs
      .map(c => c.nextRun)
      .filter(Boolean)
      .sort((a, b) => a!.getTime() - b!.getTime())[0];

    return {
      totalBackups: this.backups.length,
      successfulBackups: completed.length,
      failedBackups: failed.length,
      totalSize,
      lastBackup: completed[0]?.timestamp,
      nextScheduled,
    };
  }

  // Calculate next run time
  private calculateNextRun(
    schedule: string,
    time?: string,
    dayOfWeek?: number,
    dayOfMonth?: number
  ): Date {
    const now = new Date();
    const [hours, minutes] = (time || '00:00').split(':').map(Number);

    switch (schedule) {
      case 'daily': {
        const next = new Date(now);
        next.setHours(hours, minutes, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);
        return next;
      }
      case 'weekly': {
        const next = new Date(now);
        next.setHours(hours, minutes, 0, 0);
        const daysUntil = ((dayOfWeek || 0) - now.getDay() + 7) % 7 || 7;
        next.setDate(next.getDate() + daysUntil);
        return next;
      }
      case 'monthly': {
        const next = new Date(now);
        next.setDate(dayOfMonth || 1);
        next.setHours(hours, minutes, 0, 0);
        if (next <= now) next.setMonth(next.getMonth() + 1);
        return next;
      }
      default:
        return new Date(now.getTime() + 86400000);
    }
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const backupSchedulerService = new BackupSchedulerService();
