/**
 * MediaPlayerContext - Global persistent media player
 * 
 * The <video> element is rendered inside this Provider's JSX (at App level).
 * Since MediaPlayerProvider wraps the entire app and never unmounts,
 * the video element persists across all SPA navigation.
 * 
 * Theater mode: video wrapper is positioned over the theater-video-target div
 * Mini mode: small thumbnail in bottom-left corner
 * Hidden mode: off-screen but audio still plays
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
}

type MediaPlayerContextType = MediaPlayerState & MediaPlayerActions;

const MediaPlayerContext = createContext<MediaPlayerContextType | null>(null);

// Module-level HLS instance (survives re-renders)
let _hlsInstance: any = null;

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
      // Small thumbnail in bottom-right — z-index 9998 so it's just BELOW the mini-player bar (z-9999)
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

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('waiting', onWaiting);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('waiting', onWaiting);
    };
  }, []);

  const playChannel = useCallback(async (channel: MediaChannel) => {
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
    // Use wouter-compatible navigation: pushState + popstate
    setTheaterMode(true);
    window.history.pushState({}, '', '/theater-live');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  // Register global stop function so radio can stop theater
  useEffect(() => {
    (window as any).__stopTheaterPlayback = stopPlayback;
    return () => { (window as any).__stopTheaterPlayback = null; };
  }, [stopPlayback]);

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

// Expose a global stop function so non-context code (like radio) can stop theater
(window as any).__stopTheaterPlayback = null;

