/**
 * Offline Storage Service
 * Manages local storage for offline data access and sync queue
 */

// Storage keys
const STORAGE_KEYS = {
  TASKS: 'offline_tasks',
  NOTIFICATIONS: 'offline_notifications',
  USER_DATA: 'offline_user_data',
  SYNC_QUEUE: 'offline_sync_queue',
  LAST_SYNC: 'offline_last_sync',
  CACHE_STATUS: 'offline_cache_status',
};

// Sync operation types
export type SyncOperation = {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
};

// Offline data types
export interface OfflineTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  cachedAt: number;
}

export interface OfflineNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  cachedAt: number;
}

export interface OfflineUserData {
  id: number;
  name: string;
  email: string;
  role: string;
  cachedAt: number;
}

export interface CacheStatus {
  isOnline: boolean;
  lastSync: number | null;
  pendingChanges: number;
  cachedItems: {
    tasks: number;
    notifications: number;
  };
}

/**
 * Get data from local storage
 */
function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Set data in local storage
 */
function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('[Offline] Failed to save to storage:', error);
  }
}

/**
 * Cache tasks for offline access
 */
export function cacheTasks(tasks: OfflineTask[]): void {
  const cachedTasks = tasks.map(task => ({
    ...task,
    cachedAt: Date.now(),
  }));
  setStorageItem(STORAGE_KEYS.TASKS, cachedTasks);
}

/**
 * Get cached tasks
 */
export function getCachedTasks(): OfflineTask[] {
  return getStorageItem<OfflineTask[]>(STORAGE_KEYS.TASKS, []);
}

/**
 * Cache notifications for offline access
 */
export function cacheNotifications(notifications: OfflineNotification[]): void {
  const cachedNotifications = notifications.map(n => ({
    ...n,
    cachedAt: Date.now(),
  }));
  setStorageItem(STORAGE_KEYS.NOTIFICATIONS, cachedNotifications);
}

/**
 * Get cached notifications
 */
export function getCachedNotifications(): OfflineNotification[] {
  return getStorageItem<OfflineNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
}

/**
 * Cache user data for offline access
 */
export function cacheUserData(userData: Omit<OfflineUserData, 'cachedAt'>): void {
  setStorageItem(STORAGE_KEYS.USER_DATA, {
    ...userData,
    cachedAt: Date.now(),
  });
}

/**
 * Get cached user data
 */
export function getCachedUserData(): OfflineUserData | null {
  return getStorageItem<OfflineUserData | null>(STORAGE_KEYS.USER_DATA, null);
}

/**
 * Add operation to sync queue
 */
export function addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retries' | 'status'>): void {
  const queue = getSyncQueue();
  const newOperation: SyncOperation = {
    ...operation,
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    retries: 0,
    status: 'pending',
  };
  queue.push(newOperation);
  setStorageItem(STORAGE_KEYS.SYNC_QUEUE, queue);
}

/**
 * Get sync queue
 */
export function getSyncQueue(): SyncOperation[] {
  return getStorageItem<SyncOperation[]>(STORAGE_KEYS.SYNC_QUEUE, []);
}

/**
 * Update sync operation status
 */
export function updateSyncOperation(id: string, updates: Partial<SyncOperation>): void {
  const queue = getSyncQueue();
  const index = queue.findIndex(op => op.id === id);
  if (index !== -1) {
    queue[index] = { ...queue[index], ...updates };
    setStorageItem(STORAGE_KEYS.SYNC_QUEUE, queue);
  }
}

/**
 * Remove completed operations from queue
 */
export function clearCompletedSyncOperations(): void {
  const queue = getSyncQueue();
  const pending = queue.filter(op => op.status !== 'completed');
  setStorageItem(STORAGE_KEYS.SYNC_QUEUE, pending);
}

/**
 * Get pending sync operations count
 */
export function getPendingSyncCount(): number {
  const queue = getSyncQueue();
  return queue.filter(op => op.status === 'pending' || op.status === 'failed').length;
}

/**
 * Update last sync timestamp
 */
export function updateLastSync(): void {
  setStorageItem(STORAGE_KEYS.LAST_SYNC, Date.now());
}

/**
 * Get last sync timestamp
 */
export function getLastSync(): number | null {
  return getStorageItem<number | null>(STORAGE_KEYS.LAST_SYNC, null);
}

/**
 * Get cache status for UI display
 */
export function getCacheStatus(): CacheStatus {
  const tasks = getCachedTasks();
  const notifications = getCachedNotifications();
  const pendingChanges = getPendingSyncCount();
  const lastSync = getLastSync();

  return {
    isOnline: navigator.onLine,
    lastSync,
    pendingChanges,
    cachedItems: {
      tasks: tasks.length,
      notifications: notifications.length,
    },
  };
}

/**
 * Clear all offline data
 */
export function clearOfflineData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Check if data is stale (older than specified hours)
 */
export function isDataStale(cachedAt: number, maxAgeHours: number = 24): boolean {
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  return Date.now() - cachedAt > maxAgeMs;
}

/**
 * Process sync queue - attempt to sync pending operations
 */
export async function processSyncQueue(
  syncFn: (operation: SyncOperation) => Promise<boolean>
): Promise<{ success: number; failed: number }> {
  const queue = getSyncQueue();
  const pending = queue.filter(op => op.status === 'pending' || op.status === 'failed');
  
  let success = 0;
  let failed = 0;

  for (const operation of pending) {
    if (operation.retries >= 3) {
      updateSyncOperation(operation.id, { status: 'failed' });
      failed++;
      continue;
    }

    updateSyncOperation(operation.id, { status: 'syncing' });

    try {
      const result = await syncFn(operation);
      if (result) {
        updateSyncOperation(operation.id, { status: 'completed' });
        success++;
      } else {
        updateSyncOperation(operation.id, { 
          status: 'failed',
          retries: operation.retries + 1 
        });
        failed++;
      }
    } catch {
      updateSyncOperation(operation.id, { 
        status: 'failed',
        retries: operation.retries + 1 
      });
      failed++;
    }
  }

  if (success > 0) {
    updateLastSync();
    clearCompletedSyncOperations();
  }

  return { success, failed };
}
