/**
 * RadioPlayerContext - Global persistent radio audio player with queue support
 *
 * The <audio> element is rendered inside this Provider's JSX (at App level).
 * Since RadioPlayerProvider wraps the entire app and never unmounts,
 * the audio element persists across all SPA navigation — radio keeps playing
 * when the user navigates to other pages.
 */

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

export interface RadioStation {
  id: number;
  name: string;
  description: string;
  category: string;
  streamUrl: string;
  logo?: string;
}

export interface QueueItem {
  id: number;
  name: string;
  streamUrl: string;
  type: 'channel' | 'station';
  logo?: string;
}

export type RepeatMode = 'off' | 'one' | 'all';

interface RadioPlayerState {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  volume: number;
  isMuted: boolean;
  currentQueue: QueueItem[];
  currentQueueIndex: number;
  repeatMode: RepeatMode;
}

interface RadioPlayerActions {
  playStation: (station: RadioStation) => void;
  stopPlayback: () => void;
  togglePlayPause: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setQueue: (items: QueueItem[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
}

type RadioPlayerContextType = RadioPlayerState & RadioPlayerActions;

const RadioPlayerContext = createContext<RadioPlayerContextType | null>(null);

export function RadioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQueue, setCurrentQueueState] = useState<QueueItem[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('off');

  // Create the audio element once at mount — never destroy it
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.volume = 0.8;
    audioRef.current = audio;

    const onCanPlay = () => setIsLoading(false);
    const onLoadStart = () => setIsLoading(true);
    const onPlaying = () => { setIsLoading(false); setIsPlaying(true); };
    const onPause = () => setIsPlaying(false);
    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setHasError(true);
    };
    const onEnded = () => {
      // Handle repeat modes and queue advancement
      setCurrentQueueIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex < currentQueue.length) {
          // More items in queue — play next
          return nextIndex;
        } else if (repeatMode === 'all' && currentQueue.length > 0) {
          // Repeat all — restart from beginning
          return 0;
        } else if (repeatMode === 'one') {
          // Repeat one — restart current
          return prev;
        }
        // No repeat — stop
        setIsPlaying(false);
        return prev;
      });
    };

    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('loadstart', onLoadStart);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);

    return () => {
      // Only clean up event listeners — do NOT pause/stop the audio
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('loadstart', onLoadStart);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentQueue, repeatMode]);

  // Sync volume/mute changes to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Auto-play next item when queue index changes
  useEffect(() => {
    if (currentQueue.length > 0 && currentQueueIndex < currentQueue.length) {
      const item = currentQueue[currentQueueIndex];
      const station: RadioStation = {
        id: item.id,
        name: item.name,
        description: '',
        category: item.type,
        streamUrl: item.streamUrl,
        logo: item.logo,
      };
      playStation(station);
    }
  }, [currentQueueIndex, currentQueue]);

  const playStation = useCallback((station: RadioStation) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Stop theater stream if it's playing (mutual exclusion)
    if (typeof (window as any).__stopTheaterPlayback === 'function') {
      (window as any).__stopTheaterPlayback();
    }

    setCurrentStation(station);
    setHasError(false);
    setIsLoading(true);

    audio.src = station.streamUrl;
    audio.load();
    audio.play().catch((err) => {
      console.error('Radio play error:', err);
      setIsLoading(false);
      setHasError(true);
    });
  }, []);

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    setCurrentStation(null);
    setIsPlaying(false);
    setIsLoading(false);
    setHasError(false);
    setCurrentQueueState([]);
    setCurrentQueueIndex(0);
  }, []);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol / 100;
      if (vol > 0) setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (audioRef.current) audioRef.current.volume = next ? 0 : volume / 100;
      return next;
    });
  }, [volume]);

  const setQueue = useCallback((items: QueueItem[], startIndex = 0) => {
    setCurrentQueueState(items);
    setCurrentQueueIndex(startIndex);
  }, []);

  const playNext = useCallback(() => {
    setCurrentQueueIndex(prev => {
      const nextIndex = prev + 1;
      return nextIndex < currentQueue.length ? nextIndex : prev;
    });
  }, [currentQueue.length]);

  const playPrevious = useCallback(() => {
    setCurrentQueueIndex(prev => (prev > 0 ? prev - 1 : prev));
  }, []);

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    setRepeatModeState(mode);
  }, []);

  // Register global stop so theater can stop radio
  useEffect(() => {
    (window as any).__stopRadioPlayback = stopPlayback;
    return () => { (window as any).__stopRadioPlayback = null; };
  }, [stopPlayback]);

  const value: RadioPlayerContextType = {
    currentStation,
    isPlaying,
    isLoading,
    hasError,
    volume,
    isMuted,
    currentQueue,
    currentQueueIndex,
    repeatMode,
    playStation,
    stopPlayback,
    togglePlayPause,
    setVolume,
    toggleMute,
    setQueue,
    playNext,
    playPrevious,
    setRepeatMode,
  };

  return (
    <RadioPlayerContext.Provider value={value}>
      {children}
    </RadioPlayerContext.Provider>
  );
}

export function useRadioPlayer() {
  const ctx = useContext(RadioPlayerContext);
  if (!ctx) throw new Error('useRadioPlayer must be used within RadioPlayerProvider');
  return ctx;
}
