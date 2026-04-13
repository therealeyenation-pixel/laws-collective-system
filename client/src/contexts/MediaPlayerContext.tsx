/**
 * MediaPlayerContext - Global persistent media player with queue support
 * 
 * The <video> element is rendered inside this Provider's JSX (at App level).
 * Since MediaPlayerProvider wraps the entire app and never unmounts,
 * the video element persists across all SPA navigation.
 * 
 * Theater mode: video wrapper is positioned over the theater-video-target div
 * Mini mode: small thumbnail in bottom-left corner
 * Hidden mode: off-screen but audio still plays
 * 
 * Features (parity with RadioPlayerContext):
 * - Queue management (add, remove, reorder, jump)
 * - Shuffle mode
 * - Repeat modes (off / one / all)
 * - Playback history tracking (last 50 items)
 */

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

export interface MediaChannel {
  id: number;
  name: string;
  description: string;
  category: string;
  region: string;
  logo: string;
  streamUrl: string;
  isLive: boolean;
  viewers?: number;
}

export interface MediaQueueItem {
  id: number;
  name: string;
  streamUrl: string;
  type: 'channel' | 'vod';
  logo?: string;
  description?: string;
  category?: string;
}

export type RepeatMode = 'off' | 'one' | 'all';

export interface MediaPlaybackHistoryItem {
  id: string;
  name: string;
  streamUrl: string;
  type: 'channel' | 'vod';
  logo?: string;
  playedAt: number; // timestamp
  duration: number; // seconds played
}

interface MediaPlayerState {
  currentChannel: MediaChannel | null;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  volume: number;
  isMuted: boolean;
  miniPlayerVisible: boolean;
  isPiP: boolean;
  theaterMode: boolean;
  // Queue state
  currentQueue: MediaQueueItem[];
  currentQueueIndex: number;
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  // History state
  playbackHistory: MediaPlaybackHistoryItem[];
}

interface MediaPlayerActions {
  playChannel: (channel: MediaChannel) => void;
  stopPlayback: () => void;
  togglePlayPause: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  togglePiP: () => void;
  dismissMiniPlayer: () => void;
  expandToTheater: () => void;
  getVideoElement: () => HTMLVideoElement | null;
  setIsLoading: (v: boolean) => void;
  setHasError: (v: boolean) => void;
  setIsPlaying: (v: boolean) => void;
  setTheaterMode: (v: boolean) => void;
  // Queue actions
  setQueue: (items: MediaQueueItem[], startIndex?: number) => void;
  addToQueue: (item: MediaQueueItem) => void;
  playNext: () => void;
  playPrevious: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  jumpToTrack: (index: number) => void;
  clearQueue: () => void;
  // History actions
  addToHistory: (item: MediaPlaybackHistoryItem) => void;
  clearHistory: () => void;
  stopPlaybackWithHistory: () => void;
}

type MediaPlayerContextType = MediaPlayerState & MediaPlayerActions;

const MediaPlayerContext = createContext<MediaPlayerContextType | null>(null);

// Module-level HLS instance (survives re-renders)
let _hlsInstance: any = null;

