/**
 * useMediaFeatures - Shared hooks for Theater & Radio
 * 
 * 1. useFavorites(contentType) - Heart/bookmark with server sync
 * 2. useSleepTimer() - Auto-shutoff timer (15/30/60 min)
 * 3. useRecentlyPlayed(contentType) - Last 10 items with server sync
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';

// ─── Favorites Hook ───────────────────────────────────────────────
export function useFavorites(contentType: string) {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Get favorite IDs from server
  const { data: favoriteIds = [], isLoading } = trpc.streamingFavorites.getFavoriteIds.useQuery(
    { contentType },
    { enabled: !!user, staleTime: 30_000 }
  );

  const toggleMutation = trpc.streamingFavorites.toggleFavorite.useMutation({
    onSuccess: () => {
      utils.streamingFavorites.getFavoriteIds.invalidate({ contentType });
    },
  });

  const isFavorited = useCallback(
    (contentId: number) => favoriteIds.includes(contentId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (contentId: number) => {
      if (!user) {
        toast.error('Please sign in to save favorites');
        return false;
      }
      try {
        const result = await toggleMutation.mutateAsync({ contentId, contentType });
        toast.success(result.isFavorited ? 'Added to favorites' : 'Removed from favorites');
        return result.isFavorited;
      } catch {
        toast.error('Failed to update favorite');
        return false;
      }
    },
    [user, contentType, toggleMutation]
  );

  // Sort helper: returns items with favorites first
  const sortWithFavorites = useCallback(
    <T extends { id: number }>(items: T[]): T[] => {
      if (!favoriteIds.length) return items;
      const favSet = new Set(favoriteIds);
      return [
        ...items.filter((item) => favSet.has(item.id)),
        ...items.filter((item) => !favSet.has(item.id)),
      ];
    },
    [favoriteIds]
  );

  return {
    favoriteIds,
    isFavorited,
    toggleFavorite,
    sortWithFavorites,
    isLoading,
    isLoggedIn: !!user,
  };
}

// ─── Sleep Timer Hook ─────────────────────────────────────────────
export type SleepTimerDuration = 15 | 30 | 60 | null;

export function useSleepTimer(onTimerEnd: () => void) {
  const [duration, setDuration] = useState<SleepTimerDuration>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbackRef = useRef(onTimerEnd);

  // Keep callback ref fresh
  useEffect(() => {
    callbackRef.current = onTimerEnd;
  }, [onTimerEnd]);

  // Countdown logic
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (duration === null || remainingSeconds <= 0) return;

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Timer expired
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setDuration(null);
          callbackRef.current();
          toast.info('Sleep timer ended — playback stopped');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [duration, remainingSeconds > 0]); // Only re-run when timer starts/stops

  const startTimer = useCallback((minutes: SleepTimerDuration) => {
    if (minutes === null) {
      setDuration(null);
      setRemainingSeconds(0);
      toast.info('Sleep timer cancelled');
      return;
    }
    setDuration(minutes);
    setRemainingSeconds(minutes * 60);
    toast.success(`Sleep timer set for ${minutes} minutes`);
  }, []);

  const cancelTimer = useCallback(() => {
    setDuration(null);
    setRemainingSeconds(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const formatRemaining = useCallback(() => {
    if (remainingSeconds <= 0) return '';
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [remainingSeconds]);

  return {
    duration,
    remainingSeconds,
    isActive: duration !== null && remainingSeconds > 0,
    startTimer,
    cancelTimer,
    formatRemaining,
  };
}

// ─── Recently Played Hook ─────────────────────────────────────────
export function useRecentlyPlayed(contentType: string) {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Get recently played from server
  const { data: recentItems = [], isLoading } = trpc.streamingFavorites.getRecentlyPlayed.useQuery(
    { limit: 10, contentType },
    { enabled: !!user, staleTime: 30_000 }
  );

  const recordMutation = trpc.streamingFavorites.recordPlayback.useMutation({
    onSuccess: () => {
      utils.streamingFavorites.getRecentlyPlayed.invalidate({ limit: 10, contentType });
    },
  });

  const recordPlay = useCallback(
    (contentId: number) => {
      if (!user) return;
      recordMutation.mutate({ contentId, contentType });
    },
    [user, contentType, recordMutation]
  );

  return {
    recentItems,
    recordPlay,
    isLoading,
    isLoggedIn: !!user,
  };
}
