/**
 * Mobile Sync Engine - Offline-First Data Synchronization
 * Handles bidirectional sync between mobile app and web server
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'react-native-uuid';

export interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  resource: string;
  resourceId: string;
  data: any;
  timestamp: number;
  synced: boolean;
  retryCount: number;
}

export interface SyncState {
  lastSyncTime: number;
  pendingOperations: SyncOperation[];
  isOnline: boolean;
  isSyncing: boolean;
}

const SYNC_STORAGE_KEY = 'financial_app_sync_state';
const PENDING_OPS_KEY = 'financial_app_pending_ops';
const MAX_RETRIES = 3;
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

class SyncEngine {
  private state: SyncState = {
    lastSyncTime: 0,
    pendingOperations: [],
    isOnline: true,
    isSyncing: false,
  };

  private syncTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize sync engine
   */
  async initialize() {
    await this.loadState();
    this.setupAutoSync();
  }

  /**
   * Load sync state from storage
   */
  private async loadState() {
    try {
      const stored = await AsyncStorage.getItem(SYNC_STORAGE_KEY);
      const pendingOps = await AsyncStorage.getItem(PENDING_OPS_KEY);

      if (stored) {
        this.state = JSON.parse(stored);
      }

      if (pendingOps) {
        this.state.pendingOperations = JSON.parse(pendingOps);
      }
    } catch (error) {
      console.error('Failed to load sync state:', error);
    }
  }

  /**
   * Save sync state to storage
   */
  private async saveState() {
    try {
      await AsyncStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(this.state));
      await AsyncStorage.setItem(
        PENDING_OPS_KEY,
        JSON.stringify(this.state.pendingOperations)
      );
    } catch (error) {
      console.error('Failed to save sync state:', error);
    }
  }

  /**
   * Queue an operation for sync
   */
  async queueOperation(
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    resource: string,
    resourceId: string,
    data: any
  ) {
    const operation: SyncOperation = {
      id: uuidv4().toString(),
      type,
      resource,
      resourceId,
      data,
      timestamp: Date.now(),
      synced: false,
      retryCount: 0,
    };

    this.state.pendingOperations.push(operation);
    await this.saveState();

    // Attempt immediate sync if online
    if (this.state.isOnline) {
      await this.sync();
    }

    return operation.id;
  }

  /**
   * Setup automatic sync
   */
  private setupAutoSync() {
    this.syncTimer = setInterval(() => {
      if (this.state.isOnline && !this.state.isSyncing) {
        this.sync();
      }
    }, SYNC_INTERVAL);
  }

  /**
   * Perform sync operation
   */
  async sync(): Promise<boolean> {
    if (this.state.isSyncing || !this.state.isOnline) {
      return false;
    }

    this.state.isSyncing = true;

    try {
      const pendingOps = [...this.state.pendingOperations];

      for (const operation of pendingOps) {
        if (operation.synced) continue;

        const success = await this.syncOperation(operation);

        if (success) {
          operation.synced = true;
          this.state.pendingOperations = this.state.pendingOperations.filter(
            (op) => op.id !== operation.id
          );
        } else {
          operation.retryCount++;

          if (operation.retryCount >= MAX_RETRIES) {
            console.error(
              `Failed to sync operation ${operation.id} after ${MAX_RETRIES} retries`
            );
          }
        }
      }

      this.state.lastSyncTime = Date.now();
      await this.saveState();

      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    } finally {
      this.state.isSyncing = false;
    }
  }

  /**
   * Sync individual operation
   */
  private async syncOperation(operation: SyncOperation): Promise<boolean> {
    try {
      // Simulate API call - replace with actual tRPC call
      const response = await fetch('/api/trpc/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: operation.type,
          resource: operation.resource,
          resourceId: operation.resourceId,
          data: operation.data,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to sync operation:', error);
      return false;
    }
  }

  /**
   * Set online status
   */
  setOnlineStatus(isOnline: boolean) {
    this.state.isOnline = isOnline;

    if (isOnline && !this.state.isSyncing) {
      this.sync();
    }
  }

  /**
   * Get pending operations count
   */
  getPendingOperationsCount(): number {
    return this.state.pendingOperations.filter((op) => !op.synced).length;
  }

  /**
   * Get sync state
   */
  getState(): SyncState {
    return { ...this.state };
  }

  /**
   * Clear all pending operations
   */
  async clearPendingOperations() {
    this.state.pendingOperations = [];
    await this.saveState();
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
  }
}

export const syncEngine = new SyncEngine();