// Fisher-Yates shuffle helper
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function MediaPlayerProvider({ children }: { children: React.ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const [currentChannel, setCurrentChannel] = useState<MediaChannel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [miniPlayerVisible, setMiniPlayerVisible] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);

  // Queue state
  const [currentQueue, setCurrentQueueState] = useState<MediaQueueItem[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('off');

  // History state
  const [playbackHistory, setPlaybackHistory] = useState<MediaPlaybackHistoryItem[]>([]);
  const playbackStartTimeRef = useRef<number>(0);

  const getVideoElement = useCallback(() => videoRef.current, []);

  // Position the wrapper based on mode using RAF loop for theater
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (!currentChannel) {
      // Hidden off-screen but audio keeps playing
      wrapper.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;z-index:-1;overflow:hidden;pointer-events:none;';
      return;
    }

    if (theaterMode) {
      // Track the theater-video-target div position with RAF
      const updatePosition = () => {
        const target = document.getElementById('theater-video-target');
        if (target && wrapper) {
          const rect = target.getBoundingClientRect();
          wrapper.style.cssText = `position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;z-index:30;pointer-events:none;border-radius:0;overflow:hidden;`;
        }
        rafRef.current = requestAnimationFrame(updatePosition);
      };
      rafRef.current = requestAnimationFrame(updatePosition);
      return () => cancelAnimationFrame(rafRef.current);
    } else if (miniPlayerVisible) {
      // Small thumbnail in bottom-right
      wrapper.style.cssText = 'position:fixed;bottom:112px;right:16px;width:140px;height:80px;z-index:9998;border-radius:8px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.4);pointer-events:none;';
    } else {
      // Hidden off-screen
      wrapper.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;z-index:-1;overflow:hidden;pointer-events:none;';
    }
  }, [theaterMode, currentChannel, miniPlayerVisible]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => { setIsPlaying(true); setIsLoading(false); };
    const onPause = () => setIsPlaying(false);
    const onCanPlay = () => setIsLoading(false);
    const onWaiting = () => setIsLoading(true);
    const onEnded = () => {
      // Handle repeat modes and queue advancement (same logic as Radio)
      if (repeatMode === 'one') {
        // Repeat one — restart current video
        if (video) {
          video.currentTime = 0;
          video.play().catch(console.error);
        }
        return;
      }

      setCurrentQueueIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex < currentQueue.length) {
          return nextIndex;
        } else if (repeatMode === 'all' && currentQueue.length > 0) {
          return 0;
        }
        // No repeat — stop
        setIsPlaying(false);
        return prev;
      });
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('ended', onEnded);
    };
  }, [currentQueue, repeatMode]);

  // Auto-play next item when queue index changes
  useEffect(() => {
    if (currentQueue.length > 0 && currentQueueIndex < currentQueue.length) {
      const item = currentQueue[currentQueueIndex];
      const channel: MediaChannel = {
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: item.category || item.type,
        region: '',
        logo: item.logo || '',
        streamUrl: item.streamUrl,
        isLive: item.type === 'channel',
      };
      // Use internal play to avoid resetting queue
      _playChannelInternal(channel);
    }
  }, [currentQueueIndex]);

  // Internal play that doesn't reset queue
  const _playChannelInternal = useCallback(async (channel: MediaChannel) => {
    const video = videoRef.current;
    if (!video) return;

    // Stop radio if it's playing (mutual exclusion)
    if (typeof (window as any).__stopRadioPlayback === 'function') {
      (window as any).__stopRadioPlayback();
    }

    setCurrentChannel(channel);
    setHasError(false);
    setIsLoading(true);
    setMiniPlayerVisible(true);

    // Stop current
    video.pause();
    video.removeAttribute('src');
    video.load();

    if (_hlsInstance) {
      _hlsInstance.destroy();
      _hlsInstance = null;
    }

    const streamUrl = channel.streamUrl;

    if (streamUrl.includes('.m3u8')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        try { await video.play(); } catch (err) {
          console.error('Native HLS play error:', err);
          setHasError(true); setIsLoading(false);
        }
      } else {
        try {
          const Hls = (await import('hls.js')).default;
          if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            _hlsInstance = hls;
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch((err: any) => {
                console.error('HLS play error:', err);
                setHasError(true); setIsLoading(false);
              });
            });
            hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
              if (data.fatal) {
                console.error('HLS fatal error:', data);
                hls.destroy();
                _hlsInstance = null;
                setHasError(true); setIsLoading(false);
              }
            });
          } else {
            setHasError(true); setIsLoading(false);
          }
        } catch (err) {
          console.error('Failed to load hls.js:', err);
          video.src = streamUrl;
          try { await video.play(); } catch (playErr) {
            setHasError(true); setIsLoading(false);
          }
        }
      }
    } else {
      video.src = streamUrl;
      try { await video.play(); } catch (err) {
        console.error('Direct play error:', err);
        setHasError(true); setIsLoading(false);
      }
    }
  }, []);

  const playChannel = useCallback(async (channel: MediaChannel) => {
    // When playing a single channel directly, reset queue
    setCurrentQueueState([]);
    setCurrentQueueIndex(0);
    await _playChannelInternal(channel);
  }, [_playChannelInternal]);

  const stopPlayback = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    if (_hlsInstance) {
      _hlsInstance.destroy();
      _hlsInstance = null;
    }
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    }
    setCurrentChannel(null);
    setIsPlaying(false);
    setIsLoading(false);
    setHasError(false);
    setMiniPlayerVisible(false);
    setIsPiP(false);
    setTheaterMode(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol / 100;
      if (vol > 0) setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  }, []);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  }, []);

  const dismissMiniPlayer = useCallback(() => {
    stopPlayback();
  }, [stopPlayback]);

  const expandToTheater = useCallback(() => {
    setTheaterMode(true);
    window.history.pushState({}, '', '/theater-live');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  // ===== Queue Actions =====

  const setQueue = useCallback((items: MediaQueueItem[], startIndex = 0) => {
    const finalItems = shuffleEnabled ? shuffleArray(items) : items;
    setCurrentQueueState(finalItems);
    setCurrentQueueIndex(startIndex);
  }, [shuffleEnabled]);

  const addToQueue = useCallback((item: MediaQueueItem) => {
    setCurrentQueueState(prev => [...prev, item]);
  }, []);

  const playNext = useCallback(() => {
    setCurrentQueueIndex(prev => {
      const nextIndex = prev + 1;
      if (nextIndex < currentQueue.length) return nextIndex;
      if (repeatMode === 'all' && currentQueue.length > 0) return 0;
      return prev;
    });
  }, [currentQueue.length, repeatMode]);

  const playPrevious = useCallback(() => {
    setCurrentQueueIndex(prev => {
      if (prev > 0) return prev - 1;
      if (repeatMode === 'all' && currentQueue.length > 0) return currentQueue.length - 1;
      return prev;
    });
  }, [currentQueue.length, repeatMode]);

  // Aliases for keyboard shortcut compatibility
  const nextTrack = playNext;
  const previousTrack = playPrevious;

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    setRepeatModeState(mode);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffleEnabled(prev => {
      const next = !prev;
      if (next && currentQueue.length > 0) {
        // Shuffle the remaining queue (keep current item at front)
        const currentItem = currentQueue[currentQueueIndex];
        const remaining = currentQueue.filter((_, i) => i !== currentQueueIndex);
        const shuffled = shuffleArray(remaining);
        setCurrentQueueState([currentItem, ...shuffled]);
        setCurrentQueueIndex(0);
      }
      return next;
    });
  }, [currentQueue, currentQueueIndex]);

  const removeFromQueue = useCallback((index: number) => {
    setCurrentQueueState(prev => {
      const newQueue = prev.filter((_, i) => i !== index);
      if (index < currentQueueIndex) {
        setCurrentQueueIndex(p => Math.max(0, p - 1));
      } else if (index === currentQueueIndex && index >= newQueue.length) {
        setCurrentQueueIndex(Math.max(0, newQueue.length - 1));
      }
      return newQueue;
    });
  }, [currentQueueIndex]);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setCurrentQueueState(prev => {
      const newQueue = [...prev];
      const [item] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, item);
      if (fromIndex === currentQueueIndex) {
        setCurrentQueueIndex(toIndex);
      } else if (fromIndex < currentQueueIndex && toIndex >= currentQueueIndex) {
        setCurrentQueueIndex(p => p - 1);
      } else if (fromIndex > currentQueueIndex && toIndex <= currentQueueIndex) {
        setCurrentQueueIndex(p => p + 1);
      }
      return newQueue;
    });
  }, [currentQueueIndex]);

  const jumpToTrack = useCallback((index: number) => {
    if (index >= 0 && index < currentQueue.length) {
      setCurrentQueueIndex(index);
    }
  }, [currentQueue.length]);

  const clearQueue = useCallback(() => {
    setCurrentQueueState([]);
    setCurrentQueueIndex(0);
    stopPlayback();
  }, [stopPlayback]);

  // ===== History Actions =====

  const addToHistory = useCallback((item: MediaPlaybackHistoryItem) => {
    setPlaybackHistory(prev => {
      const updated = [item, ...prev];
      return updated.slice(0, 50); // Keep last 50
    });
  }, []);

  const clearHistory = useCallback(() => {
    setPlaybackHistory([]);
  }, []);

  // Track playback start time when a channel starts playing
  useEffect(() => {
    if (isPlaying && currentChannel) {
      playbackStartTimeRef.current = Date.now();
    }
  }, [isPlaying, currentChannel]);

  // Add to history when stopping playback
  const stopPlaybackWithHistory = useCallback(() => {
    if (currentChannel && playbackStartTimeRef.current > 0) {
      const duration = Math.floor((Date.now() - playbackStartTimeRef.current) / 1000);
      if (duration > 5) { // Only track if played for more than 5 seconds
        addToHistory({
          id: `${currentChannel.id}-${Date.now()}`,
          name: currentChannel.name,
          streamUrl: currentChannel.streamUrl,
          type: currentChannel.isLive ? 'channel' : 'vod',
          logo: currentChannel.logo,
          playedAt: Date.now(),
          duration,
        });
      }
    }
    stopPlayback();
  }, [currentChannel, stopPlayback, addToHistory]);

  // Register global stop function so radio can stop theater
  useEffect(() => {
    (window as any).__stopTheaterPlayback = stopPlaybackWithHistory;
    return () => { (window as any).__stopTheaterPlayback = null; };
  }, [stopPlaybackWithHistory]);

  const value: MediaPlayerContextType = {
    currentChannel,
    isPlaying,
    isLoading,
    hasError,
    volume,
    isMuted,
    miniPlayerVisible,
    isPiP,
    theaterMode,
    // Queue state
    currentQueue,
    currentQueueIndex,
    shuffleEnabled,
    repeatMode,
    // History state
    playbackHistory,
    // Channel actions
    playChannel,
    stopPlayback,
    togglePlayPause,
    setVolume,
    toggleMute,
    togglePiP,
    dismissMiniPlayer,
    expandToTheater,
    getVideoElement,
    setIsLoading,
    setHasError,
    setIsPlaying,
    setTheaterMode,
    // Queue actions
    setQueue,
    addToQueue,
    playNext,
    playPrevious,
    nextTrack,
    previousTrack,
    setRepeatMode,
    toggleShuffle,
    removeFromQueue,
    reorderQueue,
    jumpToTrack,
    clearQueue,
    // History actions
    addToHistory,
    clearHistory,
    stopPlaybackWithHistory,
  };

  return (
    <MediaPlayerContext.Provider value={value}>
      {children}
      {/* Persistent video element - lives at App level, never unmounts */}
      <div
        ref={wrapperRef}
        id="persistent-media-wrapper"
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          width: 1,
          height: 1,
          zIndex: -1,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <video
          ref={videoRef}
          id="global-media-player"
          playsInline
          style={{
            width: '100%',
            height: '100%',
            background: 'black',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    </MediaPlayerContext.Provider>
  );
}

export function useMediaPlayer() {
  const ctx = useContext(MediaPlayerContext);
  if (!ctx) throw new Error('useMediaPlayer must be used within MediaPlayerProvider');
  return ctx;
}
