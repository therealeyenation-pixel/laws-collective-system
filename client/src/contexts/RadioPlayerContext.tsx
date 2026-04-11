/**
 * RadioPlayerContext - Global persistent radio audio player
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

interface RadioPlayerState {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  volume: number;
  isMuted: boolean;
}

interface RadioPlayerActions {
  playStation: (station: RadioStation) => void;
  stopPlayback: () => void;
  togglePlayPause: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
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
    const onEnded = () => setIsPlaying(false);

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
  }, []);

  // Sync volume/mute changes to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

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
    playStation,
    stopPlayback,
    togglePlayPause,
    setVolume,
    toggleMute,
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
