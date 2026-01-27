/**
 * Scheduled Diagnostics Service
 * Manages automatic diagnostic runs at configurable intervals with alerts
 */

export type DiagnosticInterval = 'hourly' | 'every_6_hours' | 'every_12_hours' | 'daily' | 'weekly';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertChannel = 'in_app' | 'email' | 'both';

export interface DiagnosticSchedule {
  id: string;
  name: string;
  interval: DiagnosticInterval;
  enabled: boolean;
  lastRun?: number;
  nextRun?: number;
  alertOnIssues: boolean;
  alertChannel: AlertChannel;
  alertThreshold: AlertSeverity;
}

export interface DiagnosticAlert {
  id: string;
  scheduleId: string;
  timestamp: number;
  severity: AlertSeverity;
  title: string;
  message: string;
  details?: Record<string, unknown>;
  acknowledged: boolean;
  acknowledgedAt?: number;
  acknowledgedBy?: string;
}

export interface DiagnosticRun {
  id: string;
  scheduleId: string;
  startTime: number;
  endTime?: number;
  status: 'running' | 'completed' | 'failed';
  checksPerformed: number;
  issuesFound: number;
  alerts: DiagnosticAlert[];
}

// Storage keys
const SCHEDULES_KEY = 'diagnostic_schedules';
const ALERTS_KEY = 'diagnostic_alerts';
const RUNS_KEY = 'diagnostic_runs';
const SETTINGS_KEY = 'diagnostic_settings';

// Interval to milliseconds mapping
const INTERVAL_MS: Record<DiagnosticInterval, number> = {
  hourly: 60 * 60 * 1000,
  every_6_hours: 6 * 60 * 60 * 1000,
  every_12_hours: 12 * 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
};

// Default schedules
const DEFAULT_SCHEDULES: DiagnosticSchedule[] = [
  {
    id: 'system_health',
    name: 'System Health Check',
    interval: 'daily',
    enabled: true,
    alertOnIssues: true,
    alertChannel: 'in_app',
    alertThreshold: 'warning',
  },
  {
    id: 'data_integrity',
    name: 'Data Integrity Check',
    interval: 'every_12_hours',
    enabled: true,
    alertOnIssues: true,
    alertChannel: 'in_app',
    alertThreshold: 'critical',
  },
  {
    id: 'connection_status',
    name: 'Connection Status Check',
    interval: 'hourly',
    enabled: true,
    alertOnIssues: true,
    alertChannel: 'in_app',
    alertThreshold: 'warning',
  },
  {
    id: 'storage_usage',
    name: 'Storage Usage Check',
    interval: 'weekly',
    enabled: true,
    alertOnIssues: true,
    alertChannel: 'in_app',
    alertThreshold: 'warning',
  },
];

export interface DiagnosticSettings {
  globalEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm format
  quietHoursEnd: string;
  maxAlertsPerDay: number;
  autoAcknowledgeAfterHours: number;
  retryOnFailure: boolean;
  maxRetries: number;
}

const DEFAULT_SETTINGS: DiagnosticSettings = {
  globalEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  maxAlertsPerDay: 10,
  autoAcknowledgeAfterHours: 48,
  retryOnFailure: true,
  maxRetries: 3,
};

/**
 * Get diagnostic settings
 */
export function getSettings(): DiagnosticSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save diagnostic settings
 */
export function saveSettings(settings: Partial<DiagnosticSettings>): void {
  const current = getSettings();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
}

/**
 * Get all diagnostic schedules
 */
export function getSchedules(): DiagnosticSchedule[] {
  try {
    const stored = localStorage.getItem(SCHEDULES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with defaults
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(DEFAULT_SCHEDULES));
    return DEFAULT_SCHEDULES;
  } catch {
    return DEFAULT_SCHEDULES;
  }
}

/**
 * Save schedules
 */
export function saveSchedules(schedules: DiagnosticSchedule[]): void {
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
}

/**
 * Update a single schedule
 */
