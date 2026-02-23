/**
 * Offline Status Bar Component
 * Displays offline status, sync state, and pending changes across all platforms
 */

import { useOfflineContext } from '@/contexts/OfflineContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CloudOff,
  Cloud,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface OfflineStatusBarProps {
  className?: string;
  variant?: 'banner' | 'compact' | 'minimal';
  showWhenOnline?: boolean;
}

export function OfflineStatusBar({
  className,
  variant = 'banner',
  showWhenOnline = false,
}: OfflineStatusBarProps) {
  const {
    isOnline,
    isSyncing,
    lastSyncTime,
    pendingChanges,
    syncNow,
  } = useOfflineContext();
  
  const [dismissed, setDismissed] = useState(false);

  // Don't show if online and no pending changes (unless showWhenOnline is true)
  if (isOnline && pendingChanges === 0 && !showWhenOnline) {
    return null;
  }

  // Don't show if dismissed (for this session)
  if (dismissed && isOnline && pendingChanges === 0) {
    return null;
  }

  // Minimal variant - just an icon indicator
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-yellow-500" />
        )}
        {pendingChanges > 0 && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            {pendingChanges}
          </Badge>
        )}
      </div>
    );
  }

  // Compact variant - small inline status
  if (variant === 'compact') {
    return (
      <div className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs',
        isOnline ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700',
        className
      )}>
        {isOnline ? (
          <>
            <Cloud className="w-3.5 h-3.5" />
            <span>Online</span>
            {pendingChanges > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <span>{pendingChanges} pending</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-xs"
                  onClick={syncNow}
                  disabled={isSyncing}
                >
                  <RefreshCw className={cn('w-3 h-3', isSyncing && 'animate-spin')} />
                </Button>
              </>
            )}
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline</span>
            {pendingChanges > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-yellow-200">
                {pendingChanges}
              </Badge>
            )}
          </>
        )}
      </div>
    );
  }

  // Banner variant - full width status bar
  return (
    <div className={cn(
      'w-full px-4 py-2 flex items-center justify-between text-sm',
      !isOnline && 'bg-yellow-500 text-yellow-900',
      isOnline && pendingChanges > 0 && 'bg-blue-500 text-white',
      isOnline && pendingChanges === 0 && 'bg-green-500 text-white',
      className
    )}>
      {/* Offline state */}
      {!isOnline && (
        <>
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>You're offline. Changes will sync when connected.</span>
          </div>
          <div className="flex items-center gap-2">
            {pendingChanges > 0 && (
              <Badge variant="secondary" className="bg-yellow-600 text-white">
                {pendingChanges} pending
              </Badge>
            )}
          </div>
        </>
      )}

      {/* Online with pending changes */}
      {isOnline && pendingChanges > 0 && (
        <>
          <div className="flex items-center gap-2">
            <CloudOff className="w-4 h-4" />
            <span>{pendingChanges} changes pending sync</span>
            {lastSyncTime && (
              <span className="text-blue-200 text-xs">• Last sync: {lastSyncTime}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-600 h-7"
              onClick={syncNow}
              disabled={isSyncing}
            >
              <RefreshCw className={cn('w-4 h-4 mr-1', isSyncing && 'animate-spin')} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </>
      )}

      {/* Online with no pending changes */}
      {isOnline && pendingChanges === 0 && showWhenOnline && (
        <>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>All changes synced</span>
            {lastSyncTime && (
              <span className="text-green-200 text-xs">• Last sync: {lastSyncTime}</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-green-600 h-7 p-1"
            onClick={() => setDismissed(true)}
          >
            <X className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}

/**
 * Offline Indicator - Small icon for headers/toolbars
 */
export function OfflineIndicator({ className }: { className?: string }) {
  const { isOnline, pendingChanges, isSyncing, syncNow } = useOfflineContext();

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {isSyncing ? (
        <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      ) : isOnline ? (
        <Wifi className="w-4 h-4 text-green-500" />
      ) : (
        <WifiOff className="w-4 h-4 text-yellow-500" />
      )}
      {pendingChanges > 0 && isOnline && (
        <button
          onClick={syncNow}
          className="text-xs text-blue-500 hover:underline"
          disabled={isSyncing}
        >
          {pendingChanges} pending
        </button>
      )}
    </div>
  );
}

export default OfflineStatusBar;
