/**
 * useOffline Hook
 * Re-exports the offline context hook for backward compatibility
 * Use this hook in components that need offline state
 */

import { useOfflineContext } from '@/contexts/OfflineContext';

export interface OfflineState {
  isOnline: boolean;
  isServiceWorkerReady: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingChanges: number;
}

export interface UseOfflineReturn extends OfflineState {
  syncNow: () => Promise<void>;
  clearCache: () => void;
  refreshStatus: () => void;
}

/**
 * Hook for accessing offline state and actions
 * Must be used within OfflineProvider context
 */
export function useOffline(): UseOfflineReturn {
  const context = useOfflineContext();
  
  return {
    isOnline: context.isOnline,
    isServiceWorkerReady: context.isServiceWorkerReady,
    isSyncing: context.isSyncing,
    lastSyncTime: context.lastSyncTime,
    pendingChanges: context.pendingChanges,
    syncNow: context.syncNow,
    clearCache: context.clearCache,
    refreshStatus: context.refreshStatus,
  };
}

export default useOffline;
