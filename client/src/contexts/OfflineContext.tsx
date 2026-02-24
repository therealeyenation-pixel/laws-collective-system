/**
 * Offline Context Provider
 * Provides offline state management across the entire application
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  getCacheStatus,
  processSyncQueue,
  updateLastSync,
  getPendingSyncCount,
  cacheTasks,
  cacheNotifications,
  cacheUserData,
  getCachedTasks,
  getCachedNotifications,
  getCachedUserData,
  addToSyncQueue,
  clearOfflineData,
  SyncOperation,
  CacheStatus,
  OfflineTask,
  OfflineNotification,
  OfflineUserData,
} from '@/services/offlineStorageService';

interface OfflineContextType {
  // Connection state
  isOnline: boolean;
  isServiceWorkerReady: boolean;
  
  // Sync state
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingChanges: number;
  
  // Cache status
  cacheStatus: CacheStatus;
  
  // Actions
  syncNow: () => Promise<void>;
  clearCache: () => void;
  refreshStatus: () => void;
  
  // Data caching
  cacheTasks: (tasks: OfflineTask[]) => void;
  cacheNotifications: (notifications: OfflineNotification[]) => void;
  cacheUserData: (userData: Omit<OfflineUserData, 'cachedAt'>) => void;
  
  // Cached data retrieval
  getCachedTasks: () => OfflineTask[];
  getCachedNotifications: () => OfflineNotification[];
  getCachedUserData: () => OfflineUserData | null;
  
  // Queue operations for offline sync
  queueOperation: (type: 'create' | 'update' | 'delete', entity: string, data: Record<string, unknown>) => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>(getCacheStatus());
  const [isSyncing, setIsSyncing] = useState(false);

  // Register service worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[Offline] Service worker registered:', registration.scope);
          setIsServiceWorkerReady(true);

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[Offline] New service worker available');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[Offline] Service worker registration failed:', error);
        });
    }
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Offline] Connection restored');
      setIsOnline(true);
      refreshStatus();
    };

    const handleOffline = () => {
      console.log('[Offline] Connection lost');
      setIsOnline(false);
      refreshStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Refresh cache status
  const refreshStatus = useCallback(() => {
    setCacheStatus(getCacheStatus());
  }, []);

  // Sync pending changes
  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      const syncFn = async (operation: SyncOperation): Promise<boolean> => {
        console.log('[Offline] Syncing operation:', operation);
        // In production, this would call the appropriate API endpoint
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      };

      const result = await processSyncQueue(syncFn);
      console.log('[Offline] Sync complete:', result);
      
      if (result.success > 0) {
        updateLastSync();
      }
    } catch (error) {
      console.error('[Offline] Sync failed:', error);
    } finally {
      setIsSyncing(false);
      refreshStatus();
    }
  }, [isOnline, isSyncing, refreshStatus]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && getPendingSyncCount() > 0) {
      syncNow();
    }
  }, [isOnline, syncNow]);

  // Clear cache
  const clearCache = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }
    clearOfflineData();
    refreshStatus();
  }, [refreshStatus]);

  // Format last sync time
  const formatLastSync = (timestamp: number | null): string | null => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  // Queue operation for offline sync
  const queueOperation = useCallback((
    type: 'create' | 'update' | 'delete',
    entity: string,
    data: Record<string, unknown>
  ) => {
    addToSyncQueue({ type, entity, data });
    refreshStatus();
  }, [refreshStatus]);

  const value: OfflineContextType = {
    isOnline,
    isServiceWorkerReady,
    isSyncing,
    lastSyncTime: formatLastSync(cacheStatus.lastSync),
    pendingChanges: cacheStatus.pendingChanges,
    cacheStatus,
    syncNow,
    clearCache,
    refreshStatus,
    cacheTasks,
    cacheNotifications,
    cacheUserData,
    getCachedTasks,
    getCachedNotifications,
    getCachedUserData,
    queueOperation,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOfflineContext(): OfflineContextType {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOfflineContext must be used within an OfflineProvider');
  }
  return context;
}

export default OfflineContext;