export function updateSchedule(scheduleId: string, updates: Partial<DiagnosticSchedule>): void {
  const schedules = getSchedules();
  const index = schedules.findIndex(s => s.id === scheduleId);
  if (index >= 0) {
    schedules[index] = { ...schedules[index], ...updates };
    saveSchedules(schedules);
  }
}

/**
 * Toggle schedule enabled state
 */
export function toggleSchedule(scheduleId: string): void {
  const schedules = getSchedules();
  const schedule = schedules.find(s => s.id === scheduleId);
  if (schedule) {
    updateSchedule(scheduleId, { enabled: !schedule.enabled });
  }
}

/**
 * Get all alerts
 */
export function getAlerts(): DiagnosticAlert[] {
  try {
    const stored = localStorage.getItem(ALERTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Get unacknowledged alerts
 */
export function getUnacknowledgedAlerts(): DiagnosticAlert[] {
  return getAlerts().filter(a => !a.acknowledged);
}

/**
 * Get alerts by severity
 */
export function getAlertsBySeverity(severity: AlertSeverity): DiagnosticAlert[] {
  return getAlerts().filter(a => a.severity === severity);
}

/**
 * Add a new alert
 */
export function addAlert(alert: Omit<DiagnosticAlert, 'id' | 'timestamp' | 'acknowledged'>): DiagnosticAlert {
  const alerts = getAlerts();
  const newAlert: DiagnosticAlert = {
    ...alert,
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    acknowledged: false,
  };
  
  alerts.unshift(newAlert);
  
  // Keep only last 100 alerts
  const trimmed = alerts.slice(0, 100);
  localStorage.setItem(ALERTS_KEY, JSON.stringify(trimmed));
  
  return newAlert;
}

/**
 * Acknowledge an alert
 */
export function acknowledgeAlert(alertId: string, acknowledgedBy?: string): void {
  const alerts = getAlerts();
  const index = alerts.findIndex(a => a.id === alertId);
  if (index >= 0) {
    alerts[index] = {
      ...alerts[index],
      acknowledged: true,
      acknowledgedAt: Date.now(),
      acknowledgedBy,
    };
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  }
}

/**
 * Acknowledge all alerts
 */
export function acknowledgeAllAlerts(acknowledgedBy?: string): void {
  const alerts = getAlerts();
  const updated = alerts.map(a => ({
    ...a,
    acknowledged: true,
    acknowledgedAt: a.acknowledged ? a.acknowledgedAt : Date.now(),
    acknowledgedBy: a.acknowledged ? a.acknowledgedBy : acknowledgedBy,
  }));
  localStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
}

/**
 * Clear all alerts
 */
export function clearAlerts(): void {
  localStorage.removeItem(ALERTS_KEY);
}

/**
 * Get diagnostic runs
 */
export function getRuns(): DiagnosticRun[] {
  try {
    const stored = localStorage.getItem(RUNS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Add a diagnostic run
 */
export function addRun(run: DiagnosticRun): void {
  const runs = getRuns();
  runs.unshift(run);
  
  // Keep only last 50 runs
  const trimmed = runs.slice(0, 50);
  localStorage.setItem(RUNS_KEY, JSON.stringify(trimmed));
}

/**
 * Calculate next run time for a schedule
 */
export function calculateNextRun(schedule: DiagnosticSchedule): number {
  const now = Date.now();
  const interval = INTERVAL_MS[schedule.interval];
  
  if (!schedule.lastRun) {
    return now + interval;
  }
  
  return schedule.lastRun + interval;
}

/**
 * Check if currently in quiet hours
 */
export function isInQuietHours(): boolean {
  const settings = getSettings();
  if (!settings.quietHoursEnabled) return false;
  
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const start = settings.quietHoursStart;
  const end = settings.quietHoursEnd;
  
  // Handle overnight quiet hours (e.g., 22:00 to 07:00)
  if (start > end) {
    return currentTime >= start || currentTime < end;
  }
  
  return currentTime >= start && currentTime < end;
}

/**
 * Get schedules due for execution
 */
export function getDueSchedules(): DiagnosticSchedule[] {
  const settings = getSettings();
  if (!settings.globalEnabled) return [];
  if (isInQuietHours()) return [];
  
  const now = Date.now();
  const schedules = getSchedules();
  
  return schedules.filter(schedule => {
    if (!schedule.enabled) return false;
    
    const nextRun = calculateNextRun(schedule);
    return nextRun <= now;
  });
}

/**
 * Format interval for display
 */
export function formatInterval(interval: DiagnosticInterval): string {
  switch (interval) {
    case 'hourly':
      return 'Every hour';
    case 'every_6_hours':
      return 'Every 6 hours';
    case 'every_12_hours':
      return 'Every 12 hours';
    case 'daily':
      return 'Once daily';
    case 'weekly':
      return 'Once weekly';
    default:
      return interval;
  }
}

/**
 * Get severity color class
 */
export function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'info':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    case 'warning':
      return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
    case 'critical':
      return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
  }
}

/**
 * Run a diagnostic check (simulation)
 */
export async function runDiagnostic(scheduleId: string): Promise<DiagnosticRun> {
  const schedule = getSchedules().find(s => s.id === scheduleId);
  if (!schedule) {
    throw new Error('Schedule not found');
  }
  
  const run: DiagnosticRun = {
    id: `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    scheduleId,
    startTime: Date.now(),
    status: 'running',
    checksPerformed: 0,
    issuesFound: 0,
    alerts: [],
  };
  
  // Simulate diagnostic checks
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate random issues (for demo purposes)
  const hasIssues = Math.random() > 0.7;
  run.checksPerformed = Math.floor(Math.random() * 10) + 5;
  run.issuesFound = hasIssues ? Math.floor(Math.random() * 3) + 1 : 0;
  
  // Generate alerts if issues found
  if (run.issuesFound > 0 && schedule.alertOnIssues) {
    const severity: AlertSeverity = run.issuesFound > 2 ? 'critical' : 'warning';
    
    if (severityMeetsThreshold(severity, schedule.alertThreshold)) {
      const alert = addAlert({
        scheduleId,
        severity,
        title: `${schedule.name} found issues`,
        message: `${run.issuesFound} issue(s) detected during ${schedule.name.toLowerCase()}`,
        details: {
          checksPerformed: run.checksPerformed,
          issuesFound: run.issuesFound,
        },
      });
      run.alerts.push(alert);
    }
  }
  
  run.endTime = Date.now();
  run.status = 'completed';
  
  // Update schedule last run time
  updateSchedule(scheduleId, { 
    lastRun: run.startTime,
    nextRun: calculateNextRun({ ...schedule, lastRun: run.startTime }),
  });
  
  // Save run to history
  addRun(run);
  
  return run;
}

/**
 * Check if severity meets threshold
 */
function severityMeetsThreshold(severity: AlertSeverity, threshold: AlertSeverity): boolean {
  const levels: Record<AlertSeverity, number> = {
    info: 0,
    warning: 1,
    critical: 2,
  };
  
  return levels[severity] >= levels[threshold];
}

/**
 * Get diagnostic summary
 */
export function getDiagnosticSummary(): {
  totalSchedules: number;
  activeSchedules: number;
  unacknowledgedAlerts: number;
  lastRunTime?: number;
  nextRunTime?: number;
} {
  const schedules = getSchedules();
  const alerts = getUnacknowledgedAlerts();
  const runs = getRuns();
  
  const activeSchedules = schedules.filter(s => s.enabled);
  const lastRun = runs[0];
  
  // Find next scheduled run
  let nextRunTime: number | undefined;
  activeSchedules.forEach(schedule => {
    const next = calculateNextRun(schedule);
    if (!nextRunTime || next < nextRunTime) {
      nextRunTime = next;
    }
  });
  
  return {
    totalSchedules: schedules.length,
    activeSchedules: activeSchedules.length,
    unacknowledgedAlerts: alerts.length,
    lastRunTime: lastRun?.startTime,
    nextRunTime,
  };
}
