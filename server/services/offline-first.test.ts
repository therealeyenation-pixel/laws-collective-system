import { describe, it, expect } from 'vitest';
import {
  getOfflineCapabilities,
  createSyncQueueItem,
  processSyncQueue,
  detectConflict,
  resolveConflict,
  getServiceWorkerStatus,
  getPWAInstallStatus,
  shouldPrecache
} from './offline-first';

describe('Offline-First System', () => {
  describe('getOfflineCapabilities', () => {
    it('should return list of offline capabilities', () => {
      const capabilities = getOfflineCapabilities();
      expect(capabilities.length).toBeGreaterThan(0);
      expect(capabilities[0]).toHaveProperty('feature');
      expect(capabilities[0]).toHaveProperty('offlineSupport');
    });

    it('should include full offline support features', () => {
      const capabilities = getOfflineCapabilities();
      const fullSupport = capabilities.filter(c => c.offlineSupport === 'full');
      expect(fullSupport.length).toBeGreaterThan(0);
    });
  });

  describe('createSyncQueueItem', () => {
    it('should create a sync queue item', () => {
      const item = createSyncQueueItem('create', 'document', { title: 'Test' });
      expect(item.operation).toBe('create');
      expect(item.entity).toBe('document');
      expect(item.data.title).toBe('Test');
      expect(item.status).toBe('pending');
      expect(item.retryCount).toBe(0);
    });

    it('should generate unique IDs', () => {
      const item1 = createSyncQueueItem('create', 'doc', {});
      const item2 = createSyncQueueItem('create', 'doc', {});
      expect(item1.id).not.toBe(item2.id);
    });
  });

  describe('processSyncQueue', () => {
    it('should process pending items', () => {
      const queue = [
        createSyncQueueItem('create', 'doc', { id: 1 }),
        createSyncQueueItem('update', 'doc', { id: 2 })
      ];
      const result = processSyncQueue(queue);
      expect(result.processed).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should mark items as failed after 3 retries', () => {
      const item = createSyncQueueItem('create', 'doc', {});
      item.retryCount = 3;
      const result = processSyncQueue([item]);
      expect(result.failed).toBe(1);
      expect(result.remaining.length).toBe(1);
    });
  });

  describe('detectConflict', () => {
    it('should detect conflict when timestamps differ', () => {
      const local = { id: 1, updatedAt: '2024-01-01T10:00:00Z' };
      const server = { id: 1, updatedAt: '2024-01-01T11:00:00Z' };
      expect(detectConflict(local, server)).toBe(true);
    });

    it('should not detect conflict when timestamps match', () => {
      const local = { id: 1, updatedAt: '2024-01-01T10:00:00Z' };
      const server = { id: 1, updatedAt: '2024-01-01T10:00:00Z' };
      expect(detectConflict(local, server)).toBe(false);
    });
  });

  describe('resolveConflict', () => {
    it('should resolve with local-wins strategy', () => {
      const local = { id: 1, name: 'Local' };
      const server = { id: 1, name: 'Server' };
      const result = resolveConflict(local, server, 'local-wins');
      expect(result.resolvedData?.name).toBe('Local');
    });

    it('should resolve with server-wins strategy', () => {
      const local = { id: 1, name: 'Local' };
      const server = { id: 1, name: 'Server' };
      const result = resolveConflict(local, server, 'server-wins');
      expect(result.resolvedData?.name).toBe('Server');
    });

    it('should resolve with merge strategy', () => {
      const local = { id: 1, localField: 'A' };
      const server = { id: 1, serverField: 'B' };
      const result = resolveConflict(local, server, 'merge');
      expect(result.resolvedData?.localField).toBe('A');
      expect(result.resolvedData?.serverField).toBe('B');
      expect(result.resolvedData?.conflictResolved).toBe(true);
    });
  });

  describe('getServiceWorkerStatus', () => {
    it('should return service worker status', () => {
      const status = getServiceWorkerStatus();
      expect(status.registered).toBe(true);
      expect(status.active).toBe(true);
      expect(status.version).toBeDefined();
    });
  });

  describe('getPWAInstallStatus', () => {
    it('should detect iOS platform', () => {
      const status = getPWAInstallStatus('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)');
      expect(status.platform).toBe('ios');
      expect(status.installable).toBe(true);
    });

    it('should detect Android platform', () => {
      const status = getPWAInstallStatus('Mozilla/5.0 (Linux; Android 11)');
      expect(status.platform).toBe('android');
    });

    it('should detect desktop platform', () => {
      const status = getPWAInstallStatus('Mozilla/5.0 (Windows NT 10.0)');
      expect(status.platform).toBe('desktop');
    });
  });

  describe('shouldPrecache', () => {
    it('should return true for full offline support features', () => {
      expect(shouldPrecache('Dashboard View')).toBe(true);
    });

    it('should return false for partial offline support features', () => {
      expect(shouldPrecache('Form Entry')).toBe(false);
    });
  });
});
