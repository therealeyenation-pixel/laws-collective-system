/**
 * Offline-First System Service
 * Phase 61: Service worker, offline data, PWA support
 */

export interface OfflineCapability {
  feature: string;
  offlineSupport: 'full' | 'partial' | 'none';
  syncRequired: boolean;
  cacheStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  description: string;
}

export interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entity: string;
  data: Record<string, any>;
  timestamp: Date;
  retryCount: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

export interface ConflictResolution {
  strategy: 'local-wins' | 'server-wins' | 'merge' | 'manual';
  localData: Record<string, any>;
  serverData: Record<string, any>;
  resolvedData?: Record<string, any>;
}

export interface ServiceWorkerStatus {
  registered: boolean;
  active: boolean;
  version: string;
  lastUpdate: Date;
  cacheSize: number;
}

export interface PWAInstallStatus {
  installable: boolean;
  installed: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  promptShown: boolean;
}

export function getOfflineCapabilities(): OfflineCapability[] {
  return [
    { feature: 'Dashboard View', offlineSupport: 'full', syncRequired: false, cacheStrategy: 'cache-first', description: 'View cached dashboard data' },
    { feature: 'Document Reading', offlineSupport: 'full', syncRequired: false, cacheStrategy: 'cache-first', description: 'Read previously cached documents' },
    { feature: 'Form Entry', offlineSupport: 'partial', syncRequired: true, cacheStrategy: 'network-first', description: 'Enter data offline, sync when online' },
    { feature: 'Training Modules', offlineSupport: 'full', syncRequired: true, cacheStrategy: 'cache-first', description: 'Complete training offline, sync progress' }
  ];
}

export function createSyncQueueItem(operation: 'create' | 'update' | 'delete', entity: string, data: Record<string, any>): SyncQueueItem {
  return {
    id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    operation,
    entity,
    data,
    timestamp: new Date(),
    retryCount: 0,
    status: 'pending'
  };
}

export function processSyncQueue(queue: SyncQueueItem[]): { processed: number; failed: number; remaining: SyncQueueItem[] } {
  let processed = 0;
  let failed = 0;
  const remaining: SyncQueueItem[] = [];

  for (const item of queue) {
    if (item.retryCount >= 3) {
      item.status = 'failed';
      failed++;
      remaining.push(item);
    } else {
      item.status = 'completed';
      processed++;
    }
  }

  return { processed, failed, remaining };
}

export function detectConflict(localData: Record<string, any>, serverData: Record<string, any>): boolean {
  const localUpdated = localData.updatedAt ? new Date(localData.updatedAt).getTime() : 0;
  const serverUpdated = serverData.updatedAt ? new Date(serverData.updatedAt).getTime() : 0;
  return localUpdated !== serverUpdated && localData.id === serverData.id;
}

export function resolveConflict(local: Record<string, any>, server: Record<string, any>, strategy: ConflictResolution['strategy']): ConflictResolution {
  const resolution: ConflictResolution = { strategy, localData: local, serverData: server };

  switch (strategy) {
    case 'local-wins':
      resolution.resolvedData = { ...local, syncedAt: new Date().toISOString() };
      break;
    case 'server-wins':
      resolution.resolvedData = { ...server };
      break;
    case 'merge':
      resolution.resolvedData = { ...server, ...local, mergedAt: new Date().toISOString(), conflictResolved: true };
      break;
    case 'manual':
      break;
  }

  return resolution;
}

export function getServiceWorkerStatus(): ServiceWorkerStatus {
  return { registered: true, active: true, version: '1.0.0', lastUpdate: new Date(), cacheSize: 52428800 };
}

export function getPWAInstallStatus(userAgent: string): PWAInstallStatus {
  let platform: PWAInstallStatus['platform'] = 'unknown';
  
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) platform = 'ios';
  else if (userAgent.includes('Android')) platform = 'android';
  else if (userAgent.includes('Windows') || userAgent.includes('Mac') || userAgent.includes('Linux')) platform = 'desktop';

  return { installable: platform !== 'unknown', installed: false, platform, promptShown: false };
}

export function shouldPrecache(feature: string): boolean {
  const capabilities = getOfflineCapabilities();
  const capability = capabilities.find(c => c.feature === feature);
  return capability?.offlineSupport === 'full';
}
